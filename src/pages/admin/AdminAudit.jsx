import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const ICON_FOR = {
  APPROVE_CREDENTIAL: { bg: '#e8f5f0', color: '#1a7f5e', svg: <path d="M20 6L9 17l-5-5"/> },
  REJECT_CREDENTIAL: { bg: '#fee2e2', color: '#991b1b', svg: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> },
  SUSPEND_USER: { bg: '#fee2e2', color: '#991b1b', svg: <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></> },
  REINSTATE_USER: { bg: '#e8f5f0', color: '#1a7f5e', svg: <path d="M20 6L9 17l-5-5"/> },
  DELETE_USER: { bg: '#fee2e2', color: '#991b1b', svg: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></> },
  CANCEL_SHIFT: { bg: '#fef9c3', color: '#92400e', svg: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/></> },
  DELETE_REVIEW: { bg: '#fee2e2', color: '#991b1b', svg: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/> },
}

const formatTime = (t) => {
  const diff = Date.now() - new Date(t).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function AdminAudit() {
  const { getToken } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/admin/audit`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setEntries(await res.json())
      } catch (err) { console.error('[AdminAudit]', err) }
      setLoading(false)
    }
    load()
  }, [getToken])

  const filtered = entries.filter(e => {
    if (!search) return true
    const q = search.toLowerCase()
    return e.action.toLowerCase().includes(q) || (e.details || '').toLowerCase().includes(q) || (e.targetType || '').toLowerCase().includes(q)
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-bold text-[#1a1a1a]">{entries.length} audit entries</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..." className="border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px] text-[12px] outline-none bg-white text-[#1a1a1a] w-[240px] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
      </div>
      <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-[13px] text-[#9ca3af]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-[#9ca3af]">No audit entries</div>
        ) : filtered.map(e => {
          const icon = ICON_FOR[e.action] || { bg: '#f3f4f6', color: '#6b7280', svg: <circle cx="12" cy="12" r="10"/> }
          const adminName = `${e.admin?.firstName || ''} ${e.admin?.lastName || ''}`.trim() || e.admin?.email || 'Admin'
          const title = e.action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
          return (
            <div key={e.id} className="flex items-start gap-3 px-4 py-3 border-b border-[#f9f8f6] last:border-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: icon.bg, color: icon.color }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">{icon.svg}</svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-[#1a1a1a]">{title}{e.details ? ` — ${e.details}` : ''}</div>
                <div className="text-[11px] text-[#9ca3af]">{adminName} · {e.targetType || 'Action'}</div>
              </div>
              <div className="text-[11px] text-[#9ca3af] flex-shrink-0">{formatTime(e.createdAt)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
