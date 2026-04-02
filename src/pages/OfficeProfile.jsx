import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const Stars = ({ count }) => (
  <span className="text-[#F97316] text-[14px]">
    {'★'.repeat(count)}{'☆'.repeat(5 - count)}
  </span>
)

export default function OfficeProfile() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [office, setOffice] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        const officeRes = await fetch(`${API_URL}/api/offices/me`, { headers })
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
  }, [getToken])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews',  label: 'Reviews' },
    { id: 'photos',   label: 'Photos' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6]">
        <Nav />
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

        {/* HEADER CARD */}
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-5 mb-5">

            {/* Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#1a7f5e] flex items-center justify-center">
                <span className="text-white text-xl font-extrabold">{officeInitials}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#5b21b6] border-2 border-white flex items-center justify-center">
                <svg width="11" height="9" viewBox="0 0 14 11" fill="none">
                  <path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
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
              <h2 className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">About</h2>
              {officeBio ? (
                <p className="text-[14px] text-[#374151] leading-relaxed mb-6">{officeBio}</p>
              ) : (
                <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6">No bio added yet. Go to Settings to add an office bio.</p>
              )}

              <h2 className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">Office details</h2>
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
    </div>
  )
}
