import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import BookingSheet from '../components/BookingSheet';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import SuccessToast from '../components/SuccessToast';

// ============================================================
// Kazi - Find Professionals (Search Feed)
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  coral: '#e8734a',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  gold: '#f4b740',
};

const ROLE_FILTERS = ['All Roles', 'Dental Assistant', 'Hygienist', 'Front Desk', 'Dentist', 'Student Extern'];

// ============ Trust badges (matches ProfessionalProfile) ============
// Four Kazi credibility chips rendered on every pro card. The set
// each provider gets is deterministic from their id, so it stays
// consistent across renders but varies across pros.
const BADGE_ICONS = {
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
      <path d="M12 2l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4z" fill="currentColor" fillOpacity="0.22" />
      <polyline points="8.5 12.5 11 15 15.5 10.5" strokeWidth="2.4" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" />
      <path d="M17 5h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 5H5a2 2 0 0 0 0 4h2" />
      <line x1="9" y1="19" x2="15" y2="19" />
      <line x1="12" y1="15" x2="12" y2="19" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[22px] h-[22px]">
      <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />
    </svg>
  ),
  shuffle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px]">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
};

const BADGE_META = {
  check:   { label: 'Background checked', bg: '#f1f9f5', color: '#1a7f5e', border: '#e8f3ee' },
  trophy:  { label: 'Top 5%',              bg: '#fef6e4', color: '#c98b16', border: '#f7e6bd' },
  bolt:    { label: 'Rapid responder',     bg: '#fdeee7', color: '#e8734a', border: '#fad9c9' },
  shuffle: { label: 'Cross-trained',       bg: '#f1ebfa', color: '#7c3aed', border: '#e4d7f7' },
};

// Deterministic string hash → stable per-provider selection.
function hashId(id) {
  let h = 2166136261;
  const s = String(id || 'default');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Picks a realistic subset of badges for a provider. Background is
// near-universal, Top 5% is rare, Rapid responder is common,
// Cross-trained is moderately common.
function getBadgesForPro(id, { rating = 0, reliability = 0 } = {}) {
  const h = hashId(id);
  const list = [];
  if (h % 10 !== 0) list.push('check');              // ~90%
  if (rating >= 4.85 && reliability >= 95 && h % 4 === 0) list.push('trophy'); // rare
  if (h % 2 === 0) list.push('bolt');                // ~50%
  if (h % 3 !== 0) list.push('shuffle');             // ~67%
  return list;
}

function TrustBadgesRow({ proId, rating, reliability }) {
  const keys = getBadgesForPro(proId, { rating, reliability });
  if (keys.length === 0) return null;
  return (
    <div className="flex items-start gap-3 mt-3.5 pt-3.5 border-t border-[#f3f3f3]">
      {keys.map((k) => {
        const meta = BADGE_META[k];
        return (
          <div key={k} className="flex flex-col items-center gap-1 w-[60px]">
            <div
              aria-label={meta.label}
              className="w-10 h-10 rounded-full flex items-center justify-center border-[2.5px]"
              style={{ background: meta.bg, borderColor: meta.color, color: meta.color }}
            >
              {BADGE_ICONS[k]}
            </div>
            <span className="text-[10px] font-semibold text-center leading-tight text-[#5a5a5a]">
              {meta.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============ Reliability tier helper ============
const getReliabilityTier = (pct) => {
  if (pct >= 95) return { className: 'rel-excellent', bg: COLORS.greenTint, color: COLORS.green, border: COLORS.greenSoft };
  if (pct >= 85) return { className: 'rel-great', bg: '#f1ebfa', color: '#7c3aed', border: '#e4d7f7' };
  if (pct >= 70) return { className: 'rel-good', bg: '#fef3e6', color: '#d97706', border: '#fce0bf' };
  return { className: 'rel-low', bg: '#fdecec', color: '#dc2626', border: '#f9d4d4' };
};

// ============ Inline SVG icons ============
const Icon = {
  Filter: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
  Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Chevron: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]"><polyline points="9 18 15 12 9 6" /></svg>,
  Heart: ({ filled }) => <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]"><polyline points="20 6 9 17 4 12" /></svg>,
  Pin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[10px] h-[10px]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-[10px] h-[10px]"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>,
  Message: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  CalSmall: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px]"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  ChevronDown: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><polyline points="6 9 12 15 18 9" /></svg>,
};

// ============ Pro Card ============
function ProCard({ pro, onClick, onSave, onBook, onMessage }) {
  const [saved, setSaved] = useState(pro.saved);
  const [bioExpanded, setBioExpanded] = useState(false);
  const tier = getReliabilityTier(pro.reliability);

  useEffect(() => {
    setSaved(pro.saved);
  }, [pro.saved]);

  return (
    <div
      onClick={onClick}
      className="bg-white mx-4 mb-3 rounded-[20px] p-[18px] border border-[#f3f3f3] cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div className="flex gap-3.5 items-start">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {pro.avatarUrl ? (
            <img src={pro.avatarUrl} alt={pro.name} className="w-16 h-16 rounded-[18px] object-cover" />
          ) : (
            <div
              className="w-16 h-16 rounded-[18px] flex items-center justify-center text-white font-bold text-[22px]"
              style={{ background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)', fontFamily: "'Outfit', sans-serif" }}
            >
              {pro.initials}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] bg-[#1a7f5e] rounded-full flex items-center justify-center border-[2.5px] border-white text-white">
            <Icon.Check />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-0.5">
            <div>
              <div className="text-[21px] font-bold text-[#1a1a1a] leading-tight mb-[3px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {pro.name}
              </div>
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <span className="text-[13px] text-[#5a5a5a]">{pro.role}</span>
                {pro.creds.map((c) => (
                  <span key={c} className="bg-[#f1f9f5] text-[#1a7f5e] text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newSaved = !saved;
                setSaved(newSaved);
                if (onSave) onSave(pro.id, newSaved);
              }}
              className="p-1 flex-shrink-0"
              style={{ color: saved ? COLORS.coral : COLORS.textLight }}
            >
              <Icon.Heart filled={saved} />
            </button>
          </div>

          {/* Rating + distance */}
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-[#f4b740] text-[18px] leading-none">★</span>
            <span className="font-bold text-[#1a1a1a] text-[15px]">{pro.rating.toFixed(1)}</span>
            <span className="text-[#8a8a8a] text-sm">({pro.reviews})</span>
            <span className="text-[#ececec]">·</span>
            <span className="text-[#5a5a5a] flex items-center gap-1">
              <span className="text-[#8a8a8a]"><Icon.Pin /></span>
              {pro.distance}
            </span>
          </div>

          {/* Activity status */}
          <div
            className="inline-flex items-center gap-1 text-[11px] font-semibold mt-1"
            style={{ color: pro.isActive ? COLORS.green : COLORS.textLight }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${pro.isActive ? 'animate-pulse' : ''}`}
              style={{ background: pro.isActive ? COLORS.green : COLORS.textLight }}
            />
            {pro.activity}
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="flex gap-2 mt-3.5 pt-3.5 border-t border-[#f3f3f3]">
        <div className="flex-1 bg-[#f9f8f6] rounded-xl py-2.5 px-2 text-center">
          <div className="text-[9px] text-[#8a8a8a] uppercase tracking-wider font-semibold mb-0.5">Rate</div>
          <div className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{pro.rate}</div>
        </div>
        <div className="flex-1 bg-[#f9f8f6] rounded-xl py-2.5 px-2 text-center">
          <div className="text-[9px] text-[#8a8a8a] uppercase tracking-wider font-semibold mb-0.5">Bookings</div>
          <div className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{pro.bookings}</div>
        </div>
        <div
          className="flex-1 rounded-xl py-2.5 px-2 text-center border"
          style={{ background: tier.bg, borderColor: tier.border }}
        >
          <div className="text-[9px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: tier.color }}>Reliability</div>
          <div className="text-sm font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: tier.color }}>{pro.reliability}%</div>
        </div>
      </div>

      {/* About section — only renders if pro has a bio */}
      {pro.bio && pro.bio.trim() && (
        <div className="mt-3.5 pt-3.5 border-t border-[#f3f3f3]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[10px] h-[10px]"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#8a8a8a]">About</span>
          </div>
          <p className="text-[15px] leading-[1.6] text-[#3a3a3a]">
            {pro.bio.length > 260 && !bioExpanded
              ? pro.bio.slice(0, 260).trimEnd() + '…'
              : pro.bio}
            {pro.bio.length > 260 && (
              <button
                onClick={(e) => { e.stopPropagation(); setBioExpanded(!bioExpanded); }}
                className="ml-1 text-[#1a7f5e] font-bold text-[14px] hover:underline"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {bioExpanded ? 'See less' : 'See more'}
              </button>
            )}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-3.5">
        <button
          onClick={(e) => { e.stopPropagation(); if (onMessage) onMessage(pro); }}
          className="flex-1 py-2.5 px-4 rounded-full border border-[#ececec] bg-[#f9f8f6] text-[#1a1a1a] text-[13px] font-bold flex items-center justify-center gap-1.5"
        >
          <Icon.Message /> Message
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); if (onBook) onBook(pro); }}
          className="flex-1 py-2.5 px-4 rounded-full bg-[#1a7f5e] text-white text-[13px] font-bold flex items-center justify-center gap-1.5"
        >
          <Icon.CalSmall /> Book
        </button>
      </div>
    </div>
  );
}

// ============ Booking Sheet (Date/Time/Lunch) ============
function BookingCriteriaSheet({ open, onClose, onApply }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

  const startTimes = ['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM'];
  const endTimes = ['3:00 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '7:00 PM'];
  const [startIdx, setStartIdx] = useState(2);
  const [endIdx, setEndIdx] = useState(3);
  const [lunchOn, setLunchOn] = useState(true);
  const [lunchMins, setLunchMins] = useState(45);

  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const parseTime = (str) => {
    const [time, mer] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (mer === 'PM' && h !== 12) h += 12;
    if (mer === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const totalMins = () => {
    let m = parseTime(endTimes[endIdx]) - parseTime(startTimes[startIdx]);
    if (lunchOn) m -= lunchMins;
    return Math.max(0, m);
  };

  const totalDisplay = () => {
    const m = totalMins();
    const h = Math.floor(m / 60);
    const r = m % 60;
    return `${h}h${r ? ` ${r}m` : ''}`;
  };

  const buildDates = () => {
    const cells = [];
    const isCurrent = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    const startDay = isCurrent ? today.getDate() : 1;
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let day = startDay; day <= lastDay; day++) {
      cells.push(new Date(viewYear, viewMonth, day));
    }
    return cells;
  };

  const changeMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    if (y < today.getFullYear() || (y === today.getFullYear() && m < today.getMonth())) return;
    const max = new Date(today.getFullYear(), today.getMonth() + 6, 1);
    if (y > max.getFullYear() || (y === max.getFullYear() && m > max.getMonth())) return;
    setViewYear(y);
    setViewMonth(m);
  };

  const isDateSelected = (d) =>
    d.getFullYear() === selectedDate.getFullYear() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getDate() === selectedDate.getDate();

  const isCurrentMonthView = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-[101] max-h-[90vh] overflow-y-auto transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'} sm:max-w-[480px] sm:left-1/2 sm:-translate-x-1/2`}
        style={{ transform: open ? (window.innerWidth >= 600 ? 'translate(-50%, 0)' : 'translateY(0)') : (window.innerWidth >= 600 ? 'translate(-50%, 100%)' : 'translateY(100%)') }}
      >
        <div className="w-10 h-1 bg-[#ececec] rounded-full mx-auto mt-3 mb-1" />
        <div className="px-6 pt-3 pb-5 flex items-center justify-between">
          <div className="text-[22px] font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>Booking details</div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#1a1a1a]">
            <Icon.Close />
          </button>
        </div>

        {/* Month nav */}
        <div className="px-6 pb-5">
          <div className="flex items-center justify-between mb-3.5">
            <button
              onClick={() => changeMonth(-1)}
              disabled={isCurrentMonthView}
              className="w-9 h-9 rounded-full bg-[#f9f8f6] border border-[#f3f3f3] flex items-center justify-center disabled:opacity-35"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <div className="text-[17px] font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{fullMonths[viewMonth]} {viewYear}</div>
            <button onClick={() => changeMonth(1)} className="w-9 h-9 rounded-full bg-[#f9f8f6] border border-[#f3f3f3] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-6 px-6 scrollbar-hide">
            {buildDates().map((d, idx) => {
              const sel = isDateSelected(d);
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(d)}
                  className={`flex-shrink-0 w-[60px] py-3 px-2 rounded-2xl border-[1.5px] text-center cursor-pointer ${sel ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'bg-[#f9f8f6] border-[#f3f3f3]'}`}
                >
                  <div className={`text-[10px] font-bold uppercase tracking-wide ${sel ? 'text-white' : 'text-[#8a8a8a]'}`}>{days[d.getDay()]}</div>
                  <div className={`text-[22px] font-bold mt-1 leading-none ${sel ? 'text-white' : 'text-[#1a1a1a]'}`} style={{ fontFamily: "'Outfit', sans-serif" }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Time pickers */}
        <div className="px-6 pb-5">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">Shift hours</div>
          <div className="grid grid-cols-2 gap-2.5">
            <div onClick={() => setStartIdx((startIdx + 1) % startTimes.length)} className="bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl px-4 py-3.5 cursor-pointer">
              <div className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider">Start time</div>
              <div className="text-[18px] font-bold mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{startTimes[startIdx]}</div>
            </div>
            <div onClick={() => setEndIdx((endIdx + 1) % endTimes.length)} className="bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl px-4 py-3.5 cursor-pointer">
              <div className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider">End time</div>
              <div className="text-[18px] font-bold mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{endTimes[endIdx]}</div>
            </div>
          </div>
        </div>

        {/* Lunch break */}
        <div className="px-6 pb-5">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">Lunch break</div>
          <div className="bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Provide a lunch break</div>
                <div className="text-[11px] text-[#8a8a8a] mt-0.5">Unpaid break during the shift</div>
              </div>
              <button
                onClick={() => setLunchOn(!lunchOn)}
                className={`relative w-[46px] h-[26px] rounded-full transition-colors ${lunchOn ? 'bg-[#1a7f5e]' : 'bg-[#ececec]'}`}
              >
                <div className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform ${lunchOn ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {lunchOn && (
              <div className="mt-3.5 pt-3.5 border-t border-[#f3f3f3]">
                <div className="flex gap-2 flex-wrap">
                  {[30, 45, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setLunchMins(m)}
                      className={`px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] ${lunchMins === m ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]' : 'bg-white text-[#5a5a5a] border-[#ececec]'}`}
                    >
                      {m === 60 ? '1 hour' : `${m} min`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 pt-4 pb-7 border-t border-[#f3f3f3]">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-[#8a8a8a] font-semibold">Total shift</span>
            <span className="font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{totalDisplay()}</span>
          </div>
          <button
            onClick={() => onApply({ date: selectedDate, start: startTimes[startIdx], end: endTimes[endIdx], lunchOn, lunchMins })}
            className="w-full bg-[#1a7f5e] text-white rounded-full py-4 font-bold text-[15px]"
          >
            Show available professionals
          </button>
        </div>
      </div>
    </>
  );
}

// ============ Main Page ============
export default function FindProfessionals() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All Roles');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [criteriaLabel, setCriteriaLabel] = useState('Add date & time');
  const [criteriaDate, setCriteriaDate] = useState(null);
  const [criteriaStart, setCriteriaStart] = useState(null);
  const [criteriaEnd, setCriteriaEnd] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);


  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [officeId, setOfficeId] = useState(null);
  const [bookingPro, setBookingPro] = useState(null);
  const [bookingSentName, setBookingSentName] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Rapid Fill mode
  const searchParams = new URLSearchParams(window.location.search);
  const isRapidFill = searchParams.get('rapidfill') === '1';

  // Pre-applied filters from FindProsSheet (URL params)
  const [preRole, setPreRole] = useState(null);
  const [preDate, setPreDate] = useState(null);
  const [preStart, setPreStart] = useState(null);
  const [preEnd, setPreEnd] = useState(null);
  const [preLunch, setPreLunch] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('role');
    const d = params.get('date');
    const s = params.get('startTime');
    const e = params.get('endTime');
    const l = params.get('lunch');
    if (r) {
      setPreRole(r);
      // Map sheet role to activeFilter value
      const roleMap = { 'Hygienist': 'Hygienist', 'Assistant': 'Dental Assistant', 'Front Desk': 'Front Desk', 'Dentist': 'Dentist' };
      if (roleMap[r]) setActiveFilter(roleMap[r]);
    }
    if (d) {
      setPreDate(d);
      const parsed = new Date(d + 'T12:00:00');
      if (!isNaN(parsed.getTime())) setCriteriaDate(parsed);
    }
    if (s) setPreStart(s);
    if (e) setPreEnd(e);
    if (l) setPreLunch(l);
    if (d || s || e) {
      const parts = [];
      if (d) {
        const parsed = new Date(d + 'T12:00:00');
        if (!isNaN(parsed.getTime())) parts.push(parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      const fmt12 = (t) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); const ampm = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`; };
      if (s && e) parts.push(`${fmt12(s)} – ${fmt12(e)}`);
      if (parts.length > 0) setCriteriaLabel(parts.join(' · '));
    }
  }, []);
  const [rfBackups, setRfBackups] = useState([]);
  const [rfContext, setRfContext] = useState(null);

  useEffect(() => {
    if (!isRapidFill) return;
    try {
      const ctx = sessionStorage.getItem('kazi_rapid_context');
      if (ctx) setRfContext(JSON.parse(ctx));
      const stored = sessionStorage.getItem('kazi_rapid_backups');
      if (stored) setRfBackups(JSON.parse(stored));
    } catch {}
  }, [isRapidFill]);

  const toggleRfBackup = (pro) => {
    setRfBackups(prev => {
      const exists = prev.find(b => b.id === pro.id);
      if (exists) return prev.filter(b => b.id !== pro.id);
      if (prev.length >= 9) return prev;
      return [...prev, { id: pro.id, name: pro.name, initials: pro.initials }];
    });
  };

  const handleRfDone = () => {
    sessionStorage.setItem('kazi_rapid_backups', JSON.stringify(rfBackups));
    sessionStorage.setItem('kazi_rapid_return', '1');
    navigate(-1);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [prosRes, meRes] = await Promise.all([
          fetch(`${API_URL}/api/providers?page=${currentPage}&limit=10`, { headers }),
          fetch(`${API_URL}/api/offices/me`, { headers }).catch(() => null),
        ]);
        if (prosRes.ok) {
          const json = await prosRes.json();
          // Handle both paginated { providers, total, ... } and legacy array responses
          const data = Array.isArray(json) ? json : json.providers || [];
          if (!Array.isArray(json)) {
            setTotalPages(json.totalPages || 1);
            setTotalCount(json.total || data.length);
          } else {
            setTotalCount(data.length);
          }
          const ROLE_MAP = { hygienist: 'Dental Hygienist', assistant: 'Dental Assistant', front: 'Front Desk', dentist: 'Dentist', specialist: 'Specialist' };
          const transformed = data.map(p => {
            const u = p.user || {};
            const firstName = u.firstName || '';
            const lastName = u.lastName || '';
            const isDentist = p.role === 'dentist';
            const displayName = lastName ? `${isDentist ? 'Dr. ' : ''}${firstName} ${lastName.charAt(0)}.` : (firstName || 'Unknown');
            const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || '??';
            return {
              id: p.id,
              name: displayName,
              initials,
              role: ROLE_MAP[p.role] || p.role || 'Professional',
              creds: (p.credentials || []).map(c => c.type).slice(0, 3),
              rating: p.avgRating || 0,
              reviews: p.reviewCount || 0,
              distance: `${(Math.random() * 18 + 0.5).toFixed(0)} mi`,
              activity: 'Active recently',
              isActive: true,
              rate: p.hourlyRate ? `$${p.hourlyRate}/hr` : '$0/hr',
              bookings: p.shiftsCompleted || 0,
              reliability: p.reliabilityScore || 100,
              badges: ['Background Verified', ...(p.skills || []).slice(0, 2)],
              avatarUrl: u.avatarUrl || null,
              bio: p.bio || null,
              saved: false,
            };
          });
          setProfessionals(transformed);
        }
        if (meRes?.ok) {
          const meData = await meRes.json();
          setOfficeId(meData.id);
          const savedRes = await fetch(`${API_URL}/api/offices/${meData.id}/saved-providers`, { headers });
          if (savedRes.ok) {
            const savedData = await savedRes.json();
            setSavedIds(savedData.map(s => s.providerId));
          }
        }
      } catch (err) { console.error('Fetch error:', err); }
      setLoading(false);
    };
    fetchData();
  }, [getToken, currentPage]);

  const filtered = professionals.filter(p => {
    if (activeFilter === 'All Roles') return true;
    if (activeFilter === 'Hygienist' && p.role === 'Dental Hygienist') return true;
    if (activeFilter === p.role) return true;
    return false;
  });

  const handleApplyCriteria = ({ date, start, end }) => {
    const opts = { month: 'short', day: 'numeric' };
    const d = date.toLocaleDateString('en-US', opts);
    setCriteriaLabel(`${d} · ${start} – ${end}`);
    setCriteriaDate(date);
    setCriteriaStart(start);
    setCriteriaEnd(end);
    setSheetOpen(false);
  };

  const handleSavePro = async (proId, saving) => {
    if (!officeId) return;
    try {
      const token = await getToken();
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      if (saving) {
        await fetch(`${API_URL}/api/offices/${officeId}/save-provider`, { method: 'POST', headers, body: JSON.stringify({ providerId: proId }) });
        setSavedIds(prev => [...prev, proId]);
      } else {
        await fetch(`${API_URL}/api/offices/${officeId}/save-provider/${proId}`, { method: 'DELETE', headers });
        setSavedIds(prev => prev.filter(id => id !== proId));
      }
    } catch {}
  };

  return (
    <div className="bg-[#f9f8f6] min-h-screen pb-28" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <TopBar role="office" />
      {/* Rapid Fill banner */}
      {isRapidFill && (
        <div className="bg-[#1a7f5e] px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" className="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-bold">Rapid Fill Mode</div>
            <div className="text-white/75 text-xs">
              {rfContext?.primary ? `Backups for ${rfContext.primary} · ` : ''}Select up to 9 professionals
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="text-white/75 text-xs font-bold underline flex-shrink-0">Cancel</button>
        </div>
      )}

      {/* Top bar */}
      <div className="bg-white px-5 pt-3 pb-3 border-b border-[#f3f3f3] sticky top-0 z-50">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <div className="text-[22px] font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>Find Professionals</div>
            <div className="text-xs text-[#8a8a8a] mt-0.5">Houston, TX · 12 mile radius</div>
          </div>
          <button onClick={() => setFilterOpen(true)} className="w-10 h-10 rounded-full bg-[#f9f8f6] flex items-center justify-center relative">
            <Icon.Filter />
          </button>
        </div>

        {/* Search trigger */}
        <button
          onClick={() => setSheetOpen(true)}
          className="w-full px-4 py-3.5 bg-[#f9f8f6] border border-[#f3f3f3] rounded-full flex items-center gap-3 active:scale-[0.99] transition-transform mb-3"
        >
          <span className="text-[#8a8a8a]"><Icon.Calendar /></span>
          <span className={`flex-1 text-left text-sm ${criteriaLabel === 'Add date & time' ? 'text-[#8a8a8a] font-medium' : 'text-[#1a1a1a] font-semibold'}`}>
            {criteriaLabel}
          </span>
          <span className="text-[#8a8a8a]"><Icon.Chevron /></span>
        </button>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
          {ROLE_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap border ${
                activeFilter === f
                  ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]'
                  : 'bg-[#f9f8f6] text-[#5a5a5a] border-[#f3f3f3]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results meta */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="text-[13px] text-[#5a5a5a]"><strong className="text-[#1a1a1a] font-bold">{totalCount}</strong> available professionals</div>
        <button className="text-[13px] font-bold text-[#1a7f5e] flex items-center gap-1">
          Best Match <Icon.ChevronDown />
        </button>
      </div>

      {/* Active filter chips from URL params */}
      {(preRole || preDate || preStart || preEnd || preLunch) && (
        <div className="px-5 pb-2 pt-1" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {preRole && (
            <button
              onClick={() => { setPreRole(null); setActiveFilter('All Roles'); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f9f5', border: '1.5px solid #e8f3ee', color: '#1a7f5e', borderRadius: 100, padding: '7px 12px 7px 14px', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
            >
              {preRole}
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
          {preDate && (
            <button
              onClick={() => { setPreDate(null); setCriteriaDate(null); setCriteriaLabel('Add date & time'); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f9f5', border: '1.5px solid #e8f3ee', color: '#1a7f5e', borderRadius: 100, padding: '7px 12px 7px 14px', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
            >
              {new Date(preDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
          {preStart && preEnd && (
            <button
              onClick={() => { setPreStart(null); setPreEnd(null); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f9f5', border: '1.5px solid #e8f3ee', color: '#1a7f5e', borderRadius: 100, padding: '7px 12px 7px 14px', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
            >
              {(() => { const fmt = (t) => { const [h, m] = t.split(':').map(Number); const ampm = h >= 12 ? 'PM' : 'AM'; return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}${ampm.toLowerCase().slice(0,1)}`; }; return `${fmt(preStart)}–${fmt(preEnd)}`; })()}
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
          {preLunch && (
            <button
              onClick={() => setPreLunch(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f1f9f5', border: '1.5px solid #e8f3ee', color: '#1a7f5e', borderRadius: 100, padding: '7px 12px 7px 14px', fontSize: 12, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}
            >
              {preLunch === '60' ? '1hr lunch' : `${preLunch}min lunch`}
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#e8f3ee] border-t-[#1a7f5e] rounded-full animate-spin mb-3" />
          <div className="text-sm text-[#8a8a8a] font-medium">Loading professionals...</div>
        </div>
      )}

      {/* Cards */}
      {!loading && filtered.map((pro) => {
        const isSelected = isRapidFill && rfBackups.some(b => b.id === pro.id);
        const isPrimary = isRapidFill && rfContext?.primary && pro.name === rfContext.primary;
        return (
          <div key={pro.id} className="relative">
            {isRapidFill && (
              <div className={`absolute top-5 left-7 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                isPrimary ? 'bg-[#1a7f5e] border-[#1a7f5e]' : isSelected ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'bg-white border-[#d1d5db]'
              }`}>
                {(isSelected || isPrimary) && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" className="w-3 h-3"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </div>
            )}
            <ProCard
              pro={{...pro, saved: savedIds.includes(pro.id)}}
              onClick={() => {
                if (isRapidFill) {
                  if (!isPrimary) toggleRfBackup(pro);
                } else {
                  navigate(`/professionals/${pro.id}`);
                }
              }}
              onSave={isRapidFill ? undefined : handleSavePro}
              onBook={isRapidFill ? undefined : (p) => setBookingPro(p)}
              onMessage={isRapidFill ? undefined : (p) => navigate(`/messages/${p.id}`, { state: { mock: { id: p.id, name: p.name, initials: p.initials, avatarUrl: p.avatarUrl, role: p.role } } })}
            />
          </div>
        );
      })}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="text-lg font-bold text-[#1a1a1a] mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>No professionals found</div>
          <div className="text-sm text-[#8a8a8a]">Try adjusting your filters or check back later.</div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-5 py-6">
          <button
            onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full bg-white border border-[#ececec] flex items-center justify-center disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(p => {
              if (totalPages <= 7) return true;
              if (p === 1 || p === totalPages) return true;
              if (Math.abs(p - currentPage) <= 1) return true;
              return false;
            })
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-2">
                  {showEllipsis && <span className="text-[#8a8a8a] font-bold">…</span>}
                  <button
                    onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`min-w-[40px] h-10 rounded-full text-[13px] font-bold transition-colors ${
                      currentPage === p
                        ? 'bg-[#1a7f5e] text-white'
                        : 'bg-white text-[#1a1a1a] border border-[#ececec]'
                    }`}
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {p}
                  </button>
                </span>
              );
            })}
          <button
            onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full bg-white border border-[#ececec] flex items-center justify-center disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>
      )}

      <BookingCriteriaSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onApply={handleApplyCriteria} />

      {/* Filter Bottom Sheet */}
      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} />

      {/* Booking sheet — opens from Book button on ProCard */}
      {bookingPro && (
        <BookingSheet
          open={!!bookingPro}
          onClose={() => setBookingPro(null)}
          pro={{ name: bookingPro.name, firstName: bookingPro.name.split(' ')[0], initials: bookingPro.initials, avatarUrl: bookingPro.avatarUrl, rate: parseFloat((bookingPro.rate || '$0').replace(/[^0-9.]/g, '')) || 0 }}
          selectedDate={criteriaDate || null}
          backups={[]}
          onLaunchRapidFill={() => {}}
          onSend={() => { const name = bookingPro.name; setBookingPro(null); setBookingSentName(name); }}
        />
      )}

      <SuccessToast
        open={!!bookingSentName}
        title="Booking request sent"
        subtitle={bookingSentName ? `${bookingSentName} will be notified and has 24 hours to respond.` : ''}
        onClose={() => setBookingSentName(null)}
      />

      {/* Rapid Fill bottom bar */}
      {isRapidFill && (
        <div className="fixed bottom-0 left-0 right-0 bg-white px-5 pt-3.5 pb-7 border-t border-[#f3f3f3] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-3">
            {rfBackups.length > 0 ? (
              <>
                <div className="flex items-center">
                  {rfBackups.slice(0, 5).map((b, i) => (
                    <div
                      key={b.id}
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white"
                      style={{ background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)', marginLeft: i === 0 ? 0 : -6, fontFamily: "'Outfit', sans-serif" }}
                    >
                      {b.initials}
                    </div>
                  ))}
                  {rfBackups.length > 5 && (
                    <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white bg-[#1a7f5e]" style={{ marginLeft: -6 }}>
                      +{rfBackups.length - 5}
                    </div>
                  )}
                </div>
                <span className="text-sm font-semibold text-[#1a1a1a]">{rfBackups.length} backup{rfBackups.length !== 1 ? 's' : ''} selected</span>
              </>
            ) : (
              <span className="text-sm text-[#8a8a8a]">Tap professionals to add as backups</span>
            )}
          </div>
          <button
            onClick={handleRfDone}
            disabled={rfBackups.length === 0}
            className={`w-full py-4 rounded-full font-bold text-[15px] transition-colors ${
              rfBackups.length > 0
                ? 'bg-[#1a7f5e] text-white'
                : 'bg-[#f3f3f3] text-[#8a8a8a] cursor-not-allowed'
            }`}
          >
            {rfBackups.length > 0 ? `Done — ${rfBackups.length} backup${rfBackups.length !== 1 ? 's' : ''} added` : 'Select at least 1 backup'}
          </button>
        </div>
      )}
      {!isRapidFill && <BottomNav />}
    </div>
  );
}

// ============================================================
// FILTER SHEET COMPONENT
// ============================================================

function FilterSheet({ open, onClose }) {
  const [distance, setDistance] = useState('12 mi');
  const [rateMin, setRateMin] = useState(22);
  const [rateMax, setRateMax] = useState(48);
  const [reliability, setReliability] = useState('Excellent 95%+');
  const [experience, setExperience] = useState('Any');
  const [credentials, setCredentials] = useState(['RDA', 'BLS CPR']);
  const [software, setSoftware] = useState(['Dentrix']);
  const [bgVerified, setBgVerified] = useState(true);
  const [active24h, setActive24h] = useState(true);
  const [savedOnly, setSavedOnly] = useState(false);
  const [withPhoto, setWithPhoto] = useState(false);

  const [credOpen, setCredOpen] = useState(false);
  const [softOpen, setSoftOpen] = useState(false);

  const resetAll = () => {
    setDistance('12 mi');
    setRateMin(15);
    setRateMax(80);
    setReliability('Any');
    setExperience('Any');
    setCredentials([]);
    setSoftware([]);
    setBgVerified(false);
    setActive24h(false);
    setSavedOnly(false);
    setWithPhoto(false);
  };

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes kaziFilterSlideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes kaziFilterFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .kazi-filter-sheet .scroll-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          animation: 'kaziFilterFadeIn 0.25s ease-out',
        }}
      />

      <div
        className="kazi-filter-sheet"
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480, background: '#ffffff',
          borderRadius: '28px 28px 0 0', zIndex: 101, maxHeight: '92vh',
          display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif",
          animation: 'kaziFilterSlideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ width: 40, height: 4, background: '#ececec', borderRadius: 100, margin: '12px auto 4px', flexShrink: 0 }} />

        <div style={{ padding: '14px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f3f3f3', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#1a1a1a', letterSpacing: '-0.3px' }}>Filters</div>
          <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'inherit' }} aria-label="Close filters">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          <FilterGroup label="Distance" value={distance}>
            <FilterPills options={['5 mi', '10 mi', '12 mi', '25 mi', '50 mi']} selected={distance} onSelect={setDistance} />
          </FilterGroup>
          <FilterDivider />
          <FilterGroup label="Hourly rate" value={`$${rateMin} – $${rateMax}`}>
            <RangeSlider min={15} max={80} valueMin={rateMin} valueMax={rateMax} onChange={(lo, hi) => { setRateMin(lo); setRateMax(hi); }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8a8a8a', fontWeight: 600, marginTop: 8 }}><span>$15</span><span>$80+</span></div>
          </FilterGroup>
          <FilterDivider />
          <FilterGroup label="Reliability" sub="Filter by Kazi's trust score">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <ReliabilityPill label="Excellent 95%+" tier="excellent" selected={reliability === 'Excellent 95%+'} onClick={() => setReliability('Excellent 95%+')} />
              <ReliabilityPill label="Great 85%+" tier="great" selected={reliability === 'Great 85%+'} onClick={() => setReliability('Great 85%+')} />
              <ReliabilityPill label="Good 70%+" tier="good" selected={reliability === 'Good 70%+'} onClick={() => setReliability('Good 70%+')} />
              <ReliabilityPill label="Any" tier="any" selected={reliability === 'Any'} onClick={() => setReliability('Any')} />
            </div>
          </FilterGroup>
          <FilterDivider />
          <FilterGroup label="Years of experience">
            <FilterPills options={['Any', '1+ yrs', '3+ yrs', '5+ yrs', '10+ yrs']} selected={experience} onSelect={setExperience} />
          </FilterGroup>
          <FilterDivider />
          <FilterGroup label="Credentials">
            <MultiSelectDropdown open={credOpen} onToggle={() => setCredOpen(!credOpen)} options={['RDA', 'EFDA', 'RDH', 'CDA', 'BLS CPR', 'Radiology', 'Nitrous Monitoring', 'Coronal Polishing']} selected={credentials} onChange={setCredentials} placeholder="Any credentials" />
          </FilterGroup>
          <FilterDivider />
          <FilterGroup label="Practice software" sub="Pros experienced with your system">
            <MultiSelectDropdown open={softOpen} onToggle={() => setSoftOpen(!softOpen)} options={['Dentrix', 'Eaglesoft', 'Open Dental', 'Curve', 'Denticon', 'Carestream']} selected={software} onChange={setSoftware} placeholder="Any software" />
          </FilterGroup>
          <FilterDivider />
          <ToggleRow title="Background verified only" sub="Pros with current background checks" value={bgVerified} onChange={setBgVerified} isFirst />
          <ToggleRow title="Active in last 24 hours" sub="More likely to accept your booking" value={active24h} onChange={setActive24h} />
          <ToggleRow title="Saved professionals only" sub="Show only your favorites" value={savedOnly} onChange={setSavedOnly} />
          <ToggleRow title="Profile photo" sub="Only show pros with a photo" value={withPhoto} onChange={setWithPhoto} />
          <div style={{ height: 20 }} />
        </div>

        <div style={{ padding: '14px 20px 26px', borderTop: '1px solid #f3f3f3', background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={resetAll} style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#5a5a5a', cursor: 'pointer', padding: '14px 4px', textDecoration: 'underline', flexShrink: 0 }}>Reset all</button>
          <button onClick={onClose} style={{ flex: 1, background: '#1a7f5e', color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>Show 247 professionals</button>
        </div>
      </div>
    </>
  );
}

function FilterGroup({ label, sub, value, children }) {
  return (
    <div style={{ padding: '20px 24px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: sub ? 2 : 12 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: '#1a1a1a' }}>{label}</div>
        {value != null && <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: '#1a7f5e' }}>{value}</div>}
      </div>
      {sub && <div style={{ fontSize: 12, color: '#8a8a8a', marginBottom: 12, lineHeight: 1.4 }}>{sub}</div>}
      {children}
    </div>
  );
}

function FilterDivider() {
  return <div style={{ height: 8, background: '#f9f8f6' }} />;
}

function FilterPills({ options, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const isSel = selected === opt;
        return (
          <button key={opt} onClick={() => onSelect(opt)} style={{ background: isSel ? '#1a7f5e' : '#ffffff', border: `1.5px solid ${isSel ? '#1a7f5e' : '#ececec'}`, borderRadius: 100, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: isSel ? 'white' : '#5a5a5a', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{opt}</button>
        );
      })}
    </div>
  );
}

function ReliabilityPill({ label, tier, selected, onClick }) {
  const tierColors = { excellent: { bg: '#1a7f5e', border: '#1a7f5e' }, great: { bg: '#7c3aed', border: '#7c3aed' }, good: { bg: '#d97706', border: '#d97706' }, any: { bg: '#1a7f5e', border: '#1a7f5e' } };
  const c = tierColors[tier];
  return (
    <button onClick={onClick} style={{ background: selected ? c.bg : '#ffffff', border: `1.5px solid ${selected ? c.border : '#ececec'}`, borderRadius: 100, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: selected ? 'white' : '#5a5a5a', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>{label}</button>
  );
}

function MultiSelectDropdown({ open, onToggle, options, selected, onChange, placeholder }) {
  const toggle = (opt) => { if (selected.includes(opt)) onChange(selected.filter((x) => x !== opt)); else onChange([...selected, opt]); };
  const summary = selected.length > 0 ? selected.join(', ') : placeholder;
  const hasSelection = selected.length > 0;
  return (
    <div style={{ background: '#ffffff', border: `1.5px solid ${open ? '#1a7f5e' : '#ececec'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.15s' }}>
      <div onClick={onToggle} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 10 }}>
        <div style={{ flex: 1, fontSize: 13, fontWeight: hasSelection ? 700 : 500, color: hasSelection ? '#1a1a1a' : '#8a8a8a', fontFamily: hasSelection ? "'Outfit', sans-serif" : "'DM Sans', sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{summary}</div>
        <svg viewBox="0 0 24 24" fill="none" stroke={open ? '#1a7f5e' : '#8a8a8a'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      {open && (
        <div style={{ borderTop: '1px solid #f3f3f3', padding: '4px 0', maxHeight: 240, overflowY: 'auto' }}>
          {options.map((opt) => {
            const isSel = selected.includes(opt);
            return (
              <div key={opt} onClick={() => toggle(opt)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', cursor: 'pointer' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: isSel ? '#1a7f5e' : 'white', border: `1.5px solid ${isSel ? '#1a7f5e' : '#ececec'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isSel && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a' }}>{opt}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ToggleRow({ title, sub, value, onChange, isFirst }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: isFirst ? 'none' : '1px solid #f3f3f3' }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Outfit', sans-serif" }}>{title}</div>
        <div style={{ fontSize: 11, color: '#8a8a8a', marginTop: 2 }}>{sub}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{ position: 'relative', width: 46, height: 26, background: value ? '#1a7f5e' : '#ececec', borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0, padding: 0 }} aria-label={title}>
        <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'transform 0.2s', transform: value ? 'translateX(20px)' : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
      </button>
    </div>
  );
}

function RangeSlider({ min, max, valueMin, valueMax, onChange }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const pctMin = ((valueMin - min) / (max - min)) * 100;
  const pctMax = ((valueMax - min) / (max - min)) * 100;
  const setFromX = useCallback((clientX, handle) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    let pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const value = Math.round(min + pct * (max - min));
    if (handle === 'min') onChange(Math.min(value, valueMax - 1), valueMax);
    else onChange(valueMin, Math.max(value, valueMin + 1));
  }, [min, max, valueMin, valueMax, onChange]);
  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => { const clientX = e.touches ? e.touches[0].clientX : e.clientX; setFromX(clientX, dragging); };
    const handleUp = () => setDragging(null);
    document.addEventListener('mousemove', handleMove); document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove, { passive: true }); document.addEventListener('touchend', handleUp);
    return () => { document.removeEventListener('mousemove', handleMove); document.removeEventListener('mouseup', handleUp); document.removeEventListener('touchmove', handleMove); document.removeEventListener('touchend', handleUp); };
  }, [dragging, setFromX]);
  return (
    <div ref={trackRef} style={{ position: 'relative', height: 6, background: '#f9f8f6', borderRadius: 100, margin: '22px 12px 8px' }}>
      <div style={{ position: 'absolute', height: '100%', background: '#1a7f5e', borderRadius: 100, left: `${pctMin}%`, right: `${100 - pctMax}%` }} />
      <div onMouseDown={() => setDragging('min')} onTouchStart={() => setDragging('min')} style={{ position: 'absolute', top: '50%', left: `${pctMin}%`, width: 22, height: 22, background: 'white', border: '3px solid #1a7f5e', borderRadius: '50%', transform: 'translate(-50%, -50%)', cursor: 'grab', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', touchAction: 'none' }} />
      <div onMouseDown={() => setDragging('max')} onTouchStart={() => setDragging('max')} style={{ position: 'absolute', top: '50%', left: `${pctMax}%`, width: 22, height: 22, background: 'white', border: '3px solid #1a7f5e', borderRadius: '50%', transform: 'translate(-50%, -50%)', cursor: 'grab', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', touchAction: 'none' }} />
    </div>
  );
}

// ============================================================
// END FILTER SHEET COMPONENT
// ============================================================
