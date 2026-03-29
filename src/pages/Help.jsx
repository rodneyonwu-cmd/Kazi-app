import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

const CATEGORIES = [
  { label: 'Shifts', sub: 'Posting & management', bg: '#e8f5f0', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
  { label: 'Payments', sub: 'Billing & plans', bg: '#ede9fe', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { label: 'Professionals', sub: 'Booking & reviews', bg: '#fef9c3', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  { label: 'Trust & Safety', sub: 'Disputes & reports', bg: '#fee2e2', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
]

const FAQS = [
  { q: 'How do I post a shift?', a: 'Click "Post a shift" on your dashboard. Fill in the role, date, time, and rate. You can optionally invite specific professionals or let kazi. match you automatically.' },
  { q: 'How does payment work?', a: 'kazi. charges a 15% service fee on Pay Per Shift plans. Payment is processed automatically after a shift is completed. Monthly plan subscribers pay a flat $89/month with no per-shift fees.' },
  { q: 'How are professionals verified?', a: 'All professionals on kazi. go through identity verification, license checks, and background screening before they can accept shifts. Look for the verified badge on their profile.' },
  { q: 'What if a professional cancels last minute?', a: "If a professional cancels within 24 hours of a shift, kazi. will immediately notify you and help find a replacement. Repeat cancellations affect a professional's reliability score." },
  { q: 'Can I book the same professional again?', a: "Yes! You can save professionals to your favorites and invite them directly when posting future shifts. Professionals you've worked with before appear highlighted on your dashboard." },
  { q: 'How do I cancel or change my plan?', a: 'Go to Settings → Billing to upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.' },
  { q: 'What is Rapid Fill?', a: "Rapid Fill lets you simultaneously invite up to 10 matched professionals for an urgent shift. The first to accept gets the shift — all others are automatically notified. It's the fastest way to fill last-minute openings." },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`bg-white border rounded-[10px] mb-1.5 overflow-hidden transition-all ${open ? 'border-[#1a7f5e]' : 'border-[#e5e7eb]'}`}>
      <div className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-[#f9f8f6] transition" onClick={() => setOpen(!open)}>
        <span className="text-[12px] font-bold text-[#1a1a1a] pr-4">{q}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" className={`flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {open && <div className="px-3.5 pb-3 text-[12px] text-[#374151] leading-relaxed">{a}</div>}
    </div>
  )
}

export default function Help() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[12px] font-semibold px-4 py-2.5 rounded-full z-[300] flex items-center gap-2 shadow-xl whitespace-nowrap">
          <div className="w-4 h-4 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      <div className="max-w-[520px] mx-auto px-3.5 py-5">
        <h1 className="text-[20px] font-black text-[#1a1a1a] mb-0.5">Help & Support</h1>
        <p className="text-[13px] text-[#9ca3af] mb-4">Find answers or contact support</p>

        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for answers..." className="w-full pl-9 pr-4 py-2.5 border border-[#e5e7eb] rounded-full text-[13px] outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a] transition" style={{ fontFamily: 'inherit' }}/>
        </div>

        {!search && (
          <>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {CATEGORIES.map(cat => (
                <div key={cat.label} className="bg-white border border-[#e5e7eb] rounded-[12px] p-3.5 cursor-pointer hover:border-[#1a7f5e] transition text-center">
                  <div className="w-9 h-9 rounded-[10px] flex items-center justify-center mx-auto mb-2" style={{ background: cat.bg }}>{cat.icon}</div>
                  <div className="text-[12px] font-bold text-[#1a1a1a]">{cat.label}</div>
                  <div className="text-[10px] text-[#9ca3af] mt-0.5">{cat.sub}</div>
                </div>
              ))}
            </div>
            <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2">Frequently asked questions</div>
          </>
        )}

        {filteredFaqs.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-[12px] py-10 text-center">
            <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">No results found</p>
            <p className="text-[12px] text-[#9ca3af]">Try different keywords or contact support below</p>
          </div>
        ) : (
          filteredFaqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)
        )}

        <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2 mt-5">Contact support</div>

        <div onClick={() => showToast('Opening live chat...')} className="bg-white border border-[#e5e7eb] rounded-[10px] px-3 py-3 mb-1.5 flex items-center gap-2.5 cursor-pointer hover:border-[#1a7f5e] transition">
          <div className="w-8 h-8 rounded-[9px] bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-[#1a1a1a]">Live chat</div>
            <div className="text-[11px] text-[#9ca3af]">Usually responds in under 5 minutes</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <div onClick={() => showToast('Opening email...')} className="bg-white border border-[#e5e7eb] rounded-[10px] px-3 py-3 mb-1.5 flex items-center gap-2.5 cursor-pointer hover:border-[#1a7f5e] transition">
          <div className="w-8 h-8 rounded-[9px] bg-[#ede9fe] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-[#1a1a1a]">Email support</div>
            <div className="text-[11px] text-[#9ca3af]">support@kazi.com · Replies within 24 hrs</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>

        <div onClick={() => showToast('Opening phone...')} className="bg-white border border-[#e5e7eb] rounded-[10px] px-3 py-3 flex items-center gap-2.5 cursor-pointer hover:border-[#1a7f5e] transition">
          <div className="w-8 h-8 rounded-[9px] bg-[#fef9c3] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </div>
          <div className="flex-1">
            <div className="text-[12px] font-bold text-[#1a1a1a]">Call us</div>
            <div className="text-[11px] text-[#9ca3af]">Mon–Fri · 9am–6pm CST</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>
  )
}