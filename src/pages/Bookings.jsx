import { useState, useMemo, useEffect } from 'react';

// ============================================================
// KAZI BOOKINGS — Minimal redesign
// 3 tabs: Pending · Upcoming · Completed
// Detail popup slides up for any booking
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenDark: '#15604a',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  coral: '#e8734a',
  amber: '#d97706',
  amberSoft: '#fef3e6',
  red: '#dc2626',
  redSoft: '#fee2e2',
  bg: '#f9f8f6',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  gold: '#f4b740',
};

// ============================================================
// MOCK DATA — replace with backend fetches later
// ============================================================
const AVATARS = {
  SK: 'https://randomuser.me/api/portraits/women/68.jpg',
  MG: 'https://randomuser.me/api/portraits/women/90.jpg',
  AA: 'https://randomuser.me/api/portraits/women/44.jpg',
  MO: 'https://randomuser.me/api/portraits/women/17.jpg',
  AB: 'https://randomuser.me/api/portraits/men/86.jpg',
  JP: 'https://randomuser.me/api/portraits/women/33.jpg',
  DL: 'https://randomuser.me/api/portraits/men/32.jpg',
};

const MOCK_PENDING = [
  { id: 'sarah-pending', name: 'Sarah K.', initials: 'SK', avatarUrl: AVATARS.SK, role: 'Dental Hygienist', cred: 'RDH', dateMonth: 'APR', dateDay: 14, dateLong: 'Monday, April 14', timeShort: '8a–5p', timeRange: '8:00 AM – 5:00 PM', hours: 8.5, hourlyRate: 58, rate: '$58/hr', total: 493, expiresIn: '4h 23m' },
  { id: 'maria-pending', name: 'Maria G.', initials: 'MG', avatarUrl: AVATARS.MG, role: 'Dental Hygienist', cred: 'RDH', dateMonth: 'APR', dateDay: 16, dateLong: 'Wednesday, April 16', timeShort: '9a–5p', timeRange: '9:00 AM – 5:00 PM', hours: 8, hourlyRate: 55, rate: '$55/hr', total: 440, expiresIn: '12h 51m' },
  { id: 'alexandra-pending', name: 'Alexandra A.', initials: 'AA', avatarUrl: AVATARS.AA, role: 'Dental Assistant', cred: 'RDA', dateMonth: 'APR', dateDay: 18, dateLong: 'Friday, April 18', timeShort: '8a–4p', timeRange: '8:00 AM – 4:00 PM', hours: 8, hourlyRate: 28, rate: '$28/hr', total: 224, expiresIn: '22h 04m' },
];

const MOCK_RAPID_FILL = [
  {
    id: 'rapid-fill-1',
    isRapidFill: true,
    role: 'Dental Hygienist',
    roleShort: 'Hygienist',
    cred: 'RDH',
    dateLong: 'Tuesday, April 15',
    dateMonth: 'APR',
    dateDay: 15,
    timeShort: '8a–5p',
    timeRange: '8:00 AM – 5:00 PM',
    hours: 8.5,
    hourlyRate: 55,
    rate: '$55/hr',
    total: 467.50,
    expiresIn: '2h 47m',
    sentCount: 7,
    providers: [
      { id: 'rf-sarah', name: 'Sarah K.', initials: 'SK', avatarUrl: AVATARS.SK, status: 'pending' },
      { id: 'rf-maria', name: 'Maria G.', initials: 'MG', avatarUrl: AVATARS.MG, status: 'pending' },
      { id: 'rf-marcus', name: 'Marcus T.', initials: 'MT', avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg', status: 'viewed' },
      { id: 'rf-rachel', name: 'Rachel M.', initials: 'RM', avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg', status: 'pending' },
      { id: 'rf-jasmine', name: 'Jasmine P.', initials: 'JP', avatarUrl: AVATARS.JP, status: 'viewed' },
      { id: 'rf-anthony', name: 'Anthony B.', initials: 'AB', avatarUrl: AVATARS.AB, status: 'pending' },
      { id: 'rf-priya', name: 'Priya S.', initials: 'PS', avatarUrl: 'https://randomuser.me/api/portraits/women/79.jpg', status: 'pending' },
    ],
  },
];

const MOCK_UPCOMING = [
  { id: 'sarah-upcoming', name: 'Sarah K.', initials: 'SK', avatarUrl: AVATARS.SK, role: 'Dental Hygienist', cred: 'RDH', roleShort: 'Hygienist', dateMonth: 'APR', dateDay: 10, dateLong: 'Thursday, April 10', dayLabel: 'Tomorrow', timeShort: '8a–5p', timeRange: '8:00 AM – 5:00 PM', hours: 8.5, hourlyRate: 58, total: 493, startsIn: '1 day 14h' },
  { id: 'michelle-upcoming', name: 'Michelle O.', initials: 'MO', avatarUrl: AVATARS.MO, role: 'Dental Assistant', cred: 'RDA', roleShort: 'Assistant', dateMonth: 'APR', dateDay: 11, dateLong: 'Friday, April 11', dayLabel: 'Friday', timeShort: '9a–5p', timeRange: '9:00 AM – 5:00 PM', hours: 8, hourlyRate: 24, total: 192, startsIn: '2 days' },
  { id: 'anthony-upcoming', name: 'Anthony B.', initials: 'AB', avatarUrl: AVATARS.AB, role: 'Dental Assistant', cred: 'EFDA', roleShort: 'Assistant', dateMonth: 'APR', dateDay: 14, dateLong: 'Monday, April 14', dayLabel: 'Monday', timeShort: '8a–4p', timeRange: '8:00 AM – 4:00 PM', hours: 7.5, hourlyRate: 30, total: 225, startsIn: '5 days' },
];

const MOCK_COMPLETED = [
  { id: 'sarah-completed', name: 'Sarah K.', initials: 'SK', avatarUrl: AVATARS.SK, role: 'Dental Hygienist', cred: 'RDH', roleShort: 'Hygienist', dateShort: 'Dec 19', year: '2025', dateLong: 'Friday, December 19', timeRange: '10:15 AM – 5:00 PM', hours: 6.75, hourlyRate: 51, total: 344.25, status: 'completed', reviewed: true, yourRating: 5.0, yourReview: 'Sarah was amazing — arrived 15 minutes early, brought her own loupes, and handled a full schedule without missing a beat. My patients loved her. Would absolutely book again.', yourReviewDate: 'DEC 19, 2025', theirRating: 5.0, theirReview: 'Clean practice, well-organized team, Dentrix was set up and ready. Lunch was provided. Would come back anytime.', theirReviewDate: 'DEC 20, 2025' },
  { id: 'michelle-completed', name: 'Michelle O.', initials: 'MO', avatarUrl: AVATARS.MO, role: 'Dental Assistant', cred: 'RDA', roleShort: 'Assistant', dateShort: 'Dec 12', year: '2025', dateLong: 'Friday, December 12', timeRange: '8:30 AM – 5:00 PM', hours: 7.5, hourlyRate: 24, total: 180, status: 'completed', reviewed: false },
  { id: 'jasmine-expired', name: 'Jasmine P.', initials: 'JP', avatarUrl: AVATARS.JP, roleShort: 'Request expired', dateShort: 'Dec 10', year: '2025', status: 'expired' },
  { id: 'michelle-completed-2', name: 'Michelle O.', initials: 'MO', avatarUrl: AVATARS.MO, role: 'Dental Assistant', cred: 'RDA', roleShort: 'Assistant', dateShort: 'Nov 14', year: '2025', dateLong: 'Friday, November 14', timeRange: '8:30 AM – 5:00 PM', hours: 7.5, hourlyRate: 24, total: 180, status: 'completed', reviewed: false },
  { id: 'david-declined', name: 'David L.', initials: 'DL', avatarUrl: AVATARS.DL, roleShort: 'Declined request', dateShort: 'Nov 9', year: '2025', status: 'declined' },
  { id: 'maria-completed', name: 'Maria G.', initials: 'MG', avatarUrl: AVATARS.MG, role: 'Dental Hygienist', cred: 'RDH', roleShort: 'Hygienist', dateShort: 'Nov 7', year: '2025', dateLong: 'Friday, November 7', timeRange: '8:00 AM – 5:00 PM', hours: 8, hourlyRate: 58, total: 464, status: 'completed', reviewed: true, yourRating: 4.8, yourReview: 'Strong clinical skills and great with patients. Showed up on time, easy to work with.', yourReviewDate: 'NOV 7, 2025' },
  { id: 'alexandra-completed', name: 'Alexandra A.', initials: 'AA', avatarUrl: AVATARS.AA, role: 'Dental Assistant', cred: 'RDA', roleShort: 'Assistant', dateShort: 'Oct 31', year: '2025', dateLong: 'Friday, October 31', timeRange: '8:00 AM – 4:00 PM', hours: 8, hourlyRate: 28, total: 224, status: 'completed', reviewed: false },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Bookings() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState({ role: 'All roles', amount: 'Any', needsReview: false, hideExpired: true });

  const hasActiveFilters = filters.role !== 'All roles' || filters.amount !== 'Any' || filters.needsReview;

  const filteredCompleted = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return MOCK_COMPLETED.filter((row) => {
      if (q) {
        const text = `${row.name} ${row.roleShort} ${row.dateShort}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (filters.hideExpired && (row.status === 'expired' || row.status === 'declined')) return false;
      if (filters.needsReview && (row.status !== 'completed' || row.reviewed)) return false;
      if (filters.role !== 'All roles' && row.roleShort && !row.roleShort.toLowerCase().includes(filters.role.toLowerCase())) return false;
      return true;
    });
  }, [searchQuery, filters]);

  return (
    <>
      <style>{`
        .kazi-bookings * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .kazi-bookings button, .kazi-bookings input { font-family: inherit; cursor: pointer; }
        .kazi-bookings input { outline: none; }
        @keyframes kaziSheetSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
        @keyframes kaziOverlayFade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="kazi-bookings" style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.06)', fontFamily: "'DM Sans', sans-serif", color: COLORS.text, WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* TOP BAR */}
        <div style={{ background: 'white', padding: '18px 18px 16px', borderBottom: `1px solid ${COLORS.borderSoft}`, flexShrink: 0, position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.text, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Bookings</div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
                {MOCK_PENDING.length + MOCK_RAPID_FILL.length} awaiting · {MOCK_UPCOMING.length} upcoming · {MOCK_COMPLETED.filter((c) => c.status === 'completed').length} completed
              </div>
            </div>
            {activeTab === 'completed' && (
              <button onClick={() => setFilterSheetOpen(true)} style={{ width: 40, height: 40, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }} aria-label="Filter">
                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                {hasActiveFilters && <div style={{ position: 'absolute', top: 7, right: 9, width: 7, height: 7, background: COLORS.coral, borderRadius: '50%', border: '1.5px solid white' }} />}
              </button>
            )}
          </div>

          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} counts={{ pending: MOCK_PENDING.length + MOCK_RAPID_FILL.length, upcoming: MOCK_UPCOMING.length, completed: MOCK_COMPLETED.filter((c) => c.status === 'completed').length }} />

          {activeTab === 'completed' && (
            <div style={{ marginTop: 14, background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 100, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13, flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by pro name or date" style={{ flex: 1, fontSize: 13, color: COLORS.text, background: 'none', border: 'none', fontFamily: 'inherit', fontWeight: 500 }} />
            </div>
          )}
        </div>

        {/* SCROLL AREA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 0 40px' }}>
          {activeTab === 'pending' && (
            <>
              {MOCK_RAPID_FILL.map((rf) => <RapidFillCard key={rf.id} item={rf} onOpen={() => setSelectedBooking({ type: 'rapid-fill', data: rf })} />)}
              {MOCK_PENDING.map((b) => <PendingCard key={b.id} item={b} onOpen={() => setSelectedBooking({ type: 'pending', data: b })} />)}
            </>
          )}
          {activeTab === 'upcoming' && MOCK_UPCOMING.map((b) => <UpcomingCard key={b.id} item={b} onOpen={() => setSelectedBooking({ type: 'upcoming', data: b })} />)}
          {activeTab === 'completed' && (
            <CompletedPanel
              items={filteredCompleted}
              searchQuery={searchQuery}
              onOpen={(row) => {
                if (row.status === 'completed') {
                  setSelectedBooking({ type: row.reviewed ? 'completed-reviewed' : 'completed-unrated', data: row });
                }
              }}
            />
          )}
        </div>

        {selectedBooking && <DetailSheet type={selectedBooking.type} booking={selectedBooking.data} onClose={() => setSelectedBooking(null)} />}
        {filterSheetOpen && <FilterSheet filters={filters} setFilters={setFilters} onClose={() => setFilterSheetOpen(false)} resultCount={filteredCompleted.length} />}
      </div>
    </>
  );
}

// ============================================================
// TABS
// ============================================================
function Tabs({ activeTab, setActiveTab, counts }) {
  const tabs = [
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'completed', label: 'Completed', count: counts.completed },
  ];
  return (
    <div style={{ marginTop: 14, display: 'flex', background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 100, padding: 4, gap: 2 }}>
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ flex: 1, background: isActive ? COLORS.green : 'none', border: 'none', padding: '10px 8px', fontSize: 12, fontWeight: 700, color: isActive ? 'white' : COLORS.textLight, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s' }}>
            {t.label}
            <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100, background: isActive ? 'rgba(255,255,255,0.25)' : COLORS.bg, color: isActive ? 'white' : COLORS.textLight, minWidth: 16 }}>{t.count}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// PENDING CARD
// ============================================================
function PendingCard({ item, onOpen }) {
  return (
    <div onClick={onOpen} style={{ margin: '0 16px 12px', background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 18, padding: '16px 18px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar url={item.avatarUrl} initials={item.initials} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text, lineHeight: 1.15, letterSpacing: '-0.2px', marginBottom: 2 }}>{item.name}</div>
          <div style={{ fontSize: 12, color: COLORS.textLight, lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span>{item.role.replace('Dental ', '')}</span>
            <Sep />
            <span>{item.timeShort}</span>
            <Sep />
            <span style={{ color: COLORS.textMid, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{item.rate}</span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <StatusPill variant="awaiting">Awaiting</StatusPill>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.borderSoft}` }}>
        <div style={{ fontSize: 11, color: COLORS.textMid, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          {item.dateLong}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.amber, fontWeight: 700 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{item.expiresIn}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// RAPID FILL CARD — one shift sent to multiple providers
// ============================================================
function RapidFillCard({ item, onOpen }) {
  const stackPros = item.providers.slice(0, 4);
  const remaining = item.providers.length - stackPros.length;
  return (
    <div onClick={onOpen} style={{ margin: '0 16px 12px', background: 'white', border: `1.5px solid ${COLORS.green}`, borderRadius: 18, padding: '16px 18px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
      {/* Header row with bolt icon + Rapid Fill label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.greenTint, border: `1px solid ${COLORS.greenSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill={COLORS.green} stroke={COLORS.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text, lineHeight: 1.15, letterSpacing: '-0.2px' }}>Rapid Fill</span>
            <span style={{ background: COLORS.green, color: 'white', fontSize: 9, fontWeight: 800, padding: '3px 7px', borderRadius: 100, fontFamily: "'Outfit', sans-serif", letterSpacing: 0.3 }}>SENT TO {item.sentCount}</span>
          </div>
          <div style={{ fontSize: 12, color: COLORS.textLight, lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span>{item.roleShort}</span>
            <Sep />
            <span>{item.timeShort}</span>
            <Sep />
            <span style={{ color: COLORS.textMid, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{item.rate}</span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <StatusPill variant="awaiting">Awaiting</StatusPill>
        </div>
      </div>

      {/* Stacked provider avatars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex' }}>
          {stackPros.map((p, idx) => (
            <div
              key={p.id}
              style={{
                width: 32, height: 32, borderRadius: 10,
                border: '2px solid white',
                marginLeft: idx === 0 ? 0 : -8,
                overflow: 'hidden', flexShrink: 0,
                background: COLORS.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 10, color: COLORS.text }}>{p.initials}</span>
              )}
            </div>
          ))}
          {remaining > 0 && (
            <div style={{ width: 32, height: 32, borderRadius: 10, border: '2px solid white', marginLeft: -8, background: COLORS.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 10, color: 'white' }}>+{remaining}</span>
            </div>
          )}
        </div>
        <div style={{ fontSize: 11, color: COLORS.textMid, lineHeight: 1.3 }}>
          First to accept gets it
        </div>
      </div>

      {/* Footer: date + expires */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.borderSoft}` }}>
        <div style={{ fontSize: 11, color: COLORS.textMid, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
          {item.dateLong}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.amber, fontWeight: 700 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{item.expiresIn}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// UPCOMING CARD
// ============================================================
function UpcomingCard({ item, onOpen }) {
  return (
    <div onClick={onOpen} style={{ margin: '0 16px 12px', background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 18, padding: '16px 18px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar url={item.avatarUrl} initials={item.initials} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text, lineHeight: 1.15, letterSpacing: '-0.2px', marginBottom: 2 }}>{item.name}</div>
          <div style={{ fontSize: 12, color: COLORS.textLight, lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
            <span>{item.roleShort}</span>
            <Sep />
            <span>{item.timeShort}</span>
            <Sep />
            <span>{item.hours} hrs</span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <StatusPill variant="confirmed">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 8, height: 8 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Confirmed
          </StatusPill>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.borderSoft}`, fontSize: 11, color: COLORS.textMid }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{item.dateLong} · {item.dayLabel}</span>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: COLORS.green, fontSize: 13 }}>${item.total}</span>
      </div>
    </div>
  );
}

// ============================================================
// COMPLETED PANEL
// ============================================================
function CompletedPanel({ items, searchQuery, onOpen }) {
  if (items.length === 0 && searchQuery) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ width: 60, height: 60, background: COLORS.bg, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text, marginBottom: 6 }}>No matches found</div>
        <div style={{ fontSize: 13, color: COLORS.textLight }}>Try a different name or date</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ margin: '0 16px 12px', background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 18, overflow: 'hidden' }}>
        {items.map((row, idx) => (
          <CompletedRow key={row.id} row={row} isLast={idx === items.length - 1} onOpen={() => onOpen(row)} />
        ))}
      </div>
      <div style={{ margin: '0 16px 12px', background: 'white', padding: 16, borderRadius: 18, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', gap: 12 }}>
        {[{ num: '124', label: 'Completed' }, { num: '$48.2k', label: 'Spent' }, { num: '8', label: 'To Review' }].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: i > 0 ? `1px solid ${COLORS.borderSoft}` : 'none' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.text, lineHeight: 1, letterSpacing: '-0.5px' }}>{s.num}</div>
            <div style={{ fontSize: 9, color: COLORS.textLight, textTransform: 'uppercase', fontWeight: 700, marginTop: 5, letterSpacing: 0.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompletedRow({ row, isLast, onOpen }) {
  const isExpired = row.status === 'expired' || row.status === 'declined';
  const isClickable = !isExpired;

  return (
    <div onClick={isClickable ? onOpen : undefined} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: isLast ? 'none' : `1px solid ${COLORS.borderSoft}`, cursor: isClickable ? 'pointer' : 'default', opacity: isExpired ? 0.5 : 1 }}>
      <Avatar url={row.avatarUrl} initials={row.initials} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.text, lineHeight: 1.15, letterSpacing: '-0.2px' }}>{row.name}</div>
        <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>
          {row.dateShort}, {row.year}
          {row.roleShort && ` · ${row.roleShort}`}
          {row.total != null && row.status === 'completed' && ` · $${row.total}`}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>
        {row.status === 'completed' && row.reviewed && <span style={{ color: COLORS.green, fontSize: 16, fontWeight: 800 }}>✓</span>}
        {row.status === 'completed' && !row.reviewed && (
          <button onClick={(e) => { e.stopPropagation(); onOpen(); }} style={{ background: COLORS.amberSoft, color: COLORS.amber, border: '1px solid #fce0bf', borderRadius: 100, padding: '6px 12px', fontSize: 10, fontWeight: 800, fontFamily: "'Outfit', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 9, height: 9 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Rate
          </button>
        )}
        {isExpired && <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 700, fontStyle: 'italic' }}>{row.status === 'expired' ? 'Expired' : 'Declined'}</span>}
      </div>
    </div>
  );
}

// ============================================================
// DETAIL SHEET
// ============================================================
function DetailSheet({ type, booking, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, animation: 'kaziOverlayFade 0.25s ease-out' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '28px 28px 0 0', zIndex: 201, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 50px rgba(0,0,0,0.25)', animation: 'kaziSheetSlide 0.35s cubic-bezier(0.32, 0.72, 0, 1)', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '12px auto 4px', flexShrink: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 18px 0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px' }}>
          {type === 'pending' && <PendingDetailBody b={booking} />}
          {type === 'rapid-fill' && <RapidFillDetailBody rf={booking} />}
          {type === 'upcoming' && <UpcomingDetailBody b={booking} />}
          {(type === 'completed-reviewed' || type === 'completed-unrated') && <CompletedDetailBody b={booking} reviewed={type === 'completed-reviewed'} />}
        </div>
        <DetailFooter type={type} />
      </div>
    </>
  );
}

function PendingDetailBody({ b }) {
  return (
    <>
      <DetailHero label="Pending request" title={b.dateLong} sub={`${b.timeRange} · ${b.hours} hours`} />
      <InfoChip variant="amber">Expires in <strong style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{b.expiresIn}</strong></InfoChip>
      <ProStrip b={b} />
      <DetailSection title="Request details">
        <InfoRow label="Hourly rate" value={`$${b.hourlyRate}/hr`} />
        <InfoRow label="Hours" value={b.hours.toString()} />
        <InfoRow label="Estimated total" value={`$${b.total}`} valueGreen />
      </DetailSection>
    </>
  );
}

function RapidFillDetailBody({ rf }) {
  return (
    <>
      {/* Hero */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: COLORS.greenTint, border: `1px solid ${COLORS.greenSoft}`, borderRadius: 100, padding: '5px 10px 5px 8px', marginBottom: 10 }}>
          <svg viewBox="0 0 24 24" fill={COLORS.green} stroke={COLORS.green} strokeWidth="1.5" style={{ width: 12, height: 12 }}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 10, color: COLORS.green, letterSpacing: 0.4, textTransform: 'uppercase' }}>Rapid Fill request</span>
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.text, letterSpacing: '-0.4px', lineHeight: 1.15 }}>{rf.dateLong}</div>
        <div style={{ fontSize: 13, color: COLORS.textMid, marginTop: 4 }}>{rf.timeRange} · {rf.hours} hours</div>
      </div>

      <InfoChip variant="amber">Expires in <strong style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{rf.expiresIn}</strong></InfoChip>

      <DetailSection title={`Sent to ${rf.providers.length} professionals`}>
        <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 12, lineHeight: 1.5 }}>
          First to accept the shift gets it. The rest will be notified that the shift was filled.
        </div>
        <div style={{ background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 14, overflow: 'hidden' }}>
          {rf.providers.map((p, idx) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderBottom: idx === rf.providers.length - 1 ? 'none' : `1px solid ${COLORS.borderSoft}` }}>
              <Avatar url={p.avatarUrl} initials={p.initials} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.text, lineHeight: 1.15, letterSpacing: '-0.2px' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>
                  {p.status === 'viewed' ? 'Viewed request' : 'Awaiting response'}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {p.status === 'viewed' ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 100, padding: '4px 9px' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.textMid, fontFamily: "'Outfit', sans-serif", letterSpacing: 0.2 }}>VIEWED</span>
                  </div>
                ) : (
                  <div style={{ width: 8, height: 8, background: COLORS.amber, borderRadius: '50%' }} />
                )}
              </div>
            </div>
          ))}
        </div>
      </DetailSection>

      <DetailSection title="Shift details">
        <InfoRow label="Role" value={`${rf.role} (${rf.cred})`} />
        <InfoRow label="Hourly rate" value={`$${rf.hourlyRate}/hr`} />
        <InfoRow label="Hours" value={rf.hours.toString()} />
        <InfoRow label="Estimated total" value={`$${rf.total.toFixed(2)}`} valueGreen />
      </DetailSection>
    </>
  );
}

function UpcomingDetailBody({ b }) {
  return (
    <>
      <DetailHero label="Confirmed shift" title={b.dateLong} sub={`${b.timeRange} · ${b.hours} hours`} />
      <InfoChip variant="green">Starts in <strong style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{b.startsIn}</strong></InfoChip>
      <ProStrip b={b} />
      <DetailSection title="Shift details">
        <InfoRow label="Hourly rate" value={`$${b.hourlyRate}/hr`} />
        <InfoRow label="Hours" value={b.hours.toString()} />
        <InfoRow label="Estimated payout" value={`$${b.total}`} valueGreen />
      </DetailSection>
      <DetailSection title="Location">
        <InfoRow label="Missouri City Dental" valueText="8027 Highway 6" />
        <InfoRow label="Parking" valueText="Free on-site" />
      </DetailSection>
    </>
  );
}

function CompletedDetailBody({ b, reviewed }) {
  return (
    <>
      <DetailHero label={reviewed ? 'Completed' : 'Completed · Awaiting your review'} title={b.dateLong} sub={`${b.timeRange} · ${b.hours} hours`} />
      <ProStrip b={b} />
      {reviewed ? (
        <>
          <DetailSection title="Your review">
            <ReviewBlock rating={b.yourRating} text={b.yourReview} date={b.yourReviewDate} />
          </DetailSection>
          {b.theirReview && (
            <DetailSection title={`${b.name.split(' ')[0]}'s review of your office`}>
              <ReviewBlock rating={b.theirRating} text={b.theirReview} date={b.theirReviewDate} />
            </DetailSection>
          )}
        </>
      ) : (
        <div style={{ background: COLORS.amberSoft, border: '1px solid #fce0bf', borderRadius: 14, padding: '16px 18px', marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.amber, lineHeight: 1.2 }}>Rate {b.name.split(' ')[0]}'s work</div>
            <div style={{ fontSize: 12, color: COLORS.amber, marginTop: 3, opacity: 0.85 }}>Help other offices find great pros</div>
          </div>
          <button style={{ background: COLORS.amber, color: 'white', border: 'none', borderRadius: 100, padding: '9px 14px', fontSize: 11, fontWeight: 800, fontFamily: "'Outfit', sans-serif", flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" style={{ width: 11, height: 11 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Rate
          </button>
        </div>
      )}
      <DetailSection title="Receipt">
        <ReceiptLine label="Hourly rate" amount={`$${b.hourlyRate.toFixed(2)}`} />
        <ReceiptLine label="Hours worked" amount={b.hours.toString()} />
        <ReceiptLine label="Platform fee" amount="$0.00" />
        <ReceiptLine label="Total paid" amount={`$${b.total.toFixed(2)}`} isTotal />
      </DetailSection>
    </>
  );
}

function DetailFooter({ type }) {
  const showCancel = type === 'pending' || type === 'upcoming' || type === 'rapid-fill';
  const showAddCal = type === 'upcoming';
  const showBookAgain = type === 'completed-reviewed' || type === 'completed-unrated';

  return (
    <div style={{ padding: '14px 20px 26px', borderTop: `1px solid ${COLORS.borderSoft}`, background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
      <button style={{ width: 52, height: 52, borderRadius: '50%', border: `1.5px solid ${COLORS.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label="Message">
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      {showCancel && (
        <button style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #fca5a5', background: COLORS.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label="Cancel">
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
      {showAddCal && (
        <button style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Add to calendar
        </button>
      )}
      {showBookAgain && (
        <button style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <polyline points="21 3 21 8 16 8" />
          </svg>
          Book again
        </button>
      )}
    </div>
  );
}

// ============================================================
// FILTER SHEET
// ============================================================
function FilterSheet({ filters, setFilters, onClose, resultCount }) {
  const [local, setLocal] = useState(filters);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const apply = () => { setFilters(local); onClose(); };
  const reset = () => setLocal({ role: 'All roles', amount: 'Any', needsReview: false, hideExpired: true });

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, animation: 'kaziOverlayFade 0.25s ease-out' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '28px 28px 0 0', zIndex: 201, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', animation: 'kaziSheetSlide 0.35s cubic-bezier(0.32, 0.72, 0, 1)', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '12px auto 4px', flexShrink: 0 }} />
        <div style={{ padding: '14px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.borderSoft}`, flexShrink: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.text, letterSpacing: '-0.3px' }}>Filter completed</div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <FilterGroup label="Role">
            <PillGroup options={['All roles', 'Hygienist', 'Assistant', 'Front Desk', 'Dentist']} selected={local.role} onSelect={(v) => setLocal({ ...local, role: v })} />
          </FilterGroup>
          <div style={{ height: 8, background: COLORS.bg }} />
          <FilterGroup label="Amount paid">
            <PillGroup options={['Any', 'Under $200', '$200–500', '$500+']} selected={local.amount} onSelect={(v) => setLocal({ ...local, amount: v })} />
          </FilterGroup>
          <div style={{ height: 8, background: COLORS.bg }} />
          <ToggleRow title="Needs my review" sub="Only show shifts I haven't rated yet" value={local.needsReview} onChange={(v) => setLocal({ ...local, needsReview: v })} isFirst />
          <ToggleRow title="Hide expired & declined" sub="Only show actual completed shifts" value={local.hideExpired} onChange={(v) => setLocal({ ...local, hideExpired: v })} />
          <div style={{ height: 20 }} />
        </div>
        <div style={{ padding: '14px 20px 26px', borderTop: `1px solid ${COLORS.borderSoft}`, background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={reset} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: COLORS.textMid, padding: '14px 4px', textDecoration: 'underline', flexShrink: 0 }}>Reset all</button>
          <button onClick={apply} style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Show {resultCount} shifts</button>
        </div>
      </div>
    </>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div style={{ padding: '20px 24px 18px' }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.text, marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  );
}

function PillGroup({ options, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const isSel = selected === opt;
        return (
          <button key={opt} onClick={() => onSelect(opt)} style={{ background: isSel ? COLORS.green : 'white', border: `1.5px solid ${isSel ? COLORS.green : COLORS.border}`, borderRadius: 100, padding: '10px 16px', fontSize: 12, fontWeight: 700, color: isSel ? 'white' : COLORS.textMid }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({ title, sub, value, onChange, isFirst }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: isFirst ? 'none' : `1px solid ${COLORS.borderSoft}` }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 3 }}>{sub}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{ position: 'relative', width: 46, height: 26, background: value ? COLORS.green : COLORS.border, borderRadius: 100, border: 'none', flexShrink: 0, padding: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'transform 0.2s', transform: value ? 'translateX(20px)' : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
      </button>
    </div>
  );
}

// ============================================================
// SHARED
// ============================================================
function DateBlock({ month, day }) {
  return (
    <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 9, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>{month}</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text, marginTop: 3, letterSpacing: '-0.5px' }}>{day}</div>
    </div>
  );
}

function Initials({ text }) {
  return (
    <div style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0, letterSpacing: '-0.3px' }}>
      {text}
    </div>
  );
}

function Avatar({ url, initials, size = 48 }) {
  if (url) {
    return (
      <img
        src={url}
        alt={initials || ''}
        style={{ width: size, height: size, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: `1px solid ${COLORS.borderSoft}` }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: size >= 48 ? 14 : 13, flexShrink: 0, letterSpacing: '-0.3px' }}>
      {initials}
    </div>
  );
}

function Sep() {
  return <span style={{ width: 2, height: 2, background: COLORS.textLight, borderRadius: '50%' }} />;
}

function StatusPill({ variant, children }) {
  const styles = {
    awaiting: { background: COLORS.amberSoft, color: COLORS.amber, border: '1px solid #fce0bf' },
    confirmed: { background: COLORS.green, color: 'white' },
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.4, padding: '5px 10px', borderRadius: 100, ...styles[variant] }}>
      {children}
    </span>
  );
}

function DetailHero({ label, title, sub }) {
  return (
    <>
      <div style={{ fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.6, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.text, lineHeight: 1.1, letterSpacing: '-0.6px' }}>{title}</div>
      <div style={{ fontSize: 14, color: COLORS.textMid, marginTop: 6 }}>{sub}</div>
    </>
  );
}

function InfoChip({ variant, children }) {
  const styles = {
    amber: { background: COLORS.amberSoft, border: '1px solid #fce0bf', color: COLORS.amber },
    green: { background: COLORS.greenTint, border: `1px solid ${COLORS.greenSoft}`, color: COLORS.green },
  };
  const stroke = variant === 'amber' ? COLORS.amber : COLORS.green;
  return (
    <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, ...styles[variant] }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function ProStrip({ b }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '16px 0', marginTop: 18, borderTop: `1px solid ${COLORS.borderSoft}`, borderBottom: `1px solid ${COLORS.borderSoft}`, cursor: 'pointer' }}>
      {b.avatarUrl ? (
        <img src={b.avatarUrl} alt={b.name} style={{ width: 50, height: 50, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: `1px solid ${COLORS.borderSoft}` }} />
      ) : (
        <div style={{ width: 50, height: 50, borderRadius: 14, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, flexShrink: 0, letterSpacing: '-0.3px' }}>
          {b.initials}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text, lineHeight: 1.1, letterSpacing: '-0.3px', marginBottom: 3 }}>{b.name}</div>
        <div style={{ fontSize: 12, color: COLORS.textMid, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{b.role}</span>
          {b.cred && <span style={{ background: COLORS.greenTint, color: COLORS.green, fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 100, letterSpacing: 0.2, fontFamily: "'Outfit', sans-serif" }}>{b.cred}</span>}
        </div>
      </div>
      <div style={{ color: COLORS.textLight, flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueText, valueGreen }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${COLORS.borderSoft}` }}>
      <div style={{ fontSize: 13, color: COLORS.textMid }}>{label}</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: valueText ? 12 : valueGreen ? 16 : 14, color: valueText ? COLORS.textMid : valueGreen ? COLORS.green : COLORS.text, textAlign: 'right' }}>
        {value || valueText}
      </div>
    </div>
  );
}

function ReceiptLine({ label, amount, isTotal }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: isTotal ? '14px 0 10px' : '10px 0', fontSize: isTotal ? 16 : 13, color: isTotal ? COLORS.text : COLORS.textMid, borderTop: isTotal ? `1px solid ${COLORS.borderSoft}` : 'none', marginTop: isTotal ? 6 : 0, fontFamily: isTotal ? "'Outfit', sans-serif" : "'DM Sans', sans-serif", fontWeight: isTotal ? 800 : 400 }}>
      <span>{label}</span>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: isTotal ? 800 : 700, color: isTotal ? COLORS.green : COLORS.text, fontSize: isTotal ? 18 : undefined }}>{amount}</span>
    </div>
  );
}

function ReviewBlock({ rating, text, date }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <div style={{ color: COLORS.gold, fontSize: 22, letterSpacing: 2 }}>★★★★★</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.text }}>{rating?.toFixed(1)}</div>
      </div>
      <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.55, fontStyle: 'italic' }}>"{text}"</div>
      <div style={{ fontSize: 10, color: COLORS.textLight, marginTop: 8, fontWeight: 600, letterSpacing: 0.3 }}>REVIEWED {date}</div>
    </>
  );
}
