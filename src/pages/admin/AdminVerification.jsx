import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { BTN } from './adminStyles'
import { useToast } from './ToastContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function AdminVerification() {
  const showToast = useToast()
  const { getToken } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/admin/verification`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setItems(await res.json())
      } catch (err) { console.error('[AdminVerification]', err) }
      setLoading(false)
    }
    load()
  }, [getToken])

  const approve = async (id) => {
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/credentials/${id}/approve`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setItems(prev => prev.filter(x => x.id !== id))
        showToast('Credential approved')
      } else showToast('Failed to approve')
    } catch { showToast('Failed to approve') }
  }

  const reject = async (id) => {
    if (!confirm('Reject and remove this credential?')) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/credentials/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setItems(prev => prev.filter(x => x.id !== id))
        showToast('Credential rejected')
      } else showToast('Failed to reject')
    } catch { showToast('Failed to reject') }
  }

  const isLicense = (t) => (t || '').toLowerCase().includes('license') || (t || '').toLowerCase().includes('dds') || (t || '').toLowerCase().includes('rdh')
  const visible = items.filter(i => {
    if (filter === 'all') return true
    if (filter === 'license') return isLicense(i.type)
    return !isLicense(i.type)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-bold text-[#1a1a1a]">{items.length} documents pending review</div>
        <div className="flex gap-1.5">
          {['all','license','cert'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition ${filter === f ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>
              {f === 'all' ? 'All' : f === 'license' ? 'Licenses' : 'Certifications'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-10 text-center text-[13px] text-[#9ca3af]">Loading...</div>
      ) : visible.length === 0 ? (
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">All caught up</p>
          <p className="text-[13px] text-[#9ca3af]">No credentials awaiting verification.</p>
        </div>
      ) : visible.map(item => {
        const providerName = `${item.provider?.user?.firstName || ''} ${item.provider?.user?.lastName || ''}`.trim() || item.provider?.user?.email || 'Provider'
        const initials = providerName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
        return (
          <div key={item.id} className="bg-white border border-[#e5e7eb] rounded-[14px] p-4 mb-3">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {item.provider?.user?.avatarUrl ? (
                    <img src={item.provider.user.avatarUrl.startsWith('http') ? item.provider.user.avatarUrl : `${API_URL}${item.provider.user.avatarUrl}`} className="w-[26px] h-[26px] rounded-full object-cover"/>
                  ) : (
                    <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-extrabold bg-[#e8f5f0] text-[#1a7f5e]">{initials}</div>
                  )}
                  <span className="text-[13px] font-bold text-[#1a1a1a]">{providerName}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#fef9c3] text-[#92400e]">Pending</span>
                </div>
                <div className="text-[13px] font-semibold text-[#374151] mb-0.5">{item.type}</div>
                <div className="text-[11px] text-[#9ca3af]">Submitted {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{item.fileUrl ? ` · ${item.fileUrl}` : ''}</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap pl-[52px]">
              <button onClick={() => approve(item.id)} className={BTN.green} style={{ fontFamily: 'inherit' }}>Approve</button>
              <button onClick={() => reject(item.id)} className={BTN.red} style={{ fontFamily: 'inherit' }}>Reject</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
