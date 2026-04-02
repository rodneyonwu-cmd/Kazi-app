import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import InitialsAvatar from './InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ── Icons ────────────────────────────────────────────
const Icon = ({ d, d2, circle, rect, poly, line1, line2, box }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {d && <path d={d} />}
    {d2 && <path d={d2} />}
    {circle && <circle cx={circle.cx} cy={circle.cy} r={circle.r} />}
    {rect && <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={rect.rx} />}
    {poly && <polyline points={poly} />}
    {line1 && <line x1={line1[0]} y1={line1[1]} x2={line1[2]} y2={line1[3]} />}
    {line2 && <line x1={line2[0]} y1={line2[1]} x2={line2[2]} y2={line2[3]} />}
  </svg>
)

const NotifDot = ({ icon }) => {
  const map = {
    accept:    { bg: 'bg-[#e8f5f0]', color: '#1a7f5e', path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', extra: <circle cx="12" cy="7" r="4" stroke="#1a7f5e" strokeWidth="2" fill="none"/> },
    applicant: { bg: 'bg-[#e8f5f0]', color: '#1a7f5e', path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    message:   { bg: 'bg-[#f3f4f6]', color: '#6b7280', path: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' },
    cancel:    { bg: 'bg-[#fee2e2]', color: '#dc2626', path: null },
    review:    { bg: 'bg-[#f3f4f6]', color: '#6b7280', path: null },
  }
  const m = map[icon] || map.message
  return (
    <div className={`w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0 ${m.bg}`}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="2" strokeLinecap="round">
        {icon === 'accept' && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
        {icon === 'applicant' && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
        {icon === 'message' && <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>}
        {icon === 'cancel' && <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
        {icon === 'review' && <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>}
      </svg>
    </div>
  )
}

export default function Nav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [readIds, setReadIds] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [office, setOffice] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        const [officeRes, notifRes] = await Promise.all([
          fetch(`${API_URL}/api/offices/me`, { headers }),
          fetch(`${API_URL}/api/notifications`, { headers }),
        ])

        if (officeRes.ok) {
          const officeData = await officeRes.json()
          setOffice(officeData)
        }
        if (notifRes.ok) {
          const notifData = await notifRes.json()
          setNotifications(notifData)
        }
      } catch (err) {
        console.error('Nav: failed to fetch data', err)
      }
    }
    fetchData()
  }, [getToken])

  const firstName = office?.firstName || user?.firstName || ''
  const officeName = office?.name || 'My Office'
  const officeInitials = officeName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const isActive = (path) => location.pathname === path

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = (e) => {
    e.stopPropagation()
    setReadIds(notifications.map(n => n.id))
  }

  const handleNotif = (notif) => {
    setReadIds(prev => [...prev, notif.id])
    setShowDropdown(false)
    setNotifOpen(false)
    navigate(notif.path)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const navLinks = [
    { label: 'Dashboard',     path: '/dashboard' },
    { label: 'Applicants',    path: '/applicants' },
    { label: 'Professionals', path: '/professionals' },
    { label: 'Bookings',      path: '/bookings' },
    { label: 'Messages',      path: '/messages' },
  ]

  // ── Dropdown sections ──────────────────────────────
  const accountLinks = [
    {
      label: 'Notifications',
      path: null, // handled inline
      badge: unreadCount > 0 ? unreadCount : null,
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
      isNotif: true,
    },
    {
      label: 'How professionals see me',
      path: '/office-profile',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    },
    {
      label: 'Saved professionals',
      path: '/saved-professionals',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    },
    {
      label: 'Post a shift',
      path: '/post-shift',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    {
      label: 'Posted jobs',
      path: '/applicants',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2"/></svg>,
    },
  ]

  const settingsLinks = [
    {
      label: 'Settings',
      path: '/settings',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    },

    {
      label: 'Help & support',
      path: '/help',
      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    },
  ]

  return (
    <>
      <nav className="bg-white border-b border-[#e5e7eb] h-16 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">

          {/* Logo */}
          <span
            className="text-[#1a7f5e] cursor-pointer"
            style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize: '36px', fontWeight: 900, letterSpacing: '-1px', WebkitTextStroke: '0.5px #1a7f5e' }}
            onClick={() => navigate('/dashboard')}
          >
            kazi.
          </span>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <span key={link.path} onClick={() => navigate(link.path)} className={`text-sm cursor-pointer transition ${isActive(link.path) ? 'font-semibold text-[#1a7f5e]' : 'text-[#6b7280] hover:text-[#1a1a1a]'}`}>
                {link.label}
              </span>
            ))}
          </div>

          {/* Avatar + dropdown */}
          <div className="relative hidden md:block">
            <div
              onClick={() => setShowDropdown(!showDropdown)}
              className="cursor-pointer relative"
            >
              <InitialsAvatar name={firstName} size={40} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#dc2626] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </div>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => { setShowDropdown(false); setNotifOpen(false) }} />
                <div className="absolute right-0 top-12 w-64 bg-white border border-[#e5e7eb] rounded-2xl shadow-xl z-50 overflow-hidden">

                  {/* Office header */}
                  <div className="px-4 py-4 border-b border-[#f3f4f6]">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={officeName} size={36} />
                      <div>
                        <p className="text-[15px] font-semibold text-[#1a1a1a]">{officeName}</p>
                        <p className="text-[12px] text-[#1a7f5e] font-medium">{office?.verified ? '✓ Verified' : 'Complete your profile'}</p>
                      </div>
                    </div>
                    <p onClick={() => { setShowDropdown(false); navigate('/office-profile') }} className="text-[12px] text-[#1a7f5e] font-medium mt-2 cursor-pointer hover:underline">View office profile →</p>
                  </div>

                  {/* Account section */}
                  <div className="py-1.5">
                    <p className="px-4 py-1 text-[10px] font-semibold text-[#d1d5db] uppercase tracking-widest">Account</p>

                    {accountLinks.map((item) => {
                      if (item.isNotif) {
                        return (
                          <div key="notif">
                            <div
                              onClick={() => setNotifOpen(!notifOpen)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer"
                            >
                              <span className="text-[#9ca3af] flex-shrink-0">{item.icon}</span>
                              <span className="flex-1">Notifications</span>
                              {item.badge && (
                                <span className="text-[10px] font-extrabold bg-[#dc2626] text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
                              )}
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                                <polyline points={notifOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
                              </svg>
                            </div>

                            {/* Inline notifications panel */}
                            {notifOpen && (
                              <div className="bg-[#f9f8f6] border-t border-b border-[#f3f4f6]">
                                <div className="flex items-center justify-between px-4 py-2">
                                  <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider">Recent</p>
                                  {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="text-[11px] font-semibold text-[#1a7f5e] hover:underline">Mark all read</button>
                                  )}
                                </div>
                                {notifications.length === 0 ? (
                                  <div className="px-4 py-4 text-center">
                                    <p className="text-[12px] text-[#9ca3af]">No notifications yet</p>
                                  </div>
                                ) : (
                                  notifications.map(notif => {
                                    const isUnread = !notif.read && !readIds.includes(notif.id)
                                    return (
                                      <div
                                        key={notif.id}
                                        onClick={() => handleNotif(notif)}
                                        className={`flex items-start gap-2.5 px-4 py-2.5 cursor-pointer hover:bg-[#f3f4f6] transition border-b border-[#f3f4f6] last:border-0 ${isUnread ? 'bg-[#fafffe]' : ''}`}
                                      >
                                        <NotifDot icon={notif.icon} />
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-[12px] leading-snug mb-0.5 ${isUnread ? 'font-bold text-[#1a1a1a]' : 'font-medium text-[#374151]'}`}>{notif.title}</p>
                                          <p className="text-[11px] text-[#9ca3af]">{notif.time}</p>
                                        </div>
                                        {isUnread && <div className="w-1.5 h-1.5 rounded-full bg-[#1a7f5e] flex-shrink-0 mt-1.5" />}
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            )}
                          </div>
                        )
                      }

                      return (
                        <div
                          key={item.label}
                          onClick={() => { setShowDropdown(false); navigate(item.path) }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer"
                        >
                          <span className="text-[#9ca3af] flex-shrink-0">{item.icon}</span>
                          <span className="flex-1">{item.label}</span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Settings & support */}
                  <div className="py-1.5 border-t border-[#f3f4f6]">
                    <p className="px-4 py-1 text-[10px] font-semibold text-[#d1d5db] uppercase tracking-widest">Settings & support</p>
                    {settingsLinks.map(item => (
                      <div
                        key={item.label}
                        onClick={() => { setShowDropdown(false); navigate(item.path) }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer"
                      >
                        <span className="text-[#9ca3af] flex-shrink-0">{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-[#f3f4f6] py-1.5">
                    <div
                      onClick={async () => { setShowDropdown(false); await signOut(); navigate('/login') }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#ef4444] hover:bg-[#fef2f2] cursor-pointer"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Sign out
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* Mobile button */}
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden relative">
            <InitialsAvatar name={firstName} size={40} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#dc2626] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ── MOBILE MENU ── */}
      {showMobileMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-[#e5e7eb] z-50 shadow-lg max-h-[85vh] overflow-y-auto">

            {/* Office header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e5e7eb]">
              <InitialsAvatar name={officeName} size={44} />
              <div>
                <p className="text-sm font-bold text-[#1a1a1a]">{officeName}</p>
                <p className="text-xs text-[#1a7f5e] font-semibold">{office?.verified ? '✓ Verified' : 'Complete your profile'}</p>
              </div>
            </div>

            {/* Nav links */}
            <div className="py-2 border-b border-[#e5e7eb]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] px-6 py-2">Navigation</p>
              {navLinks.map(link => (
                <div key={link.path} onClick={() => { navigate(link.path); setShowMobileMenu(false) }} className={`px-6 py-3.5 text-[15px] font-medium cursor-pointer ${isActive(link.path) ? 'text-[#1a7f5e] font-semibold' : 'text-[#1a1a1a] hover:bg-[#f9f8f6]'}`}>
                  {link.label}
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div className="py-2 border-b border-[#e5e7eb]">
              <div className="flex items-center justify-between px-6 py-2">
                <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af]">Notifications</p>
                {unreadCount > 0 && <span className="text-[10px] font-extrabold bg-[#dc2626] text-white px-2 py-0.5 rounded-full">{unreadCount} new</span>}
              </div>
              {notifications.length === 0 ? (
                <div className="px-6 py-4 text-center">
                  <p className="text-[13px] text-[#9ca3af]">No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 4).map(notif => {
                  const isUnread = !notif.read && !readIds.includes(notif.id)
                  return (
                    <div key={notif.id} onClick={() => { handleNotif(notif); setShowMobileMenu(false) }} className={`flex items-start gap-3 px-6 py-3 cursor-pointer hover:bg-[#f9f8f6] ${isUnread ? 'bg-[#fafffe]' : ''}`}>
                      <NotifDot icon={notif.icon} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-[13px] leading-snug ${isUnread ? 'font-bold text-[#1a1a1a]' : 'font-medium text-[#374151]'}`}>{notif.title}</p>
                        <p className="text-[11px] text-[#9ca3af]">{notif.time}</p>
                      </div>
                      {isUnread && <div className="w-2 h-2 rounded-full bg-[#1a7f5e] flex-shrink-0 mt-1.5" />}
                    </div>
                  )
                })
              )}
            </div>

            {/* Account */}
            <div className="py-2 border-b border-[#e5e7eb]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] px-6 py-2">Account</p>
              {accountLinks.filter(i => !i.isNotif).map(item => (
                <div key={item.label} onClick={() => { navigate(item.path); setShowMobileMenu(false) }} className="flex items-center gap-3 px-6 py-3.5 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer">
                  <span className="text-[#9ca3af]">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>

            {/* Settings & support */}
            <div className="py-2">
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] px-6 py-2">Settings & support</p>
              {settingsLinks.map(item => (
                <div key={item.label} onClick={() => { navigate(item.path); setShowMobileMenu(false) }} className="flex items-center gap-3 px-6 py-3.5 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer">
                  <span className="text-[#9ca3af]">{item.icon}</span>
                  {item.label}
                </div>
              ))}
              <div onClick={async () => { setShowMobileMenu(false); await signOut(); navigate('/login') }} className="flex items-center gap-3 px-6 py-3.5 text-[15px] font-medium text-red-500 hover:bg-[#f9f8f6] cursor-pointer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </div>
            </div>

          </div>
        </>
      )}
    </>
  )
}
