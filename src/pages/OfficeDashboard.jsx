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
  officeAvatarUrl: null,
  date: 'Tuesday, April 7',
  todayStats: {
    activeToday: 2,
    pending: 3,
    unfilled: 1,
  },
  // Open shifts that still need coverage. Drives the "Open shifts"
  // mini-list under the hero (only renders when length > 0).
  openShifts: [
    {
      id: 'open_1',
      role: 'Hygienist',
      date: 'Fri, Apr 10',
      timeRange: '8:00a – 5:00p',
      rate: '$58/hr',
      applicantCount: 3,
    },
  ],
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

  const goToTemp = () => navigate('/post/temp');
  const goToPermanent = () => navigate('/post/permanent');

  const handleFindPros = () => {
    setFindProsOpen(true);
  };

  const handleFindProsSubmit = (criteria) => {
    setFindProsOpen(false);
    const qs = new URLSearchParams();
    if (criteria.rapidFillEnabled) qs.set('rapidfill', '1');
    if (criteria.role) qs.set('role', criteria.role);
    if (criteria.date) qs.set('date', criteria.date);
    if (criteria.startTime) qs.set('startTime', criteria.startTime);
    if (criteria.endTime) qs.set('endTime', criteria.endTime);
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
        {/* Hero — dark forest greeting + inlined stats */}
        <OfficeHeroStrip
          office={office}
          stats={office.todayStats}
          onStatTap={handleStatTap}
        />

        {/* Quick actions */}
        <QuickActionsRow
          onPostTemp={goToTemp}
          onPostPerm={goToPermanent}
          onFindPros={handleFindPros}
          onSavedPros={() => navigate('/professionals?saved=1')}
        />

        {/* Open shifts mini-list — only renders when there are unfilled shifts */}
        {office.openShifts && office.openShifts.length > 0 && (
          <OpenShiftsMini
            shifts={office.openShifts}
            onView={(s) => navigate(`/bookings?shift=${s.id}`)}
            onBoost={(s) => navigate(`/bookings?shift=${s.id}&boost=1`)}
          />
        )}

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

      {/* Find Pros criteria sheet */}
      <FindProsSheet
        open={findProsOpen}
        onClose={() => setFindProsOpen(false)}
        onSubmit={handleFindProsSubmit}
      />
    </div>
  );
}

// ── Office hero strip — dark forest greeting + inlined stats ─
// Mirrors the dashboard's PendingInvitesCard treatment so the office
// home gets the same dark-anchor moment the provider home has.
function OfficeHeroStrip({ office, stats, onStatTap }) {
  const initial = (office.officeName || 'O').charAt(0).toUpperCase();
  return (
    <section className="mx-4 mt-3" style={{ position: 'relative' }}>
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #1a2e2c 0%, #0f1d1b 100%)',
          color: '#ffffff',
          borderRadius: 22,
          padding: '20px 20px 16px',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blur orb */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.10), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -40,
            left: -30,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(122, 184, 168, 0.18), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Header row: avatar + office + date */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          {office.officeAvatarUrl ? (
            <img
              src={office.officeAvatarUrl}
              alt={office.officeName}
              style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.15)' }}
            />
          ) : (
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #a8c9b8, #7ab8a8)',
                color: '#0f1d1b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 19,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {office.officeName}
            </div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginTop: 3, fontWeight: 500, letterSpacing: '-0.01em' }}>
              {office.date}
            </div>
          </div>
        </div>

        {/* Greeting */}
        <div
          style={{
            position: 'relative',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginTop: 16,
          }}
        >
          Good morning, Dr. {office.ownerFirstName} 👋
        </div>

        {/* Stats row — translucent tiles on dark bg */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 16 }}>
          <DarkStatTile dot="#7be3b8" value={stats.activeToday} label="Active today" onTap={() => onStatTap('active')} />
          <DarkStatTile dot="#fed98a" value={stats.pending} label="Pending" onTap={() => onStatTap('pending')} />
          <DarkStatTile dot="#ff9b7e" value={stats.unfilled} label="Unfilled" onTap={() => onStatTap('unfilled')} />
        </div>
      </div>
    </section>
  );
}

function DarkStatTile({ dot, value, label, onTap }) {
  return (
    <button
      onClick={onTap}
      style={{
        textAlign: 'left',
        padding: '12px 13px 13px',
        borderRadius: 14,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.10)',
        color: '#ffffff',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.01em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: '-0.03em' }}>
        {value}
      </div>
    </button>
  );
}

// ── Quick actions row — compact pills replace the chunky card ──
function QuickActionsRow({ onPostTemp, onPostPerm, onFindPros, onSavedPros }) {
  const actions = [
    {
      key: 'temp',
      label: 'Post Temp',
      onClick: onPostTemp,
      tint: '#f1f9f5',
      stroke: '#1a7f5e',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      key: 'perm',
      label: 'Post Perm',
      onClick: onPostPerm,
      tint: '#f1ebfa',
      stroke: '#7c3aed',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      key: 'find',
      label: 'Find Pros',
      onClick: onFindPros,
      tint: '#eaf3ff',
      stroke: '#1f6feb',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      key: 'saved',
      label: 'Saved Pros',
      onClick: onSavedPros,
      tint: '#fdf4e1',
      stroke: '#c98b16',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 mt-4 pb-1">
      {actions.map((a) => (
        <button
          key={a.key}
          onClick={a.onClick}
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px 10px 12px',
            background: 'white',
            border: '1px solid #ececec',
            borderRadius: 100,
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: '#1a1a1a',
            cursor: 'pointer',
            letterSpacing: '-0.01em',
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: a.tint,
              color: a.stroke,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {a.icon}
          </span>
          {a.label}
        </button>
      ))}
    </div>
  );
}

// ── Open shifts mini-list ─────────────────────────────────────
// Shows the actual unfilled shifts inline with View / Boost actions
// so the office can act without bouncing into a separate screen.
function OpenShiftsMini({ shifts, onView, onBoost }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3
          className="m-0 inline-flex items-center gap-2"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 22, color: '#0f1a16', letterSpacing: '-0.02em' }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#e8734a' }} />
          Open shifts
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#6b7875', fontWeight: 500, letterSpacing: '-0.01em' }}>
            ({shifts.length})
          </span>
        </h3>
      </div>

      <div className="px-4 flex flex-col gap-[10px]">
        {shifts.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-[#e8e6e1] rounded-[16px] p-[16px]"
            style={{ position: 'relative' }}
          >
            {/* Coral accent rail */}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 16,
                bottom: 16,
                left: 0,
                width: 3,
                borderRadius: '0 3px 3px 0',
                background: '#e8734a',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#b85a32',
                      background: '#fdeee7',
                      padding: '4px 9px',
                      borderRadius: 100,
                    }}
                  >
                    Unfilled
                  </span>
                  {s.applicantCount > 0 && (
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 600, color: '#1a7f5e', letterSpacing: '-0.01em' }}>
                      {s.applicantCount} applicant{s.applicantCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#0f1a16', letterSpacing: '-0.02em' }}>
                  {s.role} · {s.date}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#6b7875', fontWeight: 500, marginTop: 4, letterSpacing: '-0.01em' }}>
                  {s.timeRange} · {s.rate}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button
                onClick={() => onView(s)}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: 100,
                  background: '#1a7f5e',
                  color: 'white',
                  border: 'none',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 14.5,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                }}
              >
                {s.applicantCount > 0 ? `View applicants` : 'View shift'}
              </button>
              <button
                onClick={() => onBoost(s)}
                style={{
                  flex: 1,
                  padding: '11px 14px',
                  borderRadius: 100,
                  background: 'white',
                  color: '#1a1a1a',
                  border: '1px solid #ececec',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: 14.5,
                  cursor: 'pointer',
                  letterSpacing: '-0.01em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Boost
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
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
        <h3
          className="m-0"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 22, color: '#0f1a16', letterSpacing: '-0.02em' }}
        >
          {view === 'week' ? 'This week' : 'This month'}
        </h3>
        <div className="inline-flex bg-white border border-[#e8e6e1] rounded-full p-[3px] gap-[2px]">
          <button
            onClick={() => onChangeView('week')}
            className={`border-none px-[14px] py-[7px] rounded-full ${
              view === 'week' ? 'bg-[#1a7f5e] text-white' : 'bg-transparent text-[#6b7875]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em' }}
          >
            Week
          </button>
          <button
            onClick={() => onChangeView('month')}
            className={`border-none px-[14px] py-[7px] rounded-full ${
              view === 'month' ? 'bg-[#1a7f5e] text-white' : 'bg-transparent text-[#6b7875]'
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em' }}
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
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#0f1a16', letterSpacing: '-0.02em' }}>
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
              <div
                key={i}
                className="text-center py-[6px_0_10px]"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#9aa5a1', letterSpacing: '0.04em' }}
              >
                {dow}
              </div>
            ))}
            {days.map((day, i) => (
              <CalendarDay key={i} day={day} onTap={() => onDayTap(day)} />
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-[18px] pt-[14px] mt-3 border-t border-[#efede8]">
            <div
              className="inline-flex items-center gap-[6px]"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#6b7875', letterSpacing: '-0.01em' }}
            >
              <span className="w-3 h-3 rounded-[4px] bg-[#1a7f5e]" />
              Today
            </div>
            <div
              className="inline-flex items-center gap-[6px]"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#6b7875', letterSpacing: '-0.01em' }}
            >
              <span className="w-3 h-3 rounded-[4px] bg-[#f5faf7] border border-[#e8f2ed]" />
              Booked
            </div>
            <div
              className="inline-flex items-center gap-[6px]"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: '#6b7875', letterSpacing: '-0.01em' }}
            >
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
      <div
        className={`${dowColor} mb-1`}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}
      >
        {day.dow}
      </div>
      <div
        className={`leading-none ${numColor} mb-2`}
        style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 26, letterSpacing: '-0.03em' }}
      >
        {day.date}
      </div>
      <div
        className={`${statusColor} min-h-[14px]`}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
      >
        {statusText}
      </div>
    </div>
  );
}

function CalendarDay({ day, onTap }) {
  if (day.empty) {
    return <div className="aspect-square" />;
  }

  let classes = 'aspect-square grid place-items-center rounded-[12px] cursor-pointer relative';
  let textStyle = { fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' };
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
    <div className={classes} style={textStyle} onClick={onTap}>
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
        <h3
          className="m-0"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 22, color: '#0f1a16', letterSpacing: '-0.02em' }}
        >
          On-site now
        </h3>
        <a
          href="#"
          className="text-[#1a7f5e] inline-flex items-center gap-[3px]"
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}
        >
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
          className="w-12 h-12 rounded-[14px] text-white grid place-items-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #a8c9b8, #7ab8a8)', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em' }}
        >
          {provider.initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-[4px]">
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700, color: '#0f1a16', letterSpacing: '-0.02em' }}>
            {provider.name}
          </span>
          <span
            className="inline-flex items-center gap-1 bg-[#e8f2ed] text-[#1a7f5e] px-2 py-[2px] rounded-full"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            <span
              className="w-[6px] h-[6px] rounded-full bg-[#1a7f5e]"
              style={{ animation: 'kazi-pulse 1.8s ease-out infinite' }}
            />
            Live
          </span>
        </div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 500, color: '#6b7875', letterSpacing: '-0.01em' }}>
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

