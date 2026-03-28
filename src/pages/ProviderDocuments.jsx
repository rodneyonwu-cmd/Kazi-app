import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const credentials = [
  { id: 1, status: 'verified', statusLabel: 'Verified', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]', iconBg: 'bg-[#e8f5f0]', iconColor: '#1a7f5e', name: 'TX Dental Hygiene License', detail: 'TX-48291033 · Expires Dec 31, 2026', expiring: false },
  { id: 2, status: 'expiring', statusLabel: 'Expiring soon', statusStyle: 'bg-[#fef9c3] text-[#92400e]', iconBg: 'bg-[#fef9c3]', iconColor: '#92400e', name: 'CPR / BLS Certification', detail: 'Expires Apr 12, 2026', expiring: true },
  { id: 3, status: 'verified', statusLabel: 'Verified', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]', iconBg: 'bg-[#e8f5f0]', iconColor: '#1a7f5e', name: 'Local Anesthesia Permit', detail: 'TX-LA-2024-8821 · Jun 30, 2027', expiring: false },
  { id: 4, status: 'verified', statusLabel: 'Verified', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]', iconBg: 'bg-[#e8f5f0]', iconColor: '#1a7f5e', name: 'X-Ray Certification', detail: 'TX-XR-2023-5512 · Sep 15, 2026', expiring: false },
]

export default function ProviderDocuments() {
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      <ProviderNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Documents</h1>
          <p className="text-[13px] text-[#9ca3af]">Your licenses, certifications, and credentials</p>
        </div>

        {/* Expiry alert */}
        <div className="bg-[#fef9c3] border border-[#fde68a] rounded-[16px] p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-[13px] font-bold text-[#92400e]">1 credential expiring soon</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold text-[#1a1a1a]">CPR / BLS Certification</p>
              <p className="text-[12px] font-bold text-[#92400e]">Expires Apr 12, 2026</p>
            </div>
            <button className="text-[12px] font-bold text-[#92400e] border border-[#fbbf24] px-3 py-1.5 rounded-full hover:bg-[#fde68a] transition">Renew</button>
          </div>
        </div>

        {/* Credentials label */}
        <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">My credentials</p>

        {/* Credentials grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {credentials.map(cred => (
            <div key={cred.id} className={`bg-white border rounded-[16px] p-4 relative ${cred.expiring ? 'border-[#fde68a]' : 'border-[#e5e7eb]'}`}>
              <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${cred.statusStyle}`}>{cred.statusLabel}</span>
              <div className={`w-10 h-10 rounded-[11px] ${cred.iconBg} flex items-center justify-center mb-3`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={cred.iconColor} strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p className="text-[13px] font-bold text-[#1a1a1a] mb-1 pr-8">{cred.name}</p>
              <p className="text-[11px] text-[#9ca3af] mb-2">{cred.detail}</p>
              <button className={`text-[11px] font-bold ${cred.expiring ? 'text-[#92400e]' : 'text-[#1a7f5e]'} hover:underline`}>
                {cred.expiring ? 'Upload renewal' : 'View document'}
              </button>
            </div>
          ))}

          {/* Add credential */}
          <div
            onClick={() => setUploading(true)}
            className="bg-white border-2 border-dashed border-[#e5e7eb] rounded-[16px] p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1a7f5e] transition min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-[11px] bg-[#f3f4f6] flex items-center justify-center mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <p className="text-[13px] font-bold text-[#9ca3af]">Add credential</p>
            <p className="text-[11px] text-[#9ca3af] mt-0.5">Upload a new document</p>
          </div>

          {/* Resume missing */}
          <div
            onClick={() => setUploading(true)}
            className="bg-white border-2 border-dashed border-[#e5e7eb] rounded-[16px] p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#1a7f5e] transition min-h-[140px]"
          >
            <div className="w-10 h-10 rounded-[11px] bg-[#f3f4f6] flex items-center justify-center mb-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <p className="text-[13px] font-bold text-[#9ca3af]">Resume missing</p>
            <p className="text-[11px] text-[#9ca3af] mt-0.5">Offices prefer pros with resumes</p>
            <p className="text-[11px] font-bold text-[#1a7f5e] mt-1">Upload resume</p>
          </div>
        </div>
      </div>

      {/* Upload modal */}
      {uploading && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setUploading(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[20px] p-6 w-[340px] z-50 shadow-2xl">
            <p className="text-[18px] font-black text-[#1a1a1a] mb-1">Upload document</p>
            <p className="text-[13px] text-[#9ca3af] mb-5">PDF, JPG, or PNG · Max 10MB</p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#e5e7eb] rounded-[14px] p-8 cursor-pointer hover:border-[#1a7f5e] transition mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p className="text-[13px] font-bold text-[#374151]">Click to browse</p>
              <input type="file" className="hidden" />
            </label>
            <div className="flex gap-2">
              <button onClick={() => setUploading(false)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px]">Cancel</button>
              <button onClick={() => setUploading(false)} className="flex-1 bg-[#1a7f5e] text-white font-bold py-2.5 rounded-full text-[13px]">Upload</button>
            </div>
          </div>
        </>
      )}

      {/* Mobile toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home', path: '/provider-dashboard', icon: <HomeIcon /> },
          { label: 'Requests', path: '/provider-requests', icon: <ReqIcon />, badge: 2 },
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
  )
}

function HomeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
