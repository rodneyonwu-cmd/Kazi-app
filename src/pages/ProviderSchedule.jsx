import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['SU','MO','TU','WE','TH','FR','SA']

const bookedDays  = [10, 14, 17, 20, 25, 28]
const pendingDays = [31]
const availWeekdays = [1, 2, 3, 5]

const upcomingShifts = [
  { office: 'Evolve Dentistry',    role: 'Dental Hygienist', pay: '$468', status: 'Confirmed', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]',  date: 'Wed Mar 25', time: '8:00 AM – 5:00 PM', dist: '3.2 mi' },
  { office: 'Clear Lake Dental',   role: 'Dental Hygienist', pay: '$585', status: 'Confirmed', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]',  date: 'Fri Mar 28', time: '7:30 AM – 4:30 PM', dist: '9.4 mi' },
  { office: 'Bright Smile Dental', role: 'Dental Hygienist', pay: '$406', status: 'Pending',   statusStyle: 'bg-[#fef9c3] text-[#92400e]', date: 'Mon Mar 31', time: '9:00 AM – 4:00 PM', dist: '6.8 mi' },
]

const availability = [
  { day: 'Monday',    time: '8:00 AM – 5:00 PM', on: true  },
  { day: 'Tuesday',   time: '8:00 AM – 5:00 PM', on: true  },
  { day: 'Wednesday', time: '8:00 AM – 5:00 PM', on: true  },
  { day: 'Thursday',  time: null,                 on: false },
  { day: 'Friday',    time: '7:00 AM – 3:00 PM', on: true  },
  { day: 'Saturday',  time: null,                 on: false },
  { day: 'Sunday',    time: null,                 on: false },
]

export default function ProviderSchedule() {
  const navigate = useNavigate()
  const today    = new Date()
  const [monthIdx, setMonthIdx] = useState(today.getMonth())
  const [year,     setYear]     = useState(today.getFullYear())
  const [excList,  setExcList]  = useState([
    { id: 1, color: 'bg-[#ef4444]', label: 'Apr 7 – Apr 11', sub: 'Unavailable · Spring vacation' },
    { id: 2, color: 'bg-[#1a7f5e]', label: 'Apr 19',         sub: 'Available · 7:00 AM – 1:00 PM' },
  ])

  const changeMonth = (delta) => {
    let m = monthIdx + delta, y = year
    if (m > 11) { m = 0;  y++ }
    if (m <  0) { m = 11; y-- }
    setMonthIdx(m); setYear(y)
  }

  const firstDay    = new Date(year, monthIdx, 1).getDay()
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const daysInPrev  = new Date(year, monthIdx, 0).getDate()
  const isCurrent   = today.getFullYear() === year && today.getMonth() === monthIdx
  const total       = firstDay + daysInMonth
  const trailing    = total % 7 === 0 ? 0 : 7 - (total % 7)

  const getDayStyle = (d) => {
    const dow      = new Date(year, monthIdx, d).getDay()
    const isToday  = isCurrent && d === today.getDate()
    const isBooked = bookedDays.includes(d)
    const isPend   = pendingDays.includes(d)
    const isAvail  = availWeekdays.includes(dow) && !isBooked && !isPend
    if (isToday)          return 'bg-[#1a7f5e] text-white font-black'
    if (isBooked || isPend) return 'bg-[#fef3c7] text-[#d97706] font-bold'
    if (isAvail)          return 'bg-[#d1fae5] text-[#065f46] font-semibold'
    return 'text-[#6b7280]'
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      <ProviderNav />

      {/* PAGE CONTENT */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Availability</h1>
          <p className="text-[13px] text-[#9ca3af]">Your schedule and availability for offices</p>
        </div>

        {/* Two-column layout: left = calendar + shifts, right = sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-5 items-start">

          {/* LEFT */}
          <div>
            {/* Calendar */}
            <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:border-[#1a7f5e] transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <p className="text-[15px] font-black text-[#1a1a1a]">{MONTHS[monthIdx]} {year}</p>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:border-[#1a7f5e] transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              </div>

              <div className="grid grid-cols-7 mb-1">
                {DAYS.map(d => <div key={d} className="text-center text-[11px] font-bold text-[#9ca3af] pb-2 tracking-wide">{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`p${i}`} className="text-center py-2 text-[13px] text-[#d1d5db]">{daysInPrev - firstDay + i + 1}</div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1
                  return (
                    <div key={d} className={`text-center py-2 mx-0.5 rounded-[10px] text-[13px] cursor-pointer transition ${getDayStyle(d)}`}>
                      {d}
                    </div>
                  )
                })}
                {Array.from({ length: trailing }, (_, i) => (
                  <div key={`t${i}`} className="text-center py-2 text-[13px] text-[#d1d5db]">{i + 1}</div>
                ))}
              </div>

              <div className="flex gap-5 mt-4 pt-4 border-t border-[#f3f4f6] flex-wrap">
                {[{ color: 'bg-[#1a7f5e]', label: 'Available' }, { color: 'bg-[#d97706]', label: 'Booked' }, { color: 'bg-[#d1d5db]', label: 'Unavailable' }].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-[13px] text-[#374151]">{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[12px] text-[#9ca3af] italic mt-2">Tap an available date to send a booking request</p>
            </div>

            {/* Upcoming shifts */}
            <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Upcoming shifts</p>
            <div className="flex flex-col gap-3">
              {upcomingShifts.map((s, i) => (
                <div key={i} className="bg-white border border-[#e5e7eb] rounded-[16px] p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[15px] font-black text-[#1a1a1a]">{s.office}</p>
                      <p className="text-[12px] text-[#9ca3af]">{s.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[15px] font-black text-[#1a7f5e]">{s.pay} <span className="text-[11px] font-medium text-[#9ca3af]">est.</span></p>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.statusStyle}`}>{s.status}</span>
                    </div>
                  </div>
                  <div className="flex gap-4 text-[12px] text-[#9ca3af] flex-wrap">
                    <span className="flex items-center gap-1"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{s.date}</span>
                    <span className="flex items-center gap-1"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{s.time}</span>
                    <span className="flex items-center gap-1"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{s.dist}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="flex flex-col gap-4">

            {/* My Availability */}
            <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[15px] font-black text-[#1a1a1a]">My Availability</p>
                <button className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">Edit hours</button>
              </div>
              <p className="text-[12px] text-[#9ca3af] mb-3">Your regular weekly hours shown to offices.</p>
              <div className="flex flex-col">
                {availability.map(({ day, time, on }, i) => (
                  <div key={day} className={`flex items-center justify-between py-2 ${i < availability.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}>
                    <span className={`text-[16px] ${on ? 'font-medium text-[#1a1a1a]' : 'font-normal text-[#9ca3af]'}`}>{day}</span>
                    <span className={`text-[15px] ${on ? 'font-normal text-[#1a7f5e]' : 'text-[#9ca3af]'}`}>{on ? time : 'Unavailable'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Date exceptions */}
            <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[15px] font-black text-[#1a1a1a]">Date exceptions</p>
                <button className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">+ Add</button>
              </div>
              <p className="text-[12px] text-[#9ca3af] mb-3">Block dates or add one-off availability.</p>
              <div className="flex flex-col gap-3">
                {excList.map((exc, i) => (
                  <div key={exc.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${exc.color}`} />
                        <div>
                          <p className="text-[14px] font-bold text-[#1a1a1a]">{exc.label}</p>
                          <p className="text-[12px] text-[#9ca3af]">{exc.sub}</p>
                        </div>
                      </div>
                      <button onClick={() => setExcList(prev => prev.filter(e => e.id !== exc.id))} className="text-[#9ca3af] hover:text-[#374151] text-lg leading-none ml-2">×</button>
                    </div>
                    {i < excList.length - 1 && <div className="h-px bg-[#f3f4f6] mt-3" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Travel radius */}
            <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[15px] font-black text-[#1a1a1a]">Travel Radius</p>
                <button className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">Update</button>
              </div>
              <p className="text-[32px] font-black text-[#1a1a1a] mb-0.5">25 <span className="text-[16px] font-semibold text-[#9ca3af]">miles</span></p>
              <p className="text-[13px] text-[#9ca3af] mb-3">From Houston, TX 77001</p>
              <div className="h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden mb-1">
                <div className="h-full w-1/2 bg-[#1a7f5e] rounded-full" />
              </div>
              <div className="flex justify-between text-[10px] text-[#d1d5db] font-semibold">
                <span>5 mi</span><span>50 mi</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MOBILE TOOLBAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home',        path: '/provider-dashboard',   icon: <HomeIcon /> },
          { label: 'Requests',    path: '/provider-requests',    icon: <ReqIcon />, badge: 2 },
          { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
          { label: 'Messages',    path: '/provider-messages',    icon: <MsgIcon /> },
          { label: 'Earnings',    path: '/provider-earnings',    icon: <EarnIcon /> },
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
  )
}

function HomeIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
