import { useState } from 'react'
import { BTN } from './adminStyles'
import { useToast } from './ToastContext'

const INITIAL_FLAGS = [
  {
    id: 1,
    type: 'cancellation',
    title: 'Cancellation abuse — Marcus J.',
    desc: '3 cancellations in the last 30 days, all within 12 hrs of shift start. Reliability score dropped to 73%. Automatic flag triggered.',
    iconBg: '#fee2e2',
    iconColor: '#991b1b',
    dismissed: false,
  },
  {
    id: 2,
    type: 'review',
    title: 'Review manipulation — Bright Smile Dental',
    desc: 'Office left 4 identical 1-star reviews on the same professional within 2 hours. Suspected retaliatory reviews. All flagged for moderation.',
    iconBg: '#fef9c3',
    iconColor: '#92400e',
    dismissed: false,
  },
  {
    id: 3,
    type: 'duplicate',
    title: 'Suspected duplicate account — "James T." / "James Torres"',
    desc: 'Two accounts with matching phone number, same photo, registered from same IP. One account was previously suspended.',
    iconBg: '#fee2e2',
    iconColor: '#991b1b',
    dismissed: false,
  },
]

export default function AdminFlags() {
  const showToast = useToast()
  const [flags, setFlags] = useState(INITIAL_FLAGS)

  const dismiss = (id) => {
    setFlags(prev => prev.map(f => f.id === id ? { ...f, dismissed: true } : f))
    showToast('Flag dismissed')
  }

  const active = flags.filter(f => !f.dismissed)

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-3.5 mb-6">
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px] flex-1">
          <div className="w-[38px] h-[38px] rounded-[9px] bg-[#fee2e2] flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </div>
          <div className="text-[26px] font-black text-[#1a1a1a] leading-none mb-0.5">{active.length}</div>
          <div className="text-[11px] text-[#9ca3af] font-medium">Active Flags</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px] flex-1">
          <div className="w-[38px] h-[38px] rounded-[9px] bg-[#fef9c3] flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div className="text-[26px] font-black text-[#1a1a1a] leading-none mb-0.5">7.2%</div>
          <div className="text-[11px] text-[#9ca3af] font-medium">Cancellation Rate</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px] flex-1">
          <div className="w-[38px] h-[38px] rounded-[9px] bg-[#fee2e2] flex items-center justify-center mb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div className="text-[26px] font-black text-[#1a1a1a] leading-none mb-0.5">1</div>
          <div className="text-[11px] text-[#9ca3af] font-medium">Suspected Duplicates</div>
        </div>
      </div>

      <div className="text-[13px] font-extrabold text-[#1a1a1a] mb-3">Active Flags</div>

      {active.length === 0 && (
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-12 text-center">
          <div className="text-[32px] mb-3">✓</div>
          <div className="text-[15px] font-bold text-[#1a1a1a] mb-1">No active flags</div>
          <div className="text-[13px] text-[#9ca3af]">All clear — no safety issues to review.</div>
        </div>
      )}

      {active.map(flag => (
        <div key={flag.id} className="bg-white border border-[#e5e7eb] rounded-[14px] p-4 mb-2.5 flex items-flex-start gap-3">
          <div className="w-9 h-9 rounded-[9px] flex items-center justify-center flex-shrink-0" style={{ background: flag.iconBg }}>
            {flag.type === 'cancellation' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={flag.iconColor} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>}
            {flag.type === 'review' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={flag.iconColor} strokeWidth="2.5" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>}
            {flag.type === 'duplicate' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={flag.iconColor} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-extrabold text-[#1a1a1a] mb-1">{flag.title}</div>
            <div className="text-[11px] text-[#6b7280] mb-2.5 leading-relaxed">{flag.desc}</div>
            <div className="flex gap-1.5 flex-wrap">
              {flag.type === 'cancellation' && <button onClick={() => { showToast('Warning sent to Marcus J.'); dismiss(flag.id) }} className={BTN.red} style={{ fontFamily: 'inherit' }}>Send warning</button>}
              {flag.type === 'review' && <button onClick={() => { showToast('Reviews removed and office warned'); dismiss(flag.id) }} className={BTN.red} style={{ fontFamily: 'inherit' }}>Remove reviews & warn</button>}
              {flag.type === 'duplicate' && (
                <>
                  <button onClick={() => { showToast('Duplicate account banned'); dismiss(flag.id) }} className={BTN.red} style={{ fontFamily: 'inherit' }}>Ban duplicate</button>
                  <button onClick={() => { showToast('Accounts merged'); dismiss(flag.id) }} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Merge accounts</button>
                </>
              )}
              <button onClick={() => dismiss(flag.id)} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Dismiss flag</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
