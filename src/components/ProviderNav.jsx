import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ProviderNav() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const [open, setOpen] = useState(false)

  const path = location.pathname

  const navLinks = [
    { label: 'Dashboard',   path: '/provider-dashboard' },
    { label: 'Requests',    path: '/provider-requests', badge: 2 },
    { label: 'Find Shifts', path: '/provider-find-shifts' },
    { label: 'Messages',    path: '/provider-messages' },
  ]

  const accountLinks = [
    { icon: <UserIcon />,   label: 'How offices view me',    path: '/provider-profile', state: { readOnly: true } },
    { icon: <DocIcon />,    label: 'Documents & Credentials', path: '/provider-documents', badge: '1 expiring' },
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
    <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center justify-center sticky top-0 z-50">
      <div className="w-full max-w-[1280px] mx-auto px-[120px] flex items-center justify-between">

        {/* Logo */}
        <span
          className="cursor-pointer"
          style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", fontSize: '36px', fontWeight: 900, color: '#1a7f5e', letterSpacing: '-1px', WebkitTextStroke: '0.5px #1a7f5e' }}
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
          <div
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-[#e5e7eb] hover:border-[#1a7f5e] transition"
            onClick={() => setOpen(!open)}
          >
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah" className="w-full h-full object-cover" />
          </div>

          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-12 w-60 bg-white border border-[#e5e7eb] rounded-2xl shadow-xl z-50 overflow-y-auto max-h-[80vh]">

                {/* Header */}
                <div className="px-4 py-4 border-b border-[#f3f4f6]">
                  <div className="flex items-center gap-3">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    <div>
                      <p className="text-[15px] font-semibold text-[#1a1a1a]">Sarah R.</p>
                      <p className="text-[12px] text-[#1a7f5e]">Dental Hygienist · <span className="text-[#9ca3af]">Houston, TX</span></p>
                    </div>
                  </div>
                  <p onClick={() => { setOpen(false); navigate('/provider-profile') }} className="text-[12px] text-[#1a7f5e] font-medium mt-2 cursor-pointer hover:underline">View profile →</p>
                </div>

                {/* Account */}
                <div className="py-1.5">
                  <p className="px-4 py-1 text-[10px] font-semibold text-[#d1d5db] uppercase tracking-widest">Account</p>
                  {accountLinks.map(({ icon, label, path: linkPath, badge, state }) => (
                    <div
                      key={label}
                      onClick={() => { setOpen(false); navigate(linkPath, { state: state || {} }) }}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer"
                    >
                      <span className="text-[#9ca3af] flex-shrink-0">{icon}</span>
                      <span className="flex-1">{label}</span>
                      {badge && <span className="text-[10px] font-bold bg-[#fee2e2] text-[#ef4444] px-2 py-0.5 rounded-full">{badge}</span>}
                    </div>
                  ))}
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
                    onClick={() => { setOpen(false); navigate('/login') }}
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
  )
}

function UserIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function DocIcon()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> }
function CalIcon()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function DollarIcon()   { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
function TaxIcon()      { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> }
function HeartIcon()    { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> }
function SettingsIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> }
function HelpIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> }
function ChatIcon()     { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function SignOutIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
