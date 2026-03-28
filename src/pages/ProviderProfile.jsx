import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['SU','MO','TU','WE','TH','FR','SA']

const bookedDays  = [10, 14, 17, 20, 25, 28]
const availDays   = [2,3,4,6,9,11,13,16,18,19,23,24,26,27,30]

const allReviews = [
  { id:1, office:'Evolve Dentistry', initials:'ED', logoBg:'bg-[#e8f5f0]', logoColor:'text-[#1a7f5e]', date:'Feb 12, 2026', stars:5, text:'Sarah was absolutely phenomenal. She arrived early, was incredibly professional with patients, and her clinical skills are top-notch. Will definitely request her again!', tags:['Professional','On-time','Great communication','Skilled'] },
  { id:2, office:'Clear Lake Dental', initials:'CL', logoBg:'bg-[#ede9fe]', logoColor:'text-[#5b21b6]', date:'Jan 8, 2026', stars:5, text:'One of the best hygienists we have had through Kazi. Excellent with patients and very thorough. Our team loved working with her.', tags:['Skilled','Professional','Great communication'] },
  { id:3, office:'Houston Family Dentistry', initials:'HF', logoBg:'bg-[#e8f5f0]', logoColor:'text-[#1a7f5e]', date:'Dec 3, 2025', stars:5, text:"Sarah is reliable, skilled, and a pleasure to work with. She adapted quickly to our workflow and our patients adored her.", tags:['Professional','On-time','Great communication'] },
  { id:4, office:'Bright Smile Dental', initials:'BS', logoBg:'bg-[#fef9c3]', logoColor:'text-[#92400e]', date:'Nov 14, 2025', stars:4, text:'Great hygienist, very professional and thorough. Would book again without hesitation.', tags:['Professional','Skilled'] },
]

export default function ProviderProfile() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const readOnly  = location.state?.readOnly === true
  const today     = new Date()
  const [monthIdx, setMonthIdx] = useState(today.getMonth())
  const [year,     setYear]     = useState(today.getFullYear())
  const [reviewTab, setReviewTab] = useState('All')
  const [editingAbout, setEditingAbout] = useState(false)
  const [editingRate,  setEditingRate]  = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [toast, setToast] = useState(null)

  const [about, setAbout] = useState('Experienced RDH with 12 years in general and perio practices. Highly proficient in Eaglesoft, same-day bookings welcome, and consistent 5-star reviews from offices across Houston. Known for her gentle approach with anxious patients and her ability to run a full hygiene column independently.')
  const [rate,  setRate]  = useState('52')

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const changeMonth = (delta) => {
    let m = monthIdx + delta, y = year
    if (m > 11) { m = 0; y++ }
    if (m <  0) { m = 11; y-- }
    setMonthIdx(m); setYear(y)
  }

  const firstDay    = new Date(year, monthIdx, 1).getDay()
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const daysInPrev  = new Date(year, monthIdx, 0).getDate()
  const isCurrent   = today.getFullYear() === year && today.getMonth() === monthIdx
  const total       = firstDay + daysInMonth
  const trailing    = total % 7 === 0 ? 0 : 7 - (total % 7)

  const getDayStyle = (d) => {
    const isToday  = isCurrent && d === today.getDate()
    const isBooked = bookedDays.includes(d)
    const isAvail  = availDays.includes(d)
    if (isToday)   return 'bg-[#1a7f5e] text-white font-black'
    if (isBooked)  return 'bg-[#fef3c7] text-[#d97706] font-bold cursor-not-allowed'
    if (isAvail)   return 'bg-[#e8f5f0] text-[#1a7f5e] font-semibold cursor-pointer hover:bg-[#1a7f5e] hover:text-white'
    return 'text-[#9ca3af]'
  }

  const avgRating = (allReviews.reduce((s,r) => s + r.stars, 0) / allReviews.length).toFixed(1)

  return (
    <div className="min-h-screen bg-[#f9f8f6]">

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="text-[17px] font-black text-[#1a1a1a]">Edit profile</h2>
              <button onClick={() => setShowEditModal(false)} className="w-8 h-8 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] hover:border-[#1a7f5e] transition">✕</button>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Photo */}
              <div className="flex items-center gap-4">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-16 h-16 rounded-full object-cover border-2 border-[#e5e7eb]" />
                <button className="border border-[#e5e7eb] text-[#374151] font-bold px-4 py-2 rounded-full text-[13px] hover:border-[#1a7f5e] transition">Change photo</button>
              </div>
              {[
                { label: 'Full name', placeholder: 'Sarah R.', type: 'text' },
                { label: 'Role', placeholder: 'Dental Hygienist', type: 'text' },
                { label: 'City', placeholder: 'Houston, TX', type: 'text' },
                { label: 'Hourly rate', placeholder: '52', type: 'number' },
                { label: 'Travel radius (miles)', placeholder: '25', type: 'number' },
              ].map(({ label, placeholder, type }) => (
                <div key={label}>
                  <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">{label}</p>
                  <input type={type} placeholder={placeholder} className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#1a7f5e] transition" />
                </div>
              ))}
              <div>
                <p className="text-[11px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1.5">About</p>
                <textarea rows={4} defaultValue={about} className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-4 py-2.5 text-[14px] outline-none focus:border-[#1a7f5e] transition resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditModal(false)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[14px]">Cancel</button>
                <button onClick={() => { setShowEditModal(false); showToast('Profile updated!') }} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-[14px] transition">Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ProviderNav />

      {/* BACK */}
      <div className="max-w-[860px] mx-auto px-4 md:px-6 py-4">
        <button onClick={() => navigate('/provider-dashboard')} className="text-sm text-[#1a7f5e] font-semibold flex items-center gap-1 hover:opacity-80 transition">
          ← Back to dashboard
        </button>
      </div>

      <div className={readOnly ? "max-w-[680px] mx-auto px-4 md:px-6 pb-20" : "max-w-[860px] mx-auto px-4 md:px-6 pb-20"}>
        <div className={readOnly ? "flex flex-col gap-4" : "flex flex-col md:grid md:grid-cols-[1fr_240px] gap-5 items-start"}>

          {/* ── LEFT COLUMN ── */}
          <div className="flex flex-col gap-4">

            {/* Hero card */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              {!readOnly && <div className="inline-flex items-center gap-1.5 bg-[#e8f5f0] text-[#1a7f5e] text-xs font-bold px-3 py-1 rounded-full mb-4">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                Profile visible to offices
              </div>}
              {readOnly && (
                <div className="inline-flex items-center gap-1.5 bg-[#e8f5f0] text-[#1a7f5e] text-xs font-bold px-3 py-1 rounded-full mb-4">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                  This is how offices see your profile
                </div>
              )}
              <div className="flex items-start gap-4 mb-5">
                <div className="relative flex-shrink-0">
                  <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center bg-[#4c1d95]">
                    <svg width="12" height="10" viewBox="0 0 14 11" fill="none"><path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <h1 className="text-2xl font-extrabold text-[#111827] leading-tight">Sarah R.</h1>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {editingRate
                        ? <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="w-16 border border-[#1a7f5e] rounded-lg px-2 py-0.5 text-[17px] font-black text-[#1a1a1a] outline-none text-right" />
                        : <p className="text-xl font-extrabold text-[#111827]">${rate}<span className="text-xs font-normal text-[#4b5563]">/hr</span></p>
                      }
                      {!readOnly && <button onClick={() => { if (editingRate) showToast('Rate updated!'); setEditingRate(!editingRate) }} className="text-[#1a7f5e] text-xs font-semibold hover:underline ml-1">{editingRate ? 'Save' : 'Edit'}</button>}
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#4b5563] mb-2">Dental Hygienist · Houston, TX</p>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-lg font-extrabold text-[#F97316]">★ {avgRating} <span className="text-sm text-[#4b5563] font-normal">({allReviews.length} reviews)</span></span>
                    <span className="text-[#d1d5db]">·</span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#dcfce7] text-[#166534]">Excellent · 98%</span>
                  </div>
                  <p className="text-xs text-[#1a7f5e] font-semibold">⚡ Active today · responds in &lt; 2 hrs</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: '< 2hrs', label: 'Response Time' },
                  { val: '147',    label: 'Shifts Completed' },
                  { val: '98%',    label: 'Reliability' },
                  { val: '92%',    label: 'Acceptance Rate' },
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
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-extrabold text-[#1a1a1a]">About</h2>
                {!readOnly && <button onClick={() => { if (editingAbout) showToast('About updated!'); setEditingAbout(!editingAbout) }} className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">{editingAbout ? 'Save' : 'Edit'}</button>}
              </div>
              {editingAbout
                ? <textarea value={about} onChange={e => setAbout(e.target.value)} rows={5} className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-4 py-3 text-[14px] text-[#374151] leading-relaxed outline-none focus:border-[#1a7f5e] transition resize-none" />
                : <p className="text-[15px] text-[#374151] leading-relaxed">{about}</p>
              }
            </div>

            {/* Availability Calendar */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-extrabold text-[#1a1a1a]">Availability</h2>
                <button onClick={() => navigate('/provider-schedule')} className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">Edit hours →</button>
              </div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="text-lg text-[#6b7280] hover:text-[#1a1a1a] px-2">‹</button>
                <p className="text-sm font-bold text-[#1a1a1a]">{MONTHS[monthIdx]} {year}</p>
                <button onClick={() => changeMonth(1)} className="text-lg text-[#6b7280] hover:text-[#1a1a1a] px-2">›</button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(d => <div key={d} className="text-center text-[10px] font-bold text-[#9ca3af] py-1">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`p${i}`} className="text-center text-xs py-2 rounded-lg text-[#d1d5db]">{daysInPrev - firstDay + i + 1}</div>
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const d = i + 1
                  return <div key={d} className={`text-center text-xs py-2 rounded-lg font-semibold transition ${getDayStyle(d)}`}>{d}</div>
                })}
                {Array.from({ length: trailing }, (_, i) => (
                  <div key={`t${i}`} className="text-center text-xs py-2 rounded-lg text-[#d1d5db]">{i + 1}</div>
                ))}
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#1a7f5e]" /><span className="text-xs text-[#6b7280]">Available</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#f59e0b]" /><span className="text-xs text-[#6b7280]">Booked</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#d1d5db]" /><span className="text-xs text-[#6b7280]">Unavailable</span></div>
              </div>
              <p className="text-xs text-[#9ca3af] italic">This calendar is visible to offices when they view your profile</p>
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
                <div className="flex gap-2">
{!readOnly && <button className="text-[12px] font-bold text-[#374151] border border-[#e5e7eb] px-3 py-1.5 rounded-full hover:border-[#1a7f5e] transition">Replace</button>}
                  <button onClick={() => showToast('Resume downloaded!')} className="text-[#6b7280] hover:text-[#1a7f5e] transition p-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-[#1a1a1a]">Skills & Experience</h2>
                {!readOnly && <button className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">Edit</button>}
              </div>
              <div className="flex flex-wrap gap-2">
                {['Scaling & Root Planing', 'Periodontal Charting', 'Digital X-rays', 'Patient Education', 'Nitrous Oxide Monitoring', 'Local Anesthesia Administration', 'Perio Maintenance', 'High-Volume Scheduling'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-[#e8f5f0] text-[#0f4d38] text-xs font-semibold rounded-full">{skill}</span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-[#1a1a1a]">Certifications</h2>
{!readOnly && <button onClick={() => navigate('/provider-documents')} className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">Manage →</button>}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Texas RDH License', ok: true },
                  { label: 'CPR/BLS Certified', ok: false },
                  { label: 'Local Anesthesia Permit', ok: true },
                  { label: 'Nitrous Oxide Permit', ok: true },
                ].map(c => (
                  <span key={c.label} className={`text-xs font-semibold px-3 py-1 rounded-full ${c.ok ? 'text-[#374151] bg-[#f3f4f6]' : 'text-[#92400e] bg-[#fef9c3]'}`}>
                    {c.ok ? '✓' : '⚠'} {c.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Practice Software */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-extrabold text-[#1a1a1a]">Practice Software</h2>
                {!readOnly && <button className="text-[13px] font-semibold text-[#1a7f5e] hover:underline">Edit</button>}
              </div>
              <div className="flex flex-wrap gap-2">
                {['Eaglesoft', 'Dentrix', 'Open Dental'].map(s => (
                  <span key={s} className="px-3 py-1 bg-[#e8f5f0] text-[#0f4d38] text-xs font-semibold rounded-full">{s}</span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
              <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-4">Reviews ({allReviews.length})</h2>
              {/* Rating summary */}
              <div className="flex items-center gap-5 bg-[#f9f8f6] rounded-xl p-4 mb-4">
                <div className="text-center flex-shrink-0">
                  <p className="text-[42px] font-black text-[#1a1a1a] leading-none">{avgRating}</p>
                  <div className="flex justify-center my-1 gap-0.5">
                    {[1,2,3,4,5].map(s => <span key={s} className="text-[#F97316] text-[14px]">★</span>)}
                  </div>
                  <p className="text-[11px] text-[#9ca3af]">{allReviews.length} reviews</p>
                </div>
                <div className="flex-1">
                  {[5,4,3,2,1].map(star => {
                    const count = allReviews.filter(r => r.stars === star).length
                    const pct   = Math.round((count / allReviews.length) * 100)
                    return (
                      <div key={star} className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] text-[#9ca3af] w-2">{star}</span>
                        <div className="flex-1 h-1.5 bg-[#e5e7eb] rounded-full overflow-hidden">
                          <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-[#9ca3af] w-6">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                {['All', 'Positive', 'Critical'].map(t => (
                  <button key={t} onClick={() => setReviewTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${reviewTab === t ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}>{t}</button>
                ))}
              </div>
              <div className="flex flex-col gap-5">
                {allReviews.filter(r => reviewTab === 'All' || (reviewTab === 'Positive' && r.stars >= 4) || (reviewTab === 'Critical' && r.stars < 4)).map(r => (
                  <div key={r.id} className="border-b border-[#e5e7eb] pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-[9px] ${r.logoBg} flex items-center justify-center text-[10px] font-black ${r.logoColor} flex-shrink-0`}>{r.initials}</div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#1a1a1a]">{r.office}</p>
                        <p className="text-xs text-[#9ca3af]">{r.date}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= r.stars ? 'text-[#F97316]' : 'text-[#e5e7eb]'}`}>★</span>)}
                      </div>
                    </div>
                    <p className="text-sm text-[#374151] leading-relaxed mb-2">{r.text}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.tags.map(tag => <span key={tag} className="px-2 py-0.5 bg-[#f9f8f6] border border-[#e5e7eb] text-xs text-[#6b7280] rounded-full">{tag}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          {readOnly ? (
            <div className="flex flex-col gap-4 md:sticky md:top-24">
              {/* Office action buttons */}
              <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex flex-col gap-2">
                <button onClick={() => showToast('Invite sent to Sarah R.!')} className="w-full bg-white border border-[#1a7f5e] text-[#1a7f5e] font-bold py-2.5 rounded-full text-sm hover:bg-[#e8f5f0] transition">Send invite</button>
                <button onClick={() => showToast('Booking Sarah R...!')} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition">Book Sarah</button>
                <button onClick={() => showToast('Opening messages...')} className="w-full border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition flex items-center justify-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Message
                </button>
              </div>
              {/* Badges */}
              <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
                <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Badges</h3>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { bg: '#0f4d38', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5c842" strokeWidth="2.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, tip: 'Top Rated' },
                    { bg: '#e8f5f0', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, tip: 'Verified' },
                    { bg: '#e8f5f0', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, tip: 'Fast Responder' },
                    { bg: '#ede9fe', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, tip: '98% Reliable' },
                  ].map((badge, i) => (
                    <div key={i} title={badge.tip} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition" style={{ background: badge.bg }}>{badge.icon}</div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
          <div className="flex flex-col gap-4 md:sticky md:top-24">

            {/* Edit actions */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <button onClick={() => setShowEditModal(true)} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition mb-2 flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit profile
              </button>
              <button onClick={() => navigate('/provider-documents')} className="w-full border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition mb-2">
                Manage credentials
              </button>
              <button onClick={() => navigate('/provider-schedule')} className="w-full border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Edit availability
              </button>
            </div>

            {/* Profile strength */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Profile strength</h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a7f5e] rounded-full" style={{ width: '85%' }} />
                </div>
                <span className="text-sm font-black text-[#1a7f5e]">85%</span>
              </div>
              <p className="text-xs text-[#9ca3af] mb-3">Add a resume to reach 100%</p>
              <div className="flex flex-col gap-1.5">
                {[
                  { label: 'Profile photo', done: true },
                  { label: 'About section', done: true },
                  { label: 'Hourly rate', done: true },
                  { label: 'Credentials uploaded', done: true },
                  { label: 'Resume uploaded', done: false },
                  { label: 'Availability set', done: true },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-[#1a7f5e]' : 'border-2 border-[#e5e7eb]'}`}>
                      {done && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>}
                    </div>
                    <span className={`text-xs ${done ? 'text-[#374151]' : 'text-[#9ca3af]'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Badges</h3>
              <div className="flex gap-2 flex-wrap">
                {[
                  { bg: '#0f4d38', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5c842" strokeWidth="2.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, tip: 'Top Rated' },
                  { bg: '#e8f5f0', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, tip: 'Verified' },
                  { bg: '#e8f5f0', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, tip: 'Fast Responder' },
                  { bg: '#ede9fe', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, tip: '98% Reliable' },
                ].map((badge, i) => (
                  <div key={i} title={badge.tip} className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80 transition" style={{ background: badge.bg }}>{badge.icon}</div>
                ))}
              </div>
            </div>

            {/* Verifications */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Verifications</h3>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Texas RDH License', val: '✓ Verified', color: 'text-[#1a7f5e]' },
                  { label: 'CPR/BLS Certified', val: '⚠ Expiring', color: 'text-[#92400e]' },
                  { label: 'Local Anesthesia', val: '✓ Verified', color: 'text-[#1a7f5e]' },
                  { label: 'Nitrous Oxide Permit', val: '✓ Verified', color: 'text-[#1a7f5e]' },
                ].map((v, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-[#f3f4f6] last:border-0">
                    <p className="text-xs text-[#6b7280]">{v.label}</p>
                    <p className={`text-xs font-bold ${v.color}`}>{v.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Response time */}
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4">
              <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-2">Response time</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1a7f5e]" />
                <p className="text-sm font-bold text-[#1a1a1a]">&lt; 2 hours</p>
              </div>
              <p className="text-xs text-[#6b7280] mt-1">Average response to invites</p>
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
