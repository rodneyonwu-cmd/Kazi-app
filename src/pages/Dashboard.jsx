import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import Nav from '../components/Nav'
import InitialsAvatar from '../components/InitialsAvatar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()

  const [shiftModal, setShiftModal] = useState(null)
  const [shiftApplicants, setShiftApplicants] = useState([])
  const [loadingApps, setLoadingApps] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editFields, setEditFields] = useState({})
  const [cancelled, setCancelled] = useState({})
  const [toast, setToast] = useState(null)

  const [office, setOffice] = useState(null)
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const openShiftDrawer = async (shift) => {
    setShiftModal(shift)
    setShiftApplicants([])
    setEditMode(false)
    setEditFields({})
    setLoadingApps(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/shifts/${shift.rawId || shift.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setShiftApplicants(data.applications || [])
      }
    } catch {}
    setLoadingApps(false)
  }

  const handleAppAction = async (appId, status, name) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/applications/${appId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setShiftApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : (status === 'ACCEPTED' && a.status === 'PENDING' ? { ...a, status: 'DECLINED' } : a)))
        showToast(status === 'ACCEPTED' ? `${name} accepted!` : `${name} declined`)
      }
    } catch { showToast('Action failed') }
  }

  const startEdit = () => {
    const s = shiftModal
    setEditFields({
      role: s.role || '', date: s.rawDate || '', time: s.time || '',
      rate: s.rate?.replace(/[^0-9.]/g, '') || '', description: s.description || '',
      schedule: s.schedule || '', salary: s.salary?.replace(/[^0-9]/g, '') || '',
    })
    setEditMode(true)
  }

  const saveEdit = async () => {
    try {
      const token = await getToken()
      const body = {}
      if (editFields.role) body.role = editFields.role
      if (editFields.description) body.description = editFields.description
      const rateNum = parseFloat(editFields.rate)
      if (!isNaN(rateNum) && rateNum > 0) body.hourlyRate = rateNum
      const res = await fetch(`${API_URL}/api/shifts/${shiftModal.rawId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setShifts(prev => prev.map(s => s.id === shiftModal.id ? { ...s, role: body.role || s.role, name: body.role || s.name, rate: body.hourlyRate ? `$${body.hourlyRate}/hr` : s.rate } : s))
        setShiftModal(prev => ({ ...prev, role: body.role || prev.role, name: body.role || prev.name, rate: body.hourlyRate ? `$${body.hourlyRate}/hr` : prev.rate }))
        setEditMode(false)
        showToast('Post updated!')
      } else { showToast('Failed to update') }
    } catch { showToast('Failed to update') }
  }

  const cancelShift = async () => {
    if (!confirm('Are you sure you want to cancel this posting? This cannot be undone.')) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/shifts/${shiftModal.rawId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setShifts(prev => prev.filter(s => s.id !== shiftModal.id))
        setShiftModal(null)
        showToast('Posting cancelled')
      } else { showToast('Failed to cancel') }
    } catch { showToast('Failed to cancel') }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const token = await getToken()
        const headers = { Authorization: `Bearer ${token}` }

        const officeRes = await fetch(`${API_URL}/api/offices/me`, { headers })
        if (officeRes.ok) {
          const officeData = await officeRes.json()
          setOffice(officeData)

          // Fetch this office's shifts
          const shiftsRes = await fetch(`${API_URL}/api/shifts?officeId=${officeData.id}`, { headers })
          if (shiftsRes.ok) {
            const raw = await shiftsRes.json()
            const formatted = (Array.isArray(raw) ? raw : []).map(s => {
              const d = s.date ? new Date(s.date) : null
              const isPerm = s.jobType === 'PERMANENT'
              return {
                id: s.id,
                rawId: s.id,
                name: s.role,
                role: s.role,
                jobType: s.jobType || 'TEMPORARY',
                isPerm,
                date: d ? d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '',
                time: `${s.startTime || ''} – ${s.endTime || ''}`,
                rate: s.hourlyRate ? `$${s.hourlyRate}/hr` : '',
                salary: s.salaryMin ? `$${Number(s.salaryMin).toLocaleString()}${s.salaryMax ? ` – $${Number(s.salaryMax).toLocaleString()}` : ''}/yr` : '',
                schedule: s.schedule || '',
                status: s.status,
                confirmed: s.status === 'FILLED',
                applicants: s._count?.applications || 0,
              }
            })
            setShifts(formatted)
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [getToken])

  const firstName = office?.firstName || user?.firstName || 'there'

  const getStatusStyle = (shift) => {
    if (cancelled[shift.id]) return 'bg-red-50 text-red-400'
    if (shift.confirmed || shift.status === 'CONFIRMED') return 'bg-[#e8f5f0] text-[#1a7f5e]'
    return 'bg-[#fef3c7] text-[#92400e]'
  }

  const getStatusText = (shift) => {
    if (cancelled[shift.id]) return 'Cancelled'
    return shift.status || 'Pending'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f8f6]">
        <Nav />
        <div className="max-w-[680px] mx-auto px-6 py-7 pb-24 md:pb-10">
          {/* Greeting skeleton */}
          <div className="h-7 w-64 bg-[#e5e7eb] rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-80 bg-[#e5e7eb] rounded-lg mb-6 animate-pulse" />

          {/* CTA skeleton */}
          <div className="h-32 bg-[#e5e7eb] rounded-[20px] mb-4 animate-pulse" />

          {/* Quick actions skeleton */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="h-20 bg-[#e5e7eb] rounded-2xl animate-pulse" />
            <div className="h-20 bg-[#e5e7eb] rounded-2xl animate-pulse" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="h-24 bg-[#e5e7eb] rounded-2xl animate-pulse" />
            <div className="h-24 bg-[#e5e7eb] rounded-2xl animate-pulse" />
            <div className="h-24 bg-[#e5e7eb] rounded-2xl animate-pulse" />
          </div>

          {/* Shifts skeleton */}
          <div className="h-5 w-40 bg-[#e5e7eb] rounded-lg mb-3 animate-pulse" />
          <div className="space-y-3">
            <div className="h-24 bg-[#e5e7eb] rounded-[18px] animate-pulse" />
            <div className="h-24 bg-[#e5e7eb] rounded-[18px] animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Shift / Job Drawer */}
      {shiftModal && (() => {
        const s = shiftModal
        const isPerm = s.isPerm
        const pending = shiftApplicants.filter(a => a.status === 'PENDING')
        const accepted = shiftApplicants.filter(a => a.status === 'ACCEPTED')
        const declined = shiftApplicants.filter(a => a.status === 'DECLINED')
        const getAppName = (a) => {
          const f = a.provider?.user?.firstName || ''
          const l = a.provider?.user?.lastName || ''
          return f ? `${f} ${l ? l.charAt(0) + '.' : ''}`.trim() : 'Provider'
        }
        const getAppAvatar = (a) => a.provider?.user?.avatarUrl || null
        const getAppRole = (a) => {
          const r = a.provider?.role
          return { hygienist: 'Dental Hygienist', assistant: 'Dental Assistant', front: 'Front Office', dentist: 'Dentist' }[r] || r || ''
        }
        const getAppRating = (a) => {
          const reviews = a.provider?.reviews || []
          if (reviews.length > 0) return { value: (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1), count: reviews.length }
          return { value: 'New', count: 0 }
        }
        const getAppReliability = (a) => {
          const score = Math.round(a.provider?.reliabilityScore || 0)
          let label, color, bg
          if (score >= 95) { label = 'Excellent'; color = 'text-[#166534]'; bg = 'bg-[#dcfce7]' }
          else if (score >= 85) { label = 'Very Good'; color = 'text-[#1a7f5e]'; bg = 'bg-[#e8f5f0]' }
          else if (score >= 75) { label = 'Good'; color = 'text-[#92400e]'; bg = 'bg-[#fef9c3]' }
          else if (score >= 60) { label = 'Fair'; color = 'text-[#9a3412]'; bg = 'bg-[#ffedd5]' }
          else { label = 'Low'; color = 'text-[#991b1b]'; bg = 'bg-[#fee2e2]' }
          return { score, label, color, bg }
        }
        return (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShiftModal(null)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-[460px] bg-white z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-5 pt-10 pb-4 border-b border-[#f3f4f6] flex-shrink-0">
              <button onClick={() => setShiftModal(null)} className="flex items-center gap-1.5 text-[13px] font-bold text-[#6b7280] mb-3 bg-none border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>Back
              </button>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[18px] font-black text-[#1a1a1a]">{s.role}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPerm ? 'bg-[#ede9fe] text-[#5b21b6]' : 'bg-[#e8f5f0] text-[#1a7f5e]'}`}>{isPerm ? 'Permanent' : 'Temp'}</span>
                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full ' + getStatusStyle(s)}>{getStatusText(s)}</span>
                  </div>
                  <p className="text-[13px] text-[#6b7280]">{isPerm ? (s.schedule || 'Full-time') : `${s.date} · ${s.time}`}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[16px] font-black ${isPerm ? 'text-[#5b21b6]' : 'text-[#1a7f5e]'}`}>{isPerm ? (s.salary || s.rate) : s.rate}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {/* Edit mode */}
              {editMode ? (
                <div>
                  <div className="mb-4">
                    <label className="block text-[12px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">Role</label>
                    <input value={editFields.role} onChange={e => setEditFields(p => ({ ...p, role: e.target.value }))} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e]" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[12px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">{isPerm ? 'Hourly rate' : 'Hourly rate'}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]">$</span>
                      <input type="number" value={editFields.rate} onChange={e => setEditFields(p => ({ ...p, rate: e.target.value }))} className="w-full border border-[#e5e7eb] rounded-xl pl-8 py-3 text-sm outline-none focus:border-[#1a7f5e]" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-[12px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">Description</label>
                    <textarea value={editFields.description} onChange={e => setEditFields(p => ({ ...p, description: e.target.value }))} className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] resize-none h-32" style={{ fontFamily: 'inherit' }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditMode(false)} className="flex-1 bg-white border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px] cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel</button>
                    <button onClick={saveEdit} className="flex-1 bg-[#1a7f5e] text-white font-bold py-2.5 rounded-full text-[13px] border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Save changes</button>
                  </div>
                </div>
              ) : (<>

              {/* Applicant stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#fef9c3] rounded-xl p-3 text-center">
                  <p className="text-[20px] font-black text-[#92400e]">{pending.length}</p>
                  <p className="text-[10px] font-bold text-[#92400e] uppercase">Pending</p>
                </div>
                <div className="bg-[#e8f5f0] rounded-xl p-3 text-center">
                  <p className="text-[20px] font-black text-[#1a7f5e]">{accepted.length}</p>
                  <p className="text-[10px] font-bold text-[#1a7f5e] uppercase">Accepted</p>
                </div>
                <div className="bg-[#f3f4f6] rounded-xl p-3 text-center">
                  <p className="text-[20px] font-black text-[#6b7280]">{declined.length}</p>
                  <p className="text-[10px] font-bold text-[#6b7280] uppercase">Declined</p>
                </div>
              </div>

              {loadingApps ? (
                <div className="text-center py-8"><p className="text-[13px] text-[#9ca3af]">Loading applicants...</p></div>
              ) : shiftApplicants.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-3">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No applicants yet</p>
                  <p className="text-[13px] text-[#9ca3af]">Applicants will appear here as professionals apply.</p>
                </div>
              ) : (
                <>
                  {/* Pending applicants */}
                  {pending.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[12px] font-bold text-[#92400e] uppercase tracking-wider mb-2">Pending review ({pending.length})</p>
                      <div className="flex flex-col gap-2">
                        {pending.map(a => {
                          const name = getAppName(a)
                          const avatar = getAppAvatar(a)
                          const appRole = getAppRole(a)
                          const rating = getAppRating(a)
                          const rel = getAppReliability(a)
                          return (
                            <div key={a.id} className="bg-white border border-[#e5e7eb] rounded-xl p-3 hover:border-[#1a7f5e] transition">
                              <div onClick={() => { setShiftModal(null); navigate(`/provider-profile/${a.providerId}`) }} className="flex items-center gap-3 cursor-pointer mb-2">
                                {avatar ? <img src={avatar.startsWith('http') ? avatar : `${API_URL}${avatar}`} className="w-10 h-10 rounded-full object-cover flex-shrink-0" /> : <InitialsAvatar name={name} size={40} />}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[14px] font-bold text-[#1a7f5e] truncate hover:underline">{name}</p>
                                    <span className={`text-[12px] font-bold flex-shrink-0 ${rating.count > 0 ? 'text-[#F97316]' : 'text-[#9ca3af]'}`}>★ {rating.value}{rating.count > 0 ? ` (${rating.count})` : ''}</span>
                                  </div>
                                  <p className="text-[11px] text-[#6b7280]">{appRole}</p>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                              </div>
                              <div className="flex items-center gap-2 pl-[52px] mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rel.bg} ${rel.color}`}>{rel.label} · {rel.score}%</span>
                              </div>
                              {a.note && <p className="text-[11px] text-[#9ca3af] italic truncate pl-[52px] mb-2">"{a.note}"</p>}
                              <div className="flex gap-1.5 pl-[52px]">
                                <button onClick={() => handleAppAction(a.id, 'ACCEPTED', name)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white text-[11px] font-bold px-3 py-1.5 rounded-full transition border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>Accept</button>
                                <button onClick={() => handleAppAction(a.id, 'DECLINED', name)} className="bg-white border border-[#e5e7eb] text-[#6b7280] text-[11px] font-bold px-3 py-1.5 rounded-full hover:border-[#ef4444] hover:text-[#ef4444] transition cursor-pointer" style={{ fontFamily: 'inherit' }}>Decline</button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Accepted */}
                  {accepted.length > 0 && (
                    <div className="mb-5">
                      <p className="text-[12px] font-bold text-[#1a7f5e] uppercase tracking-wider mb-2">Accepted ({accepted.length})</p>
                      <div className="flex flex-col gap-2">
                        {accepted.map(a => {
                          const name = getAppName(a)
                          const avatar = getAppAvatar(a)
                          const rating = getAppRating(a)
                          const rel = getAppReliability(a)
                          return (
                            <div key={a.id} onClick={() => { setShiftModal(null); navigate(`/provider-profile/${a.providerId}`) }} className="bg-[#f0faf5] border border-[#d1e8da] rounded-xl p-3 cursor-pointer hover:border-[#1a7f5e] transition">
                              <div className="flex items-center gap-3 mb-1.5">
                                {avatar ? <img src={avatar.startsWith('http') ? avatar : `${API_URL}${avatar}`} className="w-10 h-10 rounded-full object-cover flex-shrink-0" /> : <InitialsAvatar name={name} size={40} />}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[14px] font-bold text-[#1a7f5e] truncate">{name}</p>
                                    <span className={`text-[12px] font-bold flex-shrink-0 ${rating.count > 0 ? 'text-[#F97316]' : 'text-[#9ca3af]'}`}>★ {rating.value}{rating.count > 0 ? ` (${rating.count})` : ''}</span>
                                  </div>
                                  <p className="text-[11px] text-[#1a7f5e] font-semibold">Accepted</p>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><polyline points="9 18 15 12 9 6"/></svg>
                              </div>
                              <div className="flex items-center gap-2 pl-[52px]">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rel.bg} ${rel.color}`}>{rel.label} · {rel.score}%</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Declined */}
                  {declined.length > 0 && (
                    <div>
                      <p className="text-[12px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Declined ({declined.length})</p>
                      <div className="flex flex-col gap-2">
                        {declined.map(a => (
                          <div key={a.id} className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-xl p-3 flex items-center gap-3 opacity-60">
                            <InitialsAvatar name={getAppName(a)} size={36} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-bold text-[#6b7280] truncate">{getAppName(a)}</p>
                            </div>
                            <span className="text-[10px] font-bold text-[#9ca3af] bg-[#f3f4f6] px-2 py-0.5 rounded-full">Declined</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              </>)}
            </div>

            {/* Footer */}
            {!editMode && (
            <div className="px-5 py-4 border-t border-[#f3f4f6] flex flex-col gap-2 flex-shrink-0 bg-white">
              <div className="flex gap-2">
                <button onClick={startEdit} className="flex-1 bg-white border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px] hover:border-[#1a7f5e] transition cursor-pointer flex items-center justify-center gap-1.5" style={{ fontFamily: 'inherit' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit post
                </button>
                <button onClick={() => { setShiftModal(null); navigate('/applicants') }} className="flex-1 bg-white border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px] hover:border-[#1a7f5e] transition cursor-pointer" style={{ fontFamily: 'inherit' }}>View applicants</button>
              </div>
              <button onClick={cancelShift} className="w-full border border-[#fee2e2] text-[#ef4444] font-bold py-2.5 rounded-full text-[13px] hover:bg-[#fef2f2] transition cursor-pointer" style={{ fontFamily: 'inherit' }}>Cancel this posting</button>
            </div>
            )}
          </div>
        </>
        )
      })()}

      {/* ── PAGE CONTENT ── */}
      <div className="max-w-[680px] mx-auto px-6 py-7 pb-24 md:pb-10">

        {/* Greeting */}
        <div className="flex items-center gap-4 mb-6">
          {office?.logoUrl ? (
            <img src={office.logoUrl.startsWith('http') ? office.logoUrl : `${API_URL}${office.logoUrl}`} alt="Logo" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[16px] font-extrabold">{(office?.name || '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || '?'}</span>
            </div>
          )}
          <div>
            <p className="text-[22px] font-black text-[#1a1a1a] mb-0.5">{getGreeting()}, {firstName} 👋</p>
            <p className="text-[14px] text-[#9ca3af]">
              {formatDate()}
              {office?.name ? ` · ${office.name}` : ''}
              {office?.city && office?.state ? ` · ${office.city}, ${office.state}` : ''}
            </p>
          </div>
        </div>

        {/* CTA Card */}
        <div className="bg-[#e8f5f0] border border-[#c6e8d9] rounded-[20px] p-6 mb-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-extrabold text-[#1a7f5e] uppercase tracking-widest mb-1">
              {shifts.length > 0 ? 'You have shifts coming up' : 'Get started'}
            </p>
            <p className="text-[20px] font-black text-[#1a1a1a] mb-1">Need more coverage?</p>
            <p className="text-[13px] text-[#4b8c72] leading-relaxed">Post another shift or invite a professional directly.</p>
          </div>
          <button
            onClick={() => navigate('/post-shift')}
            className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-extrabold px-6 py-3 rounded-full text-[14px] flex items-center gap-2 transition whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post a shift
          </button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button
            onClick={() => navigate('/professionals')}
            className="bg-white border border-[#e5e7eb] hover:border-[#1a7f5e] rounded-2xl p-4 flex items-center gap-3 transition text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#1a1a1a]">Find professionals</p>
              <p className="text-[13px] text-[#9ca3af] mt-0.5">Browse verified talent</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/bookings')}
            className="bg-white border border-[#e5e7eb] hover:border-[#1a7f5e] rounded-2xl p-4 flex items-center gap-3 transition text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="text-[16px] font-bold text-[#1a1a1a]">View bookings</p>
              <p className="text-[13px] text-[#9ca3af] mt-0.5">Upcoming &amp; past shifts</p>
            </div>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 text-center">
            <p className="text-[22px] font-black text-[#1a7f5e]">{office?.stats?.openShifts || 0}</p>
            <p className="text-[11px] text-[#9ca3af] font-semibold mt-1">Open shifts</p>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 text-center">
            <p className="text-[22px] font-black text-[#1a7f5e]">{office?.stats?.totalShifts || 0}</p>
            <p className="text-[11px] text-[#9ca3af] font-semibold mt-1">Total shifts</p>
          </div>
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-4 text-center">
            <p className="text-[22px] font-black text-[#1a7f5e]">{office?.stats?.completedBookings || 0}</p>
            <p className="text-[11px] text-[#9ca3af] font-semibold mt-1">Completed</p>
          </div>
        </div>

        {/* Posted Shifts & Jobs */}
        {shifts.length === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-8 text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No shifts or jobs posted yet</p>
            <p className="text-[13px] text-[#9ca3af] mb-4">Post your first shift or job to start finding professionals.</p>
            <button onClick={() => navigate('/post-shift')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-5 py-2.5 rounded-full text-[13px] transition">Post a shift</button>
          </div>
        ) : (<>
          {/* Temp Shifts */}
          {shifts.filter(s => !s.isPerm).length > 0 && (
            <>
              <p className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">Upcoming shifts</p>
              <div className="space-y-3 mb-8">
                {shifts.filter(s => !s.isPerm).map((shift) => (
                  <button key={shift.id} onClick={() => openShiftDrawer(shift)} className="w-full bg-white border border-[#e5e7eb] hover:border-[#1a7f5e] rounded-[18px] p-4 flex items-center gap-4 transition text-left">
                    <InitialsAvatar name={shift.name} size={44} className="border-2 border-white shadow" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-extrabold text-[#1a1a1a] truncate">{shift.role}</p>
                        <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ' + getStatusStyle(shift)}>{getStatusText(shift)}</span>
                      </div>
                      <p className="text-[12px] text-[#9ca3af]">{shift.date} · {shift.time}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-bold text-[#1a7f5e]">{shift.rate}</p>
                      {shift.applicants > 0 && <p className="text-[11px] text-[#6b7280]">{shift.applicants} applicant{shift.applicants !== 1 ? 's' : ''}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Permanent Jobs */}
          {shifts.filter(s => s.isPerm).length > 0 && (
            <>
              <p className="text-[15px] font-extrabold text-[#1a1a1a] mb-3 flex items-center gap-2">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                Permanent jobs
              </p>
              <div className="space-y-3 mb-8">
                {shifts.filter(s => s.isPerm).map((shift) => (
                  <button key={shift.id} onClick={() => openShiftDrawer(shift)} className="w-full bg-white border border-[#e5e7eb] hover:border-[#5b21b6] rounded-[18px] p-4 flex items-center gap-4 transition text-left">
                    <div className="w-11 h-11 rounded-[11px] bg-[#ede9fe] flex items-center justify-center flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b21b6" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[14px] font-extrabold text-[#1a1a1a] truncate">{shift.role}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 bg-[#ede9fe] text-[#5b21b6]">Permanent</span>
                        <span className={'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ' + getStatusStyle(shift)}>{getStatusText(shift)}</span>
                      </div>
                      <p className="text-[12px] text-[#6b7280]">{shift.schedule?.split(' · ')[0] || 'Full-time'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-bold text-[#5b21b6]">{shift.salary || shift.rate}</p>
                      {shift.applicants > 0 && <p className="text-[11px] text-[#6b7280]">{shift.applicants} applicant{shift.applicants !== 1 ? 's' : ''}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </>)}

        {/* Professionals */}
        <p className="text-[15px] font-extrabold text-[#1a1a1a] mb-3">Top professionals</p>
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No professionals yet</p>
          <p className="text-[13px] text-[#9ca3af] mb-4">Browse professionals to find your next hire.</p>
          <button onClick={() => navigate('/professionals')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-5 py-2.5 rounded-full text-[13px] transition">Browse professionals</button>
        </div>

      </div>

      {/* Floating help button */}
      <button
        onClick={() => navigate('/help')}
        className="fixed bottom-24 right-5 md:bottom-8 w-12 h-12 bg-[#1a7f5e] hover:bg-[#156649] rounded-full flex items-center justify-center shadow-lg transition z-50"
        aria-label="Help & Support"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      {/* Mobile bottom toolbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] z-40">
        <div className="flex">
          <button onClick={() => navigate('/dashboard')} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            <span className="text-[10px] font-bold text-[#1a7f5e]">Dashboard</span>
          </button>
          <button onClick={() => navigate('/professionals')} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="text-[10px] font-semibold text-[#9ca3af]">Pros</span>
          </button>
          <button onClick={() => navigate('/bookings')} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span className="text-[10px] font-semibold text-[#9ca3af]">Bookings</span>
          </button>
          <button onClick={() => navigate('/messages')} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-[10px] font-semibold text-[#9ca3af]">Messages</span>
          </button>
        </div>
      </div>

    </div>
  )
}
