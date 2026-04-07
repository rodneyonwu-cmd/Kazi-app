import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const EmptyState = ({ icon, title, sub, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4">{icon}</div>
    <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">{title}</p>
    <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6 max-w-[280px]">{sub}</p>
    {action}
  </div>
)

const SkeletonCard = () => (
  <div className="flex items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-[#e5e7eb] last:border-0 animate-pulse">
    <div className="w-12 h-12 rounded-full bg-[#e5e7eb] flex-shrink-0" />
    <div className="flex-1">
      <div className="h-4 bg-[#e5e7eb] rounded w-32 mb-2" />
      <div className="h-3 bg-[#f3f4f6] rounded w-48 mb-1" />
      <div className="h-3 bg-[#f3f4f6] rounded w-24" />
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="h-7 bg-[#e5e7eb] rounded-full w-16" />
      <div className="h-7 bg-[#f3f4f6] rounded-full w-16" />
    </div>
  </div>
)

const LoadingSkeleton = () => (
  <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden mb-4">
    <div className="flex items-center justify-between px-4 sm:px-6 py-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-6 bg-[#e5e7eb] rounded-full w-20" />
        <div>
          <div className="h-4 bg-[#e5e7eb] rounded w-48 mb-1" />
          <div className="h-3 bg-[#f3f4f6] rounded w-36" />
        </div>
      </div>
    </div>
    <div className="border-t border-[#e5e7eb]">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
)

export default function Applicants() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [activeTopTab, setActiveTopTab] = useState('temp')
  const [openGroups, setOpenGroups] = useState({})
  const [toast, setToast] = useState(null)
  const [accepted, setAccepted] = useState({})
  const [declined, setDeclined] = useState({})
  const [shortlisted, setShortlisted] = useState({})
  const [subTabs, setSubTabs] = useState({})
  const [applications, setApplications] = useState([])
  const [shifts, setShifts] = useState([])
  const [shiftGroups, setShiftGroups] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        // Fetch office profile to get officeId
        const officeRes = await fetch(`${API_URL}/api/offices/me`, { headers })
        if (!officeRes.ok) { setLoading(false); return }
        const office = await officeRes.json()

        // Fetch shifts AND applications in parallel
        const [shiftsRes, appsRes] = await Promise.all([
          fetch(`${API_URL}/api/shifts?officeId=${office.id}`, { headers }),
          fetch(`${API_URL}/api/applications`, { headers }),
        ])

        const shiftsData = shiftsRes.ok ? await shiftsRes.json() : []
        const apps = appsRes.ok ? await appsRes.json() : []

        // Filter out office-initiated requests — only show shifts the office posted (OPEN/FILLED)
        // not booking requests the office sent to providers (PENDING status)
        const postedShifts = shiftsData.filter(s => s.status !== 'PENDING')
        const postedShiftIds = new Set(postedShifts.map(s => s.id))
        const providerApps = apps.filter(a => postedShiftIds.has(a.shiftId))

        setShifts(postedShifts)
        setApplications(providerApps)

        // Build groups: each shift is a group, with its applications
        const grouped = {}
        postedShifts.forEach(s => { grouped[s.id] = { shift: s, applications: [] } })
        providerApps.forEach(a => {
          if (grouped[a.shiftId]) grouped[a.shiftId].applications.push(a)
          else if (postedShiftIds.has(a.shiftId)) grouped[a.shiftId] = { shift: a.shift, applications: [a] }
        })
        setShiftGroups(grouped)

        // Initialize sub-tabs for each shift. Cards start collapsed.
        const initialSubTabs = {}
        Object.keys(grouped).forEach(shiftId => {
          initialSubTabs[shiftId] = 'All'
        })
        setOpenGroups({})
        setSubTabs(initialSubTabs)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [getToken])

  const groupByShift = (apps) => {
    const groups = {}
    apps.forEach(app => {
      const key = app.shiftId
      if (!groups[key]) groups[key] = []
      groups[key].push(app)
    })
    return groups
  }

  const toggleGroup = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))

  const handleAccept = async (appId, name) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/applications/${appId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      })
      if (!res.ok) throw new Error('Failed to accept application')
      setAccepted(prev => ({ ...prev, [appId]: true }))
      setDeclined(prev => ({ ...prev, [appId]: false }))
      setToast(`${name} accepted — shift confirmed!`)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Error accepting application:', err)
      setToast('Failed to accept applicant. Please try again.')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleDecline = async (appId, name) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/applications/${appId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'DECLINED' }),
      })
      if (!res.ok) throw new Error('Failed to decline application')
      setDeclined(prev => ({ ...prev, [appId]: true }))
      setAccepted(prev => ({ ...prev, [appId]: false }))
      setShortlisted(prev => ({ ...prev, [appId]: false }))
      setToast(`${name} declined`)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Error declining application:', err)
      setToast('Failed to decline applicant. Please try again.')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handleShortlist = (appId, name) => {
    const isNow = !shortlisted[appId]
    setShortlisted(prev => ({ ...prev, [appId]: isNow }))
    setToast(isNow ? `${name} shortlisted!` : `${name} removed from shortlist`)
    setTimeout(() => setToast(null), 3000)
  }

  const filterApplicants = (applicants, groupId) => {
    const tab = subTabs[groupId] || 'All'
    return applicants.filter(app => {
      const isAccepted = app.status === 'ACCEPTED' || accepted[app.id]
      const isDeclined = app.status === 'DECLINED' || declined[app.id]
      const isShortlisted = shortlisted[app.id]
      if (tab === 'All') return true
      if (tab === 'Pending') return !isAccepted && !isDeclined && !isShortlisted
      if (tab === 'Accepted') return isAccepted
      if (tab === 'Reviewing') return !isDeclined && !isShortlisted
      if (tab === 'Shortlisted') return isShortlisted
      if (tab === 'Declined') return isDeclined
      return true
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':')
    const hour = parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${display}:${m} ${ampm}`
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const getApplicantName = (app) => {
    const u = app.provider?.user
    if (u?.firstName && u?.lastName) return `${u.firstName} ${u.lastName.charAt(0)}.`
    if (u?.firstName) return u.firstName
    return 'Unknown'
  }

  const getFullName = (app) => {
    const u = app.provider?.user
    if (u?.firstName && u?.lastName) return `${u.firstName} ${u.lastName}`
    if (u?.firstName) return u.firstName
    return 'Unknown'
  }

  const handleCancel = async (appId, name) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/applications/${appId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })
      if (!res.ok) throw new Error('Failed to cancel application')
      setAccepted(prev => ({ ...prev, [appId]: false }))
      setDeclined(prev => ({ ...prev, [appId]: false }))
      setToast(`${name} cancelled`)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('Error cancelling application:', err)
      setToast('Failed to cancel. Please try again.')
      setTimeout(() => setToast(null), 3000)
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const r = rating != null ? Math.round(rating) : 0
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= r ? '#f59e0b' : 'none'} stroke={i <= r ? '#f59e0b' : '#d1d5db'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    }
    return <div className="flex items-center gap-0.5">{stars}</div>
  }

  const renderApplicant = (app, type = 'temp') => {
    const isAccepted = app.status === 'ACCEPTED' || accepted[app.id]
    const isDeclined = app.status === 'DECLINED' || declined[app.id]
    const isShortlisted = shortlisted[app.id]
    const name = getApplicantName(app)
    const fullName = getFullName(app)
    const provider = app.provider
    const providerId = provider?.id || provider?.userId
    const rating = provider?.averageRating ?? provider?.reliabilityScore
    const rate = provider?.hourlyRate ? `$${provider.hourlyRate}/hr` : ''

    if (type === 'temp') {
      return (
        <div key={app.id} className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-[#e5e7eb] last:border-0">
          <div onClick={() => navigate(providerId ? `/provider-profile/${providerId}` : '/profile')} className="cursor-pointer flex-shrink-0">
            <InitialsAvatar name={fullName} size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span onClick={() => navigate(providerId ? `/provider-profile/${providerId}` : '/profile')} className="text-[13px] font-bold text-[#1a1a1a] cursor-pointer hover:underline">{name}</span>
              {rate && <span className="text-[11px] text-[#6b7280]">{rate}</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {renderStars(rating)}
              {rating != null && <span className="text-[11px] text-[#9ca3af]">{Number(rating).toFixed(1)}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isDeclined ? (
              <span className="text-[11px] font-bold text-red-400 bg-red-50 px-2 py-1 rounded-full">Declined</span>
            ) : isAccepted ? (
              <>
                <span className="text-[11px] font-bold text-[#1a7f5e] bg-[#e8f5f0] px-2 py-1 rounded-full">Accepted</span>
                <button onClick={() => handleCancel(app.id, name)} className="text-[11px] text-[#9ca3af] hover:text-red-400 px-1.5 py-1 rounded transition" title="Cancel">✕</button>
              </>
            ) : (
              <>
                <button onClick={() => handleAccept(app.id, name)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white text-[11px] font-bold px-2.5 py-1 rounded-full transition">Accept</button>
                <button onClick={() => handleDecline(app.id, name)} className="border border-[#e5e7eb] text-[#6b7280] text-[11px] font-semibold px-2.5 py-1 rounded-full hover:border-red-400 hover:text-red-400 transition">Decline</button>
                <button onClick={() => handleCancel(app.id, name)} className="text-[11px] text-[#9ca3af] hover:text-red-400 px-1.5 py-1 rounded transition" title="Cancel">✕</button>
              </>
            )}
          </div>
        </div>
      )
    }

    // Permanent job applicant rendering
    const reliability = provider?.reliabilityScore != null ? `${provider.reliabilityScore}% reliable` : ''
    const meta = [rate, reliability].filter(Boolean).join(' · ')

    return (
      <div key={app.id} className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-[#e5e7eb] last:border-0">
        <div className="flex items-start gap-3 sm:gap-4 sm:contents">
          <div onClick={() => navigate(providerId ? `/provider-profile/${providerId}` : '/profile')} className="cursor-pointer flex-shrink-0">
            <InitialsAvatar name={fullName} size={48} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-[13px] sm:text-sm font-bold text-[#1a1a1a]">{name}</span>
              {renderStars(rating)}
              {rating != null && <span className="text-[11px] text-[#9ca3af]">{Number(rating).toFixed(1)}</span>}
            </div>
            {meta && <p className="text-xs text-[#6b7280] mb-0.5">{meta}</p>}
            <p className="text-xs text-[#9ca3af] mb-1">{provider?.role || ''}</p>
            {app.note && <p className="text-xs text-[#6b7280] italic">"{app.note}"</p>}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto">
          {isDeclined ? (
            <span className="text-xs font-bold text-red-400 bg-red-50 px-3 py-2 sm:py-1.5 rounded-full text-center">Declined</span>
          ) : isAccepted ? (
            <>
              <span className="flex items-center justify-center gap-1 text-xs font-bold text-[#1a7f5e] bg-[#e8f5f0] px-3 py-2 sm:py-1.5 rounded-full">Accepted</span>
              <button onClick={() => navigate(providerId ? `/provider-profile/${providerId}` : '/profile')} className="border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-full hover:border-[#1a7f5e] transition">Profile</button>
            </>
          ) : (
            <>
              <button onClick={() => handleShortlist(app.id, name)} className={`text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-full border transition ${isShortlisted ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}>{isShortlisted ? '✓ Shortlisted' : 'Shortlist'}</button>
              <button onClick={() => handleDecline(app.id, name)} className="border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-full hover:border-red-400 hover:text-red-400 transition">Decline</button>
              <button onClick={() => navigate(providerId ? `/provider-profile/${providerId}` : '/profile')} className="border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold px-3 py-2 sm:py-1.5 rounded-full hover:border-[#1a7f5e] transition">Profile</button>
            </>
          )}
        </div>
      </div>
    )
  }

  const getDateParts = (dateStr) => {
    if (!dateStr) return { day: '', month: '' }
    const d = new Date(dateStr)
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    }
  }

  const renderGroup = (shiftId, shift, applicants, type, tabOptions) => {
    const filtered = filterApplicants(applicants, shiftId)
    const isPerm = shift.jobType === 'PERMANENT'
    const timeRange = `${formatTime(shift.startTime)} – ${formatTime(shift.endTime)}`
    const rateDisplay = shift.hourlyRate ? `$${shift.hourlyRate}/hr` : ''
    const metaText = [timeRange, rateDisplay].filter(Boolean).join(' · ')
    const dateParts = getDateParts(shift.date)

    // For perm jobs, keep full stats
    const pendingCount = applicants.filter(a => {
      const acc = a.status === 'ACCEPTED' || accepted[a.id]
      const dec = a.status === 'DECLINED' || declined[a.id]
      return !acc && !dec
    }).length

    const stats = isPerm
      ? [
          { val: pendingCount, label: 'Reviewing', color: 'text-[#f59e0b]' },
          { val: applicants.filter(a => shortlisted[a.id]).length, label: 'Shortlisted' },
          { val: applicants.length, label: 'Total' },
        ]
      : null

    return (
      <div key={shiftId} className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden mb-4">
        <div onClick={() => toggleGroup(shiftId)} className="flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer hover:bg-[#f9f8f6] transition">
          <div className="flex items-center gap-3 min-w-0">
            {isPerm ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 bg-[#ede9fe] text-[#5b21b6]">Permanent</span>
            ) : (
              <div className="w-12 h-12 rounded-lg bg-[#e8f5f0] flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-[#1a7f5e] leading-none">{dateParts.month}</span>
                <span className="text-[20px] font-extrabold text-[#1a7f5e] leading-none">{dateParts.day}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[13px] sm:text-sm font-extrabold text-[#1a1a1a] break-words">{shift.role || 'Shift'}</p>
              <div className="flex items-center gap-2 text-[13px] text-[#6b7280] mt-0.5">
                {metaText}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {isPerm && stats ? (
              <div className="flex gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className={`text-base font-extrabold ${s.color || 'text-[#1a1a1a]'}`}>{s.val}</div>
                    <div className="text-xs text-[#9ca3af]">{s.label}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-[#1a1a1a]">{applicants.length}</span>
                <span className="text-xs text-[#9ca3af]">{applicants.length === 1 ? 'applicant' : 'applicants'}</span>
              </div>
            )}
            <span className="text-[#9ca3af]">{openGroups[shiftId] ? '∧' : '∨'}</span>
          </div>
        </div>
        {openGroups[shiftId] && (
          <div className="border-t border-[#e5e7eb]">
            {isPerm && (
              <div className="flex gap-4 px-4 sm:px-6 py-3 border-b border-[#e5e7eb] overflow-x-auto whitespace-nowrap">
                {tabOptions.map(t => (
                  <button key={t} onClick={() => setSubTabs(prev => ({ ...prev, [shiftId]: t }))} className={`text-sm font-semibold pb-1 border-b-2 transition ${(subTabs[shiftId] || 'All') === t ? 'border-[#1a7f5e] text-[#1a7f5e]' : 'border-transparent text-[#9ca3af] hover:text-[#1a1a1a]'}`}>{t}</button>
                ))}
              </div>
            )}
            {applicants.length === 0 ? (
              <EmptyState
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                title="Awaiting applicants..."
                sub="No one has applied to this shift yet. Applications will appear here."
                action={null}
              />
            ) : (isPerm ? filtered : applicants).length === 0 ? (
              <EmptyState
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                title="No applicants in this category"
                sub="Try selecting a different filter tab above."
                action={null}
              />
            ) : (
              (isPerm ? filtered : applicants).map(app => renderApplicant(app, type))
            )}
          </div>
        )}
      </div>
    )
  }

  const shiftEntries = Object.entries(shiftGroups)
  const tempCount = shiftEntries.filter(([, g]) => g.shift?.jobType !== 'PERMANENT').length
  const permCount = shiftEntries.filter(([, g]) => g.shift?.jobType === 'PERMANENT').length

  const visibleShifts = activeTopTab === 'temp'
    ? shiftEntries.filter(([, g]) => g.shift?.jobType !== 'PERMANENT')
    : shiftEntries.filter(([, g]) => g.shift?.jobType === 'PERMANENT')

  const topTabs = [
    { id: 'temp', label: 'Temp shifts', count: tempCount },
    { id: 'perm', label: 'Permanent jobs', count: permCount },
  ]

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <h1 className="text-[22px] sm:text-[28px] font-extrabold text-[#1a1a1a] mb-1">Applicants</h1>
        <p className="text-[13px] sm:text-[15px] text-[#6b7280] mb-6">Review professionals who have applied to your shifts and job postings.</p>

        <div className="flex gap-0 border-b border-[#e5e7eb] mb-6 overflow-x-auto whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          {topTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTopTab(tab.id)} className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-[14px] sm:text-[15px] font-medium border-b-2 -mb-px transition flex-shrink-0 ${activeTopTab === tab.id ? (tab.id === 'perm' ? 'border-[#5b21b6] text-[#5b21b6] font-semibold' : 'border-[#1a7f5e] text-[#1a7f5e] font-semibold') : 'border-transparent text-[#9ca3af] hover:text-[#1a1a1a]'}`}>
              {tab.icon}
              {tab.label} <span className="text-[13px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full font-semibold">{tab.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <>
            <LoadingSkeleton />
            <LoadingSkeleton />
          </>
        ) : shiftEntries.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl">
            <EmptyState
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              title="No shifts posted yet"
              sub="Post a shift to start receiving applications."
              action={<button onClick={() => navigate('/post-shift')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-5 py-2.5 rounded-full text-sm transition">Post a shift</button>}
            />
          </div>
        ) : (
          <>
            {visibleShifts.map(([shiftId, group]) => {
              const shift = group.shift || {}
              const apps = group.applications || []
              const type = 'temp' // adjust when API provides shift type
              const tabOptions = type === 'perm'
                ? ['All', 'Reviewing', 'Shortlisted', 'Declined']
                : ['All', 'Pending', 'Accepted', 'Declined']
              return renderGroup(shiftId, shift, apps, type, tabOptions)
            })}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}
    </div>
  )
}
