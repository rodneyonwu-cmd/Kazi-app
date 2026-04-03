import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function PostShift() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Form state
  const [role, setRole] = useState('')
  const [shiftType, setShiftType] = useState('TEMP')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [lunchBreak, setLunchBreak] = useState('No lunch break')
  const [hourlyRate, setHourlyRate] = useState('')
  const [software, setSoftware] = useState([])
  const [description, setDescription] = useState('')

  const [errors, setErrors] = useState({})
  const stepLabels = ['Role & Type', 'Date & Time', 'Rate & Details', 'Review']

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const toggleSoftware = (s) => {
    setSoftware(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  // Format 24h time input "14:30" to "2:30 PM"
  const formatTime = (t) => {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`
  }

  const todayStr = new Date().toISOString().split('T')[0]

  const validateStep1 = () => {
    const e = {}
    if (!role) e.role = 'Please select a role'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    const e = {}
    if (!date) e.date = 'Please select a date'
    else if (date < todayStr) e.date = 'Date cannot be in the past'
    if (!startTime) e.startTime = 'Please set a start time'
    if (!endTime) e.endTime = 'Please set an end time'
    if (startTime && endTime && endTime <= startTime) e.endTime = 'End time must be after start time'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep3 = () => {
    const e = {}
    if (!hourlyRate || parseFloat(hourlyRate) <= 0) e.hourlyRate = 'Please enter an hourly rate'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const canProceedStep1 = role !== ''
  const canProceedStep2 = date && date >= todayStr && startTime && endTime && endTime > startTime
  const canProceedStep3 = hourlyRate && parseFloat(hourlyRate) > 0

  const handlePost = async () => {
    setSubmitting(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          role,
          jobType: shiftType === 'PERMANENT' ? 'PERMANENT' : 'TEMPORARY',
          date: new Date(date + 'T00:00:00').toISOString(),
          startTime: formatTime(startTime),
          endTime: formatTime(endTime),
          hourlyRate: parseFloat(hourlyRate),
          software,
          description: description || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to post shift')
      }
      setDone(true)
    } catch (err) {
      showToast(err.message || 'Failed to post shift')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setDone(false)
    setRole('')
    setShiftType('TEMP')
    setDate('')
    setStartTime('')
    setEndTime('')
    setLunchBreak('No lunch break')
    setHourlyRate('')
    setSoftware([])
    setDescription('')
  }

  const formatReviewDate = () => {
    if (!date) return 'Not set'
    const d = new Date(date + 'T00:00:00')
    const day = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const start = formatTime(startTime) || '?'
    const end = formatTime(endTime) || '?'
    return `${day} · ${start} – ${end}`
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-10 w-full max-w-md text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">Shift posted!</h1>
            <p className="text-sm text-[#6b7280] mb-8">Your shift is live. Professionals in your area will be notified right away.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate('/dashboard')} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">
                Go to dashboard
              </button>
              <button onClick={resetForm} className="w-full bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">
                Post another shift
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#dc2626] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Segmented progress bar */}
      <div className="max-w-lg mx-auto px-4 pt-6 pb-4">
        <div className="flex gap-1.5 mb-2">
          {[1,2,3,4].map(n => (
            <div
              key={n}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${n <= step ? 'bg-[#1a7f5e]' : 'bg-[#e5e7eb]'}`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold text-[#9ca3af]">Step {step} of 4</span>
          <span className="text-[12px] font-bold text-[#1a7f5e]">{stepLabels[step - 1]}</span>
        </div>
      </div>

      <div className="flex items-start justify-center px-4 pb-20">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-lg">

          {step === 1 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 1 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Role & shift type</h1>
              <p className="text-sm text-[#6b7280] mb-6">What position do you need filled?</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Role needed</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Dental Hygienist', 'Dental Assistant', 'Front Desk / Admin', 'Treatment Coordinator', 'Sterilization Tech', 'Dentist / Associate'].map(r => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-semibold transition text-left ${role === r ? 'border-[#1a7f5e] text-[#1a7f5e] bg-[#f0faf5]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e] hover:text-[#1a7f5e]'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Shift type</label>
                <div className="flex border-2 border-[#e5e7eb] rounded-xl overflow-hidden">
                  <button onClick={() => setShiftType('TEMP')} className={`flex-1 py-3 text-sm font-bold transition ${shiftType === 'TEMP' ? 'bg-[#1a7f5e] text-white' : 'text-[#6b7280] hover:bg-[#f9f8f6]'}`}>Temp shift</button>
                  <button onClick={() => setShiftType('PERMANENT')} className={`flex-1 py-3 text-sm font-bold transition ${shiftType === 'PERMANENT' ? 'bg-[#1a7f5e] text-white' : 'text-[#6b7280] hover:bg-[#f9f8f6]'}`}>Permanent job</button>
                </div>
              </div>
              {errors.role && <p className="text-xs text-[#dc2626] font-medium mb-3">{errors.role}</p>}
              <button
                onClick={() => { if (validateStep1()) setStep(2) }}
                disabled={!canProceedStep1}
                className={`w-full font-bold py-3 rounded-full text-sm transition ${canProceedStep1 ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}
              >
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 2 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Date & time</h1>
              <p className="text-sm text-[#6b7280] mb-6">When do you need coverage?</p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Date</label>
                <input type="date" value={date} min={todayStr} onChange={e => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: undefined })) }} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.date ? 'border-[#dc2626]' : 'border-[#e5e7eb] focus:border-[#1a7f5e]'}`} />
                {errors.date && <p className="text-xs text-[#dc2626] font-medium mt-1">{errors.date}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Start time</label>
                  <input type="time" value={startTime} onChange={e => { setStartTime(e.target.value); setErrors(prev => ({ ...prev, startTime: undefined })) }} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.startTime ? 'border-[#dc2626]' : 'border-[#e5e7eb] focus:border-[#1a7f5e]'}`} />
                  {errors.startTime && <p className="text-xs text-[#dc2626] font-medium mt-1">{errors.startTime}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">End time</label>
                  <input type="time" value={endTime} onChange={e => { setEndTime(e.target.value); setErrors(prev => ({ ...prev, endTime: undefined })) }} className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition ${errors.endTime ? 'border-[#dc2626]' : 'border-[#e5e7eb] focus:border-[#1a7f5e]'}`} />
                  {errors.endTime && <p className="text-xs text-[#dc2626] font-medium mt-1">{errors.endTime}</p>}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Lunch break</label>
                <select value={lunchBreak} onChange={e => setLunchBreak(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition bg-white">
                  <option>No lunch break</option>
                  <option>30 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">← Back</button>
                <button
                  onClick={() => { if (validateStep2()) setStep(3) }}
                  disabled={!canProceedStep2}
                  className={`flex-1 font-bold py-3 rounded-full text-sm transition ${canProceedStep2 ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}
                >Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 3 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Rate & details</h1>
              <p className="text-sm text-[#6b7280] mb-6">Set your rate and any requirements</p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Hourly rate</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-semibold">$</span>
                  <input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} placeholder="52" className="w-full border border-[#e5e7eb] rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
                </div>
                <p className="text-xs text-[#1a7f5e] mt-1 font-medium">Market rate for {role || 'Dental Hygienist'}: $48 – $65/hr</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Practice software</label>
                <div className="flex flex-wrap gap-2">
                  {['Eaglesoft', 'Dentrix', 'Open Dental', 'Curve Dental'].map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSoftware(s)}
                      className={`px-3 py-1.5 border rounded-full text-xs font-semibold transition ${software.includes(s) ? 'border-[#1a7f5e] text-[#1a7f5e] bg-[#f0faf5]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e] hover:text-[#1a7f5e]'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Notes <span className="text-[#9ca3af] font-normal">(optional)</span></label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Any special requirements or info about the shift..." className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition resize-none h-24" />
              </div>
              {errors.hourlyRate && <p className="text-xs text-[#dc2626] font-medium mb-3">{errors.hourlyRate}</p>}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">← Back</button>
                <button
                  onClick={() => { if (validateStep3()) setStep(4) }}
                  disabled={!canProceedStep3}
                  className={`flex-1 font-bold py-3 rounded-full text-sm transition ${canProceedStep3 ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}
                >Continue →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 4 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Review & post</h1>
              <p className="text-sm text-[#6b7280] mb-6">Double check everything before posting</p>
              <div className="bg-[#f9f8f6] rounded-2xl p-5 mb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">Role</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{role || 'Not selected'}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{formatReviewDate()}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">Rate</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{hourlyRate ? `$${hourlyRate}/hr` : 'Not set'}</p>
                  </div>
                  <button onClick={() => setStep(3)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">Shift Type</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">{shiftType === 'TEMP' ? 'Temp shift' : 'Permanent job'}</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">← Back</button>
                <button onClick={handlePost} disabled={submitting} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition disabled:opacity-50">
                  {submitting ? 'Posting...' : 'Post shift 🚀'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
