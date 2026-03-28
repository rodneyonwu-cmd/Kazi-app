import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Bookings() {
  const navigate = useNavigate()
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

  const profileImages = {
    'Sarah R.': 'https://randomuser.me/api/portraits/women/44.jpg',
    'Devon K.': 'https://randomuser.me/api/portraits/men/41.jpg',
    'Nina P.': 'https://randomuser.me/api/portraits/women/28.jpg',
    'Tara C.': 'https://randomuser.me/api/portraits/women/17.jpg',
    'Aisha L.': 'https://randomuser.me/api/portraits/women/65.jpg',
    'Marcus J.': 'https://randomuser.me/api/portraits/men/32.jpg',
    'Lisa M.': 'https://randomuser.me/api/portraits/women/48.jpg',
  }

  const upcoming = [
    { id: 'u1', day: 17, month: 'MAR', role: 'Dental Hygienist', time: '7:30 AM – 5:00 PM', rate: '$54/hr', name: 'Sarah R.', rating: '⭐ 4.9', bg: '#c8e6c9', type: 'confirmed' },
    { id: 'u2', day: 19, month: 'MAR', role: 'Dental Assistant', time: '8:00 AM – 4:00 PM', rate: '$44/hr', name: 'Tara C.', rating: '⭐ 4.7', bg: '#ffccbc', type: 'confirmed' },
    { id: 'u3', day: 24, month: 'MAR', role: 'Dental Hygienist', time: '7:30 AM – 5:00 PM', rate: '$56/hr', name: 'Nina P.', rating: '⭐ 4.9', bg: '#e1bee7', type: 'confirmed' },
  ]

  const pending = [
    { id: 'p1', day: 20, month: 'MAR', role: 'Dental Hygienist', time: '7:30 AM – 5:00 PM', rate: '$54–$58/hr', name: 'Aisha L.', invited: '4 hrs ago', bg: '#b0bec5', type: 'pending' },
    { id: 'p2', day: 21, month: 'MAR', role: 'Front Desk / Admin', time: '9:00 AM – 3:00 PM', rate: '$35–$40/hr', name: 'Marcus J.', invited: '2 hrs ago', bg: '#d7ccc8', type: 'pending' },
    { id: 'p3', day: 25, month: 'MAR', role: 'Dental Hygienist', time: '7:30 AM – 5:00 PM', rate: '$52–$56/hr', name: 'Lisa M.', invited: '1 hr ago', bg: '#c5cae9', type: 'pending' },
  ]

  const past = [
    { id: 'pa1', day: 14, month: 'MAR', role: 'Dental Hygienist', time: '7:30 AM – 5:00 PM', rate: '$52/hr · $468 total', name: 'Sarah R.', rating: '⭐ 4.9', bg: '#c8e6c9', status: 'Completed', statusColor: 'bg-[#f3f4f6] text-[#6b7280]', type: 'past' },
    { id: 'pa2', day: 10, month: 'MAR', role: 'Dental Assistant', time: '8:00 AM – 4:00 PM', rate: '$42/hr · $336 total', name: 'Devon K.', rating: '⭐ 4.6', bg: '#546e7a', status: 'Completed', statusColor: 'bg-[#f3f4f6] text-[#6b7280]', type: 'past' },
    { id: 'pa3', day: 5, month: 'MAR', role: 'Dental Hygienist', time: '7:30 AM – 5:00 PM', rate: '$54/hr', name: 'Nina P.', rating: '⭐ 4.9', bg: '#e1bee7', status: 'Cancelled', statusColor: 'bg-[#fef2f2] text-[#dc2626]', cancelledBy: '— cancelled by professional', type: 'past' },
  ]

  const allShifts = [...upcoming, ...pending, ...past]

  const getShiftsForDay = (day) => allShifts.filter(s => s.day === day)

  const filteredPast = past.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase())
  )

  const sortedPast = [...filteredPast].sort((a, b) => {
    if (sortBy === 'Most recent') return b.day - a.day
    if (sortBy === 'Oldest first') return a.day - b.day
    return 0
  })

  const getShiftBadgeStyle = (type, status) => {
    if (type === 'confirmed') return 'bg-[#e8f5f0] text-[#1a7f5e]'
    if (type === 'pending') return 'bg-[#fef3c7] text-[#92400e]'
    if (type === 'past' && status === 'Completed') return 'bg-[#f3f4f6] text-[#6b7280]'
    if (type === 'past' && status === 'Cancelled') return 'bg-[#fef2f2] text-[#dc2626]'
    return 'bg-[#f3f4f6] text-[#6b7280]'
  }

  // ── Active counts (excluding cancelled/withdrawn) ──
  const activeUpcoming = upcoming.filter(s => !cancelled[s.id])
  const activePending = pending.filter(s => !withdrawn[s.id])

  // ── Empty state component ──
  const EmptyState = ({ icon, title, sub, action }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">{title}</p>
      <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6 max-w-[280px]">{sub}</p>
      {action}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {/* Shift Detail Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setShowShiftModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#f9f8f6] px-6 pt-6 pb-4 text-center border-b border-[#e5e7eb]">
              <img src={profileImages[showShiftModal.name] || 'https://randomuser.me/api/portraits/women/44.jpg'} className="w-14 h-14 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow" />
              <h2 className="text-base font-extrabold text-[#1a1a1a]">{showShiftModal.name}</h2>
              <p className="text-xs text-[#6b7280]">{showShiftModal.role}</p>
            </div>
            <div className="px-6 py-5">
              <div className="flex flex-col gap-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Date</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">Mar {showShiftModal.day}, 2026</span>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Time</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{showShiftModal.time}</span>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Rate</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{showShiftModal.rate}</span>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Status</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getShiftBadgeStyle(showShiftModal.type, showShiftModal.status)}`}>
                    {showShiftModal.type === 'confirmed' ? '✓ Confirmed' : showShiftModal.type === 'pending' ? '⏱ Pending' : showShiftModal.status}
                  </span>
                </div>
                {showShiftModal.rating && (
                  <>
                    <div className="h-px bg-[#e5e7eb]"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest">Rating</span>
                      <span className="text-sm font-bold text-[#1a1a1a]">{showShiftModal.rating}</span>
                    </div>
                  </>
                )}
              </div>
              {showShiftModal.type === 'confirmed' && !cancelled[showShiftModal.id] && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition">View profile</button>
                  <button onClick={() => { setCancelled(prev => ({ ...prev, [showShiftModal.id]: true })); setShowShiftModal(null); showToast(`Shift with ${showShiftModal.name} cancelled`) }} className="w-full border border-[#e5e7eb] text-red-500 font-bold py-2.5 rounded-full text-sm hover:border-red-400 transition">Cancel shift</button>
                  <button onClick={() => setShowShiftModal(null)} className="w-full border border-[#e5e7eb] text-[#6b7280] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">Close</button>
                </div>
              )}
              {showShiftModal.type === 'confirmed' && cancelled[showShiftModal.id] && (
                <div className="flex gap-3">
                  <button onClick={() => setShowShiftModal(null)} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">Close</button>
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition">View profile</button>
                </div>
              )}
              {showShiftModal.type === 'pending' && !withdrawn[showShiftModal.id] && (
                <div className="flex flex-col gap-2">
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition">View profile</button>
                  <button onClick={() => { setWithdrawn(prev => ({ ...prev, [showShiftModal.id]: true })); setShowShiftModal(null); showToast(`Invite to ${showShiftModal.name} withdrawn`) }} className="w-full border border-[#e5e7eb] text-[#92400e] font-bold py-2.5 rounded-full text-sm hover:border-[#f59e0b] transition">Withdraw invite</button>
                  <button onClick={() => setShowShiftModal(null)} className="w-full border border-[#e5e7eb] text-[#6b7280] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">Close</button>
                </div>
              )}
              {showShiftModal.type === 'pending' && withdrawn[showShiftModal.id] && (
                <div className="flex gap-3">
                  <button onClick={() => setShowShiftModal(null)} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">Close</button>
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition">View profile</button>
                </div>
              )}
              {showShiftModal.type === 'past' && (
                <div className="flex flex-col gap-2">
                  {showShiftModal.status === 'Completed' && !reviewed[showShiftModal.id] && (
                    <button onClick={() => { setShowShiftModal(null); setTimeout(() => setShowReviewModal(showShiftModal), 100) }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition">Leave a review</button>
                  )}
                  {showShiftModal.status === 'Completed' && reviewed[showShiftModal.id] && (
                    <div className="w-full text-center text-xs font-bold text-[#1a7f5e] bg-[#e8f5f0] py-2.5 rounded-full">✓ Already reviewed</div>
                  )}
                  <button onClick={() => { navigate('/profile'); setShowShiftModal(null) }} className="w-full border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">View profile</button>
                  <button onClick={() => setShowShiftModal(null)} className="w-full border border-[#e5e7eb] text-[#6b7280] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">Close</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-y-auto max-h-[85vh]">
            <div className="bg-[#f9f8f6] px-6 pt-6 pb-4 text-center border-b border-[#e5e7eb]">
              <img src={profileImages[showReviewModal.name] || 'https://randomuser.me/api/portraits/women/44.jpg'} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow" />
              <h2 className="text-lg font-extrabold text-[#1a1a1a]">{showReviewModal.name}</h2>
              <p className="text-sm text-[#6b7280]">{showReviewModal.role} · Mar {showReviewModal.day}, 2026</p>
            </div>
            <div className="px-6 py-5">
              <div className="mb-5">
                <p className="text-sm font-bold text-[#1a1a1a] mb-2">Overall rating</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => setReviewRating(star)} className={`text-3xl transition ${star <= reviewRating ? 'text-[#F97316]' : 'text-[#e5e7eb] hover:text-[#F97316]'}`}>★</button>
                  ))}
                </div>
              </div>
              <div className="mb-5">
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">What went well?</p>
                <p className="text-xs text-[#9ca3af] mb-3">Select all that apply</p>
                <div className="flex flex-wrap gap-2">
                  {reviewTags.map(tag => (
                    <button key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${selectedTags.includes(tag) ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}>
                      {selectedTags.includes(tag) ? '✓ ' : ''}{tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">Share more details <span className="text-[#9ca3af] font-normal">(optional)</span></p>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Tell other offices about your experience..." className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] resize-none h-24 transition" />
              </div>
              <div className="bg-[#f9f8f6] rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-xs text-[#9ca3af] leading-relaxed">Your review will be visible to other dental offices on kazi. and will contribute to {showReviewModal.name.split(' ')[0]}'s overall rating.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowReviewModal(null); setReviewText(''); setReviewRating(5); setSelectedTags([]) }} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">Cancel</button>
                <button onClick={() => { setReviewed(prev => ({ ...prev, [showReviewModal.id]: true })); setShowReviewModal(null); setReviewText(''); setReviewRating(5); setSelectedTags([]); showToast(`Review submitted for ${showReviewModal.name}!`) }} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">Submit review</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[720px] mx-auto px-6 py-8">

        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-[28px] font-extrabold text-[#1a1a1a] mb-1">Bookings</h1>
            <p className="text-[15px] text-[#6b7280]">All your shifts and job placements in one place.</p>
          </div>
          <div className="flex border border-[#e5e7eb] rounded-lg overflow-hidden bg-white">
            <button onClick={() => setView('list')} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition ${view === 'list' ? 'bg-[#1a7f5e] text-white' : 'bg-white text-[#6b7280] hover:bg-[#f9f8f6]'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              List
            </button>
            <button onClick={() => setView('calendar')} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition ${view === 'calendar' ? 'bg-[#1a7f5e] text-white' : 'bg-white text-[#6b7280] hover:bg-[#f9f8f6]'}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Calendar
            </button>
          </div>
        </div>

        {view === 'calendar' && (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-6 max-w-[600px] mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button className="text-xl text-[#6b7280] px-2 hover:text-[#1a1a1a]">‹</button>
              <p className="text-base font-extrabold text-[#1a1a1a]">March 2026</p>
              <button className="text-xl text-[#6b7280] px-2 hover:text-[#1a1a1a]">›</button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#1a7f5e]"></div><span className="text-xs text-[#6b7280]">Confirmed</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div><span className="text-xs text-[#6b7280]">Pending</span></div>
              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#9ca3af]"></div><span className="text-xs text-[#6b7280]">Past</span></div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['SU','MO','TU','WE','TH','FR','SA'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-[#9ca3af] py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const dayShifts = getShiftsForDay(day)
                const hasShifts = dayShifts.length > 0
                return (
                  <div key={day} className={`rounded-xl border transition min-h-[64px] p-1 ${hasShifts ? 'border-[#e5e7eb] bg-white' : 'border-transparent'}`}>
                    <div className={`text-center text-xs font-bold py-0.5 rounded-lg mb-1 ${hasShifts ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'}`}>{day}</div>
                    {dayShifts.map(shift => (
                      <div key={shift.id} onClick={() => setShowShiftModal(shift)} className={`text-[9px] font-bold px-1 py-0.5 rounded-md mb-0.5 cursor-pointer truncate leading-tight hover:opacity-80 transition ${getShiftBadgeStyle(shift.type, shift.status)}`}>
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
            <div className="flex border-b border-[#e5e7eb] mb-7 mt-5">
              {[
                { id: 'upcoming', label: 'Upcoming', count: activeUpcoming.length },
                { id: 'pending', label: 'Pending', count: activePending.length },
                { id: 'past', label: 'Past shifts', count: past.length },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-5 py-3 text-[15px] font-medium border-b-2 transition -mb-px ${activeTab === tab.id ? 'border-[#1a7f5e] text-[#1a7f5e] font-semibold' : 'border-transparent text-[#9ca3af] hover:text-[#1a1a1a]'}`}>
                  {tab.label} <span className="text-[13px]">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* ── UPCOMING TAB ── */}
            {activeTab === 'upcoming' && (
              <div>
                {activeUpcoming.length === 0 ? (
                  <div className="bg-white border border-[#e5e7eb] rounded-2xl">
                    <EmptyState
                      icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                      title="No upcoming shifts"
                      sub="You don't have any confirmed shifts yet. Post a shift or invite a professional to get started."
                      action={
                        <button onClick={() => navigate('/post-shift')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition flex items-center gap-2 mx-auto">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                          Post a shift
                        </button>
                      }
                    />
                  </div>
                ) : (
                  upcoming.map(shift => (
                    <div key={shift.id} className={`bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center gap-5 mb-3 transition ${cancelled[shift.id] ? 'opacity-50' : ''}`}>
                      <div className="w-14 h-[60px] rounded-xl bg-[#e8f5f0] text-[#1a7f5e] flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[22px] font-extrabold leading-none">{shift.day}</span>
                        <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">{shift.month}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-base font-bold text-[#1a1a1a]">{shift.role}</span>
                          {cancelled[shift.id] ? (
                            <span className="bg-red-50 text-red-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">Cancelled</span>
                          ) : (
                            <span className="bg-[#e8f5f0] text-[#1a7f5e] text-xs font-semibold px-2.5 py-0.5 rounded-full">✓ Confirmed</span>
                          )}
                        </div>
                        <div className="flex gap-4 mb-2">
                          <span className="text-[13px] text-[#6b7280] flex items-center gap-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {shift.time}
                          </span>
                          <span className="text-[13px] text-[#6b7280] flex items-center gap-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            {shift.rate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: shift.bg }}></div>
                          <span className="text-[14px] font-semibold text-[#1a1a1a]">{shift.name}</span>
                          <span className="text-[13px] text-[#f59e0b]">{shift.rating}</span>
                        </div>
                      </div>
                      {!cancelled[shift.id] ? (
                        <button onClick={() => { setCancelled(prev => ({ ...prev, [shift.id]: true })); showToast(`Shift with ${shift.name} cancelled`) }} className="border-[1.5px] border-[#e5e7eb] text-[#1a1a1a] text-[13px] font-medium px-4 py-2 rounded-full hover:border-red-500 hover:text-red-500 transition whitespace-nowrap flex-shrink-0">Cancel</button>
                      ) : (
                        <div className="w-[80px] flex-shrink-0"></div>
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
                  <div className="bg-white border border-[#e5e7eb] rounded-2xl">
                    <EmptyState
                      icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                      title="No pending invites"
                      sub="You haven't sent any shift invites yet. Find a professional and invite them to your next shift."
                      action={
                        <button onClick={() => navigate('/professionals')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition flex items-center gap-2 mx-auto">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          Browse professionals
                        </button>
                      }
                    />
                  </div>
                ) : (
                  pending.map(shift => (
                    <div key={shift.id} className={`bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center gap-5 mb-3 transition ${withdrawn[shift.id] ? 'opacity-50' : ''}`}>
                      <div className="w-14 h-[60px] rounded-xl bg-[#fef3c7] text-[#92400e] flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-[22px] font-extrabold leading-none">{shift.day}</span>
                        <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">{shift.month}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-base font-bold text-[#1a1a1a]">{shift.role}</span>
                          {withdrawn[shift.id] ? (
                            <span className="bg-[#f3f4f6] text-[#6b7280] text-xs font-semibold px-2.5 py-0.5 rounded-full">Withdrawn</span>
                          ) : (
                            <span className="bg-[#fef3c7] text-[#92400e] text-xs font-semibold px-2.5 py-0.5 rounded-full">⏱ Awaiting response</span>
                          )}
                        </div>
                        <div className="flex gap-4 mb-2">
                          <span className="text-[13px] text-[#6b7280] flex items-center gap-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {shift.time}
                          </span>
                          <span className="text-[13px] text-[#6b7280] flex items-center gap-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                            {shift.rate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: shift.bg }}></div>
                          <span className="text-[14px] font-semibold text-[#1a1a1a]">{shift.name}</span>
                          <span className="text-[13px] text-[#9ca3af]">— invited {shift.invited}</span>
                        </div>
                      </div>
                      {!withdrawn[shift.id] ? (
                        <button onClick={() => { setWithdrawn(prev => ({ ...prev, [shift.id]: true })); showToast(`Invite to ${shift.name} withdrawn`) }} className="border-[1.5px] border-[#e5e7eb] text-[#1a1a1a] text-[13px] font-medium px-4 py-2 rounded-full hover:border-[#f59e0b] hover:text-[#92400e] transition whitespace-nowrap flex-shrink-0">Withdraw invite</button>
                      ) : (
                        <div className="w-[120px] flex-shrink-0"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── PAST TAB ── */}
            {activeTab === 'past' && (
              <div>
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="e.g. Sarah R." value={search} onChange={e => setSearch(e.target.value)} className="w-full border border-[#e5e7eb] rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white" />
                  </div>
                  <select className="border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-[#1a7f5e] min-w-[130px]">
                    <option>All roles</option>
                    <option>Dental Hygienist</option>
                    <option>Dental Assistant</option>
                    <option>Front Desk / Admin</option>
                  </select>
                  <select className="border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-sm bg-white outline-none focus:border-[#1a7f5e] min-w-[100px]">
                    <option>All</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                  <button onClick={() => setSearch('')} className="border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm bg-white text-[#6b7280] hover:border-[#1a7f5e] transition">Clear</button>
                </div>

                {sortedPast.length === 0 ? (
                  <div className="bg-white border border-[#e5e7eb] rounded-2xl">
                    <EmptyState
                      icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
                      title={search ? 'No results found' : 'No past shifts yet'}
                      sub={search ? `No shifts match "${search}". Try a different name or role.` : "Your completed and cancelled shifts will appear here after they've passed."}
                      action={
                        search ? (
                          <button onClick={() => setSearch('')} className="border-[1.5px] border-[#e5e7eb] text-[#374151] font-bold px-6 py-2.5 rounded-full text-sm hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition mx-auto">
                            Clear search
                          </button>
                        ) : null
                      }
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-[#6b7280]">Showing {sortedPast.length} shifts</span>
                      <div className="relative">
                        <div onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-1 text-sm text-[#6b7280] cursor-pointer">
                          Sort by: <strong className="text-[#1a1a1a] ml-1">{sortBy}</strong>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                        </div>
                        {showSortMenu && (
                          <div className="absolute right-0 top-7 bg-white border border-[#e5e7eb] rounded-xl shadow-lg w-40 z-10 overflow-hidden">
                            {['Most recent','Oldest first'].map(opt => (
                              <div key={opt} onClick={() => { setSortBy(opt); setShowSortMenu(false) }} className={`px-4 py-3 text-sm cursor-pointer hover:bg-[#f9f8f6] ${sortBy === opt ? 'font-bold text-[#1a7f5e]' : 'text-[#1a1a1a]'}`}>{opt}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {sortedPast.map(shift => (
                      <div key={shift.id} className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center gap-5 mb-3">
                        <div className={`w-14 h-[60px] rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${shift.status === 'Cancelled' ? 'bg-[#fef2f2] text-[#dc2626]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                          <span className="text-[22px] font-extrabold leading-none">{shift.day}</span>
                          <span className="text-[11px] font-bold tracking-wider uppercase mt-0.5">{shift.month}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-base font-bold text-[#1a1a1a]">{shift.role}</span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${shift.statusColor}`}>{shift.status}</span>
                          </div>
                          <div className="flex gap-4 mb-2">
                            <span className="text-[13px] text-[#6b7280] flex items-center gap-1">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              {shift.time}
                            </span>
                            <span className="text-[13px] text-[#6b7280] flex items-center gap-1">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                              {shift.rate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: shift.bg }}></div>
                            <span className="text-[14px] font-semibold text-[#1a1a1a]">{shift.name}</span>
                            <span className="text-[13px] text-[#f59e0b]">{shift.rating}</span>
                            {shift.cancelledBy && <span className="text-[13px] text-[#9ca3af]">{shift.cancelledBy}</span>}
                          </div>
                        </div>
                        {shift.status === 'Completed' && (
                          reviewed[shift.id] ? (
                            <span className="text-xs font-bold text-[#1a7f5e] bg-[#e8f5f0] px-3 py-2 rounded-full whitespace-nowrap flex-shrink-0">✓ Reviewed</span>
                          ) : (
                            <button onClick={() => setShowReviewModal(shift)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white text-[13px] font-semibold px-4 py-2 rounded-full transition whitespace-nowrap flex-shrink-0">Leave review</button>
                          )
                        )}
                        {shift.status === 'Cancelled' && <div className="w-[120px] flex-shrink-0"></div>}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
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
