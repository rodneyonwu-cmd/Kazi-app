import { useState } from 'react'
import { BADGE, BTN } from './adminStyles'
import { useToast } from './ToastContext'

const INITIAL = [
  { id:'1042', cat:'Billing', priority:'high', title:'Billing dispute — overcharged for subscription', body:'Evolve Dentistry was charged twice for their March subscription — two charges of $99 appeared on March 1st. They provided bank statement screenshots. Requesting a refund for the duplicate charge.', user:'Evolve Dentistry', email:'evolve@dental.com', initials:'ED', bg:'#e8f5f0', color:'#1a7f5e', type:'office', status:'open', time:'14 min ago' },
  { id:'1043', cat:'Dispute', priority:'high', title:'Professional no-show — shift abandoned', body:"Sarah R. accepted a confirmed shift at Clear Lake Dental on March 22 but failed to appear. The office had to cancel all morning patients. They are requesting a platform credit and a review of Sarah's account.", user:'Clear Lake Dental', email:'clearlake@dental.com', initials:'CL', bg:'#ede9fe', color:'#5b21b6', type:'office', status:'open', time:'2h ago' },
  { id:'1040', cat:'Verification', priority:'medium', title:'Account verification taking too long', body:'Nina P. submitted her CPR/BLS certificate 5 days ago and has not received confirmation. She has a confirmed shift next week and needs her profile fully verified before then.', user:'Nina P.', email:'nina@email.com', img:'https://randomuser.me/api/portraits/women/28.jpg', type:'professional', status:'pending', time:'Yesterday' },
  { id:'1041', cat:'Cancellation', priority:'low', title:'Shift cancellation — last minute cancellation', body:'Marcus J. cancelled a confirmed shift 3 hours before start time at Bright Smile Dental. The office requested a review of his reliability score and whether a formal warning should be issued.', user:'Bright Smile Dental', email:'bright@dental.com', initials:'BS', bg:'#fef9c3', color:'#92400e', type:'office', status:'resolved', time:'5h ago' },
]

const PRIORITY_COLOR = { high:'text-[#ef4444]', medium:'text-[#f59e0b]', low:'text-[#6b7280]' }
const STATUS_BADGE = { open:'red', pending:'yellow', resolved:'green' }
const STATUS_LABEL = { open:'Open', pending:'Pending', resolved:'Resolved' }

export default function AdminTickets() {
  const showToast = useToast()
  const [tickets, setTickets] = useState(INITIAL)
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null)

  const resolveTicket = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'resolved' } : t))
    showToast('Response sent and ticket resolved')
    setModal(null)
  }

  const markPending = (id) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'pending' } : t))
    showToast('Ticket marked as pending')
    setModal(null)
  }

  const visible = tickets.filter(t => filter === 'all' || t.status === filter)

  const FILTERS = ['all','open','pending','resolved']

  return (
    <div>
      {/* Ticket Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-5" onClick={() => setModal(null)}>
          <div className="bg-white rounded-[18px] w-full max-w-[500px] max-h-[88vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#f3f4f6] flex items-center justify-between z-10">
              <span className="text-[14px] font-extrabold text-[#1a1a1a]">#{modal.id} — {modal.title}</span>
              <button onClick={() => setModal(null)} className="w-7 h-7 rounded-full border border-[#e5e7eb] flex items-center justify-center text-[#6b7280] cursor-pointer bg-white text-[15px]" style={{ fontFamily: 'inherit' }}>×</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[['Submitted by', modal.user],['Email', modal.email],['Category', modal.cat],['Status', STATUS_LABEL[modal.status]],['Priority', modal.priority.toUpperCase()]].map(([l, v]) => (
                  <div key={l}><div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1">{l}</div><div className="text-[13px] font-semibold text-[#1a1a1a]">{v}</div></div>
                ))}
              </div>
              <div className="mb-4">
                <div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2">Description</div>
                <div className="text-[13px] text-[#374151] leading-relaxed bg-[#f9f8f6] rounded-[9px] p-3">{modal.body}</div>
              </div>
              <div>
                <div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Admin Response</div>
                <textarea placeholder="Type your response to the user..." className="w-full border border-[#e5e7eb] rounded-[10px] px-3 py-2.5 text-[13px] outline-none resize-none h-20 focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-3.5 border-t border-[#f3f4f6] flex gap-2 justify-end">
              <button onClick={() => setModal(null)} className={BTN.outline} style={{ fontFamily: 'inherit' }}>Close</button>
              <button onClick={() => markPending(modal.id)} className={BTN.yellow} style={{ fontFamily: 'inherit' }}>Mark pending</button>
              <button onClick={() => resolveTicket(modal.id)} className={BTN.green} style={{ fontFamily: 'inherit' }}>Send & resolve</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1.5 mb-4">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-[11px] py-[5px] rounded-full border text-[11px] font-bold cursor-pointer transition capitalize ${filter === f ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{f === 'all' ? 'All' : STATUS_LABEL[f]}</button>
        ))}
      </div>

      {visible.map(t => (
        <div key={t.id} onClick={() => setModal(t)} className="bg-white border border-[#e5e7eb] rounded-[14px] p-4 mb-2.5 cursor-pointer hover:border-[#1a7f5e] transition">
          <div className="flex items-flex-start justify-between gap-2 mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-0.5">
                #{t.id} · {t.cat} · <span className={PRIORITY_COLOR[t.priority]}>{t.priority.toUpperCase()} PRIORITY</span>
              </div>
              <div className="text-[13px] font-extrabold text-[#1a1a1a] mb-1">{t.title}</div>
              <div className="text-[12px] text-[#6b7280] leading-relaxed line-clamp-2">{t.body}</div>
            </div>
            <span className={`${BADGE[STATUS_BADGE[t.status]]} flex-shrink-0 mt-0.5`}>{STATUS_LABEL[t.status]}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {t.img
                ? <img src={t.img} className="w-[22px] h-[22px] rounded-full object-cover"/>
                : <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0" style={{ background: t.bg, color: t.color }}>{t.initials}</div>
              }
              <span className="text-[11px] font-semibold text-[#374151]">{t.user}</span>
            </div>
            <span className={BADGE[t.type === 'office' ? 'blue' : 'purple']}>{t.type === 'office' ? 'Office' : 'Professional'}</span>
            <span className="text-[10px] text-[#9ca3af] ml-auto">{t.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
