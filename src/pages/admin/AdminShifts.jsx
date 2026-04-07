import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { BADGE, BTN } from './adminStyles'
import { useToast } from './ToastContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STATUS_BADGE = { OPEN: 'yellow', FILLED: 'green', COMPLETED: 'gray', CANCELLED: 'red' }
const STATUS_LABEL = { OPEN: 'Open', FILLED: 'Filled', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }

export default function AdminShifts() {
  const showToast = useToast()
  const { getToken } = useAuth()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/admin/shifts`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setShifts(await res.json())
      } catch (err) { console.error('[AdminShifts]', err) }
      setLoading(false)
    }
    load()
  }, [getToken])

  const cancelShift = async (id) => {
    if (!confirm('Cancel this shift? This cannot be undone.')) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/shifts/${id}/cancel`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setShifts(prev => prev.map(s => s.id === id ? { ...s, status: 'CANCELLED' } : s))
        showToast('Shift cancelled by admin')
      } else showToast('Failed to cancel')
    } catch { showToast('Failed to cancel') }
  }

  const filtered = shifts.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter
    const matchSearch = !search || s.office?.name?.toLowerCase().includes(search.toLowerCase()) || s.role?.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const FILTERS = ['all','OPEN','FILLED','COMPLETED','CANCELLED']

  return (
    <div>
      <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition ${filter === f ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{f === 'all' ? 'All' : STATUS_LABEL[f]}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shifts..." className="border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px] text-[12px] outline-none bg-[#f9f8f6] text-[#1a1a1a] w-full md:w-[200px] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>{['Office','Role','Professional','Date','Time','Rate','Applicants','Status','Actions'].map(h => <th key={h} className="text-left text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] px-4 py-2.5 border-b border-[#f3f4f6] bg-[#fafafa] whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="px-4 py-12 text-center text-[12px] text-[#9ca3af]">Loading shifts...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="9" className="px-4 py-12 text-center text-[12px] text-[#9ca3af]">No shifts found</td></tr>
            ) : filtered.map(s => {
              const officeName = s.office?.name || 'Office'
              const officeInitials = officeName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
              const proName = s.booking?.provider?.user ? `${s.booking.provider.user.firstName || ''} ${s.booking.provider.user.lastName || ''}`.trim() : '—'
              const dateStr = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              return (
                <tr key={s.id} className="border-b border-[#f9f8f6] last:border-0 hover:bg-[#fafffe]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {s.office?.logoUrl ? (
                        <img src={s.office.logoUrl.startsWith('http') ? s.office.logoUrl : `${API_URL}${s.office.logoUrl}`} className="w-[28px] h-[28px] rounded-full object-cover flex-shrink-0"/>
                      ) : (
                        <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 bg-[#e8f5f0] text-[#1a7f5e]">{officeInitials}</div>
                      )}
                      <span className="text-[12px] font-bold text-[#1a1a1a]">{officeName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#374151]">{s.role}</td>
                  <td className="px-4 py-3 text-[12px] text-[#374151]">{proName}</td>
                  <td className="px-4 py-3 text-[12px] text-[#374151]">{dateStr}</td>
                  <td className="px-4 py-3 text-[12px] text-[#374151]">{s.startTime} – {s.endTime}</td>
                  <td className="px-4 py-3 text-[12px] text-[#374151]">${s.hourlyRate}/hr</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#1a1a1a]">{s._count?.applications || 0}</td>
                  <td className="px-4 py-3"><span className={BADGE[STATUS_BADGE[s.status]]}>{STATUS_LABEL[s.status]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {(s.status === 'OPEN' || s.status === 'FILLED') && (
                        <button onClick={() => cancelShift(s.id)} className={BTN.red + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
