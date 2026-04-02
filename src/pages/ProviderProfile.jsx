import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import ProviderNav from '../components/ProviderNav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const DAYS = ['SU','MO','TU','WE','TH','FR','SA']

const CheckIcon = () => (
  <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
)

export default function ProviderProfile() {
  const navigate = useNavigate()
  const location = useLocation()
  const readOnly = location.state?.readOnly === true
  const { user } = useUser()
  const { getToken } = useAuth()

  const today = new Date()
  const [monthIdx, setMonthIdx] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [reviewTab, setReviewTab] = useState('All')
  const [editingAbout, setEditingAbout] = useState(false)
  const [editingRate, setEditingRate] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [toast, setToast] = useState(null)

  const [profile, setProfile] = useState(null)
  const [reviews, setReviews] = useState([])
  const [credentials, setCreds] = useState([])
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)

  const [about, setAbout] = useState('')
  const [rate, setRate] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        // Fetch profile first to get provider ID
        const profileRes = await fetch(`${API_URL}/api/providers/me`, { headers })
        const profileData = await profileRes.json()
        setProfile(profileData)
        setAbout(profileData?.bio || '')
        setRate(profileData?.hourlyRate ? String(profileData.hourlyRate) : '')

        // Fetch reviews, credentials, availability in parallel
        const providerId = profileData?.id
        if (providerId) {
          const [revRes, credRes, availRes] = await Promise.all([
            fetch(`${API_URL}/api/reviews?providerId=${providerId}`, { headers }),
            fetch(`${API_URL}/api/providers/${providerId}/credentials`, { headers }),
            fetch(`${API_URL}/api/providers/${providerId}/availability`, { headers }),
          ])
          const [revData, credData, availData] = await Promise.all([
            revRes.json(),
            credRes.json(),
            availRes.json(),
          ])
          setReviews(Array.isArray(revData) ? revData : [])
          setCreds(Array.isArray(credData) ? credData : [])
          setAvailability(Array.isArray(availData) ? availData : [])
        }
      } catch (err) {
        console.error('Failed to load profile data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [getToken])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const saveProfile = async () => {
    if (!profile?.id) return
    try {
      const token = await getToken()
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      await fetch(`${API_URL}/api/providers/${profile.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ bio: about, hourlyRate: rate ? parseFloat(rate) : null }),
      })
      setShowEditModal(false)
      showToast('Profile updated!')
    } catch { showToast('Failed to update profile') }
  }

  const saveRate = async () => {
    if (!profile?.id || !rate) return
    try {
      const token = await getToken()
      await fetch(`${API_URL}/api/providers/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ hourlyRate: parseFloat(rate) }),
      })
      setEditingRate(false)
      showToast('Rate updated!')
    } catch { showToast('Failed to update rate') }
  }

  const saveAbout = async () => {
    if (!profile?.id) return
    try {
      const token = await getToken()
      await fetch(`${API_URL}/api/providers/${profile.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bio: about }),
      })
      setEditingAbout(false)
      showToast('About updated!')
    } catch { showToast('Failed to update about') }
  }

  const changeMonth = (delta) => {
    let m = monthIdx + delta, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0)  { m = 11; y-- }
    setMonthIdx(m); setYear(y)
  }

  const firstDay    = new Date(year, monthIdx, 1).getDay()
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const daysInPrev  = new Date(year, monthIdx, 0).getDate()
  const isCurrent   = today.getFullYear() === year && today.getMonth() === monthIdx
  const total       = firstDay + daysInMonth
  const trailing    = total % 7 === 0 ? 0 : 7 - (total % 7)

  // Derive display values from profile
  const firstName   = profile?.firstName || user?.firstName || ''
  const lastName    = profile?.lastName || user?.lastName || ''
  const displayName = firstName ? `${firstName} ${lastName ? lastName.charAt(0) + '.' : ''}`.trim() : ''
  const roleName    = profile?.role || ''
  const locationStr = profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : ''
  const softwareList = profile?.software || []
  const skillsList   = profile?.skills || []
  const completedShifts = profile?.stats?.completedShifts || 0

  // Compute availability days for the calendar
  const bookedDays = []
  const availDays  = []
  availability.forEach(slot => {
    const d = new Date(slot.date || slot.startTime)
    if (d.getMonth() === monthIdx && d.getFullYear() === year) {
      const day = d.getDate()
      if (slot.status === 'booked') {
        bookedDays.push(day)
      } else {
        availDays.push(day)
      }
    }
  })

  // Reviews
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.stars || r.rating || 0), 0) / reviews.length).toFixed(1)
    : '—'

  const filteredReviews = reviews.filter(r =>
    reviewTab === 'All' || (reviewTab === 'Positive' && (r.stars || r.rating) >= 4) || (reviewTab === 'Critical' && (r.stars || r.rating) < 4)
  )

  // Profile strength calculation
  const hasPhoto       = !!(user?.imageUrl || profile?.avatarUrl)
  const hasAbout       = !!(profile?.bio)
  const hasRate        = !!(profile?.hourlyRate)
  const hasCreds       = credentials.length > 0
  const hasResume      = !!(profile?.resumeUrl)
  const hasAvailability = availability.length > 0
  const strengthItems  = [
    ['Profile photo',       hasPhoto],
    ['About section',       hasAbout],
    ['Hourly rate',         hasRate],
    ['Credentials uploaded', hasCreds],
    ['Resume uploaded',     hasResume],
    ['Availability set',    hasAvailability],
  ]
  const strengthCount = strengthItems.filter(([, done]) => done).length
  const strengthPct   = Math.round((strengthCount / strengthItems.length) * 100)
  const strengthTip   = !hasPhoto ? 'Add a profile photo' : !hasAbout ? 'Write an about section' : !hasRate ? 'Set your hourly rate' : !hasCreds ? 'Upload your credentials' : !hasResume ? 'Add a resume' : !hasAvailability ? 'Set your availability' : 'Looking great!'

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const s = { // shared inline style helpers
    card: { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '16px 18px', marginBottom: 14 },
    sectionLabel: { fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10, display: 'block' },
    sideCard: { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: 16, marginBottom: 14 },
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f9f8f6', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
        <ProviderNav />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 120 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#1a7f5e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 600 }}>Loading profile...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9f8f6', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', color: 'white', fontSize: 13, fontWeight: 600, padding: '10px 18px', borderRadius: 100, zIndex: 600, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#1a7f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckIcon /></div>
          {toast}
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
          <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 17, fontWeight: 900, color: '#1a1a1a' }}>Edit profile</h2>
              <button onClick={() => setShowEditModal(false)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', cursor: 'pointer', background: 'white', fontFamily: 'inherit' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <InitialsAvatar name={firstName} size={64} />
                <button style={{ border: '1px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '8px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', background: 'white', fontFamily: 'inherit' }}>Change photo</button>
              </div>
              {[
                ['Full name', displayName || '', 'text'],
                ['Role', roleName || '', 'text'],
                ['City', locationStr || '', 'text'],
                ['Hourly rate', rate || '', 'number'],
                ['Travel radius (miles)', '25', 'number'],
              ].map(([label, placeholder, type]) => (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</p>
                  <input type={type} placeholder={placeholder} defaultValue={placeholder} style={{ width: '100%', background: '#f9f8f6', border: '1px solid #f3f4f6', borderRadius: 12, padding: '10px 16px', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>About</p>
                <textarea rows={4} defaultValue={about} style={{ width: '100%', background: '#f9f8f6', border: '1px solid #f3f4f6', borderRadius: 12, padding: '10px 16px', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '10px', borderRadius: 100, fontSize: 14, cursor: 'pointer', background: 'white', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={saveProfile} style={{ flex: 1, background: '#1a7f5e', color: 'white', fontWeight: 700, padding: '10px', borderRadius: 100, fontSize: 14, cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProviderNav />

      {/* BACK */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px 32px' }}>
        <button onClick={() => navigate('/provider-dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1a7f5e', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to dashboard
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 32px 100px' }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* -- MAIN COLUMN -- */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

            {/* HERO */}
            <div style={{ ...s.card, padding: '22px 22px 18px' }}>
              {!readOnly && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e8f5f0', color: '#1a7f5e', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 100, marginBottom: 16 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  Profile visible to offices
                </div>
              )}
              {readOnly && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e8f5f0', color: '#1a7f5e', fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 100, marginBottom: 16 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  This is how offices see your profile
                </div>
              )}
              {/* Photo + Info row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <InitialsAvatar name={firstName} size={84} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name */}
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2, marginBottom: 3 }}>
                    {displayName || 'Complete your profile'}
                  </div>
                  {/* Role + location */}
                  <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>
                    {roleName || 'Set your role'}{locationStr ? ` \u00b7 ${locationStr}` : ''}
                  </div>
                  {/* Rate */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {editingRate
                      ? <input type="number" value={rate} onChange={e => setRate(e.target.value)} style={{ width: 72, border: '1.5px solid #1a7f5e', borderRadius: 8, padding: '3px 8px', fontSize: 20, fontWeight: 900, color: '#1a7f5e', outline: 'none' }} />
                      : <span style={{ fontSize: 22, fontWeight: 900, color: '#1a7f5e' }}>${profile?.hourlyRate || '\u2014'}/hr</span>
                    }
                    {!readOnly && <button onClick={() => { if (editingRate) { saveRate() } else { setEditingRate(true) } }} style={{ fontSize: 12, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{editingRate ? 'Save' : 'Edit'}</button>}
                  </div>
                  {/* Stars + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#F97316' }}>{'\u2605'} {profile?.stats?.rating || '\u2014'}</span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>({reviews.length} reviews)</span>
                    {completedShifts > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: '#dcfce7', color: '#166534' }}>
                        {(profile?.stats?.reliability || 0) >= 95 ? 'Excellent' : (profile?.stats?.reliability || 0) >= 80 ? 'Good' : 'Building'} {'\u00b7'} {Math.round(profile?.stats?.reliability || 0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* 4 stat tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                {[
                  ['SHIFTS', String(completedShifts), '#1a1a1a'],
                  ['RESPONSE', '\u2014', '#1a1a1a'],
                  ['RELIABILITY', completedShifts === 0 ? 'New' : Math.round(profile?.stats?.reliability || 0) + '%', completedShifts === 0 ? '#9ca3af' : '#166534'],
                  ['SCORE', '\u2014', '#1a7f5e'],
                ].map(([label,val,color]) => (
                  <div key={label} style={{ background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ABOUT */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>About</span>
                {!readOnly && <button onClick={() => { if (editingAbout) { saveAbout() } else { setEditingAbout(true) } }} style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{editingAbout ? 'Save' : 'Edit'}</button>}
              </div>
              {editingAbout
                ? <textarea value={about} onChange={e => setAbout(e.target.value)} rows={5} style={{ width: '100%', background: '#f9f8f6', border: '1px solid #f3f4f6', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#374151', lineHeight: 1.7, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                : about
                  ? <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{about}</div>
                  : <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7, fontStyle: 'italic' }}>Tell offices about yourself {'\u2014'} your experience, specialties, and what makes you a great team member.</div>
              }
            </div>

            {/* AVAILABILITY CALENDAR */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>Availability</span>
                <button onClick={() => navigate('/provider-availability')} style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit hours {'\u2192'}</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6b7280', cursor: 'pointer', padding: '0 6px' }}>{'\u2039'}</button>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>{months[monthIdx]} {year}</span>
                <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6b7280', cursor: 'pointer', padding: '0 6px' }}>{'\u203a'}</button>
              </div>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                {[['#e8f5f0','#1a7f5e','Available'],['#fef3c7','#f59e0b','Booked'],['#f3f4f6','#d1d5db','Unavailable']].map(([bg,bd,lbl]) => (
                  <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6b7280' }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: bd }}/>
                    {lbl}
                  </div>
                ))}
              </div>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 4 }}>
                {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#9ca3af', padding: '2px' }}>{d}</div>)}
              </div>
              {/* Days grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 12 }}>
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`p${i}`} style={{ textAlign: 'center', fontSize: 11, padding: '8px 2px', color: '#d1d5db' }}>{daysInPrev - firstDay + i + 1}</div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1
                  const isToday  = isCurrent && d === today.getDate()
                  const isBooked = bookedDays.includes(d)
                  const isAvail  = availDays.includes(d)
                  let bg = 'transparent', color = '#9ca3af', fw = 600
                  if (isToday)  { bg = '#1a7f5e'; color = 'white'; fw = 900 }
                  else if (isBooked) { bg = '#fef3c7'; color = '#d97706'; fw = 700 }
                  else if (isAvail)  { bg = '#e8f5f0'; color = '#1a7f5e'; fw = 700 }
                  return (
                    <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: fw, padding: '8px 2px', borderRadius: 6, background: bg, color, cursor: isAvail ? 'pointer' : 'default' }}>
                      {d}
                    </div>
                  )
                })}
                {Array.from({ length: trailing }, (_, i) => (
                  <div key={`t${i}`} style={{ textAlign: 'center', fontSize: 11, padding: '8px 2px', color: '#d1d5db' }}>{i + 1}</div>
                ))}
              </div>
              {availability.length === 0 && (
                <p style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic', textAlign: 'center', padding: '8px 0' }}>Set your availability to get booked by offices.</p>
              )}
              <p style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>This calendar is visible to offices when they view your profile</p>
            </div>

            {/* RESUME */}
            <input type="file" ref={fileInputRef} accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) showToast('Resume upload coming soon') }} />
            <div style={s.card}>
              <span style={s.sectionLabel}>Resume</span>
              {profile?.resumeUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ width: 38, height: 38, background: '#e8f5f0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{firstName ? `${firstName}_Resume.pdf` : 'Resume.pdf'}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Uploaded</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {!readOnly && <button style={{ fontSize: 12, fontWeight: 700, color: '#374151', border: '1.5px solid #e5e7eb', padding: '6px 12px', borderRadius: 100, background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>Replace</button>}
                    <button onClick={() => showToast('Resume downloaded!')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '16px 14px' }}>
                  <span style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No resume uploaded yet</span>
                  {!readOnly && (
                    <button onClick={() => fileInputRef.current?.click()} style={{ fontSize: 12, fontWeight: 700, color: '#1a7f5e', border: '1.5px solid #1a7f5e', padding: '6px 14px', borderRadius: 100, background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>Upload resume</button>
                  )}
                </div>
              )}
            </div>

            {/* PRACTICE SOFTWARE */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>Practice Software</span>
                {!readOnly && <button onClick={() => showToast('Coming soon')} style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>}
              </div>
              {softwareList.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {softwareList.map(sw => (
                    <span key={sw} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: '#e8f5f0', color: '#0f4d38' }}>{sw}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No software added yet</div>
              )}
            </div>

            {/* SKILLS */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>Skills & Experience</span>
                {!readOnly && <button onClick={() => showToast('Coming soon')} style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>}
              </div>
              {skillsList.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {skillsList.map(skill => (
                    <span key={skill} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#e8f5f0', color: '#0f4d38' }}>{skill}</span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No skills added yet</div>
              )}
            </div>

            {/* CREDENTIALS */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>Credentials</span>
                {!readOnly && <button onClick={() => navigate('/provider-documents')} style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Manage {'\u2192'}</button>}
              </div>
              {credentials.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {credentials.map(c => (
                    <span key={c.id || c.label || c.name} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: (c.verified || c.ok) ? '#f3f4f6' : '#fef9c3', color: (c.verified || c.ok) ? '#374151' : '#92400e' }}>
                      {(c.verified || c.ok) ? '\u2713' : '\u26a0'} {c.label || c.name || c.type}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No credentials uploaded yet</div>
              )}
            </div>

            {/* REVIEWS */}
            <div style={s.card}>
              <span style={s.sectionLabel}>Reviews ({reviews.length})</span>
              {reviews.length > 0 ? (
                <>
                  {/* Rating summary */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#f9f8f6', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                    <div style={{ textAlign: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 40, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>{avgRating}</div>
                      <div style={{ color: '#F97316', fontSize: 13, margin: '4px 0' }}>{'\u2605\u2605\u2605\u2605\u2605'}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{reviews.length} reviews</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5,4,3,2,1].map(star => {
                        const count = reviews.filter(r => (r.stars || r.rating) === star).length
                        const pct = Math.round((count / reviews.length) * 100)
                        return (
                          <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af', width: 8 }}>{star}</span>
                            <div style={{ flex: 1, height: 5, background: '#e5e7eb', borderRadius: 100, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${pct}%`, background: '#F97316', borderRadius: 100 }}/>
                            </div>
                            <span style={{ fontSize: 11, color: '#9ca3af', width: 28 }}>{pct}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {['All','Positive','Critical'].map(t => (
                      <button key={t} onClick={() => setReviewTab(t)} style={{ padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600, border: `1.5px solid ${reviewTab === t ? '#1a7f5e' : '#e5e7eb'}`, background: reviewTab === t ? '#1a7f5e' : 'white', color: reviewTab === t ? 'white' : '#6b7280', cursor: 'pointer', fontFamily: 'inherit' }}>{t}</button>
                    ))}
                  </div>
                  {/* Reviews list */}
                  {filteredReviews.map((r, i) => (
                    <div key={r.id || i} style={{ borderBottom: i < filteredReviews.length - 1 ? '1px solid #f3f4f6' : 'none', padding: '14px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: r.logoBg || '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: r.logoColor || '#1a7f5e', flexShrink: 0 }}>{r.initials || (r.office || r.officeName || '?').substring(0, 2).toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{r.office || r.officeName || 'Office'}</div>
                          <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.date || ''}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 1 }}>
                          {[1,2,3,4,5].map(sv => <span key={sv} style={{ fontSize: 13, color: sv <= (r.stars || r.rating) ? '#F97316' : '#e5e7eb' }}>{'\u2605'}</span>)}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 8 }}>{r.text || r.comment || ''}</p>
                      {(r.tags || []).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                          {r.tags.map(tag => <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#f9f8f6', border: '1px solid #e5e7eb', color: '#6b7280' }}>{tag}</span>)}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <p style={{ fontSize: 14, color: '#9ca3af', fontStyle: 'italic' }}>No reviews yet {'\u2014'} complete shifts to earn your first review.</p>
                </div>
              )}
            </div>

          </div>

          {/* -- RIGHT SIDEBAR -- */}
          {readOnly ? (
            <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 88, display: 'flex', flexDirection: 'column' }}>
              <div style={s.sideCard}>
                <button onClick={() => showToast(`Invite sent to ${displayName || 'provider'}!`)} style={{ width: '100%', background: 'white', border: '1.5px solid #1a7f5e', color: '#1a7f5e', fontWeight: 700, padding: '10px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>Send invite</button>
                <button onClick={() => showToast(`Booking ${firstName || 'provider'}...`)} style={{ width: '100%', background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 800, padding: '11px 16px', borderRadius: 100, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>Book {firstName || 'Provider'}</button>
                <button onClick={() => showToast('Opening messages...')} style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '10px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Message
                </button>
              </div>
              <div style={s.sideCard}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Badges</div>
                {completedShifts > 0 ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['#0f4d38','#f5c842','star'],['#e8f5f0','#0f4d38','shield'],['#e8f5f0','#0f4d38','bolt'],['#ede9fe','#5b21b6','pulse']].map(([bg,ic,type],i) => (
                      <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {type==='star' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                        {type==='shield' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                        {type==='bolt' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
                        {type==='pulse' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>Complete shifts to earn badges</div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 88, display: 'flex', flexDirection: 'column' }}>
              {/* Edit actions */}
              <div style={s.sideCard}>
                <button onClick={() => setShowEditModal(true)} style={{ width: '100%', background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 800, padding: '11px 16px', borderRadius: 100, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 8 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit profile
                </button>
                <button onClick={() => navigate('/provider-documents')} style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '10px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>Manage credentials</button>
                <button onClick={() => navigate('/provider-availability')} style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '10px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Edit availability
                </button>
              </div>

              {/* Profile strength */}
              <div style={s.sideCard}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Profile strength</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ flex: 1, height: 8, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${strengthPct}%`, background: '#1a7f5e', borderRadius: 100 }}/>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#1a7f5e' }}>{strengthPct}%</span>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>{strengthPct < 100 ? strengthTip + ' to improve' : 'Your profile is complete!'}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {strengthItems.map(([label, done]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: done ? '#1a7f5e' : 'white', border: done ? 'none' : '2px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {done && <CheckIcon />}
                      </div>
                      <span style={{ fontSize: 12, color: done ? '#374151' : '#9ca3af' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div style={s.sideCard}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Badges</div>
                {completedShifts > 0 ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[['#0f4d38','#f5c842','star'],['#e8f5f0','#0f4d38','shield'],['#e8f5f0','#0f4d38','bolt'],['#ede9fe','#5b21b6','pulse']].map(([bg,ic,type],i) => (
                      <div key={i} style={{ width: 40, height: 40, borderRadius: '50%', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {type==='star' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
                        {type==='shield' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                        {type==='bolt' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
                        {type==='pulse' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ic} strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>Complete shifts to earn badges</div>
                )}
              </div>

              {/* Verifications */}
              <div style={s.sideCard}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Verifications</div>
                {credentials.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {credentials.map((c, i) => (
                      <div key={c.id || i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < credentials.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <span style={{ fontSize: 12, color: '#6b7280' }}>{c.label || c.name || c.type}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: (c.verified || c.ok) ? '#1a7f5e' : '#92400e' }}>
                          {(c.verified || c.ok) ? '\u2713 Verified' : '\u26a0 Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#9ca3af', fontStyle: 'italic' }}>No verifications yet</div>
                )}
              </div>

              {/* Response time - only show if provider has completed shifts */}
              {completedShifts > 0 && (
                <div style={s.sideCard}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Response time</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a7f5e' }}/>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>&lt; 2 hours</span>
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>Average response to invites</p>
                </div>
              )}

            </div>
          )}
        </div>
      </div>

      {/* MOBILE TOOLBAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home',        path: '/provider-dashboard',   icon: <HomeIcon /> },
          { label: 'Requests',    path: '/provider-requests',    icon: <ReqIcon /> },
          { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
          { label: 'Messages',    path: '/provider-messages',    icon: <MsgIcon /> },
          { label: 'Earnings',    path: '/provider-earnings',    icon: <EarnIcon /> },
        ].map(({ label, path, icon }) => (
          <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
            <div className="relative">
              <span className="text-[#9ca3af]">{icon}</span>
            </div>
            <span className="text-[10px] font-semibold text-[#9ca3af]">{label}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

function HomeIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
