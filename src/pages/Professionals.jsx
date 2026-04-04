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
function ProCard({ pro, rapidSelected, onToggleRapid, onOpenCal, onOpenProfile, hasDate }) {
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
        <ProAvatar src={pro.avatarUrl} name={pro.name} size={52} />
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2 }}>{pro.name}</span>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#1a1a1a', whiteSpace: 'nowrap', flexShrink: 0 }}>${pro.rate}<span style={{ fontSize: 10, fontWeight: 400, color: '#9ca3af' }}>/hr</span></span>
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{pro.role}{pro.miles != null ? ` · ${pro.miles} mi away` : ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#F97316' }}>★ {pro.rating}</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>({pro.reviews})</span>
          </div>
          {/* Reliability */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            <span style={{ fontSize: 11, color: '#374151' }}>Reliability: <span style={{ color: rel.color, fontWeight: 700 }}>{pro.reliability}%</span><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: rel.bg, color: rel.color, marginLeft: 3 }}>{rel.label}</span></span>
          </div>
          {/* Shifts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            <span style={{ fontSize: 11, color: '#374151' }}>{pro.shifts} shifts completed</span>
          </div>
        </div>
      </div>
      {/* Description box */}
      <div style={{ background: '#f9f8f6', borderRadius: 8, padding: '8px 12px', margin: '0 12px' }}>
        <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{pro.about}</div>
      </div>
      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, padding: '8px 12px 12px', marginTop: 4 }}>
        <button
          onClick={e => { e.stopPropagation() }}
          style={{ border: '1.5px solid #e5e7eb', color: '#374151', background: 'white', fontWeight: 700, padding: '7px 12px', borderRadius: 100, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Message
        </button>
        <button
          onClick={e => { e.stopPropagation(); onOpenCal(pro.id); }}
          style={{ background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 700, padding: '7px 12px', borderRadius: 100, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          Book {pro.name.split(' ')[0]}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
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
function ProfileDrawer({ pro, onClose, onBook, onSavePro, showToast }) {
  const [favSaved, setFavSaved] = useState(false)
  if (!pro) return null
  const rel = relDisplay(pro.reliability)
  const firstName = pro.name.split(' ')[0]
  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 580, background: 'white', zIndex: 350, display: 'flex', flexDirection: 'column', boxShadow: '-6px 0 40px rgba(0,0,0,.12)', overflowY: 'auto' }}>
      <div onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 22px', borderBottom: '1px solid #f3f4f6', fontSize: 14, fontWeight: 700, color: '#6b7280', cursor: 'pointer', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to professionals
        </div>
        <button onClick={e => { e.stopPropagation(); setFavSaved(!favSaved); onSavePro(pro.id, !favSaved) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill={favSaved ? '#ef4444' : 'none'} stroke={favSaved ? '#ef4444' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
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

// ─── MAIN PAGE ───────────────────────────────────────────────
export default function Professionals() {
  const location = useLocation()
  const { getToken } = useAuth()
  const dpRef = useRef(null)

  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('All')
  const [reliability, setReliability] = useState('All')
  const [lang, setLang] = useState('')
  const [photoOnly, setPhotoOnly] = useState(false)
  const [maxMiles, setMaxMiles] = useState(20)
  const [minRate, setMinRate] = useState(0)
  const [maxRate, setMaxRate] = useState(150)
  const [skill, setSkill] = useState('')
  const [cert, setCert] = useState('')
  const [sortBy, setSortBy] = useState('Best match')
  const [rapidSelected, setRapidSelected] = useState([])
  const [dateVal, setDateVal] = useState('')
  const [dateLabel, setDateLabel] = useState('Date needed')
  const [toast, setToast] = useState(null)
  const [page, setPage] = useState(1)

  // modal state
  const [modal, setModal] = useState(null) // 'cal'|'choice'|'booking'|'rf'|'profile'
  const [activePro, setActivePro] = useState(null)
  const [activeDate, setActiveDate] = useState('')

  const PER_PAGE = 8

  useEffect(() => {
    if (location.state?.rapidFillPreselect) setRapidSelected([location.state.rapidFillPreselect])
  }, [])

  // Fetch providers from API
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/providers`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch providers')
        const data = await res.json()

        // Transform API response to match what ProCard expects
        const transformed = data.map(provider => {
          const firstName = provider.user?.firstName || ''
          const lastName = provider.user?.lastName || ''
          const lastInitial = lastName ? `${lastName.charAt(0)}.` : ''
          const name = `${firstName} ${lastInitial}`.trim() || 'Unknown'

          // Calculate average rating from reviews if available
          const reviews = provider.reviews || []
          const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0
          const reviewCount = reviews.length

          // Build review list for profile drawer
          const reviewsList = reviews.map(r => ({
            text: r.comment || '',
            from: 'Verified Practice',
            date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            rating: r.rating,
          }))

          // Calculate completed shifts from bookings
          const completedShifts = provider.bookings?.filter(b => b.status === 'COMPLETED').length || 0

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
            miles: null,
            software: provider.software || [],
            skills: provider.skills || [],
            certs: (provider.credentials || []).map(c => c.type),
            about: provider.bio || '',
            calendar: {},
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
    if (skill && !p.software.includes(skill)) return false
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

  const clearFilters = () => { setRole('All'); setReliability('All'); setSkill(''); setCert(''); setLang(''); setPhotoOnly(false); setMaxMiles(20); setMinRate(0); setMaxRate(150); setPage(1) }
  const activeCount = [role !== 'All', reliability !== 'All', skill, cert, lang, photoOnly, maxMiles !== 20, minRate !== 0 || maxRate !== 150].filter(Boolean).length

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
  const openProfile = (id) => { setActivePro(id); setModal('profile') }
  const closeAll = () => setModal(null)

  const handleCalChoose = (date) => { setActiveDate(date); setModal('choice') }
  const handleDirect = () => setModal('booking')
  const handleRapidFillChoice = () => {
    if (!rapidSelected.includes(activePro)) setRapidSelected(prev => [...prev, activePro])
    setModal('rf')
  }
  const handleLaunchRF = () => {
    const d = dateVal ? new Date(dateVal + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : activeDate
    setActiveDate(d)
    setModal('rf')
  }

  const handleSavePro = (proId, saving) => {
    showToast(saving ? 'Professional saved - Coming soon!' : 'Professional unsaved')
  }

  const rfDate = dateVal
    ? new Date(dateVal + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : activeDate

  const activeProObj = professionals.find(p => p.id === activePro)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6]">
        <Nav />
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 48px 80px' }}>
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
      {modal === 'choice' && activeProObj && <ChoiceModal pro={activeProObj} date={activeDate} onClose={closeAll} onDirect={handleDirect} onRapidFill={handleRapidFillChoice} />}
      {modal === 'booking' && activeProObj && <BookingModal pro={activeProObj} date={activeDate} onClose={closeAll} onSubmit={() => showToast(`Booking request sent to ${activeProObj.name.split(' ')[0]}!`)} getToken={getToken} />}
      {modal === 'rf' && <RFModal selected={rapidSelected} allPros={professionals} date={rfDate} onClose={closeAll} onSend={() => { closeAll(); setRapidSelected([]); showToast('Rapid Fill requests sent!') }} />}
      {modal === 'profile' && activeProObj && (
        <>
          <div onClick={closeAll} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 300 }} />
          <ProfileDrawer pro={activeProObj} onClose={closeAll} onBook={() => openCal(activePro)} onSavePro={handleSavePro} showToast={showToast} />
        </>
      )}

      {/* PAGE */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 48px 80px' }}>

        {/* PAGE TITLE */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a1a1a', marginBottom: 4 }}>Find Professionals</h1>
          <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 400 }}>Browse verified dental professionals available in your area</p>
        </div>

        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>

          {/* SIDEBAR */}
          <div style={{ width: 190, flexShrink: 0, position: 'sticky', top: 88 }} className="hidden md:block">
            <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a' }}>Filters</span>
                  {activeCount > 0 && <span style={{ fontSize: 10, fontWeight: 800, background: '#1a7f5e', color: 'white', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{activeCount}</span>}
                </div>
                {activeCount > 0 && <button onClick={clearFilters} style={{ fontSize: 11, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Clear all</button>}
              </div>
              <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Role */}
                {[
                  { label: 'Role', val: role, set: v => { setRole(v); setPage(1) }, opts: ['All','Dental Hygienist','Dental Assistant','Front Desk','Treatment Coordinator'], display: ['All roles','Dental Hygienist','Dental Assistant','Front Desk','Treatment Coordinator'] },
                  { label: 'Reliability', val: reliability, set: v => { setReliability(v); setPage(1) }, opts: ['All','excellent','verygood','good'], display: ['Any reliability','Excellent — 95%+','Very Good — 85–94%','Good — 70–84%'] },
                  { label: 'Language', val: lang, set: setLang, opts: ['','Spanish','Mandarin','Vietnamese','Portuguese'], display: ['Any language','Spanish','Mandarin','Vietnamese','Portuguese'] },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, display: 'block' }}>{f.label}</label>
                    <select value={f.val} onChange={e => f.set(e.target.value)} style={{ width: '100%', background: f.val && f.val !== 'All' ? '#f0faf5' : '#f9f8f6', border: `1.5px solid ${f.val && f.val !== 'All' ? '#1a7f5e' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#374151', cursor: 'pointer' }}>
                      {f.display.map((o, i) => <option key={o} value={f.opts[i]}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ height: 1, background: '#f3f4f6', margin: '0 -16px' }} />
                {/* Profile photo */}
                <div onClick={() => setPhotoOnly(!photoOnly)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${photoOnly ? '#1a7f5e' : '#d1d5db'}`, background: photoOnly ? '#1a7f5e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    {photoOnly && <CheckIcon />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 2 }}>Profile photo</div>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>Only show pros with a photo</span>
                  </div>
                </div>
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
                <div style={{ height: 1, background: '#f3f4f6', margin: '0 -16px' }} />
                {/* Skill + Cert */}
                {[
                  { label: 'Skill', val: skill, set: setSkill, opts: ['','Scaling & Root Planing','Periodontal Charting','Digital X-rays','Four-Handed Dentistry','Insurance Verification'] },
                  { label: 'Certification', val: cert, set: setCert, opts: ['','TX RDH License','CPR/BLS','Local Anesthesia','X-Ray','Reg. DA'] },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6, display: 'block' }}>{f.label}</label>
                    <select value={f.val} onChange={e => f.set(e.target.value)} style={{ width: '100%', background: f.val ? '#f0faf5' : '#f9f8f6', border: `1.5px solid ${f.val ? '#1a7f5e' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', outline: 'none', color: '#374151', cursor: 'pointer' }}>
                      {f.opts.map((o, i) => <option key={o} value={o}>{i === 0 ? `Any ${f.label.toLowerCase()}` : o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RESULTS */}
          <div style={{ flex: 1, minWidth: 0 }}>
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
              <div style={{ fontSize: 15, color: '#6b7280' }}><strong style={{ color: '#1a1a1a', fontWeight: 800, fontSize: 16 }}>{filtered.length}</strong> professionals found</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#e8f5f0', padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, color: '#0f4d38' }}>
                <BoltIcon color="#1a7f5e" size={11} />Check boxes to use Rapid Fill
              </div>
            </div>

            {/* Cards grid */}
            {paginated.length === 0 ? (
              <div style={{ background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: '56px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: '#1a1a1a', marginBottom: 8 }}>
                  {professionals.length === 0 ? 'No professionals available yet' : 'No professionals found'}
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 16 }}>
                  {professionals.length === 0 ? 'Check back as providers join Kazi.' : 'Try adjusting your filters.'}
                </div>
                {professionals.length > 0 && (
                  <button onClick={clearFilters} style={{ border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '8px 20px', borderRadius: 100, fontSize: 13, cursor: 'pointer', background: 'white', fontFamily: 'inherit' }}>Clear all filters</button>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'start' }}>
                {paginated.map(pro => (
                  <ProCard key={pro.id} pro={pro} rapidSelected={rapidSelected} onToggleRapid={toggleRapid} onOpenCal={openCal} onOpenProfile={openProfile} hasDate={!!dateVal} />
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
