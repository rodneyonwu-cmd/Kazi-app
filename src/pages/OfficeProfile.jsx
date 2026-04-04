import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'
import ProviderNav from '../components/ProviderNav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const Stars = ({ count }) => (
  <span className="text-[#F97316] text-[14px]">
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
)

export default function OfficeProfile() {
  const navigate = useNavigate()
  const { id: officeIdParam } = useParams()
  const isExternalView = !!officeIdParam
  const { user } = useUser()
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [office, setOffice] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedShift, setSelectedShift] = useState(null)
  const [toast, setToast] = useState(null)
  const [editingBio, setEditingBio] = useState(false)
  const [editBio, setEditBio] = useState('')
  const [editingDetails, setEditingDetails] = useState(false)
  const [editDetails, setEditDetails] = useState({})
  const [editingShift, setEditingShift] = useState(false)
  const [shiftEdit, setShiftEdit] = useState({})
  const logoRef = useRef(null)
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }
  const isOwner = !isExternalView

  const saveField = async (data) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/offices/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const updated = await res.json()
        setOffice(prev => ({ ...prev, ...updated }))
        showToast('Saved!')
        return true
      } else { showToast('Failed to save') }
    } catch { showToast('Failed to save') }
    return false
  }

  const uploadLogo = async (file) => {
    try {
      const token = await getToken()
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/api/offices/logo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData })
      if (res.ok) { const data = await res.json(); setOffice(prev => ({ ...prev, logoUrl: data.logoUrl })); showToast('Logo updated!') }
      else showToast('Failed to upload')
    } catch { showToast('Failed to upload') }
  }

  const saveShiftEdit = async () => {
    try {
      const token = await getToken()
      const body = {}
      if (shiftEdit.role) body.role = shiftEdit.role
      if (shiftEdit.hourlyRate) body.hourlyRate = parseFloat(shiftEdit.hourlyRate)
      if (shiftEdit.description !== undefined) body.description = shiftEdit.description
      const res = await fetch(`${API_URL}/api/shifts/${selectedShift.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body),
      })
      if (res.ok) {
        const updated = await res.json()
        setOffice(prev => ({ ...prev, shifts: prev.shifts.map(s => s.id === updated.id ? { ...s, ...updated } : s) }))
        setSelectedShift(prev => ({ ...prev, ...updated }))
        setEditingShift(false)
        showToast('Post updated!')
      } else showToast('Failed to update')
    } catch { showToast('Failed to update') }
  }

  const cancelShift = async () => {
    if (!confirm('Cancel this posting? This cannot be undone.')) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/shifts/${selectedShift.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        setOffice(prev => ({ ...prev, shifts: prev.shifts.filter(s => s.id !== selectedShift.id) }))
        setSelectedShift(null)
        showToast('Posting cancelled')
      } else showToast('Failed to cancel')
    } catch { showToast('Failed to cancel') }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        const url = isExternalView
          ? `${API_URL}/api/offices/${officeIdParam}`
          : `${API_URL}/api/offices/me`
        const officeRes = await fetch(url, { headers })
        if (officeRes.ok) {
          const officeData = await officeRes.json()
          setOffice(officeData)

          // Fetch reviews for this office
          const reviewsRes = await fetch(`${API_URL}/api/reviews?officeId=${officeData.id}`, { headers })
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json()
            setReviews(reviewsData)
          }
        }
      } catch (err) {
        console.error('Failed to fetch office profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [getToken, officeIdParam])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const openShifts = office?.shifts || []
  const tempShifts = openShifts.filter(s => s.jobType !== 'PERMANENT')
  const permJobs = openShifts.filter(s => s.jobType === 'PERMANENT')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'jobs', label: `Jobs (${openShifts.length})` },
    { id: 'reviews',  label: 'Reviews' },
    { id: 'photos',   label: 'Photos' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6]">
        {isExternalView ? <ProviderNav /> : <Nav />}
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[#9ca3af]">Loading profile...</p>
        </div>
      </div>
    )
  }

  const officeName = office?.name || 'Your Office'
  const officeInitials = officeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const officeSpecialty = office?.specialty || 'General Dentistry'
  const officeCity = office?.city || ''
  const officeState = office?.state || ''
  const officeLocation = [officeCity, officeState].filter(Boolean).join(', ')
  const officeAddress = [office?.address, officeCity, officeState, office?.zip].filter(Boolean).join(', ')
  const officePhone = office?.phone || ''
  const officeBio = office?.bio || ''
  const officeWebsite = office?.website || ''
  const officePhotos = office?.photos || []

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      {isExternalView ? <ProviderNav /> : <Nav />}

      <div className="max-w-[700px] mx-auto px-6 py-8 pb-16">

        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6b7280] hover:text-[#1a1a1a] transition mb-5"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to settings
        </button>

        {/* HEADER CARD */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-5 mb-5">

            {/* Logo */}
            <input type="file" ref={logoRef} accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) { uploadLogo(e.target.files[0]); e.target.value = '' } }} />
            <div className="relative flex-shrink-0" onClick={() => isOwner && logoRef.current?.click()} style={{ cursor: isOwner ? 'pointer' : 'default' }}>
              {office?.logoUrl ? (
                <img src={office.logoUrl.startsWith('http') ? office.logoUrl : `${API_URL}${office.logoUrl}`} alt="Logo" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#1a7f5e] flex items-center justify-center">
                  <span className="text-white text-xl font-extrabold">{officeInitials}</span>
                </div>
              )}
              {isOwner && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#1a7f5e] border-2 border-white flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                </div>
              )}
              {!isOwner && office?.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#5b21b6] border-2 border-white flex items-center justify-center">
                  <svg width="11" height="9" viewBox="0 0 14 11" fill="none"><path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-extrabold text-[#1a1a1a] mb-0.5">{officeName}</h1>
              <p className="text-[14px] text-[#6b7280] mb-2">{officeSpecialty}{officeLocation ? ` · ${officeLocation}` : ''}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#F97316] font-bold text-[14px]">★ {avgRating}</span>
                <span className="text-[13px] text-[#6b7280]">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            </div>
          </div>

          {/* Address / phone */}
          <div className="flex items-center gap-5 flex-wrap text-[13px] text-[#6b7280]">
            {officeAddress && (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {officeAddress}
              </span>
            )}
            {officePhone && (
              <span className="flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                {officePhone}
              </span>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden mb-0">
          <div className="flex border-b border-[#e5e7eb]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3.5 text-[14px] font-semibold transition border-b-2 ${
                  activeTab === tab.id
                    ? 'text-[#1a7f5e] border-[#1a7f5e]'
                    : 'text-[#6b7280] border-transparent hover:text-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-extrabold text-[#1a1a1a]">About</h2>
                {isOwner && !editingBio && <button onClick={() => { setEditBio(officeBio); setEditingBio(true) }} className="text-[13px] font-semibold text-[#1a7f5e] hover:underline cursor-pointer bg-none border-none" style={{ fontFamily: 'inherit' }}>Edit</button>}
              </div>
              {editingBio ? (
                <div className="mb-6">
                  <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={4} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1a7f5e] resize-none leading-relaxed" style={{ fontFamily: 'inherit' }} />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setEditingBio(false)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-full text-[13px] font-bold text-[#374151] bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={async () => { if (await saveField({ bio: editBio })) setEditingBio(false) }} className="px-4 py-1.5 bg-[#1a7f5e] text-white rounded-full text-[13px] font-bold border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Save</button>
                  </div>
                </div>
              ) : officeBio ? (
                <p className="text-[14px] text-[#374151] leading-relaxed mb-6">{officeBio}</p>
              ) : (
                <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6">{isOwner ? 'Click Edit to add an office bio.' : 'No bio added yet.'}</p>
              )}

              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-extrabold text-[#1a1a1a]">Office details</h2>
                {isOwner && !editingDetails && <button onClick={() => { setEditDetails({ specialty: officeSpecialty, phone: officePhone, website: officeWebsite, address: office?.address || '', city: officeCity, state: officeState, zip: office?.zip || '' }); setEditingDetails(true) }} className="text-[13px] font-semibold text-[#1a7f5e] hover:underline cursor-pointer bg-none border-none" style={{ fontFamily: 'inherit' }}>Edit</button>}
              </div>
              {editingDetails ? (
                <div className="bg-[#f9f8f6] rounded-xl p-4 mb-6">
                  {[['Specialty', 'specialty'], ['Phone', 'phone'], ['Website', 'website'], ['Address', 'address'], ['City', 'city'], ['State', 'state'], ['Zip', 'zip']].map(([label, key]) => (
                    <div key={key} className="mb-3">
                      <label className="block text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">{label}</label>
                      <input value={editDetails[key] || ''} onChange={e => setEditDetails(prev => ({ ...prev, [key]: e.target.value }))} className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1a7f5e] bg-white" />
                    </div>
                  ))}
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setEditingDetails(false)} className="px-4 py-1.5 border border-[#e5e7eb] rounded-full text-[13px] font-bold text-[#374151] bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={async () => { if (await saveField(editDetails)) setEditingDetails(false) }} className="px-4 py-1.5 bg-[#1a7f5e] text-white rounded-full text-[13px] font-bold border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Save</button>
                  </div>
                </div>
              ) : (
              <div className="bg-[#f9f8f6] rounded-xl overflow-hidden mb-6">
                {[
                  { label: 'Specialty', value: officeSpecialty },
                  { label: 'Phone', value: officePhone || 'Not set' },
                  { label: 'Website', value: officeWebsite || 'Not set' },
                  { label: 'Location', value: officeAddress || 'Not set' },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}>
                    <span className="text-[13px] text-[#9ca3af] font-medium">{label}</span>
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{value}</span>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* JOBS */}
          {activeTab === 'jobs' && (
            <div className="p-6">
              {openShifts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                  </div>
                  <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">No open positions</p>
                  <p className="text-[14px] text-[#9ca3af] leading-relaxed max-w-[280px] mx-auto">This office doesn't have any open shifts or jobs right now.</p>
                </div>
              ) : (
                <>
                  {/* Temporary Shifts */}
                  {tempShifts.length > 0 && (
                    <>
                      <h2 className="text-[15px] font-extrabold text-[#1a1a1a] mb-3 flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        Temporary Shifts
                        <span className="text-[12px] font-bold text-[#9ca3af] ml-1">({tempShifts.length})</span>
                      </h2>
                      <div className="flex flex-col gap-2 mb-6">
                        {tempShifts.map(shift => {
                          const dateStr = new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                          const parse = (t) => { if (!t) return 0; const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return 0; let h = +m[1], mi = +m[2]; if (m[3].toUpperCase() === 'PM' && h < 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return h + mi / 60 }
                          const hours = parse(shift.endTime) - parse(shift.startTime)
                          const estPay = hours > 0 && shift.hourlyRate ? `$${Math.round(hours * shift.hourlyRate)}` : ''
                          return (
                            <div key={shift.id} onClick={() => setSelectedShift(shift)} className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-xl p-4 hover:border-[#1a7f5e] transition cursor-pointer">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-[14px] font-bold text-[#1a1a1a]">{shift.role}</p>
                                  <p className="text-[12px] text-[#6b7280]">{dateStr} · {shift.startTime} – {shift.endTime}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-[16px] font-black text-[#1a7f5e]">${shift.hourlyRate}/hr</p>
                                  {estPay && <p className="text-[11px] text-[#6b7280]">Est. {estPay}</p>}
                                </div>
                              </div>
                              {shift.description && <p className="text-[12px] text-[#6b7280] mb-2 line-clamp-2">{shift.description}</p>}
                              <div className="flex items-center gap-2 flex-wrap">
                                {(shift.software || []).map(sw => (
                                  <span key={sw} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e8f5f0] text-[#1a7f5e]">{sw}</span>
                                ))}
                                {shift.isRapidFill && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef9c3] text-[#92400e]">Rapid Fill</span>}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}

                  {/* Permanent Jobs */}
                  {permJobs.length > 0 && (
                    <>
                      <h2 className="text-[15px] font-extrabold text-[#1a1a1a] mb-3 flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                        Permanent Positions
                        <span className="text-[12px] font-bold text-[#9ca3af] ml-1">({permJobs.length})</span>
                      </h2>
                      <div className="flex flex-col gap-2">
                        {permJobs.map(job => {
                          return (
                            <div key={job.id} onClick={() => setSelectedShift(job)} className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-xl p-4 hover:border-[#5b21b6] transition cursor-pointer">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="text-[14px] font-bold text-[#1a1a1a]">{job.role}</p>
                                  <p className="text-[12px] text-[#5b21b6] font-semibold">Full-time · Permanent</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-[16px] font-black text-[#5b21b6]">${job.hourlyRate}/hr</p>
                                </div>
                              </div>
                              {job.description && <p className="text-[12px] text-[#6b7280] mb-2 line-clamp-2">{job.description}</p>}
                              <div className="flex items-center gap-2 flex-wrap">
                                {(job.software || []).map(sw => (
                                  <span key={sw} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#5b21b6]">{sw}</span>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="p-6">
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">No reviews yet</p>
                  <p className="text-[14px] text-[#9ca3af] leading-relaxed max-w-[280px] mx-auto">Reviews from professionals who have worked at your office will appear here.</p>
                </div>
              ) : (
                <>
                  {/* Rating summary */}
                  <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[#f3f4f6]">
                    <div className="text-center">
                      <p className="text-[48px] font-extrabold text-[#1a1a1a] leading-none">{avgRating}</p>
                      <Stars count={Math.round(parseFloat(avgRating))} />
                      <p className="text-[12px] text-[#9ca3af] mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length
                        const pct = Math.round((count / reviews.length) * 100)
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-[12px] font-semibold text-[#6b7280] w-2">{star}</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#F97316"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            <div className="flex-1 h-1.5 bg-[#f3f4f6] rounded-full overflow-hidden">
                              <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[12px] text-[#9ca3af] w-6">{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Review list */}
                  <div className="flex flex-col gap-5">
                    {reviews.map(review => (
                      <div key={review.id} className="pb-5 border-b border-[#f3f4f6] last:border-0 last:pb-0">
                        <div className="flex items-center gap-3 mb-2">
                          <InitialsAvatar name={review.reviewerName || review.providerName || 'U'} size={40} />
                          <div>
                            <p className="text-[14px] font-bold text-[#1a1a1a]">{review.reviewerName || review.providerName || 'Anonymous'}</p>
                            <p className="text-[12px] text-[#9ca3af]">{review.role || 'Professional'} · {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="ml-auto">
                            <Stars count={review.rating} />
                          </div>
                        </div>
                        <p className="text-[13px] text-[#374151] leading-relaxed">{review.text || review.comment || ''}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* PHOTOS */}
          {activeTab === 'photos' && (
            <div className="p-6">
              {officePhotos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  </div>
                  <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">No photos yet</p>
                  <p className="text-[14px] text-[#9ca3af] leading-relaxed max-w-[280px] mx-auto">Add photos of your office to help professionals know what to expect.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {officePhotos.map((src, i) => (
                    <div key={i} className="aspect-video rounded-xl overflow-hidden bg-[#f3f4f6]">
                      <img
                        src={src}
                        alt={`Office photo ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[12px] font-semibold px-4 py-2.5 rounded-full z-[300] flex items-center gap-2 shadow-xl whitespace-nowrap">
          <div className="w-4 h-4 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Shift Detail Drawer */}
      {selectedShift && (() => {
        const s = selectedShift
        const isPerm = s.jobType === 'PERMANENT'
        const dateStr = s.date ? new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'
        const timeStr = s.startTime && s.endTime ? `${s.startTime} – ${s.endTime}` : '—'
        const rate = s.hourlyRate ? `$${s.hourlyRate}/hr` : '—'
        const parse = (t) => { if (!t) return 0; const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i); if (!m) return 0; let h = +m[1], mi = +m[2]; if (m[3].toUpperCase() === 'PM' && h < 12) h += 12; if (m[3].toUpperCase() === 'AM' && h === 12) h = 0; return h + mi / 60 }
        const hours = parse(s.endTime) - parse(s.startTime)
        const estPay = hours > 0 && s.hourlyRate ? `$${Math.round(hours * s.hourlyRate)}` : '—'
        const software = (s.software || []).join(', ') || 'N/A'
        const oName = office?.name || 'Office'
        const oInitials = oName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
        return (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSelectedShift(null)} />
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-[440px] bg-white z-50 flex flex-col shadow-2xl">
              <div className="px-5 py-4 border-b border-[#f3f4f6] flex-shrink-0">
                <button onClick={() => setSelectedShift(null)} className="flex items-center gap-1.5 text-[13px] font-bold text-[#6b7280] mb-4 bg-none border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Back
                </button>
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-[14px] flex items-center justify-center text-[14px] font-black flex-shrink-0 ${isPerm ? 'bg-[#ede9fe] text-[#5b21b6]' : 'bg-[#e8f5f0] text-[#1a7f5e]'}`}>{oInitials}</div>
                  <div className="flex-1">
                    <p className="text-[20px] font-black text-[#1a1a1a]">{oName}</p>
                    <p className="text-[13px] text-[#6b7280]">{s.role}</p>
                    {isPerm && <span className="text-[11px] font-bold text-[#5b21b6]">Permanent Position</span>}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className={`rounded-[14px] px-4 py-3 mb-5 ${isPerm ? 'bg-[#ede9fe]' : 'bg-[#e8f5f0]'}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${isPerm ? 'text-[#7c3aed]' : 'text-[#6b9e8a]'}`}>{isPerm ? 'Compensation' : 'Estimated pay'}</p>
                  <p className={`text-[22px] font-black ${isPerm ? 'text-[#5b21b6]' : 'text-[#0f4d38]'}`}>{isPerm ? rate : estPay}</p>
                </div>
                <p className="text-[16px] font-semibold text-[#374151] mb-3">{isPerm ? 'Job details' : 'Shift details'}</p>
                <div className="bg-[#f9f8f6] rounded-[14px] overflow-hidden mb-5">
                  {(isPerm
                    ? [['Role', s.role || '—'], ['Type', 'Full-time · Permanent'], ['Rate', rate], ['Software', software]]
                    : [['Date', dateStr], ['Time', timeStr], ['Hourly Rate', rate], ['Role', s.role || '—'], ['Software', software]]
                  ).map(([label, value], i, arr) => (
                    <div key={label} className={`flex justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f0efed]' : ''}`}>
                      <span className="text-[14px] text-[#9ca3af]">{label}</span>
                      <span className="text-[14px] font-medium text-[#1a1a1a]">{value}</span>
                    </div>
                  ))}
                </div>
                {editingShift ? (
                  <div className="mb-5">
                    <p className="text-[15px] font-semibold text-[#374151] mb-3">Edit posting</p>
                    <div className="mb-3">
                      <label className="block text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">Role</label>
                      <input value={shiftEdit.role || ''} onChange={e => setShiftEdit(p => ({ ...p, role: e.target.value }))} className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1a7f5e] bg-white" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">Hourly rate ($)</label>
                      <input type="number" value={shiftEdit.hourlyRate || ''} onChange={e => setShiftEdit(p => ({ ...p, hourlyRate: e.target.value }))} className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1a7f5e] bg-white" />
                    </div>
                    <div className="mb-3">
                      <label className="block text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">Description</label>
                      <textarea value={shiftEdit.description || ''} onChange={e => setShiftEdit(p => ({ ...p, description: e.target.value }))} className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1a7f5e] bg-white resize-none h-24" style={{ fontFamily: 'inherit' }} />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingShift(false)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2 rounded-full text-[13px] bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
                      <button onClick={saveShiftEdit} className="flex-1 bg-[#1a7f5e] text-white font-bold py-2 rounded-full text-[13px] border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {s.description && (
                      <div className="mb-5">
                        <p className="text-[15px] font-semibold text-[#374151] mb-2">Description</p>
                        <p className="text-[13px] text-[#374151] leading-relaxed whitespace-pre-line">{s.description}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {isExternalView && !editingShift && (
                <div className="px-5 py-4 border-t border-[#f3f4f6] flex gap-2 flex-shrink-0 bg-white">
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
                    className={`flex-1 font-bold py-3 rounded-full text-[14px] transition border-none cursor-pointer ${isPerm ? 'bg-[#5b21b6] hover:bg-[#4c1d95]' : 'bg-[#1a7f5e] hover:bg-[#156649]'} text-white`}
                    style={{ fontFamily: 'inherit' }}
                  >
                    {isPerm ? 'Apply Now' : 'Apply'}
                  </button>
                </div>
              )}
              {isOwner && !editingShift && (
                <div className="px-5 py-4 border-t border-[#f3f4f6] flex flex-col gap-2 flex-shrink-0 bg-white">
                  <button onClick={() => { setShiftEdit({ role: s.role, hourlyRate: s.hourlyRate, description: s.description || '' }); setEditingShift(true) }}
                    className="w-full flex items-center justify-center gap-1.5 border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px] hover:border-[#1a7f5e] transition bg-white cursor-pointer" style={{ fontFamily: 'inherit' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit this post
                  </button>
                  <button onClick={cancelShift} className="w-full border border-[#fee2e2] text-[#ef4444] font-bold py-2.5 rounded-full text-[13px] hover:bg-[#fef2f2] transition cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel posting</button>
                </div>
              )}
            </div>
          </>
        )
      })()}
    </div>
  )
}
