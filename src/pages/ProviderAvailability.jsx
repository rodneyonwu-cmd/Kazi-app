import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ProviderBottomNav from '../components/ProviderBottomNav'
import TopBar from '../components/TopBar'
import useUnreadMessageCount from '../hooks/useUnreadMessageCount'
import BookedShiftModal from './BookedShiftModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DOW_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SCHED_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const DOW_MAP = { Sun:0, Mon:1, Tue:2, Wed:3, Thu:4, Fri:5, Sat:6 }

function buildTimeOptions() {
  const opts = []
  for (let h = 5; h < 23; h++) {
    for (let m = 0; m < 60; m += 30) {
      const ap = h < 12 ? 'AM' : 'PM'
      const dh = h === 0 ? 12 : h > 12 ? h - 12 : h
      const label = dh + ':' + String(m).padStart(2, '0') + ' ' + ap
      const value = h + ':' + String(m).padStart(2, '0')
      opts.push({ label, value })
    }
  }
  return opts
}
const TIME_OPTIONS = buildTimeOptions()

function formatTimeValue(val) {
  const [hStr, mStr] = val.split(':')
  const h = parseInt(hStr), m = parseInt(mStr)
  const ap = h < 12 ? 'AM' : 'PM'
  const dh = h === 0 ? 12 : h > 12 ? h - 12 : h
  return dh + ':' + String(m).padStart(2, '0') + ' ' + ap
}

function shortFormat(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return timeStr
  const h = parseInt(match[1])
  const min = parseInt(match[2])
  const suffix = match[3].toLowerCase().charAt(0)
  return min > 0 ? h + ':' + String(min).padStart(2, '0') + suffix : h + suffix
}

function calcHours(startVal, endVal) {
  const [sh, sm] = startVal.split(':').map(Number)
  const [eh, em] = endVal.split(':').map(Number)
  const diff = (eh * 60 + em) - (sh * 60 + sm)
  if (diff <= 0) return '--'
  const hrs = Math.floor(diff / 60)
  const mins = diff % 60
  return mins > 0 ? hrs + 'h ' + mins + 'm' : hrs + ' hours'
}

function parseTimeTo24(txt) {
  const match = txt.trim().match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return { h: 8, m: 0 }
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const ap = match[3].toUpperCase()
  if (ap === 'PM' && h < 12) h += 12
  if (ap === 'AM' && h === 12) h = 0
  return { h, m }
}

function timeToValue(txt) {
  const { h, m } = parseTimeTo24(txt)
  return h + ':' + String(m).padStart(2, '0')
}

const styles = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
:root{--green:#1a7f5e;--green-soft:#e8f5f0;--green-d:#156649;--gold:#f4b740;--gold-bg:#fef6e4;--gold-text:#8b6914;--purple:#7c3aed;--purple-soft:#f3ecfd;--coral:#e8734a;--bg:#f9f8f6;--card:#fff;--text:#1a1a1a;--text-mid:#6b7280;--text-light:#9ca3af;--border:#e5e7eb;--border-soft:#f3f4f6;--danger:#d64545}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}

.pa-intro-card{background:linear-gradient(135deg,#e8f5f0 0%,#d4ede2 100%);margin:16px 20px 0;border-radius:18px;padding:20px;color:var(--text);border:1.5px solid rgba(26,127,94,.15);position:relative;overflow:hidden}
.pa-intro-card::before{content:'';position:absolute;top:-40px;right:-40px;width:140px;height:140px;background:radial-gradient(circle,rgba(26,127,94,.08),transparent 70%);border-radius:50%}
.pa-intro-inner{position:relative}
.pa-intro-title{font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-bottom:6px;color:var(--green)}
.pa-intro-body{font-size:13px;color:var(--text-mid);line-height:1.5;margin-bottom:14px}
.pa-intro-steps{display:flex;gap:10px}
.pa-intro-step{flex:1;background:white;border-radius:12px;padding:10px;text-align:center;border:1.5px solid rgba(26,127,94,.12)}
.pa-intro-step-num{font-family:'Outfit',sans-serif;font-size:18px;font-weight:900;margin-bottom:2px;color:var(--green)}
.pa-intro-step-label{font-size:9px;text-transform:uppercase;letter-spacing:.5px;font-weight:700;color:var(--text-mid)}
.pa-intro-dismiss{position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:50%;background:rgba(26,127,94,.1);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer}
.pa-intro-dismiss svg{width:10px;height:10px;stroke:var(--green);stroke-width:3;fill:none}

.pa-confirm-banner{margin:14px 20px 0;border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:12px;border:1.5px solid rgba(124,58,237,.2);transition:all .3s}
.pa-confirm-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .3s}
.pa-confirm-icon svg{width:16px;height:16px;stroke:white;stroke-width:2.2;fill:none}
.pa-confirm-body{flex:1}
.pa-confirm-btn{color:white;font-family:inherit;font-size:12px;font-weight:800;border:none;border-radius:100px;padding:9px 16px;cursor:pointer;flex-shrink:0;transition:background .3s}

.pa-section-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px 6px}
.pa-section-label{font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;letter-spacing:-.01em}
.pa-section-help{font-size:11px;color:var(--green);font-weight:700;cursor:pointer;display:flex;align-items:center;gap:3px}
.pa-section-help svg{width:12px;height:12px;stroke:var(--green);stroke-width:2.5;fill:none}

.pa-cal-wrap{background:var(--card);margin:0 20px;border-radius:18px;border:1.5px solid var(--border);overflow:hidden}
.pa-cal-header{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--border-soft)}
.pa-cal-month{font-family:'Outfit',sans-serif;font-size:17px;font-weight:800}
.pa-cal-nav{display:flex;gap:6px}
.pa-cal-nav button{width:32px;height:32px;border-radius:50%;background:var(--bg);border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;cursor:pointer}
.pa-cal-nav button:disabled{opacity:.3;cursor:default}
.pa-cal-nav button svg{width:14px;height:14px;stroke:var(--text);stroke-width:2.5;fill:none}
.pa-cal-body{padding:14px 14px 10px}
.pa-cal-days{display:grid;grid-template-columns:repeat(7,1fr);text-align:center;margin-bottom:6px}
.pa-cal-day-label{font-size:10px;font-weight:800;color:var(--text-light);text-transform:uppercase;letter-spacing:.4px;padding-bottom:8px}
.pa-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}

.pa-cal-cell{aspect-ratio:1;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;position:relative;transition:all .15s;border:none;background:none;font-family:inherit;padding:0}
.pa-cal-cell .pa-day-num{font-size:14px;font-weight:700;line-height:1}
.pa-cal-cell .pa-cal-time{font-size:7.5px;font-weight:700;margin-top:2px;letter-spacing:.2px}
.pa-cal-cell.pa-empty{cursor:default}
.pa-cal-cell.pa-today{box-shadow:inset 0 0 0 2.5px var(--green)}
.pa-cal-cell.pa-available{background:var(--green-soft);color:var(--green)}
.pa-cal-cell.pa-available .pa-cal-time{color:var(--green)}
.pa-cal-cell.pa-booked{background:var(--gold-bg);color:var(--gold-text)}
.pa-cal-cell.pa-booked .pa-cal-time{color:var(--gold-text)}
.pa-cal-cell.pa-unavailable{background:var(--bg);color:var(--text-light)}
.pa-cal-cell:active:not(.pa-empty):not(.pa-booked){transform:scale(.92)}

.pa-cal-legend{display:flex;gap:14px;justify-content:center;padding:8px 14px;border-top:1px solid var(--border-soft)}
.pa-legend-item{display:flex;align-items:center;gap:5px;font-size:10px;color:var(--text-mid);font-weight:700}
.pa-legend-dot{width:10px;height:10px;border-radius:4px}
.pa-legend-dot.pa-green{background:var(--green-soft);border:1.5px solid var(--green)}
.pa-legend-dot.pa-gold{background:var(--gold-bg);border:1.5px solid var(--gold)}
.pa-legend-dot.pa-gray{background:var(--bg);border:1.5px solid var(--border)}

.pa-sched-card{background:var(--card);margin:0 20px;border-radius:16px;border:1.5px solid var(--border);overflow:hidden}
.pa-sched-header{padding:16px 18px;border-bottom:1px solid var(--border-soft);display:flex;justify-content:space-between;align-items:center}
.pa-sched-title{font-family:'Outfit',sans-serif;font-size:15px;font-weight:800}
.pa-sched-badge{font-size:9px;font-weight:800;color:var(--green);background:var(--green-soft);padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:.3px}

.pa-day-row{display:flex;align-items:center;padding:0 18px;min-height:52px;border-bottom:1px solid var(--border-soft)}
.pa-day-row:last-child{border-bottom:none}
.pa-day-name{font-size:13px;font-weight:800;width:40px;flex-shrink:0;color:var(--text)}
.pa-day-name.pa-off{color:var(--text-light)}
.pa-day-hours{flex:1;display:flex;align-items:center;gap:6px;min-width:0}
.pa-hours-pill{font-family:'Outfit',sans-serif;font-size:13px;font-weight:800;color:var(--green);background:var(--green-soft);padding:6px 12px;border-radius:8px;cursor:pointer;border:1.5px solid transparent;transition:all .15s;white-space:nowrap}
.pa-hours-pill:hover{border-color:var(--green)}
.pa-hours-pill.pa-off{background:var(--bg);color:var(--text-light);cursor:default}
.pa-hours-pill.pa-off:hover{border-color:transparent}
.pa-hours-dash{color:var(--text-light);font-size:11px}
.pa-exception-tag{font-size:9px;font-weight:800;color:var(--coral);background:rgba(232,115,74,.1);padding:2px 7px;border-radius:100px;margin-left:4px}
.pa-day-toggle{width:36px;height:20px;background:var(--green);border-radius:100px;position:relative;cursor:pointer;flex-shrink:0;margin-left:12px;transition:background .2s;border:none}
.pa-day-toggle::after{content:'';position:absolute;top:2px;right:2px;width:16px;height:16px;background:white;border-radius:50%;transition:all .2s}
.pa-day-toggle.pa-off{background:var(--border)}
.pa-day-toggle.pa-off::after{right:auto;left:2px}

.pa-quick-grid{margin:0 20px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pa-quick-card{background:var(--card);border:1.5px solid var(--border);border-radius:14px;padding:14px 16px;cursor:pointer;transition:all .15s;display:flex;align-items:flex-start;gap:12px}
.pa-quick-card:hover{border-color:var(--green);background:var(--green-soft)}
.pa-quick-card:active{transform:scale(.97)}
.pa-quick-icon{width:36px;height:36px;border-radius:10px;background:var(--green-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.pa-quick-icon svg{width:16px;height:16px;stroke:var(--green);stroke-width:2.2;fill:none}
.pa-quick-icon.pa-purple{background:var(--purple-soft)}
.pa-quick-icon.pa-purple svg{stroke:var(--purple)}
.pa-quick-icon.pa-red{background:#fef0f0}
.pa-quick-icon.pa-red svg{stroke:var(--danger)}
.pa-quick-body h4{font-family:'Outfit',sans-serif;font-size:13px;font-weight:800;letter-spacing:-.01em;margin-bottom:2px}
.pa-quick-body p{font-size:10.5px;color:var(--text-mid);line-height:1.35;margin:0}

.pa-modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:60;display:flex;align-items:flex-end;justify-content:center}
.pa-modal-sheet{background:var(--card);width:100%;max-width:480px;border-radius:24px 24px 0 0;padding:20px 24px 32px;animation:pa-slideUp .25s ease-out}
@keyframes pa-slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.pa-modal-handle{width:40px;height:4px;background:var(--border);border-radius:100px;margin:0 auto 18px}
.pa-modal-title{font-family:'Outfit',sans-serif;font-size:20px;font-weight:800;margin-bottom:4px}
.pa-modal-sub{font-size:13px;color:var(--text-mid);margin-bottom:20px;line-height:1.5}
.pa-modal-actions{display:flex;gap:10px;margin-top:20px}
.pa-modal-btn{flex:1;padding:14px;border-radius:100px;border:none;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer}
.pa-modal-btn-cancel{background:var(--bg);color:var(--text);border:1.5px solid var(--border)}
.pa-modal-btn-confirm{background:var(--green);color:white}
.pa-modal-btn-danger{background:var(--danger);color:white}

.pa-tp-custom-label{font-size:11px;font-weight:800;color:var(--text-light);text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.pa-tp-row{display:flex;align-items:center;gap:10px}
.pa-tp-select{flex:1;padding:12px 14px;background:var(--bg);border:1.5px solid var(--border);border-radius:12px;font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;color:var(--text);appearance:none;cursor:pointer;outline:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center}
.pa-tp-select:focus{border-color:var(--green)}
.pa-tp-dash{font-size:16px;color:var(--text-light);font-weight:800}
.pa-tp-preview{background:var(--green-soft);border-radius:14px;padding:14px;text-align:center;margin-top:16px}
.pa-tp-preview-big{font-family:'Outfit',sans-serif;font-size:24px;font-weight:900;color:var(--green)}
.pa-tp-preview-sub{font-size:11px;color:var(--green-d);font-weight:700;margin-top:3px}

.pa-week-opt{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--bg);border:1.5px solid var(--border);border-radius:12px;cursor:pointer;transition:all .15s;margin-bottom:8px}
.pa-week-opt:hover,.pa-week-opt.pa-selected{border-color:var(--green);background:var(--green-soft)}
.pa-week-opt-radio{width:18px;height:18px;border-radius:50%;border:2px solid var(--border);flex-shrink:0;transition:all .15s;display:flex;align-items:center;justify-content:center}
.pa-week-opt.pa-selected .pa-week-opt-radio{border-color:var(--green);background:var(--green)}
.pa-week-opt.pa-selected .pa-week-opt-radio::after{content:'';width:6px;height:6px;background:white;border-radius:50%}
.pa-week-opt-label{font-size:13px;font-weight:700;flex:1}
.pa-week-opt-dates{font-size:11px;color:var(--text-light)}

.pa-clear-warn{background:#fef0f0;border:1.5px solid #f5c6c6;border-radius:12px;padding:14px;margin-bottom:4px;font-size:12px;color:#7f1d1d;line-height:1.5}
.pa-clear-warn b{font-weight:800}

.pa-copy-list{margin-bottom:4px}
.pa-copy-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-soft);font-size:13px}
.pa-copy-row:last-child{border-bottom:none}
.pa-copy-row svg{width:14px;height:14px;stroke:var(--green);stroke-width:2;fill:none;flex-shrink:0}
.pa-copy-row-label{font-weight:700;flex:1}
.pa-copy-row-badge{font-size:9px;font-weight:800;color:var(--green);background:var(--green-soft);padding:2px 8px;border-radius:100px}
.pa-copy-row-sub{font-size:10px;color:var(--text-light)}

.pa-toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--green);color:white;padding:12px 22px;border-radius:100px;font-size:13px;font-weight:800;z-index:70;box-shadow:0 10px 30px rgba(0,0,0,.2);white-space:nowrap;animation:pa-fadeUp .3s ease-out}
@keyframes pa-fadeUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

.pa-page-content{max-width:800px;margin:0 auto;padding:0 0 100px}

@media(min-width:900px){
  .pa-two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0 20px}
  .pa-two-col>.pa-col-left,.pa-two-col>.pa-col-right{margin:0}
  .pa-cal-wrap,.pa-sched-card{margin:0}
  .pa-quick-grid{margin:0 20px;grid-template-columns:repeat(4,1fr)}
  .pa-intro-card,.pa-confirm-banner{margin-left:20px;margin-right:20px}
  .pa-section-head{padding-left:20px;padding-right:20px}
}
@media(min-width:600px) and (max-width:899px){
  .pa-quick-grid{grid-template-columns:repeat(4,1fr)}
}
@media(max-width:599px){
  .pa-quick-grid{grid-template-columns:1fr 1fr}
}
`

export default function ProviderAvailability() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { count: unreadMsgCount } = useUnreadMessageCount()
  const today = new Date()

  const [providerId, setProviderId] = useState(null)
  const [apiAvailability, setApiAvailability] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // UI state
  const [showIntro, setShowIntro] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [toast, setToast] = useState(null)
  const [calMonth, setCalMonth] = useState('april') // 'april' | 'may'
  const [activeModal, setActiveModal] = useState(null) // 'time' | 'weekdays' | 'block' | 'copy' | 'clear' | 'booked'

  // Weekly schedule state
  const [schedule, setSchedule] = useState({
    Mon: { on: true, start: '8:00 AM', end: '5:00 PM' },
    Tue: { on: true, start: '8:00 AM', end: '5:00 PM' },
    Wed: { on: true, start: '8:00 AM', end: '5:00 PM' },
    Thu: { on: true, start: '8:00 AM', end: '5:00 PM' },
    Fri: { on: true, start: '9:00 AM', end: '3:00 PM' },
    Sat: { on: false, start: '8:00 AM', end: '5:00 PM' },
    Sun: { on: false, start: '8:00 AM', end: '5:00 PM' },
  })

  // Calendar day overrides: { [key: "apr-6"]: { status: 'available'|'unavailable'|'booked', time?: string } }
  const [dayOverrides, setDayOverrides] = useState({})

  // Time picker state
  const [tpDay, setTpDay] = useState(null) // day name for modal title
  const [tpStart, setTpStart] = useState('8:00')
  const [tpEnd, setTpEnd] = useState('17:00')

  // Block week state
  const [selectedWeek, setSelectedWeek] = useState(null)

  // Booked shift modal
  const [bookedDayData, setBookedDayData] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600) }
  const closeModal = () => { setActiveModal(null); setTpDay(null); setSelectedWeek(null) }

  // Fetch data from API
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
            setApiAvailability(slots)
            const updates = {}
            slots.forEach(slot => {
              if (slot.dayOfWeek != null && !slot.date) {
                const name = DOW_NAMES[slot.dayOfWeek]
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
      if (res.ok) setApiAvailability(await res.json())
    } catch {}
  }

  // Save weekly schedule to API
  const saveSchedule = async () => {
    if (!providerId) return
    try {
      const token = await getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      const existingWeeklySlots = apiAvailability.filter(s => s.dayOfWeek != null && !s.date)
      for (const slot of existingWeeklySlots) {
        await fetch(`${API_URL}/api/providers/${providerId}/availability/${slot.id}`, {
          method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
        })
      }
      for (const [day, val] of Object.entries(schedule)) {
        if (val.on) {
          await fetch(`${API_URL}/api/providers/${providerId}/availability`, {
            method: 'POST', headers,
            body: JSON.stringify({ dayOfWeek: DOW_MAP[day], startTime: val.start, endTime: val.end }),
          })
        }
      }
      showToast('Schedule saved!')
      await refreshAvailability()
    } catch { showToast('Failed to save schedule') }
  }

  // Compute calendar cell status for a given date
  const getCellStatus = (dateNum, month) => {
    const key = `${month}-${dateNum}`
    const override = dayOverrides[key]
    if (override) return override

    // Check API bookings
    const monthIdx = month === 'april' ? 3 : 4
    const year = 2026
    for (const b of bookings) {
      if (b.shift) {
        const d = new Date(b.shift.date)
        if (d.getFullYear() === year && d.getMonth() === monthIdx && d.getDate() === dateNum) {
          return { status: 'booked', time: `${shortFormat(b.shift.startTime)}-${shortFormat(b.shift.endTime)}`, booking: b }
        }
      }
    }

    // Fall back to weekly schedule
    const firstDow = month === 'april' ? 3 : 5 // Apr 1 2026 = Wed, May 1 2026 = Fri
    const dow = (firstDow + dateNum - 1) % 7
    const dayName = DOW_NAMES[dow]
    const sched = schedule[dayName]
    if (sched && sched.on) {
      return { status: 'available', time: `${shortFormat(sched.start)}-${shortFormat(sched.end)}` }
    }
    return { status: 'unavailable' }
  }

  // Toggle individual calendar cell
  const toggleCell = (dateNum, month) => {
    const key = `${month}-${dateNum}`
    const current = getCellStatus(dateNum, month)
    if (current.status === 'booked') return // can't toggle booked
    setDayOverrides(prev => {
      const next = { ...prev }
      if (current.status === 'available') {
        next[key] = { status: 'unavailable' }
      } else {
        next[key] = { status: 'available', time: '8-5' }
      }
      return next
    })
  }

  // Toggle day on/off in schedule
  const toggleDay = (dayName) => {
    setSchedule(prev => ({
      ...prev,
      [dayName]: { ...prev[dayName], on: !prev[dayName].on }
    }))
  }

  // Open time picker for a day
  const openTimePicker = (dayName) => {
    const sched = schedule[dayName]
    const startParsed = parseTimeTo24(sched.start)
    const endParsed = parseTimeTo24(sched.end)
    setTpDay(dayName)
    setTpStart(startParsed.h + ':' + String(startParsed.m).padStart(2, '0'))
    setTpEnd(endParsed.h + ':' + String(endParsed.m).padStart(2, '0'))
    setActiveModal('time')
  }

  // Save time picker
  const saveTime = () => {
    if (!tpDay) return
    const startText = formatTimeValue(tpStart)
    const endText = formatTimeValue(tpEnd)
    setSchedule(prev => ({
      ...prev,
      [tpDay]: { on: true, start: startText, end: endText }
    }))
    closeModal()
    showToast('Hours updated')
  }

  // Apply weekdays (sync schedule to calendar by clearing overrides)
  const applyWeekdays = () => {
    // Clear all day overrides so schedule takes effect
    setDayOverrides({})
    closeModal()
    showToast('Weekdays set to available')
  }

  // Block selected week
  const blockSelectedWeek = () => {
    if (!selectedWeek) { showToast('Select a week first'); return }
    const ranges = WEEK_OPTIONS[selectedWeek].ranges
    const newOverrides = { ...dayOverrides }
    ranges.forEach(r => {
      const month = r.month
      for (let d = r.start; d <= r.end; d++) {
        const key = `${month}-${d}`
        const current = getCellStatus(d, month)
        if (current.status !== 'booked') {
          newOverrides[key] = { status: 'unavailable' }
        }
      }
    })
    setDayOverrides(newOverrides)
    closeModal()
    showToast('Week blocked')
  }

  // Clear month
  const clearMonth = () => {
    const monthKey = calMonth
    const daysInMonth = monthKey === 'april' ? 30 : 31
    const newOverrides = { ...dayOverrides }
    for (let d = 1; d <= daysInMonth; d++) {
      const current = getCellStatus(d, monthKey)
      if (current.status === 'available') {
        newOverrides[`${monthKey}-${d}`] = { status: 'unavailable' }
      }
    }
    setDayOverrides(newOverrides)
    showToast(monthKey === 'april' ? 'April cleared' : 'May cleared')
  }

  // Copy forward
  const copyForward = () => {
    setDayOverrides({})
    closeModal()
    showToast('Schedule copied to next 4 weeks')
  }

  // Confirm schedule
  const confirmSchedule = () => {
    setConfirmed(true)
    showToast('Availability confirmed')
    saveSchedule()
  }

  // Render calendar grid for a month
  const renderCalendar = (month) => {
    const daysInMonth = month === 'april' ? 30 : 31
    const firstDow = month === 'april' ? 3 : 5
    const cells = []

    // Empty leading cells
    for (let i = 0; i < firstDow; i++) {
      cells.push(<div key={`e${i}`} className="pa-cal-cell pa-empty" />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = getCellStatus(d, month)
      const isToday = month === 'april' && d === today.getDate() && today.getMonth() === 3 && today.getFullYear() === 2026
      let className = 'pa-cal-cell'
      if (cell.status === 'available') className += ' pa-available'
      else if (cell.status === 'booked') className += ' pa-booked'
      else className += ' pa-unavailable'
      if (isToday) className += ' pa-today'

      const handleClick = () => {
        if (cell.status === 'booked' && cell.booking) {
          setBookedDayData({
            office: cell.booking.office?.name || 'Office',
            time: cell.time,
            day: d,
            id: cell.booking.id,
          })
          setActiveModal('booked')
        } else {
          toggleCell(d, month)
        }
      }

      cells.push(
        <button key={d} className={className} onClick={handleClick}>
          <span className="pa-day-num">{d}</span>
          {cell.status !== 'unavailable' && cell.time && (
            <span className="pa-cal-time">{cell.time}</span>
          )}
        </button>
      )
    }

    // Trailing empty cells
    const total = firstDow + daysInMonth
    const trailing = total % 7 === 0 ? 0 : 7 - (total % 7)
    for (let i = 0; i < trailing; i++) {
      cells.push(<div key={`t${i}`} className="pa-cal-cell pa-empty" />)
    }
    return cells
  }

  const isException = (dayName) => {
    const defaults = { Mon: '8:00 AM-5:00 PM', Tue: '8:00 AM-5:00 PM', Wed: '8:00 AM-5:00 PM', Thu: '8:00 AM-5:00 PM', Fri: '8:00 AM-5:00 PM' }
    if (!schedule[dayName].on) return false
    const current = `${schedule[dayName].start}-${schedule[dayName].end}`
    return defaults[dayName] && current !== defaults[dayName]
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f8f6', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{styles}</style>
      <TopBar role="provider" />

      <div className="pa-page-content">

        {/* Confirm banner */}
        <div
          className="pa-confirm-banner"
          style={{
            background: confirmed ? 'var(--green-soft)' : 'var(--purple-soft)',
            borderColor: confirmed ? 'var(--green)' : 'rgba(124,58,237,.2)',
          }}
        >
          <div className="pa-confirm-icon" style={{ background: confirmed ? 'var(--green)' : 'var(--purple)' }}>
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="pa-confirm-body">
            <div style={{ fontSize: 13, fontWeight: 800, color: confirmed ? 'var(--green)' : '#5b21b6' }}>
              {confirmed ? 'Schedule confirmed' : 'Confirm your schedule'}
            </div>
            <div style={{ fontSize: 11, color: confirmed ? 'var(--green-d)' : '#7c3aed', marginTop: 1 }}>
              {confirmed ? 'Next review in 2 weeks' : 'Review the next 2 weeks'}
            </div>
          </div>
          <button
            className="pa-confirm-btn"
            style={{ background: confirmed ? 'var(--green)' : 'var(--purple)' }}
            disabled={confirmed}
            onClick={confirmSchedule}
          >
            {confirmed ? 'Done' : 'Confirm'}
          </button>
        </div>

        {/* Two column layout */}
        <div className="pa-two-col">
          <div className="pa-col-left">
            {/* Calendar - April */}
            {calMonth === 'april' && (
              <div className="pa-cal-wrap">
                <div className="pa-cal-header">
                  <div className="pa-cal-month">April 2026</div>
                  <div className="pa-cal-nav">
                    <button disabled><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                    <button onClick={() => setCalMonth('may')}><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
                  </div>
                </div>
                <div className="pa-cal-body">
                  <div className="pa-cal-days">
                    {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="pa-cal-day-label">{d}</div>)}
                  </div>
                  <div className="pa-cal-grid">{renderCalendar('april')}</div>
                </div>
                <div className="pa-cal-legend">
                  <div className="pa-legend-item"><div className="pa-legend-dot pa-green" />Available</div>
                  <div className="pa-legend-item"><div className="pa-legend-dot pa-gold" />Booked</div>
                  <div className="pa-legend-item"><div className="pa-legend-dot pa-gray" />Off</div>
                </div>
              </div>
            )}

            {/* Calendar - May */}
            {calMonth === 'may' && (
              <div className="pa-cal-wrap">
                <div className="pa-cal-header">
                  <div className="pa-cal-month">May 2026</div>
                  <div className="pa-cal-nav">
                    <button onClick={() => setCalMonth('april')}><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                    <button disabled><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
                  </div>
                </div>
                <div className="pa-cal-body">
                  <div className="pa-cal-days">
                    {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="pa-cal-day-label">{d}</div>)}
                  </div>
                  <div className="pa-cal-grid">{renderCalendar('may')}</div>
                </div>
                <div className="pa-cal-legend">
                  <div className="pa-legend-item"><div className="pa-legend-dot pa-green" />Available</div>
                  <div className="pa-legend-item"><div className="pa-legend-dot pa-gold" />Booked</div>
                  <div className="pa-legend-item"><div className="pa-legend-dot pa-gray" />Off</div>
                </div>
              </div>
            )}
          </div>

          <div className="pa-col-right" style={{ marginTop: 16 }}>
            {/* Weekly Schedule */}
            <div className="pa-section-head">
              <div className="pa-section-label">Weekly Schedule</div>
              <div className="pa-section-help">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                Tap hours to edit
              </div>
            </div>
            <div className="pa-sched-card">
              <div className="pa-sched-header">
                <div className="pa-sched-title">Your default hours</div>
                <div className="pa-sched-badge">Repeats weekly</div>
              </div>
              {SCHED_DAYS.map(day => {
                const val = schedule[day]
                return (
                  <div key={day} className="pa-day-row">
                    <div className={`pa-day-name${val.on ? '' : ' pa-off'}`}>{day}</div>
                    <div className="pa-day-hours">
                      {val.on ? (
                        <>
                          <span className="pa-hours-pill" onClick={() => openTimePicker(day)}>{val.start}</span>
                          <span className="pa-hours-dash">–</span>
                          <span className="pa-hours-pill" onClick={() => openTimePicker(day)}>{val.end}</span>
                          {isException(day) && <span className="pa-exception-tag">Exception</span>}
                        </>
                      ) : (
                        <span className="pa-hours-pill pa-off">Off</span>
                      )}
                    </div>
                    <button
                      className={`pa-day-toggle${val.on ? '' : ' pa-off'}`}
                      onClick={() => toggleDay(day)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pa-section-head" style={{ paddingTop: 20, paddingBottom: 4 }}>
          <div className="pa-section-label">Quick Actions</div>
        </div>
        <div className="pa-quick-grid">
          <div className="pa-quick-card" onClick={() => setActiveModal('weekdays')}>
            <div className="pa-quick-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
            <div className="pa-quick-body"><h4>Set weekdays</h4><p>Apply default hours to Mon–Fri</p></div>
          </div>
          <div className="pa-quick-card" onClick={() => setActiveModal('block')}>
            <div className="pa-quick-icon pa-purple"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="9" y1="10" x2="15" y2="16" /><line x1="15" y1="10" x2="9" y2="16" /></svg></div>
            <div className="pa-quick-body"><h4>Block a week</h4><p>Mark a full week as off</p></div>
          </div>
          <div className="pa-quick-card" onClick={() => setActiveModal('copy')}>
            <div className="pa-quick-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /></svg></div>
            <div className="pa-quick-body"><h4>Copy 4 weeks</h4><p>Duplicate this week forward</p></div>
          </div>
          <div className="pa-quick-card" onClick={() => setActiveModal('clear')}>
            <div className="pa-quick-icon pa-red"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></div>
            <div className="pa-quick-body"><h4>Clear month</h4><p>Reset to all off</p></div>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && <div className="pa-toast">{toast}</div>}

      {/* MODALS */}

      {/* Time picker modal */}
      {activeModal === 'time' && (
        <div className="pa-modal-bg" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="pa-modal-sheet">
            <div className="pa-modal-handle" />
            <div className="pa-modal-title">Set hours for {tpDay}</div>
            <div className="pa-modal-sub">Choose when you are available on {tpDay}s</div>
            <div>
              <div className="pa-tp-custom-label">Set your hours</div>
              <div className="pa-tp-row">
                <select className="pa-tp-select" value={tpStart} onChange={e => setTpStart(e.target.value)}>
                  {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <span className="pa-tp-dash">–</span>
                <select className="pa-tp-select" value={tpEnd} onChange={e => setTpEnd(e.target.value)}>
                  {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="pa-tp-preview">
              <div className="pa-tp-preview-big">{formatTimeValue(tpStart)} – {formatTimeValue(tpEnd)}</div>
              <div className="pa-tp-preview-sub">{calcHours(tpStart, tpEnd)}</div>
            </div>
            <div className="pa-modal-actions">
              <button className="pa-modal-btn pa-modal-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="pa-modal-btn pa-modal-btn-confirm" onClick={saveTime}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Set weekdays modal */}
      {activeModal === 'weekdays' && (
        <div className="pa-modal-bg" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="pa-modal-sheet">
            <div className="pa-modal-handle" />
            <div className="pa-modal-title">Set all weekdays</div>
            <div className="pa-modal-sub">Apply your default Mon–Fri hours to the calendar.</div>
            <div className="pa-modal-actions">
              <button className="pa-modal-btn pa-modal-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="pa-modal-btn pa-modal-btn-confirm" onClick={applyWeekdays}>Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Block a week modal */}
      {activeModal === 'block' && (
        <div className="pa-modal-bg" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="pa-modal-sheet">
            <div className="pa-modal-handle" />
            <div className="pa-modal-title">Block a week</div>
            <div className="pa-modal-sub">Select a week to mark as unavailable.</div>
            {WEEK_OPTIONS.map((w, i) => (
              <div
                key={i}
                className={`pa-week-opt${selectedWeek === i ? ' pa-selected' : ''}`}
                onClick={() => setSelectedWeek(i)}
              >
                <div className="pa-week-opt-radio" />
                <div className="pa-week-opt-label">{w.label}</div>
                {w.tag && <div className="pa-week-opt-dates">{w.tag}</div>}
              </div>
            ))}
            <div className="pa-modal-actions">
              <button className="pa-modal-btn pa-modal-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="pa-modal-btn pa-modal-btn-confirm" onClick={blockSelectedWeek}>Block</button>
            </div>
          </div>
        </div>
      )}

      {/* Copy 4 weeks modal */}
      {activeModal === 'copy' && (
        <div className="pa-modal-bg" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="pa-modal-sheet">
            <div className="pa-modal-handle" />
            <div className="pa-modal-title">Copy to next 4 weeks</div>
            <div className="pa-modal-sub">This week's schedule will be applied forward.</div>
            <div className="pa-copy-list">
              <div className="pa-copy-row">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /></svg>
                <div className="pa-copy-row-label">Apr 13 – 19</div>
                <div className="pa-copy-row-badge">SOURCE</div>
              </div>
              {['Apr 20 – 26','Apr 27 – May 3','May 4 – 10','May 11 – 17'].map(label => (
                <div key={label} className="pa-copy-row">
                  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /></svg>
                  <div className="pa-copy-row-label">{label}</div>
                  <div className="pa-copy-row-sub">Overwrite</div>
                </div>
              ))}
            </div>
            <div className="pa-modal-actions">
              <button className="pa-modal-btn pa-modal-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="pa-modal-btn pa-modal-btn-confirm" onClick={copyForward}>Copy</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear month modal */}
      {activeModal === 'clear' && (
        <div className="pa-modal-bg" onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="pa-modal-sheet">
            <div className="pa-modal-handle" />
            <div className="pa-modal-title">Clear {calMonth === 'april' ? 'April' : 'May'}</div>
            <div className="pa-modal-sub">Reset all availability for this month.</div>
            <div className="pa-clear-warn"><b>This cannot be undone.</b> All available days will be set to off. Booked shifts stay unchanged.</div>
            <div className="pa-modal-actions">
              <button className="pa-modal-btn pa-modal-btn-cancel" onClick={closeModal}>Keep</button>
              <button className="pa-modal-btn pa-modal-btn-danger" onClick={() => { closeModal(); clearMonth() }}>Clear {calMonth === 'april' ? 'April' : 'May'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Booked shift modal */}
      {activeModal === 'booked' && bookedDayData && (
        <BookedShiftModal
          shift={{
            officeName: bookedDayData.office,
            officeInitials: (bookedDayData.office || 'OF').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
            officeRating: '4.9',
            officeBookingCount: 12,
            dateTime: `April ${bookedDayData.day}, 2026 · ${bookedDayData.time}`,
            duration: '8 hours',
            role: 'Booked Shift',
            roleSub: 'Tap Message to reach the office',
            payTotal: 0,
            paySub: 'See details in confirmation email',
            address: bookedDayData.office,
            distance: '',
          }}
          onClose={closeModal}
          onCancelShift={() => { closeModal(); showToast('Booking cancelled') }}
          onMessageOffice={() => { closeModal(); navigate('/messages') }}
        />
      )}

      <ProviderBottomNav />
    </div>
  )
}

const WEEK_OPTIONS = [
  { label: 'Apr 13 – 19', tag: 'This week', ranges: [{ month: 'april', start: 13, end: 19 }] },
  { label: 'Apr 20 – 26', tag: null, ranges: [{ month: 'april', start: 20, end: 26 }] },
  { label: 'Apr 27 – May 3', tag: null, ranges: [{ month: 'april', start: 27, end: 30 }, { month: 'may', start: 1, end: 3 }] },
  { label: 'May 4 – 10', tag: null, ranges: [{ month: 'may', start: 4, end: 10 }] },
  { label: 'May 11 – 17', tag: null, ranges: [{ month: 'may', start: 11, end: 17 }] },
  { label: 'May 18 – 24', tag: null, ranges: [{ month: 'may', start: 18, end: 24 }] },
  { label: 'May 25 – 31', tag: null, ranges: [{ month: 'may', start: 25, end: 31 }] },
]
