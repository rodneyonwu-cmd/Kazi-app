import { useState } from 'react'
import { BADGE, BTN } from './adminStyles'
import { useToast } from './ToastContext'

const RECORDS = [
  { id:1, office:'Evolve Dentistry', initials:'ED', bg:'#e8f5f0', color:'#1a7f5e', plan:'Growth', amount:'$99.00', date:'Mar 1, 2026', method:'Visa ···4242', status:'paid' },
  { id:2, office:'Clear Lake Dental', initials:'CL', bg:'#ede9fe', color:'#5b21b6', plan:'Starter', amount:'$49.00', date:'Mar 1, 2026', method:'Visa ···8812', status:'paid' },
  { id:3, office:'Bright Smile Dental', initials:'BS', bg:'#fef9c3', color:'#92400e', plan:'Starter', amount:'$49.00', date:'Mar 1, 2026', method:'MC ···5571', status:'failed' },
  { id:4, office:'Evolve Dentistry', initials:'ED', bg:'#e8f5f0', color:'#1a7f5e', plan:'Growth', amount:'$99.00', date:'Feb 1, 2026', method:'Visa ···4242', status:'paid' },
  { id:5, office:'Bright Smile Dental', initials:'BS', bg:'#fef9c3', color:'#92400e', plan:'Starter', amount:'$49.00', date:'Feb 1, 2026', method:'MC ···5571', status:'refunded' },
]

const STATUS_BADGE = { paid:'green', failed:'red', refunded:'orange' }
const STATUS_LABEL = { paid:'Paid', failed:'Failed', refunded:'Refunded' }

export default function AdminBilling() {
  const showToast = useToast()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  const filtered = RECORDS.filter(r => {
    const matchFilter = filter === 'all' || r.status === filter
    const matchSearch = !search || r.office.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const FILTERS = ['all','paid','failed','refunded']

  const tiers = [
    { name: 'Starter', nameColor: '#6b7280', price: '$49', count: 142, mrr: '$6,958' },
    { name: 'Growth', nameColor: '#1a7f5e', price: '$99', count: 289, mrr: '$28,611', highlight: true },
    { name: 'Enterprise', nameColor: '#5b21b6', price: '$249', count: 54, mrr: '$13,446' },
  ]

  return (
    <div>
      {/* Billing Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5" onClick={() => setModal(null)}>
          <div className="bg-white rounded-[18px] w-full max-w-[480px] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
              <span className="text-[15px] font-extrabold text-[#1a1a1a]">{modal.office} — {modal.date}</span>
              <button onClick={() => setModal(null)} className="w-7 h-7 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] cursor-pointer bg-white text-[15px]" style={{ fontFamily: 'inherit' }}>×</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3.5 mb-4">
                {[['Office', modal.office],['Plan', modal.plan],['Amount', modal.amount],['Date', modal.date],['Method', modal.method],['Status', STATUS_LABEL[modal.status]]].map(([l, v]) => (
                  <div key={l}><div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1">{l}</div><div className="text-[13px] font-semibold text-[#1a1a1a]">{v}</div></div>
                ))}
              </div>
              <div>
                <div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Refund Note</div>
                <textarea placeholder="Reason for refund (if applicable)..." className="w-full border border-[#e5e7eb] rounded-[10px] px-3 py-2.5 text-[13px] outline-none resize-none h-20 focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
              </div>
            </div>
            <div className="px-6 py-3.5 border-t border-[#f3f4f6] flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Close</button>
              {modal.status === 'failed' && <button onClick={() => { showToast('Retry payment sent'); setModal(null) }} className={BTN.yellow} style={{ fontFamily: 'inherit' }}>Retry payment</button>}
              <button onClick={() => { showToast('Refund initiated'); setModal(null) }} className={BTN.yellow} style={{ fontFamily: 'inherit' }}>Issue refund</button>
              <button onClick={() => { showToast('Plan updated'); setModal(null) }} className={BTN.green} style={{ fontFamily: 'inherit' }}>Update plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid grid-cols-3 gap-3.5 mb-6">
        {tiers.map(t => (
          <div key={t.name} className={`bg-white rounded-[14px] p-[18px] relative overflow-hidden border ${t.highlight ? 'border-[#1a7f5e]' : 'border-[#e5e7eb]'}`}>
            {t.highlight && <div className="absolute top-3 right-3 bg-[#1a7f5e] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">Most Popular</div>}
            <div className="text-[11px] font-extrabold uppercase tracking-[.08em] mb-1.5" style={{ color: t.nameColor }}>{t.name}</div>
            <div className="text-[28px] font-black text-[#1a1a1a] leading-none mb-0.5">{t.price}<span className="text-[14px] font-normal text-[#9ca3af]">/mo</span></div>
            <div className="text-[11px] text-[#9ca3af] mb-2.5">Per office location</div>
            <div className="text-[20px] font-black text-[#1a7f5e]">{t.count}</div>
            <div className="text-[11px] text-[#9ca3af] mb-3">active offices</div>
            <div className="text-[12px] text-[#6b7280]">MRR: <strong className="text-[#1a1a1a]">{t.mrr}</strong></div>
          </div>
        ))}
      </div>

      {/* Billing Records */}
      <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        <div className="px-[18px] py-3.5 border-b border-[#f3f4f6] flex items-center justify-between">
          <span className="text-[13px] font-extrabold text-[#1a1a1a]">Billing Records</span>
          <button onClick={() => showToast('Exporting billing data...')} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Export CSV</button>
        </div>
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between gap-2.5 flex-wrap">
          <div className="flex gap-1.5">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition capitalize ${filter === f ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{f === 'all' ? 'All' : STATUS_LABEL[f]}</button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search billing..." className="border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px] text-[12px] outline-none bg-[#f9f8f6] text-[#1a1a1a] w-[200px] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>{['Office','Plan','Amount','Date','Method','Status','Actions'].map(h => <th key={h} className="text-left text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] px-4 py-2.5 border-b border-[#f3f4f6] bg-[#fafafa] whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-b border-[#f9f8f6] last:border-0 hover:bg-[#fafffe]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0" style={{ background: r.bg, color: r.color }}>{r.initials}</div>
                    <span className="text-[12px] font-bold text-[#1a1a1a]">{r.office}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{r.plan}</td>
                <td className="px-4 py-3 text-[12px] font-bold text-[#1a1a1a]">{r.amount}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{r.date}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{r.method}</td>
                <td className="px-4 py-3"><span className={BADGE[STATUS_BADGE[r.status]]}>{STATUS_LABEL[r.status]}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button onClick={() => setModal(r)} className={BTN.outline + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>View</button>
                    {r.status === 'failed' && <button onClick={() => showToast('Retry payment sent')} className={BTN.yellow + ' !text-[10px] !py-1 !px-2.5'} style={{ fontFamily: 'inherit' }}>Retry</button>}
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
