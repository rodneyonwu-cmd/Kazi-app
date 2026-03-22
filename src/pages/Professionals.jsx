import { useNavigate } from 'react-router-dom'

export default function Professionals() {
  const navigate = useNavigate()

  const professionals = [
    { name: 'Sarah R.', role: 'Dental Hygienist', rate: '$52', miles: '8.2 miles · Houston', reliability: '97% reliable', reliabilityColor: '#1a7f5e', stars: 63, img: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Marcus J.', role: 'Dental Assistant', rate: '$48', miles: '5.7 miles · Houston', reliability: '73% reliable', reliabilityColor: '#f59e0b', stars: 41, img: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Aisha L.', role: 'Dental Hygienist', rate: '$58', miles: '13.1 miles · Houston', reliability: '94% reliable', reliabilityColor: '#1a7f5e', stars: 29, img: 'https://randomuser.me/api/portraits/women/65.jpg' },
    { name: 'Tara C.', role: 'Front Desk', rate: '$35', miles: '3.4 miles · Houston', reliability: '98% reliable', reliabilityColor: '#1a7f5e', stars: 55, img: 'https://randomuser.me/api/portraits/women/17.jpg' },
    { name: 'Nina P.', role: 'Dental Hygienist', rate: '$54', miles: '5.2 miles · Houston', reliability: '86% reliable', reliabilityColor: '#f59e0b', stars: 52, img: 'https://randomuser.me/api/portraits/women/28.jpg' },
    { name: 'Devon K.', role: 'Dental Assistant', rate: '$40', miles: '7.1 miles · Houston', reliability: '84% reliable', reliabilityColor: '#f59e0b', stars: 28, img: 'https://randomuser.me/api/portraits/men/41.jpg' },
    { name: 'Rachel M.', role: 'Dental Hygienist', rate: '$72', miles: '3.2 miles · Houston', reliability: '99% reliable', reliabilityColor: '#1a7f5e', stars: 71, img: 'https://randomuser.me/api/portraits/women/55.jpg' },
    { name: 'James T.', role: 'Dentist', rate: '$75', miles: '5.8 miles · Houston', reliability: '91% reliable', reliabilityColor: '#1a7f5e', stars: 55, img: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { name: 'Emily S.', role: 'Treatment Coordinator', rate: '$78', miles: '8.4 miles · Houston', reliability: '68% reliable', reliabilityColor: '#ef4444', stars: 82, img: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { name: 'Lisa M.', role: 'Dental Hygienist', rate: '$62', miles: '6.3 miles · Houston', reliability: '93% reliable', reliabilityColor: '#1a7f5e', stars: 39, img: 'https://randomuser.me/api/portraits/women/48.jpg' },
  ]

  return (
    <div className="min-h-screen bg-[#f9f8f6]">

      <nav className="bg-white border-b border-[#e5e7eb] h-16 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-[#1a7f5e] font-bold text-2xl cursor-pointer" onClick={() => navigate('/dashboard')}>kazi.</span>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Applicants</span>
            <span className="text-sm font-semibold text-[#1a7f5e] cursor-pointer">Professionals</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Bookings</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Messages</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1a7f5e] text-white text-sm font-bold flex items-center justify-center cursor-pointer">BS</div>
        </div>
      </nav>

      <div className="bg-white border-b border-[#e5e7eb] px-6 py-4 sticky top-16 z-40">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">Find Professionals</h1>
          <div className="flex items-center gap-3">
            <button className="bg-[#1a7f5e] text-white px-4 py-2 rounded-full text-sm font-semibold">All (48)</button>
            <button className="border border-[#e5e7eb] px-4 py-2 rounded-full text-sm font-semibold text-[#6b7280] hover:border-[#1a7f5e] transition">Available: Select a date</button>
            <span className="text-sm text-[#6b7280] cursor-pointer">Sort by: <strong className="text-[#1a1a1a]">Best match</strong> ▾</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto flex">

        <div className="w-60 flex-shrink-0 border-r border-[#e5e7eb] bg-white p-6 min-h-screen">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-[#1a1a1a]">Filters</h2>
            <span className="text-sm text-[#1a7f5e] font-semibold cursor-pointer">Clear all</span>
          </div>
          <div className="h-1 bg-[#1a7f5e] rounded mb-5"></div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Role type</p>
            <select className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a7f5e]">
              <option>All roles</option>
              <option>Dental Hygienist</option>
              <option>Dental Assistant</option>
              <option>Front Desk / Admin</option>
              <option>Treatment Coordinator</option>
              <option>Dentist / Associate</option>
            </select>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Max distance</p>
            <select className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#1a7f5e]">
              <option>Within 5 mi</option>
              <option>Within 10 mi</option>
              <option>Within 15 mi</option>
              <option>Within 25 mi</option>
              <option>Any distance</option>
            </select>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Experience</p>
            <div className="flex flex-wrap gap-2">
              {['Any', '1+ yrs', '3+ yrs', '5+ yrs'].map(e => (
                <button key={e} className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${e === 'Any' ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Minimum rating</p>
            <div className="flex flex-wrap gap-2">
              {['Any', '4.0+', '4.5+', '4.8+'].map(r => (
                <button key={r} className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${r === 'Any' ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e]'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Max hourly rate</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">$</span>
              <input type="text" placeholder="Any" className="w-full border border-[#e5e7eb] rounded-xl pl-7 pr-3 py-2 text-sm outline-none focus:border-[#1a7f5e]" />
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Practice software</p>
            <div className="flex flex-wrap gap-2">
              {['Eaglesoft', 'Dentrix', 'Open Dental', 'Curve Dental'].map(s => (
                <button key={s} className="px-3 py-1 rounded-full text-xs font-semibold border border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e] transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 grid grid-cols-2 gap-4 content-start">
          {professionals.map((pro, i) => (
            <div key={i} onClick={() => navigate('/profile')} className="bg-white border border-[#e5e7eb] rounded-2xl p-4 cursor-pointer hover:border-[#1a7f5e] transition">
              <div className="flex gap-4">
                <img src={pro.img} className="w-[90px] h-[90px] rounded-full object-cover flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-lg font-extrabold text-[#1a1a1a]">{pro.name}</p>
                  <p className="text-xs text-[#6b7280] mb-1">{pro.role}</p>
                  <p className="text-xs text-[#F97316] mb-1">★★★★★ <span className="text-[#6b7280]">{pro.stars}</span></p>
                  <p className="text-lg font-extrabold text-[#1a1a1a]">{pro.rate}<span className="text-sm font-normal text-[#6b7280]"> /hr</span></p>
                  <p className="text-xs text-[#6b7280] mt-1">{pro.miles}</p>
                  <p className="text-sm font-semibold mt-1" style={{ color: pro.reliabilityColor }}>⊘ {pro.reliability}</p>
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={e => e.stopPropagation()} className="bg-[#1a7f5e] hover:bg-[#156649] text-white text-sm font-bold px-6 py-2 rounded-full transition">
                  Book
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}