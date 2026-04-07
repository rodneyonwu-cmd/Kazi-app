import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { BADGE, BTN } from './adminStyles'
import { useToast } from './ToastContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function AdminUsers() {
  const showToast = useToast()
  const { getToken } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/admin/users`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) setUsers(await res.json())
      } catch (err) { console.error('[AdminUsers]', err) }
      setLoading(false)
    }
    load()
  }, [getToken])

  const normalize = (u) => {
    const name = u.office?.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
    const initials = name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    return {
      id: u.id,
      name,
      initials,
      email: u.email,
      avatarUrl: u.avatarUrl,
      type: u.role === 'OFFICE' ? 'office' : u.role === 'PROVIDER' ? 'professional' : 'admin',
      plan: u.office?.plan || (u.role === 'PROVIDER' ? 'Free' : '—'),
      location: u.office?.city || u.provider?.city ? `${u.office?.city || u.provider?.city || ''}${(u.office?.state || u.provider?.state) ? ', ' + (u.office?.state || u.provider?.state) : ''}` : '—',
      reliability: u.provider ? `${Math.round(u.provider.reliabilityScore || 0)}%` : '—',
      status: u.suspended ? 'suspended' : 'active',
      joined: new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      specialty: u.office?.specialty || (u.provider ? { hygienist:'Dental Hygienist', assistant:'Dental Assistant', dentist:'Dentist', front:'Front Office', specialist:'Specialist' }[u.provider.role] || u.provider.role : '—'),
      activity: u.office ? `${u.office._count?.shifts || 0} shifts posted` : u.provider ? `${u.provider._count?.bookings || 0} bookings` : '—',
    }
  }

  const normalized = users.map(normalize)
  const filtered = normalized.filter(u => {
    const matchFilter = filter === 'all' || (filter === 'suspended' ? u.status === 'suspended' : u.type === filter)
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const toggleSuspend = async (u) => {
    try {
      const token = await getToken()
      const next = u.status === 'suspended' ? false : true
      const res = await fetch(`${API_URL}/api/admin/users/${u.id}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ suspended: next }),
      })
      if (res.ok) {
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, suspended: next } : x))
        showToast(`${u.name} ${next ? 'suspended' : 'reinstated'}`)
      } else showToast('Failed to update')
    } catch { showToast('Failed to update') }
    setModal(null)
  }

  const deleteUser = async (u) => {
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/admin/users/${u.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) {
        setUsers(prev => prev.filter(x => x.id !== u.id))
        showToast(`${u.name} deleted`)
        setModal(null)
      } else showToast('Failed to delete')
    } catch { showToast('Failed to delete') }
  }

  const STATUS_BADGE = { active: 'green', suspended: 'red' }
  const STATUS_LABEL = { active: 'Active', suspended: 'Suspended' }

  const FILTERS = [
    { label: 'All', val: 'all' },
    { label: 'Offices', val: 'office' },
    { label: 'Professionals', val: 'professional' },
    { label: 'Suspended', val: 'suspended' },
  ]

  return (
    <div>
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5" onClick={() => setModal(null)}>
          <div className="bg-white rounded-[18px] w-full max-w-[500px] max-h-[88vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#f3f4f6] flex items-center justify-between z-10">
              <span className="text-[15px] font-extrabold text-[#1a1a1a]">{modal.name}</span>
              <button onClick={() => setModal(null)} className="w-7 h-7 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] text-[15px] cursor-pointer bg-white" style={{ fontFamily: 'inherit' }}>×</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-4">
                {[
                  ['Email', modal.email], ['Type', modal.type === 'professional' ? 'Professional' : modal.type === 'office' ? 'Office' : 'Admin'],
                  ['Status', STATUS_LABEL[modal.status]], ['Joined', modal.joined],
                  ['Specialty', modal.specialty], ['Location', modal.location],
                  ['Reliability', modal.reliability], ['Activity', modal.activity],
                  ['Plan', modal.plan],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1">{label}</div>
                    <div className="text-[13px] font-semibold text-[#1a1a1a]">{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-3.5 border-t border-[#f3f4f6] flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Close</button>
              <button onClick={() => deleteUser(modal)} className={BTN.outline + ' !text-[#ef4444] !border-[#fee2e2]'} style={{ fontFamily: 'inherit' }}>Delete</button>
              <button onClick={() => toggleSuspend(modal)} className={modal.status === 'suspended' ? BTN.green : BTN.red} style={{ fontFamily: 'inherit' }}>
                {modal.status === 'suspended' ? 'Reinstate' : 'Suspend user'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.val} onClick={() => setFilter(f.val)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition ${filter === f.val ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{f.label}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px] text-[12px] outline-none bg-[#f9f8f6] text-[#1a1a1a] w-full md:w-[200px] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>{['User','Type','Plan','Location','Reliability','Status','Joined','Actions'].map(h => <th key={h} className="text-left text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] px-4 py-2.5 border-b border-[#f3f4f6] bg-[#fafafa] whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="px-4 py-12 text-center text-[12px] text-[#9ca3af]">Loading users...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="8" className="px-4 py-12 text-center text-[12px] text-[#9ca3af]">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="border-b border-[#f9f8f6] last:border-0 hover:bg-[#fafffe]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.avatarUrl ? <img src={u.avatarUrl.startsWith('http') ? u.avatarUrl : `${API_URL}${u.avatarUrl}`} className="w-[30px] h-[30px] rounded-full object-cover flex-shrink-0"/> : <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 bg-[#e8f5f0] text-[#1a7f5e]">{u.initials}</div>}
                    <div><div className="text-[12px] font-bold text-[#1a1a1a]">{u.name}</div><div className="text-[10px] text-[#9ca3af]">{u.email}</div></div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={BADGE[u.type === 'professional' ? 'purple' : u.type === 'office' ? 'blue' : 'gray']}>{u.type === 'professional' ? 'Provider' : u.type === 'office' ? 'Office' : 'Admin'}</span></td>
                <td className="px-4 py-3"><span className={BADGE.gray}>{u.plan}</span></td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{u.location}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{u.reliability}</td>
                <td className="px-4 py-3"><span className={BADGE[STATUS_BADGE[u.status]]}>{STATUS_LABEL[u.status]}</span></td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{u.joined}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setModal(u)} className={BTN.outline + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>View</button>
                    {u.status === 'suspended'
                      ? <button onClick={() => toggleSuspend(u)} className={BTN.green + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>Reinstate</button>
                      : <button onClick={() => toggleSuspend(u)} className={BTN.red + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>Suspend</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
