import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const FAVORITES = [
  { id: 'ed', initials: 'ED', bg: '#e8f5f0', color: '#1a7f5e', name: 'Evolve Dentistry',         type: 'General Dentistry',   distance: '3.2 mi', stars: '4.9', reviews: 38, software: 'Eaglesoft',    lastWorked: 'Feb 12, 2026', shifts: 3 },
  { id: 'cl', initials: 'CL', bg: '#ede9fe', color: '#5b21b6', name: 'Clear Lake Dental',         type: 'Family Dentistry',    distance: '9.4 mi', stars: '5.0', reviews: 51, software: 'Open Dental', lastWorked: 'Jan 8, 2026',  shifts: 1 },
  { id: 'hf', initials: 'HF', bg: '#e8f5f0', color: '#1a7f5e', name: 'Houston Family Dentistry',  type: 'General Dentistry',   distance: '5.3 mi', stars: '4.8', reviews: 29, software: 'Eaglesoft',    lastWorked: 'Dec 3, 2025',  shifts: 2 },
  { id: 'bs', initials: 'BS', bg: '#fef9c3', color: '#92400e', name: 'Bright Smile Dental',       type: 'Cosmetic & General',  distance: '6.8 mi', stars: '4.7', reviews: 22, software: 'Dentrix',      lastWorked: 'Nov 14, 2025', shifts: 1 },
]

export default function FavoriteOffices() {
  const navigate = useNavigate()
  const [favs, setFavs] = useState(FAVORITES)
  const [expanded, setExpanded] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const toggleExpand = (id) => setExpanded(prev => prev === id ? null : id)
  const removeFav = (e, id) => { e.stopPropagation(); setFavs(prev => prev.filter(f => f.id !== id)); showToast('Removed from favorites') }

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">
      <ProviderNav />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[12px] font-semibold px-4 py-2.5 rounded-full z-[300] flex items-center gap-2 shadow-xl whitespace-nowrap">
          <div className="w-4 h-4 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      <div className="max-w-[520px] mx-auto px-3.5 py-5 pb-24">
        <h1 className="text-[20px] font-black text-[#1a1a1a] mb-0.5">Favorite Offices</h1>
        <p className="text-[13px] text-[#9ca3af] mb-4">{favs.length} saved offices</p>

        {favs.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-[16px] p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">No favorite offices yet</p>
            <p className="text-[12px] text-[#9ca3af] mb-4">Save offices you love to quickly find and rebook.</p>
            <button onClick={() => navigate('/provider-find-shifts')} className="bg-[#1a7f5e] text-white font-bold px-5 py-2 rounded-full text-[12px] hover:bg-[#156649] transition border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Browse shifts</button>
          </div>
        ) : (
          favs.map(office => (
            <div key={office.id} className={`bg-white border rounded-[10px] mb-1.5 overflow-hidden transition-all ${expanded === office.id ? 'border-[#1a7f5e]' : 'border-[#e5e7eb]'}`}>

              {/* COLLAPSED ROW */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer" onClick={() => toggleExpand(office.id)}>
                <div className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ background: office.bg, color: office.color }}>{office.initials}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-extrabold text-[#1a1a1a] truncate mb-0.5">{office.name}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#6b7280]">{office.type}</span>
                    <div className="w-[2px] h-[2px] rounded-full bg-[#d1d5db]"/>
                    <span className="text-[11px] text-[#6b7280]">{office.distance}</span>
                    <div className="w-[2px] h-[2px] rounded-full bg-[#d1d5db]"/>
                    <span className="text-[11px] font-semibold text-[#F97316]">★ {office.stars}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={(e) => removeFav(e, office.id)} className="w-[26px] h-[26px] rounded-full flex items-center justify-center border border-[#e5e7eb] hover:border-[#ef4444] hover:text-[#ef4444] transition text-[#ef4444] bg-white cursor-pointer">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                  <div className={`w-[20px] h-[20px] rounded-full bg-[#f3f4f6] flex items-center justify-center transition-transform duration-200 ${expanded === office.id ? 'rotate-180' : ''}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                </div>
              </div>

              {/* EXPANDED DETAIL */}
              {expanded === office.id && (
                <div className="border-t border-[#f3f4f6] px-3 py-3">
                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {[
                      { label: 'Shifts worked', val: office.shifts },
                      { label: 'Last worked',   val: office.lastWorked },
                      { label: 'Software',      val: office.software },
                    ].map(s => (
                      <div key={s.label} className="bg-[#f9f8f6] rounded-[8px] px-2.5 py-2 text-center">
                        <div className="text-[12px] font-bold text-[#1a1a1a] mb-0.5">{s.val}</div>
                        <div className="text-[10px] text-[#9ca3af]">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate('/provider-messages')}
                      className="flex-1 flex items-center justify-center gap-1.5 border border-[#e5e7eb] text-[#374151] font-bold py-2 rounded-full text-[11px] hover:border-[#1a7f5e] transition cursor-pointer bg-white"
                      style={{ fontFamily: 'inherit' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      Message
                    </button>
                    <button
                      onClick={() => navigate('/provider-find-shifts')}
                      className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2 rounded-full text-[11px] transition border-none cursor-pointer"
                      style={{ fontFamily: 'inherit' }}
                    >
                      View shifts
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Mobile toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] z-50">
        <div className="flex">
          {[
            { label: 'Home',        path: '/provider-dashboard',   icon: <HomeIcon /> },
            { label: 'Requests',    path: '/provider-requests',    icon: <ReqIcon />,  badge: 2 },
            { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
            { label: 'Messages',    path: '/provider-messages',    icon: <MsgIcon /> },
            { label: 'Finance',     path: '/provider-earnings',    icon: <EarnIcon /> },
          ].map(({ label, path, icon, badge }) => (
            <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
              <div className="relative">
                <span className="text-[#9ca3af]">{icon}</span>
                {badge && <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{badge}</span>}
              </div>
              <span className="text-[10px] font-semibold text-[#9ca3af]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HomeIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
