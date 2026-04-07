import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Nav from '../components/Nav';

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
function ProCard({ pro, onClick, onSave }) {
  const [saved, setSaved] = useState(pro.saved);
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
          <div
            className="w-16 h-16 rounded-[18px] flex items-center justify-center text-white font-bold text-[22px]"
            style={{ background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)', fontFamily: "'Outfit', sans-serif" }}
          >
            {pro.initials}
          </div>
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

      {/* Trust badges */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {pro.badges.map((badge, idx) => {
          const isPurple = badge.toLowerCase().startsWith('top');
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border"
              style={{
                background: isPurple ? '#f1ebfa' : COLORS.greenTint,
                color: isPurple ? '#7c3aed' : COLORS.green,
                borderColor: isPurple ? '#e4d7f7' : COLORS.greenSoft,
              }}
            >
              {idx === 0 && <span style={{ color: isPurple ? '#7c3aed' : COLORS.green }}><Icon.Shield /></span>}
              {badge}
            </span>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3.5">
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex-1 py-2.5 px-4 rounded-full border border-[#ececec] bg-[#f9f8f6] text-[#1a1a1a] text-[13px] font-bold flex items-center justify-center gap-1.5"
        >
          <Icon.Message /> Message
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
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
  const [filterOpen, setFilterOpen] = useState(false);

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);
  const [officeId, setOfficeId] = useState(null);

  // Rapid Fill mode
  const searchParams = new URLSearchParams(window.location.search);
  const isRapidFill = searchParams.get('rapidfill') === '1';
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
          fetch(`${API_URL}/api/providers`, { headers }),
          fetch(`${API_URL}/api/offices/me`, { headers }).catch(() => null),
        ]);
        if (prosRes.ok) {
          const data = await prosRes.json();
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
  }, [getToken]);

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
    <div className="bg-[#f9f8f6] min-h-screen pb-20" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Nav />

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
      <div className="bg-white px-5 pt-4 pb-3 border-b border-[#f3f3f3] sticky top-0 z-50">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <div className="text-[22px] font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>Find Professionals</div>
            <div className="text-xs text-[#8a8a8a] mt-0.5">Houston, TX · 12 mile radius</div>
          </div>
          <button onClick={() => setFilterOpen(true)} className="w-10 h-10 rounded-full bg-[#f9f8f6] flex items-center justify-center relative">
            <Icon.Filter />
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-[#e8734a] rounded-full border-2 border-white" />
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
        <div className="text-[13px] text-[#5a5a5a]"><strong className="text-[#1a1a1a] font-bold">{filtered.length}</strong> available professionals</div>
        <button className="text-[13px] font-bold text-[#1a7f5e] flex items-center gap-1">
          Best Match <Icon.ChevronDown />
        </button>
      </div>

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

      <BookingCriteriaSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onApply={handleApplyCriteria} />

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
    </div>
  );
}
