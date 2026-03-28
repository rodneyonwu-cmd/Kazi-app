import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProviderNav from '../components/ProviderNav'

const pendingRequests = [
  {
    id: 'req1',
    initials: 'ED', logoBg: 'bg-[#e8f5f0]', logoColor: 'text-[#1a7f5e]',
    name: 'Evolve Dentistry', stars: '★ 4.9', reviews: 38, distance: '3.2 mi',
    rate: 52, estPay: '$468',
    date: 'Wed Mar 26', time: '8:00 AM – 5:00 PM', role: 'Dental Hygienist',
    badges: [{ label: 'Instant Pay', style: 'bg-[#fef9c3] text-[#92400e]' }, { label: 'Eaglesoft', style: 'bg-[#f3f4f6] text-[#374151]' }],
    message: 'We would love to have you back! You worked with us in February and the team loved you.',
  },
  {
    id: 'req2',
    initials: 'BS', logoBg: 'bg-[#fef9c3]', logoColor: 'text-[#92400e]',
    name: 'Bright Smile Dental', stars: '★ 4.7', reviews: 22, distance: '6.8 mi',
    rate: 58, estPay: '$406',
    date: 'Fri Mar 28', time: '9:00 AM – 4:00 PM', role: 'Dental Hygienist',
    badges: [{ label: 'Dentrix', style: 'bg-[#f3f4f6] text-[#374151]' }],
    message: null,
  },
]

const approvedRequests = [
  { id: 'app1', initials: 'ED', logoBg: 'bg-[#e8f5f0]', logoColor: 'text-[#1a7f5e]', name: 'Evolve Dentistry', stars: '★ 4.9', reviews: 38, rate: 52, date: 'Mon Mar 24', time: '8:00 AM – 5:00 PM' },
  { id: 'app2', initials: 'HF', logoBg: 'bg-[#e8f5f0]', logoColor: 'text-[#1a7f5e]', name: 'Houston Family Dentistry', stars: '★ 4.8', reviews: 29, rate: 52, date: 'Wed Mar 19', time: '8:00 AM – 4:00 PM' },
  { id: 'app3', initials: 'CL', logoBg: 'bg-[#ede9fe]', logoColor: 'text-[#5b21b6]', name: 'Clear Lake Dental', stars: '★ 5.0', reviews: 51, rate: 65, date: 'Fri Mar 14', time: '9:00 AM – 3:00 PM' },
]

const declinedRequests = [
  { id: 'dec1', initials: 'PS', logoBg: 'bg-[#f3f4f6]', logoColor: 'text-[#9ca3af]', name: 'Pearland Smiles', stars: '★ 4.5', reviews: 14, rate: 48, date: 'Tue Mar 18', time: '8:00 AM – 5:00 PM' },
]

function NavBar({ navigate }) {
  return (
    <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center justify-center sticky top-0 z-50">
      <div className="w-full max-w-[1280px] mx-auto px-[120px] flex items-center justify-between"><span className="text-[#1a7f5e] font-bold text-3xl tracking-tight cursor-pointer" onClick={() => navigate('/provider-dashboard')}>kazi.</span>
      <div className="hidden md:flex items-center gap-8">
        {[
          { label: 'Dashboard', path: '/provider-dashboard' },
          { label: 'Requests', path: '/provider-requests', active: true, badge: 2 },
          { label: 'Find Shifts', path: '/provider-find-shifts' },
          { label: 'Messages', path: '/provider-messages' },
        ].map(({ label, path, active, badge }) => (
          <div key={label} className="relative cursor-pointer" onClick={() => navigate(path)}>
            <span className={`text-sm font-semibold transition ${active ? 'text-[#1a7f5e]' : 'text-[#6b7280] hover:text-[#1a1a1a]'}`}>{label}</span>
            {active && <div className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-[#1a7f5e]" />}
            {badge && <span className="absolute -top-2 -right-4 bg-[#ef4444] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>}
          </div>
        ))}
      </div>
      <div className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-[#e5e7eb]" onClick={() => navigate('/provider-dashboard')}>
        <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah" className="w-full h-full object-cover" />
      </div>
      </div>
    </nav>
  )
}

function MobileToolbar({ navigate }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
      {[
        { label: 'Home', path: '/provider-dashboard', icon: <HomeIcon /> },
        { label: 'Requests', path: '/provider-requests', icon: <RequestsIcon />, active: true, badge: 2 },
        { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
        { label: 'Messages', path: '/provider-messages', icon: <MessageIcon /> },
        { label: 'Earnings', path: '/provider-earnings', icon: <EarningsIcon /> },
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
  )
}

function ShiftCard({ shift, onAccept, onDecline, onOpen, status }) {
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-4 hover:border-[#1a7f5e] transition cursor-pointer" onClick={() => onOpen && onOpen(shift)}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-[12px] ${shift.logoBg} flex items-center justify-center text-[12px] font-black ${shift.logoColor} flex-shrink-0`}>{shift.initials}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-black text-[#1a1a1a]">{shift.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] font-bold text-[#F97316]">{shift.stars}</span>
            <span className="text-[13px] text-[#9ca3af]">({shift.reviews})</span>
            {shift.distance && <span className="text-[13px] font-semibold text-[#6b7280]">· {shift.distance}</span>}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-[20px] font-black text-[#1a1a1a]">${shift.rate}</span>
          <span className="text-[12px] text-[#9ca3af]">/hr</span>
        </div>
      </div>
      {shift.badges && (
        <div className="flex gap-2 flex-wrap mb-3">
          {shift.badges.map(b => <span key={b.label} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${b.style}`}>{b.label}</span>)}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-[12px] text-[#6b7280]"><CalIcon />{shift.date}</div>
        <div className="flex items-center gap-1.5 text-[12px] text-[#6b7280]"><ClockIcon />{shift.time}</div>
      </div>
      {shift.estPay && <p className="text-[12px] text-[#9ca3af] mb-3">Est. pay <span className="font-bold text-[#1a7f5e]">{shift.estPay}</span></p>}
      {shift.message && (
        <div className="bg-[#fff8e1] rounded-[10px] px-3 py-2.5 mb-3 text-[13px] text-[#92400e] italic" onClick={e => e.stopPropagation()}>
          "{shift.message}"
        </div>
      )}
      {status === 'pending' && (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => onAccept(shift.id)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-[13px] transition">Accept</button>
          <button onClick={() => onDecline(shift.id)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px] hover:border-[#ef4444] hover:text-[#ef4444] transition">Decline</button>
        </div>
      )}
      {status === 'approved' && <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-[#e8f5f0] text-[#1a7f5e]">Accepted</span>}
      {status === 'declined' && <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-[#fee2e2] text-[#991b1b]">Declined</span>}
    </div>
  )
}

export default function ShiftRequests() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('pending')
  const [pending, setPending] = useState(pendingRequests)
  const [approved, setApproved] = useState(approvedRequests)
  const [declined, setDeclined] = useState(declinedRequests)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const handleAccept = (id) => {
    const req = pending.find(r => r.id === id)
    setPending(prev => prev.filter(r => r.id !== id))
    setApproved(prev => [req, ...prev])
    showToast('Shift accepted!')
  }

  const handleDecline = (id) => {
    const req = pending.find(r => r.id === id)
    setPending(prev => prev.filter(r => r.id !== id))
    setDeclined(prev => [req, ...prev])
    showToast('Shift declined.')
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">
      <NavBar navigate={navigate} />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-5">
          <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Shift Requests</h1>
          <p className="text-[13px] text-[#9ca3af]">Offices invite you — accept or decline on your terms</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { key: 'pending', label: 'Pending', count: pending.length, countStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
            { key: 'approved', label: 'Approved', count: approved.length, countStyle: 'bg-[#f3f4f6] text-[#374151]' },
            { key: 'declined', label: 'Declined', count: declined.length, countStyle: 'bg-[#f3f4f6] text-[#374151]' },
          ].map(({ key, label, count, countStyle }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-full text-[13px] font-bold border transition ${tab === key ? 'border-[#1a7f5e] text-[#1a7f5e] bg-white' : 'border-[#e5e7eb] text-[#6b7280] bg-white'}`}
            >
              {label} <span className={`ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${countStyle}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-4">
          {tab === 'pending' && (
            pending.length === 0
              ? <div className="text-center py-16 text-[#9ca3af]"><p className="text-[15px] font-semibold">No pending requests</p><p className="text-[13px] mt-1">You're all caught up!</p></div>
              : pending.map(r => <ShiftCard key={r.id} shift={r} status="pending" onAccept={handleAccept} onDecline={handleDecline} />)
          )}
          {tab === 'approved' && approved.map(r => <ShiftCard key={r.id} shift={r} status="approved" />)}
          {tab === 'declined' && (
            declined.length === 0
              ? <div className="text-center py-16 text-[#9ca3af]"><p className="text-[15px] font-semibold">No declined requests</p></div>
              : declined.map(r => <ShiftCard key={r.id} shift={r} status="declined" />)
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[13px] font-semibold px-5 py-3 rounded-full shadow-lg z-50">
          {toast}
        </div>
      )}

      <MobileToolbar navigate={navigate} />
    </div>
  )
}

function CalIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function ClockIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> }
function HomeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function RequestsIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MessageIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarningsIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
