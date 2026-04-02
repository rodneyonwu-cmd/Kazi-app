import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const roles = ['All', 'Dental Hygienist', 'Dental Assistant', 'Front Desk', 'Treatment Coordinator']

const reliabilityDisplay = (r) => {
  if (r >= 95) return { label: 'Excellent', color: 'text-[#166534]', bg: 'bg-[#dcfce7]' }
  if (r >= 85) return { label: 'Very Good', color: 'text-[#5b21b6]', bg: 'bg-[#ede9fe]' }
  if (r >= 70) return { label: 'Good', color: 'text-[#9a3412]', bg: 'bg-[#ffedd5]' }
  return { label: 'Poor', color: 'text-[#991b1b]', bg: 'bg-[#fee2e2]' }
}

export default function SavedProfessionals() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [selectedRole, setSelectedRole] = useState('All')
  const [toast, setToast] = useState(null)
  const [saved, setSaved] = useState([])
  const [officeId, setOfficeId] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        // Get office ID first
        const meRes = await fetch(`${API_URL}/api/offices/me`, { headers })
        if (!meRes.ok) return
        const meData = await meRes.json()
        setOfficeId(meData.id)

        // Then fetch saved providers
        const savedRes = await fetch(`${API_URL}/api/offices/${meData.id}/saved-providers`, { headers })
        if (savedRes.ok) {
          const savedData = await savedRes.json()
          setSaved(savedData)
        }
      } catch (err) {
        console.error('Failed to fetch saved professionals:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSaved()
  }, [getToken])

  const filtered = saved.filter(p => {
    if (selectedRole !== 'All' && p.role !== selectedRole) return false
    return true
  })

  const handleRemove = async (pro) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/offices/${officeId}/save-provider/${pro.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSaved(prev => prev.filter(p => p.id !== pro.id))
        showToast(`${pro.name} removed from saved`)
      } else {
        showToast('Failed to remove professional')
      }
    } catch (err) {
      showToast('Failed to remove professional')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6]">
        <Nav />
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-[#9ca3af]">Loading saved professionals...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      <div className="max-w-[700px] mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[24px] font-extrabold text-[#1a1a1a] mb-1">Saved Professionals</h1>
            <p className="text-[14px] text-[#9ca3af]">{filtered.length} professional{filtered.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button onClick={() => navigate('/professionals')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-5 py-2.5 rounded-full text-sm transition flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Browse professionals
          </button>
        </div>

        {/* Role filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-[1.5px] transition ${selectedRole === role ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white font-bold' : 'border-[#e5e7eb] text-[#374151] bg-white hover:border-[#1a7f5e]'}`}
            >
              {role}
            </button>
          ))}
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">
              {selectedRole !== 'All' ? `No saved ${selectedRole}s` : 'No saved professionals'}
            </p>
            <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6 max-w-[260px]">
              {selectedRole !== 'All' ? 'Try a different role filter or browse professionals to save more.' : 'Professionals you save will appear here for quick access and rebooking.'}
            </p>
            {selectedRole !== 'All' ? (
              <button onClick={() => setSelectedRole('All')} className="border-[1.5px] border-[#e5e7eb] text-[#374151] font-bold px-6 py-2.5 rounded-full text-sm hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                Clear filter
              </button>
            ) : (
              <button onClick={() => navigate('/professionals')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition">
                Browse professionals
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(pro => {
              const rel = reliabilityDisplay(pro.reliability || 0)
              return (
                <div key={pro.id} className="bg-white border border-[#e5e7eb] rounded-2xl p-4 flex items-center gap-4 hover:border-[#d1d5db] transition">

                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <InitialsAvatar name={pro.name} size={56} />
                    {pro.verified && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center" style={{ backgroundColor: '#4c1d95' }}>
                        <svg width="9" height="7" viewBox="0 0 14 11" fill="none"><path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[15px] font-extrabold text-[#1a1a1a]">{pro.name}</span>
                      {pro.available
                        ? <span className="text-[11px] font-semibold text-[#1a7f5e]">● Available</span>
                        : <span className="text-[11px] font-semibold text-[#9ca3af]">○ Unavailable</span>
                      }
                    </div>
                    <p className="text-[13px] text-[#6b7280] mb-1.5">{pro.role}{pro.miles != null ? ` · ${pro.miles} mi` : ''}{pro.rate != null ? ` · $${pro.rate}/hr` : ''}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {pro.rating != null && (
                        <span className="text-sm font-bold text-[#F97316]">★ {pro.rating} {pro.reviews != null && <span className="text-xs font-normal text-[#9ca3af]">({pro.reviews})</span>}</span>
                      )}
                      {pro.reliability != null && (
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${rel.bg} ${rel.color}`}>{rel.label} · {pro.reliability}%</span>
                      )}
                      {(pro.software || []).slice(0, 2).map(s => (
                        <span key={s} className="text-[11px] font-semibold text-[#0f4d38] bg-[#e8f5f0] px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => navigate('/profile')}
                      className="border-[1.5px] border-[#e5e7eb] text-[#374151] font-semibold px-4 py-2 rounded-full text-[13px] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate('/professionals')}
                      className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-4 py-2 rounded-full text-[13px] transition"
                    >
                      Invite
                    </button>
                    <button
                      onClick={() => handleRemove(pro)}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#9ca3af] hover:text-[#dc2626] hover:bg-[#fee2e2] transition"
                      title="Remove from saved"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none"/></svg>
                    </button>
                  </div>

                </div>
              )
            })}
          </div>
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
