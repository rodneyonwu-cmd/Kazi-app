import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Messages() {
  const navigate = useNavigate()
  const [activeConvo, setActiveConvo] = useState('aisha')
  const [message, setMessage] = useState('')

  const convos = [
    { id: 'aisha', name: 'Aisha L.', role: 'Dental Hygienist', lastMsg: 'I have experience with Eaglesoft...', time: '8:30 AM', unread: true, bg: '#b0bec5' },
    { id: 'sarah', name: 'Sarah R.', role: 'Dental Hygienist', lastMsg: 'Looking forward to it!', time: 'Yesterday', unread: false, bg: '#c8e6c9' },
    { id: 'marcus', name: 'Marcus J.', role: 'Dental Assistant', lastMsg: 'What time should I arrive?', time: 'Mon', unread: false, bg: '#d7ccc8' },
    { id: 'nina', name: 'Nina P.', role: 'Dental Hygienist', lastMsg: 'Thank you for the invite!', time: 'Sun', unread: false, bg: '#e1bee7' },
    { id: 'devon', name: 'Devon K.', role: 'Dental Assistant', lastMsg: 'Sounds good, see you then.', time: 'Sat', unread: false, bg: '#546e7a' },
  ]

  const active = convos.find(c => c.id === activeConvo)

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">

      <nav className="bg-white border-b border-[#e5e7eb] h-16 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-[#1a7f5e] font-bold text-2xl cursor-pointer" onClick={() => navigate('/dashboard')}>kazi.</span>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-sm text-[#6b7280] cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="text-sm text-[#6b7280] cursor-pointer">Applicants</span>
            <span className="text-sm text-[#6b7280] cursor-pointer" onClick={() => navigate('/professionals')}>Professionals</span>
            <span className="text-sm text-[#6b7280] cursor-pointer">Bookings</span>
            <span className="text-sm font-semibold text-[#1a7f5e] cursor-pointer">Messages</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1a7f5e] text-white text-sm font-bold flex items-center justify-center cursor-pointer">BS</div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden max-w-[1100px] mx-auto w-full" style={{ height: 'calc(100vh - 64px)' }}>

        <div className="w-[300px] flex-shrink-0 border-r border-[#e5e7eb] bg-white flex flex-col">
          <div className="p-4 border-b border-[#e5e7eb]">
            <h2 className="text-lg font-extrabold text-[#1a1a1a]">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convos.map(convo => (
              <div
                key={convo.id}
                onClick={() => setActiveConvo(convo.id)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#e5e7eb] transition ${activeConvo === convo.id ? 'bg-[#e8f5f0]' : 'hover:bg-[#f9f8f6]'}`}
              >
                <div className="w-10 h-10 rounded-full flex-shrink-0" style={{ background: convo.bg }}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[#1a1a1a]">{convo.name}</p>
                    <p className="text-xs text-[#9ca3af]">{convo.time}</p>
                  </div>
                  <p className="text-xs text-[#6b7280] truncate">{convo.lastMsg}</p>
                </div>
                {convo.unread && <div className="w-2 h-2 rounded-full bg-[#1a7f5e] flex-shrink-0"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">

          <div className="bg-white border-b border-[#e5e7eb] px-6 h-16 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full relative" style={{ background: active.bg }}>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1a7f5e] border-2 border-white"></div>
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a]">{active.name}</p>
                <p className="text-xs text-[#6b7280]">{active.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="w-9 h-9 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:border-[#1a7f5e] transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </button>
              <button className="w-9 h-9 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:border-[#1a7f5e] transition">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </button>
            </div>
          </div>

          <div className="bg-[#e8f5f0] border-b border-[#c6e6d9] px-6 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <p className="text-sm font-semibold text-[#1a7f5e]">Shift: Mon Mar 17 · Dental Hygienist · 8:00am – 5:00pm</p>
            </div>
            <span className="text-xs font-bold bg-[#1a7f5e] text-white px-3 py-1 rounded-full">Confirmed</span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: active.bg }}></div>
              <div className="max-w-[60%]">
                <div className="bg-white border border-[#e5e7eb] rounded-2xl rounded-bl-sm px-4 py-3">
                  <p className="text-sm text-[#1a1a1a]">Hi! I just wanted to confirm I'll be there Monday at 8am. Should I bring anything specific?</p>
                </div>
                <p className="text-xs text-[#9ca3af] mt-1 ml-1">8:00 AM</p>
              </div>
            </div>

            <div className="flex items-end gap-2 flex-row-reverse">
              <div className="max-w-[60%]">
                <div className="bg-[#1a7f5e] rounded-2xl rounded-br-sm px-4 py-3">
                  <p className="text-sm text-white">Hi Aisha, we have an opening for a dental hygienist on March 17th. Are you available?</p>
                </div>
                <p className="text-xs text-[#9ca3af] mt-1 text-right mr-1">8:15 AM</p>
              </div>
            </div>

            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: active.bg }}></div>
              <div className="max-w-[60%]">
                <div className="bg-white border border-[#e5e7eb] rounded-2xl rounded-bl-sm px-4 py-3">
                  <p className="text-sm text-[#1a1a1a]">I have experience with Eaglesoft and can arrive early if needed. What time would you need me?</p>
                </div>
                <p className="text-xs text-[#9ca3af] mt-1 ml-1">8:30 AM</p>
              </div>
            </div>

          </div>

          <div className="bg-white border-t border-[#e5e7eb] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-[#e5e7eb] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#1a7f5e] transition"
            />
            <button className="w-10 h-10 bg-[#1a7f5e] hover:bg-[#156649] rounded-full flex items-center justify-center transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}