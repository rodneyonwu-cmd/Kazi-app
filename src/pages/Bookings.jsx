import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function Bookings() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [view, setView] = useState('list')
  const [search, setSearch] = useState('')
  const [cancelled, setCancelled] = useState({})
  const [withdrawn, setWithdrawn] = useState({})
  const [reviewed, setReviewed] = useState({})
  const [toast, setToast] = useState(null)
  const [sortBy, setSortBy] = useState('Most recent')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(null)
  const [showShiftModal, setShowShiftModal] = useState(null)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [selectedTags, setSelectedTags] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const reviewTags = [
    'Organized', 'On time', 'Would book again', 'Professional',
    'Respectful', 'Great experience', 'Skilled', 'Great communication',
    'Team player', 'Reliable'
  ]

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const [pendingApps, setPendingApps] = useState([])

  // ── Fetch bookings + pending applications from API ──
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }
        const [bookingsRes, appsRes] = await Promise.all([
          fetch(`${API_URL}/api/bookings`, { headers }),
          fetch(`${API_URL}/api/applications`, { headers }),
        ])
        let bookingData = []
        if (bookingsRes.ok) {
          bookingData = await bookingsRes.json()
          setBookings(bookingData)
        }
        if (appsRes?.ok) {
          const apps = await appsRes.json()
          const pendingList = apps.filter(a => a.status === 'PENDING')
          setPendingApps(pendingList)
          // Auto-switch to pending tab if there are pending invites but no confirmed bookings
          const confirmedCount = bookingData.filter(b => b.status === 'CONFIRMED' || b.status === 'ACCEPTED').length
          if (pendingList.length > 0 && confirmedCount === 0) {
            setActiveTab('pending')
          }
        } else if (appsRes) {
          console.error('Applications fetch failed:', appsRes.status, await appsRes.text().catch(() => ''))
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [getToken])

  // ── Helper: format a booking from API shape into display shape ──
  const formatBooking = (b) => {
    const d = new Date(b.shift.date)
    const day = d.getDate()
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase()
    const firstName = b.provider?.user?.firstName || ''
    const lastName = b.provider?.user?.lastName || ''
    const name = `${firstName} ${lastName}`.trim() || 'Unknown'
    const time = `${b.shift.startTime} – ${b.shift.endTime}`
    const rate = `$${b.shift.hourlyRate}/hr`
    const hasReview = b.reviews && b.reviews.length > 0

    let type = 'confirmed'
    let status = ''
    let statusColor = ''
    if (b.status === 'CONFIRMED' || b.status === 'ACCEPTED') {
      type = 'confirmed'
    } else if (b.status === 'PENDING') {
      type = 'pending'
    } else if (b.status === 'COMPLETED') {
      type = 'past'
      status = 'Completed'
      statusColor = 'bg-[#f3f4f6] text-[#6b7280]'
    } else if (b.status === 'CANCELLED') {
      type = 'past'
      status = 'Cancelled'
      statusColor = 'bg-[#fef2f2] text-[#dc2626]'
    }

    return {
      id: b.id,
      day,
      month,
      fullDate: d,
      role: b.shift.role,
      time,
      rate,
      name,
      firstName,
      lastName,
      type,
      status,
      statusColor,
      hasReview,
      providerId: b.providerId,
      shiftId: b.shiftId,
    }
  }

  // ── Group pending applications by shift (rapid fill = 1 shift, multiple providers) ──
  const buildPendingGroups = () => {
    const byShift = {}
    pendingApps.forEach(a => {
      const shift = a.shift || {}
      const key = a.shiftId
      if (!byShift[key]) {
        const d = shift.date ? new Date(shift.date) : new Date()
        byShift[key] = {
          id: key,
          day: d.getDate(),
          month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
          fullDate: d,
          role: shift.role || '',
          time: shift.startTime && shift.endTime ? `${shift.startTime} – ${shift.endTime}` : '',
          rate: shift.hourlyRate ? `$${shift.hourlyRate}/hr` : '',
          type: 'pending',
          isRapidFill: shift.isRapidFill || false,
          providers: [],
          appIds: [],
        }
      }
      const prov = a.provider || {}
      const u = prov.user || {}
      const firstName = u.firstName || ''
      const lastName = u.lastName || ''
      byShift[key].providers.push({
        id: a.providerId,
        appId: a.id,
        name: `${firstName} ${lastName}`.trim() || 'Unknown',
        firstName,
      })
      byShift[key].appIds.push(a.id)
    })
    return Object.values(byShift)
  }

  // ── Derive lists from bookings + applications ──
  const allFormatted = bookings.map(formatBooking)
  const upcoming = allFormatted.filter(s => s.type === 'confirmed')
  const pendingFromBookings = allFormatted.filter(s => s.type === 'pending')
  const pendingGroups = buildPendingGroups()
  const pending = [...pendingFromBookings, ...pendingGroups]
  const past = allFormatted.filter(s => s.type === 'past')
  const allShifts = [...upcoming, ...pending, ...past]

  const withdrawApp = async (shift) => {
    try {
      const token = await getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      // If this is a grouped pending (rapid fill or single), withdraw all applications for this shift
      const appIds = shift.appIds || [shift.id]
      await Promise.all(
        appIds.map(appId =>
          fetch(`${API_URL}/api/applications/${appId}`, {
            method: 'PATCH', headers,
            body: JSON.stringify({ status: 'WITHDRAWN' }),
          })
        )
      )
      setWithdrawn(prev => ({ ...prev, [shift.id]: true }))
      setPendingApps(prev => prev.filter(a => !appIds.includes(a.id)))
      const provCount = shift.providers?.length || 1
      showToast(provCount > 1 ? `Rapid Fill withdrawn (${provCount} providers)` : `Invite withdrawn`)
    } catch { showToast('Failed to withdraw invite') }
  }

  const getShiftsForDay = (day) => allShifts.filter(s => s.day === day)

  const filteredPast = past.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  )

  const sortedPast = [...filteredPast].sort((a, b) => {
    if (sortBy === 'Most recent') return b.fullDate - a.fullDate
    if (sortBy === 'Oldest first') return a.fullDate - b.fullDate
    return 0
  })

  const getShiftBadgeStyle = (type, status) => {
    if (type === 'confirmed') return 'bg-[#e8f5f0] text-[#1a7f5e]'
    if (type === 'pending') return 'bg-[#fef3c7] text-[#92400e]'
    if (type === 'past' && status === 'Completed') return 'bg-[#f3f4f6] text-[#6b7280]'
    if (type === 'past' && status === 'Cancelled') return 'bg-[#fef2f2] text-[#dc2626]'
    return 'bg-[#f3f4f6] text-[#6b7280]'
  }

  // ── Cancel booking via API ──
  const handleCancelBooking = async (shift) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/bookings/${shift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'CANCELLED' })
      })
      if (res.ok) {
        setBookings(prev => prev.map(b => b.id === shift.id ? { ...b, status: 'CANCELLED' } : b))
        setCancelled(prev => ({ ...prev, [shift.id]: true }))
        showToast(`Shift with ${shift.name} cancelled`)
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err)
      showToast('Failed to cancel shift')
    }
  }

  // ── Submit review via API ──
  const handleSubmitReview = async (shift) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bookingId: shift.id,
          providerId: shift.providerId,
          rating: reviewRating,
          tags: selectedTags,
          comment: reviewText,
        })
      })
      if (res.ok) {
        setReviewed(prev => ({ ...prev, [shift.id]: true }))
        showToast(`Review submitted for ${shift.name}!`)
      }
    } catch (err) {
      console.error('Failed to submit review:', err)
      showToast('Failed to submit review')
    } finally {
      setShowReviewModal(null)
      setReviewText('')
      setReviewRating(5)
      setSelectedTags([])
    }
  }

  // ── Active counts (excluding cancelled/withdrawn) ──
  const activeUpcoming = upcoming.filter(s => !cancelled[s.id])
  const activePending = pending.filter(s => !withdrawn[s.id])

  // ── Empty state component ──
  const EmptyState = ({ icon, title, sub, action }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#f1f9f5] flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[17px] text-[#1a1a1a] mb-2" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{title}</p>
      <p className="text-[14px] text-[#8a8a8a] leading-relaxed mb-6 max-w-[280px]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{sub}</p>
      {action}
    </div>
  )

  // ── Loading skeleton ──
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white p-5 flex items-center gap-5 animate-pulse" style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
          <div className="w-14 h-[60px] rounded-xl bg-[#f3f3f3]"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-[#f3f3f3] rounded w-1/3"></div>
            <div className="h-3 bg-[#f3f3f3] rounded w-1/2"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#f3f3f3]"></div>
              <div className="h-3 bg-[#f3f3f3] rounded w-20"></div>
            </div>
          </div>
          <div className="w-20 h-9 bg-[#f3f3f3] rounded-full"></div>
        </div>
      ))}
    </div>
  )

  // ── Global empty state (no bookings at all) ──
  if (!loading && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-[#f9f8f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <Nav />
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-[24px] text-[#1a1a1a] mb-1" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>Bookings</h1>
              <p className="text-[13px] text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>All your shifts and job placements in one place.</p>
            </div>
          </div>
          <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
            <div className="w-14 h-14 rounded-full bg-[#f1f9f5] flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p className="text-[16px] text-[#1a1a1a] mb-1" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>No bookings yet</p>
            <p className="text-[13px] text-[#8a8a8a] mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>Post a shift to get started.</p>
            <button onClick={() => navigate('/post-shift')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white px-5 py-3 rounded-full text-[13px] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Post a shift</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Nav />

      {/* Shift Detail Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:px-4" onClick={() => setShowShiftModal(null)}>
          <div className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-sm overflow-y-auto max-h-[90vh] shadow-[0_2px_8px_rgba(0,0,0,0.04)]" onClick={e => e.stopPropagation()}>
            <div className="bg-[#f9f8f6] px-6 pt-6 pb-4 text-center" style={{ borderBottom: '1px solid #f3f3f3' }}>
              <InitialsAvatar name={showShiftModal.name} size={56} className="mx-auto mb-3 border-4 border-white shadow" />
              <h2 className="text-base text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{showShiftModal.name}</h2>
              <p className="text-xs text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{showShiftModal.role}</p>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8a8a8a] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Date</span>
                  <span className="text-sm text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{showShiftModal.month} {showShiftModal.day}, {showShiftModal.fullDate?.getFullYear()}</span>
                </div>
                <div className="h-px" style={{ background: '#f3f3f3' }}></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8a8a8a] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Time</span>
                  <span className="text-sm text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{showShiftModal.time}</span>
                </div>
                <div className="h-px" style={{ background: '#f3f3f3' }}></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8a8a8a] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Rate</span>
                  <span className="text-sm text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{showShiftModal.rate}</span>
                </div>
                <div className="h-px" style={{ background: '#f3f3f3' }}></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#8a8a8a] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Status</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${getShiftBadgeStyle(showShiftModal.type, showShiftModal.status)}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                    {showShiftModal.type === 'confirmed' ? (
                      <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Confirmed</span>
                    ) : showShiftModal.type === 'pending' ? (
                      <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Pending</span>
                    ) : showShiftModal.status}
                  </span>
                </div>
              </div>
              {showShiftModal.type === 'confirmed' && !cancelled[showShiftModal.id] && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white py-3 rounded-full text-sm transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>View profile</button>
                  <button onClick={() => { handleCancelBooking(showShiftModal); setShowShiftModal(null) }} className="w-full text-red-500 py-3 rounded-full text-sm hover:border-red-400 transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>Cancel shift</button>
                  <button onClick={() => setShowShiftModal(null)} className="w-full text-[#5a5a5a] py-3 rounded-full text-sm hover:border-[#1a7f5e] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>Close</button>
                </div>
              )}
              {showShiftModal.type === 'confirmed' && cancelled[showShiftModal.id] && (
                <div className="flex gap-3">
                  <button onClick={() => setShowShiftModal(null)} className="flex-1 text-[#1a1a1a] py-3 rounded-full text-sm hover:border-[#1a7f5e] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>Close</button>
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white py-3 rounded-full text-sm transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>View profile</button>
                </div>
              )}
              {showShiftModal.type === 'pending' && !withdrawn[showShiftModal.id] && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white py-3 rounded-full text-sm transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>View profile</button>
                  <button onClick={() => { withdrawApp(showShiftModal); setShowShiftModal(null) }} className="w-full text-[#92400e] py-3 rounded-full text-sm hover:border-[#f59e0b] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>Withdraw invite</button>
                  <button onClick={() => setShowShiftModal(null)} className="w-full text-[#5a5a5a] py-3 rounded-full text-sm hover:border-[#1a7f5e] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>Close</button>
                </div>
              )}
              {showShiftModal.type === 'pending' && withdrawn[showShiftModal.id] && (
                <div className="flex gap-3">
                  <button onClick={() => setShowShiftModal(null)} className="flex-1 text-[#1a1a1a] py-3 rounded-full text-sm hover:border-[#1a7f5e] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>Close</button>
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white py-3 rounded-full text-sm transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>View profile</button>
                </div>
              )}
              {showShiftModal.type === 'past' && (
                <div className="flex flex-col gap-2">
                  {showShiftModal.status === 'Completed' && !reviewed[showShiftModal.id] && !showShiftModal.hasReview && (
                    <button onClick={() => { setShowShiftModal(null); setTimeout(() => setShowReviewModal(showShiftModal), 100) }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white py-3 rounded-full text-sm transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Leave a review</button>
                  )}
                  {showShiftModal.status === 'Completed' && (reviewed[showShiftModal.id] || showShiftModal.hasReview) && (
                    <div className="w-full text-center text-xs text-[#1a7f5e] bg-[#f1f9f5] py-3 rounded-full flex items-center justify-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Already reviewed</div>
                  )}
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="w-full text-[#1a1a1a] py-3 rounded-full text-sm hover:border-[#1a7f5e] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>View profile</button>
                  <button onClick={() => setShowShiftModal(null)} className="w-full text-[#5a5a5a] py-3 rounded-full text-sm hover:border-[#1a7f5e] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center sm:px-4">
          <div className="bg-white rounded-t-[28px] sm:rounded-[28px] w-full max-w-md overflow-y-auto max-h-[90vh] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="bg-[#f9f8f6] px-6 pt-6 pb-4 text-center rounded-t-[28px]" style={{ borderBottom: '1px solid #f3f3f3' }}>
              <InitialsAvatar name={showReviewModal.name} size={64} className="mx-auto mb-3 border-4 border-white shadow" />
              <h2 className="text-lg text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{showReviewModal.name}</h2>
              <p className="text-sm text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{showReviewModal.role} · {showReviewModal.month} {showReviewModal.day}, {showReviewModal.fullDate?.getFullYear()}</p>
            </div>
            <div className="px-6 py-5">
              <div className="mb-5">
                <p className="text-sm text-[#1a1a1a] mb-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Overall rating</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setReviewRating(star)} className={`text-3xl transition ${star <= reviewRating ? 'text-[#F97316]' : 'text-[#ececec] hover:text-[#F97316]'}`}>★</button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <p className="text-sm text-[#1a1a1a] mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>What went well?</p>
                <p className="text-xs text-[#8a8a8a] mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {reviewTags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs transition ${selectedTags.includes(tag) ? 'bg-[#1a7f5e] text-white' : 'text-[#5a5a5a] hover:border-[#1a7f5e]'}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, border: selectedTags.includes(tag) ? '1px solid #1a7f5e' : '1px solid #f3f3f3' }}>
                      {selectedTags.includes(tag) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="inline mr-1"><polyline points="20 6 9 17 4 12"/></svg>}{tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-[#1a1a1a] mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Share more details <span className="text-[#8a8a8a]" style={{ fontWeight: 400 }}>(optional)</span></p>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Tell other offices about your experience..." className="w-full px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] resize-none h-24 transition" style={{ fontFamily: "'DM Sans', sans-serif", border: '1px solid #f3f3f3', borderRadius: 16 }} />
              </div>
              <div className="px-4 py-3 mb-5 flex items-start gap-2" style={{ background: '#f9f8f6', borderRadius: 16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-xs text-[#8a8a8a] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>Your review will be visible to other dental offices on kazi. and will contribute to {showReviewModal.name.split(' ')[0]}'s overall rating.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { setShowReviewModal(null); setReviewText(''); setReviewRating(5); setSelectedTags([]) }} className="flex-1 text-[#1a1a1a] py-3 rounded-full text-sm hover:border-[#1a7f5e] transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #f3f3f3' }}>Cancel</button>
                <button onClick={() => handleSubmitReview(showReviewModal)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white py-3 rounded-full text-sm transition" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Submit review</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-[24px] text-[#1a1a1a] mb-1" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>Bookings</h1>
            <p className="text-[13px] text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>{allShifts.length} total shift{allShifts.length !== 1 ? 's' : ''} and placements</p>
          </div>
          <div className="flex rounded-full overflow-hidden bg-white w-full sm:w-auto p-1" style={{ border: '1px solid #f3f3f3' }}>
            <button onClick={() => setView('list')} className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-full transition ${view === 'list' ? 'bg-[#1a7f5e] text-white' : 'bg-transparent text-[#8a8a8a] hover:text-[#5a5a5a]'}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              List
            </button>
            <button onClick={() => setView('calendar')} className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-full transition ${view === 'calendar' ? 'bg-[#1a7f5e] text-white' : 'bg-transparent text-[#8a8a8a] hover:text-[#5a5a5a]'}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Calendar
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {view === 'calendar' && (
              <div className="bg-white p-4 sm:p-6 mb-6 max-w-[600px] mx-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
                <div className="flex items-center justify-between mb-4">
                  <button className="text-xl text-[#8a8a8a] px-2 hover:text-[#1a1a1a]">‹</button>
                  <p className="text-base text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>March 2026</p>
                  <button className="text-xl text-[#8a8a8a] px-2 hover:text-[#1a1a1a]">›</button>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#1a7f5e]"></div><span className="text-xs text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Confirmed</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div><span className="text-xs text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Pending</span></div>
                  <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#8a8a8a]"></div><span className="text-xs text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Past</span></div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['SU','MO','TU','WE','TH','FR','SA'].map(d => (
                    <div key={d} className="text-center text-xs text-[#8a8a8a] py-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                    const dayShifts = getShiftsForDay(day)
                    const hasShifts = dayShifts.length > 0
                    return (
                      <div key={day} className="transition min-h-[64px] p-1" style={{ borderRadius: 12, border: hasShifts ? '1px solid #f3f3f3' : '1px solid transparent', background: hasShifts ? '#fff' : 'transparent' }}>
                        <div className={`text-center text-xs py-0.5 rounded-lg mb-1`} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: hasShifts ? '#1a1a1a' : '#8a8a8a' }}>{day}</div>
                        {dayShifts.map(shift => (
                          <div key={shift.id} onClick={() => setShowShiftModal(shift)} className={`text-[9px] px-1 py-0.5 rounded-md mb-0.5 cursor-pointer truncate leading-tight hover:opacity-80 transition ${getShiftBadgeStyle(shift.type, shift.status)}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                            {shift.name.split(' ')[0]}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {view === 'list' && (
              <>
                <div className="flex gap-2 mb-7 mt-5 overflow-x-auto whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
                  {[
                    { id: 'upcoming', label: 'Upcoming', count: activeUpcoming.length },
                    { id: 'pending', label: 'Pending', count: activePending.length },
                    { id: 'past', label: 'Past shifts', count: past.length },
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 sm:px-5 py-2.5 text-[13px] rounded-full transition flex-shrink-0 flex items-center gap-1.5 ${activeTab === tab.id ? 'bg-[#1a7f5e] text-white' : 'bg-transparent text-[#8a8a8a] hover:text-[#5a5a5a] hover:bg-[#f3f3f3]'}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                      {tab.label}
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[#f3f3f3] text-[#8a8a8a]'}`} style={{ fontWeight: 700 }}>{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* ── UPCOMING TAB ── */}
                {activeTab === 'upcoming' && (
                  <div>
                    {activeUpcoming.length === 0 ? (
                      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
                        <EmptyState
                          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                          title="No upcoming shifts"
                          sub="You don't have any confirmed shifts yet. Post a shift or invite a professional to get started."
                          action={
                            <button onClick={() => navigate('/post-shift')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white px-6 py-3 rounded-full text-sm transition flex items-center gap-2 mx-auto" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Post a shift
                            </button>
                          }
                        />
                      </div>
                    ) : (
                      upcoming.map(shift => (
                        <div key={shift.id} className={`bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 mb-3 transition shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${cancelled[shift.id] ? 'opacity-50' : ''}`} style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
                          <div className="flex items-start gap-4 sm:contents">
                          <div className="w-14 h-[60px] rounded-xl bg-[#f1f9f5] flex flex-col items-center justify-center flex-shrink-0" style={{ border: '1px solid #e8f3ee' }}>
                            <span className="text-[22px] leading-none text-[#1a7f5e]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{shift.day}</span>
                            <span className="text-[11px] tracking-wider uppercase mt-0.5 text-[#1a7f5e]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{shift.month}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-base text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{shift.role}</span>
                              {cancelled[shift.id] ? (
                                <span className="bg-red-50 text-red-400 text-xs px-2.5 py-0.5 rounded-full" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Cancelled</span>
                              ) : (
                                <span className="bg-[#f1f9f5] text-[#1a7f5e] text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Confirmed</span>
                              )}
                            </div>
                            <div className="flex gap-4 mb-2">
                              <span className="text-[13px] text-[#5a5a5a] flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                {shift.time}
                              </span>
                              <span className="text-[13px] text-[#5a5a5a] flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                {shift.rate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <InitialsAvatar name={shift.name} size={28} />
                              <span className="text-[14px] text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{shift.name}</span>
                            </div>
                          </div>
                          </div>
                          {!cancelled[shift.id] ? (
                            <button onClick={() => handleCancelBooking(shift)} className="text-[#1a1a1a] text-[13px] px-4 py-3 sm:py-2 rounded-full hover:border-red-500 hover:text-red-500 transition whitespace-nowrap w-full sm:w-auto sm:flex-shrink-0" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, border: '1.5px solid #f3f3f3' }}>Cancel</button>
                          ) : (
                            <div className="hidden sm:block sm:w-[80px] sm:flex-shrink-0"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── PENDING TAB ── */}
                {activeTab === 'pending' && (
                  <div>
                    {activePending.length === 0 ? (
                      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
                        <EmptyState
                          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                          title="No pending invites"
                          sub="You haven't sent any shift invites yet. Find a professional and invite them to your next shift."
                          action={
                            <button onClick={() => navigate('/professionals')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white px-6 py-3 rounded-full text-sm transition flex items-center gap-2 mx-auto" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                              Browse professionals
                            </button>
                          }
                        />
                      </div>
                    ) : (
                      pending.map(shift => (
                        <div key={shift.id} className={`bg-white p-4 sm:p-5 mb-3 transition shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${withdrawn[shift.id] ? 'opacity-50' : ''}`} style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-[60px] rounded-xl bg-[#fef3c7] flex flex-col items-center justify-center flex-shrink-0" style={{ border: '1px solid #fde68a' }}>
                              <span className="text-[22px] leading-none text-[#92400e]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{shift.day}</span>
                              <span className="text-[11px] tracking-wider uppercase mt-0.5 text-[#92400e]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{shift.month}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-base text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{shift.role}</span>
                                {withdrawn[shift.id] ? (
                                  <span className="bg-[#f3f3f3] text-[#8a8a8a] text-xs px-2.5 py-0.5 rounded-full" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Withdrawn</span>
                                ) : (
                                  <span className="bg-[#fef3c7] text-[#92400e] text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Awaiting response</span>
                                )}
                                {shift.isRapidFill && (
                                  <span className="bg-[#f1f9f5] text-[#1a7f5e] text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #e8f3ee' }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                    Rapid Fill
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-4 mb-2.5">
                                <span className="text-[13px] text-[#5a5a5a] flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  {shift.time}
                                </span>
                                <span className="text-[13px] text-[#5a5a5a] flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                  {shift.rate}
                                </span>
                              </div>
                              {/* Provider(s) */}
                              {shift.providers ? (
                                <div>
                                  <p className="text-[11px] text-[#8a8a8a] uppercase tracking-wider mb-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                                    Sent to {shift.providers.length} professional{shift.providers.length !== 1 ? 's' : ''} — first to accept gets the shift
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {shift.providers.map(p => (
                                      <div key={p.id} className="flex items-center gap-2 rounded-full px-2.5 py-1.5" style={{ background: '#f9f8f6', border: '1px solid #f3f3f3' }}>
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]" style={{ background: 'linear-gradient(135deg, #7ab8d4, #88c9a1)', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{p.name.charAt(0)}</div>
                                        <span className="text-[13px] text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{p.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <InitialsAvatar name={shift.name} size={28} />
                                  <span className="text-[14px] text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{shift.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {!withdrawn[shift.id] && (
                            <div className="mt-3 pt-3 flex justify-end" style={{ borderTop: '1px solid #f3f3f3' }}>
                              <button onClick={() => { withdrawApp(shift) }} className="text-[#1a1a1a] text-[13px] px-4 py-2.5 rounded-full hover:border-[#f59e0b] hover:text-[#92400e] transition whitespace-nowrap" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, border: '1.5px solid #f3f3f3' }}>
                                {shift.providers?.length > 1 ? 'Cancel Rapid Fill' : 'Withdraw invite'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── PAST TAB ── */}
                {activeTab === 'past' && (
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 sm:flex-wrap">
                      <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-full pl-9 pr-4 py-3 sm:py-2.5 text-sm outline-none focus:border-[#1a7f5e]" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9f8f6', border: '1px solid #f3f3f3' }} />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                      <select className="flex-1 sm:flex-initial rounded-full px-3 py-3 sm:py-2.5 text-sm outline-none focus:border-[#1a7f5e] sm:min-w-[130px]" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9f8f6', border: '1px solid #f3f3f3', color: '#5a5a5a' }}>
                        <option>All roles</option>
                        <option>Dental Hygienist</option>
                        <option>Dental Assistant</option>
                        <option>Front Desk / Admin</option>
                      </select>
                      <select className="flex-1 sm:flex-initial rounded-full px-3 py-3 sm:py-2.5 text-sm outline-none focus:border-[#1a7f5e] sm:min-w-[100px]" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f9f8f6', border: '1px solid #f3f3f3', color: '#5a5a5a' }}>
                        <option>All</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                      <button onClick={() => setSearch('')} className="rounded-full px-4 py-3 sm:py-2.5 text-sm text-[#5a5a5a] hover:border-[#1a7f5e] transition" style={{ fontFamily: "'DM Sans', sans-serif", background: '#fff', border: '1px solid #f3f3f3' }}>Clear</button>
                      </div>
                    </div>

                    {sortedPast.length === 0 ? (
                      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
                        <EmptyState
                          icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
                          title={search ? 'No results found' : 'No past shifts yet'}
                          sub={search ? `No shifts match "${search}". Try a different name or role.` : "Your completed and cancelled shifts will appear here after they've passed."}
                          action={
                            search ? (
                              <button onClick={() => setSearch('')} className="text-[#1a1a1a] px-6 py-3 rounded-full text-sm hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition mx-auto" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1.5px solid #f3f3f3' }}>
                                Clear search
                              </button>
                            ) : null
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Showing {sortedPast.length} shifts</span>
                          <div className="relative">
                            <div onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-1 text-sm text-[#8a8a8a] cursor-pointer" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Sort by: <strong className="text-[#1a1a1a] ml-1" style={{ fontWeight: 700 }}>{sortBy}</strong>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                            </div>
                            {showSortMenu && (
                              <div className="absolute right-0 top-7 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] w-40 z-10 overflow-hidden" style={{ border: '1px solid #f3f3f3', borderRadius: 16 }}>
                                {['Most recent','Oldest first'].map(opt => (
                                  <div key={opt} onClick={() => { setSortBy(opt); setShowSortMenu(false) }} className={`px-4 py-3 text-sm cursor-pointer hover:bg-[#f9f8f6]`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: sortBy === opt ? 700 : 400, color: sortBy === opt ? '#1a7f5e' : '#1a1a1a' }}>{opt}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        {sortedPast.map(shift => (
                          <div key={shift.id} className="bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]" style={{ border: '1px solid #f3f3f3', borderRadius: 20 }}>
                            <div className="flex items-start gap-4 sm:contents">
                            <div className={`w-14 h-[60px] rounded-xl flex flex-col items-center justify-center flex-shrink-0`} style={{ background: shift.status === 'Cancelled' ? '#fef2f2' : '#f3f3f3', border: shift.status === 'Cancelled' ? '1px solid #fecaca' : '1px solid #ececec' }}>
                              <span className="text-[22px] leading-none" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: shift.status === 'Cancelled' ? '#dc2626' : '#8a8a8a' }}>{shift.day}</span>
                              <span className="text-[11px] tracking-wider uppercase mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: shift.status === 'Cancelled' ? '#dc2626' : '#8a8a8a' }}>{shift.month}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-base text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{shift.role}</span>
                                <span className={`text-xs px-2.5 py-0.5 rounded-full ${shift.statusColor}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{shift.status}</span>
                              </div>
                              <div className="flex gap-4 mb-2">
                                <span className="text-[13px] text-[#5a5a5a] flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                  {shift.time}
                                </span>
                                <span className="text-[13px] text-[#5a5a5a] flex items-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                  {shift.rate}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <InitialsAvatar name={shift.name} size={28} />
                                <span className="text-[14px] text-[#1a1a1a]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{shift.name}</span>
                                {shift.status === 'Cancelled' && <span className="text-[13px] text-[#8a8a8a]" style={{ fontFamily: "'DM Sans', sans-serif" }}>-- cancelled</span>}
                              </div>
                            </div>
                            </div>
                            {shift.status === 'Completed' && (
                              (reviewed[shift.id] || shift.hasReview) ? (
                                <span className="text-xs text-[#1a7f5e] bg-[#f1f9f5] px-3 py-2 rounded-full whitespace-nowrap text-center w-full sm:w-auto sm:flex-shrink-0 flex items-center justify-center gap-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, border: '1px solid #e8f3ee' }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Reviewed</span>
                              ) : (
                                <button onClick={() => setShowReviewModal(shift)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white text-[13px] px-4 py-3 sm:py-2 rounded-full transition whitespace-nowrap w-full sm:w-auto sm:flex-shrink-0" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Leave review</button>
                              )
                            )}
                            {shift.status === 'Cancelled' && <div className="hidden sm:block sm:w-[120px] sm:flex-shrink-0"></div>}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}
    </div>
  )
}
