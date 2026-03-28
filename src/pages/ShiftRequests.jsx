import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['SU','MO','TU','WE','TH','FR','SA']

const PENDING = [
  {
    id: 'p1', initials: 'ED', bg: '#e8f5f0', color: '#1a7f5e',
    office: 'Evolve Dentistry', date: 'Wed Mar 26', time: '8:00 AM – 5:00 PM',
    pay: '$468', rate: '$52/hr', distance: '3.2 mi from home', software: 'Eaglesoft',
    tags: [{ label: 'Instant Pay', bg: '#fef9c3', color: '#92400e' }],
    perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Lunch provided' }, { yes: true, label: 'Instant Pay' }, { yes: false, label: 'No X-ray req.' }],
    msg: '"We would love to have you back! You worked with us in February and the team loved you."',
  },
  {
    id: 'p2', initials: 'BS', bg: '#fef9c3', color: '#92400e',
    office: 'Bright Smile Dental', date: 'Fri Mar 28', time: '9:00 AM – 4:00 PM',
    pay: '$406', rate: '$58/hr', distance: '6.8 mi from home', software: 'Dentrix',
    tags: [{ label: 'Dentrix', bg: '#f3f4f6', color: '#374151' }],
    perks: [{ yes: true, label: 'Parking provided' }, { yes: false, label: 'No lunch' }, { yes: false, label: 'No instant pay' }],
    msg: null,
  },
  {
    id: 'p3', initials: 'CL', bg: '#ede9fe', color: '#5b21b6',
    office: 'Clear Lake Dental', date: 'Mon Mar 31', time: '7:30 AM – 4:30 PM',
    pay: '$585', rate: '$65/hr', distance: '9.1 mi from home', software: 'Open Dental',
    tags: [{ label: 'Open Dental', bg: '#e8f5f0', color: '#1a7f5e' }],
    perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Lunch provided' }, { yes: true, label: 'Instant Pay' }, { yes: true, label: 'X-ray taken' }],
    msg: null,
  },
  {
    id: 'p4', initials: 'HF', bg: '#e8f5f0', color: '#1a7f5e',
    office: 'Houston Family Dentistry', date: 'Tue Apr 1', time: '8:00 AM – 5:00 PM',
    pay: '$486', rate: '$54/hr', distance: '4.5 mi from home', software: 'Eaglesoft',
    tags: [{ label: 'Instant Pay', bg: '#fef9c3', color: '#92400e' }],
    perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Instant Pay' }, { yes: false, label: 'No lunch' }],
    msg: null,
  },
  {
    id: 'p5', initials: 'PS', bg: '#ffedd5', color: '#9a3412',
    office: 'Pearland Smiles', date: 'Thu Apr 3', time: '8:00 AM – 3:00 PM',
    pay: '$336', rate: '$48/hr', distance: '11.2 mi from home', software: 'Eaglesoft',
    tags: [{ label: 'Eaglesoft', bg: '#f3f4f6', color: '#374151' }],
    perks: [{ yes: false, label: 'No parking' }, { yes: false, label: 'No lunch' }, { yes: false, label: 'No instant pay' }],
    msg: null,
  },
]

const APPROVED_INIT = [
  {
    id: 'a1', initials: 'ED', bg: '#e8f5f0', color: '#1a7f5e',
    office: 'Evolve Dentistry', date: 'Mon Mar 24', time: '8:00 AM – 5:00 PM',
    pay: '$468', rate: '$52/hr', distance: '3.2 mi from home', software: 'Eaglesoft',
    perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Lunch provided' }, { yes: true, label: 'Instant Pay' }],
    phone: 'tel:+17135550101', maps: 'https://maps.google.com/?q=Evolve+Dentistry+Houston+TX',
  },
  {
    id: 'a2', initials: 'HF', bg: '#e8f5f0', color: '#1a7f5e',
    office: 'Houston Family Dentistry', date: 'Wed Mar 19', time: '8:00 AM – 4:00 PM',
    pay: '$416', rate: '$52/hr', distance: '4.5 mi from home', software: 'Eaglesoft',
    perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Instant Pay' }, { yes: false, label: 'No lunch' }],
    phone: 'tel:+17135550202', maps: 'https://maps.google.com/?q=Houston+Family+Dentistry+Houston+TX',
  },
  {
    id: 'a3', initials: 'CL', bg: '#ede9fe', color: '#5b21b6',
    office: 'Clear Lake Dental', date: 'Fri Mar 14', time: '9:00 AM – 3:00 PM',
    pay: '$390', rate: '$65/hr', distance: '9.1 mi from home', software: 'Open Dental',
    perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Lunch provided' }, { yes: true, label: 'Instant Pay' }],
    phone: 'tel:+17135550303', maps: 'https://maps.google.com/?q=Clear+Lake+Dental+Houston+TX',
  },
]

const DECLINED_INIT = [
  { id: 'd1', initials: 'PS', bg: '#f3f4f6', color: '#9ca3af', office: 'Pearland Smiles', date: 'Tue Mar 18', time: '8:00–5:00', rate: '$48/hr' },
  { id: 'd2', initials: 'BS', bg: '#fef9c3', color: '#92400e', office: 'Bright Smile Dental', date: 'Mon Mar 10', time: '9:00–4:00', rate: '$55/hr' },
]

const CAL_SHIFTS = {
  '2026-3-26': { type: 'pending', office: 'Evolve Dentistry', initials: 'ED', bg: '#e8f5f0', color: '#1a7f5e', date: 'Wed, Mar 26', time: '8:00 AM – 5:00 PM', rate: '$52/hr', pay: '$468', distance: '3.2 mi from home', software: 'Eaglesoft', perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Lunch provided' }, { yes: true, label: 'Instant Pay' }], msg: '"We would love to have you back!"', phone: null, maps: null },
  '2026-3-28': { type: 'pending', office: 'Bright Smile Dental', initials: 'BS', bg: '#fef9c3', color: '#92400e', date: 'Fri, Mar 28', time: '9:00 AM – 4:00 PM', rate: '$58/hr', pay: '$406', distance: '6.8 mi from home', software: 'Dentrix', perks: [{ yes: true, label: 'Parking provided' }, { yes: false, label: 'No lunch' }], msg: null, phone: null, maps: null },
  '2026-3-31': { type: 'pending', office: 'Clear Lake Dental', initials: 'CL', bg: '#ede9fe', color: '#5b21b6', date: 'Mon, Mar 31', time: '7:30 AM – 4:30 PM', rate: '$65/hr', pay: '$585', distance: '9.1 mi from home', software: 'Open Dental', perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Lunch provided' }, { yes: true, label: 'Instant Pay' }], msg: null, phone: null, maps: null },
  '2026-4-1':  { type: 'pending', office: 'Houston Family Dentistry', initials: 'HF', bg: '#e8f5f0', color: '#1a7f5e', date: 'Tue, Apr 1', time: '8:00 AM – 5:00 PM', rate: '$54/hr', pay: '$486', distance: '4.5 mi from home', software: 'Eaglesoft', perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Instant Pay' }], msg: null, phone: null, maps: null },
  '2026-4-3':  { type: 'pending', office: 'Pearland Smiles', initials: 'PS', bg: '#ffedd5', color: '#9a3412', date: 'Thu, Apr 3', time: '8:00 AM – 3:00 PM', rate: '$48/hr', pay: '$336', distance: '11.2 mi from home', software: 'Eaglesoft', perks: [{ yes: false, label: 'No parking' }, { yes: false, label: 'No lunch' }], msg: null, phone: null, maps: null },
  '2026-3-24': { type: 'accepted', office: 'Evolve Dentistry', initials: 'ED', bg: '#e8f5f0', color: '#1a7f5e', date: 'Mon, Mar 24', time: '8:00 AM – 5:00 PM', rate: '$52/hr', pay: '$468', distance: '3.2 mi from home', software: 'Eaglesoft', perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Lunch provided' }], msg: null, phone: 'tel:+17135550101', maps: 'https://maps.google.com/?q=Evolve+Dentistry+Houston+TX' },
  '2026-3-19': { type: 'accepted', office: 'Houston Family Dentistry', initials: 'HF', bg: '#e8f5f0', color: '#1a7f5e', date: 'Wed, Mar 19', time: '8:00 AM – 4:00 PM', rate: '$52/hr', pay: '$416', distance: '4.5 mi from home', software: 'Eaglesoft', perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Instant Pay' }], msg: null, phone: 'tel:+17135550202', maps: 'https://maps.google.com/?q=Houston+Family+Dentistry+Houston+TX' },
  '2026-3-14': { type: 'accepted', office: 'Clear Lake Dental', initials: 'CL', bg: '#ede9fe', color: '#5b21b6', date: 'Fri, Mar 14', time: '9:00 AM – 3:00 PM', rate: '$65/hr', pay: '$390', distance: '9.1 mi from home', software: 'Open Dental', perks: [{ yes: true, label: 'Parking provided' }, { yes: true, label: 'Lunch provided' }], msg: null, phone: 'tel:+17135550303', maps: 'https://maps.google.com/?q=Clear+Lake+Dental+Houston+TX' },
}

// ── Detail Panel (shared by list + calendar) ──────────────────
function DetailPanel({ shift, onAccept, onDecline, openMsg }) {
  return (
    <div className="border-t border-[#f3f4f6] p-3.5">
      <div className="grid grid-cols-2 gap-1.5 mb-2.5">
        {[
          ['Date', shift.date],
          ['Hours', shift.time],
          ['Hourly Rate', shift.rate],
          ['Total Est. Pay', shift.pay],
          ['Distance', shift.distance],
          ['Software', shift.software],
        ].map(([label, val]) => (
          <div key={label} className="bg-[#f9f8f6] rounded-[8px] px-2.5 py-2">
            <div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-0.5">{label}</div>
            <div className={`text-[13px] font-bold ${label === 'Total Est. Pay' ? 'text-[#1a7f5e]' : 'text-[#1a1a1a]'}`}>{val}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {shift.perks.map((p, i) => (
          <span key={i} className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${p.yes ? 'bg-[#e8f5f0] text-[#1a7f5e]' : 'bg-[#fee2e2] text-[#991b1b] line-through opacity-60'}`}>
            {p.yes ? '✓' : '✕'} {p.label}
          </span>
        ))}
      </div>

      {shift.msg && (
        <div className="bg-[#fff8e1] rounded-[8px] px-3 py-2 text-[12px] text-[#92400e] italic leading-relaxed mb-2.5">{shift.msg}</div>
      )}

      {shift.type === 'pending' ? (
        <div className="flex gap-2">
          <button onClick={onAccept} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-extrabold py-2 rounded-full text-[12px] transition border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Accept shift</button>
          <button onClick={onDecline} className="flex-1 bg-white text-[#374151] border border-[#e5e7eb] font-bold py-2 rounded-full text-[12px] hover:border-[#ef4444] hover:text-[#ef4444] transition cursor-pointer" style={{ fontFamily: 'inherit' }}>Decline</button>
        </div>
      ) : (
        <div className="flex gap-1.5 flex-wrap">
          <a href={shift.phone} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#e8f5f0] text-[#1a7f5e] hover:bg-[#c6e8d9] transition no-underline">
            <PhoneIcon /> Call office
          </a>
          <a href={shift.maps} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#dbeafe] text-[#1e40af] hover:bg-[#bfdbfe] transition no-underline">
            <MapIcon /> Get directions
          </a>
          <button onClick={() => openMsg(shift)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#f3f4f6] text-[#374151] hover:bg-[#e5e7eb] transition border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>
            <MsgIcon /> Message
          </button>
        </div>
      )}
    </div>
  )
}

// ── Expandable Card ───────────────────────────────────────────
function ShiftCard({ shift, onAccept, onDecline, openMsg, showStatus }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`bg-white border rounded-[10px] mb-1 overflow-hidden transition-all ${open ? 'border-[#1a7f5e]' : 'border-[#e5e7eb]'}`}>
      <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-[11px] font-black flex-shrink-0" style={{ background: shift.bg, color: shift.color }}>{shift.initials}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-extrabold text-[#1a1a1a] truncate mb-0.5">{shift.office}</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-[#6b7280] font-medium">{shift.date}</span>
            <div className="w-[2px] h-[2px] rounded-full bg-[#d1d5db] flex-shrink-0"/>
            <span className="text-[11px] text-[#6b7280] font-medium">{shift.time}</span>
            {shift.tags?.map((t, i) => (
              <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: t.bg, color: t.color }}>{t.label}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[16px] font-black text-[#1a7f5e]">{shift.pay}</span>
          {showStatus && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8f5f0] text-[#1a7f5e]">Accepted</span>}
          <div className={`w-[20px] h-[20px] rounded-full bg-[#f3f4f6] flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
      </div>
      {open && (
        <DetailPanel
          shift={shift}
          onAccept={() => onAccept && onAccept(shift.id)}
          onDecline={() => onDecline && onDecline(shift.id)}
          openMsg={openMsg}
        />
      )}
    </div>
  )
}

// ── Calendar ──────────────────────────────────────────────────
function CalendarView({ openMsg, showToast }) {
  const today = new Date()
  const [month, setMonth] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [selected, setSelected] = useState(null)

  const changeMonth = (delta) => {
    let m = month + delta, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m); setYear(y); setSelected(null)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev = new Date(year, month, 0).getDate()
  const total = firstDay + daysInMonth
  const trailing = total % 7 === 0 ? 0 : 7 - (total % 7)

  const getShift = (d) => CAL_SHIFTS[`${year}-${month + 1}-${d}`]

  const selectedShift = selected ? getShift(selected) : null

  return (
    <div>
      <div className="bg-white border border-[#e5e7eb] rounded-[12px] p-3.5 mb-2.5">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => changeMonth(-1)} className="w-[26px] h-[26px] rounded-[6px] border border-[#e5e7eb] flex items-center justify-center text-[16px] text-[#6b7280] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition bg-white cursor-pointer" style={{ fontFamily: 'inherit', lineHeight: 1 }}>‹</button>
          <span className="text-[13px] font-extrabold text-[#1a1a1a]">{MONTHS[month]} {year}</span>
          <button onClick={() => changeMonth(1)} className="w-[26px] h-[26px] rounded-[6px] border border-[#e5e7eb] flex items-center justify-center text-[16px] text-[#6b7280] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition bg-white cursor-pointer" style={{ fontFamily: 'inherit', lineHeight: 1 }}>›</button>
        </div>

        <div className="grid grid-cols-7 gap-[3px] mb-1.5">
          {DAYS.map(d => <div key={d} className="text-center text-[9px] font-extrabold text-[#9ca3af] uppercase py-1">{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-[3px]">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`p${i}`} className="text-center text-[12px] py-[5px] rounded-[6px] text-[#d1d5db]">{daysInPrev - firstDay + i + 1}</div>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1
            const shift = getShift(d)
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === d
            const isSelected = selected === d
            let cls = 'text-center text-[12px] font-semibold py-[5px] rounded-[6px] cursor-pointer transition-all min-h-[28px] flex items-center justify-center'
            if (isToday) cls += ' bg-[#1a7f5e] text-white font-black'
            else if (shift?.type === 'pending') cls += ' bg-[#fef9c3] text-[#92400e] font-extrabold'
            else if (shift?.type === 'accepted') cls += ' bg-[#e8f5f0] text-[#1a7f5e] font-extrabold'
            else cls += ' text-[#374151] hover:bg-[#f3f4f6]'
            if (isSelected) cls += ' outline outline-2 outline-[#1a7f5e] outline-offset-1'
            return <div key={d} className={cls} onClick={() => setSelected(d === selected ? null : d)}>{d}</div>
          })}
          {Array.from({ length: trailing }, (_, i) => (
            <div key={`t${i}`} className="text-center text-[12px] py-[5px] rounded-[6px] text-[#d1d5db]">{i + 1}</div>
          ))}
        </div>

        <div className="flex gap-3.5 mt-2.5 pt-2.5 border-t border-[#f3f4f6]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]"><div className="w-[10px] h-[10px] rounded-[3px] bg-[#fef9c3] border border-[#f59e0b]"/> Pending</div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#6b7280]"><div className="w-[10px] h-[10px] rounded-[3px] bg-[#e8f5f0] border border-[#1a7f5e]"/> Accepted</div>
        </div>
      </div>

      {selected && selectedShift && (
        <div className="bg-white border border-[#e5e7eb] rounded-[12px] overflow-hidden">
          <div className="px-3.5 py-3 border-b border-[#f3f4f6] flex items-center gap-2.5">
            <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center text-[11px] font-black flex-shrink-0" style={{ background: selectedShift.bg, color: selectedShift.color }}>{selectedShift.initials}</div>
            <div>
              <div className="text-[13px] font-extrabold text-[#1a1a1a]">{selectedShift.office}</div>
              <div className="text-[11px] text-[#9ca3af]">{MONTHS[month]} {selected}, {year}</div>
            </div>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedShift.type === 'pending' ? 'bg-[#fef9c3] text-[#92400e]' : 'bg-[#e8f5f0] text-[#1a7f5e]'}`}>
              {selectedShift.type === 'pending' ? 'Pending' : 'Accepted'}
            </span>
          </div>
          <DetailPanel
            shift={selectedShift}
            onAccept={() => showToast('Shift accepted!')}
            onDecline={() => { setSelected(null); showToast('Shift declined.') }}
            openMsg={openMsg}
          />
        </div>
      )}

      {selected && !selectedShift && (
        <div className="bg-white border border-[#e5e7eb] rounded-[12px] p-4 text-center text-[#9ca3af] text-[13px]">No shifts on this day</div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function ShiftRequests() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')
  const [view, setView] = useState('list')
  const [pending, setPending] = useState(PENDING)
  const [approved, setApproved] = useState(APPROVED_INIT)
  const [declined, setDeclined] = useState(DECLINED_INIT)
  const [toast, setToast] = useState(null)
  const [msgModal, setMsgModal] = useState(null)
  const [msgText, setMsgText] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleAccept = (id) => {
    const shift = pending.find(s => s.id === id)
    setPending(prev => prev.filter(s => s.id !== id))
    setApproved(prev => [{ ...shift, type: 'accepted', phone: 'tel:+17135550000', maps: `https://maps.google.com/?q=${shift.office}+Houston+TX` }, ...prev])
    showToast('Shift accepted!')
  }

  const handleDecline = (id) => {
    const shift = pending.find(s => s.id === id)
    setPending(prev => prev.filter(s => s.id !== id))
    setDeclined(prev => [shift, ...prev])
    showToast('Shift declined.')
  }

  const openMsg = (shift) => {
    setMsgModal({ office: shift.office, initials: shift.initials, bg: shift.bg, color: shift.color })
    setMsgText('')
  }

  const sendMsg = () => {
    if (!msgText.trim()) return
    setMsgModal(null)
    showToast('Message sent!')
  }

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

      {/* Message Modal */}
      {msgModal && (
        <div className="fixed inset-0 bg-black/45 z-[200] flex items-end justify-center" onClick={() => setMsgModal(null)}>
          <div className="bg-white rounded-[20px_20px_0_0] w-full max-w-[520px] mx-auto px-[18px] pb-8 pt-5 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-9 h-1 bg-[#e5e7eb] rounded-full mx-auto mb-5"/>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ background: msgModal.bg, color: msgModal.color }}>{msgModal.initials}</div>
              <div>
                <div className="text-[14px] font-extrabold text-[#1a1a1a]">{msgModal.office}</div>
                <div className="text-[11px] text-[#9ca3af]">Send a message</div>
              </div>
            </div>
            <textarea
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              placeholder="Type your message..."
              className="w-full border border-[#e5e7eb] rounded-[12px] px-3.5 py-3 text-[14px] outline-none resize-none h-[100px] bg-[#f9f8f6] text-[#1a1a1a] mb-3 focus:border-[#1a7f5e]"
              style={{ fontFamily: 'inherit' }}
            />
            <div className="flex gap-2">
              <button onClick={() => setMsgModal(null)} className="flex-1 bg-white text-[#374151] border border-[#e5e7eb] rounded-full py-2.5 text-[13px] font-bold cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
              <button onClick={sendMsg} className="flex-[2] bg-[#1a7f5e] hover:bg-[#156649] text-white rounded-full py-2.5 text-[13px] font-extrabold border-none cursor-pointer transition" style={{ fontFamily: 'inherit' }}>Send message</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[520px] mx-auto px-3.5 py-4 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-0.5">
          <h1 className="text-[20px] font-black text-[#1a1a1a]">Shift Requests</h1>
          <div className="flex bg-[#f3f4f6] rounded-[8px] p-[3px] gap-[2px]">
            <button onClick={() => setView('list')} className={`flex items-center gap-1 px-2.5 py-[5px] rounded-[6px] text-[11px] font-bold border-none cursor-pointer transition ${view === 'list' ? 'bg-white text-[#1a7f5e] shadow-sm' : 'bg-transparent text-[#6b7280]'}`} style={{ fontFamily: 'inherit' }}>
              <ListIcon /> List
            </button>
            <button onClick={() => setView('calendar')} className={`flex items-center gap-1 px-2.5 py-[5px] rounded-[6px] text-[11px] font-bold border-none cursor-pointer transition ${view === 'calendar' ? 'bg-white text-[#1a7f5e] shadow-sm' : 'bg-transparent text-[#6b7280]'}`} style={{ fontFamily: 'inherit' }}>
              <CalIcon /> Calendar
            </button>
          </div>
        </div>
        <p className="text-[13px] text-[#9ca3af] mb-4">Offices invite you — accept or decline on your terms</p>

        {/* Calendar View */}
        {view === 'calendar' && <CalendarView openMsg={openMsg} showToast={showToast} />}

        {/* List View */}
        {view === 'list' && (
          <>
            <div className="flex gap-1.5 mb-4">
              {[
                { key: 'pending', label: 'Pending', count: pending.length },
                { key: 'approved', label: 'Approved', count: approved.length },
                { key: 'declined', label: 'Declined', count: declined.length },
              ].map(({ key, label, count }) => (
                <button key={key} onClick={() => setTab(key)} className={`px-3 py-[5px] rounded-full border text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition ${tab === key ? 'border-[#1a7f5e] text-[#1a7f5e] bg-white' : 'border-[#e5e7eb] text-[#6b7280] bg-white'}`} style={{ fontFamily: 'inherit' }}>
                  {label}
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-[#e8f5f0] text-[#1a7f5e]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>{count}</span>
                </button>
              ))}
            </div>

            {tab === 'pending' && (
              pending.length === 0
                ? <div className="text-center py-16 text-[#9ca3af]"><p className="text-[15px] font-semibold text-[#1a1a1a]">No pending requests</p><p className="text-[13px] mt-1">You're all caught up!</p></div>
                : pending.map(s => <ShiftCard key={s.id} shift={s} onAccept={handleAccept} onDecline={handleDecline} openMsg={openMsg} />)
            )}

            {tab === 'approved' && approved.map(s => (
              <ShiftCard key={s.id} shift={s} openMsg={openMsg} showStatus />
            ))}

            {tab === 'declined' && (
              declined.length === 0
                ? <div className="text-center py-16 text-[#9ca3af]"><p className="text-[15px] font-semibold text-[#1a1a1a]">No declined shifts</p></div>
                : declined.map(s => (
                  <div key={s.id} className="bg-white border border-[#e5e7eb] rounded-[10px] px-3 py-2.5 mb-1 flex items-center gap-2.5">
                    <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center text-[8px] font-black flex-shrink-0" style={{ background: s.bg, color: s.color }}>{s.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-bold text-[#1a1a1a] truncate">{s.office}</div>
                      <div className="text-[11px] text-[#9ca3af]">{s.date} · {s.time} · {s.rate}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b] flex-shrink-0">Declined</span>
                  </div>
                ))
            )}
          </>
        )}
      </div>

      {/* Mobile toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] z-50">
        <div className="flex">
          {[
            { label: 'Home', path: '/provider-dashboard', icon: <HomeIcon />, active: false },
            { label: 'Requests', path: '/provider-requests', icon: <ReqIcon />, active: true, badge: pending.length },
            { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon />, active: false },
            { label: 'Messages', path: '/provider-messages', icon: <MsgIcon />, active: false },
            { label: 'Earnings', path: '/provider-earnings', icon: <EarnIcon />, active: false },
          ].map(({ label, path, icon, active, badge }) => (
            <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
              <div className="relative">
                <span className={active ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}>{icon}</span>
                {badge > 0 && <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{badge}</span>}
              </div>
              <span className={`text-[10px] ${active ? 'font-bold text-[#1a7f5e]' : 'font-semibold text-[#9ca3af]'}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ListIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> }
function CalIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function PhoneIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.56 2 2 0 0 1 3.6 1.37h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> }
function MapIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function MsgIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function HomeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function EarnIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
