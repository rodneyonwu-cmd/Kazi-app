import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import ProviderNav from '../components/ProviderNav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const LOGO_COLORS = [
  { bg: 'bg-[#e8f5f0]', text: 'text-[#1a7f5e]' },
  { bg: 'bg-[#fef9c3]', text: 'text-[#92400e]' },
  { bg: 'bg-[#ede9fe]', text: 'text-[#5b21b6]' },
  { bg: 'bg-[#fee2e2]', text: 'text-[#991b1b]' },
  { bg: 'bg-[#dbeafe]', text: 'text-[#1e40af]' },
]

const ROLE_LABELS = {
  hygienist: 'Dental Hygienist',
  assistant: 'Dental Assistant',
  front: 'Front Office',
  dentist: 'Dentist',
  specialist: 'Specialist',
}
function displayRole(role) {
  if (!role) return ''
  return ROLE_LABELS[role] || role
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getInitials(name) {
  if (!name) return '??'
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatShiftDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function todayStr() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

// Skeleton loader for profile card
function ProfileSkeleton() {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 mb-5 animate-pulse">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-20 h-20 rounded-full bg-[#f3f4f6]" />
        <div className="flex-1">
          <div className="h-6 bg-[#f3f4f6] rounded-lg w-48 mb-2" />
          <div className="h-4 bg-[#f3f4f6] rounded-lg w-64" />
        </div>
      </div>
      <div className="h-px bg-[#f3f4f6] mb-5" />
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="text-center">
            <div className="h-7 bg-[#f3f4f6] rounded-lg w-12 mx-auto mb-1" />
            <div className="h-4 bg-[#f3f4f6] rounded-lg w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ShiftsSkeleton() {
  return (
    <div className="flex flex-col gap-2.5">
      {[1,2,3].map(i => (
        <div key={i} className="bg-white border border-[#e5e7eb] rounded-[16px] px-4 py-3.5 animate-pulse">
          <div className="flex items-center gap-3 mb-2.5">
            <div className="w-10 h-10 rounded-[11px] bg-[#f3f4f6]" />
            <div className="flex-1">
              <div className="h-4 bg-[#f3f4f6] rounded w-32 mb-1.5" />
              <div className="h-3 bg-[#f3f4f6] rounded w-40" />
            </div>
            <div className="h-6 bg-[#f3f4f6] rounded w-14" />
          </div>
          <div className="h-4 bg-[#f3f4f6] rounded w-48" />
        </div>
      ))}
    </div>
  )
}

export default function ProviderDashboard() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()
  const [zip, setZip] = useState('77459')
  const [distance, setDistance] = useState('Within 25 miles')
  const [searchDate, setSearchDate] = useState('')

  const [profile, setProfile] = useState(null)
  const [shifts, setShifts] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [shiftsLoading, setShiftsLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState(null)
  const [msgModal, setMsgModal] = useState(null)
  const [msgText, setMsgText] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        // Fetch profile and shifts in parallel
        const [profileRes, shiftsRes] = await Promise.all([
          fetch(`${API_URL}/api/providers/me`, { headers }),
          fetch(`${API_URL}/api/shifts?status=OPEN`, { headers }),
        ])

        if (profileRes.ok) {
          const data = await profileRes.json()
          setProfile(data)
          if (data.zip) setZip(data.zip)
        }
        setProfileLoading(false)

        if (shiftsRes.ok) {
          const data = await shiftsRes.json()
          setShifts(data.slice(0, 5))
        }
        setShiftsLoading(false)
      } catch {
        setProfileLoading(false)
        setShiftsLoading(false)
      }
    }
    fetchData()
  }, [getToken])

  const rawFirst = profile?.firstName || user?.firstName || 'there'
  const isDentist = profile?.role === 'dentist'
  const firstName = isDentist ? `Dr. ${rawFirst}` : rawFirst
  const roleName = displayRole(profile?.role)
  const location = profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : null
  const avatarUrl = profile?.avatarUrl

  // Profile strength
  const hasPhoto = !!(user?.imageUrl || profile?.avatarUrl)
  const hasAbout = !!(profile?.bio)
  const hasRate = !!(profile?.hourlyRate)
  const hasCreds = (profile?.credentials?.length || 0) > 0
  const hasResume = !!(profile?.resumeUrl)
  const hasAvail = (profile?.availability?.length || 0) > 0
  const strengthCount = [hasPhoto, hasAbout, hasRate, hasCreds, hasResume, hasAvail].filter(Boolean).length
  const strengthPct = Math.round((strengthCount / 6) * 100)
  const profileComplete = strengthPct === 100

  const handleSearch = () => {
    const distNum = distance.replace(/\D/g, '') || '25'
    const params = new URLSearchParams({ zip, distance: distNum })
    if (searchDate) params.set('date', searchDate)
    navigate(`/provider-find-shifts?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      {/* ── NAV ── */}
      <ProviderNav />

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Profile card */}
        {profileLoading ? <ProfileSkeleton /> : (
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 mb-5">
            <div className="flex items-center gap-4 mb-5">
              <div className="relative flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl.startsWith('http') ? avatarUrl : `${API_URL}${avatarUrl}`}
                    alt={firstName}
                    className="w-20 h-20 rounded-full object-cover border-[3px] border-[#e5e7eb]"
                  />
                ) : (
                  <InitialsAvatar name={firstName} size={80} className="border-[3px] border-[#e5e7eb]" />
                )}
                {profileComplete && (
                  <div className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-[#7c3aed] border-[2.5px] border-white flex items-center justify-center">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[20px] font-black text-[#1a1a1a] tracking-tight mb-1">{getGreeting()}, {firstName}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold text-[#1a7f5e] capitalize">{roleName}</span>
                  {location && <>
                    <span className="text-[#e5e7eb]">&middot;</span>
                    <span className="text-[13px] text-[#9ca3af]">{location}</span>
                  </>}
                  <span className="text-[#e5e7eb]">&middot;</span>
                  <span className="text-[13px] text-[#9ca3af]">{todayStr()}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/provider-profile')}
                className="border border-[#e5e7eb] bg-white text-[#374151] rounded-full px-3.5 py-1.5 text-[12px] font-bold hover:border-[#1a7f5e] transition whitespace-nowrap"
              >
                Edit profile
              </button>
            </div>

            <div className="h-px bg-[#f3f4f6] mb-5" />

            {/* Stats row */}
            <div className="grid grid-cols-4">
              {[
                { value: profile?.stats?.rating ? `★ ${profile.stats.rating}` : '—', label: 'Rating', color: profile?.stats?.rating ? 'text-[#F97316]' : 'text-[#9ca3af]' },
                { value: profile?.stats?.completedShifts > 0 ? `${Math.round(profile.stats.reliability)}%` : '\u2014', label: 'Reliability', color: profile?.stats?.completedShifts > 0 ? 'text-[#1a1a1a]' : 'text-[#9ca3af]' },
                { value: String(profile?.stats?.completedShifts ?? 0), label: 'Total shifts', color: 'text-[#1a1a1a]' },
                { value: `${strengthPct}%`, label: 'Profile score', color: profileComplete ? 'text-[#7c3aed]' : 'text-[#F97316]' },
              ].map(({ value, label, color }, i, arr) => (
                <div
                  key={label}
                  className={`text-center px-2 ${i < arr.length - 1 ? 'border-r border-[#f3f4f6]' : ''}`}
                >
                  <p className={`text-[22px] font-bold ${color} mb-0.5`}>{value}</p>
                  <p className="text-[13px] text-[#9ca3af]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search hero */}
        <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-5 mb-5">
          <p className="text-[16px] font-black text-[#1a1a1a] mb-1">Find your next opportunity</p>
          <p className="text-[13px] text-[#9ca3af] mb-4">Shifts and jobs near you matching your license</p>

          <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr_1fr_auto] gap-2 items-center">
            {/* ZIP */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <input
                type="text"
                value={zip}
                onChange={e => setZip(e.target.value)}
                maxLength={5}
                placeholder="ZIP code"
                className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl pl-8 pr-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none focus:border-[#1a7f5e] transition"
              />
            </div>

            {/* Distance */}
            <div className="relative">
              <select
                value={distance}
                onChange={e => setDistance(e.target.value)}
                className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-2.5 text-[14px] text-[#374151] outline-none focus:border-[#1a7f5e] transition appearance-none cursor-pointer"
              >
                {['Within 10 miles', 'Within 15 miles', 'Within 25 miles', 'Within 40 miles', 'Within 60 miles'].map(o => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Date */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <input
                type="date"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
                className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl pl-8 pr-3 py-2.5 text-[14px] text-[#374151] outline-none focus:border-[#1a7f5e] transition cursor-pointer appearance-none"
              />
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-xl text-[14px] transition whitespace-nowrap"
            >
              Search
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-widest mb-3">Quick actions</p>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div
            onClick={() => navigate('/provider-availability')}
            className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 cursor-pointer hover:border-[#1a7f5e] transition"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">My schedule</p>
            <p className="text-[13px] text-[#9ca3af]">
View your schedule
            </p>
          </div>

          <div
            onClick={() => navigate('/provider-requests')}
            className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 cursor-pointer hover:border-[#1a7f5e] transition relative"
          >
            {(profile?.stats?.pendingRequests ?? 0) > 0 && (
              <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#ef4444] flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">{profile.stats.pendingRequests}</span>
              </div>
            )}
            <div className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-0.5">Shift Requests</p>
            <p className="text-[13px] font-bold text-[#1a7f5e]">
              {(profile?.stats?.pendingRequests ?? 0) > 0 ? `${profile.stats.pendingRequests} pending` : 'No pending requests'}
            </p>
          </div>
        </div>

        {/* Shifts & Jobs near me */}
        {shiftsLoading ? <ShiftsSkeleton /> : shifts && shifts.length > 0 ? (<>
          {/* Temp Shifts */}
          {shifts.filter(s => s.jobType !== 'PERMANENT').length > 0 && (<>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[15px] font-black text-[#1a1a1a]">Shifts near me</p>
              <button onClick={() => navigate('/provider-find-shifts')} className="text-[13px] font-bold text-[#1a7f5e] hover:underline">See all</button>
            </div>
            <div className="space-y-3 mb-6">
              {shifts.filter(s => s.jobType !== 'PERMANENT').map((shift, idx) => {
                const officeName = shift.office?.name || 'Dental Office'
                const initials = getInitials(officeName)
                const colors = LOGO_COLORS[idx % LOGO_COLORS.length]
                const isToday = new Date(shift.date).toDateString() === new Date().toDateString()
                const isTomorrow = new Date(shift.date).toDateString() === new Date(Date.now() + 86400000).toDateString()
                return (
                  <button key={shift.id} onClick={() => setSelectedShift(shift)} className="w-full bg-white border border-[#e5e7eb] hover:border-[#1a7f5e] rounded-[18px] p-4 flex items-center gap-4 transition text-left">
                    <div className={`w-11 h-11 rounded-[12px] ${colors.bg} flex items-center justify-center text-[11px] font-black ${colors.text} flex-shrink-0`}>{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-extrabold text-[#1a1a1a] truncate">{officeName}</p>
                        {isToday && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b] flex-shrink-0">Today</span>}
                        {isTomorrow && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef9c3] text-[#92400e] flex-shrink-0">Tomorrow</span>}
                        {shift.isRapidFill && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef9c3] text-[#92400e] flex-shrink-0">Rapid Fill</span>}
                      </div>
                      <p className="text-[12px] text-[#6b7280]">{shift.role}</p>
                      <p className="text-[12px] text-[#9ca3af]">{formatShiftDate(shift.date)} · {shift.startTime} – {shift.endTime}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[15px] font-black text-[#1a7f5e]">${shift.hourlyRate}/hr</p>
                      {shift.office?.city && <p className="text-[11px] text-[#9ca3af]">{shift.office.city}, {shift.office.state}</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </>)}

          {/* Permanent Jobs */}
          {shifts.filter(s => s.jobType === 'PERMANENT').length > 0 && (<>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[15px] font-black text-[#1a1a1a] flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                Permanent jobs
              </p>
              <button onClick={() => navigate('/provider-find-shifts')} className="text-[13px] font-bold text-[#5b21b6] hover:underline">See all</button>
            </div>
            <div className="space-y-3 mb-6">
              {shifts.filter(s => s.jobType === 'PERMANENT').map((shift) => {
                const officeName = shift.office?.name || 'Dental Office'
                const initials = getInitials(officeName)
                const salaryDisplay = shift.salaryMin ? `$${Number(shift.salaryMin).toLocaleString()}${shift.salaryMax ? ` – $${Number(shift.salaryMax).toLocaleString()}` : ''}/yr` : ''
                return (
                  <button key={shift.id} onClick={() => setSelectedShift(shift)} className="w-full bg-white border border-[#e5e7eb] hover:border-[#5b21b6] rounded-[18px] p-4 flex items-center gap-4 transition text-left">
                    <div className="w-11 h-11 rounded-[12px] bg-[#ede9fe] flex items-center justify-center text-[11px] font-black text-[#5b21b6] flex-shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-extrabold text-[#1a1a1a] truncate">{officeName}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#5b21b6] flex-shrink-0">Permanent</span>
                      </div>
                      <p className="text-[12px] text-[#6b7280]">{shift.role}</p>
                      <p className="text-[12px] text-[#9ca3af]">{shift.schedule?.split(' · ')[0] || 'Full-time'}</p>
                    </div>
                    <div className="text-right flex-shrink-0" style={{ maxWidth: 120 }}>
                      <p className="text-[13px] font-black text-[#5b21b6]">{salaryDisplay || `$${shift.hourlyRate}/hr`}</p>
                      {salaryDisplay && shift.hourlyRate > 0 && <p className="text-[11px] text-[#9ca3af]">${shift.hourlyRate}/hr</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </>)}
        </>) : (
          <div className="bg-white border border-[#e5e7eb] rounded-[18px] px-4 py-8 text-center">
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No open shifts right now</p>
            <p className="text-[13px] text-[#9ca3af]">Check back soon or adjust your search filters</p>
          </div>
        )}
      </div>

      {/* ── SHIFT DETAIL MODAL ── */}
      {selectedShift && (() => {
        const s = selectedShift
        const isPerm = s.jobType === 'PERMANENT'
        const officeName = s.office?.name || 'Office'
        const initials = officeName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
        const location = s.office?.city ? `${s.office.city}, ${s.office.state}` : ''
        const dateStr = formatShiftDate(s.date)
        const timeStr = `${s.startTime} – ${s.endTime}`
        const rate = s.hourlyRate ? `$${s.hourlyRate}/hr` : '—'
        const parse = (t) => { if (!t) return 0; const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return 0; let h = +m[1], mi = +m[2]; if (m[3].toUpperCase() === 'PM' && h < 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return h + mi / 60 }
        const hours = parse(s.endTime) - parse(s.startTime)
        const estPay = hours > 0 && s.hourlyRate ? `$${Math.round(hours * s.hourlyRate)}` : '—'
        const software = (s.software || []).join(', ') || 'N/A'
        const salaryDisplay = s.salaryMin ? `$${Number(s.salaryMin).toLocaleString()}${s.salaryMax ? ` – $${Number(s.salaryMax).toLocaleString()}` : ''}/yr` : ''
        const benefits = s.benefits || []
        const accent = isPerm ? '#5b21b6' : '#1a7f5e'
        const accentBg = isPerm ? 'bg-[#ede9fe]' : 'bg-[#e8f5f0]'
        const accentText = isPerm ? 'text-[#5b21b6]' : 'text-[#1a7f5e]'
        const accentDark = isPerm ? 'text-[#5b21b6]' : 'text-[#0f4d38]'
        const accentBtn = isPerm ? 'bg-[#5b21b6] hover:bg-[#4c1d95]' : 'bg-[#1a7f5e] hover:bg-[#156649]'
        const accentHover = isPerm ? 'hover:border-[#5b21b6] hover:bg-[#f5f3ff]' : 'hover:border-[#1a7f5e] hover:bg-[#f0faf5]'
        return (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedShift(null)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-[440px] bg-white z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-5 pt-6 pb-4 border-b border-[#f3f4f6] flex-shrink-0">
              <button onClick={() => setSelectedShift(null)} className="flex items-center gap-1.5 text-[13px] font-bold text-[#6b7280] mb-4 bg-none border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-[14px] ${accentBg} flex items-center justify-center text-[14px] font-black ${accentText} flex-shrink-0`}>{initials}</div>
                <div className="flex-1">
                  <p className="text-[20px] font-black text-[#1a1a1a]">{officeName}</p>
                  <p className="text-[13px] text-[#6b7280]">{location}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {/* Compensation banner */}
              <div className={`rounded-[14px] px-4 py-3 mb-5 ${accentBg}`}>
                <p className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${isPerm ? 'text-[#7c3aed]' : 'text-[#6b9e8a]'}`}>{isPerm ? 'Compensation' : 'Estimated pay'}</p>
                <p className={`font-black ${isPerm ? 'text-[17px]' : 'text-[22px]'} ${accentDark}`}>{isPerm ? (salaryDisplay || rate) : estPay}</p>
                {isPerm && rate && salaryDisplay && <p className="text-[12px] text-[#7c3aed] mt-0.5">{rate}</p>}
              </div>

              {isPerm ? (<>
                {/* Permanent job details */}
                <p className="text-[16px] font-semibold text-[#374151] mb-3">Job details</p>
                <div className="bg-[#f9f8f6] rounded-[14px] overflow-hidden mb-5">
                  {[
                    ['Role', s.role || '—'],
                    ['Employment', s.schedule?.split(' · ')[0] || 'Full-time'],
                    ['Schedule', s.schedule?.split(' · ').slice(1).join(', ') || 'Standard'],
                    ['Experience', s.experienceYr ? `${s.experienceYr}+ years` : 'No minimum'],
                    ['Location', location || '—'],
                  ].map(([label, value], i, arr) => (
                    <div key={label} className={`flex justify-between gap-4 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f0efed]' : ''}`}>
                      <span className="text-[13px] text-[#9ca3af] flex-shrink-0">{label}</span>
                      <span className="text-[13px] font-medium text-[#1a1a1a] text-right">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                {benefits.length > 0 && (
                  <div className="mb-5">
                    <p className="text-[15px] font-semibold text-[#374151] mb-3">Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {benefits.map(b => (
                        <span key={b} className="flex items-center gap-1.5 bg-[#f5f3ff] border border-[#e5e7eb] rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#374151]">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>{b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {s.description && (
                  <div className="mb-5">
                    <p className="text-[15px] font-semibold text-[#374151] mb-2">About this position</p>
                    <div className="bg-[#f9f8f6] rounded-[14px] p-4 text-[13px] text-[#374151] leading-relaxed whitespace-pre-line">{s.description}</div>
                  </div>
                )}
              </>) : (<>
                {/* Temp shift details */}
                <p className="text-[16px] font-semibold text-[#374151] mb-3">Shift details</p>
                <div className="bg-[#f9f8f6] rounded-[14px] overflow-hidden mb-5">
                  {[['Date', dateStr], ['Time', timeStr], ['Hourly Rate', rate], ['Role', s.role || '—'], ['Software', software]].map(([label, value], i, arr) => (
                    <div key={label} className={`flex justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f0efed]' : ''}`}>
                      <span className="text-[13px] text-[#9ca3af]">{label}</span>
                      <span className="text-[13px] font-medium text-[#1a1a1a]">{value}</span>
                    </div>
                  ))}
                </div>
                {s.description && (
                  <div className="mb-5">
                    <p className="text-[15px] font-semibold text-[#374151] mb-2">Notes</p>
                    <div className="bg-[#f9f8f6] rounded-[14px] p-4 text-[13px] text-[#374151] leading-relaxed">{s.description}</div>
                  </div>
                )}
              </>)}

              {/* View office profile */}
              <button
                onClick={() => { setSelectedShift(null); navigate(`/office-profile/${s.officeId}`) }}
                className={`w-full flex items-center justify-center gap-2 border border-[#e5e7eb] ${accentText} font-bold py-2.5 rounded-full text-[13px] ${accentHover} transition bg-white cursor-pointer mb-2`}
                style={{ fontFamily: 'inherit' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                View office profile
              </button>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-[#f3f4f6] flex gap-2 flex-shrink-0 bg-white">
              <button onClick={() => { setMsgModal({ officeName, officeId: s.officeId }); setSelectedShift(null) }} className="flex items-center justify-center gap-2 border border-[#e5e7eb] text-[#374151] font-bold px-5 py-3 rounded-full text-[14px] flex-shrink-0 hover:border-[#1a7f5e] transition bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Message
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = await getToken()
                    const res = await fetch(`${API_URL}/api/applications`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ shiftId: s.id }),
                    })
                    if (res.ok) { setSelectedShift(null); showToast('Application submitted!') }
                    else { const err = await res.json().catch(() => ({})); showToast(err.error || 'Failed to apply') }
                  } catch { showToast('Failed to apply') }
                }}
                className={`flex-1 ${accentBtn} text-white font-bold py-3 rounded-full text-[14px] transition border-none cursor-pointer`} style={{ fontFamily: 'inherit' }}
              >
                {isPerm ? 'Apply Now' : 'Apply'}
              </button>
            </div>
          </div>
        </>
        )
      })()}

      {/* ── MESSAGE MODAL ── */}
      {msgModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMsgModal(null)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] z-50 shadow-2xl max-w-[500px] mx-auto">
            <div className="px-5 py-4 border-b border-[#f3f4f6]">
              <p className="text-[15px] font-bold text-[#1a1a1a]">Message {msgModal.officeName}</p>
            </div>
            <div className="px-5 py-4">
              <textarea value={msgText} onChange={e => setMsgText(e.target.value)} placeholder="Type your message..." className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1a7f5e] resize-none h-24" />
              <div className="flex gap-2 mt-3">
                <button onClick={() => setMsgModal(null)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px]">Cancel</button>
                <button onClick={async () => {
                  if (!msgText.trim()) return
                  try {
                    const token = await getToken()
                    await fetch(`${API_URL}/api/messages`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                      body: JSON.stringify({ officeId: msgModal?.officeId || null, providerId: profile?.id || null, body: msgText.trim() }),
                    })
                  } catch {}
                  setMsgModal(null); setMsgText('')
                }} className="flex-1 bg-[#1a7f5e] text-white font-bold py-2.5 rounded-full text-[13px]">Send</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MOBILE BOTTOM TOOLBAR ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home', path: '/provider-dashboard', active: true, icon: <HomeIcon /> },
          { label: 'Requests', path: '/provider-requests', icon: <RequestsIcon />, badge: profile?.stats?.pendingRequests || 0 },
          { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
          { label: 'Messages', path: '/provider-messages', icon: <MessageIcon /> },
          { label: 'Earnings', path: '/provider-earnings', icon: <EarningsIcon /> },
        ].map(({ label, path, active, icon, badge }) => (
          <div
            key={label}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer"
          >
            <div className="relative">
              <span className={active ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}>{icon}</span>
              {badge > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-${active ? '700' : '600'} ${active ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function RequestsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
}
function SearchIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function MessageIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
}
function EarningsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
