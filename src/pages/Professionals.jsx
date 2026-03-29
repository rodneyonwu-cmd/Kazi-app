import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Nav from '../components/Nav'

const PROFESSIONALS = [
  { id: 'sarah', name: 'Sarah R.', role: 'Dental Hygienist', rate: 52, rating: 5.0, reviews: 63, reliability: 98, shifts: 147, responseTime: '< 1 hr', miles: 8.2, software: ['Eaglesoft', 'Dentrix', 'Open Dental'], certs: ['TX RDH License', 'CPR/BLS', 'Local Anesthesia', 'Nitrous Oxide'], about: 'Experienced RDH with 12 years in general and perio practices. Highly proficient in full-mouth debridement, periodontal charting, and advanced scaling procedures. Known for her gentle touch with anxious patients.', img: 'https://randomuser.me/api/portraits/women/44.jpg', booked: true, available: true, calendar: { 16:'avail',17:'avail',18:'booked',19:'avail',20:'avail',23:'avail',24:'booked',25:'avail',26:'avail',30:'avail',31:'avail' } },
  { id: 'rachel', name: 'Rachel M.', role: 'Dental Hygienist', rate: 72, rating: 4.9, reviews: 71, reliability: 99, shifts: 203, responseTime: '< 1 hr', miles: 11.4, software: ['Eaglesoft', 'Open Dental'], certs: ['TX RDH License', 'CPR/BLS', 'Nitrous Oxide'], about: 'With 12 years across general and specialty practices, Rachel brings precision and professionalism to every shift. She excels in perio maintenance, SRP, and patient education.', img: 'https://randomuser.me/api/portraits/women/55.jpg', booked: false, available: true, calendar: { 17:'avail',18:'avail',19:'booked',20:'avail',23:'avail',24:'avail',26:'avail',30:'avail' } },
  { id: 'aisha', name: 'Aisha L.', role: 'Dental Hygienist', rate: 58, rating: 5.0, reviews: 48, reliability: 94, shifts: 142, responseTime: '< 2 hrs', miles: 6.1, software: ['Dentrix', 'Curve Dental'], certs: ['TX RDH License', 'CPR/BLS', 'Local Anesthesia'], about: 'Periodontal specialist with 15 years of clinical experience focused on advanced perio therapy, precision scaling, and early disease detection. Highly sought after by specialty practices.', img: 'https://randomuser.me/api/portraits/women/65.jpg', booked: false, available: true, calendar: { 16:'avail',17:'avail',18:'booked',20:'avail',24:'avail',25:'avail',27:'avail',30:'avail' } },
  { id: 'james', name: 'James T.', role: 'Dental Hygienist', rate: 75, rating: 4.8, reviews: 55, reliability: 91, shifts: 88, responseTime: '< 2 hrs', miles: 14.3, software: ['Open Dental', 'Eaglesoft'], certs: ['TX RDH License', 'CPR/BLS'], about: 'James thrives in collaborative, high-volume environments. With experience across several multi-doctor practices in Houston, he brings adaptability and professionalism to every shift.', img: 'https://randomuser.me/api/portraits/men/22.jpg', booked: false, available: false, calendar: { 17:'avail',19:'avail',24:'avail',25:'avail',31:'avail' } },
  { id: 'nina', name: 'Nina P.', role: 'Dental Assistant', rate: 34, rating: 4.9, reviews: 52, reliability: 86, shifts: 98, responseTime: '< 2 hrs', miles: 9.8, software: ['Dentrix', 'Eaglesoft'], certs: ['Reg. DA', 'CPR/BLS', 'X-Ray'], about: 'Nina brings warmth, efficiency, and clinical precision to every practice. With 8 years assisting across general and cosmetic practices, she excels in four-handed dentistry and tray setup.', img: 'https://randomuser.me/api/portraits/women/28.jpg', booked: false, available: true, calendar: { 16:'avail',17:'booked',18:'avail',19:'avail',24:'avail',25:'avail',30:'avail' } },
  { id: 'marcus', name: 'Marcus J.', role: 'Dental Assistant', rate: 38, rating: 4.8, reviews: 41, reliability: 73, shifts: 54, responseTime: '< 3 hrs', miles: 5.7, software: ['Dentrix', 'Open Dental'], certs: ['Reg. DA', 'CPR/BLS', 'X-Ray'], about: 'Marcus is a dependable dental assistant with 8 years in general and pediatric settings. Particularly skilled in instrument sterilization and impression taking.', img: 'https://randomuser.me/api/portraits/men/32.jpg', booked: true, available: true, calendar: { 17:'avail',18:'avail',20:'avail',23:'avail',26:'avail',31:'avail' } },
  { id: 'tara', name: 'Tara C.', role: 'Front Desk', rate: 28, rating: 4.7, reviews: 34, reliability: 98, shifts: 61, responseTime: '< 2 hrs', miles: 7.5, software: ['Eaglesoft', 'Dentrix'], certs: ['CPR/BLS', 'HIPAA'], about: 'Tara is a polished front desk professional with a gift for patient relations and scheduling efficiency. She seamlessly steps into new office environments and quickly learns workflows.', img: 'https://randomuser.me/api/portraits/women/17.jpg', booked: false, available: true, calendar: { 16:'avail',18:'avail',19:'avail',23:'avail',24:'avail',31:'avail' } },
  { id: 'devon', name: 'Devon K.', role: 'Treatment Coordinator', rate: 42, rating: 4.6, reviews: 28, reliability: 84, shifts: 32, responseTime: '< 5 hrs', miles: 18.2, software: ['Curve Dental'], certs: ['CPR/BLS', 'HIPAA', 'Dental Billing'], about: 'Devon specializes in presenting treatment plans that build patient trust and drive case acceptance. Strong background in insurance coordination and financial arrangements.', img: 'https://randomuser.me/api/portraits/men/41.jpg', booked: false, available: false, calendar: { 17:'avail',19:'avail',24:'avail',25:'avail',30:'avail' } },
]

const CAL_DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function relDisplay(r) {
  if (r >= 95) return { label: 'Excellent', bg: '#dcfce7', color: '#166534' }
  if (r >= 85) return { label: 'Very Good', bg: '#ede9fe', color: '#5b21b6' }
  if (r >= 70) return { label: 'Good', bg: '#ffedd5', color: '#9a3412' }
  return { label: 'Poor', bg: '#fee2e2', color: '#991b1b' }
}

function ProCard({ pro, rapidSelected, onToggleRapid, onBook, showToast }) {
  const [calOpen, setCalOpen] = useState(false)
  const isSelected = rapidSelected.includes(pro.id)
  const rel = relDisplay(pro.reliability)

  const firstDay = new Date(2026, 2, 1).getDay()
  const calDays = [...Array(firstDay).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)]

  return (
    <div className={`bg-white border rounded-[14px] overflow-hidden mb-2 transition-all ${isSelected ? 'border-[#1a7f5e] shadow-[0_0_0_1px_#1a7f5e]' : 'border-[#e5e7eb] hover:border-[#c5d9d4]'}`}>
      <div className="flex gap-2.5 p-3">

        {/* Rapid Fill Checkbox */}
        <div
          onClick={() => onToggleRapid(pro.id)}
          className={`w-4 h-4 rounded-[4px] border-2 flex items-center justify-center cursor-pointer flex-shrink-0 mt-1 transition-all ${isSelected ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db] hover:border-[#1a7f5e] bg-white'}`}
        >
          {isSelected && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
        </div>

        {/* Avatar */}
        <img src={pro.img} className="w-[68px] h-[68px] rounded-full object-cover flex-shrink-0" alt={pro.name}/>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[15px] font-black text-[#1a1a1a]">{pro.name}</span>
              {pro.booked && <span className="text-[9px] font-bold bg-[#e8f5f0] text-[#1a7f5e] px-1.5 py-0.5 rounded-full">✓ Worked with you</span>}
              <span className={`text-[10px] font-semibold ${pro.available ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}`}>{pro.available ? '● Active' : '○ Unavailable'}</span>
            </div>
            <span className="text-[15px] font-black text-[#1a1a1a] flex-shrink-0">${pro.rate}<span className="text-[10px] font-normal text-[#9ca3af]">/hr</span></span>
          </div>

          <p className="text-[11px] text-[#6b7280] mb-1.5">{pro.role} · {pro.miles} mi away</p>

          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
            <span className="text-[13px] font-extrabold text-[#F97316]">★ {pro.rating}</span>
            <span className="text-[11px] text-[#9ca3af]">({pro.reviews})</span>
            <span className="text-[#d1d5db]">·</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: rel.bg, color: rel.color }}>{rel.label} · {pro.reliability}%</span>
            <span className="text-[#d1d5db]">·</span>
            <span className="text-[11px] font-semibold text-[#374151]">{pro.shifts} shifts</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-1.5">
            {pro.software.map(s => <span key={s} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#e8f5f0] text-[#0f4d38]">{s}</span>)}
            {pro.certs.map(c => <span key={c} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f3f4f6] text-[#374151]">✓ {c}</span>)}
          </div>

          <p className="text-[12px] text-[#374151] leading-relaxed mb-2 line-clamp-2">{pro.about}</p>

          <div className="flex items-center justify-end gap-1.5">
            <button onClick={() => showToast('Opening messages...')} className="flex items-center gap-1 border border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e] hover:text-[#1a7f5e] text-[11px] font-bold px-3 py-1.5 rounded-full transition bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message
            </button>
            <button onClick={() => setCalOpen(!calOpen)} className="flex items-center gap-1 bg-[#1a7f5e] hover:bg-[#156649] text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>
              Availability
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${calOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
        </div>
      </div>

      {calOpen && (
        <div className="border-t border-[#f3f4f6] bg-[#f9f8f6] px-3.5 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-extrabold text-[#1a1a1a]">March 2026</span>
            <div className="flex gap-3">
              {[['#e8f5f0','#1a7f5e','Available'],['#fef3c7','#f59e0b','Booked']].map(([bg,bd,lbl]) => (
                <div key={lbl} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-[2px]" style={{ background: bg, border: `1px solid ${bd}` }}/>
                  <span className="text-[10px] text-[#6b7280]">{lbl}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-7 gap-[2px] mb-1">
            {CAL_DAYS.map(d => <div key={d} className="text-center text-[9px] font-bold text-[#9ca3af] uppercase py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-[2px] mb-2">
            {calDays.map((day, i) => {
              if (!day) return <div key={`e${i}`}/>
              const s = pro.calendar[day]
              return (
                <div
                  key={day}
                  onClick={() => s === 'avail' && onBook(pro, day)}
                  className={`text-center text-[10px] font-semibold py-1.5 rounded-[5px] transition ${s === 'avail' ? 'bg-[#e8f5f0] text-[#1a7f5e] cursor-pointer hover:bg-[#1a7f5e] hover:text-white' : s === 'booked' ? 'bg-[#fef3c7] text-[#92400e]' : 'text-[#d1d5db]'}`}
                >
                  {day}
                </div>
              )
            })}
          </div>
          <p className="text-[10px] text-[#9ca3af] italic">Tap an available date to send a booking request</p>
        </div>
      )}
    </div>
  )
}

function BookingModal({ pro, day, onClose }) {
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <p className="text-[15px] font-extrabold text-[#1a7f5e] mb-1">Booking request sent!</p>
        <p className="text-[12px] text-[#6b7280] mb-4">{pro.name.split(' ')[0]} will respond within {pro.responseTime}</p>
        <button onClick={onClose} className="bg-[#1a7f5e] text-white font-bold px-6 py-2 rounded-full text-[13px] border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Done</button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-[#f9f8f6] px-5 py-4 border-b border-[#e5e7eb] flex items-center gap-3">
          <img src={pro.img} className="w-14 h-14 rounded-full object-cover flex-shrink-0"/>
          <div className="flex-1">
            <p className="text-[16px] font-extrabold text-[#1a1a1a]">{pro.name}</p>
            <p className="text-[12px] text-[#6b7280]">{pro.role} · ${pro.rate}/hr</p>
            <p className="text-[12px] font-bold text-[#1a7f5e]">March {day}, 2026</p>
          </div>
          <button onClick={onClose} className="text-[#9ca3af] hover:text-[#1a1a1a] text-lg bg-none border-none cursor-pointer">✕</button>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[['Start','8:00 AM',['7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM']],['End','5:00 PM',['3:00 PM','4:00 PM','5:00 PM']]].map(([lbl, def, opts]) => (
              <div key={lbl}>
                <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">{lbl} time</p>
                <select className="w-full border border-[#e5e7eb] rounded-xl px-2.5 py-1.5 text-[12px] outline-none focus:border-[#1a7f5e] bg-white" style={{ fontFamily: 'inherit' }}>
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="mb-3">
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">Note (optional)</p>
            <textarea placeholder="e.g. Please arrive 10 minutes early..." className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-[12px] outline-none focus:border-[#1a7f5e] resize-none h-10 bg-white" style={{ fontFamily: 'inherit' }}/>
          </div>
          <div onClick={() => setAgreed(!agreed)} className="flex items-center gap-2 cursor-pointer mb-3 bg-[#f9f8f6] border border-[#e5e7eb] rounded-xl px-3 py-2.5">
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${agreed ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
              {agreed && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
            </div>
            <p className="text-[12px] text-[#374151]">I agree to kazi.'s <span className="text-[#1a7f5e] font-semibold">Booking Terms</span></p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2 rounded-full text-[12px] hover:border-[#1a7f5e] transition cursor-pointer bg-white" style={{ fontFamily: 'inherit' }}>Cancel</button>
            <button onClick={() => agreed && setSubmitted(true)} className={`flex-1 font-bold py-2 rounded-full text-[12px] transition border-none ${agreed ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white cursor-pointer' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`} style={{ fontFamily: 'inherit' }}>Send request</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Professionals() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('All')
  const [reliability, setReliability] = useState('All')
  const [skill, setSkill] = useState('')
  const [cert, setCert] = useState('')
  const [lang, setLang] = useState('')
  const [photoOnly, setPhotoOnly] = useState(false)
  const [maxMiles, setMaxMiles] = useState(20)
  const [minRate, setMinRate] = useState(0)
  const [maxRate, setMaxRate] = useState(150)
  const [sortBy, setSortBy] = useState('Best match')
  const [rapidSelected, setRapidSelected] = useState([])
  const [showRapidFill, setShowRapidFill] = useState(false)
  const [rapidSubmitted, setRapidSubmitted] = useState(false)
  const [bookingModal, setBookingModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const PER_PAGE = 8

  useEffect(() => {
    if (location.state?.rapidFillPreselect) setRapidSelected([location.state.rapidFillPreselect])
  }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500) }
  const toggleRapid = (id) => setRapidSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 10 ? [...prev, id] : prev)
  const getRelBand = (r) => r >= 95 ? 'excellent' : r >= 85 ? 'verygood' : r >= 70 ? 'good' : 'poor'

  const filtered = PROFESSIONALS.filter(p => {
    if (role !== 'All' && p.role !== role) return false
    if (reliability !== 'All' && getRelBand(p.reliability) !== reliability) return false
    if (p.rate < minRate || p.rate > maxRate) return false
    if (p.miles > maxMiles) return false
    if (cert && !p.certs.includes(cert)) return false
    if (skill && !p.software.includes(skill)) return false
    if (photoOnly && !p.img) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.role.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'Highest rated') return b.rating - a.rating
    if (sortBy === 'Most reliable') return b.reliability - a.reliability
    if (sortBy === 'Lowest rate') return a.rate - b.rate
    if (sortBy === 'Most shifts') return b.shifts - a.shifts
    if (sortBy === 'Closest') return a.miles - b.miles
    return b.reliability - a.reliability
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const clearFilters = () => { setRole('All'); setReliability('All'); setSkill(''); setCert(''); setLang(''); setPhotoOnly(false); setMaxMiles(20); setMinRate(0); setMaxRate(150); setSearch(''); setPage(1) }
  const activeCount = [role !== 'All', reliability !== 'All', skill, cert, lang, photoOnly, maxMiles !== 20, minRate !== 0 || maxRate !== 150].filter(Boolean).length
  const selectedPros = PROFESSIONALS.filter(p => rapidSelected.includes(p.id))

  const FilterPanel = () => (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-[#f3f4f6]">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-extrabold text-[#1a1a1a]">Filters</span>
          {activeCount > 0 && <span className="text-[10px] font-extrabold bg-[#1a7f5e] text-white w-4 h-4 rounded-full flex items-center justify-center">{activeCount}</span>}
        </div>
        {activeCount > 0 && <button onClick={clearFilters} className="text-[11px] font-semibold text-[#1a7f5e] hover:underline bg-none border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Clear all</button>}
      </div>
      <div className="p-3.5 flex flex-col gap-3">
        {[
          { label: 'Role', val: role, set: v => { setRole(v); setPage(1) }, opts: ['All','Dental Hygienist','Dental Assistant','Front Desk','Treatment Coordinator','Sterilization Tech'], display: ['All roles','Dental Hygienist','Dental Assistant','Front Desk','Treatment Coordinator','Sterilization Tech'] },
          { label: 'Reliability', val: reliability, set: v => { setReliability(v); setPage(1) }, opts: ['All','excellent','verygood','good','poor'], display: ['Any reliability','Excellent — 95%+','Very Good — 85–94%','Good — 70–84%','Poor — <70%'] },
          { label: 'Language', val: lang, set: setLang, opts: ['','Spanish','Mandarin','Vietnamese','Portuguese'], display: ['Any language','Spanish','Mandarin','Vietnamese','Portuguese'] },
        ].map(f => (
          <div key={f.label}>
            <p className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">{f.label}</p>
            <div className="relative">
              <select value={f.val} onChange={e => f.set(e.target.value)} className={`w-full border rounded-[10px] px-2.5 py-2 pr-7 text-[12px] font-semibold outline-none appearance-none cursor-pointer transition text-[#374151] ${f.val && f.val !== 'All' ? 'border-[#1a7f5e] bg-[#f0faf5]' : 'border-[#e5e7eb] bg-[#f9f8f6]'}`} style={{ fontFamily: 'inherit' }}>
                {f.display.map((o, i) => <option key={o} value={f.opts[i]}>{o}</option>)}
              </select>
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        ))}
        <div className="h-px bg-[#f3f4f6]"/>
        <div onClick={() => setPhotoOnly(!photoOnly)} className="flex items-center gap-2 cursor-pointer">
          <div className={`w-[15px] h-[15px] rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 transition ${photoOnly ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
            {photoOnly && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
          </div>
          <div><p className="text-[12px] font-semibold text-[#1a1a1a]">Profile photo</p><p className="text-[10px] text-[#9ca3af]">Only show pros with a photo</p></div>
        </div>
        <div className="h-px bg-[#f3f4f6]"/>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em]">Hourly Rate</p>
            <span className="text-[10px] font-bold text-[#1a7f5e]">${minRate}–${maxRate}/hr</span>
          </div>
          <div className="flex items-center gap-2">
            {[[minRate, setMinRate, 'Min'],[maxRate, setMaxRate, 'Max']].map(([val, set, lbl]) => (
              <div key={lbl} className="flex-1 relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[11px]">$</span>
                <input type="number" value={val} onChange={e => set(Number(e.target.value))} placeholder={lbl} className="w-full border border-[#e5e7eb] rounded-[10px] pl-5 pr-2 py-2 text-[12px] font-semibold bg-[#f9f8f6] outline-none focus:border-[#1a7f5e] text-[#1a1a1a]" style={{ fontFamily: 'inherit' }}/>
              </div>
            ))}
          </div>
        </div>
        <div className="h-px bg-[#f3f4f6]"/>
        <div>
          <p className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Max Distance</p>
          <div className="flex flex-wrap gap-1">
            {[5,10,20,35,50].map(m => (
              <button key={m} onClick={() => setMaxMiles(m)} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition cursor-pointer ${maxMiles === m ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e] bg-white'}`} style={{ fontFamily: 'inherit' }}>{m} mi</button>
            ))}
          </div>
        </div>
        <div className="h-px bg-[#f3f4f6]"/>
        {[
          { label: 'Skill', val: skill, set: setSkill, opts: ['','Scaling & Root Planing','Periodontal Charting','Digital X-rays','Four-Handed Dentistry','Insurance Verification'] },
          { label: 'Certification', val: cert, set: setCert, opts: ['','TX RDH License','CPR/BLS','Local Anesthesia','X-Ray','Reg. DA'] },
        ].map(f => (
          <div key={f.label}>
            <p className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">{f.label}</p>
            <div className="relative">
              <select value={f.val} onChange={e => f.set(e.target.value)} className={`w-full border rounded-[10px] px-2.5 py-2 pr-7 text-[12px] font-semibold outline-none appearance-none cursor-pointer transition text-[#374151] ${f.val ? 'border-[#1a7f5e] bg-[#f0faf5]' : 'border-[#e5e7eb] bg-[#f9f8f6]'}`} style={{ fontFamily: 'inherit' }}>
                {f.opts.map((o, i) => <option key={o} value={o}>{i === 0 ? `Any ${f.label.toLowerCase()}` : o}</option>)}
              </select>
              <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[12px] font-semibold px-5 py-2.5 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0"><svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          {toast}
        </div>
      )}

      {bookingModal && <BookingModal pro={bookingModal.pro} day={bookingModal.day} onClose={() => setBookingModal(null)} />}

      {showRapidFill && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" style={{ maxHeight: '85vh' }}>
            {!rapidSubmitted ? (
              <>
                <div className="bg-[#f9f8f6] border-b border-[#e5e7eb] px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#1a7f5e] rounded-full flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                    <div>
                      <p className="text-[14px] font-extrabold text-[#1a1a1a]">Rapid Fill ⚡</p>
                      <p className="text-[11px] text-[#6b7280]">First to accept gets the shift · {rapidSelected.length}/10 selected</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRapidFill(false)} className="text-[#9ca3af] hover:text-[#1a1a1a] text-lg bg-none border-none cursor-pointer">✕</button>
                </div>
                <div className="overflow-y-auto px-5 py-3 flex flex-col gap-2" style={{ maxHeight: '50vh' }}>
                  {selectedPros.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-[#f9f8f6] rounded-xl p-2.5 border border-[#e5e7eb]">
                      <img src={p.img} className="w-9 h-9 rounded-full object-cover flex-shrink-0"/>
                      <div className="flex-1 min-w-0"><p className="text-[13px] font-bold text-[#1a1a1a]">{p.name}</p><p className="text-[11px] text-[#6b7280]">${p.rate}/hr · {p.reliability}% reliable · ★ {p.rating}</p></div>
                      <button onClick={() => toggleRapid(p.id)} className="text-[#9ca3af] hover:text-[#ef4444] bg-none border-none cursor-pointer text-lg">✕</button>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t border-[#e5e7eb]">
                  <p className="text-[11px] text-[#9ca3af] mb-3">Once one professional accepts, the shift is locked and all others are notified.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowRapidFill(false)} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-[12px] hover:border-[#1a7f5e] transition cursor-pointer bg-white" style={{ fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={() => rapidSelected.length > 0 && setRapidSubmitted(true)} className={`flex-1 font-bold py-2.5 rounded-full text-[12px] flex items-center justify-center gap-1.5 border-none transition ${rapidSelected.length > 0 ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white cursor-pointer' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`} style={{ fontFamily: 'inherit' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Send to {rapidSelected.length}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-14 h-14 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-4"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                <p className="text-[18px] font-extrabold text-[#1a1a1a] mb-1">Rapid Fill sent! ⚡</p>
                <p className="text-[13px] text-[#6b7280] mb-6">Blasted to <strong>{rapidSelected.length} professionals</strong>. First to accept gets the shift.</p>
                <button onClick={() => { setShowRapidFill(false); setRapidSelected([]); setRapidSubmitted(false); showToast('Rapid Fill sent!') }} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-8 py-2.5 rounded-full text-[13px] border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-[860px] mx-auto px-4 py-5">
        <div className="flex gap-5 items-start">
          <div className="hidden md:block w-[210px] flex-shrink-0 sticky top-20 max-h-[calc(100vh-90px)] overflow-y-auto">
            <FilterPanel />
          </div>
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-2.5 flex gap-2 mb-3 items-center">
              <div className="relative flex-1">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 border border-[#e5e7eb] rounded-[10px] text-[12px] outline-none focus:border-[#1a7f5e] bg-[#f9f8f6] text-[#1a1a1a]" style={{ fontFamily: 'inherit' }}/>
              </div>
              <div className="relative flex-shrink-0">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-[#e5e7eb] rounded-[10px] px-2.5 py-2 text-[12px] font-semibold text-[#374151] bg-[#f9f8f6] outline-none cursor-pointer appearance-none pr-6" style={{ fontFamily: 'inherit' }}>
                  {['Best match','Highest rated','Most reliable','Lowest rate','Most shifts','Closest'].map(o => <option key={o}>Sort: {o}</option>)}
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-[12px] text-[#6b7280]"><strong className="text-[#1a1a1a]">{filtered.length}</strong> professionals found</p>
              {rapidSelected.length === 0 ? (
                <div className="flex items-center gap-1.5 bg-[#e8f5f0] px-3 py-1.5 rounded-full">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <p className="text-[11px] font-semibold text-[#0f4d38]">Check boxes to use Rapid Fill</p>
                </div>
              ) : (
                <button onClick={() => setShowRapidFill(true)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-3.5 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border-none cursor-pointer transition" style={{ fontFamily: 'inherit' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Rapid Fill ({rapidSelected.length})
                </button>
              )}
            </div>

            {paginated.length === 0 ? (
              <div className="bg-white border border-[#e5e7eb] rounded-2xl py-14 px-6 text-center">
                <p className="text-[15px] font-extrabold text-[#1a1a1a] mb-2">No professionals found</p>
                <p className="text-[13px] text-[#9ca3af] mb-4">Try adjusting your filters.</p>
                <button onClick={clearFilters} className="border border-[#e5e7eb] text-[#374151] font-bold px-5 py-2 rounded-full text-[12px] hover:border-[#1a7f5e] transition cursor-pointer bg-white" style={{ fontFamily: 'inherit' }}>Clear all filters</button>
              </div>
            ) : paginated.map(pro => (
              <ProCard key={pro.id} pro={pro} rapidSelected={rapidSelected} onToggleRapid={toggleRapid} onBook={(p, d) => setBookingModal({ pro: p, day: d })} showToast={showToast} />
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-[8px] border border-[#e5e7eb] bg-white flex items-center justify-center text-[#9ca3af] hover:border-[#1a7f5e] transition cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-[8px] border text-[12px] font-bold transition cursor-pointer ${page === p ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="w-8 h-8 rounded-[8px] border border-[#e5e7eb] bg-white flex items-center justify-center text-[#9ca3af] hover:border-[#1a7f5e] transition cursor-pointer"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {rapidSelected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-sm md:w-auto">
          <div className="bg-[#1a1a1a] text-white px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-3">
            <div className="flex">{selectedPros.slice(0,3).map((p,i) => <img key={i} src={p.img} className="w-6 h-6 rounded-full object-cover border-2 border-[#1a1a1a]" style={{ marginLeft: i > 0 ? '-6px' : 0 }}/>)}</div>
            <p className="text-[12px] font-semibold">{rapidSelected.length} selected</p>
            <button onClick={() => setShowRapidFill(true)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-3.5 py-1.5 rounded-full text-[11px] flex items-center gap-1.5 border-none cursor-pointer transition" style={{ fontFamily: 'inherit' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Launch Rapid Fill
            </button>
            <button onClick={() => setRapidSelected([])} className="text-[#9ca3af] hover:text-white text-base bg-none border-none cursor-pointer">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
