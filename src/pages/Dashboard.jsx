import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Dashboard() {
  const navigate = useNavigate()
  const [shiftModal, setShiftModal] = useState(null)
  const [cancelled, setCancelled] = useState({})
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const shifts = [
    { id: 's1', date: 'Mon Mar 17', role: 'Dental Hygienist', time: '8:00am - 5:00pm', name: 'Sarah R.', rating: '4.9', status: 'Confirmed', confirmed: true, img: 'https://randomuser.me/api/portraits/women/44.jpg', rate: '$54/hr' },
    { id: 's2', date: 'Wed Mar 19', role: 'Dental Assistant', time: '9:00am - 3:00pm', name: 'Marcus J.', rating: '4.8', status: 'Confirmed', confirmed: true, img: 'https://randomuser.me/api/portraits/men/32.jpg', rate: '$44/hr' },
    { id: 's3', date: 'Thu Mar 20', role: 'Front Desk', time: '8:00am - 5:00pm', name: 'Aisha L.', rating: '5.0', status: 'Pending', confirmed: false, img: 'https://randomuser.me/api/portraits/women/65.jpg', rate: '$38/hr' },
  ]

  const professionals = [
    { name: 'Sarah R.', role: 'Dental Hygienist', rate: '$52/hr', miles: '8.2 miles away', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Marcus J.', role: 'Dental Assistant', rate: '$48/hr', miles: '5.7 miles away', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Aisha L.', role: 'Front Desk', rate: '$38/hr', miles: '13.1 miles away', img: 'https://randomuser.me/api/portraits/women/65.jpg' },
  ]

  const getStatusStyle = (shift) => {
    if (cancelled[shift.id]) return 'bg-red-50 text-red-400'
    if (shift.confirmed) return 'bg-[#e8f5f0] text-[#1a7f5e]'
    return 'bg-[#fef3c7] text-[#92400e]'
  }

  const getStatusText = (shift) => {
    if (cancelled[shift.id]) return 'Cancelled'
    return shift.status
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Shift modal */}
      {shiftModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setShiftModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#f9f8f6] px-6 pt-6 pb-4 border-b border-[#e5e7eb] flex items-center gap-4">
              <img src={shiftModal.img} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-white shadow" />
              <div className="flex-1">
                <p className="text-base font-extrabold text-[#1a1a1a]">{shiftModal.name}</p>
                <p className="text-xs text-[#6b7280]">{shiftModal.role}</p>
                <p className="text-xs text-[#f59e0b]">★ {shiftModal.rating}</p>
              </div>
              <button onClick={() => setShiftModal(null)} className="text-[#9ca3af] hover:text-[#1a1a1a] text-xl transition">✕</button>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Date</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{shiftModal.date}</span>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Time</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{shiftModal.time}</span>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Rate</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{shiftModal.rate}</span>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Status</span>
                  <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + getStatusStyle(shiftModal)}>
                    {getStatusText(shiftModal)}
                  </span>
                </div>
              </div>
              {cancelled[shiftModal.id] ? (
                <div className="flex flex-col gap-2">
                  <div className="text-center text-xs font-bold text-red-400 bg-red-50 py-2.5 rounded-full">Shift cancelled</div>
                  <button onClick={() => { navigate('/profile'); setShiftModal(null) }} className="w-full border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">View profile</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { navigate('/profile'); setShiftModal(null) }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition">View profile</button>
                  <button onClick={() => { navigate('/messages'); setShiftModal(null) }} className="w-full border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    Message {shiftModal.name.split(' ')[0]}
                  </button>
                  <button
                    onClick={() => {
                      setCancelled(prev => ({ ...prev, [shiftModal.id]: true }))
                      showToast('Shift with ' + shiftModal.name + ' cancelled')
                      setShiftModal(null)
                    }}
                    className="w-full border border-[#e5e7eb] text-red-500 font-bold py-2.5 rounded-full text-sm hover:border-red-400 transition"
                  >
                    Cancel shift
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PAGE CONTENT ── */}
      <div className="max-w-[680px] mx-auto px-6 py-7 pb-24 md:pb-10">

        {/* Greeting */}
        <p className="text-[22px] font-black text-[#1a1a1a] mb-1">Good morning, Dr. Martinez 👋</p>
        <p className="text-[14px] text-[#9ca3af] mb-6">Monday, March 16, 2026 · Bright Smile Dental · Houston, TX</p>

        {/* CTA Card */}
        <div className="bg-[#e8f5f0] border border-[#c6e8d9] rounded-[20px] p-6 mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-extrabold text-[#1a7f5e] uppercase tracking-widest mb-1">You have shifts coming up</p>
            <p className="text-[20px] font-black text-[#1a1a1a] mb-1">Need more coverage?</p>
            <p className="text-[13px] text-[#4b8c72] leading-relaxed">Post another shift or invite a professional directly.</p>
          </div>
          <button
            onClick={() => navigate('/post-shift')}
            className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-extrabold px-6 py-3 rounded-full text-[14px] flex items-center gap-2 transition whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post a shift
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => navigate('/professionals')}
            className="bg-white border border-[#e5e7eb] hover:border-[#1a7f5e] rounded-2xl p-4 flex items-center gap-3 transition text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#1a1a1a]">Find professionals</p>
              <p className="text-[13px] text-[#9ca3af] mt-0.5">Browse verified talent</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/bookings')}
            className="bg-white border border-[#e5e7eb] hover:border-[#1a7f5e] rounded-2xl p-4 flex items-center gap-3 transition text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#1a1a1a]">View bookings</p>
              <p className="text-[13px] text-[#9ca3af] mt-0.5">Upcoming &amp; past shifts</p>
            </div>
          </button>
        </div>


      </div>

      {/* Floating help button */}
      <button
        onClick={() => navigate('/help')}
        className="fixed bottom-24 right-5 md:bottom-8 w-12 h-12 bg-[#1a7f5e] hover:bg-[#156649] rounded-full flex items-center justify-center shadow-lg transition z-50"
        aria-label="Help & Support"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      {/* Mobile bottom toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] z-40">
        <div className="flex">
          <button onClick={() => navigate('/dashboard')} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span className="text-[10px] font-bold text-[#1a7f5e]">Dashboard</span>
          </button>
          <button onClick={() => navigate('/professionals')} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="text-[10px] font-semibold text-[#9ca3af]">Pros</span>
          </button>
          <button onClick={() => navigate('/bookings')} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="text-[10px] font-semibold text-[#9ca3af]">Bookings</span>
          </button>
          <button onClick={() => navigate('/messages')} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-[10px] font-semibold text-[#9ca3af]">Messages</span>
          </button>
        </div>
      </div>

    </div>
  )
}
