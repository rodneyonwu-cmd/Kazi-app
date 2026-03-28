import { useState } from 'react'
import { BADGE, BTN } from './adminStyles'
import { useToast } from './ToastContext'

const SHIFTS = [
  { id:1, office:'Evolve Dentistry', officeInitials:'ED', officeBg:'#e8f5f0', officeColor:'#1a7f5e', role:'Dental Hygienist', pro:'Sarah R.', proImg:'https://randomuser.me/api/portraits/women/44.jpg', date:'Mar 31', time:'8:00–5:00', rate:'$52/hr', value:'$468', status:'confirmed' },
  { id:2, office:'Clear Lake Dental', officeInitials:'CL', officeBg:'#ede9fe', officeColor:'#5b21b6', role:'Dental Assistant', pro:'Nina P.', proImg:'https://randomuser.me/api/portraits/women/28.jpg', date:'Apr 2', time:'9:00–4:00', rate:'$34/hr', value:'$238', status:'pending' },
  { id:3, office:'Evolve Dentistry', officeInitials:'ED', officeBg:'#e8f5f0', officeColor:'#1a7f5e', role:'Front Desk', pro:'Tara C.', proInitials:'TC', proBg:'#f3f4f6', proColor:'#6b7280', date:'Apr 3', time:'8:00–5:00', rate:'$28/hr', value:'$252', status:'confirmed' },
  { id:4, office:'Bright Smile Dental', officeInitials:'BS', officeBg:'#fef9c3', officeColor:'#92400e', role:'Dental Hygienist', pro:'Aisha L.', proImg:'https://randomuser.me/api/portraits/women/65.jpg', date:'Mar 20', time:'8:00–5:00', rate:'$58/hr', value:'$522', status:'completed' },
  { id:5, office:'Clear Lake Dental', officeInitials:'CL', officeBg:'#ede9fe', officeColor:'#5b21b6', role:'Dental Hygienist', pro:'Marcus J.', proImg:'https://randomuser.me/api/portraits/men/32.jpg', date:'Mar 18', time:'9:00–3:00', rate:'$38/hr', value:'—', status:'cancelled' },
]

const STATUS_BADGE = { confirmed:'green', pending:'yellow', completed:'gray', cancelled:'red' }
const STATUS_LABEL = { confirmed:'Confirmed', pending:'Pending', completed:'Completed', cancelled:'Cancelled' }

export default function AdminShifts() {
  const showToast = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [shifts, setShifts] = useState(SHIFTS)

  const cancelShift = (id) => {
    setShifts(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s))
    showToast('Shift cancelled by admin')
  }

  const filtered = shifts.filter(s => {
    const matchFilter = filter === 'all' || s.status === filter
    const matchSearch = !search || s.office.toLowerCase().includes(search.toLowerCase()) || s.pro.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const FILTERS = ['all','confirmed','pending','completed','cancelled']

  return (
    <div>
      <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition capitalize ${filter === f ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{f === 'all' ? 'All' : STATUS_LABEL[f]}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shifts..." className="border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px] text-[12px] outline-none bg-[#f9f8f6] text-[#1a1a1a] w-[200px] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>{['Office','Role','Professional','Date','Time','Rate','Est. Value','Status','Actions'].map(h => <th key={h} className="text-left text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] px-4 py-2.5 border-b border-[#f3f4f6] bg-[#fafafa] whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-[#f9f8f6] last:border-0 hover:bg-[#fafffe]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0" style={{ background: s.officeBg, color: s.officeColor }}>{s.officeInitials}</div>
                    <span className="text-[12px] font-bold text-[#1a1a1a]">{s.office}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{s.role}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {s.proImg ? <img src={s.proImg} className="w-[28px] h-[28px] rounded-full object-cover flex-shrink-0"/> : <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0" style={{ background: s.proBg, color: s.proColor }}>{s.proInitials}</div>}
                    <span className="text-[12px] font-bold text-[#1a1a1a]">{s.pro}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{s.date}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{s.time}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{s.rate}</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#1a1a1a]">{s.value}</td>
                <td className="px-4 py-3"><span className={BADGE[STATUS_BADGE[s.status]]}>{STATUS_LABEL[s.status]}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => showToast('Viewing shift details')} className={BTN.outline + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>View</button>
                    {(s.status === 'confirmed' || s.status === 'pending') && (
                      <button onClick={() => cancelShift(s.id)} className={BTN.red + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>Cancel</button>
                    )}
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
