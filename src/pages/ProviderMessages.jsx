import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import ProviderNav from '../components/ProviderNav'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function ProviderMessages() {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeId, setActiveId] = useState(null)
  const [extraMessages, setExtraMessages] = useState({})
  const [input, setInput] = useState('')

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) setConversations(await res.json())
      } catch {}
      setLoading(false)
    }
    fetchConversations()
  }, [getToken])

  const filtered = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const activeConv = conversations.find(c => c.id === activeId)
  const activeMessages = activeConv ? [...activeConv.messages, ...(extraMessages[activeId] || [])] : []

  const sendMessage = async () => {
    if (!input.trim() || !activeId) return
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const text = input.trim()
    setExtraMessages(prev => ({ ...prev, [activeId]: [...(prev[activeId] || []), { from: 'me', text, time }] }))
    setInput('')
    try {
      const token = await getToken()
      const activeConv = conversations.find(c => c.id === activeId)
      if (activeConv?.officeId && activeConv?.providerId) {
        await fetch(`${API_URL}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ officeId: activeConv.officeId, providerId: activeConv.providerId, body: text, fromRole: 'PROVIDER' }),
        })
      }
    } catch {}
  }

  const hasConvos = filtered.length > 0

  // ── No conversations empty state ──
  const NoConversations = () => (
    <div className="flex-1 flex items-center justify-center bg-[#f9f8f6]">
      <div className="text-center px-8">
        <div className="w-16 h-16 rounded-full bg-[#e8f5f0] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">No messages yet</p>
        <p className="text-[14px] text-[#9ca3af] leading-relaxed max-w-[240px] mx-auto">When offices reach out to you your conversations will appear here.</p>
      </div>
    </div>
  )

  // ── No convo selected empty state ──
  const NoConvoSelected = () => (
    <div className="flex-1 flex items-center justify-center bg-[#f9f8f6]">
      <div className="text-center px-8">
        <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">Select a conversation</p>
        <p className="text-[13px] text-[#9ca3af]">Choose a conversation from the list to start chatting.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <ProviderNav />

      <div className="flex flex-1 overflow-hidden justify-center" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="flex w-full max-w-4xl border-x border-[#e5e7eb] bg-white">

          {/* LEFT — conversation list */}
          <div className="w-[280px] flex-shrink-0 border-r border-[#e5e7eb] bg-white flex flex-col">
            <div className="p-4 border-b border-[#f3f4f6]">
              <h2 className="text-[18px] font-black text-[#1a1a1a] mb-3">Messages</h2>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-[#f9f8f6] border border-[#f3f4f6] rounded-xl pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#1a7f5e] transition" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col gap-0">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f4f6] animate-pulse">
                      <div className="w-10 h-10 rounded-[11px] bg-[#e5e7eb] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="h-3 bg-[#e5e7eb] rounded w-3/4 mb-2" />
                        <div className="h-2.5 bg-[#f3f4f6] rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !hasConvos ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#e8f5f0] flex items-center justify-center mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <p className="text-[14px] font-bold text-[#1a1a1a] mb-1">No messages yet</p>
                  <p className="text-[12px] text-[#9ca3af] max-w-[200px]">When offices reach out, your conversations will appear here.</p>
                </div>
              ) : (
                filtered.map(conv => (
                  <div key={conv.id} onClick={() => setActiveId(conv.id)} className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#f3f4f6] transition ${activeId === conv.id ? 'bg-[#f0faf5] border-l-2 border-l-[#1a7f5e]' : 'hover:bg-[#f9f8f6]'}`}>
                    <div className="relative flex-shrink-0">
                      <div className={`w-10 h-10 rounded-[11px] ${conv.logoBg} flex items-center justify-center text-[11px] font-black ${conv.logoColor}`}>{conv.initials}</div>
                      {conv.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1a7f5e] border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-[13px] ${conv.unread > 0 ? 'font-black' : 'font-semibold'} text-[#1a1a1a] truncate`}>{conv.name}</p>
                        <p className="text-[11px] text-[#9ca3af] flex-shrink-0 ml-1">{conv.time}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={`text-[12px] truncate ${conv.unread > 0 ? 'font-semibold text-[#374151]' : 'text-[#9ca3af]'}`}>{conv.preview}</p>
                        {conv.unread > 0 && <span className="ml-1 bg-[#1a7f5e] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0">{conv.unread}</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT — chat thread */}
          {!hasConvos ? (
            <NoConversations />
          ) : !activeId ? (
            <NoConvoSelected />
          ) : (
            <div className="flex-1 flex flex-col bg-[#f9f8f6] overflow-hidden">
              <div className="bg-white border-b border-[#e5e7eb] px-6 py-3.5 flex items-center gap-3 flex-shrink-0">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-[11px] ${activeConv.logoBg} flex items-center justify-center text-[11px] font-black ${activeConv.logoColor}`}>{activeConv.initials}</div>
                  {activeConv.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#1a7f5e] border-2 border-white" />}
                </div>
                <div>
                  <p className="text-[15px] font-black text-[#1a1a1a]">{activeConv.name}</p>
                  <p className={`text-[12px] font-semibold ${activeConv.online ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}`}>{activeConv.online ? 'Online now' : 'Offline'}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
                {activeMessages.map((msg, i) => {
                  const isMe = msg.from === 'me'
                  return (
                    <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} gap-1`}>
                      <div className={`max-w-[65%] px-4 py-2.5 text-[14px] leading-relaxed ${isMe ? 'bg-[#1a7f5e] text-white rounded-[18px_18px_4px_18px]' : 'bg-white text-[#1a1a1a] rounded-[18px_18px_18px_4px] border border-[#e5e7eb]'}`}>
                        {msg.text}
                      </div>
                      <p className="text-[11px] text-[#9ca3af] px-1">{msg.time}</p>
                    </div>
                  )
                })}
              </div>

              <div className="bg-white border-t border-[#e5e7eb] px-6 py-3 flex gap-3 items-end flex-shrink-0">
                <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }} placeholder="Type a message..." rows={1} className="flex-1 bg-[#f9f8f6] border border-[#f3f4f6] rounded-[16px] px-4 py-2.5 text-[14px] outline-none focus:border-[#1a7f5e] transition resize-none" />
                <button onClick={sendMessage} className="w-10 h-10 rounded-full bg-[#1a7f5e] hover:bg-[#156649] flex items-center justify-center flex-shrink-0 transition">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE TOOLBAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home', path: '/provider-dashboard', icon: <HomeIcon /> },
          { label: 'Requests', path: '/provider-requests', icon: <ReqIcon /> },
          { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
          { label: 'Messages', path: '/provider-messages', icon: <MsgIcon />, active: true },
          { label: 'Earnings', path: '/provider-earnings', icon: <EarnIcon /> },
        ].map(({ label, path, active, icon, badge }) => (
          <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
            <div className="relative">
              <span className={active ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}>{icon}</span>
              {badge && <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{badge}</span>}
            </div>
            <span className={`text-[10px] ${active ? 'font-bold text-[#1a7f5e]' : 'font-semibold text-[#9ca3af]'}`}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
