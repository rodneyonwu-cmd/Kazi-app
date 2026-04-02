import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ProviderNav from '../components/ProviderNav'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STATUS = {
  deposited:  { label: 'Deposited',  bg: '#e8f5f0', color: '#1a7f5e' },
  processing: { label: 'Processing', bg: '#fef9c3', color: '#92400e' },
}

export default function ProviderEarnings() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [tab, setTab] = useState('history')
  const [bankModal, setBankModal] = useState(false)
  const [w9Modal, setW9Modal] = useState(false)
  const [ssnModal, setSsnModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/bookings?status=COMPLETED`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setTransactions(await res.json())
      } catch {}
      setLoading(false)
    }
    fetchEarnings()
  }, [getToken])

  const TABS = [
    { key: 'history', label: 'Transaction History' },
    { key: 'payout',  label: 'Payout Accounts' },
    { key: 'tax',     label: 'Tax Information' },
  ]

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">
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

      {/* Add Bank Modal */}
      {bankModal && (
        <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center px-4" onClick={() => setBankModal(false)}>
          <div className="bg-white rounded-[18px] w-full max-w-[400px] p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-[15px] font-black text-[#1a1a1a] mb-0.5">Add bank account</div>
            <div className="text-[12px] text-[#9ca3af] mb-4">Securely connected via Stripe</div>
            {[
              { label: 'Account holder name', placeholder: 'Full name', type: 'text' },
              { label: 'Routing number', placeholder: '021000021', type: 'text' },
              { label: 'Account number', placeholder: '············', type: 'password' },
            ].map(f => (
              <div key={f.label} className="mb-3">
                <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.07em] mb-1.5">{f.label}</div>
                <input type={f.type} placeholder={f.placeholder} className="w-full border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 text-[13px] outline-none bg-[#f9f8f6] text-[#1a1a1a] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
              </div>
            ))}
            <div className="mb-4">
              <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.07em] mb-1.5">Account type</div>
              <select className="w-full border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 text-[13px] outline-none bg-[#f9f8f6] text-[#1a1a1a] cursor-pointer" style={{ fontFamily: 'inherit' }}>
                <option>Checking</option>
                <option>Savings</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setBankModal(false)} className="flex-1 bg-white text-[#374151] border border-[#e5e7eb] rounded-full py-2.5 text-[13px] font-bold cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { setBankModal(false); showToast('Bank account setup coming soon — Stripe integration pending') }} className="flex-[2] bg-[#1a7f5e] text-white rounded-full py-2.5 text-[13px] font-extrabold border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Save account</button>
            </div>
          </div>
        </div>
      )}

      {/* W-9 Modal */}
      {w9Modal && (
        <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center px-4" onClick={() => setW9Modal(false)}>
          <div className="bg-white rounded-[18px] w-full max-w-[400px] p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-[15px] font-black text-[#1a1a1a] mb-0.5">W-9 Information</div>
            <div className="text-[12px] text-[#9ca3af] mb-4">Required by the IRS for independent contractors</div>
            {[
              { label: 'Legal name', placeholder: 'Your legal name', type: 'text', val: '' },
              { label: 'Business name (optional)', placeholder: 'Leave blank if individual', type: 'text', val: '' },
            ].map(f => (
              <div key={f.label} className="mb-3">
                <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.07em] mb-1.5">{f.label}</div>
                <input type={f.type} placeholder={f.placeholder} defaultValue={f.val} className="w-full border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 text-[13px] outline-none bg-[#f9f8f6] text-[#1a1a1a] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
              </div>
            ))}
            <div className="mb-3">
              <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.07em] mb-1.5">Tax classification</div>
              <select className="w-full border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 text-[13px] outline-none bg-[#f9f8f6] text-[#1a1a1a] cursor-pointer" style={{ fontFamily: 'inherit' }}>
                <option>Individual / Sole proprietor</option>
                <option>LLC</option>
                <option>S Corporation</option>
                <option>C Corporation</option>
              </select>
            </div>
            <div className="mb-4">
              <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.07em] mb-1.5">SSN / EIN</div>
              <input type="password" placeholder="···-··-····" className="w-full border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 text-[13px] outline-none bg-[#f9f8f6] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setW9Modal(false)} className="flex-1 bg-white text-[#374151] border border-[#e5e7eb] rounded-full py-2.5 text-[13px] font-bold cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { setW9Modal(false); showToast('W-9 submission coming soon') }} className="flex-[2] bg-[#1a7f5e] text-white rounded-full py-2.5 text-[13px] font-extrabold border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Save W-9</button>
            </div>
          </div>
        </div>
      )}

      {/* SSN Modal */}
      {ssnModal && (
        <div className="fixed inset-0 bg-black/45 z-[200] flex items-center justify-center px-4" onClick={() => setSsnModal(false)}>
          <div className="bg-white rounded-[18px] w-full max-w-[400px] p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-[15px] font-black text-[#1a1a1a] mb-0.5">Update SSN / EIN</div>
            <div className="text-[12px] text-[#9ca3af] mb-4">Encrypted and stored securely. Used for tax reporting only.</div>
            {['Social Security Number', 'Confirm SSN'].map(l => (
              <div key={l} className="mb-3">
                <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.07em] mb-1.5">{l}</div>
                <input type="password" placeholder="···-··-····" className="w-full border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 text-[13px] outline-none bg-[#f9f8f6] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
              </div>
            ))}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setSsnModal(false)} className="flex-1 bg-white text-[#374151] border border-[#e5e7eb] rounded-full py-2.5 text-[13px] font-bold cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={() => { setSsnModal(false); showToast('SSN update coming soon') }} className="flex-[2] bg-[#1a7f5e] text-white rounded-full py-2.5 text-[13px] font-extrabold border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Update SSN</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[520px] mx-auto px-3.5 py-5 pb-24">
        <h1 className="text-[20px] font-black text-[#1a1a1a] mb-3">Finance</h1>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-[6px] rounded-full border text-[11px] font-bold cursor-pointer transition whitespace-nowrap ${tab === t.key ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}
              style={{ fontFamily: 'inherit' }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Transaction History */}
        {tab === 'history' && (
          <div>
            <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2">Deposit history</div>
            {transactions.length === 0 ? (
              <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <p className="text-[16px] font-bold text-[#1a1a1a] mb-1">No earnings yet</p>
                <p className="text-[13px] text-[#9ca3af] max-w-[280px] mx-auto">Complete your first shift and your earnings will appear here. Payments are processed within 24 hours.</p>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="bg-white border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 mb-1 flex items-center gap-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-[#1a1a1a] truncate">{tx.office}</div>
                    <div className="text-[10px] text-[#9ca3af]">{tx.date} · {tx.hrs}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-[12px] font-bold ${tx.status === 'deposited' ? 'text-[#1a7f5e]' : 'text-[#1a1a1a]'}`}>{tx.amount}</div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: STATUS[tx.status]?.bg, color: STATUS[tx.status]?.color }}>{STATUS[tx.status]?.label}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Payout Accounts */}
        {tab === 'payout' && (
          <div>
            <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2">Payout account</div>
            <p className="text-[13px] text-[#9ca3af] mb-3">No payout account connected yet. Add a bank account to receive payments.</p>

            <div
              onClick={() => setBankModal(true)}
              className="bg-white border-2 border-dashed border-[#e5e7eb] rounded-[10px] px-3 py-2.5 flex items-center gap-2.5 cursor-pointer hover:border-[#1a7f5e] transition"
            >
              <div className="w-8 h-8 rounded-[8px] bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div>
                <div className="text-[12px] font-bold text-[#9ca3af]">Add bank account</div>
                <div className="text-[10px] text-[#9ca3af]">Securely connected via Stripe</div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Information */}
        {tab === 'tax' && (
          <div>
            <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2">Tax documents & info</div>

            <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-10 text-center">
              <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <p className="text-[16px] font-bold text-[#1a1a1a] mb-1">No tax documents yet</p>
              <p className="text-[13px] text-[#9ca3af] max-w-[280px] mx-auto">Tax documents will be available after you complete shifts and earn income through Kazi.</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] z-50">
        <div className="flex">
          {[
            { label: 'Home',       path: '/provider-dashboard',   icon: <HomeIcon /> },
            { label: 'Requests',   path: '/provider-requests',    icon: <ReqIcon /> },
            { label: 'Find Shifts',path: '/provider-find-shifts', icon: <SearchIcon /> },
            { label: 'Messages',   path: '/provider-messages',    icon: <MsgIcon /> },
            { label: 'Finance',    path: '/provider-earnings',    icon: <EarnIcon />, active: true },
          ].map(({ label, path, icon, badge, active }) => (
            <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
              <div className="relative">
                <span className={active ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}>{icon}</span>
                {badge && <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{badge}</span>}
              </div>
              <span className={`text-[10px] ${active ? 'font-bold text-[#1a7f5e]' : 'font-semibold text-[#9ca3af]'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HomeIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
