import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const FAQS = [
  { q: 'How does Kazi pay me?', a: "Kazi processes payments via Stripe. After a completed shift, your earnings are typically deposited to your connected bank account within 1–2 business days. If Instant Pay is enabled by the office, you'll receive funds the same day." },
  { q: 'How do I cancel a confirmed shift?', a: 'Go to your Schedule, find the shift, and tap Cancel. Cancellations made more than 24 hours in advance are penalty-free. Late cancellations may affect your reliability score. We strongly recommend messaging the office before cancelling.' },
  { q: 'What is Rapid Fill?', a: 'Rapid Fill is our urgent shift system. When an office needs a last-minute fill, up to 10 matching providers are simultaneously notified. The first to accept locks in the shift. Rapid Fill shifts often pay a premium rate.' },
  { q: 'How is my reliability score calculated?', a: 'Your reliability score is based on the percentage of confirmed shifts you completed without a late cancellation. A score above 90% keeps your profile highly visible to offices. Cancellations made 24+ hours in advance do not impact your score.' },
  { q: 'Do I need to verify my license to start working?', a: 'Yes. All providers must upload and verify their state dental license before accepting shifts. Verification typically takes 1 business day. You can upload your license in the Documents section of your profile.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, marginBottom: 5, overflow: 'hidden' }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#1a1a1a', background: open ? '#f9f8f6' : 'white' }}
      >
        {q}
        <svg style={{ transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {open && (
        <div style={{ padding: '0 13px 12px', fontSize: 12, color: '#374151', lineHeight: 1.6 }}>{a}</div>
      )}
    </div>
  )
}

export default function ProviderHelpCenter() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9f8f6', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <ProviderNav />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: 'white', fontSize: 12, fontWeight: 600, padding: '9px 16px', borderRadius: 100, zIndex: 300, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,.2)', whiteSpace: 'nowrap' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#1a7f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Inner */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 14px 100px' }}>

        <div style={{ fontSize: 20, fontWeight: 900, color: '#1a1a1a', marginBottom: 2 }}>Help Center</div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>Find answers or contact support</div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search for answers..."
          style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 100, padding: '10px 16px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white', marginBottom: 18, boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = '#1a7f5e'}
          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
        />

        {/* Category tiles */}
        {!search && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {[
                { label: 'Shifts', sub: 'Booking & cancellations', bg: '#e8f5f0', stroke: '#1a7f5e', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
                { label: 'Payments', sub: 'Deposits & payouts', bg: '#ede9fe', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
                { label: 'Profile', sub: 'Credentials & settings', bg: '#fef9c3', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                { label: 'Trust & Safety', sub: 'Disputes & reports', bg: '#fee2e2', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              ].map(cat => (
                <div key={cat.label} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: 14, cursor: 'pointer', textAlign: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1a7f5e'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                    {cat.icon}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{cat.label}</div>
                  <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{cat.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Frequently asked questions</div>
          </>
        )}

        {/* FAQs */}
        {filtered.length === 0 ? (
          <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>No results found</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>Try different keywords or contact support below</div>
          </div>
        ) : (
          filtered.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)
        )}

        {/* Contact support */}
        <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, marginTop: 18 }}>Contact support</div>

        {[
          { label: 'Live chat', sub: 'Usually responds in under 5 minutes', bg: '#e8f5f0', onClick: () => showToast('Opening live chat...'), icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { label: 'Email support', sub: 'support@kazi.com · Replies within 24 hrs', bg: '#ede9fe', onClick: () => showToast('Opening email...'), icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
        ].map(row => (
          <div key={row.label} onClick={row.onClick}
            style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 13px', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#1a7f5e'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
          >
            <div style={{ width: 34, height: 34, borderRadius: 9, background: row.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {row.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{row.label}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{row.sub}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        ))}

      </div>

      {/* Mobile toolbar */}
      <div className="md:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: '1px solid #e5e7eb', zIndex: 50 }}>
        <div style={{ display: 'flex' }}>
          {[
            { label: 'Home',        path: '/provider-dashboard',   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
            { label: 'Requests',    path: '/provider-requests',    badge: 2, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> },
            { label: 'Find Shifts', path: '/provider-find-shifts', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
            { label: 'Messages',    path: '/provider-messages',    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
            { label: 'Finance',     path: '/provider-earnings',    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
          ].map(({ label, path, icon, badge }) => (
            <div key={label} onClick={() => navigate(path)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 0', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                {icon}
                {badge && <span style={{ position: 'absolute', top: -4, right: -6, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 700, width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>{badge}</span>}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
