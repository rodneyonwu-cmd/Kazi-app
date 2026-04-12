import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProviderBottomNav from '../components/ProviderBottomNav';
import TopBar from '../components/TopBar';
import PermanentJobModal from '../components/PermanentJobModal';

// ============================================================
// KAZI FIND SHIFTS — Browse open shifts (route: /find-shifts)
// Temp / Permanent segmented control + List / Map view toggle
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  gold: '#f4b740',
};

// Stable random office logos via picsum.photos (seeded so each office
// always gets the same image). Real office logos will replace these
// once the API is wired.
const mockLogo = (seed) => `https://picsum.photos/seed/${seed}/120/120`;

const TEMP_SHIFTS = [
  {
    id: 'shift-pwd',
    initials: 'PWD',
    logoUrl: mockLogo('pearland'),
    name: 'Pearland Wellness Dental',
    role: 'Hygienist',
    distance: '3.1 mi · Pearland',
    rating: '4.7',
    reviewCount: 58,
    applied: 3,
    when: 'Thu, Apr 11 · 8:00 AM – 5:00 PM',
    lunch: '30 min lunch',
    software: 'Eaglesoft',
    pay: 62,
  },
  {
    id: 'shift-mcd',
    initials: 'MCD',
    logoUrl: mockLogo('missouri-city'),
    name: 'Missouri City Dental',
    role: 'Hygienist',
    distance: '4.2 mi · Fort Bend',
    rating: '4.9',
    reviewCount: 124,
    applied: 7,
    when: 'Wed, Apr 10 · 8:00 AM – 5:00 PM',
    lunch: '45 min lunch',
    software: 'Dentrix',
    pay: 58,
  },
  {
    id: 'shift-hdc',
    initials: 'HDC',
    logoUrl: mockLogo('houston-dental'),
    name: 'Houston Dental Care',
    role: 'Hygienist',
    distance: '5.6 mi · Houston',
    rating: '4.8',
    reviewCount: 92,
    applied: 5,
    when: 'Sat, Apr 13 · 9:00 AM – 3:00 PM',
    lunch: '30 min lunch',
    software: 'Open Dental',
    pay: 60,
  },
  {
    id: 'shift-sbd',
    initials: 'SBD',
    logoUrl: mockLogo('sugar-land-bright'),
    name: 'Sugar Land Bright Dental',
    role: 'Hygienist',
    distance: '7.8 mi · Sugar Land',
    rating: '4.6',
    reviewCount: 43,
    applied: 2,
    when: 'Mon, Apr 15 · 9:00 AM – 4:00 PM',
    lunch: '45 min lunch',
    software: 'Dentrix',
    pay: 55,
  },
];

const PERM_JOBS = [
  {
    id: 'perm-mcd',
    initials: 'MCD',
    logoUrl: mockLogo('missouri-city-perm'),
    name: 'Missouri City Dental',
    role: 'Dental Hygienist',
    distance: '4.2 mi · Fort Bend',
    rating: '4.9',
    reviewCount: 124,
    applied: 12,
    tags: [{ label: 'Full-time' }, { label: 'Mon–Fri', gray: true }, { label: 'Starts ASAP', gray: true }],
    benefits: ['Health', 'Dental', '401(k)', 'PTO', 'CE Allowance'],
    payRange: '$75K – $92K',
    payUnit: 'per year',
    badge: 'Full-Time',
    title: 'Dental Hygienist',
    type: 'Full-Time · Starts ASAP',
    salary: '$75K – $92K / year',
  },
  {
    id: 'perm-sbd',
    initials: 'SBD',
    logoUrl: mockLogo('sugar-land-perm'),
    name: 'Sugar Land Bright Dental',
    role: 'Dental Hygienist',
    distance: '7.8 mi · Sugar Land',
    rating: '4.6',
    reviewCount: 43,
    applied: 5,
    tags: [{ label: 'Full-time' }, { label: 'Tue–Sat', gray: true }, { label: 'Within 3 mo', gray: true }],
    benefits: ['Health', 'Vision', 'PTO', 'Paid Holidays'],
    payRange: '$95K – $115K',
    payUnit: 'per year',
    badge: 'Full-Time',
    title: 'Dental Hygienist',
    type: 'Full-Time · Start within 3 months',
    salary: '$95K – $115K / year',
  },
  {
    id: 'perm-pwd',
    initials: 'PWD',
    logoUrl: mockLogo('pearland-perm'),
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
    badge: 'Part-Time',
    title: 'Dental Assistant',
    type: 'Part-Time · 3 days/week · Starts ASAP',
    salary: '$24 – $30 / hour',
  },
];

const TEMP_FILTERS = [
  { label: 'Date', value: 'Apr 9–15', active: true },
  { label: 'Zip', value: '77459' },
  { label: 'Distance', value: '10mi' },
  { label: 'Min pay', value: '$50/hr' },
  { label: 'Posted', value: '7d' },
];

const PERM_FILTERS = [
  { label: 'Type', value: 'Full-time', active: true },
  { label: 'Zip', value: '77459' },
  { label: 'Distance', value: '10mi' },
  { label: 'Min pay', value: '$50/hr' },
  { label: 'Start date', value: 'Any' },
];

// Format a YYYY-MM-DD date string to a human-readable label
function fmtDateLabel(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

export default function FindShifts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [workType, setWorkType] = useState('temp');
  const [view, setView] = useState('list');
  const [selectedPermJob, setSelectedPermJob] = useState(null);

  // Date filter from calendar tap on dashboard
  const params = new URLSearchParams(location.search);
  const [dateFilter, setDateFilter] = useState(params.get('date') || '');

  const clearDateFilter = () => {
    setDateFilter('');
    navigate('/find-shifts', { replace: true });
  };

  const isTemp = workType === 'temp';
  const filters = isTemp ? TEMP_FILTERS : PERM_FILTERS;

  return (
    <>
      <style>{`
        .kazi-find * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .kazi-find button { font-family: inherit; cursor: pointer; }
        .kazi-find .scroll-x { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .kazi-find .scroll-x::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        className="kazi-find"
        style={{
          background: COLORS.bg,
          color: COLORS.text,
          fontFamily: "'DM Sans', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          paddingBottom: 100,
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100vh',
          boxShadow: '0 0 40px rgba(0,0,0,0.06)',
          position: 'relative',
        }}
      >
        <TopBar role="provider" />
        {/* TOP BAR */}
        <div
          style={{
            background: COLORS.card,
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `1px solid ${COLORS.borderSoft}`,
          }}
        >
          <button
            onClick={() => navigate('/provider')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: COLORS.bg,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, flex: 1 }}>Find Work</div>
          {isTemp && (
            <div
              style={{
                display: 'inline-flex',
                background: COLORS.bg,
                border: `1px solid ${COLORS.borderSoft}`,
                borderRadius: 100,
                padding: 3,
                gap: 2,
              }}
            >
              <ViewToggleBtn active={view === 'list'} onClick={() => setView('list')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                List
              </ViewToggleBtn>
              <ViewToggleBtn active={view === 'map'} onClick={() => setView('map')}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                  <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                  <line x1="8" y1="2" x2="8" y2="18" />
                  <line x1="16" y1="6" x2="16" y2="22" />
                </svg>
                Map
              </ViewToggleBtn>
            </div>
          )}
        </div>

        {/* SEGMENTED CONTROL */}
        <div
          style={{
            display: 'flex',
            margin: '14px 16px 0',
            background: COLORS.bg,
            border: `1px solid ${COLORS.borderSoft}`,
            borderRadius: 100,
            padding: 4,
            gap: 4,
          }}
        >
          <SegBtn active={isTemp} onClick={() => setWorkType('temp')} count={12}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Temp shifts
          </SegBtn>
          <SegBtn active={!isTemp} onClick={() => setWorkType('perm')} count={8}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <path d="M20 7h-7m0 10H4m16-5H8" />
              <circle cx="6" cy="7" r="2" />
              <circle cx="18" cy="17" r="2" />
            </svg>
            Permanent
          </SegBtn>
        </div>

        {/* FILTERS */}
        <div
          className="scroll-x"
          style={{
            background: COLORS.card,
            padding: '12px 16px 14px',
            borderTop: `1px solid ${COLORS.borderSoft}`,
            borderBottom: `1px solid ${COLORS.borderSoft}`,
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            marginTop: 14,
          }}
        >
          {filters.map((f) => (
            <FilterChip key={f.label} {...f} />
          ))}
        </div>

        {/* RESULT BAR */}
        <div style={{ padding: '14px 20px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, color: COLORS.textLight, fontWeight: 600 }}>
            <strong style={{ color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
              {isTemp ? TEMP_SHIFTS.length : PERM_JOBS.length}
            </strong>{' '}
            {isTemp ? 'shifts found' : 'permanent jobs found'}
          </div>
          <button style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: COLORS.green, display: 'flex', alignItems: 'center', gap: 4 }}>
            Sort: Distance
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* DATE FILTER BANNER */}
        {dateFilter && (
          <div
            style={{
              margin: '10px 16px 0',
              padding: '10px 14px',
              background: COLORS.greenTint,
              border: `1px solid ${COLORS.greenSoft}`,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.green }}>
              Showing shifts for {fmtDateLabel(dateFilter)}
            </div>
            <button
              onClick={clearDateFilter}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Clear date filter"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* MAP VIEW (temp only) */}
        {isTemp && view === 'map' && <MapView />}

        {/* CARDS — filtered by date if a dateFilter is active */}
        {isTemp
          ? TEMP_SHIFTS
              .filter((shift) => {
                if (!dateFilter) return true;
                // dateFilter = "2026-04-11" → extract "Apr 11"
                const d = new Date(dateFilter + 'T12:00:00');
                const mo = d.toLocaleDateString('en-US', { month: 'short' });
                const day = d.getDate();
                return shift.when.includes(`${mo} ${day}`);
              })
              .map((shift) => <TempShiftCard key={shift.id} shift={shift} onApply={() => navigate(`/find-shifts/${shift.id}`)} />)
          : PERM_JOBS.map((job) => <PermJobCard key={job.id} job={job} onTap={() => setSelectedPermJob(job)} />)}

        <ProviderBottomNav />
      </div>
      <PermanentJobModal open={!!selectedPermJob} job={selectedPermJob} onClose={() => setSelectedPermJob(null)} />
    </>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function ViewToggleBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? COLORS.green : 'none',
        border: 'none',
        fontSize: 11,
        fontWeight: 700,
        color: active ? 'white' : COLORS.textLight,
        padding: '7px 12px',
        borderRadius: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

function SegBtn({ active, onClick, count, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        background: active ? COLORS.card : 'none',
        border: 'none',
        fontSize: 13,
        fontWeight: 700,
        color: active ? COLORS.text : COLORS.textLight,
        padding: 11,
        borderRadius: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transition: 'all 0.2s',
        boxShadow: active ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      {children}
      <span
        style={{
          background: active ? COLORS.green : COLORS.greenTint,
          color: active ? 'white' : COLORS.green,
          fontSize: 10,
          fontWeight: 800,
          padding: '2px 8px',
          borderRadius: 100,
          minWidth: 22,
        }}
      >
        {count}
      </span>
    </button>
  );
}

function FilterChip({ label, value, active }) {
  return (
    <button
      style={{
        flexShrink: 0,
        background: active ? COLORS.greenTint : COLORS.bg,
        border: `1px solid ${active ? COLORS.greenSoft : COLORS.border}`,
        borderRadius: 100,
        padding: '9px 14px',
        fontSize: 12,
        fontWeight: 700,
        color: active ? COLORS.green : COLORS.text,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {label} <span style={{ color: COLORS.textLight, fontWeight: 600 }}>{value}</span>
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? COLORS.green : COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  );
}

function TempShiftCard({ shift, onApply }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 22,
        padding: 18,
        margin: '14px 16px 0',
        position: 'relative',
      }}
    >
      {/* Hourly rate — top right, same style as perm salary */}
      <div style={{ position: 'absolute', top: 18, right: 18, textAlign: 'right' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: COLORS.green, fontSize: 13, lineHeight: 1 }}>
          ${shift.pay}/hr
        </div>
      </div>
      <CardHeader item={shift} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '11px 14px',
          background: COLORS.bg,
          borderRadius: 12,
          marginBottom: 10,
          fontFamily: "'Outfit', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.text,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {shift.when}
      </div>
      {/* Lunch + software + Apply on the same row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <ExtraChip>{shift.lunch}</ExtraChip>
        <ExtraChip>{shift.software}</ExtraChip>
        <button
          onClick={onApply}
          style={{
            background: COLORS.green,
            color: 'white',
            border: 'none',
            borderRadius: 100,
            padding: '7px 14px',
            fontSize: 11,
            fontWeight: 700,
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Apply
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function PermJobCard({ job, onTap }) {
  return (
    <div
      onClick={onTap}
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 22,
        padding: 18,
        margin: '14px 16px 0',
        position: 'relative',
        cursor: 'pointer',
      }}
    >
      {/* Salary — top right */}
      <div style={{ position: 'absolute', top: 18, right: 18, textAlign: 'right' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: COLORS.green, fontSize: 13, lineHeight: 1 }}>
          {job.payRange}
        </div>
        <div style={{ fontSize: 9, color: COLORS.textLight, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
          {job.payUnit}
        </div>
      </div>
      <CardHeader item={job} />
      {/* Tags row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: job.benefits?.length ? 10 : 0 }}>
        {job.tags.map((t, i) => (
          <span
            key={i}
            style={{
              background: t.gray ? COLORS.bg : '#f3ecfd',
              color: t.gray ? COLORS.textMid : '#5b21b6',
              border: `1px solid ${t.gray ? COLORS.border : '#d9c7f5'}`,
              padding: '4px 10px',
              borderRadius: 100,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {t.label}
          </span>
        ))}
      </div>
      {/* Benefits row — same style as gray tags */}
      {job.benefits?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {job.benefits.map((b) => (
            <span
              key={b}
              style={{
                background: COLORS.bg,
                color: COLORS.textMid,
                border: `1px solid ${COLORS.border}`,
                padding: '4px 10px',
                borderRadius: 100,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function getInitials(name) {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function OfficeAvatar({ item, onClick }) {
  const initials = getInitials(item.name) || item.initials;
  const [failed, setFailed] = useState(false);
  const baseStyle = {
    width: 48,
    height: 48,
    borderRadius: 14,
    flexShrink: 0,
    border: '1.5px solid white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    cursor: 'pointer',
  };
  if (item.logoUrl && !failed) {
    return (
      <img
        src={item.logoUrl}
        alt={item.name}
        onClick={onClick}
        onError={() => setFailed(true)}
        style={{ ...baseStyle, objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      onClick={onClick}
      style={{
        ...baseStyle,
        background: 'linear-gradient(135deg, #99f6e4 0%, #7dd3fc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        fontSize: 13,
        color: 'white',
        letterSpacing: '-0.3px',
      }}
    >
      {initials}
    </div>
  );
}

function CardHeader({ item }) {
  const navigate = useNavigate();
  const goOffice = (e) => {
    e.stopPropagation();
    navigate(`/office/${item.officeId || item.id || 'demo'}`);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
      <OfficeAvatar item={item} onClick={goOffice} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          onClick={goOffice}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: '#111111',
            lineHeight: 1.2,
            marginBottom: 4,
            letterSpacing: '-0.3px',
            cursor: 'pointer',
          }}
        >
          {item.name}
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.textMid, lineHeight: 1.2, marginBottom: 6 }}>
          {item.role}
        </div>
        <div style={{ fontSize: 12, color: COLORS.textLight, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {item.distance}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700, color: COLORS.text }}>
            <span style={{ color: COLORS.gold, fontSize: 18, lineHeight: 1 }}>★</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16 }}>{item.rating}</span>
            <span style={{ color: COLORS.textLight, fontWeight: 600, fontSize: 12 }}>({item.reviewCount})</span>
          </div>
          {item.applied != null && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                color: COLORS.green,
                fontWeight: 700,
                background: COLORS.greenTint,
                border: `1px solid ${COLORS.greenSoft}`,
                padding: '5px 10px',
                borderRadius: 100,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              <strong style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13 }}>{item.applied}</strong> applied
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExtraChip({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        padding: '7px 12px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 700,
        color: COLORS.text,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function CardFooter({ pay, payRange, payUnit, onApply }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 14, borderTop: `1px solid ${COLORS.borderSoft}` }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: COLORS.green, lineHeight: 1, flexShrink: 0, fontSize: payRange ? 18 : 24 }}>
        {payRange ? (
          <>
            {payRange}
            <span style={{ display: 'block', fontSize: 11, color: COLORS.textLight, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
              {payUnit}
            </span>
          </>
        ) : (
          <>
            ${pay}
            <span style={{ fontSize: 11, color: COLORS.textLight, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginLeft: 2 }}>{payUnit}</span>
          </>
        )}
      </div>
      <button
        onClick={onApply}
        style={{
          flex: 1,
          background: COLORS.green,
          color: 'white',
          border: 'none',
          borderRadius: 100,
          padding: 13,
          fontSize: 14,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
        }}
      >
        Apply
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </button>
      <button
        style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: COLORS.bg,
          border: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-label="Save"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>
    </div>
  );
}

function MapView() {
  return (
    <div
      style={{
        height: 320,
        background: 'linear-gradient(135deg, #c8d4cd 0%, #d4dccd 50%, #cfd8c8 100%)',
        position: 'relative',
        overflow: 'hidden',
        margin: '8px 16px 4px',
        borderRadius: 20,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <Pin top="28%" left="55%" pay="$62" />
      <Pin top="42%" left="70%" pay="$58" selected />
      <Pin top="30%" left="25%" pay="$60" />
      <Pin top="55%" left="30%" pay="$55" />
    </div>
  );
}

function Pin({ top, left, pay, selected }) {
  return (
    <div style={{ position: 'absolute', top, left, transform: 'translate(-50%, -100%)', cursor: 'pointer', zIndex: 5 }}>
      <div
        style={{
          background: selected ? COLORS.text : COLORS.green,
          color: 'white',
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: 13,
          padding: '7px 12px',
          borderRadius: 100,
          border: '2.5px solid white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          whiteSpace: 'nowrap',
          transform: selected ? 'scale(1.1)' : 'none',
        }}
      >
        {pay}
      </div>
    </div>
  );
}
