import { useState } from 'react'
import { useToast } from './ToastContext'

const ENTRIES = [
  { id:1, type:'approve', title:'Credential approved — Sarah R. Texas RDH License', detail:'Admin approved license # RDH-TX-284710 · Profile now fully verified', by:'Admin', time:'2 min ago', iconBg:'#e8f5f0', iconColor:'#1a7f5e' },
  { id:2, type:'suspend', title:'Account suspended — Bright Smile Dental', detail:'Reason: Policy violation — review manipulation. Account locked pending investigation.', by:'Admin', time:'1h ago', iconBg:'#fee2e2', iconColor:'#991b1b' },
  { id:3, type:'ticket', title:'Ticket #1041 resolved — Shift cancellation dispute', detail:'Resolution: Warning issued to Marcus J. Reliability score flagged for monitoring.', by:'Admin', time:'5h ago', iconBg:'#dbeafe', iconColor:'#1e40af' },
  { id:4, type:'refund', title:'Refund issued — Bright Smile Dental $49.00', detail:'Refund processed for February duplicate charge. Stripe refund ID: re_8812xxxx.', by:'Admin', time:'Yesterday', iconBg:'#fef9c3', iconColor:'#92400e' },
  { id:5, type:'announce', title:'Announcement sent — "Rapid Fill cap increased to 10"', detail:'Delivered to 1,284 users via in-app notification and email. Open rate: 62%.', by:'Admin', time:'Mar 20', iconBg:'#e8f5f0', iconColor:'#1a7f5e' },
  { id:6, type:'review', title:'Review removed — Bright Smile Dental → Sarah R.', detail:'1-star review removed — suspected retaliation. Office warned via email.', by:'Admin', time:'Mar 22', iconBg:'#fee2e2', iconColor:'#991b1b' },
  { id:7, type:'flag', title:'Flag created — Marcus J. cancellation abuse', detail:'System automatically flagged 3 cancellations in 30 days. Reliability score: 73%.', by:'System', time:'Mar 21', iconBg:'#ede9fe', iconColor:'#5b21b6' },
  { id:8, type:'reject', title:'Credential rejected — Aisha L. X-Ray Certificate', detail:'Rejected: document image was blurry and unreadable. Professional notified to resubmit.', by:'Admin', time:'Mar 18', iconBg:'#e8f5f0', iconColor:'#1a7f5e' },
  { id:9, type:'suspend', title:'Account reinstated — Marcus J.', detail:'Admin reinstated account after review. Reliability score monitoring continues.', by:'Admin', time:'Mar 17', iconBg:'#e8f5f0', iconColor:'#1a7f5e' },
  { id:10, type:'ticket', title:'Ticket #1039 resolved — Verification delay', detail:'Resolution: Fast-tracked verification for Devon K. ahead of upcoming shift.', by:'Admin', time:'Mar 16', iconBg:'#dbeafe', iconColor:'#1e40af' },
]

const ICONS = {
  approve: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
  suspend: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  ticket: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  refund: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  announce: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  review: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  flag: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  reject: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
}

export default function AdminAudit() {
  const showToast = useToast()
  const [search, setSearch] = useState('')

  const filtered = ENTRIES.filter(e =>
    !search || e.title.toLowerCase().includes(search.toLowerCase()) || e.detail.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        <div className="px-[18px] py-3.5 border-b border-[#f3f4f6] flex items-center justify-between">
          <span className="text-[13px] font-extrabold text-[#1a1a1a]">Audit Log</span>
          <div className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search actions..."
              className="border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px] text-[12px] outline-none bg-[#f9f8f6] text-[#1a1a1a] w-[180px] focus:border-[#1a7f5e]"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              onClick={() => showToast('Exporting audit log...')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold cursor-pointer bg-white text-[#374151] border border-[#e5e7eb] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition"
              style={{ fontFamily: 'inherit' }}
            >
              Export
            </button>
          </div>
        </div>

        {filtered.map(entry => (
          <div key={entry.id} className="flex items-start gap-3 px-4 py-3 border-b border-[#f9f8f6] last:border-0 hover:bg-[#fafffe]">
            <div className="w-[28px] h-[28px] rounded-[7px] flex items-center justify-center flex-shrink-0" style={{ background: entry.iconBg, color: entry.iconColor }}>
              {ICONS[entry.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-[#1a1a1a] mb-0.5">{entry.title}</div>
              <div className="text-[11px] text-[#6b7280] leading-snug">{entry.detail}</div>
            </div>
            <div className="text-[10px] text-[#9ca3af] text-right flex-shrink-0">
              <div>{entry.by}</div>
              <div>{entry.time}</div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#9ca3af]">
            <div className="text-[13px] font-bold text-[#1a1a1a] mb-1">No results found</div>
            <div className="text-[12px]">Try a different search term</div>
          </div>
        )}
      </div>
    </div>
  )
}
