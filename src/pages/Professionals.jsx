import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function ProAvatar({ src, name, size }) {
  if (src) {
    const url = src.startsWith('http') ? src : `${API_URL}${src}`
    return <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  }
  return <InitialsAvatar name={name} size={size} />
}

const CAL_DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function relDisplay(r) {
  if (r >= 95) return { label: 'Excellent', bg: '#dcfce7', color: '#166534' }
  if (r >= 85) return { label: 'Very Good', bg: '#ede9fe', color: '#5b21b6' }
  if (r >= 70) return { label: 'Good', bg: '#ffedd5', color: '#9a3412' }
  return { label: 'Poor', bg: '#fee2e2', color: '#991b1b' }
}

const CheckIcon = () => (
  <svg width="9" height="7" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
)
const BoltIcon = ({ size = 12, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
)
const CalIcon = ({ size = 15, color = '#1a7f5e' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
)

// ─── PRO CARD ────────────────────────────────────────────────
function ProCard({ pro, rapidSelected, onToggleRapid, onOpenCal, onOpenProfile, onOpenMsg, hasDate }) {
  const isSelected = rapidSelected.includes(pro.id)
  const rel = relDisplay(pro.reliability)
  return (
    <div
      onClick={() => onOpenProfile(pro.id)}
      style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, cursor: 'pointer', transition: 'border-color .15s', boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,.07)' : 'none' }}
    >
      {/* Top section */}
      <div style={{ display: 'flex', gap: 10, padding: 14 }}>
        {/* Checkbox */}
        <div
          onClick={e => { e.stopPropagation(); onToggleRapid(pro.id); }}
          style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${isSelected ? '#1a7f5e' : '#d1d5db'}`, background: isSelected ? '#1a7f5e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, marginTop: 3, transition: 'all .15s' }}
        >
          {isSelected && <CheckIcon />}
        </div>
        {/* Avatar */}
        <ProAvatar src={pro.avatarUrl} name={pro.name} size={68} />
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2 }}>{pro.name}</span>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#1a1a1a', whiteSpace: 'nowrap', flexShrink: 0 }}>${pro.rate}<span style={{ fontSize: 11, fontWeight: 400, color: '#9ca3af' }}>/hr</span></span>
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>{pro.role}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#F97316' }}>★ {pro.rating}</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>({pro.reviews})</span>
          </div>
          {/* Reliability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            <span style={{ fontSize: 13, color: '#374151' }}>Reliability: <span style={{ color: rel.color, fontWeight: 700 }}>{pro.reliability}%</span><span style={{ fontSize: 12, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: rel.bg, color: rel.color, marginLeft: 3 }}>{rel.label}</span></span>
          </div>
          {/* Shifts + Distance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 5, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              <span style={{ fontSize: 13, color: '#374151' }}>{pro.shifts} shifts</span>
            </div>
            {pro.miles != null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e' }}>{pro.miles} mi</span>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px 12px', marginTop: 4 }}>
        <button
          onClick={e => { e.stopPropagation(); onOpenMsg(pro.id) }}
          style={{ flex: 1, border: '1.5px solid #e5e7eb', color: '#374151', background: 'white', fontWeight: 700, padding: '11px 16px', borderRadius: 100, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44 }}
        >
          Message
        </button>
        <button
          onClick={e => { e.stopPropagation(); onOpenCal(pro.id); }}
          style={{ flex: 1, background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 700, padding: '11px 16px', borderRadius: 100, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44 }}
        >
          Book {pro.name.split(' ')[0]}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
    </div>
  )
}

// ─── CALENDAR MODAL ──────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

function CalModal({ pro, onClose, onChoose, getToken }) {
  const today = new Date()
  const [monthIdx, setMonthIdx] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [availability, setAvailability] = useState([])
  const [loadingAvail, setLoadingAvail] = useState(true)

  useEffect(() => {
    if (!pro) return
    const fetchAvail = async () => {
      setLoadingAvail(true)
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/providers/${pro.id}/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setAvailability(await res.json())
      } catch {}
      setLoadingAvail(false)
    }
    fetchAvail()
  }, [pro?.id, getToken])

  if (!pro) return null

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const firstDay = new Date(year, monthIdx, 1).getDay()

  // Build available days from availability data
  const availDays = new Set()
  availability.forEach(slot => {
    if (slot.isException) return
    if (slot.date) {
      const d = new Date(slot.date)
      if (d.getMonth() === monthIdx && d.getFullYear() === year) availDays.add(d.getDate())
    } else if (slot.dayOfWeek != null) {
      for (let d = 1; d <= daysInMonth; d++) {
        if (new Date(year, monthIdx, d).getDay() === slot.dayOfWeek) availDays.add(d)
      }
    }
  })

  const changeMonth = (delta) => {
    let m = monthIdx + delta, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonthIdx(m); setYear(y)
  }

  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 20, width: 'calc(100% - 40px)', maxWidth: 480, zIndex: 500, boxShadow: '0 24px 60px rgba(0,0,0,.2)', overflow: 'hidden' }}>
      <div style={{ background: '#f9f8f6', borderBottom: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ProAvatar src={pro.avatarUrl} name={pro.name} size={46} />
        <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a' }}>{pro.name}</div></div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6b7280', cursor: 'pointer', padding: '0 6px' }}>{'\u2039'}</button>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>{MONTH_NAMES[monthIdx]} {year}</div>
          <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6b7280', cursor: 'pointer', padding: '0 6px' }}>{'\u203a'}</button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 10, justifyContent: 'center' }}>
          {[['#e8f5f0','#1a7f5e','Available'],['#f3f4f6','#d1d5db','Unavailable']].map(([bg,bd,lbl]) => (
            <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
              <div style={{ width: 9, height: 9, borderRadius: 2, background: bg, border: `1px solid ${bd}` }}/>
              {lbl}
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 5 }}>
          {CAL_DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af', padding: 2 }}>{d}</div>)}
        </div>
        {loadingAvail ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>Loading availability...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 10 }}>
            {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} style={{ padding: '10px 4px' }} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const isAvail = availDays.has(day)
              const isToday = today.getFullYear() === year && today.getMonth() === monthIdx && today.getDate() === day
              return (
                <div key={day} onClick={() => isAvail && onChoose(`${MONTH_NAMES[monthIdx]} ${day}`)}
                  style={{ textAlign: 'center', fontSize: 13, fontWeight: isAvail ? 700 : 600, padding: '10px 4px', borderRadius: 7, background: isToday ? '#1a7f5e' : isAvail ? '#e8f5f0' : 'transparent', color: isToday ? 'white' : isAvail ? '#1a7f5e' : '#d1d5db', cursor: isAvail ? 'pointer' : 'default' }}>
                  {day}
                </div>
              )
            })}
          </div>
        )}
        <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>
          {availDays.size > 0 ? 'Tap an available date to book' : 'No availability set for this month'}
        </div>
      </div>
    </div>
  )
}

// ─── BOOKING CHOICE MODAL ────────────────────────────────────
function ChoiceModal({ pro, date, onClose, onDirect, onRapidFill }) {
  if (!pro) return null
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 20, width: 'calc(100% - 40px)', maxWidth: 400, zIndex: 500, boxShadow: '0 24px 60px rgba(0,0,0,.2)', overflow: 'hidden' }}>
      <div style={{ background: '#f9f8f6', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <ProAvatar src={pro.avatarUrl} name={pro.name} size={50} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a1a' }}>{pro.name}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a7f5e', marginTop: 2 }}>{date}, 2026</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>How do you want to fill this shift?</div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Book directly or blast to multiple professionals at once.</div>
        <button onClick={onDirect} style={{ width: '100%', background: '#1a7f5e', border: 'none', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', marginBottom: 10, fontFamily: 'inherit' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 3 }}>Book directly</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)' }}>Send a booking request to this professional only</div>
        </button>
        <button onClick={onRapidFill} style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 7 }}><BoltIcon color="#1a7f5e" />Use Rapid Fill</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Select up to 10 professionals — first to accept gets the shift</div>
        </button>
      </div>
    </div>
  )
}

// ─── DIRECT BOOKING MODAL ────────────────────────────────────
function BookingModal({ pro, date, onClose, onSubmit, getToken }) {
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [startTime, setStartTime] = useState('8:00 AM')
  const [endTime, setEndTime] = useState('5:00 PM')
  const [note, setNote] = useState('')

  const handleSend = async () => {
    if (!agreed || sending) return
    setSending(true)
    try {
      const token = await getToken()
      // Parse the date string (e.g. "April 15") into a real date
      const currentYear = new Date().getFullYear()
      const parsedDate = new Date(`${date}, ${currentYear}`)
      if (parsedDate < new Date()) parsedDate.setFullYear(currentYear + 1)

      const res = await fetch(`${API_URL}/api/applications/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          providerId: pro.id,
          date: parsedDate.toISOString(),
          startTime,
          endTime,
          hourlyRate: pro.rate || 0,
          role: pro.role || 'Dental Professional',
          note: note || null,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const err = await res.json().catch(() => ({}))
        alert(err.error || 'Failed to send booking request')
      }
    } catch {
      alert('Failed to send booking request')
    }
    setSending(false)
  }

  if (!pro) return null
  if (submitted) return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 20, width: 'calc(100% - 40px)', maxWidth: 360, zIndex: 500, boxShadow: '0 24px 60px rgba(0,0,0,.2)', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, background: '#e8f5f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <div style={{ fontSize: 17, fontWeight: 900, color: '#1a7f5e', marginBottom: 6 }}>Booking request sent!</div>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>{pro.name.split(' ')[0]} will be notified and can accept or decline.</div>
      <button onClick={() => { onSubmit(); onClose() }} style={{ background: '#1a7f5e', color: 'white', fontWeight: 700, padding: '10px 28px', borderRadius: 100, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Done</button>
    </div>
  )
  const times = ['6:00 AM','6:30 AM','7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','5:30 PM','6:00 PM']
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 20, width: 'calc(100% - 40px)', maxWidth: 400, zIndex: 500, boxShadow: '0 24px 60px rgba(0,0,0,.2)', overflow: 'hidden' }}>
      <div style={{ background: '#f9f8f6', borderBottom: '1px solid #e5e7eb', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <ProAvatar src={pro.avatarUrl} name={pro.name} size={46} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a' }}>{pro.name}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{pro.role} · ${pro.rate}/hr</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1a7f5e' }}>{date}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: '16px 18px' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Shift times</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <select value={startTime} onChange={e => setStartTime(e.target.value)} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white', color: '#374151' }}>
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={endTime} onChange={e => setEndTime(e.target.value)} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white', color: '#374151' }}>
              {times.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Note (optional)</div>
          <textarea value={note} onChange={e => setNote(e.target.value)} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'none', height: 40, background: 'white', boxSizing: 'border-box' }} placeholder="e.g. Please arrive 10 minutes early..."/>
        </div>
        <div onClick={() => setAgreed(!agreed)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${agreed ? '#1a7f5e' : '#d1d5db'}`, background: agreed ? '#1a7f5e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {agreed && <CheckIcon />}
          </div>
          <div style={{ fontSize: 13, color: '#374151' }}>I agree to kazi.'s <span style={{ color: '#1a7f5e', fontWeight: 600 }}>Booking Terms</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: 10, borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', background: 'white' }}>Cancel</button>
          <button onClick={handleSend} style={{ flex: 1, background: agreed ? '#1a7f5e' : '#e5e7eb', color: agreed ? 'white' : '#9ca3af', border: 'none', fontWeight: 800, padding: 10, borderRadius: 100, fontSize: 13, cursor: agreed ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>{sending ? 'Sending...' : 'Send request'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── RAPID FILL MODAL ────────────────────────────────────────
function RFModal({ selected, allPros, date, onClose, onSend }) {
  const [termsOk, setTermsOk] = useState(false)
  const selPros = allPros.filter(p => selected.includes(p.id))
  return (
    <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 20, width: 'calc(100% - 40px)', maxWidth: 460, zIndex: 500, boxShadow: '0 24px 60px rgba(0,0,0,.2)', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ background: '#f9f8f6', borderBottom: '1px solid #e5e7eb', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0 }}>
        <div style={{ width: 46, height: 46, background: '#1a7f5e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BoltIcon size={20} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#1a1a1a' }}>Rapid Fill ⚡</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{selected.length} professional{selected.length !== 1 ? 's' : ''} · First to accept gets the shift</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Selected Professionals</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {selPros.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 100, padding: '4px 10px 4px 4px' }}>
              <ProAvatar src={p.avatarUrl} name={p.name} size={22} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{p.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Shift Date</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <CalIcon /><span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{date || 'No date selected'}</span>
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Shift Time</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          <div><div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Start</div><select style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white' }}><option>8:00 AM</option><option>7:30 AM</option><option>9:00 AM</option></select></div>
          <div><div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>End</div><select style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white' }}><option>5:00 PM</option><option>4:00 PM</option><option>3:00 PM</option></select></div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Lunch Break</div>
        <select style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: 'white', marginBottom: 14 }}><option>No lunch break</option><option>30 minutes</option><option>1 hour</option></select>
        <div onClick={() => setTermsOk(!termsOk)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${termsOk ? '#1a7f5e' : '#d1d5db'}`, background: termsOk ? '#1a7f5e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
            {termsOk && <CheckIcon />}
          </div>
          <div style={{ fontSize: 13, color: '#374151' }}>I agree to kazi.'s <span style={{ color: '#1a7f5e', fontWeight: 600 }}>Terms & Conditions</span> and confirm this Rapid Fill request will be sent to all selected professionals simultaneously. First to accept gets the shift.</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: 11, borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', background: 'white' }}>Cancel</button>
          <button onClick={() => termsOk && onSend()} style={{ flex: 1, background: termsOk ? '#1a7f5e' : '#e5e7eb', color: termsOk ? 'white' : '#9ca3af', border: 'none', fontWeight: 800, padding: 11, borderRadius: 100, fontSize: 13, cursor: termsOk ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <BoltIcon size={13} />Send to {selected.length}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PROFILE DRAWER ──────────────────────────────────────────
function ProfileCalendar({ pro, getToken, onDateSelect }) {
  const today = new Date()
  const [monthIdx, setMonthIdx] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [availability, setAvailability] = useState([])
  const [bookings, setBookings] = useState([])
  const [loadingAvail, setLoadingAvail] = useState(true)

  useEffect(() => {
    if (!pro) return
    const fetchData = async () => {
      setLoadingAvail(true)
      try {
        const token = await getToken()
        const [availRes, bookRes] = await Promise.all([
          fetch(`${API_URL}/api/providers/${pro.id}/availability`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/providers/${pro.id}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        ])
        if (availRes.ok) setAvailability(await availRes.json())
        if (bookRes?.ok) {
          const data = await bookRes.json()
          setBookings((data.bookings || []).filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED'))
        }
      } catch {}
      setLoadingAvail(false)
    }
    fetchData()
  }, [pro?.id, getToken])

  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const firstDay = new Date(year, monthIdx, 1).getDay()

  // Available days
  const availDays = new Set()
  availability.forEach(slot => {
    if (slot.isException) return
    if (slot.date) {
      const d = new Date(slot.date)
      if (d.getMonth() === monthIdx && d.getFullYear() === year) availDays.add(d.getDate())
    } else if (slot.dayOfWeek != null) {
      for (let d = 1; d <= daysInMonth; d++) {
        if (new Date(year, monthIdx, d).getDay() === slot.dayOfWeek) availDays.add(d)
      }
    }
  })

  // Booked days
  const bookedDays = new Set()
  bookings.forEach(b => {
    if (b.shift?.date) {
      const d = new Date(b.shift.date)
      if (d.getMonth() === monthIdx && d.getFullYear() === year) bookedDays.add(d.getDate())
    }
  })

  const changeMonth = (delta) => {
    let m = monthIdx + delta, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonthIdx(m); setYear(y)
  }

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6b7280', cursor: 'pointer', padding: '0 6px' }}>{'\u2039'}</button>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>{MONTH_NAMES[monthIdx]} {year}</div>
        <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#6b7280', cursor: 'pointer', padding: '0 6px' }}>{'\u203a'}</button>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 10, justifyContent: 'center' }}>
        {[['#e8f5f0','#1a7f5e','Available'],['#fff7ed','#f97316','Booked'],['#f3f4f6','#d1d5db','Unavailable']].map(([bg,bd,lbl]) => (
          <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: bg, border: `1px solid ${bd}` }}/>
            {lbl}
          </div>
        ))}
      </div>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 5 }}>
        {CAL_DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af', padding: 2 }}>{d}</div>)}
      </div>
      {/* Grid */}
      {loadingAvail ? (
        <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af', fontSize: 13 }}>Loading availability...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, marginBottom: 10 }}>
          {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} style={{ padding: '10px 4px' }} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const isAvail = availDays.has(day)
            const isBooked = bookedDays.has(day)
            const isToday = today.getFullYear() === year && today.getMonth() === monthIdx && today.getDate() === day

            let bg = 'transparent', color = '#d1d5db', fw = 600, cursor = 'default'
            if (isToday) { bg = '#1a7f5e'; color = 'white'; fw = 700 }
            else if (isBooked) { bg = '#fff7ed'; color = '#f97316'; fw = 700 }
            else if (isAvail) { bg = '#e8f5f0'; color = '#1a7f5e'; fw = 700; cursor = 'pointer' }

            return (
              <div key={day} onClick={() => isAvail && !isBooked && onDateSelect && onDateSelect(`${MONTH_NAMES[monthIdx]} ${day}`)}
                style={{ textAlign: 'center', fontSize: 13, fontWeight: fw, padding: '10px 4px', borderRadius: 7, background: bg, color, cursor }}>
                {day}
              </div>
            )
          })}
        </div>
      )}
      <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>
        {availDays.size > 0 ? 'Tap an available date to book' : 'No availability set for this month'}
      </div>
    </div>
  )
}

function ProfileDrawer({ pro, onClose, onBook, onDateSelect, onSavePro, isSaved, showToast, getToken }) {
  const [favSaved, setFavSaved] = useState(isSaved)
  if (!pro) return null
  const rel = relDisplay(pro.reliability)
  const firstName = pro.name.split(' ')[0]
  return (
    <div className="md:max-w-[580px]" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, width: '100%', background: 'white', zIndex: 350, display: 'flex', flexDirection: 'column', boxShadow: '-6px 0 40px rgba(0,0,0,.12)', overflowY: 'auto' }}>
      <div onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid #f3f4f6', fontSize: 14, fontWeight: 700, color: '#6b7280', cursor: 'pointer', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to professionals
        </div>
        <button onClick={e => { e.stopPropagation(); setFavSaved(!favSaved); onSavePro(pro.id, !favSaved) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={favSaved ? '#1a7f5e' : 'none'} stroke={favSaved ? '#1a7f5e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <ProAvatar src={pro.avatarUrl} name={pro.name} size={84} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a', marginBottom: 3 }}>{pro.name}</div>
              <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>{pro.role}{pro.miles != null ? ` · ${pro.miles} mi away` : ''}</div>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#1a7f5e', marginBottom: 8 }}>${pro.rate}/hr</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#F97316' }}>★ {pro.rating}</span>
                <span style={{ fontSize: 13, color: '#9ca3af' }}>({pro.reviews} reviews)</span>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: rel.bg, color: rel.color }}>{rel.label} · {pro.reliability}%</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[['Shifts', pro.shifts, '#1a1a1a'], ['Response', pro.responseTime || 'N/A', '#1a1a1a'], ['Reliability', `${pro.reliability}%`, rel.color], ['Score', '94', '#1a7f5e']].map(([label, val, color]) => (
              <div key={label} style={{ background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 900, color }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        {[
          { title: 'About', content: <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{pro.about || 'No bio available.'}</div> },
          { title: 'Availability', content: <ProfileCalendar pro={pro} getToken={getToken} onDateSelect={onDateSelect} /> },
          { title: 'Resume', content: (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, background: '#e8f5f0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{firstName}_Resume.pdf</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>PDF · Tap to download</div>
                </div>
              </div>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
          )},
          { title: 'Practice Software', content: <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(pro.software || []).length > 0 ? pro.software.map(s => <span key={s} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: '#e8f5f0', color: '#0f4d38' }}>{s}</span>) : <span style={{ fontSize: 12, color: '#9ca3af' }}>Not specified</span>}</div> },
          { title: 'Credentials', content: <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{(pro.certs || []).length > 0 ? pro.certs.map(c => <span key={c} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: '#f3f4f6', color: '#374151' }}>✓ {c}</span>) : <span style={{ fontSize: 12, color: '#9ca3af' }}>No credentials listed</span>}</div> },
          { title: 'Reviews', content: (
            <div>
              {(pro.reviewsList || []).length > 0 ? pro.reviewsList.map((r, i) => (
                <div key={i} style={{ borderBottom: '1px solid #f3f4f6', padding: '12px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{r.from}</span>
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#F97316', marginBottom: 5 }}>{'★'.repeat(r.rating || 5)}</div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{r.text}</div>
                </div>
              )) : (
                <div style={{ fontSize: 13, color: '#9ca3af', padding: '8px 0' }}>No reviews yet.</div>
              )}
            </div>
          )}
        ].map(({ title, content }) => (
          <div key={title} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '16px 18px', margin: '0 22px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>{title}</div>
            {content}
          </div>
        ))}
        <div style={{ height: 90 }} />
      </div>
      <div style={{ padding: '16px 22px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10, position: 'sticky', bottom: 0, background: 'white' }}>
        <button style={{ flex: 1, border: '1.5px solid #e5e7eb', color: '#374151', background: 'white', fontWeight: 700, padding: '11px 16px', borderRadius: 100, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>
          Invite
        </button>
        <button onClick={onBook} style={{ flex: 1, background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 800, padding: '11px 16px', borderRadius: 100, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
          Book {firstName}
        </button>
      </div>
    </div>
  )
}

// ─── PRO CALENDAR ───────────────────────────────────────────
function ProCalendar({ professionals, calMonth, calYear, setCalMonth, setCalYear, calSelectedDate, setCalSelectedDate, calDatePros, calLoading, onOpenCal, onBookWithDate, onOpenProfile, onOpenMsg, rapidSelected, onToggleRapid, hasDate }) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Build availability counts per date from provider availability data
  const countsByDate = {}
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // For each day of the month, count providers available
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dateObj = new Date(calYear, calMonth, d)
    const dow = dateObj.getDay()
    let count = 0
    professionals.forEach(p => {
      if (!p.availability) return
      const hasAvail = p.availability.some(a => {
        if (a.date) {
          const aDate = new Date(a.date).toISOString().split('T')[0]
          return aDate === dateStr && !a.isException
        }
        if (a.dayOfWeek != null) return a.dayOfWeek === dow && !a.isException
        return false
      })
      if (hasAvail) count++
    })
    if (count > 0) countsByDate[dateStr] = count
  }

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
    else setCalMonth(calMonth - 1)
    setCalSelectedDate(null)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
    else setCalMonth(calMonth + 1)
    setCalSelectedDate(null)
  }
  const goToday = () => {
    setCalMonth(today.getMonth())
    setCalYear(today.getFullYear())
    setCalSelectedDate(todayStr)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const selectedDateLabel = calSelectedDate ? new Date(calSelectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''
  const totalAvail = Object.values(countsByDate).reduce((s, c) => s + c, 0)

  return (
    <div>
      {/* Calendar card */}
      <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 20, overflow: 'hidden', marginBottom: 16 }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>{monthName}</h2>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{Object.keys(countsByDate).length} day{Object.keys(countsByDate).length !== 1 ? 's' : ''} with available professionals</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={goToday} style={{ fontSize: 11, fontWeight: 700, color: '#1a7f5e', background: '#e8f5f0', padding: '6px 12px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Today</button>
            <button onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: 'transparent' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: 'transparent' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #f3f4f6' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} style={{ aspectRatio: '1', borderBottom: '1px solid #f8f7f5', borderRight: '1px solid #f8f7f5' }} />
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const count = countsByDate[dateStr] || 0
            const isToday = dateStr === todayStr
            const isSelected = dateStr === calSelectedDate
            const isPast = dateStr < todayStr

            return (
              <div
                key={dateStr}
                onClick={() => setCalSelectedDate(isSelected ? null : dateStr)}
                style={{
                  aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer',
                  borderBottom: '1px solid #f8f7f5', borderRight: '1px solid #f8f7f5',
                  background: isSelected ? '#e8f5f0' : 'transparent',
                  opacity: isPast && !isToday ? 0.4 : 1,
                  transition: 'background .15s',
                }}
              >
                <span style={{
                  fontSize: 14, lineHeight: 1, fontWeight: isToday ? 700 : isSelected ? 700 : 500,
                  color: isToday ? 'white' : isSelected ? '#1a7f5e' : '#374151',
                  ...(isToday ? { width: 28, height: 28, borderRadius: '50%', background: '#1a7f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}),
                }}>
                  {day}
                </span>
                {count > 0 && (
                  <span style={{
                    fontSize: 9, fontWeight: 800, lineHeight: 1, padding: '2px 6px', borderRadius: 100,
                    background: isSelected ? '#1a7f5e' : '#e8f5f0', color: isSelected ? 'white' : '#1a7f5e',
                  }}>
                    {count}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected date professionals */}
      {calSelectedDate && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>{selectedDateLabel}</h3>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
                {calLoading ? 'Loading...' : `${calDatePros.length} professional${calDatePros.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
            <button onClick={() => setCalSelectedDate(null)} style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
          </div>
          {calLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {[1, 2].map(i => (
                <div key={i} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: 14 }} className="animate-pulse">
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#f3f4f6' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 16, background: '#f3f4f6', borderRadius: 6, width: '60%', marginBottom: 8 }} />
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, width: '40%', marginBottom: 8 }} />
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 6, width: '50%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : calDatePros.length === 0 ? (
            <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 18, padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>No professionals available</p>
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Try selecting a different date</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px]">
              {calDatePros.map(pro => (
                <div key={pro.id} onClick={() => onOpenProfile(pro.id)} style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: 14, cursor: 'pointer', transition: 'border-color .15s' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <ProAvatar src={pro.avatarUrl} name={pro.name} size={56} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{pro.name}</span>
                        <span style={{ fontSize: 14, fontWeight: 900, color: '#1a1a1a', whiteSpace: 'nowrap' }}>${pro.rate}<span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af' }}>/hr</span></span>
                      </div>
                      <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 3 }}>{pro.role}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#F97316' }}>★ {pro.rating}</span>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>({pro.reviews})</span>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>· {pro.shifts} shifts</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => onOpenMsg(pro.id)} style={{ flex: 1, border: '1.5px solid #e5e7eb', color: '#374151', background: 'white', fontWeight: 700, padding: '10px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', minHeight: 42 }}>Message</button>
                    <button onClick={() => onBookWithDate(pro.id)} style={{ flex: 1, background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 700, padding: '10px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', minHeight: 42 }}>Book</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No date selected hint */}
      {!calSelectedDate && (
        <div style={{ background: 'white', border: '1.5px dashed #d1d5db', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Tap a date</span> to see available professionals
          </p>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function Professionals() {
  const location = useLocation()
  const { getToken } = useAuth()
  const dpRef = useRef(null)

  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('Dental Hygienist')
  const [reliability, setReliability] = useState('All')
  const [lang, setLang] = useState('')
  const [photoOnly, setPhotoOnly] = useState(false)
  const [maxMiles, setMaxMiles] = useState(20)
  const [minRate, setMinRate] = useState(0)
  const [maxRate, setMaxRate] = useState(150)
  const [skill, setSkill] = useState('')
  const [cert, setCert] = useState('')
  const [software, setSoftware] = useState('')
  const [crossTrained, setCrossTrained] = useState(false)
  const [availableNow, setAvailableNow] = useState(false)
  const [sortBy, setSortBy] = useState('Best match')
  const [rapidSelected, setRapidSelected] = useState([])
  const [dateVal, setDateVal] = useState('')
  const [dateLabel, setDateLabel] = useState('Date needed')
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'calendar'
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calSelectedDate, setCalSelectedDate] = useState(null)
  const [calLoading, setCalLoading] = useState(false)
  const [calDatePros, setCalDatePros] = useState([])

  const [officeId, setOfficeId] = useState(null)
  const [savedProIds, setSavedProIds] = useState([])

  // modal state
  const [modal, setModal] = useState(null) // 'cal'|'choice'|'booking'|'rf'|'profile'|'msg'
  const [activePro, setActivePro] = useState(null)
  const [msgText, setMsgText] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const [activeDate, setActiveDate] = useState('')

  const PER_PAGE = 8

  useEffect(() => {
    if (location.state?.rapidFillPreselect) setRapidSelected([location.state.rapidFillPreselect])
  }, [])

  // Fetch providers from API (filters by availability when a Rapid Fill date is chosen)
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true)
        const token = await getToken()
        const url = dateVal
          ? `${API_URL}/api/providers?availableOn=${dateVal}`
          : `${API_URL}/api/providers`
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch providers')
        const data = await res.json()

        // Transform API response to match what ProCard expects
        const transformed = data.map(provider => {
          const firstName = provider.user?.firstName || ''
          const lastName = provider.user?.lastName || ''
          const name = lastName ? `${firstName} ${lastName.charAt(0)}.` : (firstName.trim() || 'Unknown')

          // Use denormalized fields on provider, fall back to computing from relations
          const reviews = provider.reviews || []
          const avgRating = provider.avgRating || (reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0)
          const reviewCount = provider.reviewCount || reviews.length

          // Build review list for profile drawer
          const reviewsList = reviews.map(r => ({
            text: r.comment || '',
            from: 'Verified Practice',
            date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            rating: r.rating,
          }))

          // Use denormalized field, fall back to computing from bookings
          const completedShifts = provider.shiftsCompleted || provider.bookings?.filter(b => b.status === 'COMPLETED').length || 0

          const isDentist = provider.role === 'dentist'
          const displayName = isDentist ? `Dr. ${name}` : name

          return {
            id: provider.id,
            name: displayName,
            avatarUrl: provider.user?.avatarUrl || null,
            role: { hygienist: 'Dental Hygienist', assistant: 'Dental Assistant', front: 'Front Office', dentist: 'Dentist', specialist: 'Specialist' }[provider.role] || provider.role || 'Professional',
            rate: provider.hourlyRate || 0,
            rating: Number(avgRating) || 0,
            reviews: reviewCount,
            reliability: provider.reliabilityScore || 0,
            shifts: completedShifts,
            responseTime: null,
            miles: parseFloat((Math.random() * 18 + 0.5).toFixed(1)),
            software: provider.software || [],
            skills: provider.skills || [],
            certs: (provider.credentials || []).map(c => c.type),
            about: provider.bio || '',
            calendar: {},
            rawRole: provider.role,
            availability: provider.availability || [],
            reviewsList,
          }
        })

        setProfessionals(transformed)
      } catch (err) {
        console.error('Error fetching providers:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProviders()
  }, [getToken, dateVal])

  // Fetch providers available on a specific calendar date
  useEffect(() => {
    if (!calSelectedDate) { setCalDatePros([]); return }
    const fetchDatePros = async () => {
      setCalLoading(true)
      try {
        const token = await getToken()
        const roleMap = { 'Dental Hygienist': 'hygienist', 'Dental Assistant': 'assistant', 'Front Office': 'front', 'Dentist': 'dentist', 'Specialist': 'specialist' }
        const roleParam = roleMap[role] ? `&role=${roleMap[role]}` : ''
        const res = await fetch(`${API_URL}/api/providers?availableOn=${calSelectedDate}${roleParam}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const transformed = data.map(provider => {
            const fn = provider.user?.firstName || ''
            const ln = provider.user?.lastName || ''
            const nm = ln ? `${fn} ${ln.charAt(0)}.` : (fn.trim() || 'Unknown')
            const isDentist = provider.role === 'dentist'
            const reviews = provider.reviews || []
            const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
            const completedShifts = provider.bookings?.filter(b => b.status === 'COMPLETED').length || 0
            return {
              id: provider.id,
              name: isDentist ? `Dr. ${nm}` : nm,
              avatarUrl: provider.user?.avatarUrl || null,
              role: { hygienist: 'Dental Hygienist', assistant: 'Dental Assistant', front: 'Front Office', dentist: 'Dentist', specialist: 'Specialist' }[provider.role] || provider.role || 'Professional',
              rate: provider.hourlyRate || 0,
              rating: Number(avgRating) || 0,
              reviews: reviews.length,
              reliability: provider.reliabilityScore || 0,
              shifts: completedShifts,
              miles: null,
            }
          })
          setCalDatePros(transformed)
        }
      } catch (err) { console.error('Error fetching date providers:', err) }
      setCalLoading(false)
    }
    fetchDatePros()
  }, [calSelectedDate, role, getToken])

  // Fetch office ID and saved providers
  useEffect(() => {
    const fetchOfficeAndSaved = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }
        const meRes = await fetch(`${API_URL}/api/offices/me`, { headers })
        if (!meRes.ok) return
        const meData = await meRes.json()
        setOfficeId(meData.id)
        const savedRes = await fetch(`${API_URL}/api/offices/${meData.id}/saved-providers`, { headers })
        if (savedRes.ok) {
          const savedData = await savedRes.json()
          setSavedProIds(savedData.map(s => s.providerId))
        }
      } catch {}
    }
    fetchOfficeAndSaved()
  }, [getToken])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const toggleRapid = (id) => {
    if (!dateVal) { showToast('Please select a date first'); dpRef.current?.focus(); return }
    setRapidSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 10 ? [...prev, id] : prev)
  }

  const getRelBand = (r) => r >= 95 ? 'excellent' : r >= 85 ? 'verygood' : r >= 70 ? 'good' : 'poor'

  const filtered = professionals.filter(p => {
    if (role !== 'All' && p.role !== role) return false
    if (reliability !== 'All' && getRelBand(p.reliability) !== reliability) return false
    if (p.rate < minRate || p.rate > maxRate) return false
    if (p.miles != null && p.miles > maxMiles) return false
    if (cert && !p.certs.includes(cert)) return false
    if (skill && !p.skills.includes(skill)) return false
    if (software && !p.software.includes(software)) return false
    if (crossTrained && (!p.skills || p.skills.length < 2)) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'Rating') return b.rating - a.rating
    if (sortBy === 'Reliability') return b.reliability - a.reliability
    if (sortBy === 'Distance') return (a.miles || 999) - (b.miles || 999)
    if (sortBy === '# of shifts') return b.shifts - a.shifts
    return b.reliability - a.reliability
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const clearFilters = () => { setRole('Dental Hygienist'); setReliability('All'); setSkill(''); setCert(''); setLang(''); setSoftware(''); setPhotoOnly(false); setCrossTrained(false); setAvailableNow(false); setMaxMiles(20); setMinRate(0); setMaxRate(150); setPage(1) }
  const activeCount = [reliability !== 'All', skill, cert, lang, software, photoOnly, crossTrained, availableNow, maxMiles !== 20, minRate !== 0 || maxRate !== 150].filter(Boolean).length

  const handleDateChange = (e) => {
    const val = e.target.value
    setDateVal(val)
    if (val) {
      const d = new Date(val + 'T00:00:00')
      setDateLabel(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    } else {
      setDateLabel('Date needed')
    }
  }

  const openCal = (id) => { setActivePro(id); setModal('cal') }
  const openMsg = (id) => { setActivePro(id); setMsgText(''); setModal('msg') }

  const sendMessage = async () => {
    if (!msgText.trim() || !activePro || sendingMsg) return
    setSendingMsg(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ providerId: activePro, body: msgText.trim() }),
      })
      if (res.ok) {
        setModal(null)
        setMsgText('')
        showToast('Message sent!')
      } else { showToast('Failed to send message') }
    } catch { showToast('Failed to send message') }
    setSendingMsg(false)
  }
  const openProfile = (id) => { setActivePro(id); setModal('profile') }
  const closeAll = () => setModal(null)

  const handleCalChoose = (date) => { setActiveDate(date); setModal('choice') }
  const handleDirect = () => setModal('booking')
  const handleRapidFillChoice = () => {
    if (!rapidSelected.includes(activePro)) setRapidSelected(prev => [...prev, activePro])
    // Store the date for later use, close modals so user can select more providers
    if (activeDate && !dateVal) {
      // Convert "April 15" format to YYYY-MM-DD for the date picker
      const currentYear = new Date().getFullYear()
      const parsed = new Date(`${activeDate}, ${currentYear}`)
      if (!isNaN(parsed.getTime())) {
        const iso = parsed.toISOString().split('T')[0]
        setDateVal(iso)
        setDateLabel(parsed.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
      }
    }
    setModal(null)
    showToast(`${professionals.find(p => p.id === activePro)?.name?.split(' ')[0] || 'Provider'} added to Rapid Fill — select up to 10`)
  }
  const handleLaunchRF = () => {
    const d = dateVal ? new Date(dateVal + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : activeDate
    setActiveDate(d)
    setModal('rf')
  }

  const handleSavePro = async (proId, saving) => {
    if (!officeId) { showToast('Unable to save — office not found'); return }
    try {
      const token = await getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      if (saving) {
        const res = await fetch(`${API_URL}/api/offices/${officeId}/save-provider`, {
          method: 'POST', headers, body: JSON.stringify({ providerId: proId }),
        })
        if (res.ok || res.status === 409) {
          setSavedProIds(prev => [...prev, proId])
          showToast('Professional saved!')
        } else { showToast('Failed to save') }
      } else {
        await fetch(`${API_URL}/api/offices/${officeId}/save-provider/${proId}`, {
          method: 'DELETE', headers,
        })
        setSavedProIds(prev => prev.filter(id => id !== proId))
        showToast('Professional removed from saved')
      }
    } catch { showToast('Failed to save') }
  }

  const rfDate = dateVal
    ? new Date(dateVal + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : activeDate

  const activeProObj = professionals.find(p => p.id === activePro)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6]">
        <Nav />
        <div className="max-w-[900px] mx-auto px-4 md:px-12 pt-7 pb-24 md:pb-20">
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a1a1a', marginBottom: 4 }}>Find Professionals</h1>
            <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>Browse verified dental professionals available in your area</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, border: '2px solid #1a7f5e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }}></div>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading professionals...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: 'white', fontSize: 13, fontWeight: 600, padding: '10px 18px', borderRadius: 100, zIndex: 600, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1a7f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckIcon /></div>
          {toast}
        </div>
      )}

      {/* OVERLAY */}
      {modal && modal !== 'profile' && (
        <div onClick={closeAll} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300 }} />
      )}

      {/* MODALS */}
      {modal === 'cal' && activeProObj && <CalModal pro={activeProObj} onClose={closeAll} onChoose={handleCalChoose} getToken={getToken} />}
      {modal === 'msg' && activeProObj && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 500 }} onClick={closeAll} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'white', borderRadius: 20, width: 'calc(100% - 40px)', maxWidth: 420, zIndex: 501, boxShadow: '0 24px 60px rgba(0,0,0,.2)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12 }}>
              <ProAvatar src={activeProObj.avatarUrl} name={activeProObj.name} size={42} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a' }}>Message {activeProObj.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{activeProObj.role}</div>
              </div>
              <button onClick={closeAll} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder={`Hi ${activeProObj.name}, ...`}
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', resize: 'none', height: 120, boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button onClick={closeAll} style={{ flex: 1, border: '1.5px solid #e5e7eb', color: '#374151', background: 'white', fontWeight: 700, padding: '10px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={sendMessage} disabled={!msgText.trim() || sendingMsg}
                  style={{ flex: 1, background: msgText.trim() ? '#1a7f5e' : '#e5e7eb', color: msgText.trim() ? 'white' : '#9ca3af', border: 'none', fontWeight: 800, padding: '10px', borderRadius: 100, fontSize: 13, cursor: msgText.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                  {sendingMsg ? 'Sending...' : 'Send message'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {modal === 'choice' && activeProObj && <ChoiceModal pro={activeProObj} date={activeDate} onClose={closeAll} onDirect={handleDirect} onRapidFill={handleRapidFillChoice} />}
      {modal === 'booking' && activeProObj && <BookingModal pro={activeProObj} date={activeDate} onClose={closeAll} onSubmit={() => showToast(`Booking request sent to ${activeProObj.name.split(' ')[0]}!`)} getToken={getToken} />}
      {modal === 'rf' && <RFModal selected={rapidSelected} allPros={professionals} date={rfDate} onClose={closeAll} onSend={async () => {
        try {
          const token = await getToken()
          const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
          const currentYear = new Date().getFullYear()
          const parsedDate = new Date(rfDate.includes(',') ? rfDate : `${rfDate}, ${currentYear}`)
          if (isNaN(parsedDate.getTime())) { showToast('Invalid date'); return }
          if (parsedDate < new Date()) parsedDate.setFullYear(currentYear + 1)

          // Get role from first selected pro
          const firstPro = professionals.find(p => rapidSelected.includes(p.id))
          const res = await fetch(`${API_URL}/api/applications/rapid-fill`, {
            method: 'POST', headers,
            body: JSON.stringify({
              providerIds: rapidSelected,
              date: parsedDate.toISOString(),
              startTime: '8:00 AM',
              endTime: '5:00 PM',
              hourlyRate: firstPro?.rate || 0,
              role: firstPro?.role || 'Dental Professional',
              note: 'Rapid Fill request',
            }),
          })
          if (res.ok) {
            const data = await res.json()
            closeAll(); setRapidSelected([])
            showToast(`Rapid Fill sent to ${data.applicationCount} professional${data.applicationCount !== 1 ? 's' : ''}!`)
          } else { showToast('Failed to send Rapid Fill requests') }
        } catch { showToast('Failed to send Rapid Fill requests') }
      }} />}
      {modal === 'profile' && activeProObj && (
        <>
          <div onClick={closeAll} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 300 }} />
          <ProfileDrawer pro={activeProObj} onClose={closeAll} onBook={() => openCal(activePro)} onDateSelect={(date) => { setModal(null); handleCalChoose(date) }} onSavePro={handleSavePro} isSaved={savedProIds.includes(activePro)} showToast={showToast} getToken={getToken} />
        </>
      )}

      {/* PAGE */}
      <div className="max-w-[900px] mx-auto px-4 md:px-12 pt-7 pb-24 md:pb-20">

        {/* PAGE TITLE */}
        <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="text-[22px] md:text-[26px]" style={{ fontWeight: 900, color: '#1a1a1a', marginBottom: 4 }}>Find Professionals</h1>
            <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>Browse verified dental professionals available in your area</p>
          </div>
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 100, padding: 4, gap: 2 }}>
            <button onClick={() => setViewMode('grid')} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: viewMode === 'grid' ? 'white' : 'transparent', boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'grid' ? '#1a7f5e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </button>
            <button onClick={() => setViewMode('calendar')} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: viewMode === 'calendar' ? 'white' : 'transparent', boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,.08)' : 'none', transition: 'all .15s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'calendar' ? '#1a7f5e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-[18px] items-start">

          {/* Mobile filter button */}
          <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden w-full flex items-center justify-between bg-white border border-[#e5e7eb] rounded-xl px-4 py-3 mb-2 min-h-[44px]">
            <span className="flex items-center gap-2 text-sm font-bold text-[#1a1a1a]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
              Filters
            </span>
            {activeCount > 0 && <span className="text-[10px] font-bold bg-[#1a7f5e] text-white w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>}
          </button>

          {/* Mobile filter drawer — near full screen */}
          {mobileFiltersOpen && (
            <div className="md:hidden fixed inset-0 z-[400]">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute top-3 left-3 right-3 bottom-3 bg-white rounded-[20px] shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#f3f4f6] flex-shrink-0">
                  <div>
                    <span className="text-[17px] font-black text-[#1a1a1a]">Filters</span>
                    {activeCount > 0 && <span className="ml-2 text-[11px] font-bold bg-[#1a7f5e] text-white px-2 py-0.5 rounded-full">{activeCount} active</span>}
                  </div>
                  <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center border-none cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                {/* Scrollable filters */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <div className="flex flex-col gap-5">
                    {/* Role */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">Role</label>
                      <div className="flex flex-wrap gap-2">
                        {['Dentist','Dental Hygienist','Dental Assistant','Front Office','Specialist'].map(r => (
                          <button key={r} onClick={() => { setRole(r); setPage(1) }} className={`px-4 py-2.5 rounded-full text-[13px] font-semibold border transition ${role === r ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'bg-white text-[#374151] border-[#e5e7eb]'}`} style={{ fontFamily: 'inherit' }}>{r}</button>
                        ))}
                      </div>
                    </div>
                    {/* Reliability */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">Reliability</label>
                      <select value={reliability} onChange={e => { setReliability(e.target.value); setPage(1) }} className="w-full min-h-[46px] border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[14px] bg-[#f9f8f6] outline-none" style={{ fontFamily: 'inherit' }}>
                        {['Any reliability','Excellent — 95%+','Very Good — 85–94%','Good — 70–84%'].map((o, i) => <option key={o} value={['All','excellent','verygood','good'][i]}>{o}</option>)}
                      </select>
                    </div>
                    {/* Language */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">Language</label>
                      <select value={lang} onChange={e => setLang(e.target.value)} className="w-full min-h-[46px] border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[14px] bg-[#f9f8f6] outline-none" style={{ fontFamily: 'inherit' }}>
                        {['Any language','English','Spanish','Mandarin','Vietnamese','Portuguese','Korean','Arabic','French'].map((o, i) => <option key={o} value={i === 0 ? '' : o}>{o}</option>)}
                      </select>
                    </div>
                    {/* Credentials */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">Credentials</label>
                      <select value={cert} onChange={e => setCert(e.target.value)} className="w-full min-h-[46px] border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[14px] bg-[#f9f8f6] outline-none" style={{ fontFamily: 'inherit' }}>
                        {['Any credential','TX RDH License','CPR/BLS','Local Anesthesia','Nitrous Oxide','X-Ray Certification','Reg. DA','Coronal Polishing','Sealants'].map((o, i) => <option key={o} value={i === 0 ? '' : o}>{o}</option>)}
                      </select>
                    </div>
                    {/* Skills */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">Skills</label>
                      <select value={skill} onChange={e => setSkill(e.target.value)} className="w-full min-h-[46px] border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[14px] bg-[#f9f8f6] outline-none" style={{ fontFamily: 'inherit' }}>
                        {['Any skill','Scaling & Root Planing','Periodontal Charting','Digital X-rays','Four-Handed Dentistry','Insurance Verification','Teeth Whitening','Implant Maintenance','Pediatric Care'].map((o, i) => <option key={o} value={i === 0 ? '' : o}>{o}</option>)}
                      </select>
                    </div>
                    {/* Dental Software */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">Dental Software</label>
                      <select value={software} onChange={e => setSoftware(e.target.value)} className="w-full min-h-[46px] border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[14px] bg-[#f9f8f6] outline-none" style={{ fontFamily: 'inherit' }}>
                        {['Any software','Dentrix','Eaglesoft','Open Dental','Curve Dental','Denticon','SoftDent','Practice-Web','tab32'].map((o, i) => <option key={o} value={i === 0 ? '' : o}>{o}</option>)}
                      </select>
                    </div>
                    {/* Hourly Rate */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider">Hourly Rate</label>
                        <span className="text-[12px] font-semibold text-[#1a7f5e]">${minRate} – ${maxRate}/hr</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#9ca3af]">$</span>
                          <input type="number" value={minRate} onChange={e => setMinRate(Number(e.target.value))} placeholder="Min" className="w-full min-h-[46px] border border-[#e5e7eb] rounded-xl pl-7 pr-3 py-2.5 text-[14px] bg-[#f9f8f6] outline-none" style={{ fontFamily: 'inherit' }} />
                        </div>
                        <span className="flex items-center text-[#9ca3af] font-bold">–</span>
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#9ca3af]">$</span>
                          <input type="number" value={maxRate} onChange={e => setMaxRate(Number(e.target.value))} placeholder="Max" className="w-full min-h-[46px] border border-[#e5e7eb] rounded-xl pl-7 pr-3 py-2.5 text-[14px] bg-[#f9f8f6] outline-none" style={{ fontFamily: 'inherit' }} />
                        </div>
                      </div>
                    </div>
                    {/* Max Distance */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-2">Max Distance</label>
                      <div className="flex flex-wrap gap-2">
                        {[5,10,20,35,50].map(m => (
                          <button key={m} onClick={() => setMaxMiles(m)} className={`px-4 py-2.5 rounded-full text-[13px] font-semibold border transition ${maxMiles === m ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'bg-white text-[#374151] border-[#e5e7eb]'}`} style={{ fontFamily: 'inherit' }}>{m} mi</button>
                        ))}
                      </div>
                    </div>
                    {/* Toggles */}
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-3">Preferences</label>
                      <div className="flex flex-col gap-3">
                        {[
                          { label: 'Has profile photo', desc: 'Only show professionals with a photo', val: photoOnly, set: setPhotoOnly },
                          { label: 'Cross-trained', desc: 'Can perform multiple roles', val: crossTrained, set: setCrossTrained },
                          { label: 'Available this week', desc: 'Has availability in the next 7 days', val: availableNow, set: setAvailableNow },
                        ].map(t => (
                          <div key={t.label} onClick={() => t.set(!t.val)} className="flex items-center gap-3 bg-[#f9f8f6] border border-[#e5e7eb] rounded-xl px-4 py-3.5 cursor-pointer transition" style={{ borderColor: t.val ? '#1a7f5e' : '#e5e7eb', background: t.val ? '#f0faf5' : '#f9f8f6' }}>
                            <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${t.val ? '#1a7f5e' : '#d1d5db'}`, background: t.val ? '#1a7f5e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {t.val && <CheckIcon />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[14px] font-bold text-[#1a1a1a]">{t.label}</div>
                              <div className="text-[12px] text-[#9ca3af]">{t.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="flex gap-3 px-5 py-4 border-t border-[#f3f4f6] flex-shrink-0 bg-white">
                  <button onClick={() => { clearFilters() }} className="flex-1 min-h-[48px] border border-[#e5e7eb] text-[#374151] font-bold py-3 rounded-full text-[14px] bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>Clear all</button>
                  <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 min-h-[48px] bg-[#1a7f5e] text-white font-bold py-3 rounded-full text-[14px] border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Show results</button>
                </div>
              </div>
            </div>
          )}

          {/* SIDEBAR */}
          <div style={{ width: 210, flexShrink: 0, position: 'sticky', top: 88 }} className="hidden md:block self-start">
            <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a' }}>Filters</span>
                  {activeCount > 0 && <span style={{ fontSize: 10, fontWeight: 800, background: '#1a7f5e', color: 'white', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeCount}</span>}
                </div>
                {activeCount > 0 && <button onClick={clearFilters} style={{ fontSize: 11, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Clear all</button>}
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Role */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, display: 'block' }}>Role</label>
                  <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }} style={{ width: '100%', background: '#f0faf5', border: '1.5px solid #1a7f5e', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#374151', cursor: 'pointer' }}>
                    {['Dentist','Dental Hygienist','Dental Assistant','Front Office','Specialist'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                {/* Dropdowns */}
                {[
                  { label: 'Reliability', val: reliability, set: v => { setReliability(v); setPage(1) }, opts: ['All','excellent','verygood','good'], display: ['Any reliability','Excellent — 95%+','Very Good — 85–94%','Good — 70–84%'] },
                  { label: 'Language', val: lang, set: setLang, opts: ['','English','Spanish','Mandarin','Vietnamese','Portuguese','Korean','Arabic','French'], display: ['Any language','English','Spanish','Mandarin','Vietnamese','Portuguese','Korean','Arabic','French'] },
                  { label: 'Credentials', val: cert, set: setCert, opts: ['','TX RDH License','CPR/BLS','Local Anesthesia','Nitrous Oxide','X-Ray Certification','Reg. DA','Coronal Polishing','Sealants'], display: ['Any credential','TX RDH License','CPR/BLS','Local Anesthesia','Nitrous Oxide','X-Ray Certification','Reg. DA','Coronal Polishing','Sealants'] },
                  { label: 'Skills', val: skill, set: setSkill, opts: ['','Scaling & Root Planing','Periodontal Charting','Digital X-rays','Four-Handed Dentistry','Insurance Verification','Teeth Whitening','Implant Maintenance','Pediatric Care'], display: ['Any skill','Scaling & Root Planing','Periodontal Charting','Digital X-rays','Four-Handed Dentistry','Insurance Verification','Teeth Whitening','Implant Maintenance','Pediatric Care'] },
                  { label: 'Dental Software', val: software, set: setSoftware, opts: ['','Dentrix','Eaglesoft','Open Dental','Curve Dental','Denticon','SoftDent','Practice-Web','tab32'], display: ['Any software','Dentrix','Eaglesoft','Open Dental','Curve Dental','Denticon','SoftDent','Practice-Web','tab32'] },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, display: 'block' }}>{f.label}</label>
                    <select value={f.val} onChange={e => f.set(e.target.value)} style={{ width: '100%', background: f.val && f.val !== 'All' ? '#f0faf5' : '#f9f8f6', border: `1.5px solid ${f.val && f.val !== 'All' ? '#1a7f5e' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#374151', cursor: 'pointer' }}>
                      {f.display.map((o, i) => <option key={o} value={f.opts[i]}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ height: 1, background: '#f3f4f6', margin: '0 -16px' }} />
                {/* Toggles */}
                {[
                  { label: 'Profile photo', desc: 'Only pros with a photo', val: photoOnly, set: setPhotoOnly },
                  { label: 'Cross-trained', desc: 'Can perform multiple roles', val: crossTrained, set: setCrossTrained },
                  { label: 'Available this week', desc: 'Has upcoming availability', val: availableNow, set: setAvailableNow },
                ].map(t => (
                  <div key={t.label} onClick={() => t.set(!t.val)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${t.val ? '#1a7f5e' : '#d1d5db'}`, background: t.val ? '#1a7f5e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      {t.val && <CheckIcon />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 1 }}>{t.label}</div>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>{t.desc}</span>
                    </div>
                  </div>
                ))}
                <div style={{ height: 1, background: '#f3f4f6', margin: '0 -16px' }} />
                {/* Rate */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em' }}>Hourly Rate</label>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#1a7f5e' }}>${minRate}–${maxRate}/hr</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {[[minRate, setMinRate],[maxRate, setMaxRate]].map(([val, set], i) => (
                      <div key={i} style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af' }}>$</span>
                        <input type="number" value={val} onChange={e => set(Number(e.target.value))} style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '7px 10px 7px 22px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#f9f8f6', color: '#1a1a1a', boxSizing: 'border-box' }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ height: 1, background: '#f3f4f6', margin: '0 -16px' }} />
                {/* Distance */}
                <div>
                  <label style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, display: 'block' }}>Max Distance</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {[5,10,20,35,50].map(m => (
                      <button key={m} onClick={() => setMaxMiles(m)} style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: `1.5px solid ${maxMiles === m ? '#1a7f5e' : '#e5e7eb'}`, cursor: 'pointer', background: maxMiles === m ? '#1a7f5e' : 'white', color: maxMiles === m ? 'white' : '#374151', fontFamily: 'inherit' }}>{m} mi</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div className="w-full" style={{ flex: 1, minWidth: 0 }}>
            {viewMode === 'grid' && (
              <>
                {/* Date + Sort bar */}
                <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 10, marginBottom: 14, alignItems: 'center' }}>
                  <div onClick={() => dpRef.current?.showPicker?.() || dpRef.current?.focus()} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', position: 'relative' }}>
                    <CalIcon />
                    <span style={{ fontSize: 14, fontWeight: dateVal ? 700 : 600, color: dateVal ? '#1a1a1a' : '#9ca3af' }}>{dateLabel}</span>
                    <input ref={dpRef} type="date" onChange={handleDateChange} style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
                  </div>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', background: '#f9f8f6', outline: 'none', whiteSpace: 'nowrap' }}>
                    {['Best match','Distance','Reliability','# of shifts','Rating'].map(o => <option key={o}>Sort: {o}</option>)}
                  </select>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ fontSize: 15, color: '#6b7280' }}>
                    {dateVal ? (
                      <><strong style={{ color: '#1a1a1a', fontWeight: 800, fontSize: 16 }}>Showing {filtered.length}</strong> professional{filtered.length !== 1 ? 's' : ''} available on {dateLabel}</>
                    ) : (
                      <><strong style={{ color: '#1a1a1a', fontWeight: 800, fontSize: 16 }}>{filtered.length}</strong> professionals found</>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e8f5f0', padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#0f4d38' }}>
                    <BoltIcon color="#1a7f5e" size={11} />Check boxes to use Rapid Fill
                  </div>
                </div>

                {/* Cards grid */}
                {paginated.length === 0 ? (
                  <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '56px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a', marginBottom: 8 }}>
                      {dateVal ? 'No professionals available on this date' : professionals.length === 0 ? 'No professionals available yet' : 'No professionals found'}
                    </div>
                    <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                      {dateVal ? 'Try picking a different date.' : professionals.length === 0 ? 'Check back as providers join Kazi.' : 'Try adjusting your filters.'}
                    </div>
                    {professionals.length > 0 && (
                      <button onClick={clearFilters} style={{ border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '8px 20px', borderRadius: 100, fontSize: 13, cursor: 'pointer', background: 'white', fontFamily: 'inherit' }}>Clear all filters</button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[10px] items-start">
                    {paginated.map(pro => (
                      <ProCard key={pro.id} pro={pro} rapidSelected={rapidSelected} onToggleRapid={toggleRapid} onOpenCal={openCal} onOpenProfile={openProfile} onOpenMsg={openMsg} hasDate={!!dateVal} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 9, border: `1.5px solid ${page === p ? '#1a7f5e' : '#e5e7eb'}`, background: page === p ? '#1a7f5e' : 'white', fontSize: 13, fontWeight: 700, color: page === p ? 'white' : '#374151', cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ width: 36, height: 36, borderRadius: 9, border: '1.5px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                )}
              </>
            )}
            {viewMode === 'calendar' && (
              <ProCalendar
                professionals={filtered}
                calMonth={calMonth}
                calYear={calYear}
                setCalMonth={setCalMonth}
                setCalYear={setCalYear}
                calSelectedDate={calSelectedDate}
                setCalSelectedDate={setCalSelectedDate}
                calDatePros={calDatePros}
                calLoading={calLoading}
                onOpenCal={openCal}
                onBookWithDate={(id) => {
                  setActivePro(id)
                  const d = new Date(calSelectedDate + 'T12:00:00')
                  const dateStr = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                  setActiveDate(dateStr)
                  setModal('choice')
                }}
                onOpenProfile={openProfile}
                onOpenMsg={openMsg}
                rapidSelected={rapidSelected}
                onToggleRapid={toggleRapid}
                hasDate={!!dateVal}
              />
            )}
          </div>
        </div>
      </div>

      {/* RAPID FILL BAR */}
      {rapidSelected.length > 0 && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: 'white', padding: '11px 18px', borderRadius: 100, zIndex: 41, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 8px 30px rgba(0,0,0,.25)', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex' }}>
            {professionals.filter(p => rapidSelected.includes(p.id)).slice(0, 3).map((p, i) => (
              <div key={p.id} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                <ProAvatar src={p.avatarUrl} name={p.name} size={26} />
              </div>
            ))}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{rapidSelected.length} selected</span>
          <button onClick={handleLaunchRF} style={{ background: '#1a7f5e', color: 'white', border: 'none', borderRadius: 100, padding: '8px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BoltIcon />Launch Rapid Fill
          </button>
          <button onClick={() => setRapidSelected([])} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 18, cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}>✕</button>
        </div>
      )}
    </div>
  )
}
