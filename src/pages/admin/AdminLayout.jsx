import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { ToastProvider } from './ToastContext'

const NAV = [
  { section: 'Overview', items: [
    { label: 'Dashboard',    path: '/admin',                 icon: <GridIcon /> },
    { label: 'Analytics',   path: '/admin/analytics',       icon: <BarIcon /> },
  ]},
  { section: 'Users', items: [
    { label: 'Users',                path: '/admin/users',        icon: <UsersIcon /> },
    { label: 'Verification Queue',   path: '/admin/verification', icon: <ShieldIcon />, badge: '4' },
    { label: 'Flags & Safety',       path: '/admin/flags',        icon: <FlagIcon />,   badge: '3', badgeColor: 'bg-[#f59e0b]' },
  ]},
  { section: 'Operations', items: [
    { label: 'Shifts',            path: '/admin/shifts',   icon: <CalIcon /> },
    { label: 'Review Moderation', path: '/admin/reviews',  icon: <StarIcon /> },
  ]},
  { section: 'Finance', items: [
    { label: 'Billing & Subscriptions', path: '/admin/billing', icon: <CardIcon /> },
  ]},
  { section: 'Support', items: [
    { label: 'Support Tickets',  path: '/admin/tickets',   icon: <ChatIcon />, badge: '2' },
    { label: 'Announcements',    path: '/admin/announce',  icon: <BellIcon /> },
  ]},
  { section: 'System', items: [
    { label: 'Audit Log', path: '/admin/audit', icon: <DocIcon /> },
  ]},
]

const TITLES = {
  '/admin':                'Dashboard',
  '/admin/analytics':      'Analytics',
  '/admin/users':          'Users',
  '/admin/verification':   'Verification Queue',
  '/admin/flags':          'Flags & Safety',
  '/admin/shifts':         'Shifts',
  '/admin/reviews':        'Review Moderation',
  '/admin/billing':        'Billing & Subscriptions',
  '/admin/tickets':        'Support Tickets',
  '/admin/announce':       'Announcements',
  '/admin/audit':          'Audit Log',
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const title = TITLES[location.pathname] || 'Admin'

  return (
    <ToastProvider>
      <div className="flex min-h-screen" style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", background: '#f0f0ee' }}>

        {/* SIDEBAR */}
        <aside className="w-[230px] flex-shrink-0 bg-[#111] flex flex-col fixed top-0 left-0 bottom-0 z-50 overflow-y-auto">
          {/* Logo */}
          <div className="px-[18px] py-[22px] border-b border-[#222]">
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 900, color: '#1a7f5e', letterSpacing: '-1px' }}>kazi.</div>
            <div className="text-[9px] font-bold text-[#555] tracking-[.12em] uppercase mt-0.5">Admin Console</div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-2">
            {NAV.map(group => (
              <div key={group.section}>
                <div className="px-[10px] py-[10px] pb-1 text-[9px] font-extrabold text-[#444] uppercase tracking-[.1em]">{group.section}</div>
                <div className="px-[10px] flex flex-col gap-[1px]">
                  {group.items.map(item => {
                    const active = location.pathname === item.path
                    return (
                      <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-[9px] px-[10px] py-[9px] rounded-[8px] cursor-pointer transition-all text-[13px] font-semibold ${active ? 'bg-[#1a7f5e] text-white' : 'text-[#888] hover:bg-[#1a1a1a] hover:text-[#ccc]'}`}
                      >
                        <span style={{ opacity: active ? 1 : 0.8, flexShrink: 0 }}>{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className={`text-[9px] font-extrabold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${item.badgeColor || 'bg-[#ef4444]'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-[10px] border-t border-[#1a1a1a]">
            <div className="flex items-center gap-[10px] px-[10px] py-2 rounded-[8px] bg-[#1a1a1a]">
              <div className="w-[30px] h-[30px] rounded-full bg-[#1a7f5e] text-white text-[10px] font-extrabold flex items-center justify-center flex-shrink-0">AD</div>
              <div>
                <div className="text-[12px] font-bold text-[#ddd]">Admin</div>
                <div className="text-[10px] text-[#555]">Super Admin</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div className="ml-[230px] flex-1 flex flex-col min-h-screen">
          {/* Topbar */}
          <div className="bg-white border-b border-[#e5e7eb] h-[54px] flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="text-[15px] font-extrabold text-[#1a1a1a]">{title}</div>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 bg-[#f9f8f6] border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Search users, shifts, tickets..." className="bg-transparent border-none outline-none text-[13px] text-[#1a1a1a] w-[180px] placeholder-[#9ca3af]" style={{ fontFamily: 'inherit' }}/>
              </div>
              <button
                onClick={() => alert('Exporting data...')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-bold border border-[#e5e7eb] bg-white text-[#374151] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition"
                style={{ fontFamily: 'inherit' }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export
              </button>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </ToastProvider>
  )
}

function GridIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function BarIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> }
function UsersIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function ShieldIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
function FlagIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg> }
function CalIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function StarIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
function CardIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> }
function ChatIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function BellIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> }
function DocIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> }
