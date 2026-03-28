import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Messages() {
  const navigate = useNavigate()
  const [activeConvo, setActiveConvo] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState({
    aisha: [
      { id: 1, sent: false, text: 'Hi! I just wanted to confirm I\'ll be there Monday at 8am. Should I bring anything specific?', time: '8:00 AM' },
      { id: 2, sent: true, text: 'Hi Aisha, we have an opening for a dental hygienist on March 17th. Are you available?', time: '8:15 AM' },
      { id: 3, sent: false, text: 'I have experience with Eaglesoft and can arrive early if needed. What time would you need me?', time: '8:30 AM' },
    ],
    sarah: [
      { id: 1, sent: true, text: 'Hi Sarah, looking forward to seeing you on the 17th!', time: 'Yesterday' },
      { id: 2, sent: false, text: 'Looking forward to it!', time: 'Yesterday' },
    ],
    marcus: [
      { id: 1, sent: false, text: 'What time should I arrive?', time: 'Mon' },
      { id: 2, sent: true, text: 'Please arrive by 7:45am so we can get you set up.', time: 'Mon' },
    ],
    nina: [
      { id: 1, sent: false, text: 'Thank you for the invite!', time: 'Sun' },
    ],
    devon: [
      { id: 1, sent: true, text: 'We\'ll see you on the 10th!', time: 'Sat' },
      { id: 2, sent: false, text: 'Sounds good, see you then.', time: 'Sat' },
    ],
  })
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const convos = [
    { id: 'aisha', name: 'Aisha L.', role: 'Dental Hygienist', lastMsg: 'I have experience with Eaglesoft...', time: '8:30 AM', unread: true, bg: '#b0bec5' },
    { id: 'sarah', name: 'Sarah R.', role: 'Dental Hygienist', lastMsg: 'Looking forward to it!', time: 'Yesterday', unread: false, bg: '#c8e6c9' },
    { id: 'marcus', name: 'Marcus J.', role: 'Dental Assistant', lastMsg: 'What time should I arrive?', time: 'Mon', unread: false, bg: '#d7ccc8' },
    { id: 'nina', name: 'Nina P.', role: 'Dental Hygienist', lastMsg: 'Thank you for the invite!', time: 'Sun', unread: false, bg: '#e1bee7' },
    { id: 'devon', name: 'Devon K.', role: 'Dental Assistant', lastMsg: 'Sounds good, see you then.', time: 'Sat', unread: false, bg: '#546e7a' },
  ]

  const active = convos.find(c => c.id === activeConvo)
  const activeMessages = activeConvo ? messages[activeConvo] : []
  const lastSentMsg = activeMessages ? [...activeMessages].reverse().find(m => m.sent) : null

  const handleSend = () => {
    if (!message.trim()) return
    const newMsg = { id: Date.now(), sent: true, text: message.trim(), time: 'Just now' }
    setMessages(prev => ({ ...prev, [activeConvo]: [...prev[activeConvo], newMsg] }))
    setMessage('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  // ── Empty state: no conversations at all ──
  const NoConversations = () => (
    <div className="flex-1 flex items-center justify-center bg-[#f9f8f6]">
      <div className="text-center px-8">
        <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">No messages yet</p>
        <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6 max-w-[240px] mx-auto">When you connect with professionals your conversations will appear here.</p>
        <button onClick={() => navigate('/professionals')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition">
          Browse professionals
        </button>
      </div>
    </div>
  )

  // ── Empty state: no convo selected ──
  const NoConvoSelected = () => (
    <div className="flex-1 flex items-center justify-center bg-[#f9f8f6]">
      <div className="text-center px-8">
        <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">Select a conversation</p>
        <p className="text-[13px] text-[#9ca3af]">Choose a conversation from the list to get started.</p>
      </div>
    </div>
  )

  const hasConvos = convos.length > 0

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <Nav />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      <div className="flex-1 flex justify-center overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="w-full max-w-[860px] flex border-x border-[#e5e7eb] bg-white">

          {/* Conversation list */}
          <div className="w-[280px] flex-shrink-0 border-r border-[#e5e7eb] flex flex-col">
            <div className="p-4 border-b border-[#e5e7eb]">
              <h2 className="text-lg font-extrabold text-[#1a1a1a]">Messages</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!hasConvos ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">No messages</p>
                  <p className="text-[12px] text-[#9ca3af]">Your conversations will appear here.</p>
                </div>
              ) : (
                convos.map(convo => (
                  <div key={convo.id} onClick={() => setActiveConvo(convo.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#e5e7eb] transition ${activeConvo === convo.id ? 'bg-[#e8f5f0]' : 'hover:bg-[#f9f8f6]'}`}>
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
                ))
              )}
            </div>
          </div>

          {/* Active conversation or empty state */}
          {!hasConvos ? (
            <NoConversations />
          ) : !activeConvo ? (
            <NoConvoSelected />
          ) : (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Convo header */}
              <div className="bg-white border-b border-[#e5e7eb] px-5 h-16 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full relative flex-shrink-0" style={{ background: active.bg }}>
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#1a7f5e] border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">{active.name}</p>
                    <p className="text-xs text-[#6b7280]">{active.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 relative">
                  <button onClick={() => showToast(`Calling ${active.name}...`)} className="w-9 h-9 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.23h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </button>
                  <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="w-9 h-9 rounded-full border border-[#e5e7eb] flex items-center justify-center hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                  </button>
                  {showMoreMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)}></div>
                      <div className="absolute right-0 top-11 bg-white border border-[#e5e7eb] rounded-xl shadow-lg w-44 z-20 overflow-hidden">
                        <div onClick={() => { navigate('/profile'); setShowMoreMenu(false) }} className="px-4 py-3 text-sm text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          View profile
                        </div>
                        <div onClick={() => { showToast('Conversation archived'); setShowMoreMenu(false) }} className="px-4 py-3 text-sm text-[#1a1a1a] hover:bg-[#f9f8f6] cursor-pointer flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                          Archive
                        </div>
                        <div onClick={() => { showToast(`${active.name} blocked`); setShowMoreMenu(false) }} className="px-4 py-3 text-sm text-red-500 hover:bg-[#f9f8f6] cursor-pointer flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                          Block
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Shift banner */}
              <div className="bg-[#e8f5f0] border-b border-[#c6e6d9] px-5 py-2.5 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <p className="text-sm font-semibold text-[#1a7f5e]">Shift: Mon Mar 17 · Dental Hygienist · 8:00am – 5:00pm</p>
                </div>
                <span className="text-xs font-bold bg-[#1a7f5e] text-white px-3 py-1 rounded-full">Confirmed</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
                {activeMessages.map((msg, index) => {
                  const isLastSent = msg.sent && msg.id === lastSentMsg?.id
                  const isLastOverall = index === activeMessages.length - 1
                  return (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sent ? 'flex-row-reverse' : ''}`}>
                      {!msg.sent && <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: active.bg }}></div>}
                      <div className="max-w-[65%]">
                        <div className={`rounded-2xl px-4 py-2.5 ${msg.sent ? 'bg-[#1a7f5e] rounded-br-sm' : 'bg-white border border-[#e5e7eb] rounded-bl-sm'}`}>
                          <p className={`text-sm ${msg.sent ? 'text-white' : 'text-[#1a1a1a]'}`}>{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${msg.sent ? 'justify-end mr-1' : 'ml-1'}`}>
                          <p className="text-xs text-[#9ca3af]">{msg.time}</p>
                          {msg.sent && isLastSent && isLastOverall && (
                            <span className="text-xs text-[#1a7f5e] font-semibold flex items-center gap-0.5">
                              <svg width="16" height="10" viewBox="0 0 18 10" fill="none">
                                <path d="M1 5l3.5 3.5L11 1" stroke="#1a7f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M6 5l3.5 3.5L16 1" stroke="#1a7f5e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              Read
                            </span>
                          )}
                          {msg.sent && !(isLastSent && isLastOverall) && (
                            <svg width="16" height="10" viewBox="0 0 18 10" fill="none">
                              <path d="M1 5l3.5 3.5L11 1" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6 5l3.5 3.5L16 1" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Input */}
              <div className="bg-white border-t border-[#e5e7eb] px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type a message..." className="flex-1 border border-[#e5e7eb] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#1a7f5e] transition" />
                <button onClick={handleSend} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${message.trim() ? 'bg-[#1a7f5e] hover:bg-[#156649]' : 'bg-[#e5e7eb]'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
