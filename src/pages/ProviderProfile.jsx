import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const DAYS = ['SU','MO','TU','WE','TH','FR','SA']
const bookedDays = [10, 14, 17, 20, 25, 28]
const availDays  = [2,3,4,6,9,11,13,16,18,19,23,24,26,27,30]

const allReviews = [
  { id:1, office:'Evolve Dentistry', initials:'ED', logoBg:'#e8f5f0', logoColor:'#1a7f5e', date:'Feb 12, 2026', stars:5, text:'Sarah was absolutely phenomenal. She arrived early, was incredibly professional with patients, and her clinical skills are top-notch. Will definitely request her again!', tags:['Professional','On-time','Great communication','Skilled'] },
  { id:2, office:'Clear Lake Dental', initials:'CL', logoBg:'#ede9fe', logoColor:'#5b21b6', date:'Jan 8, 2026', stars:5, text:'One of the best hygienists we have had through Kazi. Excellent with patients and very thorough. Our team loved working with her.', tags:['Skilled','Professional','Great communication'] },
  { id:3, office:'Houston Family Dentistry', initials:'HF', logoBg:'#e8f5f0', logoColor:'#1a7f5e', date:'Dec 3, 2025', stars:5, text:'Sarah is reliable, skilled, and a pleasure to work with. She adapted quickly to our workflow and our patients adored her.', tags:['Professional','On-time','Great communication'] },
  { id:4, office:'Bright Smile Dental', initials:'BS', logoBg:'#fef9c3', logoColor:'#92400e', date:'Nov 14, 2025', stars:4, text:'Great hygienist, very professional and thorough. Would book again without hesitation.', tags:['Professional','Skilled'] },
]

const CheckIcon = () => (
  <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
)

export default function ProviderProfile() {
  const navigate = useNavigate()
  const location = useLocation()
  const readOnly = location.state?.readOnly === true

  const today = new Date()
  const [monthIdx, setMonthIdx] = useState(today.getMonth())
  const [year, setYear] = useState(today.getFullYear())
  const [reviewTab, setReviewTab] = useState('All')
  const [editingAbout, setEditingAbout] = useState(false)
  const [editingRate, setEditingRate] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [about, setAbout] = useState('Experienced RDH with 12 years in general and perio practices. Highly proficient in full-mouth debridement, periodontal charting, and advanced scaling procedures. Known for her gentle touch with anxious patients and her ability to run a full column independently.')
  const [rate, setRate] = useState('52')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

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

  const avgRating = (allReviews.reduce((s, r) => s + r.stars, 0) / allReviews.length).toFixed(1)

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']

  const s = { // shared inline style helpers
    card: { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '16px 18px', marginBottom: 14 },
    sectionLabel: { fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10, display: 'block' },
    sideCard: { background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, padding: 16, marginBottom: 14 },
  }

  const filteredReviews = allReviews.filter(r =>
    reviewTab === 'All' || (reviewTab === 'Positive' && r.stars >= 4) || (reviewTab === 'Critical' && r.stars < 4)
  )

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
                <img src="https://i.pravatar.cc/150?img=47" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                <button style={{ border: '1px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '8px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', background: 'white', fontFamily: 'inherit' }}>Change photo</button>
              </div>
              {[['Full name','Sarah R.','text'],['Role','Dental Hygienist','text'],['City','Houston, TX','text'],['Hourly rate','52','number'],['Travel radius (miles)','25','number']].map(([label, placeholder, type]) => (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{label}</p>
                  <input type={type} placeholder={placeholder} style={{ width: '100%', background: '#f9f8f6', border: '1px solid #f3f4f6', borderRadius: 12, padding: '10px 16px', fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>About</p>
                <textarea rows={4} defaultValue={about} style={{ width: '100%', background: '#f9f8f6', border: '1px solid #f3f4f6', borderRadius: 12, padding: '10px 16px', fontSize: 14, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                <button onClick={() => setShowEditModal(false)} style={{ flex: 1, border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '10px', borderRadius: 100, fontSize: 14, cursor: 'pointer', background: 'white', fontFamily: 'inherit' }}>Cancel</button>
                <button onClick={() => { setShowEditModal(false); showToast('Profile updated!') }} style={{ flex: 1, background: '#1a7f5e', color: 'white', fontWeight: 700, padding: '10px', borderRadius: 100, fontSize: 14, cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>Save changes</button>
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

          {/* ── MAIN COLUMN ── */}
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
              {/* Photo + Info row — matches screenshot exactly */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <img src="https://i.pravatar.cc/150?img=47" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name */}
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2, marginBottom: 3 }}>Sarah R.</div>
                  {/* Role · miles */}
                  <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>Dental Hygienist · 8.2 mi away</div>
                  {/* Rate */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {editingRate
                      ? <input type="number" value={rate} onChange={e => setRate(e.target.value)} style={{ width: 72, border: '1.5px solid #1a7f5e', borderRadius: 8, padding: '3px 8px', fontSize: 20, fontWeight: 900, color: '#1a7f5e', outline: 'none' }} />
                      : <span style={{ fontSize: 22, fontWeight: 900, color: '#1a7f5e' }}>${rate}/hr</span>
                    }
                    {!readOnly && <button onClick={() => { if (editingRate) showToast('Rate updated!'); setEditingRate(!editingRate) }} style={{ fontSize: 12, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{editingRate ? 'Save' : 'Edit'}</button>}
                  </div>
                  {/* Stars + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: '#F97316' }}>★ {avgRating}</span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>({allReviews.length} reviews)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 100, background: '#dcfce7', color: '#166534' }}>Excellent · 98%</span>
                  </div>
                </div>
              </div>
              {/* 4 stat tiles */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                {[['SHIFTS','147','#1a1a1a'],['RESPONSE','<1 hr','#1a1a1a'],['RELIABILITY','98%','#166534'],['SCORE','94','#1a7f5e']].map(([label,val,color]) => (
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
                {!readOnly && <button onClick={() => { if (editingAbout) showToast('About updated!'); setEditingAbout(!editingAbout) }} style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>{editingAbout ? 'Save' : 'Edit'}</button>}
              </div>
              {editingAbout
                ? <textarea value={about} onChange={e => setAbout(e.target.value)} rows={5} style={{ width: '100%', background: '#f9f8f6', border: '1px solid #f3f4f6', borderRadius: 12, padding: '12px 16px', fontSize: 14, color: '#374151', lineHeight: 1.7, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                : <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{about}</div>
              }
            </div>

            {/* AVAILABILITY CALENDAR */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>Availability</span>
                <button onClick={() => navigate('/provider-availability')} style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit hours →</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <button onClick={() => changeMonth(-1)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6b7280', cursor: 'pointer', padding: '0 6px' }}>‹</button>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>{months[monthIdx]} {year}</span>
                <button onClick={() => changeMonth(1)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6b7280', cursor: 'pointer', padding: '0 6px' }}>›</button>
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
              <p style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic' }}>This calendar is visible to offices when they view your profile</p>
            </div>

            {/* RESUME */}
            <div style={s.card}>
              <span style={s.sectionLabel}>Resume</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9f8f6', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ width: 38, height: 38, background: '#e8f5f0', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Sarah_Resume.pdf</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Updated March 2026 · 245 KB</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {!readOnly && <button style={{ fontSize: 12, fontWeight: 700, color: '#374151', border: '1.5px solid #e5e7eb', padding: '6px 12px', borderRadius: 100, background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>Replace</button>}
                  <button onClick={() => showToast('Resume downloaded!')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* PRACTICE SOFTWARE */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>Practice Software</span>
                {!readOnly && <button style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Eaglesoft','Dentrix','Open Dental'].map(s => (
                  <span key={s} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: '#e8f5f0', color: '#0f4d38' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* SKILLS */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>Skills & Experience</span>
                {!readOnly && <button style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['Scaling & Root Planing','Periodontal Charting','Digital X-rays','Patient Education','Nitrous Oxide Monitoring','Local Anesthesia Administration','Perio Maintenance','High-Volume Scheduling'].map(skill => (
                  <span key={skill} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#e8f5f0', color: '#0f4d38' }}>{skill}</span>
                ))}
              </div>
            </div>

            {/* CREDENTIALS */}
            <div style={s.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ ...s.sectionLabel, marginBottom: 0 }}>Credentials</span>
                {!readOnly && <button onClick={() => navigate('/provider-documents')} style={{ fontSize: 13, fontWeight: 600, color: '#1a7f5e', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Manage →</button>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {[{label:'Texas RDH License',ok:true},{label:'CPR/BLS Certified',ok:false},{label:'Local Anesthesia Permit',ok:true},{label:'Nitrous Oxide Permit',ok:true}].map(c => (
                  <span key={c.label} style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: c.ok ? '#f3f4f6' : '#fef9c3', color: c.ok ? '#374151' : '#92400e' }}>
                    {c.ok ? '✓' : '⚠'} {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* REVIEWS */}
            <div style={s.card}>
              <span style={s.sectionLabel}>Reviews ({allReviews.length})</span>
              {/* Rating summary */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, background: '#f9f8f6', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: '#1a1a1a', lineHeight: 1 }}>{avgRating}</div>
                  <div style={{ color: '#F97316', fontSize: 13, margin: '4px 0' }}>★★★★★</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{allReviews.length} reviews</div>
                </div>
                <div style={{ flex: 1 }}>
                  {[5,4,3,2,1].map(star => {
                    const count = allReviews.filter(r => r.stars === star).length
                    const pct = Math.round((count / allReviews.length) * 100)
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
                <div key={r.id} style={{ borderBottom: i < filteredReviews.length - 1 ? '1px solid #f3f4f6' : 'none', padding: '14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: r.logoBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: r.logoColor, flexShrink: 0 }}>{r.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{r.office}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.date}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 1 }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 13, color: s <= r.stars ? '#F97316' : '#e5e7eb' }}>★</span>)}
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, marginBottom: 8 }}>{r.text}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {r.tags.map(tag => <span key={tag} style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: '#f9f8f6', border: '1px solid #e5e7eb', color: '#6b7280' }}>{tag}</span>)}
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* ── RIGHT SIDEBAR ── */}
          {readOnly ? (
            <div style={{ width: 220, flexShrink: 0, position: 'sticky', top: 88, display: 'flex', flexDirection: 'column' }}>
              <div style={s.sideCard}>
                <button onClick={() => showToast('Invite sent to Sarah R.!')} style={{ width: '100%', background: 'white', border: '1.5px solid #1a7f5e', color: '#1a7f5e', fontWeight: 700, padding: '10px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>Send invite</button>
                <button onClick={() => showToast('Booking Sarah...')} style={{ width: '100%', background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 800, padding: '11px 16px', borderRadius: 100, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 }}>Book Sarah</button>
                <button onClick={() => showToast('Opening messages...')} style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', color: '#374151', fontWeight: 700, padding: '10px 16px', borderRadius: 100, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Message
                </button>
              </div>
              <div style={s.sideCard}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Badges</div>
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
                    <div style={{ height: '100%', width: '85%', background: '#1a7f5e', borderRadius: 100 }}/>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 900, color: '#1a7f5e' }}>85%</span>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 12 }}>Add a resume to reach 100%</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[['Profile photo',true],['About section',true],['Hourly rate',true],['Credentials uploaded',true],['Resume uploaded',false],['Availability set',true]].map(([label,done]) => (
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
              </div>

              {/* Verifications */}
              <div style={s.sideCard}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Verifications</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[['Texas RDH License','✓ Verified','#1a7f5e'],['CPR/BLS Certified','⚠ Expiring','#92400e'],['Local Anesthesia','✓ Verified','#1a7f5e'],['Nitrous Oxide Permit','✓ Verified','#1a7f5e']].map(([label,val,color],i,arr) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < arr.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                      <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response time */}
              <div style={s.sideCard}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Response time</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a7f5e' }}/>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a' }}>&lt; 2 hours</span>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>Average response to invites</p>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* MOBILE TOOLBAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home',        path: '/provider-dashboard',   icon: <HomeIcon /> },
          { label: 'Requests',    path: '/provider-requests',    icon: <ReqIcon />, badge: 2 },
          { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
          { label: 'Messages',    path: '/provider-messages',    icon: <MsgIcon /> },
          { label: 'Earnings',    path: '/provider-earnings',    icon: <EarnIcon /> },
        ].map(({ label, path, icon, badge }) => (
          <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
            <div className="relative">
              <span className="text-[#9ca3af]">{icon}</span>
              {badge && <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{badge}</span>}
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
