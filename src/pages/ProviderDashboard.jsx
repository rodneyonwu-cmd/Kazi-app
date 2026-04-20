import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

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
  // todayShift example when booked:
  // {
  //   officeInitials: 'MCD',
  //   officeName: 'Missouri City Dental',
  //   startTime: '8:00 AM',
  //   endTime: '5:00 PM',
  //   distanceMiles: 2.3,
  // },
  week: [
    { dow: 'Tue', date: 9, status: 'today' },
    { dow: 'Wed', date: 10, status: 'booked' },
    { dow: 'Thu', date: 11, status: 'open' },
    { dow: 'Fri', date: 12, status: 'off' },
    { dow: 'Sat', date: 13, status: 'open' },
    { dow: 'Sun', date: 14, status: 'off' },
    { dow: 'Mon', date: 15, status: 'open' },
  ],
  nearbyShifts: [
    {
      id: 'shift_1',
      officeInitials: 'SD',
      officeName: 'Sugar Land Dental',
      date: 'Thu, Apr 11',
      timeRange: '8A–5P',
      role: 'RDH',
      distanceMiles: 4.2,
      ratePerHour: 42,
    },
    {
      id: 'shift_2',
      officeInitials: 'BF',
      officeName: 'Bellaire Family Dental',
      date: 'Sat, Apr 13',
      timeRange: '9A–3P',
      role: 'RDH',
      distanceMiles: 6.8,
      ratePerHour: 45,
    },
    {
      id: 'shift_3',
      officeInitials: 'PD',
      officeName: 'Pearland Dental Care',
      date: 'Mon, Apr 15',
      timeRange: '7A–4P',
      role: 'RDH',
      distanceMiles: 9.1,
      ratePerHour: 40,
    },
  ],
};

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

  const handleFindShifts = () => {
    navigate('/find-shifts');
  };

  const handleOpenShift = (shiftId) => {
    navigate(`/find-shifts/${shiftId}`);
  };

  const handleDayTap = (day) => {
    const d = String(day.date).padStart(2, '0');
    navigate(`/provider-availability?date=2026-04-${d}`);
  };

  return (
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
          <h1 className="font-[Outfit] font-bold text-[28px] leading-[1.15] tracking-[-0.02em] text-[#0f1a16] mb-1">
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

        {/* Your week */}
        <YourWeekSection week={provider.week} onDayTap={handleDayTap} />

        {/* Shifts near you */}
        <ShiftsNearYouSection
          shifts={provider.nearbyShifts}
          onShiftTap={handleOpenShift}
          onSeeAll={handleFindShifts}
        />
      </div>

      <ProviderBottomNav />
    </div>
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

// ── Your week (day rail) ─────────────────────────────────────
function YourWeekSection({ week, onDayTap }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[18px] tracking-[-0.01em] text-[#0f1a16] m-0">
          Your week
        </h3>
        <div className="inline-flex bg-white border border-[#e8e6e1] rounded-full p-[3px] gap-[2px]">
          <button className="border-none bg-[#1a7f5e] text-white font-[DM_Sans] text-[12.5px] font-semibold px-[14px] py-[6px] rounded-full">
            Week
          </button>
          <button className="border-none bg-transparent text-[#6b7875] font-[DM_Sans] text-[12.5px] font-semibold px-[14px] py-[6px] rounded-full">
            Month
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none">
        {week.map((day) => (
          <DayCard key={day.date} day={day} onTap={() => onDayTap(day)} />
        ))}
      </div>
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

// ── Shifts near you ──────────────────────────────────────────
function ShiftsNearYouSection({ shifts, onShiftTap, onSeeAll }) {
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

      <div className="px-4 flex flex-col gap-[10px]">
        {shifts.map((shift) => (
          <ShiftCard key={shift.id} shift={shift} onTap={() => onShiftTap(shift.id)} />
        ))}
      </div>
    </>
  );
}

function ShiftCard({ shift, onTap }) {
  return (
    <div
      onClick={onTap}
      className="bg-white border border-[#e8e6e1] rounded-[16px] p-[14px] flex items-center gap-3 cursor-pointer"
    >
      <div
        className="w-12 h-12 rounded-[14px] text-white font-[Outfit] font-bold text-[14px] grid place-items-center flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #a8c9b8, #7ab8a8)' }}
      >
        {shift.officeInitials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-[6px] mb-[2px]">
          <span className="text-[14.5px] font-semibold text-[#0f1a16] truncate">
            {shift.officeName}
          </span>
        </div>
        <div className="text-[12.5px] font-medium text-[#6b7875] mb-1">
          {shift.date} · {shift.timeRange} · {shift.role} · {shift.distanceMiles} mi
        </div>
        <div className="text-[12.5px] font-bold text-[#1a7f5e]">
          ${shift.ratePerHour}/hr
        </div>
      </div>

      <svg className="w-[18px] h-[18px] stroke-[#9aa5a1] flex-shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}
