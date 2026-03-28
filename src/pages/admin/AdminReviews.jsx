import { useState } from 'react'
import { BADGE, BTN } from './adminStyles'
import { useToast } from './ToastContext'

const INITIAL = [
  { id:1, status:'flagged', fromName:'Bright Smile Dental', fromInitials:'BS', fromBg:'#fef9c3', fromColor:'#92400e', toName:'Sarah R.', stars:1, date:'Mar 22, 2026 (8:14 AM)', note:'Suspected retaliation', body:'"Absolutely terrible hygienist. Showed up late, rude to patients, and left early. Would never book again. Zero stars if possible."', removed:false },
  { id:2, status:'flagged', fromName:'Bright Smile Dental', fromInitials:'BS', fromBg:'#fef9c3', fromColor:'#92400e', toName:'Sarah R.', stars:1, date:'Mar 22, 2026 (8:18 AM)', note:'Duplicate suspected', body:'"Worst hygienist ever. Completely unprofessional. Do not book her."', removed:false },
  { id:3, status:'low', fromName:'Clear Lake Dental', fromInitials:'CL', fromBg:'#ede9fe', fromColor:'#5b21b6', toName:'Marcus J.', stars:2, date:'Mar 19, 2026', note:'Legitimate review', body:'"Marcus cancelled last minute which left us scrambling. When he did come the following week he was adequate but not exceptional."', removed:false },
  { id:4, status:'all', fromName:'Evolve Dentistry', fromInitials:'ED', fromBg:'#e8f5f0', fromColor:'#1a7f5e', toName:'Sarah R.', stars:5, date:'Mar 15, 2026', note:'No issues', body:'"Sarah was phenomenal. Arrived early, professional with all our patients, and ran the full column without any issues. Will definitely request her again!"', removed:false },
]

export default function AdminReviews() {
  const showToast = useToast()
  const [reviews, setReviews] = useState(INITIAL)
  const [filter, setFilter] = useState('all')

  const removeReview = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, removed: true } : r))
    showToast('Review removed')
  }

  const visible = reviews.filter(r => filter === 'all' || r.status === filter)

  const FILTERS = [
    { label: 'All Reviews', val: 'all' },
    { label: 'Flagged', val: 'flagged' },
    { label: 'Low Rated (1–2★)', val: 'low' },
  ]

  return (
    <div>
      <div className="flex gap-1.5 mb-4">
        {FILTERS.map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition ${filter === f.val ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{f.label}</button>
        ))}
      </div>

      {visible.map(r => (
        <div key={r.id} className={`bg-white border border-[#e5e7eb] rounded-[14px] p-4 mb-3 transition ${r.removed ? 'opacity-40 pointer-events-none' : ''}`}>
          <div className="flex items-flex-start justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0" style={{ background: r.fromBg, color: r.fromColor }}>{r.fromInitials}</div>
                <span className="text-[12px] font-bold text-[#1a1a1a]">{r.fromName} → {r.toName}</span>
                {r.status === 'flagged' && <span className={BADGE.red}>Flagged</span>}
                {r.status === 'all' && <span className={BADGE.green}>Verified</span>}
                {r.status === 'low' && <span className={BADGE.gray}>Normal</span>}
              </div>
              <div className="text-[10px] text-[#9ca3af]">Left {r.date}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[13px]" style={{ color: r.stars >= 4 ? '#F97316' : r.stars >= 3 ? '#f59e0b' : '#9ca3af' }}>
                {'★'.repeat(r.stars)}{'☆'.repeat(5 - r.stars)}
              </div>
              <div className="text-[10px] text-[#9ca3af]">{r.stars} star{r.stars !== 1 ? 's' : ''}</div>
            </div>
          </div>

          <div className="text-[12px] text-[#374151] leading-relaxed mb-3">{r.body}</div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={r.status === 'flagged' ? BADGE.red : r.status === 'all' ? BADGE.green : BADGE.gray}>{r.note}</span>
            {r.removed ? (
              <span className="text-[11px] font-bold text-[#991b1b] ml-auto">Removed by Admin</span>
            ) : (
              <div className="ml-auto flex gap-1.5">
                <button onClick={() => removeReview(r.id)} className={BTN.red} style={{ fontFamily: 'inherit' }}>Remove review</button>
                <button onClick={() => showToast('Review kept — no action taken')} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Keep review</button>
                {r.status === 'flagged' && <button onClick={() => showToast('Warning sent to office')} className={BTN.yellow} style={{ fontFamily: 'inherit' }}>Warn office</button>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
