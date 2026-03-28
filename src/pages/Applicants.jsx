import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

const EmptyState = ({ icon, title, sub, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4">{icon}</div>
    <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">{title}</p>
    <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6 max-w-[280px]">{sub}</p>
    {action}
  </div>
)

export default function Applicants() {
  const navigate = useNavigate()
  const [activeTopTab, setActiveTopTab] = useState('all')
  const [openGroups, setOpenGroups] = useState({ 1: true, 2: true, 3: true })
  const [toast, setToast] = useState(null)
  const [accepted, setAccepted] = useState({})
  const [declined, setDeclined] = useState({})
  const [shortlisted, setShortlisted] = useState({})
  const [subTabs, setSubTabs] = useState({ 1: 'All', 2: 'All', 3: 'All' })

  const toggleGroup = (id) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))

  const handleAccept = (key, name) => {
    setAccepted(prev => ({ ...prev, [key]: true }))
    setDeclined(prev => ({ ...prev, [key]: false }))
    setToast(`${name} accepted — shift confirmed!`)
    setTimeout(() => setToast(null), 3000)
  }

  const handleDecline = (key, name) => {
    setDeclined(prev => ({ ...prev, [key]: true }))
    setAccepted(prev => ({ ...prev, [key]: false }))
    setShortlisted(prev => ({ ...prev, [key]: false }))
    setToast(`${name} declined`)
    setTimeout(() => setToast(null), 3000)
  }

  const handleShortlist = (key, name) => {
    const isNow = !shortlisted[key]
    setShortlisted(prev => ({ ...prev, [key]: isNow }))
    setToast(isNow ? `${name} shortlisted!` : `${name} removed from shortlist`)
    setTimeout(() => setToast(null), 3000)
  }

  const filterApplicants = (applicants, groupId) => {
    const tab = subTabs[groupId]
    return applicants.filter(ap => {
      const isAccepted = ap.preAccepted || accepted[ap.key]
      const isDeclined = declined[ap.key]
      const isShortlisted = shortlisted[ap.key]
      if (tab === 'All') return true
      if (tab === 'Pending') return !isAccepted && !isDeclined && !isShortlisted
      if (tab === 'Accepted') return isAccepted
      if (tab === 'Reviewing') return !isDeclined && !isShortlisted
      if (tab === 'Shortlisted') return isShortlisted
      if (tab === 'Declined') return isDeclined
      return true
    })
  }

  const group1 = [
    { key: '1-sarah', name: 'Sarah R.', rating: '⭐ 4.9', reviews: 47, meta: '$52/hr · 2.1 mi · 97% reliable', applied: 'Applied 2 hours ago', bg: '#c8e6c9', img: 'https://randomuser.me/api/portraits/women/44.jpg', preAccepted: true },
    { key: '1-aisha', name: 'Aisha L.', rating: '⭐ 5', reviews: 63, meta: '$58/hr · 3.8 mi · 94% reliable', applied: 'Applied 3 hours ago', quote: '"I have experience with Eaglesoft and can arrive early if needed."', bg: '#b0bec5', img: 'https://randomuser.me/api/portraits/women/65.jpg' },
    { key: '1-nina', name: 'Nina P.', rating: '⭐ 4.9', reviews: 52, meta: '$54/hr · 5.2 mi · 86% reliable', applied: 'Applied 5 hours ago', bg: '#e1bee7', img: 'https://randomuser.me/api/portraits/women/28.jpg' },
    { key: '1-marcus', name: 'Marcus J.', rating: '⭐ 4.8', reviews: 38, meta: '$48/hr · 6.7 mi · 73% reliable', applied: 'Applied 6 hours ago', quote: '"Available for last-minute shifts and have my own equipment."', bg: '#d7ccc8', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  ]
  const group2 = [
    { key: '2-tara', name: 'Tara C.', rating: '⭐ 4.7', reviews: 34, meta: '$42/hr · 4.3 mi · 98% reliable', applied: 'Applied 1 hour ago', bg: '#ffccbc', img: 'https://randomuser.me/api/portraits/women/17.jpg' },
    { key: '2-devon', name: 'Devon K.', rating: '⭐ 4.6', reviews: 28, meta: '$40/hr · 7.1 mi · 84% reliable', applied: 'Applied 4 hours ago', bg: '#546e7a', img: 'https://randomuser.me/api/portraits/men/41.jpg' },
  ]
  const group3 = [
    { key: '3-rachel', name: 'Rachel M.', rating: '⭐ 4.9', reviews: 71, meta: '$72,000/yr · 3.2 mi · 99% reliable · Eaglesoft ✓ · 5 yrs', applied: 'Applied Mar 14, 2026', quote: '"I\'m excited about joining a practice focused on patient care."', bg: '#d7ccc8', img: 'https://randomuser.me/api/portraits/women/55.jpg' },
    { key: '3-james', name: 'James T.', rating: '⭐ 4.8', reviews: 55, meta: '$75,000/yr · 5.8 mi · 91% reliable · Eaglesoft ✓ · 7 yrs', applied: 'Applied Mar 13, 2026', quote: '"Looking for a long-term opportunity where I can grow with the team."', bg: '#c5cae9', img: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { key: '3-emily', name: 'Emily S.', rating: '⭐ 5', reviews: 82, meta: '$78,000/yr · 8.4 mi · 68% reliable · Eaglesoft ✓ · 4 yrs', applied: 'Applied Mar 15, 2026', quote: '"I bring 4 years of experience in fast-paced practices."', bg: '#f8bbd9', img: 'https://randomuser.me/api/portraits/women/33.jpg' },
  ]

  const renderApplicant = (ap, type = 'temp') => {
    const isAccepted = ap.preAccepted || accepted[ap.key]
    const isDeclined = declined[ap.key]
    const isShortlisted = shortlisted[ap.key]
    return (
      <div key={ap.key} className="flex items-start gap-4 px-6 py-4 border-b border-[#e5e7eb] last:border-0">
        <img src={ap.img} onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full object-cover flex-shrink-0 cursor-pointer" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-bold text-[#1a1a1a]">{ap.name}</span>
            <span className="text-xs text-[#f59e0b]">{ap.rating}</span>
            <span className="text-xs text-[#6b7280]">({ap.reviews})</span>
          </div>
          <p className="text-xs text-[#6b7280] mb-0.5">{ap.meta}</p>
          <p className="text-xs text-[#9ca3af] mb-1">{ap.applied}</p>
          {ap.quote && <p className="text-xs text-[#6b7280] italic">{ap.quote}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isDeclined ? (
            <span className="text-xs font-bold text-red-400 bg-red-50 px-3 py-1.5 rounded-full">Declined</span>
          ) : isAccepted ? (
            <>
              <span className="flex items-center gap-1 text-xs font-bold text-[#1a7f5e] bg-[#e8f5f0] px-3 py-1.5 rounded-full">
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5l3.5 3.5L11 1" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Accepted
              </span>
              <button onClick={() => navigate('/profile')} className="border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold px-3 py-1.5 rounded-full hover:border-[#1a7f5e] transition">View profile</button>
            </>
          ) : type === 'perm' ? (
            <>
              <button onClick={() => handleShortlist(ap.key, ap.name)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${isShortlisted ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}>{isShortlisted ? '✓ Shortlisted' : 'Shortlist'}</button>
              <button onClick={() => handleDecline(ap.key, ap.name)} className="border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold px-3 py-1.5 rounded-full hover:border-red-400 hover:text-red-400 transition">Decline</button>
              <button onClick={() => navigate('/profile')} className="border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold px-3 py-1.5 rounded-full hover:border-[#1a7f5e] transition">Profile</button>
            </>
          ) : (
            <>
              <button onClick={() => handleAccept(ap.key, ap.name)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white text-xs font-bold px-3 py-1.5 rounded-full transition">Accept</button>
              <button onClick={() => handleDecline(ap.key, ap.name)} className="border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold px-3 py-1.5 rounded-full hover:border-red-400 hover:text-red-400 transition">Decline</button>
              <button onClick={() => navigate('/profile')} className="border border-[#e5e7eb] text-[#6b7280] text-xs font-semibold px-3 py-1.5 rounded-full hover:border-[#1a7f5e] transition">Profile</button>
            </>
          )}
        </div>
      </div>
    )
  }

  const renderGroup = (groupId, label, badge, meta, stats, applicants, type, tabOptions) => {
    const filtered = filterApplicants(applicants, groupId)
    return (
      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden mb-4">
        <div onClick={() => toggleGroup(groupId)} className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-[#f9f8f6] transition">
          <div className="flex items-center gap-3">
            <span className="bg-[#e8f5f0] text-[#1a7f5e] text-xs font-bold px-2.5 py-1 rounded-full">{badge}</span>
            <div>
              <p className="text-sm font-extrabold text-[#1a1a1a]">{label}</p>
              <div className="flex items-center gap-2 text-[13px] text-[#6b7280] mt-0.5">{meta}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              {stats.map((s, i) => (
                <div key={i} className="text-center">
                  <div className={`text-base font-extrabold ${s.color || 'text-[#1a1a1a]'}`}>{s.val}</div>
                  <div className="text-xs text-[#9ca3af]">{s.label}</div>
                </div>
              ))}
            </div>
            <span className="text-[#9ca3af]">{openGroups[groupId] ? '∧' : '∨'}</span>
          </div>
        </div>
        {openGroups[groupId] && (
          <div className="border-t border-[#e5e7eb]">
            <div className="flex gap-4 px-6 py-3 border-b border-[#e5e7eb]">
              {tabOptions.map(t => (
                <button key={t} onClick={() => setSubTabs(prev => ({ ...prev, [groupId]: t }))} className={`text-sm font-semibold pb-1 border-b-2 transition ${subTabs[groupId] === t ? 'border-[#1a7f5e] text-[#1a7f5e]' : 'border-transparent text-[#9ca3af] hover:text-[#1a1a1a]'}`}>{t}</button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <EmptyState
                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                title="No applicants in this category"
                sub="Try selecting a different filter tab above."
                action={null}
              />
            ) : (
              filtered.map(ap => renderApplicant(ap, type))
            )}
          </div>
        )}
      </div>
    )
  }

  const hasAnyApplicants = (activeTopTab === 'all' || activeTopTab === 'temp' || activeTopTab === 'perm')
  const tempGroups = activeTopTab === 'all' || activeTopTab === 'temp'
  const permGroups = activeTopTab === 'all' || activeTopTab === 'perm'
  const totalVisible = (tempGroups ? group1.length + group2.length : 0) + (permGroups ? group3.length : 0)

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />
      <div className="max-w-[720px] mx-auto px-6 py-8">
        <h1 className="text-[28px] font-extrabold text-[#1a1a1a] mb-1">Applicants</h1>
        <p className="text-[15px] text-[#6b7280] mb-6">Review professionals who have applied to your shifts and job postings.</p>

        <div className="flex gap-0 border-b border-[#e5e7eb] mb-6">
          {[
            { id: 'all', label: 'All', count: 9 },
            { id: 'temp', label: 'Temp shifts', count: 6, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { id: 'perm', label: 'Permanent jobs', count: 3, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2"/></svg> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTopTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 text-[15px] font-medium border-b-2 -mb-px transition ${activeTopTab === tab.id ? 'border-[#1a7f5e] text-[#1a7f5e] font-semibold' : 'border-transparent text-[#9ca3af] hover:text-[#1a1a1a]'}`}>
              {tab.icon}
              {tab.label} <span className="text-[13px] bg-[#f3f4f6] text-[#6b7280] px-1.5 py-0.5 rounded-full font-semibold">{tab.count}</span>
            </button>
          ))}
        </div>

        {totalVisible === 0 ? (
          <div className="bg-white border border-[#e5e7eb] rounded-2xl">
            <EmptyState
              icon={<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              title="No applicants yet"
              sub="Once professionals apply to your shifts or job postings they'll appear here."
              action={
                <div className="flex gap-3 justify-center">
                  <button onClick={() => navigate('/post-shift')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition flex items-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Post a shift
                  </button>
                  <button onClick={() => navigate('/professionals')} className="border-[1.5px] border-[#1a7f5e] text-[#1a7f5e] font-bold px-6 py-2.5 rounded-full text-sm hover:bg-[#e8f5f0] transition">Browse professionals</button>
                </div>
              }
            />
          </div>
        ) : (
          <>
            {tempGroups && renderGroup(1, 'Dental Hygienist — Tue Mar 17', 'Temp shift',
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>7:30 AM – 5:00 PM · $54–$58/hr</>,
              [{val:3,label:'Pending',color:'text-[#f59e0b]'},{val:1,label:'Accepted',color:'text-[#1a7f5e]'},{val:4,label:'Total'}],
              group1,'temp',['All','Pending','Accepted','Declined'])}
            {tempGroups && renderGroup(2, 'Dental Assistant — Fri Mar 21', 'Temp shift',
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>7:30 AM – 12:00 PM · $40–$44/hr</>,
              [{val:2,label:'Pending',color:'text-[#f59e0b]'},{val:0,label:'Accepted'},{val:2,label:'Total'}],
              group2,'temp',['All','Pending','Accepted','Declined'])}
            {permGroups && renderGroup(3, 'Full-Time Dental Hygienist', 'Permanent',
              <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M8 7V5a2 2 0 0 0-4 0v2"/></svg>Full-time · Mon–Fri · $70,000–$85,000/yr</>,
              [{val:3,label:'Reviewing',color:'text-[#f59e0b]'},{val:0,label:'Shortlisted'},{val:3,label:'Total'}],
              group3,'perm',['All','Reviewing','Shortlisted','Declined'])}
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}
    </div>
  )
}
