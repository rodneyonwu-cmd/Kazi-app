import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import InitialsAvatar from './InitialsAvatar'
import useUnreadMessageCount from '../hooks/useUnreadMessageCount'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const NotifDot = ({ icon }) => {
  const map = {
    accept:    { bg: 'bg-[#e8f5f0]', color: '#1a7f5e' },
    applicant: { bg: 'bg-[#e8f5f0]', color: '#1a7f5e' },
    message:   { bg: 'bg-[#f3f4f6]', color: '#6b7280' },
    cancel:    { bg: 'bg-[#fee2e2]', color: '#dc2626' },
    review:    { bg: 'bg-[#f3f4f6]', color: '#6b7280' },
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

export default function ProviderNav() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { user } = useUser()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const [profile, setProfile] = useState(null)
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [readIds, setReadIds] = useState([])

  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/providers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (err) {
        console.error('Failed to fetch provider profile:', err)
      }
    }
    fetchProfile()
  }, [getToken])

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = await getToken()
        if (!token) return
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
        }
      } catch {}
    }
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [getToken])

  const rawFirst = profile?.firstName || user?.firstName || ''
  const lastName = profile?.lastName || user?.lastName || ''
  const isDentist = profile?.role === 'dentist'
  const firstName = isDentist ? `Dr. ${rawFirst}` : rawFirst
  const displayName = firstName ? `${firstName} ${lastName?.charAt(0) || ''}.` : 'My Account'
  const email = user?.primaryEmailAddress?.emailAddress || profile?.email || ''
  const ROLE_LABELS = { hygienist: 'Dental Hygienist', assistant: 'Dental Assistant', front: 'Front Office', dentist: 'Dentist', specialist: 'Specialist' }
  const rawRole = profile?.role || null
  const roleName = rawRole ? (ROLE_LABELS[rawRole] || rawRole.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')) : null
  const loc = profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : null
  const pendingCount = profile?.stats?.pendingRequests || 0
  const { count: unreadMsgCount } = useUnreadMessageCount()
  const unreadCount = notifications.filter(n => !n.read && !readIds.includes(n.id)).length

  const path = location.pathname

  const navLinks = [
    { label: 'Dashboard',   path: '/provider-dashboard' },
    { label: 'Requests',    path: '/provider-requests', badge: pendingCount > 0 ? pendingCount : null },
    { label: 'Find Shifts', path: '/provider-find-shifts' },
    { label: 'Messages',    path: '/provider-messages', badge: unreadMsgCount > 0 ? unreadMsgCount : null },
  ]

  const markAllRead = (e) => {
    e.stopPropagation()
    setReadIds(notifications.map(n => n.id))
  }

  const handleNotif = (notif) => {
    setReadIds(prev => [...prev, notif.id])
    setOpen(false)
    setNotifOpen(false)
    if (notif.path) navigate(notif.path)
  }

  const accountLinks = [
    { icon: <BellIcon />,   label: 'Notifications',           path: null, isNotif: true, badge: unreadCount > 0 ? unreadCount : null },
    { icon: <UserIcon />,   label: 'How offices view me',     path: '/provider-profile', state: { readOnly: true } },
    { icon: <DocIcon />,    label: 'Documents & Credentials', path: '/provider-documents' },
    { icon: <CalIcon />,    label: 'Availability',            path: '/provider-availability' },
    { icon: <DollarIcon />, label: 'Finance',                 path: '/provider-earnings' },
    { icon: <HeartIcon />,  label: 'Favorite Offices',        path: '/provider-favorites' },
  ]

  const supportLinks = [
    { icon: <SettingsIcon />, label: 'Settings',        path: '/provider-settings' },
    { icon: <HelpIcon />,     label: 'Help Center',     path: '/provider-help' },
    { icon: <ChatIcon />,     label: 'Contact Support', path: null },
  ]

  return (
    <>
    <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center justify-center sticky top-0 z-50">
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-[120px] flex items-center justify-between">

        {/* Logo */}
        <span
          className="cursor-pointer text-[28px] md:text-[36px]"
          style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontWeight: 900, color: '#1a7f5e', letterSpacing: '-1px', WebkitTextStroke: '0.5px #1a7f5e' }}
          onClick={() => navigate('/provider-dashboard')}
        >
          kazi.
        </span>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, path: linkPath, badge }) => (
            <div key={label} className="relative cursor-pointer" onClick={() => navigate(linkPath)}>
              <span className={`text-sm font-normal transition ${path === linkPath ? 'text-[#1a7f5e]' : 'text-[#6b7280] hover:text-[#1a1a1a]'}`}>
                {label}
              </span>
              {path === linkPath && <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-[#1a7f5e]" />}
              {badge && <span className="absolute -top-2 -right-4 bg-[#ef4444] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>}
            </div>
          ))}
        </div>

        {/* Avatar + dropdown */}
        <div className="relative">
          <button
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#f3f4f6] transition cursor-pointer relative border-none bg-transparent"
            onClick={() => setOpen(!open)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#dc2626] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] relative"
            aria-label="Menu"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#dc2626] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setNotifOpen(false) }} />
              <div className="absolute right-0 top-12 w-64 bg-white border border-[#e5e7eb] rounded-2xl shadow-xl z-50 overflow-y-auto max-h-[80vh]">

                {/* Header */}
                <div className="px-4 py-4 border-b border-[#f3f4f6]">
                  <div className="flex items-center gap-3">
                    {user?.imageUrl && !avatarFailed ? (
                      <img src={user.imageUrl} alt={firstName} onError={() => setAvatarFailed(true)} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                    ) : (
                      <InitialsAvatar name={firstName} size={36} />
                    )}
                    <div>
                      <p className="text-[15px] font-semibold text-[#1a1a1a]">{displayName}</p>
                      {email && <p className="text-[11px] text-[#9ca3af] truncate">{email}</p>}
                      <p className="text-[12px]">
                        {roleName && <span className="text-[#1a7f5e]">{roleName}</span>}
                        {roleName && loc && <span className="text-[#9ca3af]"> · </span>}
                        {loc && <span className="text-[#9ca3af]">{loc}</span>}
                        {!roleName && !loc && <span className="text-[#9ca3af]">Complete your profile</span>}
                      </p>
                    </div>
                  </div>
                  <p onClick={() => { setOpen(false); navigate('/provider-profile') }} className="text-[12px] text-[#1a7f5e] font-medium mt-2 cursor-pointer hover:underline">View profile →</p>
                </div>

                {/* Account */}
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
                        onClick={() => { setOpen(false); navigate(item.path, { state: item.state || {} }) }}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer"
                      >
                        <span className="text-[#9ca3af] flex-shrink-0">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Settings & Support */}
                <div className="py-1.5 border-t border-[#f3f4f6]">
                  <p className="px-4 py-1 text-[10px] font-semibold text-[#d1d5db] uppercase tracking-widest">Settings &amp; Support</p>
                  {supportLinks.map(({ icon, label, path: linkPath }) => (
                    <div
                      key={label}
                      onClick={() => { setOpen(false); if (linkPath) navigate(linkPath) }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer"
                    >
                      <span className="text-[#9ca3af] flex-shrink-0">{icon}</span>
                      {label}
                    </div>
                  ))}
                </div>

                {/* Sign out */}
                <div className="border-t border-[#f3f4f6] py-1.5">
                  <div
                    onClick={async () => { setOpen(false); await signOut(); navigate('/login') }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#ef4444] hover:bg-[#fef2f2] cursor-pointer"
                  >
                    <SignOutIcon />
                    Sign out
                  </div>
                </div>

              </div>
            </>
          )}
        </div>

      </div>
    </nav>

    {/* ── MOBILE MENU ── */}
    {showMobileMenu && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
        <div className="fixed top-16 left-0 right-0 bg-white border-b border-[#e5e7eb] z-50 shadow-lg max-h-[85vh] overflow-y-auto">

          {/* Profile header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e5e7eb]">
            {user?.imageUrl && !avatarFailed ? (
              <img src={user.imageUrl} alt={firstName} onError={() => setAvatarFailed(true)} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <InitialsAvatar name={firstName} size={44} />
            )}
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">{displayName}</p>
              <p className="text-xs text-[#1a7f5e] font-semibold">
                {roleName ? roleName : 'Complete your profile'}
                {loc && <span className="text-[#9ca3af] font-medium"> · {loc}</span>}
              </p>
            </div>
          </div>

          {/* Nav links */}
          <div className="py-2 border-b border-[#e5e7eb]">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] px-6 py-2">Navigation</p>
            {navLinks.map(link => (
              <div key={link.path} onClick={() => { navigate(link.path); setShowMobileMenu(false) }} className={`px-6 py-3.5 text-[15px] font-medium cursor-pointer ${path === link.path ? 'text-[#1a7f5e] font-semibold' : 'text-[#1a1a1a] hover:bg-[#f9f8f6]'}`}>
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
              <div key={item.label} onClick={() => { navigate(item.path, { state: item.state || {} }); setShowMobileMenu(false) }} className="flex items-center gap-3 px-6 py-3.5 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer">
                <span className="text-[#9ca3af]">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* Settings & support */}
          <div className="py-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] px-6 py-2">Settings & support</p>
            {supportLinks.map(({ icon, label, path: linkPath }) => (
              <div key={label} onClick={() => { if (linkPath) navigate(linkPath); setShowMobileMenu(false) }} className="flex items-center gap-3 px-6 py-3.5 text-[15px] font-medium text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer">
                <span className="text-[#9ca3af]">{icon}</span>
                {label}
              </div>
            ))}
            <div onClick={async () => { setShowMobileMenu(false); await signOut(); navigate('/login') }} className="flex items-center gap-3 px-6 py-3.5 text-[15px] font-medium text-red-500 hover:bg-[#f9f8f6] cursor-pointer">
              <SignOutIcon />
              Sign out
            </div>
          </div>

        </div>
      </>
    )}
    </>
  )
}

function BellIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> }
function UserIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function DocIcon()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function CalIcon()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function DollarIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
function HeartIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> }
function SettingsIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function HelpIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
function ChatIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function SignOutIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
