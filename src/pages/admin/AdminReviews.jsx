import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { BTN } from './adminStyles'
import { useToast } from './ToastContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function AdminReviews() {
  const showToast = useToast()
  const { getToken } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/admin/reviews`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setReviews(await res.json())
      } catch (err) { console.error('[AdminReviews]', err) }
      setLoading(false)
    }
    load()
  }, [getToken])

  const deleteReview = async (id) => {
    if (!confirm('Delete this review? This cannot be undone.')) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id))
        showToast('Review deleted')
      } else showToast('Failed to delete')
    } catch { showToast('Failed to delete') }
  }

  const visible = reviews.filter(r => {
    if (filter === 'all') return true
    if (filter === 'low') return r.rating <= 2
    if (filter === 'high') return r.rating >= 4
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div className="text-[13px] font-bold text-[#1a1a1a]">{reviews.length} total reviews</div>
        <div className="flex gap-1.5 flex-wrap">
          {[['all','All'],['low','Low Rated 1–2★'],['high','High Rated 4–5★']].map(([f, label]) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition ${filter === f ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-10 text-center text-[13px] text-[#9ca3af]">Loading...</div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-10 text-center">
          <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">No reviews</p>
          <p className="text-[13px] text-[#9ca3af]">Reviews will appear here once offices start reviewing providers.</p>
        </div>
      ) : visible.map(r => {
        const officeName = r.office?.name || 'Office'
        const providerName = r.provider?.user ? `${r.provider.user.firstName || ''} ${r.provider.user.lastName || ''}`.trim() : 'Provider'
        return (
          <div key={r.id} className={`bg-white border rounded-[14px] p-4 mb-3 ${r.rating <= 2 ? 'border-[#fecaca]' : 'border-[#e5e7eb]'}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[13px] font-bold text-[#1a1a1a]">{officeName}</span>
                  <span className="text-[11px] text-[#9ca3af]">→</span>
                  <span className="text-[13px] font-bold text-[#1a1a1a]">{providerName}</span>
                  <span className="text-[#F97316] text-[13px]">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  {r.rating <= 2 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b]">Low Rated</span>}
                </div>
                <div className="text-[11px] text-[#9ca3af] mb-2">{new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                {r.comment && <p className="text-[13px] text-[#374151] leading-relaxed mb-2">{r.comment}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => deleteReview(r.id)} className={BTN.red} style={{ fontFamily: 'inherit' }}>Delete review</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
