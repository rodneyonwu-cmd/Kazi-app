import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const allTempShifts = [
  { id: 'ed', initials: 'ED', logoBg: 'bg-[#e8f5f0]', logoColor: 'text-[#1a7f5e]', name: 'Evolve Dentistry', stars: '★ 4.9', reviews: 38, distance: '3.2 mi', rate: 52, estPay: '$468', date: 'Tue Mar 25', time: '8:00 AM – 5:00 PM', role: 'Dental Hygienist', parking: 'Free on-site', software: 'Eaglesoft', badges: [{ label: 'Instant Pay', style: 'bg-[#fef9c3] text-[#92400e]' }, { label: 'Eaglesoft', style: 'bg-[#f3f4f6] text-[#374151]' }] },
  { id: 'bs', initials: 'BS', logoBg: 'bg-[#fef9c3]', logoColor: 'text-[#92400e]', name: 'Bright Smile Dental', stars: '★ 4.7', reviews: 22, distance: '6.8 mi', rate: 58, estPay: '$406', date: 'Mon Mar 24', time: '9:00 AM – 4:00 PM', role: 'Dental Hygienist', parking: 'Street parking', software: 'Dentrix', badges: [{ label: 'Dentrix', style: 'bg-[#f3f4f6] text-[#374151]' }] },
  { id: 'cl', initials: 'CL', logoBg: 'bg-[#ede9fe]', logoColor: 'text-[#5b21b6]', name: 'Clear Lake Dental', stars: '★ 5.0', reviews: 51, distance: '9.4 mi', rate: 65, estPay: '$585', date: 'Wed Mar 26', time: '7:30 AM – 4:30 PM', role: 'Dental Hygienist', parking: 'Free on-site', software: 'Open Dental', badges: [{ label: 'Instant Pay', style: 'bg-[#fef9c3] text-[#92400e]' }, { label: 'Open Dental', style: 'bg-[#f3f4f6] text-[#374151]' }] },
  { id: 'pd', initials: 'PD', logoBg: 'bg-[#fce7f3]', logoColor: 'text-[#9d174d]', name: 'Pearland Dental', stars: '★ 4.8', reviews: 33, distance: '14.1 mi', rate: 54, estPay: '$432', date: 'Thu Mar 27', time: '8:00 AM – 4:00 PM', role: 'Dental Hygienist', parking: 'Free on-site', software: 'Curve Dental', badges: [{ label: 'Curve Dental', style: 'bg-[#f3f4f6] text-[#374151]' }] },
  { id: 'sw', initials: 'SW', logoBg: 'bg-[#d1fae5]', logoColor: 'text-[#065f46]', name: 'Smiles of the Woodlands', stars: '★ 4.6', reviews: 19, distance: '22.5 mi', rate: 60, estPay: '$480', date: 'Fri Mar 28', time: '7:30 AM – 3:30 PM', role: 'Dental Hygienist', parking: 'Garage parking', software: 'Dentrix', badges: [{ label: 'Instant Pay', style: 'bg-[#fef9c3] text-[#92400e]' }, { label: 'Dentrix', style: 'bg-[#f3f4f6] text-[#374151]' }] },
  { id: 'sl', initials: 'SL', logoBg: 'bg-[#fee2e2]', logoColor: 'text-[#991b1b]', name: 'Sugar Land Smiles', stars: '★ 4.9', reviews: 41, distance: '18.7 mi', rate: 62, estPay: '$558', date: 'Mon Mar 31', time: '8:00 AM – 5:00 PM', role: 'Dental Hygienist', parking: 'Free on-site', software: 'Eaglesoft', badges: [{ label: 'Eaglesoft', style: 'bg-[#f3f4f6] text-[#374151]' }] },
]

const permJobs = [
  { id: 'hf', initials: 'HF', logoBg: 'bg-[#e8f5f0]', logoColor: 'text-[#1a7f5e]', office: 'Houston Family Dentistry', title: 'Dental Hygienist', stars: '★ 4.8', reviews: 29, distance: '5.3 mi', pay: '$68–$75', type: 'Full-time', schedule: 'Mon – Fri · 8:00 AM – 5:00 PM', posted: '2 days ago', applicants: 14, badges: [{ label: 'Full-time', style: 'bg-[#e8f5f0] text-[#1a7f5e]' }, { label: 'Eaglesoft', style: 'bg-[#f3f4f6] text-[#374151]' }, { label: 'Signing bonus', style: 'bg-[#fef9c3] text-[#92400e]' }], benefits: ['Health insurance', '401(k)', 'PTO', 'Dental coverage'] },
  { id: 'kd', initials: 'KD', logoBg: 'bg-[#fef9c3]', logoColor: 'text-[#92400e]', office: 'Katy Dental Group', title: 'Dental Hygienist', stars: '★ 4.6', reviews: 17, distance: '18.2 mi', pay: '$60–$68', type: 'Part-time', schedule: 'Tue, Thu, Fri · Flexible', posted: '5 days ago', applicants: 6, badges: [{ label: 'Part-time', style: 'bg-[#ede9fe] text-[#5b21b6]' }, { label: 'Open Dental', style: 'bg-[#f3f4f6] text-[#374151]' }], benefits: ['Flexible schedule', 'PTO', 'CE reimbursement'] },
  { id: 'md', initials: 'MD', logoBg: 'bg-[#ede9fe]', logoColor: 'text-[#5b21b6]', office: 'Memorial Dental Associates', title: 'Dental Hygienist', stars: '★ 4.9', reviews: 44, distance: '8.7 mi', pay: '$72–$80', type: 'Full-time', schedule: 'Mon – Fri · 7:30 AM – 4:30 PM', posted: '1 week ago', applicants: 31, badges: [{ label: 'Full-time', style: 'bg-[#e8f5f0] text-[#1a7f5e]' }, { label: 'Curve Dental', style: 'bg-[#f3f4f6] text-[#374151]' }], benefits: ['Health + dental + vision', '401(k) match', 'Paid holidays', 'Signing bonus'] },
  { id: 'pd2', initials: 'PD', logoBg: 'bg-[#fce7f3]', logoColor: 'text-[#9d174d]', office: 'Premier Dental Houston', title: 'Dental Hygienist', stars: '★ 4.7', reviews: 26, distance: '11.2 mi', pay: '$65–$72', type: 'Full-time', schedule: 'Mon – Fri · 8:00 AM – 5:00 PM', posted: '3 days ago', applicants: 9, badges: [{ label: 'Full-time', style: 'bg-[#e8f5f0] text-[#1a7f5e]' }, { label: 'Dentrix', style: 'bg-[#f3f4f6] text-[#374151]' }], benefits: ['Health insurance', 'PTO', 'Paid holidays'] },
]

const CARDS_PER_PAGE = 6

export default function FindShifts() {
  const navigate = useNavigate()
  const [shiftType, setShiftType] = useState('temp')
  const [filterDate, setFilterDate] = useState('')
  const [filterZip, setFilterZip] = useState('77001')
  const [filterDist, setFilterDist] = useState('Within 25 miles')
  const [filterMinPay, setFilterMinPay] = useState('')
  const [filterPosted, setFilterPosted] = useState('Last 7 days')
  const [sortBy, setSortBy] = useState('Newest')
  const [applied, setApplied] = useState([])
  const [page, setPage] = useState(1)
  const [selectedShift, setSelectedShift] = useState(null)
  const [selectedPerm, setSelectedPerm] = useState(null)

  const totalPages = shiftType === 'temp' ? 4 : 2

  const handleApply = (id) => setApplied(prev => [...prev, id])

  const formatDate = (val) => {
    if (!val) return ''
    const d = new Date(val + 'T12:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      <ProviderNav />

      <div className="max-w-[960px] mx-auto px-4 py-6">

        {/* Header */}
        <div className="mb-5">
          <h1 className="text-[22px] font-black text-[#1a1a1a]">Find Shifts</h1>
          <p className="text-[13px] text-[#9ca3af] mt-0.5">Houston, TX</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-[#f3f4f6] rounded-full p-1 w-fit gap-1 mb-5">
          <button onClick={() => { setShiftType('temp'); setPage(1) }} className={`px-5 py-2 rounded-full text-[13px] font-bold transition ${shiftType === 'temp' ? 'bg-[#1a7f5e] text-white' : 'text-[#6b7280]'}`}>Temp shifts</button>
          <button onClick={() => { setShiftType('perm'); setPage(1) }} className={`px-5 py-2 rounded-full text-[13px] font-bold transition ${shiftType === 'perm' ? 'bg-[#1a7f5e] text-white' : 'text-[#6b7280]'}`}>Permanent</button>
        </div>

        {/* Two-column layout — desktop only */}
        <div className="flex flex-col md:flex-row gap-5 items-start">

          {/* FILTER SIDEBAR — desktop only */}
          <div className="hidden md:block w-[220px] flex-shrink-0 bg-white border border-[#e5e7eb] rounded-[20px] p-5 sticky top-[84px]">
            <p className="text-[15px] font-black text-[#1a1a1a] mb-4">Filters</p>

            {/* Date */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Date</p>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className={`w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl pl-8 pr-3 py-2.5 text-[13px] outline-none focus:border-[#1a7f5e] transition cursor-pointer appearance-none ${filterDate ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}`} />
              </div>
              {filterDate && <p className="text-[11px] text-[#1a7f5e] font-semibold mt-1">{formatDate(filterDate)}</p>}
            </div>

            {/* ZIP */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">ZIP code</p>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <input type="text" value={filterZip} onChange={e => setFilterZip(e.target.value)} maxLength={5} placeholder="77001" className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl pl-8 pr-3 py-2.5 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a7f5e] transition" />
              </div>
            </div>

            {/* Distance */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Distance</p>
              <div className="relative">
                <select value={filterDist} onChange={e => setFilterDist(e.target.value)} className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5 text-[13px] text-[#374151] outline-none focus:border-[#1a7f5e] transition appearance-none cursor-pointer">
                  <option>Within 10 miles</option>
                  <option>Within 25 miles</option>
                  <option>Within 40 miles</option>
                  <option>Within 60 miles</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            {/* Min pay */}
            <div className="mb-4">
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Min hourly pay</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[13px]">$</span>
                <input type="number" value={filterMinPay} onChange={e => setFilterMinPay(e.target.value)} placeholder="e.g. 50" className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl pl-6 pr-3 py-2.5 text-[13px] text-[#1a1a1a] outline-none focus:border-[#1a7f5e] transition" />
              </div>
            </div>

            {/* Posted within */}
            <div className="mb-5">
              <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Posted within</p>
              <div className="relative">
                <select value={filterPosted} onChange={e => setFilterPosted(e.target.value)} className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5 text-[13px] text-[#374151] outline-none focus:border-[#1a7f5e] transition appearance-none cursor-pointer">
                  <option>Any time</option>
                  <option>Last 24 hours</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            <div className="h-px bg-[#f3f4f6] mb-4" />
            <button className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-[13px] transition mb-2">Apply filters</button>
            <button onClick={() => { setFilterDate(''); setFilterZip('77001'); setFilterDist('Within 25 miles'); setFilterMinPay(''); setFilterPosted('Last 7 days') }} className="w-full text-[#9ca3af] hover:text-[#374151] text-[13px] font-semibold transition text-center">Clear all</button>
          </div>

          {/* RIGHT — sort + cards + pagination */}
          <div className="flex-1 min-w-0">

            {/* Sort row */}
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] px-4 py-3 flex items-center justify-between mb-4">
              <span className="text-[13px] text-[#9ca3af] font-semibold">
                {shiftType === 'temp' ? '24 shifts near you' : '4 positions near you'}
              </span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-[15px] font-normal text-[#6b7280] outline-none cursor-pointer">
                <option>Sort: Newest</option>
                <option>Sort: Top pay</option>
                <option>Sort: Nearest</option>
                <option>Sort: Highest rated</option>
              </select>
            </div>

            {/* Mobile filter button */}
            <div className="md:hidden mb-4">
              <button className="flex items-center gap-2 bg-white border border-[#e5e7eb] rounded-full px-4 py-2 text-[13px] font-bold text-[#374151]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filter
              </button>
            </div>

            {/* TEMP SHIFT CARDS */}
            {shiftType === 'temp' && (
              allTempShifts.length === 0 ? (
                <div className="bg-white border border-[#e5e7eb] rounded-2xl flex flex-col items-center justify-center py-16 px-6 text-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">No shifts available</p>
                  <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6 max-w-[280px]">There are no shifts matching your filters right now. Try expanding your search or check back later.</p>
                  <button onClick={() => { setFilterDate(''); setFilterMinPay(''); setFilterDist('Within 25 miles') }} className="border-[1.5px] border-[#e5e7eb] text-[#374151] font-bold px-6 py-2.5 rounded-full text-sm hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">Clear filters</button>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {allTempShifts.map(shift => (
                  <div key={shift.id} className="bg-white border border-[#e5e7eb] rounded-[18px] p-4 hover:border-[#1a7f5e] transition cursor-pointer flex flex-col" onClick={() => setSelectedShift(shift)}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`w-10 h-10 rounded-[11px] ${shift.logoBg} flex items-center justify-center text-[11px] font-black ${shift.logoColor} flex-shrink-0`}>{shift.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-black text-[#1a1a1a]">{shift.name}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] font-bold text-[#F97316]">{shift.stars}</span>
                          <span className="text-[12px] text-[#9ca3af]">({shift.reviews})</span>
                          <span className="text-[12px] font-semibold text-[#6b7280]">· {shift.distance}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[17px] font-black text-[#1a1a1a]">${shift.rate}</span>
                        <span className="text-[11px] text-[#9ca3af]">/hr</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mb-2.5">
                      {shift.badges.map(b => <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.style}`}>{b.label}</span>)}
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2.5">
                      {[
                        { icon: <CalSm />, text: shift.date },
                        { icon: <ClockSm />, text: shift.time },
                        { icon: <UserSm />, text: shift.role },
                        { icon: <ParkSm />, text: shift.parking },
                      ].map(({ icon, text }) => (
                        <div key={text} className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">{icon}{text}</div>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#9ca3af] mb-2.5">Est. pay <span className="font-bold text-[#1a7f5e]">{shift.estPay}</span></p>
                    <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelectedShift(shift)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2 rounded-full text-[12px] hover:border-[#1a7f5e] transition">Details</button>
                      <button onClick={() => handleApply(shift.id)} className={`flex-1 font-bold py-2 rounded-full text-[12px] transition ${applied.includes(shift.id) ? 'bg-[#0f4d38] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`}>
                        {applied.includes(shift.id) ? '✓ Applied' : 'Apply'}
                      </button>
                      <button className="w-8 h-8 border border-[#e5e7eb] rounded-full flex items-center justify-center hover:border-[#ef4444] transition flex-shrink-0 group">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" className="group-hover:stroke-[#ef4444]"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )
            )}

            {/* PERM JOB CARDS */}
            {shiftType === 'perm' && (
              permJobs.length === 0 ? (
                <div className="bg-white border border-[#e5e7eb] rounded-2xl flex flex-col items-center justify-center py-16 px-6 text-center mb-5">
                  <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2"/></svg>
                  </div>
                  <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">No permanent jobs available</p>
                  <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6 max-w-[280px]">No permanent positions match your filters right now. Try adjusting your search.</p>
                  <button onClick={() => { setFilterDate(''); setFilterMinPay(''); setFilterDist('Within 25 miles') }} className="border-[1.5px] border-[#e5e7eb] text-[#374151] font-bold px-6 py-2.5 rounded-full text-sm hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">Clear filters</button>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {permJobs.map(job => (
                  <div key={job.id} className="bg-white border border-[#e5e7eb] rounded-[18px] p-4 hover:border-[#1a7f5e] transition cursor-pointer flex flex-col" onClick={() => setSelectedPerm(job)}>
                    <div className="flex items-start gap-2.5 mb-3">
                      <div className={`w-10 h-10 rounded-[11px] ${job.logoBg} flex items-center justify-center text-[11px] font-black ${job.logoColor} flex-shrink-0`}>{job.initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-black text-[#1a1a1a] mb-0.5">{job.office}</p>
                        <p className="text-[12px] font-semibold text-[#1a7f5e] mb-1">{job.title}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-[12px] font-bold text-[#F97316]">{job.stars}</span>
                          <span className="text-[12px] text-[#9ca3af]">({job.reviews})</span>
                          <span className="text-[12px] font-semibold text-[#6b7280]">· {job.distance}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[15px] font-black text-[#1a1a1a]">{job.pay}</p>
                        <p className="text-[10px] text-[#9ca3af]">/hr</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap mb-2.5">
                      {job.badges.map(b => <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${b.style}`}>{b.label}</span>)}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#9ca3af] font-semibold mb-2.5">
                      <span>{job.schedule}</span>
                      <span>·</span>
                      <span>Posted {job.posted}</span>
                      <span>·</span>
                      <span className="text-[#5b21b6] font-bold flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {job.applicants} applicants
                      </span>
                    </div>
                    <div className="flex gap-2.5 flex-wrap flex-1 content-start mb-3">
                      {job.benefits.map(b => (
                        <span key={b} className="flex items-center gap-1 text-[11px] text-[#374151]">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>{b}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
                      <button onClick={() => setSelectedPerm(job)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2 rounded-full text-[12px] hover:border-[#1a7f5e] transition">Details</button>
                      <button onClick={() => handleApply(job.id)} className={`flex-1 font-bold py-2 rounded-full text-[12px] transition ${applied.includes(job.id) ? 'bg-[#0f4d38] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`}>
                        {applied.includes(job.id) ? '✓ Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )
            )}

            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-9 h-9 rounded-[10px] border border-[#e5e7eb] bg-white flex items-center justify-center text-[#9ca3af] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-[10px] border text-[13px] font-bold transition ${page === p ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e] hover:text-[#1a7f5e]'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-9 h-9 rounded-[10px] border border-[#e5e7eb] bg-white flex items-center justify-center text-[#9ca3af] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SHIFT DETAIL DRAWER */}
      {selectedShift && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedShift(null)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-[440px] bg-white z-50 flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-[#f3f4f6] flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setSelectedShift(null)} className="flex items-center gap-1.5 text-[13px] font-bold text-[#6b7280]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>Back to shifts
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-[14px] ${selectedShift.logoBg} flex items-center justify-center text-[14px] font-black ${selectedShift.logoColor} flex-shrink-0`}>{selectedShift.initials}</div>
                <div className="flex-1">
                  <p className="text-[20px] font-black text-[#1a1a1a]">{selectedShift.name}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#F97316]">{selectedShift.stars}</span>
                    <span className="text-[13px] text-[#9ca3af]">({selectedShift.reviews})</span>
                    <span className="text-[13px] text-[#6b7280]">· {selectedShift.distance}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[22px] font-black text-[#1a1a1a]">${selectedShift.rate}</p>
                  <p className="text-[12px] text-[#9ca3af]">/hr</p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="bg-[#e8f5f0] rounded-[14px] px-4 py-3 mb-5">
                <p className="text-[11px] font-semibold text-[#6b9e8a] uppercase tracking-wider mb-0.5">Estimated pay</p>
                <p className="text-[20px] font-black text-[#0f4d38]">{selectedShift.estPay}</p>
              </div>
              <p className="text-[16px] font-semibold text-[#374151] mb-3">Shift details</p>
              <div className="bg-[#f9f8f6] rounded-[14px] overflow-hidden mb-5">
                {[['Date', selectedShift.date], ['Time', selectedShift.time], ['Role', selectedShift.role], ['Software', selectedShift.software], ['Parking', selectedShift.parking]].map(([label, value], i, arr) => (
                  <div key={label} className={`flex justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f0efed]' : ''}`}>
                    <span className="text-[15px] text-[#9ca3af]">{label}</span>
                    <span className="text-[15px] font-medium text-[#1a1a1a]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#f9fdfb] border border-[#d1fae5] rounded-[14px] p-4">
                <p className="text-[12px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Your history here</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[9px] bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#1a1a1a]">Worked here 3 times</p>
                    <p className="text-[12px] text-[#9ca3af]">Last visit Feb 12, 2026 · You rated them ★ 5.0</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#f3f4f6] flex gap-2 flex-shrink-0 bg-white">
              <button className="flex items-center justify-center gap-2 border border-[#e5e7eb] text-[#374151] font-bold px-5 py-3 rounded-full text-[14px] flex-shrink-0 hover:border-[#1a7f5e] transition">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message
              </button>
              <button onClick={() => { handleApply(selectedShift.id); setSelectedShift(null) }} className={`flex-1 font-bold py-3 rounded-full text-[14px] transition ${applied.includes(selectedShift.id) ? 'bg-[#0f4d38] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`}>
                {applied.includes(selectedShift.id) ? '✓ Applied' : 'Apply'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* PERM DETAIL DRAWER */}
      {selectedPerm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedPerm(null)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-[440px] bg-white z-50 flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-[#f3f4f6] flex-shrink-0">
              <button onClick={() => setSelectedPerm(null)} className="flex items-center gap-1.5 text-[13px] font-bold text-[#6b7280] mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>Back to jobs
              </button>
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-[14px] ${selectedPerm.logoBg} flex items-center justify-center text-[14px] font-black ${selectedPerm.logoColor} flex-shrink-0`}>{selectedPerm.initials}</div>
                <div className="flex-1">
                  <p className="text-[20px] font-black text-[#1a1a1a] mb-0.5">{selectedPerm.office}</p>
                  <p className="text-[13px] font-semibold text-[#1a7f5e] mb-1">{selectedPerm.title}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#F97316]">{selectedPerm.stars}</span>
                    <span className="text-[13px] text-[#9ca3af]">({selectedPerm.reviews})</span>
                    <span className="text-[13px] text-[#6b7280]">· {selectedPerm.distance}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="bg-[#e8f5f0] rounded-[14px] px-4 py-3 flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-semibold text-[#6b9e8a] uppercase tracking-wider mb-0.5">Compensation</p>
                  <p className="text-[22px] font-black text-[#0f4d38]">{selectedPerm.pay}<span className="text-[13px] font-medium text-[#6b9e8a]">/hr</span></p>
                </div>
                <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-white text-[#1a7f5e]">{selectedPerm.type}</span>
              </div>
              <p className="text-[16px] font-semibold text-[#374151] mb-3">Job details</p>
              <div className="bg-[#f9f8f6] rounded-[14px] overflow-hidden mb-5">
                {[['Job type', selectedPerm.type], ['Schedule', selectedPerm.schedule], ['Applicants', `${selectedPerm.applicants} applied`]].map(([label, value], i, arr) => (
                  <div key={label} className={`flex justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f0efed]' : ''}`}>
                    <span className="text-[15px] text-[#9ca3af]">{label}</span>
                    <span className={`text-[15px] font-medium ${label === 'Applicants' ? 'text-[#5b21b6]' : 'text-[#1a1a1a]'}`}>{value}</span>
                  </div>
                ))}
              </div>
              <p className="text-[16px] font-semibold text-[#374151] mb-3">Benefits</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {selectedPerm.benefits.map(b => (
                  <span key={b} className="flex items-center gap-1.5 bg-[#f9f8f6] rounded-full px-3 py-1.5 text-[13px] font-semibold text-[#374151]">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>{b}
                  </span>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#f3f4f6] flex gap-2 flex-shrink-0 bg-white">
              <button className="flex items-center justify-center gap-2 border border-[#e5e7eb] text-[#374151] font-bold px-5 py-3 rounded-full text-[14px] flex-shrink-0 hover:border-[#1a7f5e] transition">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message
              </button>
              <button onClick={() => { handleApply(selectedPerm.id); setSelectedPerm(null) }} className={`flex-1 font-bold py-3 rounded-full text-[14px] transition ${applied.includes(selectedPerm.id) ? 'bg-[#0f4d38] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`}>
                {applied.includes(selectedPerm.id) ? '✓ Applied' : 'Apply Now'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* MOBILE TOOLBAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home', path: '/provider-dashboard', icon: <HomeIcon /> },
          { label: 'Requests', path: '/provider-requests', icon: <ReqIcon />, badge: 2 },
          { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon />, active: true },
          { label: 'Messages', path: '/provider-messages', icon: <MsgIcon /> },
          { label: 'Earnings', path: '/provider-earnings', icon: <EarnIcon /> },
        ].map(({ label, path, active, icon, badge }) => (
          <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
            <div className="relative">
              <span className={active ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}>{icon}</span>
              {badge && <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{badge}</span>}
            </div>
            <span className={`text-[10px] ${active ? 'font-bold text-[#1a7f5e]' : 'font-semibold text-[#9ca3af]'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CalSm()    { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function ClockSm()  { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function UserSm()   { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function ParkSm()   { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> }
function HomeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon(){ return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
