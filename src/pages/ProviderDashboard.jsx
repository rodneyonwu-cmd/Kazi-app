import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';
import TempShiftCard from '../components/TempShiftCard';
import ShiftDetailModal from '../components/ShiftDetailModal';
import BookedShiftModal from './BookedShiftModal';

/**
 * ProviderDashboard
 * -----------------
 * Content-only dashboard. The parent layout shell renders:
 *   - Kazi topbar (logo + notifications + avatar)
 *   - Bottom navigation (Home / Find Shifts / Requests / Messages / Profile)
 *
 * Data: mocked inline for now. Wire to API later (see TODO comments).
 * Design tokens follow Kazi's locked system:
 *   - Primary green #1a7f5e · background #f9f8f6 · coral #e8734a · gold #f4b740
 *   - Sage gradient avatars (#a8c9b8 → #7ab8a8)
 *   - DM Sans body · Outfit headings · 16px card radius · 100px pill buttons
 */

// ── Mock data (replace with API response later) ──────────────
const mockProvider = {
  firstName: 'Rodney',
  date: 'Tuesday, April 9',
  location: 'Houston, TX',
  stats: {
    rating: 4.9,
    reliability: 98,
    profileScore: 650,
    shiftsCompleted: 42,
  },
  todayShift: null, // null = empty state. Populate this object when provider is booked today.
  week: [
    { dow: 'Tue', date: 9, status: 'today' },
    { dow: 'Wed', date: 10, status: 'booked' },
    { dow: 'Thu', date: 11, status: 'open' },
    { dow: 'Fri', date: 12, status: 'off' },
    { dow: 'Sat', date: 13, status: 'open' },
    { dow: 'Sun', date: 14, status: 'booked' },
    { dow: 'Mon', date: 15, status: 'booked' },
  ],
  nearbyShifts: [
    {
      id: 'shift_1',
      initials: 'SLD',
      name: 'Sugar Land Dental',
      role: 'Hygienist',
      distance: '4.2 mi · Sugar Land',
      rating: '4.8',
      reviewCount: 87,
      applied: 4,
      when: 'Thu, Apr 11 · 8:00 AM – 5:00 PM',
      lunch: '30 min lunch',
      software: 'Eaglesoft',
      pay: 42,
    },
    {
      id: 'shift_2',
      initials: 'BFD',
      name: 'Bellaire Family Dental',
      role: 'Hygienist',
      distance: '6.8 mi · Bellaire',
      rating: '4.7',
      reviewCount: 64,
      applied: 6,
      when: 'Sat, Apr 13 · 9:00 AM – 3:00 PM',
      lunch: '45 min lunch',
      software: 'Dentrix',
      pay: 45,
    },
    {
      id: 'shift_3',
      initials: 'PDC',
      name: 'Pearland Dental Care',
      role: 'Hygienist',
      distance: '9.1 mi · Pearland',
      rating: '4.9',
      reviewCount: 142,
      applied: 8,
      when: 'Mon, Apr 15 · 7:00 AM – 4:00 PM',
      lunch: '30 min lunch',
      software: 'Open Dental',
      pay: 40,
    },
  ],
};

// Mock booked shifts keyed by day-of-month for April 2026.
// Tapping a day with status='booked' opens BookedShiftModal populated from here.
const BOOKED_SHIFTS = {
  10: {
    officeName: 'Missouri City Dental',
    officeInitials: 'MCD',
    officeRating: '4.9',
    officeBookingCount: 12,
    priorBookings: 3,
    dateTime: 'Wednesday, April 10 · 8:00 AM – 5:00 PM',
    duration: '9 hours · 1 hour lunch break',
    role: 'Dental Hygienist (RDH)',
    roleSub: 'General dentistry · Adult prophy + perio',
    payTotal: 464,
    paySub: '$58/hr × 8 paid hours',
    address: '7890 Highway 6, Missouri City, TX',
    distance: '4.2 miles · ~14 min drive',
  },
  14: {
    officeName: 'Sugar Land Bright Dental',
    officeInitials: 'SBD',
    officeRating: '4.6',
    officeBookingCount: 8,
    priorBookings: 1,
    dateTime: 'Monday, April 14 · 9:00 AM – 4:00 PM',
    duration: '7 hours · 30 min lunch break',
    role: 'Dental Hygienist (RDH)',
    roleSub: 'Cosmetic + general · Hygiene focus',
    payTotal: 385,
    paySub: '$55/hr × 7 paid hours',
    address: '4500 Highway 6, Sugar Land, TX',
    distance: '7.8 miles · ~22 min drive',
  },
  15: {
    officeName: 'Sugar Land Bright Dental',
    officeInitials: 'SBD',
    officeRating: '4.6',
    officeBookingCount: 8,
    priorBookings: 1,
    dateTime: 'Tuesday, April 15 · 9:00 AM – 4:00 PM',
    duration: '7 hours · 30 min lunch break',
    role: 'Dental Hygienist (RDH)',
    roleSub: 'Cosmetic + general · Hygiene focus',
    payTotal: 385,
    paySub: '$55/hr × 7 paid hours',
    address: '4500 Highway 6, Sugar Land, TX',
    distance: '7.8 miles · ~22 min drive',
  },
  20: {
    officeName: 'Pearland Wellness Dental',
    officeInitials: 'PWD',
    officeRating: '4.7',
    officeBookingCount: 6,
    dateTime: 'Sunday, April 20 · 8:00 AM – 5:00 PM',
    duration: '9 hours · 1 hour lunch break',
    role: 'Dental Hygienist (RDH)',
    payTotal: 558,
    paySub: '$62/hr × 9 paid hours',
    address: '4500 Broadway St, Pearland, TX',
    distance: '3.1 miles · ~11 min drive',
  },
  23: {
    officeName: 'Houston Dental Care',
    officeInitials: 'HDC',
    officeRating: '4.8',
    officeBookingCount: 9,
    dateTime: 'Wednesday, April 23 · 9:00 AM – 3:00 PM',
    duration: '6 hours · 30 min lunch break',
    role: 'Dental Hygienist (RDH)',
    payTotal: 330,
    paySub: '$60/hr × 5.5 paid hours',
    address: '1234 Main St, Houston, TX',
    distance: '5.6 miles · ~18 min drive',
  },
  28: {
    officeName: 'Missouri City Dental',
    officeInitials: 'MCD',
    officeRating: '4.9',
    officeBookingCount: 12,
    priorBookings: 3,
    dateTime: 'Monday, April 28 · 8:00 AM – 5:00 PM',
    duration: '9 hours · 1 hour lunch break',
    role: 'Dental Hygienist (RDH)',
    payTotal: 464,
    paySub: '$58/hr × 8 paid hours',
    address: '7890 Highway 6, Missouri City, TX',
    distance: '4.2 miles · ~14 min drive',
  },
};

// April 2026 — starts on Wednesday
const MONTH_CELLS = [
  null, null, null, { d: 1 }, { d: 2 }, { d: 3, s: 'off' }, { d: 4, s: 'off' },
  { d: 5 }, { d: 6 }, { d: 7 }, { d: 8 }, { d: 9, s: 'today' }, { d: 10, s: 'booked' }, { d: 11, s: 'off' },
  { d: 12, s: 'off' }, { d: 13 }, { d: 14, s: 'booked' }, { d: 15, s: 'booked' }, { d: 16 }, { d: 17, s: 'off' }, { d: 18, s: 'off' },
  { d: 19 }, { d: 20, s: 'booked' }, { d: 21 }, { d: 22 }, { d: 23, s: 'booked' }, { d: 24, s: 'off' }, { d: 25, s: 'off' },
  { d: 26 }, { d: 27 }, { d: 28, s: 'booked' }, { d: 29 }, { d: 30 }, null, null,
];

// ── Helpers ──────────────────────────────────────────────────
const reliabilityClass = (score) => {
  if (score >= 95) return 'text-[#1a7f5e]';
  if (score >= 85) return 'text-[#c98b16]';
  return 'text-[#e8734a]';
};

// ── Component ────────────────────────────────────────────────
export default function ProviderDashboard() {
  const navigate = useNavigate();
  // TODO: replace mock with API call
  // const { data: provider, isLoading } = useProviderDashboard();
  const provider = mockProvider;

  const [scheduleView, setScheduleView] = useState('week');
  const [bookedShift, setBookedShift] = useState(null);
  const [selectedNearbyShift, setSelectedNearbyShift] = useState(null);

  const handleFindShifts = () => {
    navigate('/find-shifts');
  };

  const openBooked = (dayNum) => {
    const data = BOOKED_SHIFTS[dayNum];
    if (data) setBookedShift(data);
  };

  const openFindForDate = (dayNum) => {
    const d = String(dayNum).padStart(2, '0');
    navigate(`/provider-availability?date=2026-04-${d}`);
  };

  // Week-rail day tap: booked → modal, otherwise → availability
  const handleDayTap = (day) => {
    if (day.status === 'booked') {
      openBooked(day.date);
    } else {
      openFindForDate(day.date);
    }
  };

  return (
    <>
      <div
        style={{
          background: '#f9f8f6',
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100vh',
          boxShadow: '0 0 40px rgba(0,0,0,0.06)',
          position: 'relative',
          paddingBottom: 100,
        }}
      >
        <TopBar role="provider" />

        <div className="bg-[#f9f8f6] min-h-full pb-6">
          {/* Greeting */}
          <section className="px-5 pt-4 pb-6">
            <h1 className="font-[Outfit] font-bold text-[22px] leading-[1.15] tracking-[-0.02em] text-[#0f1a16] mb-1">
              Hello, {provider.firstName} 👋
            </h1>
            <div className="text-[14px] font-medium text-[#6b7875]">
              {provider.date} · {provider.location}
            </div>
          </section>

          {/* Stats strip */}
          <StatsStrip stats={provider.stats} />

          {/* Today card */}
          {provider.todayShift ? (
            <TodayShiftCard shift={provider.todayShift} />
          ) : (
            <TodayEmptyCard onFindShifts={handleFindShifts} />
          )}

          {/* Your week / month */}
          <YourWeekSection
            week={provider.week}
            view={scheduleView}
            onChangeView={setScheduleView}
            onDayTap={handleDayTap}
            onOpenBooked={openBooked}
            onOpenFind={openFindForDate}
          />

          {/* Shifts near you — horizontal carousel of large shift cards */}
          <ShiftsNearYouSection
            shifts={provider.nearbyShifts}
            onApply={(shift) => setSelectedNearbyShift(shift)}
            onSeeAll={handleFindShifts}
          />
        </div>

        <ProviderBottomNav />
      </div>

      <ShiftDetailModal
        open={!!selectedNearbyShift}
        shift={selectedNearbyShift}
        onClose={() => setSelectedNearbyShift(null)}
      />

      {bookedShift && (
        <BookedShiftModal
          shift={bookedShift}
          onClose={() => setBookedShift(null)}
          onCancelShift={() => setBookedShift(null)}
          onMessageOffice={() => { setBookedShift(null); navigate('/provider-messages'); }}
        />
      )}
    </>
  );
}

// ── Stats strip ──────────────────────────────────────────────
function StatsStrip({ stats }) {
  return (
    <div className="mx-4 mb-[14px] bg-white border border-[#e8e6e1] rounded-[18px] py-4 px-1 flex items-stretch">
      {/* Rating */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-[6px] cursor-pointer">
        <div className="font-[Outfit] font-bold text-[18px] leading-none tracking-[-0.02em] text-[#0f1a16] inline-flex items-center gap-[3px]">
          <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="#f4b740">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {stats.rating.toFixed(1)}
        </div>
        <div className="text-[11px] font-medium text-[#6b7875] leading-none">Rating</div>
      </div>

      <div className="w-px bg-[#efede8] my-1" />

      {/* Reliability */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-[6px] cursor-pointer">
        <div className={`font-[Outfit] font-bold text-[18px] leading-none tracking-[-0.02em] ${reliabilityClass(stats.reliability)}`}>
          {stats.reliability}%
        </div>
        <div className="text-[11px] font-medium text-[#6b7875] leading-none">Reliability</div>
      </div>

      <div className="w-px bg-[#efede8] my-1" />

      {/* Profile score */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-[6px] cursor-pointer">
        <div className="font-[Outfit] font-bold text-[18px] leading-none tracking-[-0.02em] text-[#0f1a16]">
          {stats.profileScore}
        </div>
        <div className="text-[11px] font-medium text-[#6b7875] leading-none">Profile</div>
      </div>

      <div className="w-px bg-[#efede8] my-1" />

      {/* Shifts */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-[6px] cursor-pointer">
        <div className="font-[Outfit] font-bold text-[18px] leading-none tracking-[-0.02em] text-[#0f1a16]">
          {stats.shiftsCompleted}
        </div>
        <div className="text-[11px] font-medium text-[#6b7875] leading-none">Shifts</div>
      </div>
    </div>
  );
}

// ── Today card (empty state — no shift booked) ───────────────
function TodayEmptyCard({ onFindShifts }) {
  return (
    <div className="mx-4 bg-[#e8f2ed] border border-[#d4e7dd] rounded-[20px] p-[18px] relative overflow-hidden">
      <div className="flex items-center justify-between mb-[14px]">
        <span className="inline-flex items-center gap-[6px] text-[11.5px] font-bold tracking-[0.06em] uppercase text-[#6b7875]">
          <span className="w-[6px] h-[6px] rounded-full bg-[#9aa5a1]" />
          Today
        </span>
      </div>

      <div className="flex gap-[14px] items-center">
        <div className="w-14 h-14 rounded-[16px] bg-white border border-[#d4e7dd] grid place-items-center flex-shrink-0">
          <svg className="w-6 h-6 stroke-[#1a7f5e]" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-[Outfit] font-bold text-[17px] tracking-[-0.01em] text-[#0f1a16] mb-[3px]">
            No shift today
          </div>
          <div className="text-[13px] font-medium text-[#6b7875] leading-[1.35]">
            Browse open shifts from Houston offices.
          </div>
        </div>
      </div>

      <div className="h-px bg-[#efede8] my-[14px]" />

      <button
        onClick={onFindShifts}
        className="w-full px-[14px] py-[11px] rounded-full font-[DM_Sans] font-semibold text-[13.5px] bg-[#1a7f5e] text-white inline-flex items-center justify-center gap-[6px]"
      >
        <svg className="w-[14px] h-[14px] stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Find Shifts
      </button>
    </div>
  );
}

// ── Today card (populated — provider has a shift today) ──────
function TodayShiftCard({ shift }) {
  return (
    <div className="mx-4 bg-white border border-[#e8e6e1] rounded-[20px] p-[18px] relative overflow-hidden">
      {/* Left accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-[#1a7f5e]" />

      <div className="flex items-center justify-between mb-[14px]">
        <span className="inline-flex items-center gap-[6px] text-[11.5px] font-bold tracking-[0.06em] uppercase text-[#1a7f5e]">
          <span className="w-[6px] h-[6px] rounded-full bg-[#1a7f5e]" />
          Today's shift
        </span>
      </div>

      <div className="flex gap-[14px] items-center">
        <div className="w-14 h-14 rounded-[16px] text-white font-[Outfit] font-bold text-[15px] grid place-items-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a8c9b8, #7ab8a8)' }}
        >
          {shift.officeInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-[Outfit] font-bold text-[17px] tracking-[-0.01em] text-[#0f1a16] mb-[3px]">
            {shift.officeName}
          </div>
          <div className="text-[13.5px] font-medium text-[#6b7875]">
            {shift.startTime} – {shift.endTime} · {shift.distanceMiles} mi
          </div>
        </div>
      </div>

      <div className="h-px bg-[#efede8] my-[14px]" />

      <button className="w-full px-[14px] py-[11px] rounded-full font-[DM_Sans] font-semibold text-[13.5px] bg-white text-[#1a7f5e] border border-[#d4e7dd] inline-flex items-center justify-center gap-[6px]">
        <svg className="w-[14px] h-[14px] stroke-[#1a7f5e]" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Directions
      </button>
    </div>
  );
}

// ── Your week / month ────────────────────────────────────────
function YourWeekSection({ week, view, onChangeView, onDayTap, onOpenBooked, onOpenFind }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[18px] tracking-[-0.01em] text-[#0f1a16] m-0">
          Your week
        </h3>
        <div className="inline-flex bg-white border border-[#e8e6e1] rounded-full p-[3px] gap-[2px]">
          <button
            onClick={() => onChangeView('week')}
            className={`border-none font-[DM_Sans] text-[12.5px] font-semibold px-[14px] py-[6px] rounded-full ${
              view === 'week' ? 'bg-[#1a7f5e] text-white' : 'bg-transparent text-[#6b7875]'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onChangeView('month')}
            className={`border-none font-[DM_Sans] text-[12.5px] font-semibold px-[14px] py-[6px] rounded-full ${
              view === 'month' ? 'bg-[#1a7f5e] text-white' : 'bg-transparent text-[#6b7875]'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {view === 'week' ? (
        <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
          {week.map((day) => (
            <DayCard key={day.date} day={day} onTap={() => onDayTap(day)} />
          ))}
        </div>
      ) : (
        <MonthGrid onOpenBooked={onOpenBooked} onOpenFind={onOpenFind} />
      )}
    </>
  );
}

function DayCard({ day, onTap }) {
  const baseClasses = 'flex-shrink-0 w-[76px] h-[110px] rounded-[16px] p-[10px_8px_10px] flex flex-col items-center justify-center text-center cursor-pointer border';

  let classes = baseClasses;
  let dowColor = 'text-[#9aa5a1]';
  let numColor = 'text-[#0f1a16]';
  let statusColor = 'text-[#9aa5a1]';
  let statusText = 'Open';

  if (day.status === 'today') {
    classes += ' bg-[#1a7f5e] border-[#1a7f5e]';
    dowColor = 'text-white/80';
    numColor = 'text-white';
    statusColor = 'text-white/90';
    statusText = 'Today';
  } else if (day.status === 'booked') {
    classes += ' bg-[#f5faf7] border-[#dcebe3]';
    dowColor = 'text-[#146449]';
    numColor = 'text-[#146449]';
    statusColor = 'text-[#1a7f5e]';
    statusText = 'Booked';
  } else if (day.status === 'off') {
    classes += ' bg-white border-[#e8e6e1]';
    statusText = 'Off';
  } else {
    classes += ' bg-white border-[#e8e6e1]';
    statusText = 'Open';
  }

  return (
    <div className={classes} onClick={onTap}>
      <div className={`text-[10.5px] font-bold uppercase tracking-[0.06em] ${dowColor} mb-1`}>
        {day.dow}
      </div>
      <div className={`font-[Outfit] font-bold text-[22px] leading-none tracking-[-0.02em] ${numColor} mb-2`}>
        {day.date}
      </div>
      <div className={`text-[10.5px] font-semibold uppercase tracking-[0.04em] ${statusColor}`}>
        {statusText}
      </div>
    </div>
  );
}

// ── Month grid ───────────────────────────────────────────────
function MonthGrid({ onOpenBooked, onOpenFind }) {
  return (
    <div className="mx-4 bg-white border border-[#e8e6e1] rounded-[20px] px-4 pt-[18px] pb-[14px]">
      <div className="flex items-center justify-between mb-[14px] px-1">
        <NavBtn dir="left" />
        <div className="font-[Outfit] font-bold text-[15px] text-[#0f1a16]">April 2026</div>
        <NavBtn dir="right" />
      </div>

      <div className="grid grid-cols-7 gap-[5px]">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold uppercase text-[#9aa5a1] tracking-[0.05em] pt-1 pb-[6px]"
          >
            {d}
          </div>
        ))}
        {MONTH_CELLS.map((cell, i) => (
          <MonthCell
            key={i}
            cell={cell}
            onOpenBooked={cell?.s === 'booked' ? () => onOpenBooked(cell.d) : undefined}
            onOpenFind={cell && (!cell.s || cell.s === 'today') ? () => onOpenFind(cell.d) : undefined}
          />
        ))}
      </div>

      <div className="flex gap-[14px] justify-center pt-[14px] mt-3 border-t border-[#efede8]">
        <Legend swatch="bg-[#1a7f5e]" label="Today" />
        <Legend swatch="bg-[#f5faf7] border border-[#dcebe3]" label="Booked" />
        <Legend swatch="bg-white border border-[#e8e6e1]" label="Off" />
      </div>
    </div>
  );
}

function NavBtn({ dir }) {
  return (
    <button
      type="button"
      className="w-[30px] h-[30px] rounded-full bg-[#f9f8f6] border border-[#e8e6e1] inline-flex items-center justify-center"
    >
      <svg className="w-3 h-3 stroke-[#0f1a16]" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

function MonthCell({ cell, onOpenBooked, onOpenFind }) {
  if (!cell) return <div className="aspect-square" />;

  const isToday = cell.s === 'today';
  const isBooked = cell.s === 'booked';
  const isOff = cell.s === 'off';
  const isOpen = !cell.s;

  let classes = 'aspect-square flex items-center justify-center font-[Outfit] rounded-[10px] relative';
  let onClick;

  if (isToday) {
    classes += ' bg-[#1a7f5e] text-white font-bold text-[13px] cursor-pointer';
    onClick = onOpenFind;
  } else if (isBooked) {
    classes += ' bg-[#f5faf7] text-[#146449] font-bold text-[13px] border border-[#dcebe3] cursor-pointer';
    onClick = onOpenBooked;
  } else if (isOff) {
    classes += ' text-[#9aa5a1] text-[13px] font-semibold opacity-55 line-through';
  } else if (isOpen) {
    classes += ' text-[#0f1a16] text-[13px] font-semibold cursor-pointer';
    onClick = onOpenFind;
  }

  return (
    <div className={classes} onClick={onClick}>
      {cell.d}
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <div className="flex items-center gap-[5px] text-[10px] text-[#6b7875] font-semibold">
      <span className={`w-[10px] h-[10px] rounded-[3px] ${swatch}`} />
      {label}
    </div>
  );
}

// ── Shifts near you ──────────────────────────────────────────
// Horizontal carousel of the same large card used on /find-shifts.
// Each card is fixed-width and wrapped in a flex-shrink:0 box so
// the row scrolls horizontally and snaps to card edges.
function ShiftsNearYouSection({ shifts, onApply, onSeeAll }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[18px] tracking-[-0.01em] text-[#0f1a16] m-0">
          Shifts near you
        </h3>
        <button onClick={onSeeAll} className="text-[13px] font-semibold text-[#1a7f5e] bg-transparent border-none cursor-pointer">
          See all
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          padding: '4px 16px 8px',
          scrollSnapType: 'x mandatory',
          scrollPaddingLeft: 16,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {shifts.map((shift) => (
          <div
            key={shift.id}
            style={{
              flex: '0 0 auto',
              width: 320,
              maxWidth: '85vw',
              scrollSnapAlign: 'start',
              display: 'flex',
            }}
          >
            <TempShiftCard
              shift={shift}
              onApply={() => onApply(shift)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
