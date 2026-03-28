import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const transactions = [
  { id: 1, type: 'shift', office: 'Bright Smile Dental', detail: 'Mar 20 · 9 hrs', amount: '+$468', status: 'Processing', statusStyle: 'bg-[#fef9c3] text-[#92400e]' },
  { id: 2, type: 'cashout', office: 'Cash out to Chase 4521', detail: 'Mar 19', amount: '-$808', status: 'Sent', statusStyle: 'bg-[#ede9fe] text-[#5b21b6]' },
  { id: 3, type: 'shift', office: 'Houston Family Dentistry', detail: 'Mar 17 · 8 hrs', amount: '+$416', status: 'Paid', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
  { id: 4, type: 'shift', office: 'Clear Lake Dental Care', detail: 'Mar 14 · 6 hrs', amount: '+$312', status: 'Paid', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
  { id: 5, type: 'cashout', office: 'Cash out to Chase 4521', detail: 'Mar 8', amount: '-$1,040', status: 'Sent', statusStyle: 'bg-[#ede9fe] text-[#5b21b6]' },
]

const bars = [
  { label: 'Mar 1', pct: 40 }, { label: 'Mar 5', pct: 55 }, { label: 'Mar 8', pct: 35 },
  { label: 'Mar 12', pct: 70 }, { label: 'Mar 15', pct: 50 }, { label: 'Mar 19', pct: 80 },
  { label: 'Mar 24', pct: 60, active: true }, { label: 'Mar 28', pct: 0 },
]

export default function ProviderEarnings() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('Month')
  const [cashingOut, setCashingOut] = useState(false)

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      <ProviderNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Earnings</h1>
          <p className="text-[13px] text-[#9ca3af]">Your income, payouts, and transaction history</p>
        </div>

        {/* Hero card */}
        <div className="bg-[#1a7f5e] rounded-[20px] p-6 mb-4">
          <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-1">Available to cash out</p>
          <p className="text-[42px] font-black text-white tracking-tight mb-1">$340.00</p>
          <p className="text-[13px] text-white/60 mb-5">$468 pending · clears in ~24 hrs</p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-5">
              <div>
                <p className="text-[18px] font-black text-white">$2,840</p>
                <p className="text-[11px] text-white/55">This month</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-[18px] font-black text-white">$18,460</p>
                <p className="text-[11px] text-white/55">This year</p>
              </div>
            </div>
            <button
              onClick={() => setCashingOut(true)}
              className="bg-white text-[#1a7f5e] font-bold px-5 py-2.5 rounded-full text-[13px] hover:bg-[#f0faf6] transition"
            >
              Cash out
            </button>
          </div>
        </div>

        {/* 1099 banner */}
        <div className="bg-[#fef9c3] border border-[#fde68a] rounded-[14px] px-4 py-3 flex items-center gap-3 mb-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-[#92400e]">Your 1099 is ready</p>
            <p className="text-[12px] text-[#92400e]/80">You earned $18,460 in 2025.</p>
          </div>
          <button className="text-[12px] font-bold text-[#92400e] border border-[#fbbf24] px-3 py-1.5 rounded-full hover:bg-[#fde68a] transition flex-shrink-0">Download 1099</button>
        </div>

        {/* Chart */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[15px] font-black text-[#1a1a1a]">Earnings overview</p>
            <div className="flex gap-1">
              {['Week', 'Month', 'Year'].map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded-full text-[12px] font-bold transition ${period === p ? 'bg-[#1a7f5e] text-white' : 'text-[#9ca3af] hover:text-[#374151]'}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 h-24">
            {bars.map(b => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md transition-all ${b.active ? 'bg-[#1a7f5e]' : 'bg-[#e8f5f0]'}`} style={{ height: `${b.pct}%` }} />
                <p className="text-[9px] text-[#9ca3af] font-semibold whitespace-nowrap">{b.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'This month', value: '$2,840', change: '+12% vs last month', changeColor: 'text-[#1a7f5e]' },
            { label: 'Shifts completed', value: '6', change: '+2 vs last month', changeColor: 'text-[#1a7f5e]' },
            { label: 'Avg per shift', value: '$473', change: '+$22 vs last month', changeColor: 'text-[#1a7f5e]' },
            { label: 'Avg hourly rate', value: '$52', change: 'Top 15% in Houston', changeColor: 'text-[#5b21b6]' },
          ].map(({ label, value, change, changeColor }) => (
            <div key={label} className="bg-white border border-[#e5e7eb] rounded-[16px] p-4">
              <p className="text-[12px] text-[#9ca3af] font-semibold mb-1">{label}</p>
              <p className="text-[22px] font-black text-[#1a1a1a] mb-1">{value}</p>
              <p className={`text-[11px] font-semibold ${changeColor}`}>{change}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6]">
            <p className="text-[15px] font-black text-[#1a1a1a]">Transaction history</p>
            <button className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">Export CSV</button>
          </div>
          {transactions.map((tx, i) => (
            <div key={tx.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < transactions.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}>
              <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${tx.type === 'shift' ? 'bg-[#e8f5f0]' : 'bg-[#fee2e2]'}`}>
                {tx.type === 'shift'
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#1a1a1a]">{tx.office}</p>
                <p className="text-[12px] text-[#9ca3af]">{tx.detail}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-[14px] font-black ${tx.amount.startsWith('+') ? 'text-[#1a7f5e]' : 'text-[#5b21b6]'}`}>{tx.amount}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tx.statusStyle}`}>{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cash out confirmation */}
      {cashingOut && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setCashingOut(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[20px] p-6 w-[340px] z-50 shadow-2xl">
            <p className="text-[18px] font-black text-[#1a1a1a] mb-1">Cash out $340.00?</p>
            <p className="text-[13px] text-[#9ca3af] mb-5">Funds will be sent to Chase ****4521 within 1–2 business days.</p>
            <div className="flex gap-2">
              <button onClick={() => setCashingOut(false)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px]">Cancel</button>
              <button onClick={() => setCashingOut(false)} className="flex-1 bg-[#1a7f5e] text-white font-bold py-2.5 rounded-full text-[13px]">Confirm</button>
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
          { label: 'Earnings', path: '/provider-earnings', icon: <EarnIcon />, active: true },
        ].map(({ label, path, active, icon, badge }) => (
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
  )
}

function HomeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
