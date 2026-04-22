import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import FindProsSheet from '../components/FindProsSheet';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * OfficeDashboard
 * ---------------
 * Content-only dashboard for the office (practice owner) side of Kazi.
 * The parent layout shell renders:
 *   - Kazi topbar (logo + notifications + avatar)
 *   - Bottom navigation (Home / Find / Bookings / Messages / Profile)
 *
 * Data: mocked inline for now. Wire to API later (see TODO comments).
 * Design tokens follow Kazi's locked system:
 *   - Primary green #1a7f5e · background #f9f8f6 · coral #e8734a · gold #f4b740
 *   - Sage gradient avatars (#a8c9b8 → #7ab8a8)
 *   - DM Sans body · Outfit headings · 16–20px card radius · 100px pill buttons
 */

// ── Mock data (replace with API response later) ──────────────
const mockOffice = {
  ownerFirstName: 'O',
  officeName: 'Missouri City Dental',
  date: 'Tuesday, April 7',
  todayStats: {
    activeToday: 2,
    pending: 3,
    unfilled: 1,
  },
  currentMonth: 'April 2026',
  // Calendar days for April 2026 (starts Wednesday)
  // status: 'empty' | 'normal' | 'today' | 'booked' | 'booked-open'
  calendarDays: [
    { empty: true }, { empty: true }, { empty: true },
    { date: 1, status: 'normal' },
    { date: 2, status: 'normal' },
    { date: 3, status: 'normal' },
    { date: 4, status: 'normal' },
    { date: 5, status: 'normal' },
    { date: 6, status: 'normal' },
    { date: 7, status: 'today' },
    { date: 8, status: 'booked' },
    { date: 9, status: 'booked' },
    { date: 10, status: 'booked-open' },
    { date: 11, status: 'normal' },
    { date: 12, status: 'normal' },
    { date: 13, status: 'booked' },
    { date: 14, status: 'booked' },
    { date: 15, status: 'normal' },
    { date: 16, status: 'booked' },
    { date: 17, status: 'normal' },
    { date: 18, status: 'normal' },
    { date: 19, status: 'normal' },
    { date: 20, status: 'booked' },
    { date: 21, status: 'normal' },
    { date: 22, status: 'booked' },
    { date: 23, status: 'booked' },
    { date: 24, status: 'booked' },
    { date: 25, status: 'normal' },
    { date: 26, status: 'normal' },
    { date: 27, status: 'booked' },
    { date: 28, status: 'booked' },
    { date: 29, status: 'normal' },
    { date: 30, status: 'booked' },
    { empty: true }, { empty: true },
  ],
  onsiteNow: [
    {
      id: 'onsite_1',
      initials: 'SK',
      name: 'Sarah K.',
      firstName: 'Sarah',
      lastName: 'K.',
      avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
      role: 'RDH',
      timeRange: '8am–5pm',
      checkedInAt: '7:52 AM',
    },
  ],
};

// ── Component ────────────────────────────────────────────────
export default function OfficeDashboard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  // TODO: replace mock with API call
  // const { data: office, isLoading } = useOfficeDashboard();
  const office = mockOffice;

  const [calendarView, setCalendarView] = useState('month'); // 'week' | 'month'
  const [chooserOpen, setChooserOpen] = useState(false);
  const [findProsOpen, setFindProsOpen] = useState(false);
  // Map of mock on-site id → real Prisma provider id, resolved once on mount.
  const [onsiteRealIds, setOnsiteRealIds] = useState({});

  // Resolve the mock on-site providers' real IDs so tapping them routes to
  // their actual ProfessionalProfile page (which serves the same avatarUrl
  // from the seeded DB — keeping the photo consistent across surfaces).
  useEffect(() => {
    let cancelled = false;
    const resolveIds = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/api/providers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const list = await res.json();
        const lookup = {};
        for (const onsite of office.onsiteNow) {
          const match = list.find(
            (p) =>
              p?.user?.firstName === onsite.firstName &&
              p?.user?.lastName === onsite.lastName,
          );
          if (match) lookup[onsite.id] = match.id;
        }
        if (!cancelled) setOnsiteRealIds(lookup);
      } catch {}
    };
    resolveIds();
    return () => { cancelled = true; };
  }, [getToken, office.onsiteNow]);

  const handlePostJob = () => {
    setChooserOpen(true);
  };
  const closeChooser = () => setChooserOpen(false);
  const goToTemp = () => { closeChooser(); navigate('/post/temp'); };
  const goToPermanent = () => { closeChooser(); navigate('/post/permanent'); };

  const handleFindPros = () => {
    setFindProsOpen(true);
  };

  const handleFindProsSubmit = (criteria) => {
    setFindProsOpen(false);
    const qs = new URLSearchParams();
    if (criteria.role) qs.set('role', criteria.role);
    if (criteria.date) qs.set('date', criteria.date);
    if (criteria.startTime) qs.set('start', criteria.startTime);
    if (criteria.endTime) qs.set('end', criteria.endTime);
    if (criteria.lunchBreakDuration) qs.set('lunch', String(criteria.lunchBreakDuration));
    navigate(`/professionals?${qs.toString()}`);
  };

  const handleStatTap = (statName) => {
    navigate(`/bookings?filter=${statName}`);
  };

  const handleCalendarDayTap = (day) => {
    if (day.empty) return;
    const d = String(day.date).padStart(2, '0');
    navigate(`/bookings?date=2026-04-${d}`);
  };

  const handleCalendarNav = (direction) => {
    // TODO: fetch prev/next month from API
    console.log('Calendar nav:', direction);
  };

  const handleOnsiteTap = (onsiteId) => {
    const realId = onsiteRealIds[onsiteId];
    if (realId) {
      navigate(`/professionals/${realId}`);
    } else {
      // ID hasn't resolved yet (or API failed) — fall back to listing.
      navigate('/professionals');
    }
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
      <TopBar />

      <div className="bg-[#f9f8f6] min-h-full pb-6">
        {/* Greeting */}
        <section className="px-5 pt-4 pb-5">
          <h1 className="font-[Outfit] font-bold text-[28px] leading-[1.15] tracking-[-0.02em] text-[#0f1a16] mb-1">
            Good morning, Dr. {office.ownerFirstName} 👋
          </h1>
          <div className="text-[14px] font-medium text-[#6b7875]">
            {office.officeName} · {office.date}
          </div>
        </section>

        {/* Post a Job (Need coverage?) */}
        <PostJobCard onPostJob={handlePostJob} onFindPros={handleFindPros} />

        {/* Today's overview */}
        <TodaysOverview stats={office.todayStats} onStatTap={handleStatTap} />

        {/* Calendar (Week / Month) */}
        <CalendarSection
          monthLabel={office.currentMonth}
          days={office.calendarDays}
          view={calendarView}
          onChangeView={setCalendarView}
          onDayTap={handleCalendarDayTap}
          onNav={handleCalendarNav}
        />

        {/* On-site now */}
        <OnsiteNowSection
          providers={office.onsiteNow}
          onProviderTap={handleOnsiteTap}
        />
      </div>

      <BottomNav />

      {/* Post a Job chooser modal */}
      <PostJobChooser
        open={chooserOpen}
        onClose={closeChooser}
        onPickTemp={goToTemp}
        onPickPermanent={goToPermanent}
      />

      {/* Find Pros criteria sheet */}
      <FindProsSheet
        open={findProsOpen}
        onClose={() => setFindProsOpen(false)}
        onSubmit={handleFindProsSubmit}
      />
    </div>
  );
}

// ── Post a Job card ──────────────────────────────────────────
function PostJobCard({ onPostJob, onFindPros }) {
  return (
    <div className="mx-4 bg-[#e8f2ed] border border-[#d4e7dd] rounded-[20px] p-[22px_22px_20px] relative overflow-hidden cursor-pointer">
      {/* Decorative glows */}
      <div
        className="absolute -top-[30px] -right-[30px] w-[140px] h-[140px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(26,127,94,0.08) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-[40px] right-[40px] w-[100px] h-[100px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(232,115,74,0.12) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        <h2 className="font-[Outfit] font-bold text-[20px] tracking-[-0.01em] text-[#0f1a16] mb-[6px] leading-[1.2]">
          Need coverage?
        </h2>
        <p className="text-[13.5px] text-[#6b7875] font-medium mb-4 leading-[1.35]">
          Post a shift and top-rated Houston pros will respond fast.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onPostJob}
            className="flex-1 px-[14px] py-3 rounded-full font-[DM_Sans] font-semibold text-[13.5px] bg-[#1a7f5e] text-white inline-flex items-center justify-center gap-[6px]"
          >
            <svg className="w-[14px] h-[14px] stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Post a Job
          </button>
          <button
            onClick={onFindPros}
            className="flex-1 px-[14px] py-3 rounded-full font-[DM_Sans] font-semibold text-[13.5px] bg-white text-[#1a7f5e] border border-[#d4e7dd] inline-flex items-center justify-center gap-[6px]"
          >
            <svg className="w-[14px] h-[14px] stroke-[#1a7f5e]" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Find Pros
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Today's overview (stats) ─────────────────────────────────
function TodaysOverview({ stats, onStatTap }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[18px] tracking-[-0.01em] text-[#0f1a16] m-0">
          Today's overview
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-[10px] px-4">
        <StatCard
          icon="check"
          iconVariant="green"
          value={stats.activeToday}
          label="Active today"
          onTap={() => onStatTap('active')}
        />
        <StatCard
          icon="clock"
          iconVariant="amber"
          value={stats.pending}
          label="Pending"
          onTap={() => onStatTap('pending')}
        />
        <StatCard
          icon="alert"
          iconVariant="coral"
          value={stats.unfilled}
          label="Unfilled"
          onTap={() => onStatTap('unfilled')}
        />
      </div>
    </>
  );
}

function StatCard({ icon, iconVariant, value, label, onTap }) {
  const iconBgMap = {
    green: 'bg-[#e8f2ed]',
    amber: 'bg-[#fdf4e1]',
    coral: 'bg-[#fdeee7]',
  };
  const iconStrokeMap = {
    green: 'stroke-[#1a7f5e]',
    amber: 'stroke-[#c98b16]',
    coral: 'stroke-[#e8734a]',
  };

  const iconSvg = {
    check: (
      <svg className={`w-[18px] h-[18px] ${iconStrokeMap[iconVariant]}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    clock: (
      <svg className={`w-[18px] h-[18px] ${iconStrokeMap[iconVariant]}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    alert: (
      <svg className={`w-[18px] h-[18px] ${iconStrokeMap[iconVariant]}`} viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };

  return (
    <div
      onClick={onTap}
      className="bg-white border border-[#e8e6e1] rounded-[16px] p-[16px_14px] cursor-pointer active:scale-[0.98] transition-transform"
    >
      <div className={`w-9 h-9 rounded-[11px] grid place-items-center mb-3 ${iconBgMap[iconVariant]}`}>
        {iconSvg[icon]}
      </div>
      <div className="font-[Outfit] font-bold text-[24px] leading-none tracking-[-0.02em] text-[#0f1a16]">
        {value}
      </div>
      <div className="text-[12px] text-[#6b7875] font-medium mt-[6px]">
        {label}
      </div>
    </div>
  );
}

// ── Calendar ─────────────────────────────────────────────────
const DOW_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// April 2026 DOW lookup (Apr 1 = Wed). Index = date of month.
const APRIL_2026_DOW = {
  1: 'Wed', 2: 'Thu', 3: 'Fri', 4: 'Sat', 5: 'Sun', 6: 'Mon', 7: 'Tue',
  8: 'Wed', 9: 'Thu', 10: 'Fri', 11: 'Sat', 12: 'Sun', 13: 'Mon', 14: 'Tue',
  15: 'Wed', 16: 'Thu', 17: 'Fri', 18: 'Sat', 19: 'Sun', 20: 'Mon', 21: 'Tue',
  22: 'Wed', 23: 'Thu', 24: 'Fri', 25: 'Sat', 26: 'Sun', 27: 'Mon', 28: 'Tue',
  29: 'Wed', 30: 'Thu',
};

// 7 forward-looking days starting from today, with DOW attached.
// Mirrors the provider dashboard's week data shape: { dow, date, status }.
function buildWeek(days) {
  const todayIdx = days.findIndex((d) => d.status === 'today');
  if (todayIdx < 0) return [];
  return days
    .slice(todayIdx, todayIdx + 7)
    .filter((d) => !d.empty)
    .map((d) => ({
      dow: APRIL_2026_DOW[d.date] || '',
      date: d.date,
      status: d.status,
    }));
}

function CalendarSection({ monthLabel, days, view, onChangeView, onDayTap, onNav }) {
  const weekDays = buildWeek(days);

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[18px] tracking-[-0.01em] text-[#0f1a16] m-0">
          {view === 'week' ? 'This week' : 'This month'}
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
          {weekDays.map((day) => (
            <OfficeDayCard key={day.date} day={day} onTap={() => onDayTap(day)} />
          ))}
        </div>
      ) : (
        <div className="mx-4 bg-white border border-[#e8e6e1] rounded-[20px] p-[18px_16px_16px]">
          {/* Nav */}
          <div className="flex items-center justify-between mb-[14px]">
            <button
              onClick={() => onNav('prev')}
              className="w-8 h-8 rounded-full bg-[#f5faf7] border-none grid place-items-center cursor-pointer"
            >
              <svg className="w-[14px] h-[14px] stroke-[#3a4a44]" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="font-[Outfit] font-bold text-[16px] text-[#0f1a16] tracking-[-0.01em]">
              {monthLabel}
            </div>
            <button
              onClick={() => onNav('next')}
              className="w-8 h-8 rounded-full bg-[#f5faf7] border-none grid place-items-center cursor-pointer"
            >
              <svg className="w-[14px] h-[14px] stroke-[#3a4a44]" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-[3px]">
            {DOW_LETTERS.map((dow, i) => (
              <div key={i} className="text-[11px] font-bold text-[#9aa5a1] text-center py-[6px_0_10px] tracking-[0.05em]">
                {dow}
              </div>
            ))}
            {days.map((day, i) => (
              <CalendarDay key={i} day={day} onTap={() => onDayTap(day)} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-[18px] pt-[14px] mt-3 border-t border-[#efede8]">
            <div className="inline-flex items-center gap-[6px] text-[11.5px] text-[#6b7875] font-medium">
              <span className="w-3 h-3 rounded-[4px] bg-[#1a7f5e]" />
              Today
            </div>
            <div className="inline-flex items-center gap-[6px] text-[11.5px] text-[#6b7875] font-medium">
              <span className="w-3 h-3 rounded-[4px] bg-[#f5faf7] border border-[#e8f2ed]" />
              Booked
            </div>
            <div className="inline-flex items-center gap-[6px] text-[11.5px] text-[#6b7875] font-medium">
              <span className="w-[6px] h-[6px] rounded-full bg-[#e8734a]" />
              Open shift
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Mirrors ProviderDashboard DayCard exactly. Status mapping for office:
//   today       → green card, "Today"
//   booked      → sage card, "Booked"
//   booked-open → sage card, "Open" (has open shifts still)
//   normal      → white card, no status text
function OfficeDayCard({ day, onTap }) {
  const baseClasses = 'flex-shrink-0 w-[76px] h-[110px] rounded-[16px] p-[10px_8px_10px] flex flex-col items-center justify-center text-center cursor-pointer border';

  let classes = baseClasses;
  let dowColor = 'text-[#9aa5a1]';
  let numColor = 'text-[#0f1a16]';
  let statusColor = 'text-[#9aa5a1]';
  let statusText = '';

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
  } else if (day.status === 'booked-open') {
    classes += ' bg-[#f5faf7] border-[#dcebe3]';
    dowColor = 'text-[#146449]';
    numColor = 'text-[#146449]';
    statusColor = 'text-[#e8734a]';
    statusText = 'Open';
  } else {
    classes += ' bg-white border-[#e8e6e1]';
  }

  return (
    <div className={classes} onClick={onTap}>
      <div className={`text-[10.5px] font-bold uppercase tracking-[0.06em] ${dowColor} mb-1`}>
        {day.dow}
      </div>
      <div className={`font-[Outfit] font-bold text-[22px] leading-none tracking-[-0.02em] ${numColor} mb-2`}>
        {day.date}
      </div>
      <div className={`text-[10.5px] font-semibold uppercase tracking-[0.04em] ${statusColor} min-h-[13px]`}>
        {statusText}
      </div>
    </div>
  );
}

function CalendarDay({ day, onTap }) {
  if (day.empty) {
    return <div className="aspect-square" />;
  }

  let classes = 'aspect-square grid place-items-center text-[14px] font-semibold rounded-[12px] cursor-pointer relative';
  let showDot = false;

  if (day.status === 'today') {
    classes += ' bg-[#1a7f5e] text-white font-bold';
  } else if (day.status === 'booked') {
    classes += ' bg-[#f5faf7] text-[#146449]';
  } else if (day.status === 'booked-open') {
    classes += ' bg-[#f5faf7] text-[#146449]';
    showDot = true;
  } else {
    classes += ' text-[#0f1a16]';
  }

  return (
    <div className={classes} onClick={onTap}>
      {day.date}
      {showDot && (
        <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#e8734a]" />
      )}
    </div>
  );
}

// ── On-site now ──────────────────────────────────────────────
function OnsiteNowSection({ providers, onProviderTap }) {
  if (!providers || providers.length === 0) return null;

  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[18px] tracking-[-0.01em] text-[#0f1a16] m-0">
          On-site now
        </h3>
        <a href="#" className="text-[13px] font-semibold text-[#1a7f5e] inline-flex items-center gap-[3px]">
          View all
          <svg className="w-[14px] h-[14px] stroke-[#1a7f5e]" viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      </div>

      <div className="px-4 flex flex-col gap-[10px]">
        {providers.map((provider) => (
          <OnsiteCard key={provider.id} provider={provider} onTap={() => onProviderTap(provider.id)} />
        ))}
      </div>
    </>
  );
}

function OnsiteCard({ provider, onTap }) {
  return (
    <div
      onClick={onTap}
      className="bg-white border border-[#e8e6e1] rounded-[16px] p-[14px] flex items-center gap-3 cursor-pointer"
    >
      {provider.avatarUrl ? (
        <img
          src={provider.avatarUrl}
          alt={provider.name}
          className="w-12 h-12 rounded-[14px] object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-[14px] text-white font-[Outfit] font-bold text-[15px] grid place-items-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a8c9b8, #7ab8a8)' }}
        >
          {provider.initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-[3px]">
          <span className="text-[15px] font-semibold text-[#0f1a16]">
            {provider.name}
          </span>
          <span className="inline-flex items-center gap-1 bg-[#e8f2ed] text-[#1a7f5e] px-2 py-[2px] rounded-full text-[10.5px] font-bold tracking-[0.04em] uppercase">
            <span
              className="w-[6px] h-[6px] rounded-full bg-[#1a7f5e]"
              style={{ animation: 'kazi-pulse 1.8s ease-out infinite' }}
            />
            Live
          </span>
        </div>
        <div className="text-[12.5px] font-medium text-[#6b7875]">
          {provider.role} · {provider.timeRange} · Checked in {provider.checkedInAt}
        </div>
      </div>

      <svg className="w-[18px] h-[18px] stroke-[#9aa5a1] flex-shrink-0" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>

      {/* Keyframes for live pulse (injected once) */}
      <style>{`
        @keyframes kazi-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

// ── Post a Job chooser (temp vs permanent) ───────────────────
// Restored from the pre-redesign office dashboard. Green = temp,
// purple = permanent — matches the Jobs subtabs color coding used
// elsewhere in the app.
const CHOOSER_COLORS = {
  green: '#1a7f5e',
  greenTint: '#f1f9f5',
  purple: '#7c3aed',
  purpleSoft: '#f1ebfa',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  border: '#ececec',
};

function PostJobChooser({ open, onClose, onPickTemp, onPickPermanent }) {
  if (!open) return null;
  return (
    <>
      <style>{`
        @keyframes kazi-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kazi-scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
      `}</style>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(3px)', zIndex: 100, animation: 'kazi-fadeIn 0.3s',
        }}
      />
      <div
        style={{
          position: 'fixed', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)', background: 'white',
          borderRadius: 28, zIndex: 101, paddingBottom: 24,
          width: 'calc(100% - 40px)', maxWidth: 400,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          animation: 'kazi-scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <div style={{ padding: '24px 24px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, lineHeight: 1.15, color: CHOOSER_COLORS.text }}>Post a Job</div>
            <div style={{ fontSize: 14, color: CHOOSER_COLORS.textMid, marginTop: 6, lineHeight: 1.4 }}>What kind of position are you hiring for?</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: CHOOSER_COLORS.bg, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={CHOOSER_COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '24px 20px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ChoiceCard
            type="temp"
            tag="Single day"
            title="Temp Shift"
            onClick={onPickTemp}
            icon={(
              <svg viewBox="0 0 24 24" fill="none" stroke={CHOOSER_COLORS.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            )}
          />
          <ChoiceCard
            type="perm"
            tag="Long-term hire"
            title="Permanent Role"
            onClick={onPickPermanent}
            icon={(
              <svg viewBox="0 0 24 24" fill="none" stroke={CHOOSER_COLORS.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          />
        </div>
      </div>
    </>
  );
}

function ChoiceCard({ type, icon, tag, title, onClick }) {
  const [hover, setHover] = useState(false);
  const isPerm = type === 'perm';
  const accent = isPerm ? CHOOSER_COLORS.purple : CHOOSER_COLORS.green;
  const accentSoft = isPerm ? CHOOSER_COLORS.purpleSoft : CHOOSER_COLORS.greenTint;
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'white',
        border: `2px solid ${hover ? accent : CHOOSER_COLORS.border}`,
        borderRadius: 22, padding: 22, cursor: 'pointer',
        textAlign: 'left', width: '100%', fontFamily: 'inherit',
        transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? `0 8px 24px ${isPerm ? 'rgba(124, 58, 237, 0.15)' : 'rgba(26, 127, 94, 0.15)'}` : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: accentSoft }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 10px', borderRadius: 100, marginBottom: 6, background: accentSoft, color: accent }}>
            {tag}
          </div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: CHOOSER_COLORS.text, lineHeight: 1.15 }}>
            {title}
          </div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent, transform: hover ? 'translateX(3px)' : 'none', transition: 'transform 0.2s' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </button>
  );
}
