import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f9f8f6]">

      {/* Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] h-16 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-[#1a7f5e] font-bold text-2xl">kazi.</span>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-sm font-semibold text-[#1a7f5e] cursor-pointer">Dashboard</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Applicants</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Professionals</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Bookings</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Messages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#1a7f5e] text-white text-sm font-bold flex items-center justify-center cursor-pointer">
              BS
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-[900px] mx-auto px-12 py-10">

        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-[22px] font-extrabold text-[#1a1a1a]">Good morning, Dr. Martinez 👋</h1>
          <p className="text-sm text-[#6b7280] mt-1">Monday, March 16, 2026 · Bright Smile Dental · Houston, TX</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mb-10 flex-wrap">
          <button className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-5 py-2.5 rounded-full text-sm transition flex items-center gap-2">
            + Post a shift
          </button>
          <button className="bg-white border border-[#e5e7eb] text-[#1a1a1a] font-semibold px-5 py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">
            Find professionals
          </button>
          <button className="bg-white border border-[#e5e7eb] text-[#1a1a1a] font-semibold px-5 py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">
            Messages
          </button>
        </div>

        {/* Upcoming Shifts */}
        <div className="mb-10">
          <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Upcoming shifts</h2>
          <div className="grid grid-cols-4 gap-4">

            {[
              { date: 'Mon Mar 17', role: 'Dental Hygienist', time: '8:00am – 5:00pm', name: 'Sarah R.', status: 'Confirmed', color: 'bg-[#e8f5f0] text-[#1a7f5e]' },
              { date: 'Wed Mar 19', role: 'Dental Assistant', time: '9:00am – 3:00pm', name: 'Marcus J.', status: 'Confirmed', color: 'bg-[#e8f5f0] text-[#1a7f5e]' },
              { date: 'Thu Mar 20', role: 'Front Desk', time: '8:00am – 5:00pm', name: 'Aisha L.', status: 'Pending', color: 'bg-[#fef3c7] text-[#92400e]' },
              { date: 'Fri Mar 21', role: 'Dental Hygienist', time: '8:00am – 2:00pm', name: 'Tara C.', status: 'Confirmed', color: 'bg-[#e8f5f0] text-[#1a7f5e]' },
            ].map((shift, i) => (
              <div key={i} className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
                <p className="text-xs text-[#6b7280] mb-1">{shift.date}</p>
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">{shift.role}</p>
                <p className="text-xs text-[#6b7280] mb-3">{shift.time}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#c8e6c9]"></div>
                    <span className="text-xs font-semibold">{shift.name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${shift.color}`}>{shift.status}</span>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* Featured Professionals */}
        <div>
          <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Featured professionals</h2>
          <div className="grid grid-cols-3 gap-4">

            {[
              { name: 'Sarah R.', role: 'Dental Hygienist', rate: '$52/hr', miles: '8.2 miles away', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
              { name: 'Marcus J.', role: 'Dental Assistant', rate: '$48/hr', miles: '5.7 miles away', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
              { name: 'Aisha L.', role: 'Front Desk', rate: '$38/hr', miles: '13.1 miles away', img: 'https://randomuser.me/api/portraits/women/65.jpg' },
            ].map((pro, i) => (
              <div key={i} className="bg-white border border-[#e5e7eb] rounded-2xl p-4 cursor-pointer hover:border-[#1a7f5e] transition">
                <div className="flex items-center gap-3 mb-3">
                  <img src={pro.img} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">{pro.name}</p>
                    <p className="text-xs text-[#6b7280]">{pro.role}</p>
                    <p className="text-xs text-[#F97316]">★★★★★</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a]">{pro.rate}</p>
                    <p className="text-xs text-[#6b7280]">{pro.miles}</p>
                  </div>
                  <button className="bg-[#1a7f5e] hover:bg-[#156649] text-white text-xs font-bold px-4 py-2 rounded-full transition">
                    Book
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  )
}