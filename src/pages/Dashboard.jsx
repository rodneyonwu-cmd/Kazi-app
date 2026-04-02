import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()

  const [shiftModal, setShiftModal] = useState(null)
  const [cancelled, setCancelled] = useState({})
  const [toast, setToast] = useState(null)

  const [office, setOffice] = useState(null)
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        const [officeRes, shiftsRes] = await Promise.all([
          fetch(`${API_URL}/api/offices/me`, { headers }),
          fetch(`${API_URL}/api/shifts?status=OPEN`, { headers }),
        ])

        if (officeRes.ok) {
          const officeData = await officeRes.json()
          setOffice(officeData)
        }

        if (shiftsRes.ok) {
          const shiftsData = await shiftsRes.json()
          setShifts(Array.isArray(shiftsData) ? shiftsData : [])
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [getToken])

  const firstName = office?.firstName || user?.firstName || 'there'

  const getStatusStyle = (shift) => {
    if (cancelled[shift.id]) return 'bg-red-50 text-red-400'
    if (shift.confirmed || shift.status === 'CONFIRMED') return 'bg-[#e8f5f0] text-[#1a7f5e]'
    return 'bg-[#fef3c7] text-[#92400e]'
  }

  const getStatusText = (shift) => {
    if (cancelled[shift.id]) return 'Cancelled'
    return shift.status || 'Pending'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6]">
        <Nav />
        <div className="max-w-[680px] mx-auto px-6 py-7 pb-24 md:pb-10">
          {/* Greeting skeleton */}
          <div className="h-7 w-64 bg-[#e5e7eb] rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-80 bg-[#e5e7eb] rounded-lg mb-6 animate-pulse" />

          {/* CTA skeleton */}
          <div className="h-32 bg-[#e5e7eb] rounded-[20px] mb-4 animate-pulse" />

          {/* Quick actions skeleton */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="h-20 bg-[#e5e7eb] rounded-2xl animate-pulse" />
            <div className="h-20 bg-[#e5e7eb] rounded-2xl animate-pulse" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="h-24 bg-[#e5e7eb] rounded-2xl animate-pulse" />
            <div className="h-24 bg-[#e5e7eb] rounded-2xl animate-pulse" />
            <div className="h-24 bg-[#e5e7eb] rounded-2xl animate-pulse" />
          </div>

          {/* Shifts skeleton */}
          <div className="h-5 w-40 bg-[#e5e7eb] rounded-lg mb-3 animate-pulse" />
          <div className="space-y-3">
            <div className="h-24 bg-[#e5e7eb] rounded-[18px] animate-pulse" />
            <div className="h-24 bg-[#e5e7eb] rounded-[18px] animate-pulse" />
          </div>
        </div>
      </div>
    )
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
              <InitialsAvatar name={shiftModal.name} size={56} className="border-2 border-white shadow" />
              <div className="flex-1">
                <p className="text-base font-extrabold text-[#1a1a1a]">{shiftModal.name}</p>
                <p className="text-xs text-[#6b7280]">{shiftModal.role}</p>
                {shiftModal.rating && <p className="text-xs text-[#f59e0b]">★ {shiftModal.rating}</p>}
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
                    Message {shiftModal.name?.split(' ')[0]}
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
        <p className="text-[22px] font-black text-[#1a1a1a] mb-1">{getGreeting()}, {firstName} 👋</p>
        <p className="text-[14px] text-[#9ca3af] mb-6">
          {formatDate()}
          {office?.practiceName ? ` · ${office.practiceName}` : ''}
          {office?.city && office?.state ? ` · ${office.city}, ${office.state}` : ''}
        </p>

        {/* CTA Card */}
        <div className="bg-[#e8f5f0] border border-[#c6e8d9] rounded-[20px] p-6 mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-extrabold text-[#1a7f5e] uppercase tracking-widest mb-1">
              {shifts.length > 0 ? 'You have shifts coming up' : 'Get started'}
            </p>
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

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 text-center">
            <p className="text-[22px] font-black text-[#1a7f5e]">{office?.stats?.openShifts || 0}</p>
            <p className="text-[11px] text-[#9ca3af] font-semibold mt-1">Open shifts</p>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 text-center">
            <p className="text-[22px] font-black text-[#1a7f5e]">{office?.stats?.totalShifts || 0}</p>
            <p className="text-[11px] text-[#9ca3af] font-semibold mt-1">Total shifts</p>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 text-center">
            <p className="text-[22px] font-black text-[#1a7f5e]">{office?.stats?.completedBookings || 0}</p>
            <p className="text-[11px] text-[#9ca3af] font-semibold mt-1">Completed</p>
          </div>
        </div>

        {/* Upcoming Shifts */}
        <p className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">Upcoming shifts</p>
        {shifts.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-8 text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No shifts posted yet</p>
            <p className="text-[13px] text-[#9ca3af] mb-4">Post your first shift to start finding professionals.</p>
            <button onClick={() => navigate('/post-shift')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-5 py-2.5 rounded-full text-[13px] transition">Post a shift</button>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {shifts.map((shift) => (
              <button
                key={shift.id}
                onClick={() => setShiftModal(shift)}
                className="w-full bg-white border border-[#e5e7eb] hover:border-[#1a7f5e] rounded-[18px] p-4 flex items-center gap-4 transition text-left"
              >
                <InitialsAvatar name={shift.name} size={44} className="border-2 border-white shadow" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14px] font-extrabold text-[#1a1a1a] truncate">{shift.name || shift.role}</p>
                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ' + getStatusStyle(shift)}>
                      {getStatusText(shift)}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#6b7280]">{shift.role}</p>
                  <p className="text-[12px] text-[#9ca3af]">{shift.date} · {shift.time}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-[#1a7f5e]">{shift.rate}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Professionals */}
        <p className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">Top professionals</p>
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No professionals yet</p>
          <p className="text-[13px] text-[#9ca3af] mb-4">Browse professionals to find your next hire.</p>
          <button onClick={() => navigate('/professionals')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-5 py-2.5 rounded-full text-[13px] transition">Browse professionals</button>
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
