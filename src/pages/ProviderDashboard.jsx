import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';
import TempShiftCard from '../components/TempShiftCard';
import PermJobCard from '../components/PermJobCard';
import ShiftDetailModal from '../components/ShiftDetailModal';
import PermanentJobModal from '../components/PermanentJobModal';
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
  referralCode: 'RODNEY50',
  date: 'Tuesday, April 9',
  location: 'Houston, TX',
  // Contextual greeting source. The home page uses this to render a
  // single useful sentence at the top instead of a generic "hello".
  nextShift: {
    hoursAway: 18,
    officeName: 'Sugar Land Dental',
  },
  stats: {
    rating: 4.9,
    reliability: 98,
    profileScore: 650,
    shiftsCompleted: 42,
  },
  // Anchor metric — the single number the home page leads with.
  earnings: {
    weekTotal: 1240,
    weekDeltaPct: 12,        // vs last week
    weekShiftCount: 3,
    nextPayoutDate: 'Fri',
    nextPayoutAmount: 580,
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
  // Stable seeded logos via picsum.photos (matches Find Shifts pattern).
  // Real office logos will replace these once the API is wired.
  nearbyShifts: [
    {
      id: 'shift_1',
      initials: 'SLD',
      logoUrl: 'https://picsum.photos/seed/sugar-land-dental/120/120',
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
      logoUrl: 'https://picsum.photos/seed/bellaire-family-dental/120/120',
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
      logoUrl: 'https://picsum.photos/seed/pearland-dental-care/120/120',
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
    {
      id: 'shift_4',
      initials: 'KFD',
      logoUrl: 'https://picsum.photos/seed/katy-family-dental/120/120',
      name: 'Katy Family Dental',
      role: 'Hygienist',
      distance: '11.4 mi · Katy',
      rating: '4.6',
      reviewCount: 73,
      applied: 5,
      when: 'Wed, Apr 17 · 8:00 AM – 5:00 PM',
      lunch: '45 min lunch',
      software: 'Curve Dental',
      pay: 44,
    },
    {
      id: 'shift_5',
      initials: 'MOD',
      logoUrl: 'https://picsum.photos/seed/montrose-orthodontics/120/120',
      name: 'Montrose Orthodontics',
      role: 'Dental Assistant',
      distance: '7.5 mi · Houston',
      rating: '4.8',
      reviewCount: 98,
      applied: 11,
      when: 'Fri, Apr 19 · 9:00 AM – 6:00 PM',
      lunch: '30 min lunch',
      software: 'Dolphin',
      pay: 38,
    },
  ],
  // Permanent jobs near me — mirrors the PERM_JOBS shape from Find Shifts.
  // Cards open the same PermanentJobModal as Find Shifts.
  nearbyPermJobs: [
    {
      id: 'perm-mcd',
      initials: 'MCD',
      logoUrl: 'https://picsum.photos/seed/missouri-city-perm/120/120',
      name: 'Missouri City Dental',
      role: 'Dental Hygienist',
      distance: '4.2 mi · Fort Bend',
      rating: '4.9',
      reviewCount: 124,
      applied: 12,
      tags: [{ label: 'Full-time' }, { label: 'Mon–Fri', gray: true }, { label: 'Starts ASAP', gray: true }],
      benefits: ['Health', 'Dental', '401(k)', 'PTO'],
      payRange: '$75K – $92K',
      payUnit: 'per year',
      title: 'Dental Hygienist',
      type: 'Full-Time · Starts ASAP',
      salary: '$75K – $92K / year',
    },
    {
      id: 'perm-sbd',
      initials: 'SBD',
      logoUrl: 'https://picsum.photos/seed/sugar-land-perm/120/120',
      name: 'Sugar Land Bright Dental',
      role: 'Dental Hygienist',
      distance: '7.8 mi · Sugar Land',
      rating: '4.6',
      reviewCount: 43,
      applied: 5,
      tags: [{ label: 'Full-time' }, { label: 'Tue–Sat', gray: true }, { label: 'Within 3 mo', gray: true }],
      benefits: ['Health', 'Vision', 'PTO'],
      payRange: '$95K – $115K',
      payUnit: 'per year',
      title: 'Dental Hygienist',
      type: 'Full-Time · Start within 3 months',
      salary: '$95K – $115K / year',
    },
    {
      id: 'perm-pwd',
      initials: 'PWD',
      logoUrl: 'https://picsum.photos/seed/pearland-perm/120/120',
      name: 'Pearland Wellness Dental',
      role: 'Dental Assistant',
      distance: '3.1 mi · Pearland',
      rating: '4.7',
      reviewCount: 58,
      applied: 8,
      tags: [{ label: 'Part-time' }, { label: 'Mon, Wed, Fri', gray: true }, { label: 'Starts ASAP', gray: true }],
      benefits: ['Flexible Hours', 'PTO', 'CE Allowance'],
      payRange: '$24 – $30',
      payUnit: 'per hour',
      title: 'Dental Assistant',
      type: 'Part-Time · 3 days/week · Starts ASAP',
      salary: '$24 – $30 / hour',
    },
    {
      id: 'perm-bsd',
      initials: 'BSD',
      logoUrl: 'https://picsum.photos/seed/bellaire-smile-perm/120/120',
      name: 'Bellaire Smile Dental',
      role: 'Front Office Lead',
      distance: '6.4 mi · Bellaire',
      rating: '4.8',
      reviewCount: 71,
      applied: 9,
      tags: [{ label: 'Full-time' }, { label: 'Mon–Fri', gray: true }, { label: 'Within 1 mo', gray: true }],
      benefits: ['Health', 'Dental', 'PTO', 'Bonus'],
      payRange: '$48K – $58K',
      payUnit: 'per year',
      title: 'Front Office Lead',
      type: 'Full-Time · Start within 1 month',
      salary: '$48K – $58K / year',
    },
    {
      id: 'perm-kpd',
      initials: 'KPD',
      logoUrl: 'https://picsum.photos/seed/katy-pediatric-perm/120/120',
      name: 'Katy Pediatric Dentistry',
      role: 'Dental Hygienist',
      distance: '11.9 mi · Katy',
      rating: '4.9',
      reviewCount: 156,
      applied: 14,
      tags: [{ label: 'Full-time' }, { label: 'Mon–Thu', gray: true }, { label: 'Starts ASAP', gray: true }],
      benefits: ['Health', 'Dental', '401(k)', 'PTO', 'CE Allowance'],
      payRange: '$82K – $98K',
      payUnit: 'per year',
      title: 'Dental Hygienist',
      type: 'Full-Time · 4 days/week · Starts ASAP',
      salary: '$82K – $98K / year',
    },
  ],
  // Latest from the Lounge — preview of trending community threads.
  // Real version: top N threads sorted by score / recency from
  // GET /api/lounge/threads.
  loungeHighlights: [
    {
      id: 't2',
      title: 'PSA: confirm tray setup BEFORE first patient',
      body: "Always check tray setup and where the ultrasonic tips are kept before first patient. 5 minutes saves a chaotic morning. Most chaos I've seen comes from skipping this.",
      tag: 'Tip',
      author: { initials: 'MC', name: 'Maya C.', role: 'DA · 3 yrs', anon: false, avatarUrl: 'https://i.pravatar.cc/120?u=maya-c' },
      time: '5h',
      score: 67,
      replyCount: 19,
    },
    {
      id: 't1',
      title: 'Fair hourly rate for an experienced DA in Houston?',
      body: "Trying to calibrate before my next shift. What are folks getting paid right now? Vote below — I'll share what I end up booking.",
      tag: 'Pay Talk',
      author: { initials: 'RP', name: 'Rachel P.', role: 'DA · 4 yrs', anon: false, avatarUrl: 'https://i.pravatar.cc/120?u=rachel-p' },
      time: '3h',
      score: 28,
      replyCount: 41,
    },
    {
      id: 't3',
      title: 'Evolve Dentistry — would book again',
      body: 'Worked a temp shift here last Friday. Clean office, friendly staff, and Dr. was totally hands-off in the best way. Pay was on time and lunch was covered.',
      tag: 'Office Review',
      author: { initials: null, name: 'Anonymous DA', role: 'verified', anon: true },
      time: '2d',
      score: 32,
      replyCount: 12,
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

  const [bookedShift, setBookedShift] = useState(null);
  const [selectedNearbyShift, setSelectedNearbyShift] = useState(null);
  const [selectedNearbyPermJob, setSelectedNearbyPermJob] = useState(null);

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

        {/* Staggered fade-in for top-level sections — pure CSS, no JS
            scroll observers. Sections respect prefers-reduced-motion. */}
        <style>{`
          @keyframes kazi-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          .kazi-rise { opacity: 0; animation: kazi-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
          @media (prefers-reduced-motion: reduce) {
            .kazi-rise { animation: none; opacity: 1; transform: none; }
          }
        `}</style>

        <div className="bg-[#f9f8f6] min-h-full pb-6">
          {/* Greeting — contextual one-liner. Falls back to a smart
              suggestion when the user has no upcoming shift. */}
          <div className="kazi-rise" style={{ animationDelay: '0ms' }}>
            <ContextualGreeting provider={provider} onTapNext={handleFindShifts} />
          </div>

          {/* Earnings anchor — primary metric. Tap-to-expand reveals
              rating / reliability / profile / shifts secondary stats. */}
          <div className="kazi-rise" style={{ animationDelay: '60ms' }}>
            <EarningsAnchor
              earnings={provider.earnings}
              stats={provider.stats}
              onTap={() => navigate('/finance')}
            />
          </div>

          {/* Today card */}
          <div className="kazi-rise" style={{ animationDelay: '120ms' }}>
            {provider.todayShift ? (
              <TodayShiftCard shift={provider.todayShift} />
            ) : (
              <TodayEmptyCard onFindShifts={handleFindShifts} />
            )}
          </div>

          {/* Your week — compact 7-day dot strip. Tap to expand to
              the full schedule page. */}
          <div className="kazi-rise" style={{ animationDelay: '180ms' }}>
            <CompactWeekStrip
              week={provider.week}
              onTapDay={handleDayTap}
              onSeeAll={() => navigate('/provider-schedule')}
            />
          </div>

          {/* Shifts near you — horizontal carousel of large shift cards */}
          <div className="kazi-rise" style={{ animationDelay: '240ms' }}>
            <ShiftsNearYouSection
              shifts={provider.nearbyShifts}
              onApply={(shift) => setSelectedNearbyShift(shift)}
              onSeeAll={handleFindShifts}
            />
          </div>

          {/* Permanent jobs near me — horizontal carousel of perm job cards */}
          <div className="kazi-rise" style={{ animationDelay: '300ms' }}>
            <PermanentJobsNearMeSection
              jobs={provider.nearbyPermJobs}
              onTap={(job) => setSelectedNearbyPermJob(job)}
              onSeeAll={() => navigate('/find-shifts?type=perm')}
            />
          </div>

          {/* Latest from the Lounge — community thread preview */}
          <div className="kazi-rise" style={{ animationDelay: '360ms' }}>
            <LatestFromLoungeSection
              threads={provider.loungeHighlights}
              onOpenThread={(t) => navigate(`/lounge?thread=${t.id}`)}
              onSeeAll={() => navigate('/lounge')}
            />
          </div>

          {/* Referral CTA — invite a friend, earn $50 */}
          <div className="kazi-rise" style={{ animationDelay: '420ms' }}>
            <ReferralCard
              code={provider.referralCode}
              bonusAmount={50}
              firstName={provider.firstName}
            />
          </div>
        </div>

        <ProviderBottomNav />
      </div>

      <ShiftDetailModal
        open={!!selectedNearbyShift}
        shift={selectedNearbyShift}
        onClose={() => setSelectedNearbyShift(null)}
      />

      <PermanentJobModal
        open={!!selectedNearbyPermJob}
        job={selectedNearbyPermJob}
        onClose={() => setSelectedNearbyPermJob(null)}
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

// ── Contextual greeting ──────────────────────────────────────
// Single useful sentence that replaces the generic "Hello, X 👋"
// header. Shows next-shift countdown when one exists, otherwise a
// nudge to discover open shifts.
function ContextualGreeting({ provider, onTapNext }) {
  const next = provider.nextShift;

  let primary;
  let secondary;
  if (next) {
    const hrs = next.hoursAway;
    const when = hrs >= 24
      ? `in ${Math.round(hrs / 24)} day${Math.round(hrs / 24) === 1 ? '' : 's'}`
      : `in ${hrs} hour${hrs === 1 ? '' : 's'}`;
    primary = (
      <>
        Your next shift is <span style={{ color: '#1a7f5e' }}>{when}</span>
      </>
    );
    secondary = next.officeName;
  } else {
    primary = (
      <>
        <span style={{ color: '#1a7f5e' }}>3 high-paying shifts</span> opened today
      </>
    );
    secondary = `Within 5 mi of ${provider.location}`;
  }

  return (
    <section
      onClick={onTapNext}
      className="px-5 pt-4 pb-6 cursor-pointer"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <h1 className="font-[Outfit] font-bold text-[26px] leading-[1.15] tracking-[-0.02em] text-[#0f1a16] mb-[6px]">
        {primary}
      </h1>
      <div className="text-[14.5px] font-normal text-[#6b7875] flex items-center gap-[6px]">
        {secondary}
        <svg viewBox="0 0 24 24" fill="none" stroke="#9aa5a1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </section>
  );
}

// ── Earnings anchor card ─────────────────────────────────────
// Single dominant metric (this week's earnings) with delta vs last
// week, # of shifts, and next payout. Secondary stats (rating,
// reliability, profile, shifts) collapse into an expandable footer.
function EarningsAnchor({ earnings, stats, onTap }) {
  const [expanded, setExpanded] = useState(false);
  const positive = earnings.weekDeltaPct >= 0;

  return (
    <section className="px-4 mb-[14px]">
      <div className="bg-white border border-[#e8e6e1] rounded-[20px] overflow-hidden">
        {/* Primary metric */}
        <button
          onClick={onTap}
          className="w-full text-left bg-transparent border-none px-5 pt-5 pb-4 cursor-pointer"
          style={{ fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent' }}
        >
          <div className="flex items-center justify-between mb-[6px]">
            <span className="text-[11.5px] font-bold uppercase tracking-[0.08em] text-[#6b7875]">
              Earnings · this week
            </span>
            <div className="flex items-center gap-[5px]">
              <svg viewBox="0 0 24 24" fill="none" stroke={positive ? '#1a7f5e' : '#e8734a'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                {positive ? (
                  <>
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </>
                ) : (
                  <>
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                  </>
                )}
              </svg>
              <span className="text-[12px] font-bold" style={{ color: positive ? '#1a7f5e' : '#e8734a' }}>
                {positive ? '+' : ''}{earnings.weekDeltaPct}%
              </span>
              <span className="text-[12px] font-medium text-[#9aa5a1]">vs last wk</span>
            </div>
          </div>
          <div className="flex items-baseline gap-[10px]">
            <span className="font-[Outfit] font-bold text-[40px] leading-none tracking-[-0.04em] text-[#0f1a16]">
              ${earnings.weekTotal.toLocaleString()}
            </span>
            <span className="text-[13.5px] font-medium text-[#6b7875]">
              · {earnings.weekShiftCount} {earnings.weekShiftCount === 1 ? 'shift' : 'shifts'}
            </span>
          </div>
          <div className="text-[12.5px] font-medium text-[#6b7875] mt-[8px]">
            Next payout {earnings.nextPayoutDate} · ${earnings.nextPayoutAmount}
          </div>
        </button>

        {/* Expandable secondary stats */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="w-full bg-[#fafaf8] border-none border-t border-[#f0eee8] px-5 py-[10px] flex items-center justify-between cursor-pointer"
          style={{ fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent' }}
        >
          <span className="text-[12px] font-semibold text-[#6b7875]">
            {expanded ? 'Hide stats' : 'Rating · Reliability · Profile · Shifts'}
          </span>
          <svg viewBox="0 0 24 24" fill="none" stroke="#9aa5a1" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s ease' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {expanded && (
          <div className="px-5 py-4 grid grid-cols-4 gap-3 border-t border-[#f0eee8]">
            <SecondaryStat label="Rating" value={stats.rating.toFixed(1)} icon="★" iconColor="#f4b740" />
            <SecondaryStat label="Reliability" value={`${stats.reliability}%`} valueColor={reliabilityClass(stats.reliability)} />
            <SecondaryStat label="Profile" value={stats.profileScore} />
            <SecondaryStat label="Shifts" value={stats.shiftsCompleted} />
          </div>
        )}
      </div>
    </section>
  );
}

function SecondaryStat({ label, value, icon, iconColor, valueColor }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-[3px] mb-[4px]">
        {icon && <span style={{ color: iconColor || '#1a7f5e', fontSize: 14, lineHeight: 1 }}>{icon}</span>}
        <span className={`font-[Outfit] font-bold text-[18px] leading-none tracking-[-0.02em] ${valueColor || 'text-[#0f1a16]'}`}>{value}</span>
      </div>
      <span className="text-[11.5px] font-medium text-[#6b7875]">{label}</span>
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
        <div className="text-[12.5px] font-medium text-[#6b7875] leading-none">Rating</div>
      </div>

      <div className="w-px bg-[#efede8] my-1" />

      {/* Reliability */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-[6px] cursor-pointer">
        <div className={`font-[Outfit] font-bold text-[18px] leading-none tracking-[-0.02em] ${reliabilityClass(stats.reliability)}`}>
          {stats.reliability}%
        </div>
        <div className="text-[12.5px] font-medium text-[#6b7875] leading-none">Reliability</div>
      </div>

      <div className="w-px bg-[#efede8] my-1" />

      {/* Profile score */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-[6px] cursor-pointer">
        <div className="font-[Outfit] font-bold text-[18px] leading-none tracking-[-0.02em] text-[#0f1a16]">
          {stats.profileScore}
        </div>
        <div className="text-[12.5px] font-medium text-[#6b7875] leading-none">Profile</div>
      </div>

      <div className="w-px bg-[#efede8] my-1" />

      {/* Shifts */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center gap-[6px] cursor-pointer">
        <div className="font-[Outfit] font-bold text-[18px] leading-none tracking-[-0.02em] text-[#0f1a16]">
          {stats.shiftsCompleted}
        </div>
        <div className="text-[12.5px] font-medium text-[#6b7875] leading-none">Shifts</div>
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
          <div className="font-[Outfit] font-bold text-[19px] tracking-[-0.01em] text-[#0f1a16] mb-[3px]">
            No shift today
          </div>
          <div className="text-[14.5px] font-normal text-[#6b7875] leading-[1.4]">
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
          <div className="font-[Outfit] font-bold text-[19px] tracking-[-0.01em] text-[#0f1a16] mb-[3px]">
            {shift.officeName}
          </div>
          <div className="text-[14.5px] font-normal text-[#6b7875]">
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
// ── Compact 7-day strip ──────────────────────────────────────
// Replaces the full week-grid / month-calendar block on home with
// a thin row of dot-marked days. Bigger schedule view lives on its
// own page (/provider-schedule), reachable via "Full schedule →".
function CompactWeekStrip({ week, onTapDay, onSeeAll }) {
  const dotForStatus = (status) => {
    switch (status) {
      case 'today':   return { color: '#1a7f5e', ring: true };
      case 'booked':  return { color: '#1a7f5e', ring: false };
      case 'open':    return { color: '#d1d5db', ring: false };
      case 'off':     return { color: 'transparent', ring: false };
      default:        return { color: '#d1d5db', ring: false };
    }
  };
  return (
    <section className="px-4 pt-1 pb-3">
      <div className="bg-white border border-[#e8e6e1] rounded-[18px] px-3 py-3">
        <div className="flex items-center justify-between mb-[8px] px-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#6b7875]">This week</span>
          <button onClick={onSeeAll} className="text-[12.5px] font-semibold text-[#1a7f5e] bg-transparent border-none cursor-pointer">
            Full schedule →
          </button>
        </div>
        <div className="flex items-stretch justify-between gap-1">
          {week.map((day) => {
            const isToday = day.status === 'today';
            const dot = dotForStatus(day.status);
            return (
              <button
                key={day.date}
                onClick={() => onTapDay(day)}
                className="flex-1 flex flex-col items-center gap-[6px] py-[6px] rounded-[10px] cursor-pointer"
                style={{
                  background: isToday ? '#f1f9f5' : 'transparent',
                  border: 'none',
                  fontFamily: 'inherit',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span className={`text-[10.5px] font-semibold uppercase tracking-[0.06em] ${isToday ? 'text-[#1a7f5e]' : 'text-[#9aa5a1]'}`}>
                  {day.dow}
                </span>
                <span className={`font-[Outfit] font-bold text-[16px] leading-none ${isToday ? 'text-[#1a7f5e]' : 'text-[#0f1a16]'}`}>
                  {day.date}
                </span>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: dot.color,
                    boxShadow: dot.ring ? '0 0 0 3px rgba(26,127,94,0.18)' : 'none',
                    marginTop: 2,
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function YourWeekSection({ week, view, onChangeView, onDayTap, onOpenBooked, onOpenFind }) {
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[20px] tracking-[-0.02em] text-[#0f1a16] m-0">
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
  const scrollerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[20px] tracking-[-0.02em] text-[#0f1a16] m-0">
          Shifts near you
        </h3>
        <button onClick={onSeeAll} className="text-[13px] font-semibold text-[#1a7f5e] bg-transparent border-none cursor-pointer">
          See all
        </button>
      </div>

      <div
        ref={scrollerRef}
        onScroll={() => setActiveIdx(carouselActiveIndex(scrollerRef.current))}
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
              compact
            />
          </div>
        ))}
      </div>
      <CarouselDots count={shifts.length} activeIdx={activeIdx} />
    </>
  );
}

// ── Permanent jobs near me ───────────────────────────────────
// Same horizontal-scroll pattern as ShiftsNearYouSection. Uses the
// shared PermJobCard so the cards look identical to Find Shifts.
function PermanentJobsNearMeSection({ jobs, onTap, onSeeAll }) {
  const scrollerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  if (!jobs?.length) return null;
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[20px] tracking-[-0.02em] text-[#0f1a16] m-0">
          Permanent jobs near me
        </h3>
        <button onClick={onSeeAll} className="text-[13px] font-semibold text-[#1a7f5e] bg-transparent border-none cursor-pointer">
          See all
        </button>
      </div>

      <div
        ref={scrollerRef}
        onScroll={() => setActiveIdx(carouselActiveIndex(scrollerRef.current))}
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
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              flex: '0 0 auto',
              width: 320,
              maxWidth: '85vw',
              scrollSnapAlign: 'start',
              display: 'flex',
            }}
          >
            <PermJobCard
              job={job}
              onTap={() => onTap(job)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
            />
          </div>
        ))}
      </div>
      <CarouselDots count={jobs.length} activeIdx={activeIdx} />
    </>
  );
}

// ── Latest from the Lounge ───────────────────────────────────
// Vertical stack of community thread previews. Each card shows a
// color-coded tag pill, title, author meta, and right-aligned vote
// + reply counts. Tapping a card or "See all" routes into /lounge.
const LOUNGE_TAG_COLORS = {
  'Pay Talk': { bg: '#f3ecfd', text: '#5b21b6', border: '#d9c7f5' },
  'Tip': { bg: '#e8f5f0', text: '#1a7f5e', border: '#c5e3d5' },
  'Office Review': { bg: '#fff4ec', text: '#b54a18', border: '#f7d6bc' },
  'Clinical': { bg: '#e0f2fe', text: '#0369a1', border: '#bae0fb' },
  'Owner Q': { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  'Billing': { bg: '#f3ecfd', text: '#5b21b6', border: '#d9c7f5' },
};

function LatestFromLoungeSection({ threads, onOpenThread, onSeeAll }) {
  if (!threads?.length) return null;
  return (
    <>
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <div className="flex items-center gap-[8px]">
          <span
            style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#1a7f5e',
              boxShadow: '0 0 0 4px rgba(26,127,94,0.15)',
            }}
          />
          <h3 className="font-[Outfit] font-bold text-[20px] tracking-[-0.02em] text-[#0f1a16] m-0">
            Latest from the Lounge
          </h3>
        </div>
        <button onClick={onSeeAll} className="text-[13px] font-semibold text-[#1a7f5e] bg-transparent border-none cursor-pointer">
          See all
        </button>
      </div>

      <div className="px-4 flex flex-col gap-[10px]">
        {threads.map((t) => (
          <LoungeThreadCard key={t.id} thread={t} onTap={() => onOpenThread(t)} />
        ))}
      </div>
    </>
  );
}

function LoungeThreadCard({ thread, onTap }) {
  const tagColors = LOUNGE_TAG_COLORS[thread.tag] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
  const isAnon = thread.author.anon;
  return (
    <button
      onClick={onTap}
      style={{
        background: '#ffffff',
        border: '1px solid #e8e6e1',
        borderRadius: 16,
        padding: '14px 16px',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'box-shadow 0.15s, transform 0.1s',
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.99)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {/* Top row — tag + time */}
      <div className="flex items-center justify-between">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 10px',
            borderRadius: 100,
            background: tagColors.bg,
            color: tagColors.text,
            border: `1px solid ${tagColors.border}`,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: '-0.1px',
          }}
        >
          {thread.tag}
        </span>
        <span style={{ fontSize: 12, color: '#9aa5a1', fontWeight: 500 }}>{thread.time}</span>
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 600,
          fontSize: 16,
          color: '#0f1a16',
          letterSpacing: '-0.2px',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {thread.title}
      </div>

      {/* Body preview — 2 lines clamped */}
      {thread.body && (
        <div
          style={{
            fontSize: 13.5,
            lineHeight: 1.45,
            color: '#5a5a5a',
            fontWeight: 400,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginTop: -2,
          }}
        >
          {thread.body}
        </div>
      )}

      {/* Bottom row — author + counts */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[8px] min-w-0">
          <div
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: isAnon
                ? 'linear-gradient(135deg, #d4d4d4 0%, #a8a8a8 100%)'
                : 'linear-gradient(135deg, #a8c9b8 0%, #7ab8a8 100%)',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontWeight: 600, fontSize: 9,
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {isAnon ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            ) : thread.author.avatarUrl ? (
              <img
                src={thread.author.avatarUrl}
                alt={thread.author.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              thread.author.initials
            )}
            {!isAnon && (
              <span
                style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#1a7f5e', border: '1.5px solid #fff',
                  display: 'grid', placeItems: 'center',
                  zIndex: 1,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 5, height: 5 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>
          <div className="text-[12.5px] text-[#6b7875] truncate">
            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{thread.author.name}</span>
            <span style={{ color: '#9aa5a1' }}> · {thread.author.role}</span>
          </div>
        </div>
        <div className="flex items-center gap-[12px] flex-shrink-0">
          <div className="flex items-center gap-[4px] text-[12px] font-semibold text-[#1a7f5e]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            {thread.score}
          </div>
          <div className="flex items-center gap-[4px] text-[12px] font-semibold text-[#6b7875]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#6b7875" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {thread.replyCount}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Referral CTA card ────────────────────────────────────────
// Sits at the bottom of the dashboard. Dark green gradient so it
// stands out from the white/off-white sections above without feeling
// out of place. Native Share API when available; falls back to
// clipboard copy with a brief "Copied" pill.
function ReferralCard({ code, bonusAmount = 50, firstName = 'A friend' }) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/signup?ref=${encodeURIComponent(code)}`
    : `https://kazi-app-woad.vercel.app/signup?ref=${encodeURIComponent(code)}`;

  const shareText = `Join me on Kazi — the best way to find dental shifts. Use my code ${code} when you sign up: ${inviteUrl}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Kazi',
          text: `Use my code ${code} when you sign up.`,
          url: inviteUrl,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // No clipboard access — fail silently.
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // No clipboard access.
    }
  };

  return (
    <div className="px-4 pt-7">
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #1a7f5e 0%, #146449 100%)',
          borderRadius: 24,
          padding: '24px 22px',
          color: '#ffffff',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blur orb (top-right) */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Eyebrow + title */}
        <div className="flex items-center gap-[8px] mb-[10px]" style={{ position: 'relative' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.16)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <polyline points="20 12 20 22 4 22 4 12" />
              <rect x="2" y="7" width="20" height="5" />
              <line x1="12" y1="22" x2="12" y2="7" />
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.78)',
            }}
          >
            Refer & earn
          </span>
        </div>

        <h3
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.4px',
            lineHeight: 1.2,
            margin: 0,
            position: 'relative',
          }}
        >
          Refer a dental pro,<br />get <span style={{ color: '#fff' }}>${bonusAmount}</span>
        </h3>

        <p
          style={{
            marginTop: 8,
            fontSize: 13.5,
            lineHeight: 1.45,
            color: 'rgba(255,255,255,0.82)',
            fontWeight: 400,
            maxWidth: 320,
            position: 'relative',
          }}
        >
          When they sign up with your code and complete their first shift, ${bonusAmount} drops into your earnings.
        </p>

        {/* Code + copy */}
        <button
          onClick={handleCopyCode}
          aria-label="Copy referral code"
          style={{
            marginTop: 16,
            background: 'rgba(255,255,255,0.14)',
            border: '1px dashed rgba(255,255,255,0.4)',
            borderRadius: 14,
            padding: '11px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: '#ffffff',
            position: 'relative',
            width: '100%',
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            Your code
          </span>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '0.6px',
              color: '#ffffff',
              flex: 1,
            }}
          >
            {code}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.92)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>

        {/* Share CTA */}
        <button
          onClick={handleShare}
          style={{
            marginTop: 12,
            width: '100%',
            background: '#ffffff',
            color: '#1a7f5e',
            border: 'none',
            borderRadius: 100,
            padding: '13px 18px',
            fontSize: 14.5,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share invite link
        </button>

        <p
          style={{
            marginTop: 12,
            fontSize: 11.5,
            color: 'rgba(255,255,255,0.65)',
            textAlign: 'center',
            position: 'relative',
            fontWeight: 500,
          }}
        >
          {firstName === 'A friend' ? 'Bonus credited after referee\'s first booking.' : `${firstName}, bonus credits after their first booking.`}
        </p>
      </div>
    </div>
  );
}

// ── Carousel scroll-position dots ────────────────────────────
// Compute which child of the scroll container is currently centered
// in the viewport. Robust to variable card widths and different
// container widths (320px cards capped at 85vw on small screens).
function carouselActiveIndex(scroller) {
  if (!scroller) return 0;
  const center = scroller.scrollLeft + scroller.clientWidth / 2;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < scroller.children.length; i++) {
    const child = scroller.children[i];
    const childCenter = child.offsetLeft + child.offsetWidth / 2;
    const dist = Math.abs(childCenter - center);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

function CarouselDots({ count, activeIdx }) {
  if (count <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-[6px] mt-3 mb-1">
      {Array.from({ length: count }).map((_, i) => {
        const active = i === activeIdx;
        return (
          <span
            key={i}
            style={{
              width: active ? 8 : 6,
              height: active ? 8 : 6,
              borderRadius: '50%',
              background: active ? '#1a1a1a' : '#d1d5db',
              transition: 'all 0.18s ease',
            }}
          />
        );
      })}
    </div>
  );
}
