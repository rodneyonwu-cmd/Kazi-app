import { useState } from 'react'
import { BTN } from './adminStyles'
import { useToast } from './ToastContext'

const RECENT = [
  { title: 'Rapid Fill cap increased to 10', segment: 'All users', date: 'Mar 20, 2026', body: 'We have increased the Rapid Fill professional cap from 8 to 10, giving offices more flexibility when filling urgent shifts.', status: 'sent' },
  { title: 'Scheduled maintenance — Mar 15', segment: 'All users', date: 'Mar 13, 2026', body: 'kazi. will be undergoing scheduled maintenance on March 15 from 2–4 AM CST. Brief service interruptions may occur.', status: 'expired' },
  { title: 'New feature: Availability Calendar', segment: 'Professionals', date: 'Mar 5, 2026', body: 'Professionals can now set their weekly availability directly from their profile. Offices will see your calendar when browsing.', status: 'expired' },
]

const SEGMENTS = ['All users', 'Offices only', 'Professionals only', 'Houston, TX', 'Dallas, TX', 'Austin, TX']
const DELIVERY = ['In-app notification', 'Email', 'Push notification']

export default function AdminAnnouncements() {
  const showToast = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [segments, setSegments] = useState(['All users'])
  const [delivery, setDelivery] = useState(['In-app notification'])
  const [recent, setRecent] = useState(RECENT)

  const toggleSeg = (val) => setSegments(prev => prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val])
  const toggleDel = (val) => setDelivery(prev => prev.includes(val) ? prev.filter(d => d !== val) : [...prev, val])

  const send = () => {
    if (!title.trim() || !body.trim()) { showToast('Please fill in title and message'); return }
    setRecent(prev => [{ title, segment: segments.join(', '), date: 'Just now', body, status: 'sent' }, ...prev])
    setTitle('')
    setBody('')
    setSegments(['All users'])
    setDelivery(['In-app notification'])
    showToast('Announcement sent to selected users!')
  }

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Compose */}
      <div>
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-5">
          <div className="text-[14px] font-extrabold text-[#1a1a1a] mb-4">New Announcement</div>

          <div className="mb-3.5">
            <label className="block text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Platform maintenance scheduled" className="w-full border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 text-[13px] outline-none bg-[#f9f8f6] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
          </div>

          <div className="mb-3.5">
            <label className="block text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Message</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your announcement here..." className="w-full border border-[#e5e7eb] rounded-[9px] px-3 py-2.5 text-[13px] outline-none bg-[#f9f8f6] resize-none h-[90px] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
          </div>

          <div className="mb-3.5">
            <label className="block text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Send to</label>
            <div className="grid grid-cols-3 gap-2">
              {SEGMENTS.map(s => (
                <button key={s} onClick={() => toggleSeg(s)} className={`px-2 py-2 rounded-[9px] border text-[11px] font-bold cursor-pointer transition text-center ${segments.includes(s) ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{s}</button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Delivery method</label>
            <div className="flex gap-2">
              {DELIVERY.map(d => (
                <button key={d} onClick={() => toggleDel(d)} className={`flex-1 px-2 py-2 rounded-[9px] border text-[11px] font-bold cursor-pointer transition text-center ${delivery.includes(d) ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e]'}`} style={{ fontFamily: 'inherit' }}>{d}</button>
              ))}
            </div>
          </div>

          <button onClick={send} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-[13px] transition border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>
            Send announcement
          </button>
        </div>
      </div>

      {/* Recent */}
      <div>
        <div className="text-[13px] font-extrabold text-[#1a1a1a] mb-3">Recent Announcements</div>
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
          {recent.map((r, i) => (
            <div key={i} className="px-4 py-4 border-b border-[#f3f4f6] last:border-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-[13px] font-bold text-[#1a1a1a]">{r.title}</div>
                <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${r.status === 'sent' ? 'bg-[#e8f5f0] text-[#1a7f5e]' : 'bg-[#f3f4f6] text-[#6b7280]'}`}>
                  {r.status === 'sent' ? 'Sent' : 'Expired'}
                </span>
              </div>
              <div className="text-[11px] text-[#9ca3af] mb-1.5">Sent to {r.segment} · {r.date}</div>
              <div className="text-[12px] text-[#374151] leading-relaxed">{r.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
