import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ProviderNav from '../components/ProviderNav'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const DOC_TYPES = [
  { label: 'License', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
  { label: 'Government ID', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
  { label: 'CPR / BLS', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
  { label: 'Malpractice', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { label: 'Resume / CV', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, full: true },
]

export default function ProviderDocuments() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [modal, setModal] = useState(false)
  const [docType, setDocType] = useState('License')
  const [toast, setToast] = useState(null)
  const [credentials, setCredentials] = useState([])
  const [providerId, setProviderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchCredentials = async () => {
      try {
        const token = await getToken()
        const profileRes = await fetch(`${API_URL}/api/providers/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!profileRes.ok) throw new Error('Failed to fetch profile')
        const profile = await profileRes.json()
        setProviderId(profile.id)

        const credsRes = await fetch(`${API_URL}/api/providers/${profile.id}/credentials`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!credsRes.ok) throw new Error('Failed to fetch credentials')
        const creds = await credsRes.json()
        setCredentials(creds)
      } catch (err) {
        console.error('Error fetching credentials:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCredentials()
  }, [getToken])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const uploadCredential = async (file) => {
    if (!providerId || !file) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/providers/${providerId}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: docType, fileUrl: file.name, verified: false }),
      })
      if (res.ok) {
        const cred = await res.json()
        setCredentials(prev => [...prev, cred])
        setModal(false)
        showToast(`${docType} uploaded!`)
      } else { showToast('Failed to upload') }
    } catch { showToast('Failed to upload') }
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">
      <input type="file" ref={fileInputRef} accept=".pdf,.jpg,.png" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { uploadCredential(e.target.files[0]); e.target.value = '' } }} />
      <ProviderNav />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[12px] font-semibold px-4 py-2.5 rounded-full z-[300] flex items-center gap-2 shadow-xl whitespace-nowrap">
          <div className="w-4 h-4 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Upload Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center px-4" onClick={() => setModal(false)}>
          <div className="bg-white rounded-[18px] w-full max-w-[420px] mx-auto px-5 pb-6 pt-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="text-[16px] font-black text-[#1a1a1a] mb-0.5">Upload document</div>
            <div className="text-[12px] text-[#9ca3af] mb-4">Select a type and upload your file</div>

            {/* Doc type selection */}
            <div className="mb-4">
              <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2">Document type</div>
              <div className="grid grid-cols-2 gap-1.5">
                {DOC_TYPES.map(t => (
                  <button
                    key={t.label}
                    onClick={() => setDocType(t.label)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-[9px] border text-[12px] font-bold cursor-pointer transition text-left ${t.full ? 'col-span-2' : ''} ${docType === t.label ? 'border-[#1a7f5e] bg-[#e8f5f0] text-[#1a7f5e]' : 'border-[#e5e7eb] bg-white text-[#374151] hover:border-[#1a7f5e]'}`}
                    style={{ fontFamily: 'inherit' }}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#e5e7eb] rounded-[12px] py-4 text-center cursor-pointer hover:border-[#1a7f5e] transition mb-3"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" className="mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div className="text-[13px] font-bold text-[#374151]">Click to browse files</div>
              <div className="text-[11px] text-[#9ca3af] mt-0.5">PDF, JPG, or PNG · Max 10MB</div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setModal(false)} className="flex-1 bg-white text-[#374151] border border-[#e5e7eb] rounded-full py-2.5 text-[13px] font-bold cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => fileInputRef.current?.click()} className="flex-[2] bg-[#1a7f5e] hover:bg-[#156649] text-white rounded-full py-2.5 text-[13px] font-extrabold border-none cursor-pointer transition" style={{ fontFamily: 'inherit' }}>Upload</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[520px] mx-auto px-3.5 py-5 pb-24">
        <h1 className="text-[20px] font-black text-[#1a1a1a] mb-0.5">Documents</h1>
        <p className="text-[13px] text-[#9ca3af] mb-4">Your licenses, certifications, and credentials</p>

        {/* Credentials */}
        <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2">Credentials</div>

        {loading ? (
          <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-8 text-center mb-4">
            <p className="text-[13px] text-[#9ca3af]">Loading credentials...</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-8 text-center mb-4">
            <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No documents uploaded yet</p>
            <p className="text-[13px] text-[#9ca3af] max-w-[260px] mx-auto">Upload your licenses, certifications, and credentials to get verified and start booking shifts.</p>
          </div>
        ) : (
          credentials.map(c => (
            <div key={c.id} className={`bg-white border rounded-[10px] px-3 py-2.5 mb-1.5 flex items-center gap-2.5 transition hover:border-[#1a7f5e] border-[#e5e7eb]`}>
              <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 ${c.verified ? 'bg-[#e8f5f0]' : 'bg-[#fef9c3]'}`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.verified ? '#1a7f5e' : '#92400e'} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-[#1a1a1a] truncate">{c.type}</div>
                <div className="text-[10px] text-[#9ca3af]">{c.fileUrl || 'Uploaded'} · {new Date(c.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.verified ? 'bg-[#e8f5f0] text-[#1a7f5e]' : 'bg-[#fef9c3] text-[#92400e]'}`}>
                  {c.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          ))
        )}

        {/* Resume */}
        <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2 mt-4">Resume</div>

        <div className="bg-white border border-[#e5e7eb] rounded-[10px] px-3 py-3 mb-1.5 text-center">
          <p className="text-[12px] text-[#9ca3af]">No resume uploaded yet</p>
        </div>

        {/* Add new */}
        <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2 mt-4">Add new</div>

        <div
          onClick={() => { setDocType('License'); setModal(true) }}
          className="bg-white border-2 border-dashed border-[#e5e7eb] rounded-[10px] px-3 py-2.5 flex items-center gap-2.5 cursor-pointer hover:border-[#1a7f5e] transition"
        >
          <div className="w-8 h-8 rounded-[8px] bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <div>
            <div className="text-[12px] font-bold text-[#9ca3af]">Add credential</div>
            <div className="text-[10px] text-[#9ca3af]">License, cert, or permit</div>
          </div>
        </div>
      </div>

      {/* Mobile toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] z-50">
        <div className="flex">
          {[
            { label: 'Home', path: '/provider-dashboard', icon: <HomeIcon /> },
            { label: 'Requests', path: '/provider-requests', icon: <ReqIcon /> },
            { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
            { label: 'Messages', path: '/provider-messages', icon: <MsgIcon /> },
            { label: 'Earnings', path: '/provider-earnings', icon: <EarnIcon /> },
          ].map(({ label, path, icon, badge }) => (
            <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
              <div className="relative">
                <span className="text-[#9ca3af]">{icon}</span>
                {badge && <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{badge}</span>}
              </div>
              <span className="text-[10px] font-semibold text-[#9ca3af]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HomeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
