import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ProviderNav from '../components/ProviderNav'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['SU','MO','TU','WE','TH','FR','SA']

const CheckIcon = () => <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>

function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width:36,height:20,borderRadius:100,cursor:'pointer',position:'relative',transition:'background .2s',flexShrink:0,background:on?'#1a7f5e':'#e5e7eb' }}>
      <div style={{ position:'absolute',top:2,width:16,height:16,borderRadius:'50%',background:'white',transition:'left .2s',boxShadow:'0 1px 2px rgba(0,0,0,.15)',left:on?18:2 }}/>
    </div>
  )
}

function TypeOption({ icon, label, selected, color, onClick }) {
  const borderColor = selected ? color : '#e5e7eb'
  const bg = selected ? (color === '#1a7f5e' ? '#f0faf5' : '#f5f3ff') : 'white'
  const labelColor = selected ? color : '#374151'
  return (
    <div onClick={onClick} style={{ border:`1.5px solid ${borderColor}`,borderRadius:9,padding:'8px 6px',textAlign:'center',cursor:'pointer',background:bg,transition:'all .15s' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:22,marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:10,fontWeight:700,color:labelColor }}>{label}</div>
    </div>
  )
}

export default function ProviderAvailability() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const today = new Date()

  const [monthIdx, setMonthIdx] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [view, setView] = useState('cal')
  const [toast, setToast] = useState(null)
  const [providerId, setProviderId] = useState(null)
  const [availability, setAvailability] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Schedule toggles
  const [schedule, setSchedule] = useState({
    Mon: { on:false, start:'8:00 AM', end:'5:00 PM' },
    Tue: { on:false, start:'8:00 AM', end:'5:00 PM' },
    Wed: { on:false, start:'8:00 AM', end:'5:00 PM' },
    Thu: { on:false, start:'8:00 AM', end:'5:00 PM' },
    Fri: { on:false, start:'8:00 AM', end:'5:00 PM' },
    Sat: { on:false, start:'8:00 AM', end:'5:00 PM' },
    Sun: { on:false, start:'8:00 AM', end:'5:00 PM' },
  })

  // Modals
  const [modal, setModal] = useState(null) // 'add-exc' | 'block' | 'day' | 'booked'
  const [activeDayNum, setActiveDayNum] = useState(null)
  const [bookedDayData, setBookedDayData] = useState(null)
  const [excType, setExcType] = useState('custom')
  const [dayType, setDayType] = useState('available')
  const [excDate, setExcDate] = useState('')
  const [excNote, setExcNote] = useState('')
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [dayStart, setDayStart] = useState('8:00 AM')
  const [dayEnd, setDayEnd] = useState('5:00 PM')
  const [dayNote, setDayNote] = useState('')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const closeModal = () => setModal(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }
        const meRes = await fetch(`${API_URL}/api/providers/me`, { headers })
        if (meRes.ok) {
          const profile = await meRes.json()
          setProviderId(profile.id)
          const [availRes, bookRes] = await Promise.all([
            fetch(`${API_URL}/api/providers/${profile.id}/availability`, { headers }),
            fetch(`${API_URL}/api/bookings?status=CONFIRMED`, { headers }),
          ])
          if (availRes.ok) {
            const slots = await availRes.json()
            setAvailability(slots)
            // Seed schedule toggles from dayOfWeek-based slots
            const dowNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
            const updates = {}
            slots.forEach(slot => {
              if (slot.dayOfWeek != null && !slot.date) {
                const name = dowNames[slot.dayOfWeek]
                if (name) updates[name] = { on: true, start: slot.startTime, end: slot.endTime }
              }
            })
            if (Object.keys(updates).length > 0) {
              setSchedule(prev => ({ ...prev, ...updates }))
            }
          }
          if (bookRes.ok) setBookings(await bookRes.json())
        }
      } catch {}
      setLoading(false)
    }
    fetchData()
  }, [getToken])

  const refreshAvailability = async () => {
    if (!providerId) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/providers/${providerId}/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setAvailability(await res.json())
    } catch {}
  }

  const changeMonth = (delta) => {
    let m = monthIdx + delta, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonthIdx(m); setYear(y)
  }

  // Build calendar lookup
  const availMap = {}
  const excMap = {}
  const shortTime = (t) => t.replace(':00 ', '').replace('AM', 'AM').replace('PM', 'PM')
  const schedDayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const daysInView = new Date(year, monthIdx + 1, 0).getDate()

  // 1. Weekly schedule toggles are the source of truth for recurring days
  for (const [day, val] of Object.entries(schedule)) {
    if (val.on) {
      const dow = schedDayMap[day]
      for (let d = 1; d <= daysInView; d++) {
        if (new Date(year, monthIdx, d).getDay() === dow) {
          availMap[d] = { time: `${shortTime(val.start)}\u2013${shortTime(val.end)}`, id: null }
        }
      }
    }
  }
  // 2. Date-specific slots from API (override weekly schedule for that date)
  availability.forEach(slot => {
    if (slot.date) {
      const d = new Date(slot.date)
      if (d.getFullYear() === year && d.getMonth() === monthIdx) {
        const day = d.getDate()
        if (slot.isException) {
          excMap[day] = { sub: `${slot.startTime}\u2013${slot.endTime}`, id: slot.id }
          delete availMap[day] // exception overrides weekly schedule
        } else {
          availMap[day] = { time: `${slot.startTime}\u2013${slot.endTime}`, id: slot.id }
        }
      }
    }
  })
  // Build booked days from bookings
  const bookedMap = {}
  bookings.forEach(b => {
    if (b.shift) {
      const d = new Date(b.shift.date)
      if (d.getFullYear() === year && d.getMonth() === monthIdx) {
        const day = d.getDate()
        bookedMap[day] = { office: b.office?.name || 'Office', time: `${b.shift.startTime}\u2013${b.shift.endTime}`, id: b.id }
        // Booked days override available days
        delete availMap[day]
      }
    }
  })

  const availCount = Object.keys(availMap).length + Object.keys(excMap).length
  const bookedCount = Object.keys(bookedMap).length

  // Save weekly schedule
  const saveSchedule = async () => {
    if (!providerId) return
    try {
      const token = await getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      const dayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
      for (const [day, val] of Object.entries(schedule)) {
        if (val.on) {
          await fetch(`${API_URL}/api/providers/${providerId}/availability`, {
            method: 'POST', headers,
            body: JSON.stringify({ dayOfWeek: dayMap[day], startTime: val.start, endTime: val.end }),
          })
        }
      }
      showToast('Schedule saved!')
      await refreshAvailability()
    } catch { showToast('Failed to save schedule') }
  }

  // Save exception
  const saveException = async () => {
    if (!providerId || !excDate) { showToast('Please select a date'); return }
    try {
      const token = await getToken()
      await fetch(`${API_URL}/api/providers/${providerId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: new Date(excDate).toISOString(), startTime: '8:00 AM', endTime: '5:00 PM', isException: true, note: excNote || null }),
      })
      closeModal()
      showToast('Exception saved!')
      await refreshAvailability()
    } catch { showToast('Failed to save exception') }
  }

  // Block dates
  const saveBlockDates = async (startDate, endDate, reason) => {
    if (!providerId || !startDate || !endDate) { showToast('Please select dates'); return }
    try {
      const token = await getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      const start = new Date(startDate)
      const end = new Date(endDate)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        await fetch(`${API_URL}/api/providers/${providerId}/availability`, {
          method: 'POST', headers,
          body: JSON.stringify({ date: new Date(d).toISOString(), startTime: '12:00 AM', endTime: '12:00 AM', isException: true, note: reason || 'Blocked' }),
        })
      }
      closeModal()
      showToast('Dates blocked!')
      await refreshAvailability()
    } catch { showToast('Failed to block dates') }
  }

  // Save day edit (DELETE old + POST new)
  const saveDayEdit = async (dayStart, dayEnd, dayNote) => {
    if (!providerId || !activeDayNum) return
    try {
      const token = await getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      // Delete existing slot if any
      const existingSlot = availMap[activeDayNum] || excMap[activeDayNum]
      if (existingSlot && existingSlot.id) {
        await fetch(`${API_URL}/api/providers/${providerId}/availability/${existingSlot.id}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
        })
      }
      // Create new slot
      const date = new Date(year, monthIdx, activeDayNum)
      await fetch(`${API_URL}/api/providers/${providerId}/availability`, {
        method: 'POST', headers,
        body: JSON.stringify({ date: date.toISOString(), startTime: dayStart, endTime: dayEnd, isException: dayType === 'custom', note: dayNote || null }),
      })
      closeModal()
      showToast('Day updated!')
      await refreshAvailability()
    } catch { showToast('Failed to update day') }
  }

  // Copy to next month
  const copyToNextMonth = async () => {
    if (!providerId) return
    try {
      const token = await getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      const currentSlots = availability.filter(slot => {
        if (!slot.date) return false
        const d = new Date(slot.date)
        return d.getFullYear() === year && d.getMonth() === monthIdx
      })
      let nextMonth = monthIdx + 1, nextYear = year
      if (nextMonth > 11) { nextMonth = 0; nextYear++ }
      for (const slot of currentSlots) {
        const oldDate = new Date(slot.date)
        const newDate = new Date(nextYear, nextMonth, oldDate.getDate())
        if (newDate.getMonth() !== nextMonth) continue // skip invalid dates (e.g. 31st)
        await fetch(`${API_URL}/api/providers/${providerId}/availability`, {
          method: 'POST', headers,
          body: JSON.stringify({ date: newDate.toISOString(), startTime: slot.startTime, endTime: slot.endTime, isException: slot.isException || false, note: slot.note || null }),
        })
      }
      showToast('Copied to next month!')
      await refreshAvailability()
    } catch { showToast('Failed to copy to next month') }
  }

  const firstDay = new Date(year, monthIdx, 1).getDay()
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const daysInPrev = new Date(year, monthIdx, 0).getDate()
  const total = firstDay + daysInMonth
  const trailing = total % 7 === 0 ? 0 : 7 - (total % 7)
  const isCurrent = today.getFullYear() === year && today.getMonth() === monthIdx

  const s = {
    card: { background:'white',border:'1.5px solid #e5e7eb',borderRadius:14,padding:16 },
    label: { fontSize:10,fontWeight:800,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6,display:'block' },
    input: { width:'100%',border:'1.5px solid #e5e7eb',borderRadius:9,padding:'8px 11px',fontSize:13,fontFamily:'inherit',outline:'none',color:'#374151',background:'white',marginBottom:12,boxSizing:'border-box' },
    modalBtn: { flex:1,background:'#1a7f5e',color:'white',border:'none',fontWeight:700,padding:10,borderRadius:100,fontSize:13,cursor:'pointer',fontFamily:'inherit' },
    cancelBtn: { flex:1,border:'1.5px solid #e5e7eb',color:'#374151',fontWeight:700,padding:10,borderRadius:100,fontSize:13,cursor:'pointer',fontFamily:'inherit',background:'white' },
  }

  const times = ['6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','5:30 PM','6:00 PM']

  const CalendarIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  const ListIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
  const ClockIcon = ({ color='#374151' }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  const BlockIcon = ({ color='#374151' }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
  const AvailIcon = ({ color='#374151' }) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>

  // Render calendar days
  const renderDays = () => {
    const days = []
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`e${i}`} style={{ height:46 }}/>)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = isCurrent && d === today.getDate()
      const isBooked = bookedMap[d]
      const isExc = excMap[d]
      const isAvail = availMap[d]
      let bg = 'transparent', color = '#d1d5db', sub = '', cursor = 'default', onClick = null, border = '1.5px solid transparent'

      if (isToday) { bg='#1a7f5e'; color='white'; sub='Today'; cursor='pointer'; onClick=()=>{setActiveDayNum(d);setDayType('available');setDayStart('8:00 AM');setDayEnd('5:00 PM');setDayNote('');setModal('day')} }
      else if (isBooked) { bg='#fef3c7'; color='#92400e'; sub=isBooked.office.split(' ')[0]; cursor='pointer'; onClick=()=>{setBookedDayData({...isBooked,day:d});setModal('booked')} }
      else if (isExc) { bg='#e8f5f0'; color='#166534'; sub=isExc.sub; cursor='pointer'; onClick=()=>{setActiveDayNum(d);setDayType('custom');setDayStart('8:00 AM');setDayEnd('5:00 PM');setDayNote('');setModal('day')} }
      else if (isAvail) { bg='#e8f5f0'; color='#166534'; sub=isAvail.time; cursor='pointer'; onClick=()=>{setActiveDayNum(d);setDayType('available');setDayStart('8:00 AM');setDayEnd('5:00 PM');setDayNote('');setModal('day')} }

      days.push(
        <div key={d} onClick={onClick} style={{ height:46,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderRadius:8,fontSize:12,fontWeight:600,background:bg,color,cursor,border,gap:1,transition:'all .15s' }}
          onMouseEnter={e=>{ if(onClick) e.currentTarget.style.opacity='.8' }}
          onMouseLeave={e=>{ e.currentTarget.style.opacity='1' }}>
          <span>{d}</span>
          {sub && <span style={{ fontSize:8,fontWeight:700,opacity:.9,lineHeight:1 }}>{sub}</span>}
        </div>
      )
    }
    for (let i = 0; i < trailing; i++) {
      days.push(<div key={`t${i}`} style={{ height:46 }}/>)
    }
    return days
  }

  return (
    <div style={{ minHeight:'100vh',background:'#f9f8f6',fontFamily:"'DM Sans',-apple-system,sans-serif" }}>
      <ProviderNav />

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed',bottom:90,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'white',fontSize:13,fontWeight:600,padding:'10px 18px',borderRadius:100,zIndex:600,display:'flex',alignItems:'center',gap:8,whiteSpace:'nowrap',boxShadow:'0 4px 20px rgba(0,0,0,.2)' }}>
          <div style={{ width:17,height:17,borderRadius:'50%',background:'#1a7f5e',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}><CheckIcon /></div>
          {toast}
        </div>
      )}

      {/* Overlay */}
      {modal && <div onClick={closeModal} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:300 }}/>}

      <div style={{ maxWidth:1000,margin:'0 auto',padding:'24px 32px 100px' }}>

        {/* Back + Header */}
        <button onClick={() => navigate('/provider-profile')} style={{ display:'inline-flex',alignItems:'center',gap:5,fontSize:13,fontWeight:600,color:'#1a7f5e',cursor:'pointer',background:'none',border:'none',fontFamily:'inherit',marginBottom:6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to profile
        </button>
        <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18 }}>
          <div>
            <div style={{ fontSize:24,fontWeight:900,color:'#1a1a1a',marginBottom:3 }}>Availability</div>
            <div style={{ fontSize:13,color:'#9ca3af' }}>Manage your schedule and set exceptions for specific dates</div>
          </div>
          <button onClick={() => { setExcDate(''); setExcNote(''); setExcType('custom'); setModal('add-exc') }} style={{ background:'#1a7f5e',color:'white',border:'none',fontWeight:700,padding:'8px 14px',borderRadius:100,fontSize:12,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add exception
          </button>
        </div>

        {/* Stats */}
        <div style={{ display:'flex',gap:10,marginBottom:20 }}>
          <div style={{ background:'white',border:'1.5px solid #e5e7eb',borderRadius:12,padding:'12px 18px',flex:1,textAlign:'center' }}>
            <div style={{ fontSize:20,fontWeight:900,color:'#1a7f5e',lineHeight:1,marginBottom:3 }}>{availCount}</div>
            <div style={{ fontSize:11,color:'#9ca3af',fontWeight:600 }}>Available days this month</div>
          </div>
          <div style={{ background:'white',border:'1.5px solid #e5e7eb',borderRadius:12,padding:'12px 18px',flex:1,textAlign:'center' }}>
            <div style={{ fontSize:20,fontWeight:900,color:'#F97316',lineHeight:1,marginBottom:3 }}>{bookedCount}</div>
            <div style={{ fontSize:11,color:'#9ca3af',fontWeight:600 }}>Booked shifts this month</div>
          </div>
        </div>

        {/* Main grid */}
        <div style={{ display:'grid',gridTemplateColumns:'1fr 280px',gap:16,alignItems:'start' }}>

          {/* Calendar card */}
          <div style={s.card}>
            {/* View toggle */}
            <div style={{ display:'flex',background:'#f3f4f6',borderRadius:9,padding:3,gap:2,marginBottom:14 }}>
              {[['cal','Calendar',<CalendarIcon/>],['list','List',<ListIcon/>]].map(([v,lbl,icon])=>(
                <button key={v} onClick={()=>setView(v)} style={{ flex:1,padding:'6px 10px',borderRadius:7,border:'none',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',color:view===v?'#1a1a1a':'#9ca3af',background:view===v?'white':'transparent',boxShadow:view===v?'0 1px 3px rgba(0,0,0,.08)':'none',display:'flex',alignItems:'center',justifyContent:'center',gap:5,transition:'all .15s' }}>
                  {icon}{lbl}
                </button>
              ))}
            </div>

            {/* Calendar */}
            {view === 'cal' && (
              <div>
                <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12 }}>
                  <button onClick={()=>changeMonth(-1)} style={{ background:'none',border:'1.5px solid #e5e7eb',borderRadius:8,width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#6b7280' }}>&#8249;</button>
                  <span style={{ fontSize:15,fontWeight:900,color:'#1a1a1a' }}>{MONTHS[monthIdx]} {year}</span>
                  <button onClick={()=>changeMonth(1)} style={{ background:'none',border:'1.5px solid #e5e7eb',borderRadius:8,width:28,height:28,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,color:'#6b7280' }}>&#8250;</button>
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:4 }}>
                  {DAYS.map(d=><div key={d} style={{ textAlign:'center',fontSize:10,fontWeight:700,color:'#9ca3af',textTransform:'uppercase',padding:'2px 0' }}>{d}</div>)}
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3,marginBottom:12 }}>
                  {renderDays()}
                </div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:10 }}>
                  {[['#e8f5f0','#1a7f5e','Available'],['#fef3c7','#f59e0b','Booked']].map(([bg,bd,lbl])=>(
                    <div key={lbl} style={{ display:'flex',alignItems:'center',gap:4,fontSize:11,color:'#6b7280' }}>
                      <div style={{ width:9,height:9,borderRadius:2,background:bg,border:`1px solid ${bd}` }}/>
                      {lbl}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List view */}
            {view === 'list' && (
              <div>
                {availCount === 0 && bookedCount === 0 ? (
                  <div style={{ textAlign:'center', padding:'40px 20px' }}>
                    <div style={{ width:48, height:48, borderRadius:'50%', background:'#e8f5f0', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:'#1a1a1a', marginBottom:4 }}>No availability set yet</div>
                    <div style={{ fontSize:13, color:'#9ca3af', maxWidth:260, margin:'0 auto' }}>Set your weekly schedule or add specific dates to let offices know when you're available.</div>
                  </div>
                ) : (
                  [
                    ...Object.entries(availMap).map(([day, val]) => ({ type:'available', day:Number(day), date:`${MONTHS[monthIdx]} ${day}`, time:val.time, note:null, id:val.id })),
                    ...Object.entries(excMap).map(([day, val]) => ({ type:'exception', day:Number(day), date:`${MONTHS[monthIdx]} ${day}`, time:val.sub, note:'Exception', id:val.id })),
                    ...Object.entries(bookedMap).map(([day, val]) => ({ type:'booked', day:Number(day), date:`${MONTHS[monthIdx]} ${day}`, time:val.time, office:val.office, id:val.id })),
                  ].sort((a,b) => a.day - b.day).map((row,i)=>{
                    const isBooked = row.type === 'booked'
                    const bg = isBooked ? '#fffbeb' : '#f0faf5'
                    const borderColor = isBooked ? '#fde68a' : '#d1fae5'
                    const dotColor = isBooked ? '#f59e0b' : '#1a7f5e'
                    const timeColor = isBooked ? '#92400e' : '#1a7f5e'
                    return (
                      <div key={i} onClick={()=>{if(isBooked){setBookedDayData({...row,day:row.day});setModal('booked')}else{setActiveDayNum(row.day);setDayType(row.type==='exception'?'custom':'available');setModal('day')}}} style={{ display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:9,marginBottom:4,border:`1.5px solid ${borderColor}`,background:bg,cursor:'pointer',transition:'all .15s' }}>
                        <div style={{ width:7,height:7,borderRadius:'50%',background:dotColor,flexShrink:0 }}/>
                        <div style={{ fontSize:12,fontWeight:800,color:'#1a1a1a',width:80,flexShrink:0 }}>{row.date}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12,fontWeight:700,color:timeColor }}>{isBooked ? row.office : row.time}</div>
                          <div style={{ fontSize:10,color:'#9ca3af',marginTop:1 }}>{isBooked ? row.time : (row.note || 'General schedule')}</div>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Weekly schedule */}
          <div style={s.card}>
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14 }}>
              <span style={{ fontSize:13,fontWeight:800,color:'#1a1a1a' }}>Weekly schedule</span>
              <button onClick={saveSchedule} style={{ background:'white',color:'#1a7f5e',border:'1.5px solid #1a7f5e',fontWeight:700,padding:'5px 12px',borderRadius:100,fontSize:11,cursor:'pointer',fontFamily:'inherit' }}>Save</button>
            </div>
            {Object.entries(schedule).map(([day, val]) => (
              <div key={day} style={{ display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid #f3f4f6' }}>
                <Toggle on={val.on} onToggle={()=>setSchedule(prev=>({...prev,[day]:{...prev[day],on:!prev[day].on}}))} />
                <span style={{ fontSize:12,fontWeight:700,color:val.on?'#1a1a1a':'#9ca3af',width:28,flexShrink:0 }}>{day}</span>
                <select value={val.start} onChange={e=>setSchedule(prev=>({...prev,[day]:{...prev[day],start:e.target.value}}))} disabled={!val.on} style={{ border:'1.5px solid #e5e7eb',borderRadius:7,padding:'4px 4px',fontSize:11,fontFamily:'inherit',outline:'none',color:'#374151',background:'white',cursor:val.on?'pointer':'default',flex:1,minWidth:0,opacity:val.on?1:.35 }}>
                  {times.map(t=><option key={t}>{t}</option>)}
                </select>
                <span style={{ fontSize:10,color:'#d1d5db',flexShrink:0 }}>–</span>
                <select value={val.end} onChange={e=>setSchedule(prev=>({...prev,[day]:{...prev[day],end:e.target.value}}))} disabled={!val.on} style={{ border:'1.5px solid #e5e7eb',borderRadius:7,padding:'4px 4px',fontSize:11,fontFamily:'inherit',outline:'none',color:'#374151',background:'white',cursor:val.on?'pointer':'default',flex:1,minWidth:0,opacity:val.on?1:.35 }}>
                  {times.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            ))}
            <div style={{ marginTop:10,background:'#f9f8f6',borderRadius:8,padding:'8px 10px',fontSize:11,color:'#9ca3af',lineHeight:1.5 }}>
              Default schedule. Use exceptions to override specific dates.
            </div>
            <div style={{ marginTop:12,borderTop:'1px solid #f3f4f6',paddingTop:12 }}>
              <span style={{ fontSize:10,fontWeight:800,color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8,display:'block' }}>Quick actions</span>
              <button onClick={()=>{setBlockStart('');setBlockEnd('');setBlockReason('');setModal('block')}} style={{ background:'white',color:'#374151',border:'1.5px solid #e5e7eb',fontWeight:700,padding:'7px 12px',borderRadius:100,fontSize:12,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5,width:'100%',marginBottom:6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                Block off dates
              </button>
              <button onClick={copyToNextMonth} style={{ background:'white',color:'#374151',border:'1.5px solid #e5e7eb',fontWeight:700,padding:'7px 12px',borderRadius:100,fontSize:12,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',gap:5,width:'100%' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy to next month
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ADD EXCEPTION MODAL */}
      {modal === 'add-exc' && (
        <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'white',borderRadius:18,width:'calc(100% - 32px)',maxWidth:400,zIndex:500,boxShadow:'0 20px 50px rgba(0,0,0,.2)',overflow:'hidden' }}>
          <div style={{ background:'#f9f8f6',borderBottom:'1px solid #e5e7eb',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div><div style={{ fontSize:15,fontWeight:900,color:'#1a1a1a' }}>Add exception</div><div style={{ fontSize:11,color:'#9ca3af',marginTop:2 }}>Set custom hours or block a date</div></div>
            <button onClick={closeModal} style={{ background:'none',border:'none',color:'#9ca3af',fontSize:18,cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ padding:'16px 18px' }}>
            <label style={s.label}>Date</label>
            <input type="date" value={excDate} onChange={e=>setExcDate(e.target.value)} style={s.input}/>
            <label style={{ ...s.label, marginBottom:8 }}>Exception type</label>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12 }}>
              <TypeOption icon={<ClockIcon color={excType==='custom'?'#7c3aed':'#374151'}/>} label="Custom hours" selected={excType==='custom'} color="#7c3aed" onClick={()=>setExcType('custom')}/>
              <TypeOption icon={<AvailIcon color={excType==='available'?'#1a7f5e':'#374151'}/>} label="Make available" selected={excType==='available'} color="#1a7f5e" onClick={()=>setExcType('available')}/>
            </div>
            {excType !== 'block' && (
              <>
                <label style={s.label}>Hours</label>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
                  <div><div style={{ fontSize:10,color:'#9ca3af',marginBottom:4 }}>Start</div><select style={{ ...s.input,marginBottom:0 }}>{times.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div><div style={{ fontSize:10,color:'#9ca3af',marginBottom:4 }}>End</div><select style={{ ...s.input,marginBottom:0 }}>{times.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
              </>
            )}
            <label style={s.label}>Note (optional)</label>
            <input type="text" value={excNote} onChange={e=>setExcNote(e.target.value)} placeholder="e.g. Half day, CE course" style={s.input}/>
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={closeModal} style={s.cancelBtn}>Cancel</button>
              <button onClick={saveException} style={{ ...s.modalBtn,background:'#7c3aed' }}>Save exception</button>
            </div>
          </div>
        </div>
      )}

      {/* BLOCK DATES MODAL */}
      {modal === 'block' && (
        <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'white',borderRadius:18,width:'calc(100% - 32px)',maxWidth:400,zIndex:500,boxShadow:'0 20px 50px rgba(0,0,0,.2)',overflow:'hidden' }}>
          <div style={{ background:'#f9f8f6',borderBottom:'1px solid #e5e7eb',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div><div style={{ fontSize:15,fontWeight:900,color:'#1a1a1a' }}>Block off dates</div><div style={{ fontSize:11,color:'#9ca3af',marginTop:2 }}>Mark a date range as unavailable</div></div>
            <button onClick={closeModal} style={{ background:'none',border:'none',color:'#9ca3af',fontSize:18,cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ padding:'16px 18px' }}>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8 }}>
              <div><label style={s.label}>Start date</label><input type="date" value={blockStart} onChange={e=>setBlockStart(e.target.value)} style={s.input}/></div>
              <div><label style={s.label}>End date</label><input type="date" value={blockEnd} onChange={e=>setBlockEnd(e.target.value)} style={s.input}/></div>
            </div>
            <label style={s.label}>Reason (optional)</label>
            <input type="text" value={blockReason} onChange={e=>setBlockReason(e.target.value)} placeholder="e.g. Vacation, continuing education" style={s.input}/>
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={closeModal} style={s.cancelBtn}>Cancel</button>
              <button onClick={()=>saveBlockDates(blockStart,blockEnd,blockReason)} style={s.modalBtn}>Block dates</button>
            </div>
          </div>
        </div>
      )}

      {/* DAY EDIT MODAL */}
      {modal === 'day' && (
        <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'white',borderRadius:18,width:'calc(100% - 32px)',maxWidth:400,zIndex:500,boxShadow:'0 20px 50px rgba(0,0,0,.2)',overflow:'hidden' }}>
          <div style={{ background:'#f9f8f6',borderBottom:'1px solid #e5e7eb',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div><div style={{ fontSize:15,fontWeight:900,color:'#1a1a1a' }}>{MONTHS[monthIdx]} {activeDayNum}</div><div style={{ fontSize:11,color:'#9ca3af',marginTop:2 }}>Edit availability for this day</div></div>
            <button onClick={closeModal} style={{ background:'none',border:'none',color:'#9ca3af',fontSize:18,cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ padding:'16px 18px' }}>
            <label style={{ ...s.label,marginBottom:8 }}>Status</label>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12 }}>
              <TypeOption icon={<AvailIcon color={dayType==='available'?'#1a7f5e':'#374151'}/>} label="Available" selected={dayType==='available'} color="#1a7f5e" onClick={()=>setDayType('available')}/>
              <TypeOption icon={<ClockIcon color={dayType==='custom'?'#7c3aed':'#374151'}/>} label="Custom hours" selected={dayType==='custom'} color="#7c3aed" onClick={()=>setDayType('custom')}/>
            </div>
            <label style={s.label}>Hours</label>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
              <div><div style={{ fontSize:10,color:'#9ca3af',marginBottom:4 }}>Start</div><select value={dayStart} onChange={e=>setDayStart(e.target.value)} style={{ ...s.input,marginBottom:0 }}>{times.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><div style={{ fontSize:10,color:'#9ca3af',marginBottom:4 }}>End</div><select value={dayEnd} onChange={e=>setDayEnd(e.target.value)} style={{ ...s.input,marginBottom:0 }}>{times.map(t=><option key={t}>{t}</option>)}</select></div>
            </div>
            <label style={s.label}>Note (optional)</label>
            <input type="text" value={dayNote} onChange={e=>setDayNote(e.target.value)} placeholder="Add a note for this day" style={s.input}/>
            <div style={{ display:'flex',gap:8 }}>
              <button onClick={closeModal} style={s.cancelBtn}>Cancel</button>
              <button onClick={()=>saveDayEdit(dayStart,dayEnd,dayNote)} style={s.modalBtn}>Save changes</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKED DAY MODAL */}
      {modal === 'booked' && bookedDayData && (
        <div style={{ position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'white',borderRadius:18,width:'calc(100% - 32px)',maxWidth:380,zIndex:500,boxShadow:'0 20px 50px rgba(0,0,0,.2)',overflow:'hidden' }}>
          <div style={{ background:'#f9f8f6',borderBottom:'1px solid #e5e7eb',padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
            <div>
              <div style={{ fontSize:15,fontWeight:900,color:'#1a1a1a' }}>{MONTHS[monthIdx]} {bookedDayData.day}, {year}</div>
              <div style={{ fontSize:11,color:'#f59e0b',fontWeight:600,marginTop:2 }}>&#9679; Booked shift</div>
            </div>
            <button onClick={closeModal} style={{ background:'none',border:'none',color:'#9ca3af',fontSize:18,cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ padding:'16px 18px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:12,background:'#f9f8f6',border:'1.5px solid #e5e7eb',borderRadius:10,padding:'12px 14px',marginBottom:16 }}>
              <div style={{ width:40,height:40,background:'#e8f5f0',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <div style={{ fontSize:15,fontWeight:800,color:'#1a1a1a' }}>{bookedDayData.office}</div>
                <div style={{ fontSize:12,color:'#6b7280',marginTop:2 }}>{bookedDayData.time}</div>
              </div>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
              <button onClick={()=>{closeModal();showToast('Opening messages...')}} style={{ width:'100%',background:'white',border:'1.5px solid #e5e7eb',color:'#374151',fontWeight:700,padding:'11px 16px',borderRadius:100,fontSize:13,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Message office
              </button>
              <button onClick={()=>{closeModal();showToast('Booking cancelled')}} style={{ width:'100%',background:'white',border:'1.5px solid #fca5a5',color:'#dc2626',fontWeight:700,padding:'11px 16px',borderRadius:100,fontSize:13,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                Cancel booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label:'Home', path:'/provider-dashboard', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
          { label:'Requests', path:'/provider-requests', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg> },
          { label:'Find Shifts', path:'/provider-find-shifts', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          { label:'Messages', path:'/provider-messages', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          { label:'Profile', path:'/provider-profile', icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>, active:true },
        ].map(({label,path,icon,active})=>(
          <div key={label} onClick={()=>navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
            <span style={{color:active?'#1a7f5e':'#9ca3af'}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:active?700:600,color:active?'#1a7f5e':'#9ca3af'}}>{label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
