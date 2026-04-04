import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const ROLES = ['Dental Hygienist', 'Dental Assistant', 'Front Desk / Admin', 'Treatment Coordinator', 'Sterilization Tech', 'Dentist / Associate']
const SOFTWARE_LIST = ['Eaglesoft', 'Dentrix', 'Open Dental', 'Curve Dental', 'Dexis', 'Carestream']

// Permanent job constants
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time']
const SCHEDULE_OPTIONS = ['Monday to Friday', 'Weekends as needed', 'No weekends', 'Day shift', 'Evening shift', '8 hour shift', '10 hour shift', '4x10 schedule', 'Overtime available', 'Rotating schedule']
const BENEFITS_LIST = ['Health insurance', 'Dental insurance', 'Vision insurance', '401(k)', '401(k) matching', 'Paid time off', 'Continuing education credits', 'Uniform / scrub allowance', 'Employee discount', 'Signing bonus', 'Relocation assistance', 'Malpractice insurance', 'Life insurance', 'Disability insurance', 'Retirement plan', 'Flexible schedule', 'Professional development', 'Tuition reimbursement']
const LICENSES_LIST = ['RDH (Registered Dental Hygienist)', 'CDA (Certified Dental Assistant)', 'DDS / DMD', 'State Dental License', 'CPR / BLS Certification', 'Local Anesthesia Permit', 'Nitrous Oxide Certification', 'X-Ray Certification', 'EFDA Certification', 'DANB Certification']
const PRACTICE_TYPES = ['Private practice (solo)', 'Private practice (group)', 'DSO / Corporate', 'Community health center', 'Pediatric', 'Orthodontic', 'Periodontal', 'Oral surgery', 'Endodontic', 'Multi-specialty']
const PAY_TYPES = ['Hourly', 'Salary', 'Daily rate', 'Production-based']

export default function PostShift() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Shared
  const [role, setRole] = useState('')
  const [shiftType, setShiftType] = useState('TEMP')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})

  // Temp fields
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [lunchBreak, setLunchBreak] = useState('No lunch break')
  const [hourlyRate, setHourlyRate] = useState('')
  const [software, setSoftware] = useState([])

  // Permanent fields
  const [employmentType, setEmploymentType] = useState('Full-time')
  const [scheduleOpts, setScheduleOpts] = useState([])
  const [payType, setPayType] = useState('Hourly')
  const [permRate, setPermRate] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [benefits, setBenefits] = useState([])
  const [experienceYr, setExperienceYr] = useState('')
  const [licenses, setLicenses] = useState([])
  const [education, setEducation] = useState('')
  const [practiceType, setPracticeType] = useState('')
  const [startDate, setStartDate] = useState('')

  const isPerm = shiftType === 'PERMANENT'
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const todayStr = new Date().toISOString().split('T')[0]
  const toggle = (arr, setArr, v) => setArr(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])

  const formatTime = (t) => {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const tempSteps = ['Role & Type', 'Date & Time', 'Rate & Details', 'Review']
  const permSteps = ['Role & Type', 'Schedule & Compensation', 'Qualifications & Benefits', 'Description & Review']
  const stepLabels = isPerm ? permSteps : tempSteps

  // Validation
  const validateStep1 = () => { if (!role) { setErrors({ role: 'Select a role' }); return false } setErrors({}); return true }
  const validateTempStep2 = () => {
    const e = {}
    if (!date) e.date = 'Select a date'; else if (date < todayStr) e.date = 'Past date'
    if (!startTime) e.startTime = 'Required'; if (!endTime) e.endTime = 'Required'
    if (startTime && endTime && endTime <= startTime) e.endTime = 'Must be after start'
    setErrors(e); return Object.keys(e).length === 0
  }
  const validateTempStep3 = () => { if (!hourlyRate || parseFloat(hourlyRate) <= 0) { setErrors({ hourlyRate: 'Enter rate' }); return false } setErrors({}); return true }
  const validatePermStep2 = () => {
    const e = {}
    if (payType === 'Salary' && !salaryMin) e.pay = 'Enter a salary'
    else if (payType !== 'Salary' && !permRate) e.pay = 'Enter a rate'
    setErrors(e); return Object.keys(e).length === 0
  }
  const validatePermStep3 = () => { setErrors({}); return true }

  const canStep1 = role !== ''
  const canTempStep2 = date && date >= todayStr && startTime && endTime && endTime > startTime
  const canTempStep3 = hourlyRate && parseFloat(hourlyRate) > 0
  const canPermStep2 = payType === 'Salary' ? !!salaryMin : !!permRate

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && !isPerm && validateTempStep2()) setStep(3)
    else if (step === 2 && isPerm && validatePermStep2()) setStep(3)
    else if (step === 3 && !isPerm && validateTempStep3()) setStep(4)
    else if (step === 3 && isPerm && validatePermStep3()) setStep(4)
  }

  const canProceed = step === 1 ? canStep1 : step === 2 ? (isPerm ? canPermStep2 : canTempStep2) : true

  const handlePost = async () => {
    setSubmitting(true)
    try {
      const token = await getToken()
      const body = isPerm ? {
        role, jobType: 'PERMANENT',
        date: new Date((startDate || todayStr) + 'T00:00:00').toISOString(),
        startTime: '8:00 AM', endTime: '5:00 PM',
        hourlyRate: payType !== 'Salary' ? parseFloat(permRate || '0') : 0,
        description: description || null,
        software: [],
        schedule: `${employmentType} · ${scheduleOpts.join(', ') || 'Standard'}`,
        benefits,
        experienceYr: experienceYr ? parseInt(experienceYr) : null,
        salaryMin: salaryMin ? parseFloat(salaryMin) : null,
        salaryMax: salaryMax ? parseFloat(salaryMax) : null,
      } : {
        role, jobType: 'TEMPORARY',
        date: new Date(date + 'T00:00:00').toISOString(),
        startTime: formatTime(startTime), endTime: formatTime(endTime),
        hourlyRate: parseFloat(hourlyRate),
        description: description || null, software,
      }
      const res = await fetch(`${API_URL}/api/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed to post') }
      setDone(true)
    } catch (err) { showToast(err.message) }
    finally { setSubmitting(false) }
  }

  const resetForm = () => {
    setStep(1); setDone(false); setRole(''); setShiftType('TEMP'); setDate(''); setStartTime(''); setEndTime('')
    setLunchBreak('No lunch break'); setHourlyRate(''); setSoftware([]); setDescription('')
    setEmploymentType('Full-time'); setScheduleOpts([]); setPayType('Hourly'); setPermRate('')
    setSalaryMin(''); setSalaryMax(''); setBenefits([]); setExperienceYr(''); setLicenses([])
    setEducation(''); setPracticeType(''); setStartDate('')
  }

  // Compensation display helper
  const compDisplay = () => {
    if (payType === 'Salary') return salaryMin && salaryMax ? `$${Number(salaryMin).toLocaleString()} – $${Number(salaryMax).toLocaleString()}/yr` : salaryMin ? `From $${Number(salaryMin).toLocaleString()}/yr` : '—'
    return permRate ? `$${permRate}/${payType === 'Daily rate' ? 'day' : 'hr'}${payType === 'Production-based' ? ' + production' : ''}` : '—'
  }

  if (done) return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <Nav />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">{isPerm ? '💼' : '🎉'}</div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">{isPerm ? 'Job posted!' : 'Shift posted!'}</h1>
          <p className="text-sm text-[#6b7280] mb-8">{isPerm ? 'Your position is live. Qualified professionals will be notified.' : 'Your shift is live. Professionals will be notified right away.'}</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">Go to dashboard</button>
            <button onClick={resetForm} className="w-full bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">Post another</button>
          </div>
        </div>
      </div>
    </div>
  )

  const Pill = ({ selected, onClick, children, color = 'green' }) => {
    const c = color === 'purple'
      ? { border: 'border-[#5b21b6]', text: 'text-[#5b21b6]', bg: 'bg-[#f5f3ff]', hover: 'hover:border-[#5b21b6]' }
      : { border: 'border-[#1a7f5e]', text: 'text-[#1a7f5e]', bg: 'bg-[#f0faf5]', hover: 'hover:border-[#1a7f5e]' }
    return (
      <button onClick={onClick} className={`px-3 py-1.5 border rounded-full text-xs font-semibold transition ${selected ? `${c.border} ${c.text} ${c.bg}` : `border-[#e5e7eb] text-[#6b7280] ${c.hover}`}`}>
        {selected ? '✓ ' : ''}{children}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#dc2626] flex items-center justify-center flex-shrink-0">✕</div>
          {toast}
        </div>
      )}

      {/* Progress */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="flex gap-1.5 mb-2">
          {[1,2,3,4].map(n => (
            <div key={n} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${n <= step ? (isPerm ? 'bg-[#5b21b6]' : 'bg-[#1a7f5e]') : 'bg-[#e5e7eb]'}`} />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#9ca3af]">Step {step} of 4</span>
          <span className={`text-[12px] font-bold ${isPerm ? 'text-[#5b21b6]' : 'text-[#1a7f5e]'}`}>{stepLabels[step - 1]}</span>
        </div>
      </div>

      <div className="flex items-start justify-center px-4 pb-20">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-lg">

          {/* ═══ STEP 1: Role & Type ═══ */}
          {step === 1 && (<div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 1</p>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Role & type</h1>
            <p className="text-sm text-[#6b7280] mb-6">What position do you need filled?</p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Role needed</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <button key={r} onClick={() => setRole(r)} className={`px-4 py-3 border-2 rounded-xl text-sm font-semibold transition text-left ${role === r ? 'border-[#1a7f5e] text-[#1a7f5e] bg-[#f0faf5]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}>{r}</button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Job type</label>
              <div className="flex border-2 border-[#e5e7eb] rounded-xl overflow-hidden">
                <button onClick={() => setShiftType('TEMP')} className={`flex-1 py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${!isPerm ? 'bg-[#1a7f5e] text-white' : 'text-[#6b7280] hover:bg-[#f9f8f6]'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Temp shift
                </button>
                <button onClick={() => setShiftType('PERMANENT')} className={`flex-1 py-3 text-sm font-bold transition flex items-center justify-center gap-2 ${isPerm ? 'bg-[#5b21b6] text-white' : 'text-[#6b7280] hover:bg-[#f9f8f6]'}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>Permanent job
                </button>
              </div>
            </div>
            {errors.role && <p className="text-xs text-[#dc2626] font-medium mb-3">{errors.role}</p>}
            <button onClick={handleNext} disabled={!canStep1} className={`w-full font-bold py-3 rounded-full text-sm transition ${canStep1 ? (isPerm ? 'bg-[#5b21b6] hover:bg-[#4c1d95] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white') : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}>Continue →</button>
          </div>)}

          {/* ═══ STEP 2 TEMP: Date & Time ═══ */}
          {step === 2 && !isPerm && (<div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 2</p>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Date & time</h1>
            <p className="text-sm text-[#6b7280] mb-6">When do you need coverage?</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Date</label>
              <input type="date" value={date} min={todayStr} onChange={e => setDate(e.target.value)} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.date ? 'border-[#dc2626]' : 'border-[#e5e7eb] focus:border-[#1a7f5e]'}`} />
              {errors.date && <p className="text-xs text-[#dc2626] mt-1">{errors.date}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Start time</label><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e]" /></div>
              <div><label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">End time</label><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e]" /></div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Lunch break</label>
              <select value={lunchBreak} onChange={e => setLunchBreak(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] bg-white">
                <option>No lunch break</option><option>30 minutes (paid)</option><option>30 minutes (unpaid)</option><option>60 minutes (paid)</option><option>60 minutes (unpaid)</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">← Back</button>
              <button onClick={handleNext} disabled={!canTempStep2} className={`flex-1 font-bold py-3 rounded-full text-sm transition ${canTempStep2 ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}>Continue →</button>
            </div>
          </div>)}

          {/* ═══ STEP 2 PERMANENT: Schedule & Compensation ═══ */}
          {step === 2 && isPerm && (<div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5b21b6] mb-2">Step 2 · Permanent</p>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Schedule & compensation</h1>
            <p className="text-sm text-[#6b7280] mb-6">Define the work arrangement and pay</p>

            {/* Employment type */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Employment type</label>
              <div className="flex gap-3">
                {EMPLOYMENT_TYPES.map(t => (
                  <button key={t} onClick={() => setEmploymentType(t)} className={`flex-1 py-2.5 border-2 rounded-xl text-sm font-semibold transition ${employmentType === t ? 'border-[#5b21b6] text-[#5b21b6] bg-[#f5f3ff]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#5b21b6]'}`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Schedule</label>
              <div className="flex flex-wrap gap-2">
                {SCHEDULE_OPTIONS.map(s => <Pill key={s} selected={scheduleOpts.includes(s)} onClick={() => toggle(scheduleOpts, setScheduleOpts, s)} color="purple">{s}</Pill>)}
              </div>
            </div>

            {/* Pay type */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Pay type</label>
              <div className="grid grid-cols-2 gap-2">
                {PAY_TYPES.map(t => (
                  <button key={t} onClick={() => setPayType(t)} className={`py-2 border-2 rounded-xl text-xs font-semibold transition ${payType === t ? 'border-[#5b21b6] text-[#5b21b6] bg-[#f5f3ff]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#5b21b6]'}`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Compensation inputs */}
            {payType === 'Salary' ? (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Annual salary range</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">$</span><input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="80,000" className="w-full border border-[#e5e7eb] rounded-xl pl-7 py-3 text-sm outline-none focus:border-[#5b21b6]" /></div>
                  <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280] text-sm">$</span><input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="120,000" className="w-full border border-[#e5e7eb] rounded-xl pl-7 py-3 text-sm outline-none focus:border-[#5b21b6]" /></div>
                </div>
              </div>
            ) : (
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">{payType === 'Daily rate' ? 'Daily rate' : 'Hourly rate'}{payType === 'Production-based' ? ' (base)' : ''}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-semibold">$</span>
                  <input type="number" value={permRate} onChange={e => setPermRate(e.target.value)} placeholder={payType === 'Daily rate' ? '450' : '55'} className="w-full border border-[#e5e7eb] rounded-xl pl-8 pr-16 py-3 text-sm outline-none focus:border-[#5b21b6]" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-sm">/{payType === 'Daily rate' ? 'day' : 'hr'}</span>
                </div>
                {payType === 'Production-based' && <p className="text-xs text-[#5b21b6] mt-1">Base rate + production percentage. Describe details in the job description.</p>}
              </div>
            )}

            {/* Start date */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Ideal start date <span className="text-[#9ca3af] font-normal">(optional)</span></label>
              <input type="date" value={startDate} min={todayStr} onChange={e => setStartDate(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5b21b6]" />
            </div>

            {errors.pay && <p className="text-xs text-[#dc2626] font-medium mb-3">{errors.pay}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#5b21b6] transition">← Back</button>
              <button onClick={handleNext} disabled={!canPermStep2} className={`flex-1 font-bold py-3 rounded-full text-sm transition ${canPermStep2 ? 'bg-[#5b21b6] hover:bg-[#4c1d95] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}>Continue →</button>
            </div>
          </div>)}

          {/* ═══ STEP 3 TEMP: Rate & Details ═══ */}
          {step === 3 && !isPerm && (<div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 3</p>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Rate & details</h1>
            <p className="text-sm text-[#6b7280] mb-6">Set your rate and any requirements</p>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Hourly rate</label>
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-semibold">$</span><input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="52" className="w-full border border-[#e5e7eb] rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-[#1a7f5e]" /></div>
              <p className="text-xs text-[#1a7f5e] mt-1 font-medium">Market rate for {role || 'this role'}: $48 – $65/hr</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Practice software</label>
              <div className="flex flex-wrap gap-2">{SOFTWARE_LIST.map(s => <Pill key={s} selected={software.includes(s)} onClick={() => toggle(software, setSoftware, s)}>{s}</Pill>)}</div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Notes <span className="text-[#9ca3af] font-normal">(optional)</span></label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Any special requirements or info about the shift..." className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] resize-none h-24" />
            </div>
            {errors.hourlyRate && <p className="text-xs text-[#dc2626] font-medium mb-3">{errors.hourlyRate}</p>}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">← Back</button>
              <button onClick={handleNext} disabled={!canTempStep3} className={`flex-1 font-bold py-3 rounded-full text-sm transition ${canTempStep3 ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}>Continue →</button>
            </div>
          </div>)}

          {/* ═══ STEP 3 PERMANENT: Qualifications & Benefits ═══ */}
          {step === 3 && isPerm && (<div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5b21b6] mb-2">Step 3 · Permanent</p>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Qualifications & benefits</h1>
            <p className="text-sm text-[#6b7280] mb-6">What are you looking for? What do you offer?</p>

            {/* Experience */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Minimum experience</label>
              <select value={experienceYr} onChange={e => setExperienceYr(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5b21b6] bg-white">
                <option value="">No minimum</option><option value="1">1+ year</option><option value="2">2+ years</option><option value="3">3+ years</option><option value="5">5+ years</option><option value="10">10+ years</option>
              </select>
            </div>

            {/* Education */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Education requirement</label>
              <select value={education} onChange={e => setEducation(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5b21b6] bg-white">
                <option value="">Not specified</option><option>High school diploma</option><option>Associate degree</option><option>Bachelor's degree</option><option>Dental hygiene program</option><option>Dental assisting program</option><option>DDS / DMD</option>
              </select>
            </div>

            {/* Licenses & Certs */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Required licenses & certifications</label>
              <div className="flex flex-wrap gap-2">{LICENSES_LIST.map(l => <Pill key={l} selected={licenses.includes(l)} onClick={() => toggle(licenses, setLicenses, l)} color="purple">{l}</Pill>)}</div>
            </div>

            {/* Practice type */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Practice type</label>
              <select value={practiceType} onChange={e => setPracticeType(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5b21b6] bg-white">
                <option value="">Not specified</option>{PRACTICE_TYPES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Benefits */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Benefits offered</label>
              <div className="flex flex-wrap gap-2">{BENEFITS_LIST.map(b => <Pill key={b} selected={benefits.includes(b)} onClick={() => toggle(benefits, setBenefits, b)} color="purple">{b}</Pill>)}</div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#5b21b6] transition">← Back</button>
              <button onClick={handleNext} className="flex-1 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-bold py-3 rounded-full text-sm transition">Continue →</button>
            </div>
          </div>)}

          {/* ═══ STEP 4 TEMP: Review ═══ */}
          {step === 4 && !isPerm && (<div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 4</p>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Review & post</h1>
            <p className="text-sm text-[#6b7280] mb-6">Double check everything</p>
            <div className="bg-[#f9f8f6] rounded-2xl p-5 mb-6 flex flex-col gap-4">
              {[
                ['Role', role, 1], ['Date & Time', `${date ? new Date(date+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}) : '—'} · ${formatTime(startTime)} – ${formatTime(endTime)}`, 2],
                ['Lunch', lunchBreak, 2], ['Rate', hourlyRate ? `$${hourlyRate}/hr` : '—', 3], ['Software', software.join(', ') || 'None', 3],
              ].map(([label, value, editStep], i, arr) => (
                <div key={label}><div className="flex items-center justify-between"><div><p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">{label}</p><p className="text-sm font-bold text-[#1a1a1a]">{value}</p></div><button onClick={() => setStep(editStep)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button></div>{i < arr.length - 1 && <div className="h-px bg-[#e5e7eb] mt-4" />}</div>
              ))}
            </div>
            {description && <div className="bg-[#f9f8f6] rounded-xl p-4 mb-6"><p className="text-xs text-[#9ca3af] font-semibold uppercase mb-1">Notes</p><p className="text-sm text-[#374151]">{description}</p></div>}
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm transition">← Back</button>
              <button onClick={handlePost} disabled={submitting} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition disabled:opacity-50">{submitting ? 'Posting...' : 'Post shift 🚀'}</button>
            </div>
          </div>)}

          {/* ═══ STEP 4 PERMANENT: Description & Review ═══ */}
          {step === 4 && isPerm && (<div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5b21b6] mb-2">Step 4 · Final</p>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Description & review</h1>
            <p className="text-sm text-[#6b7280] mb-6">Write your job description and review before posting</p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Job description</label>
              <p className="text-xs text-[#9ca3af] mb-2">Include responsibilities, what makes your office great, growth opportunities, and anything candidates should know.</p>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder={"We are seeking an experienced " + (role || 'dental professional') + " to join our growing practice...\n\nResponsibilities:\n• \n• \n\nWhat we offer:\n• \n• \n\nIdeal candidate:\n• "} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#5b21b6] resize-none h-44" style={{ fontFamily: 'inherit' }} />
            </div>

            {/* Review summary */}
            <div className="bg-[#f5f3ff] border border-[#e5e7eb] rounded-2xl p-5 mb-6 flex flex-col gap-3">
              {[
                ['Role', role, 1], ['Type', `${employmentType} · Permanent`, 1],
                ['Schedule', scheduleOpts.length > 0 ? scheduleOpts.join(', ') : 'Standard', 2],
                ['Compensation', compDisplay(), 2],
                ['Experience', experienceYr ? `${experienceYr}+ years` : 'No minimum', 3],
                ['Education', education || 'Not specified', 3],
                ['Licenses', licenses.length > 0 ? licenses.join(', ') : 'None specified', 3],
                ['Practice', practiceType || 'Not specified', 3],
                ['Benefits', benefits.length > 0 ? `${benefits.length} selected` : 'None', 3],
                ['Start date', startDate ? new Date(startDate+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : 'ASAP', 2],
              ].map(([label, value, editStep], i, arr) => (
                <div key={label}><div className="flex items-center justify-between"><div><p className="text-[10px] text-[#7c3aed] font-bold uppercase tracking-widest">{label}</p><p className="text-[13px] font-bold text-[#1a1a1a] mt-0.5">{value}</p></div><button onClick={() => setStep(editStep)} className="text-xs text-[#5b21b6] font-semibold">Edit</button></div>{i < arr.length - 1 && <div className="h-px bg-[#e5e7eb] mt-3" />}</div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm transition">← Back</button>
              <button onClick={handlePost} disabled={submitting} className="flex-1 bg-[#5b21b6] hover:bg-[#4c1d95] text-white font-bold py-3 rounded-full text-sm transition disabled:opacity-50">{submitting ? 'Posting...' : 'Post job 💼'}</button>
            </div>
          </div>)}

        </div>
      </div>
    </div>
  )
}
