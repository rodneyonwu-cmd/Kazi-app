import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Profile() {
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState(null)
  const [showBookForm, setShowBookForm] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showRapidFill, setShowRapidFill] = useState(false)
  const [toast, setToast] = useState(null)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [reviewTab, setReviewTab] = useState('All (5)')
  const [rapidFillSelected, setRapidFillSelected] = useState([])
  const [rapidFillSubmitted, setRapidFillSubmitted] = useState(false)
  const [rfFilter, setRfFilter] = useState('All')
  const [rfSort, setRfSort] = useState('Best match')
  const [expandedPro, setExpandedPro] = useState(null)

  const availableDays = [16, 17, 19, 20, 23, 24, 26, 27, 30, 31]
  const bookedDays = [18, 21, 25]

  const rapidFillPros = [
    { id: 'aisha', name: 'Aisha L.', role: 'Dental Hygienist', rate: '$58/hr', reliability: 94, rating: 5.0, reviews: 63, responseTime: '< 1 hr', lastLogin: 'Today', about: 'Periodontal specialist with 15 years of clinical experience. Precision scaling, advanced perio therapy, and exceptional patient communication every shift.', img: 'https://randomuser.me/api/portraits/women/65.jpg' },
    { id: 'nina', name: 'Nina P.', role: 'Dental Hygienist', rate: '$54/hr', reliability: 86, rating: 4.9, reviews: 52, responseTime: '< 2 hrs', lastLogin: 'Today', about: 'Friendly hygienist with 8 years of experience across general practices. Strong patient education skills and comfortable in fast-paced environments.', img: 'https://randomuser.me/api/portraits/women/28.jpg' },
    { id: 'rachel', name: 'Rachel M.', role: 'Dental Hygienist', rate: '$72/hr', reliability: 99, rating: 4.9, reviews: 71, responseTime: '< 1 hr', lastLogin: 'Today', about: '12 years in general and specialty practices. Highly proficient in Eaglesoft, excellent chairside manner, and consistent 5-star reviews from every office.', img: 'https://randomuser.me/api/portraits/women/55.jpg' },
    { id: 'lisa', name: 'Lisa M.', role: 'Dental Hygienist', rate: '$62/hr', reliability: 93, rating: 4.9, reviews: 39, responseTime: '< 3 hrs', lastLogin: 'Yesterday', about: 'Detail-oriented hygienist focused on preventive care. Experienced with Eaglesoft and Dentrix. Flexible schedule and always on time.', img: 'https://randomuser.me/api/portraits/women/48.jpg' },
    { id: 'tara', name: 'Tara C.', role: 'Dental Hygienist', rate: '$44/hr', reliability: 98, rating: 4.7, reviews: 34, responseTime: '< 2 hrs', lastLogin: 'Yesterday', about: 'Reliable and thorough with strong patient rapport. Great in busy general practices and comfortable with pediatric patients as well.', img: 'https://randomuser.me/api/portraits/women/17.jpg' },
    { id: 'emily', name: 'Emily S.', role: 'Dental Hygienist', rate: '$78/hr', reliability: 68, rating: 5.0, reviews: 82, responseTime: '< 4 hrs', lastLogin: '2 days ago', about: 'Treatment-focused hygienist with a talent for difficult perio cases. Strong communicator with patients and doctors alike.', img: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { id: 'james', name: 'James T.', role: 'Dental Hygienist', rate: '$75/hr', reliability: 91, rating: 4.8, reviews: 55, responseTime: '< 2 hrs', lastLogin: '1 day ago', about: 'Experienced hygienist who thrives in collaborative team environments. Proficient in multiple software platforms and open to same-day bookings.', img: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { id: 'marcus', name: 'Marcus J.', role: 'Dental Hygienist', rate: '$48/hr', reliability: 73, rating: 4.8, reviews: 41, responseTime: '< 3 hrs', lastLogin: '1 day ago', about: 'Reliable hygienist with 8 years across general and pediatric dentistry. Proficient in Dentrix and Open Dental.', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 'devon', name: 'Devon K.', role: 'Dental Hygienist', rate: '$40/hr', reliability: 84, rating: 4.6, reviews: 28, responseTime: '< 5 hrs', lastLogin: '2 days ago', about: 'Up-and-coming hygienist with strong fundamentals. Good patient communication and always eager to learn from experienced teams.', img: 'https://randomuser.me/api/portraits/men/41.jpg' },
  ]

  const getReliabilityColor = (r) => {
    if (r >= 95) return { label: 'Excellent', color: 'text-[#166534]', bg: 'bg-[#dcfce7]' }
    if (r >= 85) return { label: 'Very Good', color: 'text-[#5b21b6]', bg: 'bg-[#ede9fe]' }
    if (r >= 70) return { label: 'Good', color: 'text-[#9a3412]', bg: 'bg-[#ffedd5]' }
    return { label: 'Poor', color: 'text-[#991b1b]', bg: 'bg-[#fee2e2]' }
  }

  const relText = (r) => {
    if (r >= 90) return 'text-[#1a7f5e]'
    if (r >= 75) return 'text-[#f59e0b]'
    return 'text-[#ef4444]'
  }

  const filteredPros = rapidFillPros
    .filter(p => {
      if (rfFilter === 'Top rated') return p.rating >= 4.9
      if (rfFilter === 'High reliability') return p.reliability >= 90
      if (rfFilter === 'Fast response') return p.responseTime === '< 1 hr' || p.responseTime === '< 2 hrs'
      if (rfFilter === 'Active today') return p.lastLogin === 'Today'
      return true
    })
    .sort((a, b) => {
      if (rfSort === 'Highest rated') return b.rating - a.rating
      if (rfSort === 'Most reliable') return b.reliability - a.reliability
      if (rfSort === 'Lowest rate') return parseInt(a.rate) - parseInt(b.rate)
      return b.reliability - a.reliability
    })

  const toggleRapidFill = (id) => {
    if (rapidFillSelected.includes(id)) setRapidFillSelected(prev => prev.filter(x => x !== id))
    else if (rapidFillSelected.length < 9) setRapidFillSelected(prev => [...prev, id])
  }

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const getDayClass = (day) => {
    if (bookedDays.includes(day)) return 'bg-[#fef3c7] text-[#92400e] cursor-not-allowed'
    if (availableDays.includes(day)) return selectedDay === day
      ? 'bg-[#1a7f5e] text-white cursor-pointer'
      : 'bg-[#e8f5f0] text-[#1a7f5e] cursor-pointer hover:bg-[#1a7f5e] hover:text-white'
    return 'text-[#9ca3af]'
  }

  const sarahRel = getReliabilityColor(98)

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Send Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#f9f8f6] px-6 pt-6 pb-4 text-center border-b border-[#e5e7eb]">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-4 border-white shadow" />
              <h2 className="text-lg font-extrabold text-[#1a1a1a]">Send invite to Sarah R.</h2>
              <p className="text-sm text-[#6b7280]">Dental Hygienist</p>
            </div>
            <div className="px-6 py-5">
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Select a shift</label>
                <select className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] bg-white">
                  <option>Dental Hygienist — Mon Mar 17 · 7:30am–5:00pm</option>
                  <option>Dental Hygienist — Wed Mar 19 · 8:00am–4:00pm</option>
                  <option>Dental Hygienist — Fri Mar 21 · 8:00am–12:00pm</option>
                </select>
              </div>
              <div className="mb-5">
                <label className="block text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Note <span className="font-normal normal-case">(optional)</span></label>
                <textarea placeholder="e.g. We'd love to have you back!" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] resize-none h-20 transition" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowInviteModal(false)} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">Cancel</button>
                <button onClick={() => { setShowInviteModal(false); showToast('Invite sent to Sarah R.!') }} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">Send invite</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rapid Fill Modal */}
      {showRapidFill && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl" style={{ maxHeight: '90vh' }}>
            {!rapidFillSubmitted ? (
              <>
                <div className="bg-[#1a7f5e] px-6 py-5 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-white">Rapid Fill ⚡</h2>
                        <p className="text-xs text-white/70">First to accept gets the shift — others are auto-cancelled</p>
                      </div>
                    </div>
                    <button onClick={() => { setShowRapidFill(false); setRapidFillSelected([]) }} className="text-white/60 hover:text-white text-xl transition">✕</button>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                    <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-white/30" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Sarah R.</p>
                      <p className="text-xs text-white/60">$52/hr · 98% reliable · ★ 5.0</p>
                    </div>
                    <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full">✓ Included</span>
                  </div>
                </div>
                <div className="px-6 py-3 border-b border-[#e5e7eb] bg-[#f9f8f6] flex-shrink-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-2 flex-wrap flex-1">
                      {['All', 'Top rated', 'High reliability', 'Fast response', 'Active today'].map(f => (
                        <button key={f} onClick={() => setRfFilter(f)} className={'px-3 py-1 rounded-full text-xs font-semibold border transition ' + (rfFilter === f ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] bg-white hover:border-[#1a7f5e]')}>{f}</button>
                      ))}
                    </div>
                    <select value={rfSort} onChange={e => setRfSort(e.target.value)} className="border border-[#e5e7eb] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#1a7f5e] bg-white flex-shrink-0">
                      <option>Best match</option><option>Highest rated</option><option>Most reliable</option><option>Lowest rate</option>
                    </select>
                  </div>
                  <p className="text-xs text-[#9ca3af] mt-2"><span className="font-bold text-[#1a7f5e]">{rapidFillSelected.length}</span>/9 additional professionals selected</p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="flex flex-col gap-3">
                    {filteredPros.map(pro => {
                      const isSelected = rapidFillSelected.includes(pro.id)
                      const isDisabled = !isSelected && rapidFillSelected.length >= 9
                      const isExpanded = expandedPro === pro.id
                      return (
                        <div key={pro.id} className={'rounded-2xl overflow-hidden border-2 transition ' + (isSelected ? 'border-[#1a7f5e]' : isDisabled ? 'border-[#e5e7eb] opacity-40' : 'border-[#e5e7eb] hover:border-[#1a7f5e]')}>
                          <div className="flex items-center gap-3 p-3 bg-white">
                            <img src={pro.img} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => !isDisabled && setExpandedPro(isExpanded ? null : pro.id)}>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-bold text-[#1a1a1a]">{pro.name}</p>
                                <span className="text-xs text-[#F97316] font-semibold">★ {pro.rating}</span>
                                <span className="text-xs text-[#9ca3af]">({pro.reviews})</span>
                              </div>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                <span className="text-xs font-bold text-[#1a1a1a]">{pro.rate}</span>
                                <span className={'text-xs font-semibold ' + relText(pro.reliability)}>{pro.reliability}% reliable</span>
                                <span className="text-xs text-[#9ca3af]">⚡ {pro.lastLogin}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button onClick={() => !isDisabled && setExpandedPro(isExpanded ? null : pro.id)} className="text-[#9ca3af] hover:text-[#1a7f5e] text-xs px-1 transition">{isExpanded ? '▲' : '▼'}</button>
                              <div onClick={() => !isDisabled && toggleRapidFill(pro.id)} className={'w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition ' + (isSelected ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db] hover:border-[#1a7f5e]')}>
                                {isSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                              </div>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="border-t border-[#e5e7eb] px-4 py-3 bg-[#f9f8f6]">
                              <p className="text-xs text-[#6b7280] leading-relaxed mb-3 italic">"{pro.about}"</p>
                              <div className="grid grid-cols-4 gap-2 mb-3">
                                {[
                                  { label: 'Rating', val: `★ ${pro.rating}`, color: 'text-[#F97316]' },
                                  { label: 'Reliability', val: `${pro.reliability}%`, color: relText(pro.reliability) },
                                  { label: 'Response', val: pro.responseTime, color: 'text-[#1a1a1a]' },
                                  { label: 'Last active', val: pro.lastLogin, color: 'text-[#1a1a1a]' },
                                ].map((s, i) => (
                                  <div key={i} className="bg-white rounded-xl p-2 text-center border border-[#e5e7eb]">
                                    <p className={'text-xs font-extrabold ' + s.color}>{s.val}</p>
                                    <p className="text-[10px] text-[#9ca3af] mt-0.5">{s.label}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex items-center justify-between">
                                <button onClick={() => !isDisabled && toggleRapidFill(pro.id)} className={'text-xs font-bold px-4 py-1.5 rounded-full border-2 transition ' + (isSelected ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#1a7f5e] text-[#1a7f5e] hover:bg-[#e8f5f0]')}>
                                  {isSelected ? '✓ Selected' : '+ Add to Rapid Fill'}
                                </button>
                                <button onClick={() => navigate('/profile')} className="text-xs text-[#1a7f5e] font-semibold hover:underline">View full profile →</button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-[#e5e7eb] flex-shrink-0 bg-white">
                  <div className="flex items-center gap-3 bg-[#f9f8f6] rounded-xl px-4 py-3 mb-4">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p className="text-xs text-[#9ca3af]">Once one professional accepts, the shift is locked and all others are automatically notified it's been filled.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowRapidFill(false); setRapidFillSelected([]) }} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">Cancel</button>
                    <button onClick={() => setRapidFillSubmitted(true)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition flex items-center justify-center gap-2">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Send to {rapidFillSelected.length + 1} professional{rapidFillSelected.length + 1 !== 1 ? 's' : ''}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-20 h-20 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <h3 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">Rapid Fill sent! ⚡</h3>
                <p className="text-sm text-[#6b7280] mb-1">Blasted to <strong>{rapidFillSelected.length + 1} professionals</strong>.</p>
                <p className="text-xs text-[#9ca3af] mb-8">First to accept gets the shift. You'll be notified immediately.</p>
                <div className="flex justify-center mb-8">
                  {[{ img: 'https://randomuser.me/api/portraits/women/44.jpg' },
                    ...rapidFillSelected.slice(0, 4).map(id => ({ img: rapidFillPros.find(p => p.id === id)?.img }))
                  ].map((p, i) => (
                    <img key={i} src={p.img} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow -ml-2 first:ml-0" />
                  ))}
                </div>
                <button onClick={() => { setShowRapidFill(false); setRapidFillSelected([]); setRapidFillSubmitted(false); showToast('Rapid Fill sent to ' + (rapidFillSelected.length + 1) + ' professionals!') }} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-10 py-3 rounded-full text-sm transition">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-[860px] mx-auto px-4 md:px-6 py-4">
        <button onClick={() => navigate('/professionals')} className="text-sm text-[#1a7f5e] font-semibold flex items-center gap-1 hover:opacity-80 transition">
          ← Back to search
        </button>
      </div>

      <div className="max-w-[860px] mx-auto px-4 md:px-6 pb-20">
        <div className="flex flex-col md:grid md:grid-cols-[1fr_240px] gap-5 items-start">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4">

            {/* Hero card */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <div className="inline-block bg-[#e8f5f0] text-[#1a7f5e] text-xs font-bold px-3 py-1 rounded-full mb-4">✓ Booked with you before</div>
              <div className="flex items-start gap-4 mb-5">
                <div className="relative flex-shrink-0">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: '#4c1d95' }} title="Verified professional">
                    <svg width="12" height="10" viewBox="0 0 14 11" fill="none">
                      <path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <h1 className="text-2xl font-extrabold text-[#111827] leading-tight">Sarah R.</h1>
                    <p className="text-xl font-extrabold text-[#111827] flex-shrink-0">$52<span className="text-xs font-normal text-[#4b5563]">/hr</span></p>
                  </div>
                  <p className="text-sm font-semibold text-[#4b5563] mb-2">Dental Hygienist · 8.2 mi away</p>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-lg font-extrabold text-[#F97316]">★ 5.0 <span className="text-sm text-[#4b5563] font-normal">(63 reviews)</span></span>
                    <span className="text-[#d1d5db]">·</span>
                    <span className={'text-xs font-extrabold px-2.5 py-1 rounded-full ' + sarahRel.bg + ' ' + sarahRel.color}>{sarahRel.label} · 98%</span>
                  </div>
                  <p className="text-xs text-[#1a7f5e] font-semibold">⚡ Active today · responds in &lt; 2 hrs</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: '< 2hrs', label: 'Response Time' },
                  { val: '147', label: 'Shifts Completed' },
                  { val: '98%', label: 'Reliability' },
                  { val: '92%', label: 'Acceptance Rate' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#f9f8f6] rounded-xl p-3 text-center border border-[#e5e7eb]">
                    <p className="text-sm font-extrabold text-[#1a7f5e]">{stat.val}</p>
                    <p className="text-xs text-[#6b7280]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* About */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-2">About</h2>
              <p className="text-[15px] text-[#374151] leading-relaxed">Experienced RDH with 12 years in general and perio practices. Highly proficient in Eaglesoft, same-day bookings welcome, and consistent 5-star reviews from offices across Houston. Known for her gentle approach with anxious patients and her ability to run a full hygiene column independently.</p>
            </div>

            {/* Availability */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-4">Availability</h2>
              <div className="flex items-center justify-between mb-4">
                <button className="text-lg text-[#6b7280] hover:text-[#1a1a1a] px-2">‹</button>
                <p className="text-sm font-bold text-[#1a1a1a]">March 2026</p>
                <button className="text-lg text-[#6b7280] hover:text-[#1a1a1a] px-2">›</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-[#9ca3af] py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {[...Array(31)].map((_, i) => {
                  const day = i + 1
                  return (
                    <div key={day} onClick={() => { if (availableDays.includes(day)) { setSelectedDay(day); setShowBookForm(true); setBookingSubmitted(false); setAgreedToTerms(false) } }} className={'text-center text-xs py-2 rounded-lg font-semibold transition ' + getDayClass(day)}>
                      {day}
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#1a7f5e]"></div><span className="text-xs text-[#6b7280]">Available</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div><span className="text-xs text-[#6b7280]">Booked</span></div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#d1d5db]"></div><span className="text-xs text-[#6b7280]">Unavailable</span></div>
              </div>
              <p className="text-xs text-[#9ca3af] italic mb-4">Tap an available date to send a booking request</p>

              {showBookForm && !bookingSubmitted && (
                <div className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-2xl p-4">
                  <p className="text-xs text-[#6b7280] font-semibold mb-1">Book Sarah for</p>
                  <p className="text-base font-extrabold text-[#1a1a1a] mb-4">March {selectedDay}, 2026</p>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Start Time</p>
                      <select className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1a7f5e] bg-white">
                        <option>7:00 AM</option><option>7:30 AM</option><option>8:00 AM</option><option>8:30 AM</option><option>9:00 AM</option>
                      </select>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">End Time</p>
                      <select className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1a7f5e] bg-white">
                        <option>3:00 PM</option><option>3:30 PM</option><option>4:00 PM</option><option>4:30 PM</option><option>5:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Lunch Break</p>
                    <select className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1a7f5e] bg-white">
                      <option>No lunch break</option><option>30 minutes</option><option>60 minutes</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Note <span className="font-normal normal-case">(optional)</span></p>
                    <textarea placeholder="e.g. Please arrive 10 minutes early..." className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1a7f5e] resize-none h-12 bg-white" />
                  </div>

                  {/* Terms */}
                  <div onClick={() => setAgreedToTerms(!agreedToTerms)} className="flex items-center gap-2 cursor-pointer mb-3 bg-white border border-[#e5e7eb] rounded-xl px-3 py-2.5">
                    <div className={'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ' + (agreedToTerms ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db] hover:border-[#1a7f5e]')}>
                      {agreedToTerms && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <p className="text-xs text-[#374151]">I agree to kazi.'s <span className="text-[#1a7f5e] font-semibold">Booking Terms</span></p>
                  </div>

                  {/* Rapid Fill CTA — navigates to Professionals page with Sarah pre-selected */}
                  <div className="bg-[#e8f5f0] border border-[#1a7f5e]/20 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-[#1a7f5e] rounded-full flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#0f4d38]">Fill this shift faster with Rapid Fill</p>
                        <p className="text-xs text-[#1a7f5e]">Blast to up to 10 professionals at once.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!agreedToTerms) { showToast('Please agree to booking terms before using Rapid Fill'); return }
                        setShowBookForm(false)
                        setAgreedToTerms(false)
                        navigate('/professionals', { state: { rapidFillPreselect: 'sarah' } })
                      }}
                      className={'w-full text-xs font-bold py-2 rounded-full flex items-center justify-center gap-1.5 transition ' + (agreedToTerms ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#d1d5db] text-[#9ca3af] cursor-not-allowed')}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Use Rapid Fill — find more professionals →
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => { setShowBookForm(false); setSelectedDay(null); setAgreedToTerms(false) }} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">Cancel</button>
                    <button
                      onClick={() => {
                        if (!agreedToTerms) { showToast('Please agree to the booking terms first'); return }
                        setBookingSubmitted(true); showToast('Booking request sent to Sarah R.!')
                      }}
                      className={'flex-1 font-bold py-2.5 rounded-full text-sm transition ' + (agreedToTerms ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed')}
                    >
                      Send booking request
                    </button>
                  </div>
                </div>
              )}

              {showBookForm && bookingSubmitted && (
                <div className="bg-[#e8f5f0] border border-[#1a7f5e]/20 rounded-2xl p-4 text-center">
                  <div className="w-12 h-12 bg-[#1a7f5e] rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  </div>
                  <p className="text-sm font-extrabold text-[#1a7f5e] mb-1">Booking request sent!</p>
                  <p className="text-xs text-[#6b7280]">Sarah will respond within 2 hours</p>
                </div>
              )}
            </div>

            {/* Resume */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Resume</h2>
              <div className="flex items-center gap-4 bg-[#f9f8f6] rounded-xl p-3 border border-[#e5e7eb]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a1a1a]">Sarah_Rodriguez_Resume.pdf</p>
                  <p className="text-xs text-[#6b7280]">Updated March 2026 · 245 KB</p>
                </div>
                <button onClick={() => showToast('Resume downloaded!')} className="cursor-pointer text-[#6b7280] hover:text-[#1a7f5e] transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Skills & Experience</h2>
              <div className="flex flex-wrap gap-2">
                {['Scaling & Root Planing', 'Periodontal Charting', 'Digital X-rays', 'Patient Education', 'Nitrous Oxide Monitoring', 'Local Anesthesia Administration'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-[#e8f5f0] text-[#0f4d38] text-xs font-semibold rounded-full">{skill}</span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Certifications</h2>
              <div className="flex flex-wrap gap-2">
                {['Texas RDH License', 'CPR/BLS Certified', 'Local Anesthesia Permit', 'Nitrous Oxide Permit'].map(c => (
                  <span key={c} className="text-xs font-semibold text-[#374151] bg-[#f3f4f6] px-3 py-1 rounded-full">✓ {c}</span>
                ))}
              </div>
            </div>

            {/* Practice Software */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Practice Software</h2>
              <div className="flex flex-wrap gap-2">
                {['Eaglesoft', 'Dentrix', 'Open Dental'].map(s => (
                  <span key={s} className="px-3 py-1 bg-[#e8f5f0] text-[#0f4d38] text-xs font-semibold rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-4">Reviews (63)</h2>
              <div className="flex gap-2 mb-5">
                {['All (5)', 'Positive (4)', 'Critical (1)'].map(tab => (
                  <button key={tab} onClick={() => setReviewTab(tab)} className={'px-4 py-1.5 rounded-full text-xs font-semibold border transition ' + (reviewTab === tab ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]')}>{tab}</button>
                ))}
              </div>
              <div className="flex flex-col gap-5">
                {[
                  { office: 'Bright Smile Dental', date: 'March 10, 2026', text: 'Sarah was absolutely phenomenal! She integrated seamlessly into our practice, had excellent rapport with patients, and her clinical skills were outstanding. Will definitely book again.', tags: ['Professional', 'On-time', 'Great communication', 'Skilled'], stars: '★★★★★' },
                  { office: 'Houston Family Dentistry', date: 'February 28, 2026', text: 'Sarah arrived early, jumped right in, and handled a full schedule with grace. Our patients loved her gentle touch and thorough explanations.', tags: ['Professional', 'On-time', 'Great communication'], stars: '★★★★★' },
                  { office: 'Clear Lake Dental Care', date: 'February 15, 2026', text: 'Very impressed with Sarah\'s professionalism and expertise. Highly skilled in perio maintenance and her charting was impeccable.', tags: ['Skilled', 'Professional', 'Great communication'], stars: '★★★★★' },
                ].map((review, i) => (
                  <div key={i} className="border-b border-[#e5e7eb] pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-[#1a1a1a]">{review.office}</p>
                      <p className="text-xs text-[#9ca3af]">{review.date}</p>
                    </div>
                    <p className="text-base text-[#F97316] mb-2">{review.stars}</p>
                    <p className="text-sm text-[#374151] leading-relaxed mb-3">{review.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {review.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-[#f9f8f6] border border-[#e5e7eb] text-xs text-[#6b7280] rounded-full">{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="flex flex-col gap-4 md:sticky md:top-24">
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <button onClick={() => setShowInviteModal(true)} className="w-full border border-[#1a7f5e] text-[#1a7f5e] font-bold py-2.5 rounded-full text-sm hover:bg-[#e8f5f0] transition mb-2">Send invite</button>
              <button onClick={() => { setSelectedDay(availableDays[0]); setShowBookForm(true); setBookingSubmitted(false); setAgreedToTerms(false); window.scrollTo({ top: 400, behavior: 'smooth' }) }} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition mb-2">Book Sarah</button>
              <button onClick={() => navigate('/messages')} className="w-full border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Message
              </button>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Badges</h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { bg: '#0f4d38', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5c842" strokeWidth="2.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
                  { bg: '#e8f5f0', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
                  { bg: '#e8f5f0', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                  { bg: '#ede9fe', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
                ].map((badge, i) => (
                  <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: badge.bg }}>{badge.icon}</div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Verifications</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Texas RDH License', val: '✓ Verified' },
                  { label: 'CPR/BLS Certified', val: '✓ Verified' },
                  { label: 'Local Anesthesia Permit', val: '✓ Verified' },
                  { label: 'Nitrous Oxide Permit', val: '✓ Verified' },
                ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-[#f3f4f6] last:border-0">
                    <p className="text-xs text-[#6b7280]">{v.label}</p>
                    <p className="text-xs font-bold text-[#1a7f5e]">{v.val}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-2">Response time</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1a7f5e]"></div>
                <p className="text-sm font-bold text-[#1a1a1a]">&lt; 2 hours</p>
              </div>
              <p className="text-xs text-[#6b7280] mt-1">Average response to invites</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}