import { useState } from 'react'
import { BTN } from './adminStyles'
import { useToast } from './ToastContext'

const INITIAL = [
  { id:1, type:'license', name:'Sarah R.', doc:'Texas RDH License', img:'https://randomuser.me/api/portraits/women/44.jpg', submitted:'Mar 25, 2026', licenseNum:'RDH-TX-284710', expires:'Dec 2027', file:'sarah_rdh_license.pdf', size:'320 KB', status:'pending', expiringSoon: false },
  { id:2, type:'cert', name:'Nina P.', doc:'CPR/BLS Certificate', img:'https://randomuser.me/api/portraits/women/28.jpg', submitted:'Mar 24, 2026', licenseNum:'CPR-2024-8823', expires:'Jun 2027', file:'nina_cpr_cert.pdf', size:'180 KB', status:'pending', expiringSoon: false },
  { id:3, type:'license', name:'Marcus J.', doc:'Registered Dental Assistant License', img:'https://randomuser.me/api/portraits/men/32.jpg', submitted:'Mar 22, 2026', licenseNum:'RDA-TX-19082', expires:'Aug 2026', file:'marcus_rda_license.pdf', size:'290 KB', status:'pending', expiringSoon: true },
  { id:4, type:'cert', name:'Aisha L.', doc:'Local Anesthesia Permit', img:'https://randomuser.me/api/portraits/women/65.jpg', submitted:'Mar 21, 2026', licenseNum:'LA-TX-00341', expires:'Jan 2028', file:'aisha_anesthesia_permit.pdf', size:'210 KB', status:'pending', expiringSoon: false },
]

export default function AdminVerification() {
  const showToast = useToast()
  const [items, setItems] = useState(INITIAL)
  const [filter, setFilter] = useState('all')

  const update = (id, status) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status } : i))
    showToast(status === 'approved' ? 'Credential approved' : status === 'rejected' ? 'Credential rejected — user notified' : 'Renewal request sent')
  }

  const visible = items.filter(i => filter === 'all' || i.type === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13px] font-bold text-[#1a1a1a]">{items.filter(i => i.status === 'pending').length} documents pending review</div>
        <div className="flex gap-1.5">
          {['all','license','cert'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition ${filter === f ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>
              {f === 'all' ? 'All' : f === 'license' ? 'Licenses' : 'Certifications'}
            </button>
          ))}
        </div>
      </div>

      {visible.map(item => (
        <div key={item.id} className="bg-white border border-[#e5e7eb] rounded-[14px] p-4 mb-3">
          <div className="flex items-flex-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#f3f4f6] flex items-center justify-center flex-shrink-0">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={item.expiringSoon ? '#ef4444' : '#1a7f5e'} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <img src={item.img} className="w-[26px] h-[26px] rounded-full object-cover"/>
                <span className="text-[13px] font-extrabold text-[#1a1a1a]">{item.name} — {item.doc}</span>
                {item.status === 'pending' && (
                  item.expiringSoon
                    ? <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b]">Expiring soon ⚠</span>
                    : <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef9c3] text-[#92400e]">Pending</span>
                )}
                {item.status === 'approved' && <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8f5f0] text-[#1a7f5e]">Approved ✓</span>}
                {item.status === 'rejected' && <span className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#991b1b]">Rejected ✕</span>}
              </div>
              <div className="text-[11px] text-[#6b7280]">Submitted {item.submitted} · License # {item.licenseNum} · Expires {item.expires}{item.expiringSoon ? ' ⚠ Expiring soon' : ''}</div>
            </div>
          </div>

          <div
            onClick={() => showToast(`Opening ${item.file}...`)}
            className="flex items-center gap-2 bg-[#f9f8f6] border border-[#e5e7eb] rounded-[8px] px-3 py-2 mb-3 cursor-pointer hover:bg-[#e8f5f0] hover:border-[#c6e8d9] transition"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div className="flex-1">
              <div className="text-[11px] font-semibold text-[#374151]">{item.file}</div>
              <div className="text-[10px] text-[#9ca3af]">{item.size} — Click to preview</div>
            </div>
            <span className="text-[10px] font-bold text-[#1a7f5e]">Preview →</span>
          </div>

          {item.status === 'pending' ? (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => update(item.id, 'approved')} className={BTN.green} style={{ fontFamily: 'inherit' }}>✓ Approve</button>
              <button onClick={() => update(item.id, 'rejected')} className={BTN.red} style={{ fontFamily: 'inherit' }}>✕ Reject</button>
              {item.expiringSoon && <button onClick={() => update(item.id, 'renewal')} className={BTN.yellow} style={{ fontFamily: 'inherit' }}>Request renewal</button>}
              <button onClick={() => showToast('Opening user profile...')} className={BTN.outline} style={{ fontFamily: 'inherit' }}>View profile</button>
            </div>
          ) : (
            <div className={`text-[12px] font-bold ${item.status === 'approved' ? 'text-[#1a7f5e]' : 'text-[#991b1b]'}`}>
              {item.status === 'approved' ? '✓ Approved by Admin' : '✕ Rejected — user notified'}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
