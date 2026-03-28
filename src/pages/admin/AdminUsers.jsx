import { useState } from 'react'
import { BADGE, BTN } from './adminStyles'
import { useToast } from './ToastContext'

const INITIAL_USERS = [
  { id:1, name:'Sarah R.', email:'sarah@email.com', img:'https://randomuser.me/api/portraits/women/44.jpg', type:'professional', plan:'Pro', location:'Houston, TX', reliability:'98%', status:'active', joined:'Mar 25, 2026', specialty:'Dental Hygienist', activity:'147 shifts' },
  { id:2, name:'Evolve Dentistry', email:'evolve@dental.com', initials:'ED', bg:'#e8f5f0', color:'#1a7f5e', type:'office', plan:'Growth', location:'Houston, TX', reliability:'—', status:'active', joined:'Mar 24, 2026', specialty:'General Dentistry', activity:'12 shifts posted' },
  { id:3, name:'Aisha L.', email:'aisha@email.com', img:'https://randomuser.me/api/portraits/women/65.jpg', type:'professional', plan:'Free', location:'Houston, TX', reliability:'94%', status:'active', joined:'Mar 23, 2026', specialty:'Dental Hygienist', activity:'142 shifts' },
  { id:4, name:'Marcus J.', email:'marcus@email.com', img:'https://randomuser.me/api/portraits/men/32.jpg', type:'professional', plan:'Free', location:'Houston, TX', reliability:'73%', status:'pending', joined:'Mar 22, 2026', specialty:'Dental Assistant', activity:'54 shifts' },
  { id:5, name:'Clear Lake Dental', email:'clearlake@dental.com', initials:'CL', bg:'#ede9fe', color:'#5b21b6', type:'office', plan:'Starter', location:'Houston, TX', reliability:'—', status:'active', joined:'Mar 21, 2026', specialty:'General Dentistry', activity:'8 shifts posted' },
  { id:6, name:'Bright Smile Dental', email:'bright@dental.com', initials:'BS', bg:'#fef9c3', color:'#92400e', type:'office', plan:'Starter', location:'Houston, TX', reliability:'—', status:'suspended', joined:'Mar 20, 2026', specialty:'Pediatric Dentistry', activity:'3 shifts posted' },
  { id:7, name:'Nina P.', email:'nina@email.com', img:'https://randomuser.me/api/portraits/women/28.jpg', type:'professional', plan:'Free', location:'Houston, TX', reliability:'86%', status:'active', joined:'Mar 19, 2026', specialty:'Dental Assistant', activity:'98 shifts' },
]

const STATUS_BADGE = { active:'green', pending:'yellow', suspended:'red' }
const STATUS_LABEL = { active:'Active', pending:'Pending', suspended:'Suspended' }

export default function AdminUsers() {
  const showToast = useToast()
  const [users, setUsers] = useState(INITIAL_USERS)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const filtered = users.filter(u => {
    const matchFilter = filter === 'all' || (filter === 'suspended' ? u.status === 'suspended' : filter === 'pending' ? u.status === 'pending' : u.type === filter)
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const toggleSuspend = (id) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u
      const next = u.status === 'suspended' ? 'active' : 'suspended'
      showToast(`${u.name} ${next === 'suspended' ? 'suspended' : 'reinstated'}`)
      return { ...u, status: next }
    }))
    setModal(null)
  }

  const FILTERS = [
    { label: 'All', val: 'all' },
    { label: 'Offices', val: 'office' },
    { label: 'Professionals', val: 'professional' },
    { label: 'Suspended', val: 'suspended' },
    { label: 'Pending', val: 'pending' },
  ]

  return (
    <div>
      {/* User Detail Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5" onClick={() => setModal(null)}>
          <div className="bg-white rounded-[18px] w-full max-w-[500px] max-h-[88vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#f3f4f6] flex items-center justify-between z-10">
              <span className="text-[15px] font-extrabold text-[#1a1a1a]">{modal.name}</span>
              <button onClick={() => setModal(null)} className="w-7 h-7 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] text-[15px] cursor-pointer bg-white" style={{ fontFamily: 'inherit' }}>×</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3.5 mb-4">
                {[
                  ['Email', modal.email], ['Type', modal.type === 'professional' ? 'Professional' : 'Office'],
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
              <div>
                <div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Admin Note</div>
                <textarea placeholder="Add internal note about this user..." className="w-full border border-[#e5e7eb] rounded-[10px] px-3 py-2.5 text-[13px] outline-none resize-none h-20 focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-3.5 border-t border-[#f3f4f6] flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Close</button>
              <button onClick={() => { showToast('Password reset email sent'); setModal(null) }} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Reset password</button>
              <button onClick={() => toggleSuspend(modal.id)} className={modal.status === 'suspended' ? BTN.green : BTN.red} style={{ fontFamily: 'inherit' }}>
                {modal.status === 'suspended' ? 'Reinstate' : 'Suspend user'}
              </button>
              <button onClick={() => { showToast('Message sent to user'); setModal(null) }} className={BTN.green} style={{ fontFamily: 'inherit' }}>Send message</button>
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px] text-[12px] outline-none bg-[#f9f8f6] text-[#1a1a1a] w-[200px] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>{['User','Type','Plan','Location','Reliability','Status','Joined','Actions'].map(h => <th key={h} className="text-left text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] px-4 py-2.5 border-b border-[#f3f4f6] bg-[#fafafa] whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-[#f9f8f6] last:border-0 hover:bg-[#fafffe]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {u.img ? <img src={u.img} className="w-[30px] h-[30px] rounded-full object-cover flex-shrink-0"/> : <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0" style={{ background: u.bg, color: u.color }}>{u.initials}</div>}
                    <div><div className="text-[12px] font-bold text-[#1a1a1a]">{u.name}</div><div className="text-[10px] text-[#9ca3af]">{u.email}</div></div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={BADGE[u.type === 'professional' ? 'purple' : 'blue']}>{u.type === 'professional' ? 'Professional' : 'Office'}</span></td>
                <td className="px-4 py-3"><span className={BADGE[u.plan === 'Pro' || u.plan === 'Growth' ? 'green' : u.plan === 'Starter' ? 'gray' : 'gray']}>{u.plan}</span></td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{u.location}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{u.reliability}</td>
                <td className="px-4 py-3"><span className={BADGE[STATUS_BADGE[u.status]]}>{STATUS_LABEL[u.status]}</span></td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{u.joined}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setModal(u)} className={BTN.outline + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>View</button>
                    {u.status === 'suspended'
                      ? <button onClick={() => toggleSuspend(u.id)} className={BTN.green + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>Reinstate</button>
                      : <button onClick={() => toggleSuspend(u.id)} className={BTN.red + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>Suspend</button>
                    }
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
