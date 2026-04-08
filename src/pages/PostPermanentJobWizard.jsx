import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

/* ─── COLORS ─── */
const C = {
  green: '#1a7f5e',
  greenTint: '#f1f9f5',
  greenSoft: '#e8f3ee',
  purple: '#7c3aed',
  purpleSoft: '#f1ebfa',
  bg: '#f9f8f6',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
}

/* ─── CONSTANTS ─── */
const ROLES = ['Dental Assistant', 'Hygienist', 'Front Desk', 'Dentist', 'Office Manager', 'Treatment Coordinator']
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract']
const EXPERIENCE_LEVELS = ['Any', '1+ yrs', '3+ yrs', '5+ yrs', '10+ yrs']
const CREDENTIAL_OPTIONS = ['RDH', 'RDA', 'EFDA', 'CDA', 'BLS CPR', 'Radiology Cert', 'Local Anesthesia', 'Nitrous Cert']
const SOFTWARE_OPTIONS = ['Dentrix', 'Eaglesoft', 'Open Dental', 'Curve Dental', 'Carestream', 'Practice-Web']
const BENEFIT_OPTIONS = ['Health Insurance', 'Dental', 'Vision', '401k', 'PTO', 'Paid Holidays', 'CE Reimbursement', 'Uniform Allowance']
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const PRACTICE_TYPES = ['General Dentistry', 'Family Dentistry', 'Cosmetic Dentistry', 'Pediatric Dentistry', 'Orthodontics', 'Endodontics', 'Periodontics']

const STEP_LABELS = ['Who', 'Schedule', 'Pay', 'Experience', 'Credentials', 'Software & Benefits', 'AI Builder', 'Review']
const TOTAL_STEPS = 8

/* ─── AI WRITING STYLES ─── */
const AI_STYLES = [
  {
    id: 'professional',
    label: 'Professional',
    emoji: '💼',
    build: (p) =>
      `${p.officeName} is seeking a ${p.employmentType} ${p.role} to join our team${p.city ? ` in ${p.city}` : ''}. ` +
      `Schedule: ${p.days}. ${p.payLine} ` +
      `Requirements: ${p.experience} experience${p.credentials ? `, ${p.credentials}` : ''}. ` +
      (p.benefits ? `Benefits include ${p.benefits}.` : ''),
  },
  {
    id: 'friendly',
    label: 'Friendly & Warm',
    emoji: '😊',
    build: (p) =>
      `Hey there! We're looking for an awesome ${p.role} to join the ${p.officeName} family${p.city ? ` in ${p.city}` : ''}. ` +
      `This is a ${p.employmentType} position, ${p.days}. ${p.payLine} ` +
      `We'd love someone with ${p.experience} of experience. ` +
      (p.benefits ? `Perks? Oh yeah — ${p.benefits}!` : 'Come grow with us!'),
  },
  {
    id: 'concise',
    label: 'Short & Direct',
    emoji: '⚡',
    build: (p) =>
      `${p.employmentType} ${p.role} — ${p.officeName}${p.city ? `, ${p.city}` : ''}. ` +
      `${p.days}. ${p.payLine} ` +
      `${p.experience} exp required. ${p.credentials || ''} ${p.benefits ? `Benefits: ${p.benefits}.` : ''}`.trim(),
  },
  {
    id: 'enthusiastic',
    label: 'Enthusiastic',
    emoji: '🚀',
    build: (p) =>
      `Exciting opportunity! ${p.officeName}${p.city ? ` in ${p.city}` : ''} is hiring a talented ${p.role}! ` +
      `This ${p.employmentType} role offers ${p.payLine.toLowerCase()} and a fantastic schedule: ${p.days}. ` +
      `We're looking for someone with ${p.experience} of experience who's passionate about patient care. ` +
      (p.benefits ? `Amazing benefits package including ${p.benefits}!` : 'Apply today!'),
  },
]

/* ─── FONT STYLE HELPERS ─── */
const fontOutfit = { fontFamily: "'Outfit', sans-serif" }
const fontDM = { fontFamily: "'DM Sans', sans-serif" }

/* ═══════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════ */

function PillRow({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          style={fontDM}
          className={`px-4 py-2 rounded-full text-[13px] font-semibold border transition-all ${
            value === o
              ? `border-[${C.green}] text-[${C.green}] bg-[${C.greenTint}]`
              : `border-[${C.border}] text-[${C.textMid}] hover:border-[${C.green}]`
          }`}
          // inline styles for dynamic colors
          {...(value === o
            ? { style: { ...fontDM, borderColor: C.green, color: C.green, background: C.greenTint } }
            : { style: { ...fontDM, borderColor: C.border, color: C.textMid } })}
        >
          {value === o && '✓ '}{o}
        </button>
      ))}
    </div>
  )
}

function MultiPillRow({ options, selected, onToggle, color = 'green' }) {
  const sel = color === 'purple'
    ? { borderColor: C.purple, color: C.purple, background: C.purpleSoft }
    : { borderColor: C.green, color: C.green, background: C.greenTint }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const isSelected = selected.includes(o)
        return (
          <button
            key={o}
            onClick={() => onToggle(o)}
            style={isSelected ? { ...fontDM, ...sel } : { ...fontDM, borderColor: C.border, color: C.textMid }}
            className="px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
          >
            {isSelected && '✓ '}{o}
          </button>
        )
      })}
    </div>
  )
}

function Dropdown({ label, value, onChange, options }) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-bold mb-2" style={{ ...fontOutfit, color: C.text }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...fontDM, borderColor: C.border, color: value ? C.text : C.textLight }}
        className="w-full border rounded-xl px-4 py-3 text-[13px] bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#1a7f5e]/30"
      >
        <option value="">Select...</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function TimePickerCard({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="flex-1">
      <label className="block text-[12px] font-bold mb-1.5" style={{ ...fontOutfit, color: C.textMid }}>{label}</label>
      <button
        onClick={() => setOpen(!open)}
        style={{ borderColor: value ? C.green : C.border, ...fontDM }}
        className="w-full border rounded-xl px-3 py-3 text-[13px] text-left bg-white"
      >
        {value || 'Select'}
      </button>
      {open && (
        <TimeWheel
          value={value}
          onChange={(v) => { onChange(v); setOpen(false) }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

function TimeWheel({ value, onChange, onClose }) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = ['00', '15', '30', '45']
  const periods = ['AM', 'PM']
  const parsed = value ? value.match(/(\d+):(\d+)\s*(AM|PM)/i) : null
  const [h, setH] = useState(parsed ? parseInt(parsed[1]) : 8)
  const [m, setM] = useState(parsed ? parsed[2] : '00')
  const [p, setP] = useState(parsed ? parsed[3] : 'AM')

  return (
    <div className="mt-2 bg-white border rounded-xl p-3 shadow-lg" style={{ borderColor: C.border }}>
      <div className="flex gap-2 mb-3">
        <WheelColumn items={hours} value={h} onChange={setH} />
        <WheelColumn items={minutes} value={m} onChange={setM} />
        <WheelColumn items={periods} value={p} onChange={setP} />
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2 rounded-lg text-[12px] font-semibold" style={{ color: C.textMid, ...fontDM }}>Cancel</button>
        <button onClick={() => onChange(`${h}:${m} ${p}`)} className="flex-1 py-2 rounded-lg text-[12px] font-bold text-white" style={{ background: C.green, ...fontDM }}>Set</button>
      </div>
    </div>
  )
}

function WheelColumn({ items, value, onChange }) {
  return (
    <div className="flex-1 max-h-[120px] overflow-y-auto rounded-lg" style={{ background: C.borderSoft }}>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          style={{
            ...fontDM,
            background: String(value) === String(item) ? C.green : 'transparent',
            color: String(value) === String(item) ? '#fff' : C.textMid,
          }}
          className="w-full py-1.5 text-[12px] font-semibold rounded-md transition"
        >
          {item}
        </button>
      ))}
    </div>
  )
}

function DatePickerSheet({ value, onChange, onClose }) {
  const today = new Date()
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [viewYear, setViewYear] = useState(today.getFullYear())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1) }
    else setViewMonth(viewMonth - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1) }
    else setViewMonth(viewMonth + 1)
  }

  return (
    <div className="mt-2 bg-white border rounded-xl p-4 shadow-lg" style={{ borderColor: C.border }}>
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="text-[16px] px-2" style={{ color: C.textMid }}>‹</button>
        <span className="text-[13px] font-bold" style={{ ...fontOutfit, color: C.text }}>{monthName}</span>
        <button onClick={nextMonth} className="text-[16px] px-2" style={{ color: C.textMid }}>›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <span key={i} className="text-[10px] font-bold" style={{ color: C.textLight }}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array(firstDay).fill(null).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1
          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
          const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0])
          const isSel = value === dateStr
          return (
            <button
              key={d}
              disabled={isPast}
              onClick={() => { onChange(dateStr); onClose() }}
              style={{
                ...fontDM,
                background: isSel ? C.green : 'transparent',
                color: isSel ? '#fff' : isPast ? C.border : C.text,
              }}
              className="w-8 h-8 rounded-full text-[12px] font-semibold transition mx-auto"
            >
              {d}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReviewCard({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b" style={{ borderColor: C.borderSoft }}>
      <span className="text-[16px] mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ ...fontOutfit, color: C.textLight }}>{label}</p>
        <p className="text-[14px] font-semibold" style={{ ...fontDM, color: C.text }}>{value || '—'}</p>
      </div>
    </div>
  )
}

function TagsList({ items, color = 'green' }) {
  if (!items?.length) return <span className="text-[13px]" style={{ color: C.textLight }}>None selected</span>
  const bg = color === 'purple' ? C.purpleSoft : C.greenSoft
  const fg = color === 'purple' ? C.purple : C.green
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <span key={t} className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: bg, color: fg, ...fontDM }}>{t}</span>
      ))}
    </div>
  )
}

function Confetti() {
  const colors = [C.green, C.purple, '#f59e0b', '#ef4444', '#3b82f6']
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 6,
    duration: 1.5 + Math.random() * 1.5,
  }))
  return (
    <div className="fixed inset-0 pointer-events-none z-[999] overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function SuccessModal({ onDashboard, onPostAnother }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Confetti />
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center shadow-xl relative z-[1000]">
        <div className="text-5xl mb-4">💼</div>
        <h2 className="text-xl font-extrabold mb-2" style={{ ...fontOutfit, color: C.text }}>Job Posted!</h2>
        <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>
          Your permanent position is live. Qualified professionals in your area will be notified.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onDashboard}
            className="w-full py-3 rounded-full text-[13px] font-bold text-white transition hover:opacity-90"
            style={{ background: C.green, ...fontDM }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={onPostAnother}
            className="w-full py-3 rounded-full text-[13px] font-bold border transition hover:opacity-80"
            style={{ borderColor: C.border, color: C.text, ...fontDM }}
          >
            Post Another
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MAIN WIZARD
   ═══════════════════════════════════════════ */

export default function PostPermanentJobWizard() {
  const navigate = useNavigate()
  const { getToken } = useAuth()

  // Wizard state
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [toast, setToast] = useState(null)

  // Office info for AI builder
  const [officeName, setOfficeName] = useState('')
  const [officeCity, setOfficeCity] = useState('')

  // Step 1 — Who
  const [role, setRole] = useState('')
  const [practiceType, setPracticeType] = useState('')
  const [employmentType, setEmploymentType] = useState('Full-time')

  // Step 2 — Schedule
  const [days, setDays] = useState([])
  const [startTime, setStartTime] = useState('8:00 AM')
  const [endTime, setEndTime] = useState('5:00 PM')
  const [startDate, setStartDate] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Step 3 — Pay
  const [payType, setPayType] = useState('hourly')
  const [payMin, setPayMin] = useState('')
  const [payMax, setPayMax] = useState('')

  // Step 4 — Experience
  const [experience, setExperience] = useState('Any')

  // Step 5 — Credentials
  const [credentials, setCredentials] = useState([])

  // Step 6 — Software & Benefits
  const [software, setSoftware] = useState([])
  const [benefits, setBenefits] = useState([])

  // Step 7 — AI Builder
  const [selectedStyle, setSelectedStyle] = useState('professional')
  const [aiGenerated, setAiGenerated] = useState('')
  const [editingAi, setEditingAi] = useState(false)

  // Fetch office info
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/offices/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setOfficeName(data.name || data.officeName || 'Our Office')
          setOfficeCity(data.city || data.location || '')
        }
      } catch { /* fallback to defaults */ }
    })()
  }, [getToken])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const toggle = (arr, setArr, v) =>
    setArr((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))

  const formatTime = (t) => t || ''

  const formatDateDisplay = (d) => {
    if (!d) return 'Select start date'
    const dt = new Date(d + 'T00:00:00')
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Build AI description
  const buildAi = useCallback(() => {
    const style = AI_STYLES.find((s) => s.id === selectedStyle) || AI_STYLES[0]
    const payLine =
      payType === 'salary'
        ? `Salary: $${Number(payMin || 0).toLocaleString()}${payMax ? ` – $${Number(payMax).toLocaleString()}` : ''}/yr.`
        : `Pay: $${payMin || '0'}${payMax ? ` – $${payMax}` : ''}/hr.`
    const p = {
      officeName: officeName || 'Our Office',
      city: officeCity,
      role,
      employmentType,
      days: days.length ? days.join(', ') : 'Flexible schedule',
      payLine,
      experience: experience === 'Any' ? 'any level of' : experience,
      credentials: credentials.length ? credentials.join(', ') : '',
      benefits: benefits.length ? benefits.join(', ') : '',
    }
    return style.build(p)
  }, [selectedStyle, officeName, officeCity, role, employmentType, days, payType, payMin, payMax, experience, credentials, benefits])

  useEffect(() => {
    if (step === 7 && !editingAi) {
      setAiGenerated(buildAi())
    }
  }, [step, selectedStyle, buildAi, editingAi])

  // Pay display for review
  const payDisplay = () => {
    if (payType === 'salary') {
      if (payMin && payMax) return `$${Number(payMin).toLocaleString()} – $${Number(payMax).toLocaleString()}/yr`
      if (payMin) return `From $${Number(payMin).toLocaleString()}/yr`
      return '—'
    }
    if (payMin && payMax) return `$${payMin} – $${payMax}/hr`
    if (payMin) return `$${payMin}/hr`
    return '—'
  }

  // Validation per step
  const canProceed = () => {
    switch (step) {
      case 1: return !!role
      case 2: return days.length > 0
      case 3: return !!payMin
      case 4: return true
      case 5: return true
      case 6: return true
      case 7: return !!aiGenerated
      case 8: return true
      default: return false
    }
  }

  // Submit job
  const submitJob = async () => {
    setSubmitting(true)
    try {
      const token = await getToken()
      const body = {
        role,
        jobType: 'PERMANENT',
        date: new Date().toISOString(),
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
        hourlyRate: payType === 'hourly' ? parseFloat(payMin) : 0,
        description: aiGenerated || '',
        salaryMin: payType === 'salary' ? parseFloat(payMin) : null,
        salaryMax: payType === 'salary' ? parseFloat(payMax) : null,
        schedule: employmentType + ' · ' + days.join(', '),
        benefits,
        software,
      }
      const res = await fetch(`${API_URL}/api/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to post job')
      }
      setShowSuccess(true)
    } catch (err) {
      showToast(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Navigation
  const next = async () => {
    if (!canProceed()) return
    if (step === TOTAL_STEPS) {
      await submitJob()
    } else {
      setStep((s) => s + 1)
    }
  }

  const back = () => {
    if (step > 1) setStep((s) => s - 1)
  }

  const resetForm = () => {
    setStep(1); setShowSuccess(false); setRole(''); setPracticeType(''); setEmploymentType('Full-time')
    setDays([]); setStartTime('8:00 AM'); setEndTime('5:00 PM'); setStartDate('')
    setPayType('hourly'); setPayMin(''); setPayMax(''); setExperience('Any')
    setCredentials([]); setSoftware([]); setBenefits([]); setSelectedStyle('professional')
    setAiGenerated(''); setEditingAi(false)
  }

  /* ─── SUCCESS MODAL ─── */
  if (showSuccess) {
    return (
      <SuccessModal
        onDashboard={() => navigate('/dashboard')}
        onPostAnother={resetForm}
      />
    )
  }

  /* ─── RENDER ─── */
  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-white text-[13px] font-semibold" style={{ background: C.text, ...fontDM }}>
          <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px] font-bold">!</span>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: C.border }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <h1 className="text-[15px] font-extrabold" style={{ ...fontOutfit, color: C.text }}>Post Permanent Job</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-lg mx-auto px-4 pt-5 pb-3">
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-all duration-300"
              style={{ background: i < step ? C.green : C.border }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[11px] font-semibold" style={{ ...fontDM, color: C.textLight }}>Step {step} of {TOTAL_STEPS}</span>
          <span className="text-[11px] font-bold" style={{ ...fontDM, color: C.green }}>{STEP_LABELS[step - 1]}</span>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-lg mx-auto px-4 pb-32">
        <div className="bg-white border rounded-2xl p-5" style={{ borderColor: C.border }}>

          {/* ═══ STEP 1: WHO ═══ */}
          {step === 1 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ ...fontOutfit, color: C.textLight }}>Step 1</p>
              <h2 className="text-xl font-extrabold mb-1" style={{ ...fontOutfit, color: C.text }}>Who are you hiring?</h2>
              <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>Select the role, practice type, and employment type.</p>

              <label className="block text-[13px] font-bold mb-2" style={{ ...fontOutfit, color: C.text }}>Role</label>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className="px-3 py-3 border-2 rounded-xl text-[13px] font-semibold text-left transition"
                    style={{
                      ...fontDM,
                      borderColor: role === r ? C.green : C.border,
                      color: role === r ? C.green : C.textMid,
                      background: role === r ? C.greenTint : 'white',
                    }}
                  >
                    {role === r && '✓ '}{r}
                  </button>
                ))}
              </div>

              <Dropdown label="Practice Type" value={practiceType} onChange={setPracticeType} options={PRACTICE_TYPES} />

              <label className="block text-[13px] font-bold mb-2" style={{ ...fontOutfit, color: C.text }}>Employment Type</label>
              <PillRow options={EMPLOYMENT_TYPES} value={employmentType} onChange={setEmploymentType} />
            </div>
          )}

          {/* ═══ STEP 2: SCHEDULE ═══ */}
          {step === 2 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ ...fontOutfit, color: C.textLight }}>Step 2</p>
              <h2 className="text-xl font-extrabold mb-1" style={{ ...fontOutfit, color: C.text }}>Work Schedule</h2>
              <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>Select the days, hours, and start date.</p>

              <label className="block text-[13px] font-bold mb-2" style={{ ...fontOutfit, color: C.text }}>Days of the Week</label>
              <MultiPillRow options={DAYS_OF_WEEK} selected={days} onToggle={(d) => toggle(days, setDays, d)} />

              <div className="flex gap-3 mt-6">
                <TimePickerCard label="Start Time" value={startTime} onChange={setStartTime} />
                <TimePickerCard label="End Time" value={endTime} onChange={setEndTime} />
              </div>

              <div className="mt-6">
                <label className="block text-[13px] font-bold mb-2" style={{ ...fontOutfit, color: C.text }}>Start Date</label>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full border rounded-xl px-4 py-3 text-[13px] text-left transition"
                  style={{ ...fontDM, borderColor: startDate ? C.green : C.border, color: startDate ? C.text : C.textLight }}
                >
                  {formatDateDisplay(startDate)}
                </button>
                {showDatePicker && (
                  <DatePickerSheet
                    value={startDate}
                    onChange={setStartDate}
                    onClose={() => setShowDatePicker(false)}
                  />
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: PAY ═══ */}
          {step === 3 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ ...fontOutfit, color: C.textLight }}>Step 3</p>
              <h2 className="text-xl font-extrabold mb-1" style={{ ...fontOutfit, color: C.text }}>Compensation</h2>
              <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>Set the pay type and range.</p>

              <div className="flex border-2 rounded-xl overflow-hidden mb-6" style={{ borderColor: C.border }}>
                {['hourly', 'salary'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setPayType(t)}
                    className="flex-1 py-3 text-[13px] font-bold transition"
                    style={{
                      ...fontDM,
                      background: payType === t ? C.green : 'white',
                      color: payType === t ? '#fff' : C.textMid,
                    }}
                  >
                    {t === 'hourly' ? 'Hourly' : 'Salary'}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[12px] font-bold mb-1.5" style={{ ...fontOutfit, color: C.textMid }}>
                    {payType === 'salary' ? 'Min Salary' : 'Min Rate'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold" style={{ color: C.textLight }}>$</span>
                    <input
                      type="number"
                      value={payMin}
                      onChange={(e) => setPayMin(e.target.value)}
                      placeholder={payType === 'salary' ? '50000' : '30'}
                      className="w-full border rounded-xl pl-7 pr-3 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1a7f5e]/30"
                      style={{ ...fontDM, borderColor: C.border }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-[12px] font-bold mb-1.5" style={{ ...fontOutfit, color: C.textMid }}>
                    {payType === 'salary' ? 'Max Salary' : 'Max Rate'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold" style={{ color: C.textLight }}>$</span>
                    <input
                      type="number"
                      value={payMax}
                      onChange={(e) => setPayMax(e.target.value)}
                      placeholder={payType === 'salary' ? '70000' : '45'}
                      className="w-full border rounded-xl pl-7 pr-3 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1a7f5e]/30"
                      style={{ ...fontDM, borderColor: C.border }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-[11px] mt-2" style={{ ...fontDM, color: C.textLight }}>
                {payType === 'salary' ? 'Annual salary range' : 'Hourly rate range'}. Max is optional.
              </p>
            </div>
          )}

          {/* ═══ STEP 4: EXPERIENCE ═══ */}
          {step === 4 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ ...fontOutfit, color: C.textLight }}>Step 4</p>
              <h2 className="text-xl font-extrabold mb-1" style={{ ...fontOutfit, color: C.text }}>Experience Required</h2>
              <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>How much experience should the ideal candidate have?</p>

              <div className="grid grid-cols-2 gap-2">
                {EXPERIENCE_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setExperience(lvl)}
                    className="px-4 py-4 border-2 rounded-xl text-[14px] font-semibold transition"
                    style={{
                      ...fontDM,
                      borderColor: experience === lvl ? C.green : C.border,
                      color: experience === lvl ? C.green : C.textMid,
                      background: experience === lvl ? C.greenTint : 'white',
                    }}
                  >
                    {experience === lvl && '✓ '}{lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 5: CREDENTIALS ═══ */}
          {step === 5 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ ...fontOutfit, color: C.textLight }}>Step 5</p>
              <h2 className="text-xl font-extrabold mb-1" style={{ ...fontOutfit, color: C.text }}>Required Credentials</h2>
              <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>Select all certifications and licenses needed for this role.</p>

              <MultiPillRow options={CREDENTIAL_OPTIONS} selected={credentials} onToggle={(c) => toggle(credentials, setCredentials, c)} />

              <p className="text-[11px] mt-4" style={{ ...fontDM, color: C.textLight }}>
                {credentials.length === 0 ? 'No credentials selected — this step is optional.' : `${credentials.length} selected`}
              </p>
            </div>
          )}

          {/* ═══ STEP 6: SOFTWARE & BENEFITS ═══ */}
          {step === 6 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ ...fontOutfit, color: C.textLight }}>Step 6</p>
              <h2 className="text-xl font-extrabold mb-1" style={{ ...fontOutfit, color: C.text }}>Software & Benefits</h2>
              <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>What software does your office use and what benefits do you offer?</p>

              <label className="block text-[13px] font-bold mb-2" style={{ ...fontOutfit, color: C.text }}>Software</label>
              <MultiPillRow options={SOFTWARE_OPTIONS} selected={software} onToggle={(s) => toggle(software, setSoftware, s)} color="purple" />

              <label className="block text-[13px] font-bold mb-2 mt-6" style={{ ...fontOutfit, color: C.text }}>Benefits</label>
              <MultiPillRow options={BENEFIT_OPTIONS} selected={benefits} onToggle={(b) => toggle(benefits, setBenefits, b)} />

              <p className="text-[11px] mt-4" style={{ ...fontDM, color: C.textLight }}>
                {software.length} software, {benefits.length} benefits selected
              </p>
            </div>
          )}

          {/* ═══ STEP 7: AI BUILDER ═══ */}
          {step === 7 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ ...fontOutfit, color: C.textLight }}>Step 7</p>
              <h2 className="text-xl font-extrabold mb-1" style={{ ...fontOutfit, color: C.text }}>AI Job Description</h2>
              <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>Pick a writing style and we'll generate a description from your inputs.</p>

              <label className="block text-[13px] font-bold mb-3" style={{ ...fontOutfit, color: C.text }}>Writing Style</label>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {AI_STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStyle(s.id); setEditingAi(false) }}
                    className="px-3 py-3 border-2 rounded-xl text-left transition"
                    style={{
                      ...fontDM,
                      borderColor: selectedStyle === s.id ? C.purple : C.border,
                      background: selectedStyle === s.id ? C.purpleSoft : 'white',
                    }}
                  >
                    <span className="text-[16px]">{s.emoji}</span>
                    <span className="text-[12px] font-bold ml-2" style={{ color: selectedStyle === s.id ? C.purple : C.textMid }}>{s.label}</span>
                  </button>
                ))}
              </div>

              <label className="block text-[13px] font-bold mb-2" style={{ ...fontOutfit, color: C.text }}>Generated Description</label>
              <textarea
                value={aiGenerated}
                onChange={(e) => { setAiGenerated(e.target.value); setEditingAi(true) }}
                rows={6}
                className="w-full border rounded-xl px-4 py-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 resize-none"
                style={{ ...fontDM, borderColor: C.border, color: C.text }}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px]" style={{ ...fontDM, color: C.textLight }}>{aiGenerated.length} characters</p>
                <button
                  onClick={() => { setEditingAi(false); setAiGenerated(buildAi()) }}
                  className="text-[11px] font-bold transition hover:opacity-70"
                  style={{ ...fontDM, color: C.purple }}
                >
                  ↻ Regenerate
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 8: REVIEW ═══ */}
          {step === 8 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ ...fontOutfit, color: C.textLight }}>Step 8</p>
              <h2 className="text-xl font-extrabold mb-1" style={{ ...fontOutfit, color: C.text }}>Review & Post</h2>
              <p className="text-[13px] mb-6" style={{ ...fontDM, color: C.textMid }}>Make sure everything looks good before posting.</p>

              <ReviewCard icon="👤" label="Role" value={role} />
              <ReviewCard icon="🏢" label="Practice Type" value={practiceType || 'Not specified'} />
              <ReviewCard icon="📋" label="Employment" value={employmentType} />
              <ReviewCard icon="📅" label="Schedule" value={days.length ? `${days.join(', ')} · ${startTime} – ${endTime}` : 'Not set'} />
              <ReviewCard icon="📆" label="Start Date" value={startDate ? formatDateDisplay(startDate) : 'ASAP'} />
              <ReviewCard icon="💰" label="Compensation" value={payDisplay()} />
              <ReviewCard icon="⭐" label="Experience" value={experience} />

              <div className="py-3 border-b" style={{ borderColor: C.borderSoft }}>
                <div className="flex items-start gap-3">
                  <span className="text-[16px] mt-0.5">📜</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ ...fontOutfit, color: C.textLight }}>Credentials</p>
                    <TagsList items={credentials} />
                  </div>
                </div>
              </div>

              <div className="py-3 border-b" style={{ borderColor: C.borderSoft }}>
                <div className="flex items-start gap-3">
                  <span className="text-[16px] mt-0.5">💻</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ ...fontOutfit, color: C.textLight }}>Software</p>
                    <TagsList items={software} color="purple" />
                  </div>
                </div>
              </div>

              <div className="py-3 border-b" style={{ borderColor: C.borderSoft }}>
                <div className="flex items-start gap-3">
                  <span className="text-[16px] mt-0.5">🎁</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ ...fontOutfit, color: C.textLight }}>Benefits</p>
                    <TagsList items={benefits} />
                  </div>
                </div>
              </div>

              <div className="py-3">
                <div className="flex items-start gap-3">
                  <span className="text-[16px] mt-0.5">📝</span>
                  <div className="flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ ...fontOutfit, color: C.textLight }}>Description</p>
                    <p className="text-[13px] leading-relaxed" style={{ ...fontDM, color: C.text }}>
                      {aiGenerated || 'No description generated'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t z-40" style={{ borderColor: C.border }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex gap-3">
          {step > 1 && (
            <button
              onClick={back}
              className="flex-1 py-3 rounded-full text-[13px] font-bold border transition hover:opacity-80"
              style={{ ...fontDM, borderColor: C.border, color: C.text }}
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            disabled={!canProceed() || submitting}
            className="flex-1 py-3 rounded-full text-[13px] font-bold text-white transition disabled:opacity-40"
            style={{ ...fontDM, background: step === TOTAL_STEPS ? C.green : C.green }}
          >
            {submitting ? 'Posting...' : step === TOTAL_STEPS ? 'Post Job' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
