import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const navigate = useNavigate()
  const [selectedDay, setSelectedDay] = useState(null)
  const [showBookForm, setShowBookForm] = useState(false)

  const availableDays = [16, 17, 19, 20, 23, 24, 26, 27, 30, 31]
  const bookedDays = [18, 21, 25]

  const getDayClass = (day) => {
    if (bookedDays.includes(day)) return 'bg-[#fef3c7] text-[#92400e] cursor-not-allowed'
    if (availableDays.includes(day)) return selectedDay === day
      ? 'bg-[#1a7f5e] text-white cursor-pointer'
      : 'bg-[#e8f5f0] text-[#1a7f5e] cursor-pointer hover:bg-[#1a7f5e] hover:text-white'
    return 'text-[#9ca3af]'
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">

      {/* Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] h-16 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-[#1a7f5e] font-bold text-2xl cursor-pointer" onClick={() => navigate('/dashboard')}>kazi.</span>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-sm text-[#6b7280] cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="text-sm text-[#6b7280] cursor-pointer">Applicants</span>
            <span className="text-sm font-semibold text-[#1a7f5e] cursor-pointer" onClick={() => navigate('/professionals')}>Professionals</span>
            <span className="text-sm text-[#6b7280] cursor-pointer">Bookings</span>
            <span className="text-sm text-[#6b7280] cursor-pointer">Messages</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1a7f5e] text-white text-sm font-bold flex items-center justify-center cursor-pointer">BS</div>
        </div>
      </nav>

      {/* Back */}
      <div className="max-w-[1100px] mx-auto px-6 py-4">
        <button onClick={() => navigate('/professionals')} className="text-sm text-[#1a7f5e] font-semibold flex items-center gap-1 hover:opacity-80 transition">
          ← Back to search
        </button>
      </div>

      {/* Body */}
      <div className="max-w-[1100px] mx-auto px-6 pb-20 grid grid-cols-[1fr_280px] gap-6 items-start">

        {/* Left */}
        <div className="flex flex-col gap-5">

          {/* Hero */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
            <div className="inline-block bg-[#e8f5f0] text-[#1a7f5e] text-xs font-bold px-3 py-1 rounded-full mb-4">✓ Booked with you before</div>
            <div className="flex items-start gap-5 mb-6">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" className="w-24 h-24 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Sarah R.</h1>
                <p className="text-sm text-[#6b7280] mb-1">Dental Hygienist</p>
                <p className="text-sm text-[#F97316] mb-1">★★★★★ <span className="text-[#6b7280]">5 (63 reviews)</span></p>
                <p className="text-xs text-[#6b7280] flex items-center gap-1 mb-1">📍 8.2 miles away · Houston, TX</p>
                <p className="text-xs text-[#1a7f5e] flex items-center gap-1">⚡ active 2 days ago</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-[#1a1a1a]">$52<span className="text-base font-normal text-[#6b7280]">/hr</span></p>
                <p className="text-xs text-[#6b7280]">Typical hourly rate</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { val: '< 2hrs', label: 'Response Time' },
                { val: '147', label: 'Shifts on Kazi' },
                { val: '98%', label: 'Reliability' },
                { val: '92%', label: 'Acceptance Rate' },
              ].map((stat, i) => (
                <div key={i} className="bg-[#f9f8f6] rounded-xl p-3 text-center">
                  <p className="text-base font-extrabold text-[#1a7f5e]">{stat.val}</p>
                  <p className="text-xs text-[#6b7280]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-[#1a1a1a] mb-3">About</h2>
            <p className="text-sm text-[#6b7280] leading-relaxed">Experienced RDH with 12 years in general and perio practices. Highly proficient in Eaglesoft, same-day bookings welcome, and consistent 5-star reviews from offices across Houston. I take pride in thorough debridement, clear communication with patients, and building lasting partnerships with the offices I work with.</p>
          </div>

          {/* Resume */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-[#1a1a1a] mb-3">Resume</h2>
            <div className="flex items-center gap-4 bg-[#f9f8f6] rounded-xl p-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1a1a1a]">Sarah_Rodriguez_Resume.pdf</p>
                <p className="text-xs text-[#6b7280]">Updated March 2026 · 245 KB</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="cursor-pointer text-[#6b7280]">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
          </div>

          {/* Availability Calendar */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-[#1a1a1a] mb-4">Availability</h2>
            <div className="flex items-center justify-between mb-4">
              <button className="text-lg text-[#6b7280] hover:text-[#1a1a1a] px-2">‹</button>
              <p className="text-sm font-bold text-[#1a1a1a]">March 2026</p>
              <button className="text-lg text-[#6b7280] hover:text-[#1a1a1a] px-2">›</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(d => (
                <div key={d} className="text-center text-xs font-bold text-[#9ca3af] py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {[...Array(31)].map((_, i) => {
                const day = i + 1
                return (
                  <div
                    key={day}
                    onClick={() => {
                      if (availableDays.includes(day)) {
                        setSelectedDay(day)
                        setShowBookForm(true)
                      }
                    }}
                    className={`text-center text-xs py-2 rounded-lg font-semibold transition ${getDayClass(day)}`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#1a7f5e]"></div><span className="text-xs text-[#6b7280]">Available</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div><span className="text-xs text-[#6b7280]">Booked</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#d1d5db]"></div><span className="text-xs text-[#6b7280]">Unavailable</span></div>
            </div>
            <p className="text-xs text-[#9ca3af] italic mb-4">Tap an available date to send a booking request</p>

            {/* Booking form */}
            {showBookForm && (
              <div className="bg-[#f9f8f6] rounded-2xl p-5">
                <p className="text-xs text-[#6b7280] font-semibold mb-1">Book Sarah for</p>
                <p className="text-base font-extrabold text-[#1a1a1a] mb-4">March {selectedDay}, 2026</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Start Time</p>
                    <select className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a7f5e]">
                      <option>7:00 AM</option>
                      <option selected>7:30 AM</option>
                      <option>8:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-1">End Time</p>
                    <select className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a7f5e]">
                      <option>4:00 PM</option>
                      <option>4:30 PM</option>
                      <option selected>5:00 PM</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Note to Professional (Optional)</p>
                  <textarea placeholder="e.g. Please arrive 10 minutes early..." className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] resize-none h-20" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowBookForm(false); setSelectedDay(null) }} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">Cancel</button>
                  <button className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-sm transition">Send booking request</button>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-[#1a1a1a] mb-3">Skills & Experience</h2>
            <div className="flex flex-wrap gap-2">
              {['Scaling & Root Planing', 'Periodontal Charting', 'Digital X-rays', 'Patient Education', 'Nitrous Oxide Monitoring', 'Local Anesthesia Administration'].map(skill => (
                <span key={skill} className="px-3 py-1 bg-[#e8f5f0] text-[#1a7f5e] text-xs font-semibold rounded-full">{skill}</span>
              ))}
            </div>
          </div>

          {/* Practice Software */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-[#1a1a1a] mb-3">Practice Software</h2>
            <div className="flex flex-wrap gap-2">
              {['Eaglesoft', 'Dentrix', 'Open Dental'].map(s => (
                <span key={s} className="px-3 py-1 bg-[#f9f8f6] border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold rounded-full">{s}</span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6">
            <h2 className="text-base font-extrabold text-[#1a1a1a] mb-4">Reviews (63)</h2>
            <div className="flex gap-3 mb-5">
              {['All (5)', 'Positive (4)', 'Critical (1)'].map((tab, i) => (
                <button key={tab} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition ${i === 0 ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              {[
                { office: 'Bright Smile Dental', date: 'March 10, 2026', text: 'Sarah was absolutely phenomenal! She integrated seamlessly into our practice, had excellent rapport with patients, and her clinical skills were outstanding. We\'ve already invited her back for multiple shifts.', tags: ['Professional', 'On-time', 'Great communication', 'Skilled'] },
                { office: 'Houston Family Dentistry', date: 'February 28, 2026', text: 'Sarah arrived early, jumped right in, and handled a full schedule with grace. Our patients loved her gentle touch and thorough explanations. Will definitely book again!', tags: ['Professional', 'On-time', 'Great communication'] },
                { office: 'Clear Lake Dental Care', date: 'February 15, 2026', text: 'Very impressed with Sarah\'s professionalism and expertise. She\'s highly skilled in perio maintenance and her charting was impeccable. A true asset to any practice.', tags: ['Skilled', 'Professional', 'Great communication'] },
              ].map((review, i) => (
                <div key={i} className="border-b border-[#e5e7eb] pb-5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-[#1a1a1a]">{review.office}</p>
                    <p className="text-xs text-[#9ca3af]">{review.date}</p>
                  </div>
                  <p className="text-xs text-[#F97316] mb-2">★★★★★</p>
                  <p className="text-sm text-[#6b7280] mb-3">{review.text}</p>
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

        {/* Right Sidebar */}
        <div className="flex flex-col gap-4 sticky top-24">

          {/* Action buttons */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
            <button className="w-full border border-[#1a7f5e] text-[#1a7f5e] font-bold py-3 rounded-full text-sm hover:bg-[#e8f5f0] transition mb-3">
              Send invite
            </button>
            <button className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition mb-3">
              Book Sarah
            </button>
            <button onClick={() => navigate('/messages')} className="w-full border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message
            </button>
          </div>

          {/* Badges */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Badges</h3>
            <div className="flex gap-2 flex-wrap">
              {[
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f4d38" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5c842" strokeWidth="2.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
              ].map((icon, i) => (
                <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center ${i === 3 ? 'bg-[#0f4d38]' : 'bg-[#e8f5f0]'}`}>
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Verifications */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
            <h3 className="text-sm font-extrabold text-[#1a1a1a] mb-3">Verifications</h3>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Texas RDH License', val: '✓ Verified' },
                { label: 'CPR/BLS Certified', val: '✓ Verified' },
                { label: 'Local Anesthesia Permit', val: '✓ Verified' },
                { label: 'Nitrous Oxide Permit', val: '✓ Verified' },
              ].map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-xs text-[#6b7280]">{v.label}</p>
                  <p className="text-xs font-bold text-[#1a7f5e]">{v.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Response time */}
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
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
  )
}