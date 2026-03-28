import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

const reviews = [
  {
    id: 1,
    name: 'Sarah R.',
    role: 'Dental Hygienist',
    rating: 5,
    date: 'Mar 14, 2026',
    text: 'Amazing office to work at. Team was super welcoming, instruments were prepped and ready, and the schedule was well-organized. Would absolutely come back.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: 2,
    name: 'Aisha L.',
    role: 'Dental Hygienist',
    rating: 5,
    date: 'Feb 28, 2026',
    text: 'Very professional environment. Dr. O and the team made me feel like part of the crew from day one. Clean office, great equipment.',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
  },
  {
    id: 3,
    name: 'Devon K.',
    role: 'Dental Assistant',
    rating: 4,
    date: 'Feb 10, 2026',
    text: 'Good experience overall. Busy day but the team was supportive and communicated well. Parking was easy too.',
    avatar: 'https://randomuser.me/api/portraits/men/42.jpg',
  },
  {
    id: 4,
    name: 'Nina P.',
    role: 'Dental Assistant',
    rating: 5,
    date: 'Jan 22, 2026',
    text: 'One of my favorite offices on kazi. Great management, instruments are always ready, and they pay promptly.',
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
  },
]

const photos = [
  'https://images.unsplash.com/photo-1629909615957-be38d48fbbe4?w=600&q=80',
  'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=600&q=80',
  'https://images.unsplash.com/photo-1588776814546-1ffbb24b94d7?w=600&q=80',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80',
  'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80',
  'https://images.unsplash.com/photo-1598256989801-70a5a99c1547?w=600&q=80',
]

const Stars = ({ count }) => (
  <span className="text-[#F97316] text-[14px]">
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
)

export default function OfficeProfile() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews',  label: `Reviews` },
    { id: 'photos',   label: 'Photos' },
  ]

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

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

        {/* ── HEADER CARD ── */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-5 mb-5">

            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#1a7f5e] flex items-center justify-center">
                <span className="text-white text-xl font-extrabold">ED</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#5b21b6] border-2 border-white flex items-center justify-center">
                <svg width="11" height="9" viewBox="0 0 14 11" fill="none">
                  <path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Name & meta */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[22px] font-extrabold text-[#1a1a1a] mb-0.5">Evolve Dentistry</h1>
              <p className="text-[14px] text-[#6b7280] mb-2">General & Cosmetic Dentistry · Missouri City, TX</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[#F97316] font-bold text-[14px]">★ {avgRating}</span>
                <span className="text-[13px] text-[#6b7280]">({reviews.length} reviews)</span>
                <span className="text-[#d1d5db]">·</span>
                <span className="text-[12px] font-bold text-[#166534] bg-[#dcfce7] px-2.5 py-0.5 rounded-full">Excellent · 98%</span>
                <span className="text-[#d1d5db]">·</span>
                <span className="text-[13px] text-[#6b7280]">124 shifts posted</span>
              </div>
              <p className="text-[12px] text-[#1a7f5e] font-semibold mt-2">
                ⚡ Responds in &lt; 1 hr · 87% of temps return
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {[
              { value: '< 1 hr',  label: 'Response Time' },
              { value: '124',     label: 'Shifts Posted' },
              { value: '98%',     label: 'Fill Rate' },
              { value: '87%',     label: 'Return Rate' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl px-3 py-3 text-center">
                <p className="text-[16px] font-extrabold text-[#1a7f5e]">{stat.value}</p>
                <p className="text-[11px] text-[#9ca3af] font-semibold mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Address / phone / parking */}
          <div className="flex items-center gap-5 flex-wrap text-[13px] text-[#6b7280]">
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              123 Dental Way, Missouri City, TX 77459
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              832-440-1144
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 4v4h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              Free lot on site — always available
            </span>
          </div>
        </div>

        {/* ── TABS ── */}
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

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <h2 className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">About</h2>
              <p className="text-[14px] text-[#374151] leading-relaxed mb-6">
                Evolve Dentistry is a modern, patient-focused general and cosmetic dental practice serving the Missouri City and Houston area. We are a fast-paced, 6-chair practice known for our warm, welcoming environment and commitment to clinical excellence. Our team values collaboration, punctuality, and a positive work culture. Temp professionals are treated as full team members and given everything they need to run a smooth, productive day.
              </p>

              <h2 className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">Office details</h2>
              <div className="bg-[#f9f8f6] rounded-xl overflow-hidden mb-6">
                {[
                  { label: 'Specialty',       value: 'General & Cosmetic Dentistry' },
                  { label: 'Practice type',   value: 'Independent · Single location' },
                  { label: 'Chairs',          value: '6 operatories' },
                  { label: 'Software',        value: 'Eaglesoft' },
                  { label: 'Typical hours',   value: '8:00 AM – 5:00 PM' },
                  { label: 'Parking',         value: 'Free lot on site' },
                  { label: 'Website',         value: 'www.evolvedentistry.com' },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}>
                    <span className="text-[13px] text-[#9ca3af] font-medium">{label}</span>
                    <span className="text-[13px] font-semibold text-[#1a1a1a]">{value}</span>
                  </div>
                ))}
              </div>

              <h2 className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">What to expect</h2>
              <div className="flex flex-col gap-2">
                {[
                  'Instruments and tray setups ready before you arrive',
                  'Full column of patients — typically 8–10/day',
                  'Friendly front desk team to assist with scheduling',
                  'Eaglesoft — training available if needed',
                  'On-site parking, no cost',
                  'Lunch break provided — typically 30–45 min',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2.5 text-[13px] text-[#374151]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── REVIEWS ── */}
          {activeTab === 'reviews' && (
            <div className="p-6">
              {/* Rating summary */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[#f3f4f6]">
                <div className="text-center">
                  <p className="text-[48px] font-extrabold text-[#1a1a1a] leading-none">{avgRating}</p>
                  <Stars count={5} />
                  <p className="text-[12px] text-[#9ca3af] mt-1">{reviews.length} reviews</p>
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
                      <img src={review.avatar} className="w-10 h-10 rounded-full object-cover" alt={review.name} />
                      <div>
                        <p className="text-[14px] font-bold text-[#1a1a1a]">{review.name}</p>
                        <p className="text-[12px] text-[#9ca3af]">{review.role} · {review.date}</p>
                      </div>
                      <div className="ml-auto">
                        <Stars count={review.rating} />
                      </div>
                    </div>
                    <p className="text-[13px] text-[#374151] leading-relaxed">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── PHOTOS ── */}
          {activeTab === 'photos' && (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3">
                {photos.map((src, i) => (
                  <div key={i} className="aspect-video rounded-xl overflow-hidden bg-[#f3f4f6]">
                    <img
                      src={src}
                      alt={`Office photo ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
