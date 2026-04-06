import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ProviderNav from '../components/ProviderNav'
import InitialsAvatar from '../components/InitialsAvatar'
import ApplyConfirmModal from '../components/ApplyConfirmModal'
import useUnreadMessageCount from '../hooks/useUnreadMessageCount'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function OfficeLogo({ name, size, radius }) {
  return <InitialsAvatar name={name} size={size} radius={radius} />
}

const BG_COLORS = ['#e8f5f0', '#fef9c3', '#e8f5f0', '#fce7f3', '#fee2e2']
const FG_COLORS = ['#1a7f5e', '#92400e', '#1a7f5e', '#9d174d', '#991b1b']

function transformShift(s, index) {
  const initials = (s.office?.name || '')
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const colorIdx = index % BG_COLORS.length
  const dateObj = s.date ? new Date(s.date) : null
  const dateStr = dateObj
    ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : ''
  const rawDate = dateObj
    ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`
    : ''

  // Parse time that could be "14:30" (24h) or "2:30 PM" (12h) format
  const parseTo24h = (t) => {
    if (!t) return [0, 0]
    // Already 24h format like "14:30"
    if (!t.includes('AM') && !t.includes('PM')) return t.split(':').map(Number)
    // 12h format like "2:30 PM"
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return [0, 0]
    let h = parseInt(match[1]), m = parseInt(match[2])
    if (match[3].toUpperCase() === 'PM' && h < 12) h += 12
    if (match[3].toUpperCase() === 'AM' && h === 12) h = 0
    return [h, m]
  }
  const fmtTime12h = (t) => {
    const [h, m] = parseTo24h(t)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
  }
  const startFmt = s.startTime ? fmtTime12h(s.startTime) : ''
  const endFmt = s.endTime ? fmtTime12h(s.endTime) : ''
  const timeStr = startFmt && endFmt ? `${startFmt} – ${endFmt}` : ''

  // Estimate hours and pay
  const startParts = parseTo24h(s.startTime)
  const endParts = parseTo24h(s.endTime)
  const hours = (endParts[0] + endParts[1] / 60) - (startParts[0] + startParts[1] / 60)
  const estPay = hours > 0 && s.hourlyRate ? `$${Math.round(hours * s.hourlyRate)}` : ''
  const rate = s.hourlyRate ? `$${s.hourlyRate}/hr` : ''

  const tags = []
  if (s.isRapidFill) tags.push({ label: 'Instant Pay', bg: '#fef9c3', color: '#92400e' })
  if (s.software && s.software.length > 0) {
    s.software.forEach(sw => tags.push({ label: sw, bg: '#f3f4f6', color: '#374151' }))
  }

  const isPerm = s.jobType === 'PERMANENT'
  const salaryDisplay = s.salaryMin ? `$${Number(s.salaryMin).toLocaleString()}${s.salaryMax ? ` – $${Number(s.salaryMax).toLocaleString()}` : ''}/yr` : ''

  return {
    id: s.id,
    initials,
    logoUrl: s.office?.logoUrl || null,
    bg: isPerm ? '#e8f5f0' : BG_COLORS[colorIdx],
    color: isPerm ? '#1a7f5e' : FG_COLORS[colorIdx],
    name: s.office?.name || 'Unknown Office',
    type: 'Dental Office',
    distance: s.office?.city ? `${s.office.city}, ${s.office.state}` : '',
    stars: '–',
    reviews: 0,
    date: dateStr,
    rawDate,
    time: timeStr,
    role: s.role || '',
    parking: 'Contact office',
    software: (s.software || []).join(', ') || 'N/A',
    estPay,
    rate,
    applicants: s._count?.applications || 0,
    tags: isPerm ? [(() => { const empType = s.schedule?.split(' · ')[0] || 'Full-time'; const isPart = empType === 'Part-time'; return { label: empType, bg: isPart ? '#fef3c7' : '#e8f5f0', color: isPart ? '#92400e' : '#1a7f5e' } })(), ...tags] : tags,
    perks: [],
    description: s.description || '',
    jobType: s.jobType || 'TEMPORARY',
    isPerm,
    officeId: s.office?.id || s.officeId || null,
    // Permanent-specific fields
    schedule: s.schedule || '',
    benefits: s.benefits || [],
    experienceYr: s.experienceYr,
    salaryDisplay,
  }
}

function ShiftCard({ shift, applied, onApply, onDetails, showToast }) {
  return (
    <div className={`bg-white border border-[#e5e7eb] rounded-[18px] p-4 transition cursor-pointer flex flex-col ${shift.isPerm ? 'hover:border-[#1a7f5e]' : 'hover:border-[#1a7f5e]'}`} onClick={() => onDetails(shift)}>
      <div className="flex items-center gap-3 mb-3">
        <OfficeLogo name={shift.name} size={68} radius={16} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] text-[#1a1a1a] mb-1" style={{ fontWeight: 400 }}>{shift.name}</div>
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[15px] font-bold text-[#F97316]">★ {shift.stars}</span>
            <span className="text-[14px] text-[#9ca3af]">({shift.reviews})</span>
            <span className="text-[14px] font-semibold text-[#6b7280]">· {shift.distance}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0" style={{ maxWidth: shift.isPerm ? 130 : 'none' }}>
          <div className={`font-black ${shift.isPerm ? 'text-[13px] text-[#1a7f5e]' : 'text-[18px] text-[#1a7f5e]'}`}>{shift.isPerm ? (shift.salaryDisplay || shift.rate) : shift.estPay}</div>
          <div className="text-[10px] text-[#9ca3af]">{shift.isPerm ? (shift.rate ? shift.rate : 'salary') : 'est. pay'}</div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {shift.tags.map(t => <span key={t.label} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.bg, color: t.color }}>{t.label}</span>)}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2.5">
        {(shift.isPerm
          ? [{ icon: <UserIcon />, text: shift.role }, { icon: <CalIcon />, text: shift.schedule?.split(' · ')[0] || 'Full-time' }, { icon: <ClockIcon />, text: shift.experienceYr ? `${shift.experienceYr}+ yrs exp` : 'Open' }, { icon: <ParkIcon />, text: shift.distance || '—' }]
          : [{ icon: <CalIcon />, text: shift.date }, { icon: <ClockIcon />, text: shift.time }, { icon: <UserIcon />, text: shift.role }, { icon: <ParkIcon />, text: shift.parking }]
        ).map(({ icon, text }, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#6b7280]">{icon}{text}</div>
        ))}
      </div>
      <div className="flex items-center gap-1 mb-3">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span className="text-[11px] font-bold text-[#1a7f5e]">{shift.applicants} applied</span>
      </div>
      <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
        <button onClick={() => onDetails(shift)} className={`flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2.5 md:py-2 min-h-[40px] md:min-h-0 rounded-full text-[13px] md:text-[12px] transition bg-white cursor-pointer ${shift.isPerm ? 'hover:border-[#1a7f5e]' : 'hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>Details</button>
        <button onClick={() => !applied && onApply(shift)} className={`flex-1 font-bold py-2.5 md:py-2 min-h-[40px] md:min-h-0 rounded-full text-[13px] md:text-[12px] transition border-none cursor-pointer ${applied ? 'bg-[#0f4d38] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`} style={{ fontFamily: 'inherit' }}>{applied ? '✓ Applied' : (shift.isPerm ? 'Apply Now' : 'Apply')}</button>
        <button onClick={(e) => { e.stopPropagation(); showToast('Favorites coming soon') }} className="w-9 h-9 md:w-8 md:h-8 border border-[#e5e7eb] rounded-full flex items-center justify-center hover:border-[#ef4444] transition flex-shrink-0 bg-white cursor-pointer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
    </div>
  )
}

function PermCard({ job, applied, onApply, onDetails }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-4 hover:border-[#1a7f5e] transition cursor-pointer flex flex-col" onClick={() => onDetails(job)}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-[68px] h-[68px] rounded-[16px] flex items-center justify-center text-[16px] font-black flex-shrink-0" style={{ background: job.bg, color: job.color }}>{job.initials}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] text-[#1a1a1a] mb-0.5" style={{ fontWeight: 400 }}>{job.name}</div>
          <div className="text-[12px] font-semibold text-[#1a7f5e] mb-1">{job.title}</div>
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-bold text-[#F97316]">★ {job.stars}</span>
            <span className="text-[14px] text-[#9ca3af]">({job.reviews})</span>
            <span className="text-[14px] font-semibold text-[#6b7280]">· {job.distance}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[15px] font-black text-[#1a7f5e]">{job.pay}</div>
          <div className="text-[10px] text-[#9ca3af]">/hr</div>
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        {job.tags.map(t => <span key={t.label} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: t.bg, color: t.color }}>{t.label}</span>)}
      </div>
      <div className="flex items-center gap-1 flex-wrap text-[11px] text-[#9ca3af] mb-2.5">
        <span>{job.schedule}</span><span>·</span><span>Posted {job.posted}</span><span>·</span>
        <span className="font-bold text-[#1a7f5e]">{job.applicants} applicants</span>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {job.benefits.map(b => (
          <span key={b} className="flex items-center gap-1 text-[11px] text-[#374151]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>{b}
          </span>
        ))}
      </div>
      <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
        <button onClick={() => onDetails(job)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2 rounded-full text-[12px] hover:border-[#1a7f5e] transition bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>Details</button>
        <button onClick={() => !applied && onApply(job)} className={`flex-1 font-bold py-2 rounded-full text-[12px] transition border-none cursor-pointer ${applied ? 'bg-[#0f4d38] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`} style={{ fontFamily: 'inherit' }}>{applied ? '✓ Applied' : 'Apply Now'}</button>
      </div>
    </div>
  )
}


function PermDetailDrawer({ job, applied, onApply, onClose, onMessage }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose}/>
      <div className="fixed inset-0 md:top-0 md:right-0 md:bottom-0 md:left-auto w-full md:max-w-[480px] bg-white z-[60] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f3f4f6] flex-shrink-0">
          <button onClick={onClose} className="flex items-center gap-1.5 text-[13px] font-bold text-[#6b7280] mb-4 bg-none border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to jobs
          </button>
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[15px] font-black flex-shrink-0" style={{ background: job.bg, color: job.color }}>{job.initials}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[19px] font-black text-[#1a1a1a] leading-tight mb-0.5">{job.title}</p>
              <p className="text-[14px] font-semibold text-[#1a7f5e] mb-1">{job.name}</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[12px] font-bold text-[#F97316]">★ {job.stars}</span>
                <span className="text-[12px] text-[#9ca3af]">({job.reviews} reviews)</span>
                <span className="text-[12px] text-[#6b7280]">· {job.distance}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Pay + type banner */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1 bg-[#e8f5f0] rounded-[14px] px-4 py-3">
              <p className="text-[10px] font-bold text-[#6b9e8a] uppercase tracking-wider mb-0.5">Compensation</p>
              <p className="text-[20px] font-black text-[#0f4d38]">{job.pay}<span className="text-[12px] font-medium text-[#6b9e8a]">/hr</span></p>
            </div>
            <div className="flex-1 bg-[#f9f8f6] border border-[#e5e7eb] rounded-[14px] px-4 py-3">
              <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-0.5">Job type</p>
              <p className="text-[14px] font-black text-[#1a1a1a]">{job.type}</p>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { label: 'Schedule', val: job.schedule.split('·')[0].trim() },
              { label: 'Applicants', val: `${job.applicants} applied`, purple: true },
              { label: 'Posted', val: job.posted },
            ].map(s => (
              <div key={s.label} className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-[10px] px-3 py-2.5 text-center">
                <p className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-[11px] font-bold ${s.purple ? 'text-[#1a7f5e]' : 'text-[#1a1a1a]'}`}>{s.val}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap mb-5">
            {job.tags.map(t => <span key={t.label} className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: t.bg, color: t.color }}>{t.label}</span>)}
          </div>

          {/* About the role */}
          <div className="mb-5">
            <p className="text-[14px] font-extrabold text-[#1a1a1a] mb-2">About the role</p>
            <p className="text-[13px] text-[#374151] leading-relaxed">
              {job.name} is seeking a motivated and experienced {job.title} to join our team on a {job.type.toLowerCase()} basis. You will work closely with our dental team to provide exceptional patient care, perform thorough hygiene treatments, and contribute to a positive office culture.
            </p>
          </div>

          {/* Responsibilities */}
          <div className="mb-5">
            <p className="text-[14px] font-extrabold text-[#1a1a1a] mb-2">Responsibilities</p>
            <div className="flex flex-col gap-2">
              {[
                'Perform comprehensive oral hygiene assessments and treatments',
                'Document patient records accurately in practice software',
                'Educate patients on proper oral hygiene techniques',
                'Take and review dental X-rays as needed',
                'Collaborate with dentists on patient treatment plans',
                'Maintain a clean, sterile, and organized operatory',
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-[#e8f5f0] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#1a7f5e" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </div>
                  <p className="text-[13px] text-[#374151] leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="mb-5">
            <p className="text-[14px] font-extrabold text-[#1a1a1a] mb-2">Requirements</p>
            <div className="flex flex-col gap-2">
              {[
                'Active Texas Dental Hygiene License (required)',
                'CPR/BLS certification (required)',
                `Experience with ${job.tags.find(t => ['Eaglesoft','Dentrix','Open Dental','Curve Dental'].includes(t.label))?.label || 'dental software'} preferred`,
                '2+ years of clinical hygiene experience preferred',
                'Strong interpersonal and communication skills',
                'Ability to work independently and as part of a team',
              ].map((r, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9ca3af] flex-shrink-0 mt-1.5"/>
                  <p className="text-[13px] text-[#374151] leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-5">
            <p className="text-[14px] font-extrabold text-[#1a1a1a] mb-2">Benefits & perks</p>
            <div className="grid grid-cols-2 gap-2">
              {job.benefits.map(b => (
                <div key={b} className="flex items-center gap-2 bg-[#f9f8f6] rounded-[10px] px-3 py-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="#1a7f5e" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  </div>
                  <span className="text-[12px] font-semibold text-[#374151]">{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-5">
            <p className="text-[14px] font-extrabold text-[#1a1a1a] mb-2">Schedule</p>
            <div className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-[12px] px-4 py-3 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <p className="text-[13px] text-[#374151] font-semibold">{job.schedule}</p>
            </div>
          </div>

          {/* About the office */}
          <div className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-[14px] p-4">
            <p className="text-[13px] font-extrabold text-[#1a1a1a] mb-1">About {job.name}</p>
            <p className="text-[12px] text-[#6b7280] leading-relaxed">
              A highly rated dental practice in the Houston area with a reputation for exceptional patient care and a supportive team environment. Consistently receives top reviews from both patients and staff.
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[12px] font-bold text-[#F97316]">★ {job.stars}</span>
              <span className="text-[12px] text-[#9ca3af]">{job.reviews} reviews</span>
              <span className="text-[12px] text-[#9ca3af]">· {job.distance} away</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-4 md:px-5 py-3 md:py-4 border-t border-[#f3f4f6] flex gap-2 flex-shrink-0 bg-white">
          <button onClick={() => onMessage && onMessage({ officeName: job.name, officeId: job.officeId })} className="flex items-center justify-center gap-2 border border-[#e5e7eb] text-[#374151] font-bold px-4 md:px-5 py-3 min-h-[44px] rounded-full text-[13px] md:text-[14px] flex-shrink-0 hover:border-[#1a7f5e] transition bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Message
          </button>
          <button onClick={() => { if (!applied.includes(job.id)) onApply(job) }} className={`flex-1 font-bold py-3 min-h-[44px] rounded-full text-[14px] transition border-none cursor-pointer ${applied.includes(job.id) ? 'bg-[#0f4d38] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`} style={{ fontFamily: 'inherit' }}>
            {applied.includes(job.id) ? '✓ Applied' : 'Apply Now'}
          </button>
        </div>
      </div>
    </>
  )
}

function ShiftCalendar({ shifts, calMonth, calYear, setCalMonth, setCalYear, calSelectedDate, setCalSelectedDate, applied, onApply, onDetails, showToast }) {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Build shift counts by date
  const shiftsByDate = {}
  shifts.forEach(s => {
    if (s.rawDate) {
      if (!shiftsByDate[s.rawDate]) shiftsByDate[s.rawDate] = []
      shiftsByDate[s.rawDate].push(s)
    }
  })

  // Calendar grid
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const monthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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

  const selectedShifts = calSelectedDate ? (shiftsByDate[calSelectedDate] || []) : []
  const selectedDateLabel = calSelectedDate ? new Date(calSelectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''

  // Count total shifts this month
  const monthShiftCount = Object.entries(shiftsByDate).reduce((sum, [date, arr]) => {
    const d = new Date(date + 'T12:00:00')
    if (d.getMonth() === calMonth && d.getFullYear() === calYear) return sum + arr.length
    return sum
  }, 0)

  return (
    <div>
      {/* Calendar card */}
      <div className="bg-white border border-[#e5e7eb] rounded-[20px] overflow-hidden mb-4">
        {/* Header */}
        <div className="px-4 md:px-5 py-4 flex items-center justify-between border-b border-[#f3f4f6]">
          <div>
            <h2 className="text-[17px] font-black text-[#1a1a1a]">{monthName}</h2>
            <p className="text-[12px] text-[#9ca3af] mt-0.5">{monthShiftCount} shift{monthShiftCount !== 1 ? 's' : ''} available</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={goToday} className="text-[11px] font-bold text-[#1a7f5e] bg-[#e8f5f0] hover:bg-[#d5ede5] px-3 py-1.5 rounded-full transition border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Today</button>
            <button onClick={prevMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f3f4f6] transition border-none cursor-pointer bg-transparent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button onClick={nextMonth} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f3f4f6] transition border-none cursor-pointer bg-transparent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#f3f4f6]">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center py-2.5 text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Date grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} className="aspect-square border-b border-r border-[#f8f7f5]" />
            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const count = shiftsByDate[dateStr]?.length || 0
            const isToday = dateStr === todayStr
            const isSelected = dateStr === calSelectedDate
            const isPast = dateStr < todayStr

            return (
              <div
                key={dateStr}
                onClick={() => setCalSelectedDate(isSelected ? null : dateStr)}
                className={`aspect-square flex flex-col items-center justify-center gap-0.5 cursor-pointer transition relative border-b border-r border-[#f8f7f5]
                  ${isSelected ? 'bg-[#e8f5f0]' : count > 0 ? 'hover:bg-[#fafffe]' : 'hover:bg-[#f9f8f6]'}
                  ${isPast && !isToday ? 'opacity-40' : ''}`}
              >
                <span className={`text-[13px] md:text-[14px] leading-none ${isToday ? 'w-7 h-7 rounded-full bg-[#1a7f5e] text-white flex items-center justify-center font-bold' : isSelected ? 'font-bold text-[#1a7f5e]' : 'font-medium text-[#374151]'}`}>
                  {day}
                </span>
                {count > 0 && (
                  <span className={`text-[9px] font-extrabold leading-none px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-[#1a7f5e] text-white' : 'bg-[#e8f5f0] text-[#1a7f5e]'}`}>
                    {count}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected date shifts */}
      {calSelectedDate && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] font-black text-[#1a1a1a]">{selectedDateLabel}</h3>
              <p className="text-[12px] text-[#9ca3af]">{selectedShifts.length} shift{selectedShifts.length !== 1 ? 's' : ''} available</p>
            </div>
            <button onClick={() => setCalSelectedDate(null)} className="text-[12px] font-bold text-[#9ca3af] hover:text-[#374151] bg-transparent border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Clear</button>
          </div>
          {selectedShifts.length === 0 ? (
            <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">No shifts on this date</p>
              <p className="text-[12px] text-[#9ca3af]">Try selecting a date with available shifts</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedShifts.map(s => (
                <ShiftCard key={s.id} shift={s} applied={applied.includes(s.id)} onApply={onApply} onDetails={onDetails} showToast={showToast} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No date selected hint */}
      {!calSelectedDate && monthShiftCount > 0 && (
        <div className="bg-white border border-dashed border-[#d1d5db] rounded-[14px] p-5 text-center">
          <p className="text-[13px] text-[#9ca3af]">
            <span className="font-semibold text-[#374151]">Tap a date</span> to see available shifts
          </p>
        </div>
      )}
    </div>
  )
}

export default function FindShifts() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { count: unreadMsgCount } = useUnreadMessageCount()
  const searchParams = new URLSearchParams(window.location.search)
  const [shiftType, setShiftType] = useState('temp')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'calendar'
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [calSelectedDate, setCalSelectedDate] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterDate, setFilterDate] = useState(searchParams.get('date') || '')
  const [filterZip, setFilterZip] = useState(searchParams.get('zip') || '77459')
  const [filterDist, setFilterDist] = useState(searchParams.get('distance') ? `Within ${searchParams.get('distance')} miles` : 'Within 25 miles')
  const [filterMinPay, setFilterMinPay] = useState('')
  const [filterPosted, setFilterPosted] = useState('Last 7 days')
  const [sortBy, setSortBy] = useState('Newest')
  const [applied, setApplied] = useState([])
  const [selectedShift, setSelectedShift] = useState(null)
  const [selectedPerm, setSelectedPerm] = useState(null)
  const [toast, setToast] = useState(null)
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [msgModal, setMsgModal] = useState(null)
  const [myProviderId, setMyProviderId] = useState(null)
  const [msgText, setMsgText] = useState('')
  const [confirmApply, setConfirmApply] = useState(null)

  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }
        // Fetch provider profile first to get role for filtering
        const meRes = await fetch(`${API_URL}/api/providers/me`, { headers }).catch(() => null)
        let providerRole = ''
        if (meRes?.ok) {
          const me = await meRes.json()
          setMyProviderId(me.id)
          providerRole = me.role || ''
        }
        const roleParam = providerRole ? `&role=${encodeURIComponent(providerRole)}` : ''
        const [shiftsRes, appsRes] = await Promise.all([
          fetch(`${API_URL}/api/shifts?status=OPEN${roleParam}`, { headers }),
          fetch(`${API_URL}/api/applications`, { headers }).catch(() => null),
        ])
        if (shiftsRes.ok) {
          const data = await shiftsRes.json()
          setShifts(data.map((s, i) => transformShift(s, i)))
        }
        if (appsRes?.ok) {
          const apps = await appsRes.json()
          setApplied(apps.filter(a => a.status !== 'WITHDRAWN' && a.status !== 'DECLINED').map(a => a.shiftId))
        }
      } catch (err) { console.error('[FindShifts] fetch error:', err) }
      setLoading(false)
    }
    fetchShifts()
  }, [getToken])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const requestApply = (shift) => setConfirmApply(shift)
  const handleApply = async (id) => {
    setApplied(prev => [...prev, id])
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ shiftId: id }),
      })
      if (res.ok) {
        showToast('Application submitted!')
      } else {
        const err = await res.json().catch(() => ({}))
        setApplied(prev => prev.filter(x => x !== id))
        showToast(err.error || 'Failed to apply')
      }
    } catch {
      setApplied(prev => prev.filter(x => x !== id))
      showToast('Failed to apply')
    }
  }

  const filteredShifts = shifts.filter(s => {
    if (shiftType === 'temp' && s.jobType === 'PERMANENT') return false
    if (shiftType === 'perm' && s.jobType !== 'PERMANENT') return false
    if (filterDate && s.rawDate && s.rawDate !== filterDate) return false
    if (filterMinPay) {
      const payNum = parseFloat((s.rate || '').replace(/[^0-9.]/g, ''))
      if (!payNum || payNum < parseFloat(filterMinPay)) return false
    }
    return true
  })

  const FilterFields = ({ mobile }) => (
    <>
      <div className={mobile ? 'grid grid-cols-2 gap-2.5 mb-3' : ''}>
        <div className={mobile ? '' : 'mb-4'}>
          <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Date</p>
          <div className="flex items-center gap-2 bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5 focus-within:border-[#1a7f5e] transition">
            <CalIcon /><input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-transparent border-none outline-none text-[13px] text-[#1a1a1a] w-full" style={{ fontFamily: 'inherit' }}/>
          </div>
        </div>
        <div className={mobile ? '' : 'mb-4'}>
          <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">ZIP Code</p>
          <div className="flex items-center gap-2 bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5 focus-within:border-[#1a7f5e] transition">
            <PinIcon /><input type="text" value={filterZip} onChange={e => setFilterZip(e.target.value)} maxLength={5} placeholder="77459" className="bg-transparent border-none outline-none text-[13px] text-[#1a1a1a] w-full" style={{ fontFamily: 'inherit' }}/>
          </div>
        </div>
        <div className={mobile ? '' : 'mb-4'}>
          <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Distance</p>
          <div className="relative">
            <select value={filterDist} onChange={e => setFilterDist(e.target.value)} className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5 text-[13px] text-[#374151] outline-none cursor-pointer appearance-none focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}>
              {['Within 10 miles','Within 25 miles','Within 40 miles','Within 60 miles'].map(o => <option key={o}>{o}</option>)}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div className={mobile ? '' : 'mb-4'}>
          <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Min Hourly Pay</p>
          <div className="flex items-center gap-2 bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5">
            <span className="text-[#9ca3af] text-[13px]">$</span>
            <input type="number" value={filterMinPay} onChange={e => setFilterMinPay(e.target.value)} placeholder="e.g. 50" className="bg-transparent border-none outline-none text-[13px] text-[#1a1a1a] w-full" style={{ fontFamily: 'inherit' }}/>
          </div>
        </div>
      </div>
      <div className={mobile ? 'mb-3' : 'mb-5'}>
        <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Posted Within</p>
        <div className="relative">
          <select value={filterPosted} onChange={e => setFilterPosted(e.target.value)} className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5 text-[13px] text-[#374151] outline-none cursor-pointer appearance-none focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}>
            {['Any time','Last 24 hours','Last 7 days','Last 30 days'].map(o => <option key={o}>{o}</option>)}
          </select>
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <button onClick={() => { setFilterOpen(false); showToast('Filters applied!') }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 md:py-2.5 min-h-[44px] md:min-h-0 rounded-full text-[14px] md:text-[13px] transition border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Apply filters</button>
      {!mobile && <button onClick={() => { setFilterDate(''); setFilterZip('77459'); setFilterDist('Within 25 miles'); setFilterMinPay(''); setFilterPosted('Last 7 days') }} className="w-full text-[#9ca3af] hover:text-[#374151] text-[13px] font-semibold mt-2 bg-none border-none cursor-pointer text-center block" style={{ fontFamily: 'inherit' }}>Clear all</button>}
    </>
  )

  const DetailDrawer = ({ item, isPerm, onClose }) => (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose}/>
      <div className="fixed inset-0 md:top-0 md:right-0 md:bottom-0 md:left-auto w-full md:max-w-[440px] bg-white z-[60] flex flex-col shadow-2xl">
        <div className="px-5 py-4 border-b border-[#f3f4f6] flex-shrink-0">
          <button onClick={onClose} className="flex items-center gap-1.5 text-[13px] font-bold text-[#6b7280] mb-4 bg-none border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            {isPerm ? 'Back to jobs' : 'Back to shifts'}
          </button>
          <div className="flex items-start gap-3">
            <OfficeLogo name={item.name} size={56} radius={14} />
            <div className="flex-1">
              <p className="text-[20px] font-black text-[#1a1a1a]">{isPerm ? item.name : item.name}</p>
              {isPerm && <p className="text-[13px] font-semibold text-[#1a7f5e] mb-1">{item.title}</p>}
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold text-[#F97316]">★ {item.stars}</span>
                <span className="text-[13px] text-[#9ca3af]">({item.reviews})</span>
                <span className="text-[13px] text-[#6b7280]">· {item.distance}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Compensation banner */}
          <div className={`rounded-[14px] px-4 py-3 mb-5 ${item.isPerm ? 'bg-[#e8f5f0]' : 'bg-[#e8f5f0]'}`}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${item.isPerm ? 'text-[#1a7f5e]' : 'text-[#6b9e8a]'}`}>{item.isPerm ? 'Compensation' : 'Estimated pay'}</p>
            <p className={`font-black ${item.isPerm ? 'text-[17px] text-[#1a7f5e]' : 'text-[22px] text-[#0f4d38]'}`}>
              {item.isPerm ? (item.salaryDisplay || item.rate || '—') : item.estPay}
            </p>
            {item.isPerm && item.rate && item.salaryDisplay && <p className="text-[12px] text-[#1a7f5e] mt-0.5">{item.rate}</p>}
          </div>

          {item.isPerm ? (
            <>
              {/* Permanent job details */}
              <p className="text-[16px] font-semibold text-[#374151] mb-3">Job details</p>
              <div className="bg-[#f9f8f6] rounded-[14px] overflow-hidden mb-5">
                {[
                  ['Role', item.role],
                  ['Employment', item.schedule?.split(' · ')[0] || 'Full-time'],
                  ['Schedule', item.schedule?.split(' · ').slice(1).join(', ') || 'Standard'],
                  ['Experience', item.experienceYr ? `${item.experienceYr}+ years` : 'No minimum'],
                  ['Applicants', `${item.applicants} applied`],
                  ['Location', item.distance || '—'],
                ].map(([label, value], i, arr) => (
                  <div key={label} className={`flex justify-between gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f0efed]' : ''}`}>
                    <span className="text-[13px] text-[#9ca3af] flex-shrink-0">{label}</span>
                    <span className={`text-[13px] font-medium text-right ${label === 'Applicants' ? 'text-[#1a7f5e]' : 'text-[#1a1a1a]'}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Benefits */}
              {item.benefits.length > 0 && (
                <div className="mb-5">
                  <p className="text-[15px] font-semibold text-[#374151] mb-3">Benefits</p>
                  <div className="flex flex-wrap gap-2">
                    {item.benefits.map(b => (
                      <span key={b} className="flex items-center gap-1.5 bg-[#f0faf5] border border-[#e5e7eb] rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#374151]">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>{b}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {item.description && (
                <div className="mb-5">
                  <p className="text-[15px] font-semibold text-[#374151] mb-2">About this position</p>
                  <div className="bg-[#f9f8f6] rounded-[14px] p-4 text-[13px] text-[#374151] leading-relaxed whitespace-pre-line">{item.description}</div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Temp shift details */}
              <p className="text-[16px] font-semibold text-[#374151] mb-3">Shift details</p>
              <div className="bg-[#f9f8f6] rounded-[14px] overflow-hidden mb-5">
                {[['Date', item.date], ['Time', item.time], ['Hourly Rate', item.rate], ['Role', item.role], ['Software', item.software], ['Parking', item.parking]].map(([label, value], i, arr) => (
                  <div key={label} className={`flex justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f0efed]' : ''}`}>
                    <span className="text-[14px] text-[#9ca3af]">{label}</span>
                    <span className="text-[14px] font-medium text-[#1a1a1a]">{value}</span>
                  </div>
                ))}
              </div>
              {item.description && (
                <div className="mb-5">
                  <p className="text-[15px] font-semibold text-[#374151] mb-2">Notes</p>
                  <div className="bg-[#f9f8f6] rounded-[14px] p-4 text-[13px] text-[#374151] leading-relaxed">{item.description}</div>
                </div>
              )}
            </>
          )}
        </div>
        <div className="px-4 md:px-5 py-3 md:py-4 border-t border-[#f3f4f6] flex flex-col gap-2 flex-shrink-0 bg-white">
          {item.officeId && (
            <button onClick={() => { onClose(); navigate(`/office-profile/${item.officeId}`) }} className={`w-full flex items-center justify-center gap-2 border border-[#e5e7eb] font-bold py-3 md:py-2.5 min-h-[44px] md:min-h-0 rounded-full text-[13px] transition bg-white cursor-pointer ${item.isPerm ? 'text-[#1a7f5e] hover:border-[#1a7f5e] hover:bg-[#f0faf5]' : 'text-[#1a7f5e] hover:border-[#1a7f5e] hover:bg-[#f0faf5]'}`} style={{ fontFamily: 'inherit' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              View office profile
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={() => setMsgModal({ officeName: item.name, officeId: item.officeId })} className="flex items-center justify-center gap-2 border border-[#e5e7eb] text-[#374151] font-bold px-4 md:px-5 py-3 min-h-[44px] rounded-full text-[13px] md:text-[14px] flex-shrink-0 hover:border-[#1a7f5e] transition bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message
            </button>
            <button onClick={() => { if (!applied.includes(item.id)) requestApply(item) }} className={`flex-1 font-bold py-3 min-h-[44px] rounded-full text-[14px] transition border-none cursor-pointer ${applied.includes(item.id) ? 'bg-[#0f4d38] text-white' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`} style={{ fontFamily: 'inherit' }}>
              {applied.includes(item.id) ? '✓ Applied' : (item.isPerm ? 'Apply Now' : 'Apply')}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">
      <ProviderNav />

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[12px] font-semibold px-4 py-2.5 rounded-full z-[300] flex items-center gap-2 shadow-xl whitespace-nowrap">
          <div className="w-4 h-4 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0"><svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          {toast}
        </div>
      )}

      <ApplyConfirmModal
        shift={confirmApply}
        onCancel={() => setConfirmApply(null)}
        onConfirm={() => { const id = confirmApply.id; setConfirmApply(null); setSelectedShift(null); setSelectedPerm(null); handleApply(id) }}
      />

      {selectedShift && <DetailDrawer item={selectedShift} isPerm={false} onClose={() => setSelectedShift(null)} />}
      {selectedPerm && <PermDetailDrawer job={selectedPerm} applied={applied} onApply={requestApply} onClose={() => setSelectedPerm(null)} onMessage={setMsgModal} />}

      <div className="max-w-[960px] mx-auto px-4 py-4 md:py-6">
        <h1 className="text-[20px] md:text-[22px] font-black text-[#1a1a1a]">Find Shifts</h1>
        <p className="text-[13px] text-[#9ca3af] mt-0.5 mb-4 md:mb-5">Houston, TX</p>

        <div className="flex items-center justify-between mb-5">
          <div className="flex bg-[#f3f4f6] rounded-full p-1 w-fit gap-1">
            <button onClick={() => setShiftType('temp')} className={`px-5 py-2 rounded-full text-[13px] font-bold transition border-none cursor-pointer ${shiftType === 'temp' ? 'bg-[#1a7f5e] text-white' : 'text-[#6b7280] bg-transparent'}`} style={{ fontFamily: 'inherit' }}>Temp shifts</button>
            <button onClick={() => setShiftType('perm')} className={`px-5 py-2 rounded-full text-[13px] font-bold transition border-none cursor-pointer ${shiftType === 'perm' ? 'bg-[#1a7f5e] text-white' : 'text-[#6b7280] bg-transparent'}`} style={{ fontFamily: 'inherit' }}>Permanent</button>
          </div>
          {shiftType === 'temp' && (
            <div className="flex bg-[#f3f4f6] rounded-full p-1 gap-0.5">
              <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded-full flex items-center justify-center transition border-none cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'bg-transparent'}`} title="Grid view">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'grid' ? '#1a7f5e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
              <button onClick={() => setViewMode('calendar')} className={`w-8 h-8 rounded-full flex items-center justify-center transition border-none cursor-pointer ${viewMode === 'calendar' ? 'bg-white shadow-sm' : 'bg-transparent'}`} title="Calendar view">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={viewMode === 'calendar' ? '#1a7f5e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </button>
            </div>
          )}
        </div>

        {/* Mobile filter trigger button */}
        <div className="md:hidden mb-3">
          <button onClick={() => setFilterOpen(true)} className="w-full flex items-center justify-between bg-white border border-[#e5e7eb] rounded-[10px] px-4 min-h-[44px] text-[13px] font-bold text-[#374151] cursor-pointer transition" style={{ fontFamily: 'inherit' }}>
            <div className="flex items-center gap-2"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>Filters</div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Mobile filter bottom sheet */}
        {filterOpen && (
          <div className="md:hidden fixed inset-0 z-[70] flex items-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
            <div className="relative w-full bg-white rounded-t-[20px] shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="w-9 h-1 bg-[#e5e7eb] rounded-full mx-auto mt-3 mb-1" />
              <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between sticky top-0 bg-white">
                <p className="text-[16px] font-black text-[#1a1a1a]">Filters</p>
                <button onClick={() => setFilterOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f3f4f6] cursor-pointer border-none" style={{ fontFamily: 'inherit' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="px-4 py-4">
                <FilterFields mobile={true} />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-5 items-start">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-[220px] flex-shrink-0 bg-white border border-[#e5e7eb] rounded-[20px] p-5 sticky top-[84px]">
            <p className="text-[15px] font-black text-[#1a1a1a] mb-4">Filters</p>
            <FilterFields mobile={false} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white border border-[#e5e7eb] rounded-[14px] px-3 md:px-4 py-3 flex items-center justify-between gap-2 mb-4">
              <span className="text-[13px] text-[#9ca3af] font-semibold truncate">{shiftType === 'temp' ? `${filteredShifts.length} shift${filteredShifts.length !== 1 ? 's' : ''} near you` : `${filteredShifts.length} position${filteredShifts.length !== 1 ? 's' : ''} near you`}</span>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-transparent border-none text-[13px] text-[#6b7280] outline-none cursor-pointer flex-shrink-0" style={{ fontFamily: 'inherit' }}>
                <option>Sort: Newest</option><option>Sort: Top pay</option><option>Sort: Nearest</option><option>Sort: Highest rated</option>
              </select>
            </div>

            {shiftType === 'temp' && viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-[#e5e7eb] rounded-[18px] p-4 animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-[68px] h-[68px] rounded-[16px] bg-[#f3f4f6]" />
                        <div className="flex-1">
                          <div className="h-4 bg-[#f3f4f6] rounded w-3/4 mb-2" />
                          <div className="h-3 bg-[#f3f4f6] rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-3 bg-[#f3f4f6] rounded w-full mb-2" />
                      <div className="h-3 bg-[#f3f4f6] rounded w-2/3 mb-2" />
                      <div className="h-8 bg-[#f3f4f6] rounded-full w-full mt-3" />
                    </div>
                  ))
                ) : filteredShifts.length === 0 ? (
                  <div className="col-span-full bg-white border border-[#e5e7eb] rounded-[18px] p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <p className="text-[16px] font-bold text-[#1a1a1a] mb-1">No shifts available in your area yet</p>
                    <p className="text-[13px] text-[#9ca3af] max-w-[280px] mx-auto">We're growing! Check back soon as offices join Kazi and post shifts near you.</p>
                  </div>
                ) : (
                  filteredShifts.map(s => <ShiftCard key={s.id} shift={s} applied={applied.includes(s.id)} onApply={requestApply} onDetails={setSelectedShift} showToast={showToast} />)
                )}
              </div>
            )}
            {shiftType === 'temp' && viewMode === 'calendar' && (
              loading ? (
                <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-8 animate-pulse mb-5">
                  <div className="h-6 bg-[#f3f4f6] rounded w-1/3 mb-4" />
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-[#f3f4f6] rounded-lg" />
                    ))}
                  </div>
                </div>
              ) : (
                <ShiftCalendar
                  shifts={filteredShifts}
                  calMonth={calMonth}
                  calYear={calYear}
                  setCalMonth={setCalMonth}
                  setCalYear={setCalYear}
                  calSelectedDate={calSelectedDate}
                  setCalSelectedDate={setCalSelectedDate}
                  applied={applied}
                  onApply={requestApply}
                  onDetails={setSelectedShift}
                  showToast={showToast}
                />
              )
            )}
            {shiftType === 'perm' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white border border-[#e5e7eb] rounded-[18px] p-4 animate-pulse">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-[68px] h-[68px] rounded-[16px] bg-[#f3f4f6]" />
                        <div className="flex-1">
                          <div className="h-4 bg-[#f3f4f6] rounded w-3/4 mb-2" />
                          <div className="h-3 bg-[#f3f4f6] rounded w-1/2" />
                        </div>
                      </div>
                      <div className="h-3 bg-[#f3f4f6] rounded w-full mb-2" />
                      <div className="h-8 bg-[#f3f4f6] rounded-full w-full mt-3" />
                    </div>
                  ))
                ) : filteredShifts.length === 0 ? (
                  <div className="col-span-full bg-white border border-[#e5e7eb] rounded-[18px] p-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <p className="text-[16px] font-bold text-[#1a1a1a] mb-1">No permanent positions available yet</p>
                    <p className="text-[13px] text-[#9ca3af] max-w-[280px] mx-auto">We're growing! Check back soon as offices join Kazi and post positions near you.</p>
                  </div>
                ) : (
                  filteredShifts.map(s => <ShiftCard key={s.id} shift={s} applied={applied.includes(s.id)} onApply={requestApply} onDetails={setSelectedShift} showToast={showToast} />)
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] z-50">
        <div className="flex">
          {[
            { label: 'Home', path: '/provider-dashboard', icon: <HomeIcon /> },
            { label: 'Requests', path: '/provider-requests', icon: <ReqIcon /> },
            { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon />, active: true },
            { label: 'Messages', path: '/provider-messages', icon: <MsgIcon />, badge: unreadMsgCount },
            { label: 'Finance', path: '/provider-earnings', icon: <EarnIcon /> },
          ].map(({ label, path, icon, badge, active }) => (
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

      {msgModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setMsgModal(null)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] z-[60] shadow-2xl max-w-[500px] mx-auto max-h-[90vh] overflow-y-auto">
            <div className="w-9 h-1 bg-[#e5e7eb] rounded-full mx-auto mt-3" />
            <div className="px-5 py-3 border-b border-[#f3f4f6]">
              <p className="text-[15px] font-bold text-[#1a1a1a]">Message {msgModal.officeName}</p>
              <p className="text-[12px] text-[#9ca3af]">Send a message about this shift</p>
            </div>
            <div className="px-5 py-4">
              <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type your message..." className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1a7f5e] resize-none h-24" />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setMsgModal(null)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-3 min-h-[44px] rounded-full text-[13px]">Cancel</button>
                <button onClick={async () => {
                  if (!msgText.trim()) { showToast('Please type a message'); return }
                  try {
                    const token = await getToken()
                    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                    const res = await fetch(`${API_URL}/api/messages`, {
                      method: 'POST', headers,
                      body: JSON.stringify({ officeId: msgModal.officeId || null, providerId: myProviderId || null, body: msgText.trim() }),
                    })
                    if (res.ok) showToast('Message sent!')
                    else { const err = await res.json().catch(() => ({})); showToast(err.error || 'Failed to send') }
                  } catch { showToast('Failed to send message') }
                  setMsgModal(null); setMsgText('')
                }} className="flex-1 bg-[#1a7f5e] text-white font-bold py-3 min-h-[44px] rounded-full text-[13px]">Send message</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CalIcon()    { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function ClockIcon()  { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function UserIcon()   { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> }
function ParkIcon()   { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> }
function PinIcon()    { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function HomeIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
