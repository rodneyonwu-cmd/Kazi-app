import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const taxDocs = [
  { year: '2025', form: '1099-NEC', amount: '$18,460.00', status: 'Ready', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
  { year: '2024', form: '1099-NEC', amount: '$22,840.00', status: 'Ready', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
  { year: '2023', form: '1099-NEC', amount: '$19,120.00', status: 'Ready', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
]

export default function TaxInformation() {
  const navigate = useNavigate()
  const [savedTax, setSavedTax] = useState({ ssn: '***-**-4521', filing: 'Single', ein: '' })
  const [editing, setEditing] = useState(false)

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      <ProviderNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button onClick={() => navigate('/provider-dashboard')} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9ca3af] hover:text-[#374151] mb-4 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Tax Information</h1>
          <p className="text-[13px] text-[#9ca3af]">Manage your tax details and download your 1099 forms</p>
        </div>

        {/* Info banner */}
        <div className="bg-[#fef9c3] border border-[#fde68a] rounded-[16px] px-4 py-3.5 flex items-start gap-3 mb-5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="text-[13px] font-bold text-[#92400e] mb-0.5">Your 2025 1099-NEC is ready</p>
            <p className="text-[12px] text-[#92400e]/80">You earned $18,460.00 through Kazi in 2025. Download your form for tax filing.</p>
          </div>
        </div>

        {/* Tax documents */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-[#f3f4f6]">
            <p className="text-[15px] font-black text-[#1a1a1a]">Tax documents</p>
          </div>
          {taxDocs.map((doc, i) => (
            <div key={doc.year} className={`flex items-center justify-between px-5 py-4 ${i < taxDocs.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[11px] bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#1a1a1a]">{doc.form} — {doc.year}</p>
                  <p className="text-[12px] text-[#9ca3af]">Total earnings: {doc.amount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${doc.statusStyle}`}>{doc.status}</span>
                <button className="text-[13px] font-bold text-[#1a7f5e] hover:underline flex items-center gap-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tax details */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-black text-[#1a1a1a]">Tax details</p>
            <button onClick={() => setEditing(!editing)} className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Social Security Number</p>
              {editing
                ? <input type="text" placeholder="XXX-XX-XXXX" className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#1a7f5e] transition" />
                : <p className="text-[15px] font-medium text-[#1a1a1a]">{savedTax.ssn}</p>
              }
            </div>
            <div className="h-px bg-[#f3f4f6]" />
            <div>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">Filing status</p>
              {editing
                ? <select className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#1a7f5e] transition appearance-none">
                    <option>Single</option><option>Married Filing Jointly</option><option>Married Filing Separately</option><option>Head of Household</option>
                  </select>
                : <p className="text-[15px] font-medium text-[#1a1a1a]">{savedTax.filing}</p>
              }
            </div>
            <div className="h-px bg-[#f3f4f6]" />
            <div>
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">EIN (if applicable)</p>
              {editing
                ? <input type="text" placeholder="XX-XXXXXXX" className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#1a7f5e] transition" />
                : <p className="text-[15px] font-medium text-[#9ca3af]">Not provided</p>
              }
            </div>
          </div>
          {editing && (
            <button onClick={() => setEditing(false)} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-[14px] transition mt-5">
              Save changes
            </button>
          )}
        </div>

        {/* Help note */}
        <div className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-[16px] px-4 py-4">
          <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">Need help with taxes?</p>
          <p className="text-[12px] text-[#9ca3af] leading-relaxed">As an independent contractor, you are responsible for self-employment taxes. We recommend consulting a tax professional. Kazi is not a tax advisor.</p>
        </div>
      </div>

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
            <div className="relative"><span className="text-[#9ca3af]">{icon}</span>
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
