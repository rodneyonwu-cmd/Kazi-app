import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const faqs = [
  { q: 'How do I get paid?', a: 'Kazi pays you directly after each completed shift. Funds are available within 24 hours with Instant Pay, or within 3–5 business days with standard transfer. You can cash out anytime from your Earnings page.' },
  { q: 'How does Rapid Fill work?', a: 'When an office uses Rapid Fill, they send the shift invite to multiple verified professionals at once. The first professional to accept secures the shift. You will receive a push notification — act quickly!' },
  { q: 'Can I cancel a confirmed shift?', a: 'Yes, but please do so as early as possible. Cancellations within 24 hours of the shift may affect your reliability score. Repeated late cancellations can limit your ability to receive future invitations.' },
  { q: 'How is my reliability score calculated?', a: 'Your reliability score reflects your history of accepting shifts and showing up on time. It is calculated based on your acceptance rate, cancellation history, and on-time arrival rate over your last 90 days.' },
  { q: 'How do I update my availability?', a: 'Go to Schedule in the navigation, then tap "Edit hours" next to My Availability. You can set your regular weekly hours and add date exceptions for vacations or one-off availability.' },
  { q: 'What if an office does not pay on time?', a: 'Contact our support team immediately. Kazi holds platform-level protections for verified professionals. We will investigate and resolve any payment issues directly with the office.' },
  { q: 'How do I verify my license?', a: 'Go to Documents & Credentials and upload a photo of your current license. Our team reviews submissions within 1–2 business days. You will receive a notification once verified.' },
  { q: 'Can I work at multiple offices on the same day?', a: 'No. Kazi only allows one shift per day to ensure quality care and prevent overcommitment. If you accept a shift, other same-day opportunities will be unavailable.' },
]

export default function ProviderHelpCenter() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      <ProviderNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button onClick={() => navigate('/provider-dashboard')} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9ca3af] hover:text-[#374151] mb-4 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Help Center</h1>
          <p className="text-[13px] text-[#9ca3af]">Find answers or reach our support team</p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search help articles..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-[#e5e7eb] rounded-[14px] pl-10 pr-4 py-3 text-[14px] outline-none focus:border-[#1a7f5e] transition" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: '💰', label: 'Getting paid', color: 'bg-[#e8f5f0]' },
            { icon: '📅', label: 'Scheduling', color: 'bg-[#ede9fe]' },
            { icon: '🔒', label: 'Account & Security', color: 'bg-[#fef9c3]' },
          ].map(({ icon, label, color }) => (
            <div key={label} className={`${color} rounded-[14px] p-4 text-center cursor-pointer hover:opacity-80 transition`}>
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-[12px] font-bold text-[#1a1a1a]">{label}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-[#f3f4f6]">
            <p className="text-[15px] font-black text-[#1a1a1a]">Frequently asked questions</p>
          </div>
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-[#9ca3af] text-[13px]">No results found for "{search}"</div>
          ) : (
            filtered.map((faq, i) => (
              <div key={i} className={`border-b border-[#f3f4f6] last:border-none`}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#f9f8f6] transition"
                >
                  <span className="text-[14px] font-semibold text-[#1a1a1a] pr-4">{faq.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"
                    style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-[13px] text-[#6b7280] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact support */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-5">
          <p className="text-[15px] font-black text-[#1a1a1a] mb-1">Still need help?</p>
          <p className="text-[13px] text-[#9ca3af] mb-4">Our support team is available Mon–Fri, 8am–6pm CT.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => navigate('/provider-messages')} className="flex items-center gap-3 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-5 py-3 rounded-full text-[14px] transition w-full justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Contact Support
            </button>
            <button className="flex items-center gap-3 border border-[#e5e7eb] text-[#374151] font-bold px-5 py-3 rounded-full text-[14px] hover:border-[#1a7f5e] transition w-full justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.36 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              support@kazi.com
            </button>
          </div>
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
