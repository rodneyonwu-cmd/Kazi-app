import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const nearbyShifts = [
  {
    id: 'ed',
    initials: 'ED',
    logoBg: 'bg-[#e8f5f0]',
    logoColor: 'text-[#1a7f5e]',
    name: 'Evolve Dentistry',
    date: 'Tue Mar 25',
    distance: '3.2 mi away',
    rate: 52,
    time: '8:00 AM – 5:00 PM',
    tags: [{ label: 'Instant Pay', style: 'bg-[#fef9c3] text-[#92400e]' }],
  },
  {
    id: 'bs',
    initials: 'BS',
    logoBg: 'bg-[#fef9c3]',
    logoColor: 'text-[#92400e]',
    name: 'Bright Smile Dental',
    date: 'Mon Mar 24',
    distance: '6.8 mi away',
    rate: 58,
    time: '9:00 AM – 4:00 PM',
    tags: [{ label: 'Today only', style: 'bg-[#fee2e2] text-[#991b1b]' }],
  },
  {
    id: 'cl',
    initials: 'CL',
    logoBg: 'bg-[#ede9fe]',
    logoColor: 'text-[#5b21b6]',
    name: 'Clear Lake Dental',
    date: 'Wed Mar 26',
    distance: '9.4 mi away',
    rate: 65,
    time: '7:30 AM – 4:30 PM',
    tags: [{ label: 'Instant Pay', style: 'bg-[#fef9c3] text-[#92400e]' }],
  },
]

export default function ProviderDashboard() {
  const navigate = useNavigate()
  const [zip, setZip] = useState('77001')
  const [distance, setDistance] = useState('Within 25 miles')
  const [searchDate, setSearchDate] = useState('')

  const handleSearch = () => {
    const distNum = distance.replace(/\D/g, '') || '25'
    const params = new URLSearchParams({ zip, distance: distNum })
    if (searchDate) params.set('date', searchDate)
    navigate(`/provider/find-shifts?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      {/* ── NAV ── */}
      <ProviderNav />

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Profile card */}
        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Sarah R."
                className="w-20 h-20 rounded-full object-cover border-[3px] border-[#e5e7eb]"
              />
              <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-[#5b21b6] border-[2.5px] border-white flex items-center justify-center">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[20px] font-black text-[#1a1a1a] tracking-tight mb-1">Good morning, Sarah 👋</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-bold text-[#1a7f5e]">Dental Hygienist</span>
                <span className="text-[#e5e7eb]">·</span>
                <span className="text-[13px] text-[#9ca3af]">Houston, TX</span>
                <span className="text-[#e5e7eb]">·</span>
                <span className="text-[13px] text-[#9ca3af]">Tuesday, Mar 24</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/provider-dashboard')}
              className="border border-[#e5e7eb] bg-white text-[#374151] rounded-full px-3.5 py-1.5 text-[12px] font-bold hover:border-[#1a7f5e] transition whitespace-nowrap"
            >
              Edit profile
            </button>
          </div>

          <div className="h-px bg-[#f3f4f6] mb-5" />

          {/* Stats row */}
          <div className="grid grid-cols-4">
            {[
              { value: '★ 4.9', label: 'Rating', color: 'text-[#F97316]' },
              { value: '98%', label: 'Reliability', color: 'text-[#1a1a1a]' },
              { value: '147', label: 'Total shifts', color: 'text-[#1a1a1a]' },
              { value: '100%', label: 'Profile strength', color: 'text-[#1a7f5e]' },
            ].map(({ value, label, color }, i, arr) => (
              <div
                key={label}
                className={`text-center px-2 ${i < arr.length - 1 ? 'border-r border-[#f3f4f6]' : ''}`}
              >
                <p className={`text-[22px] font-bold ${color} mb-0.5`}>{value}</p>
                <p className="text-[13px] text-[#9ca3af]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search hero */}
        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 mb-5">
          <p className="text-[16px] font-black text-[#1a1a1a] mb-1">Find your next opportunity</p>
          <p className="text-[13px] text-[#9ca3af] mb-4">Shifts and jobs near you matching your license</p>

          <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_1fr_auto] gap-2 items-center">
            {/* ZIP */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="text"
                value={zip}
                onChange={e => setZip(e.target.value)}
                maxLength={5}
                placeholder="ZIP code"
                className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl pl-8 pr-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a7f5e] transition"
              />
            </div>

            {/* Distance */}
            <div className="relative">
              <select
                value={distance}
                onChange={e => setDistance(e.target.value)}
                className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5 text-[14px] text-[#374151] outline-none focus:border-[#1a7f5e] transition appearance-none cursor-pointer"
              >
                {['Within 10 miles', 'Within 15 miles', 'Within 25 miles', 'Within 40 miles', 'Within 60 miles'].map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Date */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
                className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl pl-8 pr-3 py-2.5 text-[14px] text-[#374151] outline-none focus:border-[#1a7f5e] transition cursor-pointer appearance-none"
              />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-xl text-[14px] transition whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Quick actions</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            onClick={() => navigate('/provider-schedule')}
            className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 cursor-pointer hover:border-[#1a7f5e] transition"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">My schedule</p>
            <p className="text-[13px] text-[#9ca3af]">3 upcoming shifts</p>
          </div>

          <div
            onClick={() => navigate('/provider-requests')}
            className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 cursor-pointer hover:border-[#1a7f5e] transition relative"
          >
            <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">2</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">Shift Requests</p>
            <p className="text-[13px] font-bold text-[#1a7f5e]">2 pending</p>
          </div>
        </div>

        {/* Shifts near me */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px] font-black text-[#1a1a1a]">Shifts near me</p>
          <button
            onClick={() => navigate('/provider-find-shifts')}
            className="text-[13px] font-bold text-[#1a7f5e] hover:underline"
          >
            See all
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {nearbyShifts.map(shift => (
            <div
              key={shift.id}
              onClick={() => navigate(`/provider/find-shifts?shift=${shift.id}`)}
              className="bg-white border border-[#e5e7eb] rounded-[16px] px-4 py-3.5 cursor-pointer hover:border-[#1a7f5e] transition"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className={`w-10 h-10 rounded-[11px] ${shift.logoBg} flex items-center justify-center text-[11px] font-black ${shift.logoColor} flex-shrink-0`}>
                  {shift.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1a1a1a] mb-0.5">{shift.name}</p>
                  <p className="text-[12px] text-[#9ca3af]">{shift.date} · {shift.distance}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[17px] font-black text-[#1a1a1a]">${shift.rate}</span>
                  <span className="text-[12px] text-[#9ca3af]">/hr</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {shift.tags.map(tag => (
                  <span key={tag.label} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${tag.style}`}>
                    {tag.label}
                  </span>
                ))}
                <span className="text-[12px] text-[#6b7280] font-medium">{shift.time}</span>
                <button
                  onClick={e => { e.stopPropagation(); navigate(`/provider/find-shifts?shift=${shift.id}`) }}
                  className="ml-auto bg-[#1a7f5e] hover:bg-[#156649] text-white text-[12px] font-bold px-4 py-1.5 rounded-full transition"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MOBILE BOTTOM TOOLBAR ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home', path: '/provider-dashboard', active: true, icon: <HomeIcon /> },
          { label: 'Requests', path: '/provider-requests', icon: <RequestsIcon />, badge: 2 },
          { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
          { label: 'Messages', path: '/provider-messages', icon: <MessageIcon /> },
          { label: 'Earnings', path: '/provider-earnings', icon: <EarningsIcon /> },
        ].map(({ label, path, active, icon, badge }) => (
          <div
            key={label}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer"
          >
            <div className="relative">
              <span className={active ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}>{icon}</span>
              {badge && (
                <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-${active ? '700' : '600'} ${active ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ICON COMPONENTS ──────────────────────────────────────────
function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function DocIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
}
function CalIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function DollarIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
function TaxIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}
function HeartIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
}
function SettingsIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
}
function HelpIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
function ChatIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function SignOutIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
function HomeIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function RequestsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
}
function SearchIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function MessageIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function EarningsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
