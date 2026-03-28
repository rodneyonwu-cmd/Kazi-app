import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Help() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    { q: 'How do I post a shift?', a: 'Click "Post a shift" on your dashboard. Fill in the role, date, time, and rate. You can optionally invite specific professionals or let kazi. match you automatically.' },
    { q: 'How does payment work?', a: 'kazi. charges a 15% service fee on Pay Per Shift plans. Payment is processed automatically after a shift is completed. Monthly plan subscribers pay a flat $89/month with no per-shift fees.' },
    { q: 'How are professionals verified?', a: 'All professionals on kazi. go through identity verification, license checks, and background screening before they can accept shifts. Look for the verified badge on their profile.' },
    { q: 'What if a professional cancels last minute?', a: 'If a professional cancels within 24 hours of a shift, kazi. will immediately notify you and help find a replacement. Repeat cancellations affect a professional\'s reliability score.' },
    { q: 'Can I book the same professional again?', a: 'Yes! You can save professionals to your favorites and invite them directly when posting future shifts. Professionals you\'ve worked with before appear highlighted on your dashboard.' },
    { q: 'How do I cancel or change my plan?', a: 'Go to Settings → Billing to upgrade, downgrade, or cancel your plan at any time. Changes take effect at the start of your next billing cycle.' },
  ]

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      <div className="max-w-[800px] mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-[32px] font-extrabold text-[#1a1a1a] mb-2">Help & Support</h1>
          <p className="text-[16px] text-[#6b7280]">How can we help you today?</p>
        </div>

        <div className="relative mb-10">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search for answers..." className="w-full border-[1.5px] border-[#e5e7eb] rounded-full pl-12 pr-6 py-3.5 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title: 'Live Chat', sub: 'Chat with us now' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, title: 'Email Us', sub: 'support@kazi.com' },
            { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>, title: 'Call Us', sub: 'Mon–Fri, 9am–6pm' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#e5e7eb] rounded-2xl p-5 text-center cursor-pointer hover:border-[#1a7f5e] transition">
              <div className="w-11 h-11 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-3">{item.icon}</div>
              <p className="text-sm font-bold text-[#1a1a1a] mb-1">{item.title}</p>
              <p className="text-xs text-[#9ca3af]">{item.sub}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-4">Frequently Asked Questions</p>
        <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden mb-8">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-[#e5e7eb] last:border-0">
              <div onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex items-center justify-between px-6 py-5 cursor-pointer hover:bg-[#f9f8f6] transition">
                <p className="text-[15px] font-semibold text-[#1a1a1a]">{faq.q}</p>
                <span className={`text-[#1a7f5e] text-xl font-light transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>+</span>
              </div>
              {openFaq === i && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-[#6b7280] leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#1a7f5e] rounded-2xl p-7 text-center text-white">
          <h2 className="text-[20px] font-extrabold mb-2">Still need help?</h2>
          <p className="text-sm opacity-85 mb-5">Our support team is available Monday–Friday, 9am–6pm CST.</p>
          <button className="bg-white text-[#1a7f5e] font-bold px-7 py-3 rounded-full text-sm hover:bg-[#f9f8f6] transition">Contact Support</button>
        </div>

      </div>
    </div>
  )
}