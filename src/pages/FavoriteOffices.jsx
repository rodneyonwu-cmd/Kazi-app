import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const favorites = [
  { id: 'ed', initials: 'ED', logoBg: 'bg-[#e8f5f0]', logoColor: 'text-[#1a7f5e]', name: 'Evolve Dentistry', type: 'General Dentistry', distance: '3.2 mi', stars: '★ 4.9', reviews: 38, software: 'Eaglesoft', lastWorked: 'Feb 12, 2026', timesWorked: 3, nextShift: 'Tue Mar 25' },
  { id: 'cl', initials: 'CL', logoBg: 'bg-[#ede9fe]', logoColor: 'text-[#5b21b6]', name: 'Clear Lake Dental', type: 'Family Dentistry', distance: '9.4 mi', stars: '★ 5.0', reviews: 51, software: 'Open Dental', lastWorked: 'Jan 8, 2026', timesWorked: 1, nextShift: 'Wed Mar 26' },
  { id: 'hf', initials: 'HF', logoBg: 'bg-[#e8f5f0]', logoColor: 'text-[#1a7f5e]', name: 'Houston Family Dentistry', type: 'General Dentistry', distance: '5.3 mi', stars: '★ 4.8', reviews: 29, software: 'Eaglesoft', lastWorked: 'Dec 3, 2025', timesWorked: 2, nextShift: null },
  { id: 'bs', initials: 'BS', logoBg: 'bg-[#fef9c3]', logoColor: 'text-[#92400e]', name: 'Bright Smile Dental', type: 'Cosmetic & General', distance: '6.8 mi', stars: '★ 4.7', reviews: 22, software: 'Dentrix', lastWorked: 'Nov 14, 2025', timesWorked: 1, nextShift: null },
]

export default function FavoriteOffices() {
  const navigate = useNavigate()
  const [favs, setFavs] = useState(favorites)

  const removeFav = (id) => setFavs(prev => prev.filter(f => f.id !== id))

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      <ProviderNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button onClick={() => navigate('/provider-dashboard')} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9ca3af] hover:text-[#374151] mb-4 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Favorite Offices</h1>
          <p className="text-[13px] text-[#9ca3af]">{favs.length} saved offices</p>
        </div>

        {favs.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No favorite offices yet</p>
            <p className="text-[13px] text-[#9ca3af] mb-4">Save offices you love to quickly find and book them again.</p>
            <button onClick={() => navigate('/provider-find-shifts')} className="bg-[#1a7f5e] text-white font-bold px-6 py-2.5 rounded-full text-[13px] hover:bg-[#156649] transition">Browse shifts</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {favs.map(office => (
              <div key={office.id} className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 hover:border-[#1a7f5e] transition">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-[13px] ${office.logoBg} flex items-center justify-center text-[13px] font-black ${office.logoColor} flex-shrink-0`}>{office.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[16px] font-black text-[#1a1a1a] mb-0.5">{office.name}</p>
                    <p className="text-[12px] text-[#9ca3af] mb-1">{office.type} · {office.distance}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-[#F97316]">{office.stars}</span>
                      <span className="text-[12px] text-[#9ca3af]">({office.reviews} reviews)</span>
                    </div>
                  </div>
                  <button onClick={() => removeFav(office.id)} className="w-8 h-8 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:border-[#ef4444] hover:text-[#ef4444] transition flex-shrink-0 text-[#9ca3af]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#f9f8f6] rounded-[12px] px-3 py-2.5 text-center">
                    <p className="text-[16px] font-black text-[#1a1a1a]">{office.timesWorked}</p>
                    <p className="text-[11px] text-[#9ca3af]">shifts worked</p>
                  </div>
                  <div className="bg-[#f9f8f6] rounded-[12px] px-3 py-2.5 text-center">
                    <p className="text-[13px] font-bold text-[#1a1a1a]">{office.lastWorked}</p>
                    <p className="text-[11px] text-[#9ca3af]">last worked</p>
                  </div>
                  <div className="bg-[#f9f8f6] rounded-[12px] px-3 py-2.5 text-center">
                    <p className="text-[13px] font-bold text-[#374151]">{office.software}</p>
                    <p className="text-[11px] text-[#9ca3af]">software</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {office.nextShift && (
                    <div className="flex-1 bg-[#e8f5f0] rounded-[10px] px-3 py-2 flex items-center gap-2">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      <span className="text-[12px] font-bold text-[#1a7f5e]">Open shift {office.nextShift}</span>
                    </div>
                  )}
                  <button onClick={() => navigate('/provider-messages')} className="border border-[#e5e7eb] text-[#374151] font-bold px-4 py-2 rounded-full text-[12px] hover:border-[#1a7f5e] transition">Message</button>
                  <button onClick={() => navigate('/provider-find-shifts')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-4 py-2 rounded-full text-[12px] transition">View shifts</button>
                </div>
              </div>
            ))}
          </div>
        )}
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
