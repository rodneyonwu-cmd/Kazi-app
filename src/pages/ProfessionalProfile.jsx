import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Nav from '../components/Nav';

// ============================================================
// Kazi - Professional Profile
// Route: /professionals/:id
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

const Icon = {
  Back: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
  Share: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
  Heart: () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  Check: ({ className = 'w-3.5 h-3.5' }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12" /></svg>,
  Pin: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Shield: () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-[10px] h-[10px]"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>,
  Message: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Bolt: () => <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  ChevronRight: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="9 18 15 12 9 6" /></svg>,
};

// ============ Calendar ============
function Calendar({ availableDays, onDayClick }) {
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push({ empty: true, key: `e${i}` });
  for (let d = 1; d <= lastDate; d++) {
    const isPast = d < todayDate;
    const isAvailable = !isPast && availableDays.includes(d);
    const isToday = d === todayDate;
    cells.push({ day: d, isPast, isAvailable, isToday, key: `d${d}` });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-base font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>Availability</div>
        <div className="text-sm font-bold text-[#5a5a5a]" style={{ fontFamily: "'Outfit', sans-serif" }}>{fullMonths[month]} {year}</div>
      </div>
      <div className="flex items-center gap-1.5 mb-3.5 text-[11px] text-[#8a8a8a] font-semibold">
        <div className="w-3 h-3 rounded bg-[#f1f9f5] border border-[#e8f3ee]" />
        <span>Tap an available day to book</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {dayLabels.map((l) => (
          <div key={l} className="text-center text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wide pb-1">{l}</div>
        ))}
        {cells.map((c) => {
          if (c.empty) return <div key={c.key} className="aspect-square" />;
          let cls = 'aspect-square rounded-xl flex items-center justify-center font-semibold text-sm border-[1.5px] border-transparent';
          let style = {};
          if (c.isPast) {
            cls += ' text-[#ececec]';
          } else if (c.isAvailable) {
            cls += ' bg-[#f1f9f5] text-[#1a7f5e] cursor-pointer font-bold active:scale-95';
            style = { borderColor: '#e8f3ee' };
          } else {
            cls += ' bg-[#f9f8f6] text-[#1a1a1a]';
          }
          if (c.isToday) {
            style.borderColor = '#1a7f5e';
            style.borderWidth = '2px';
          }
          return (
            <div
              key={c.key}
              className={cls}
              style={{ ...style, fontFamily: "'Outfit', sans-serif" }}
              onClick={c.isAvailable ? () => onDayClick(new Date(year, month, c.day)) : undefined}
            >
              {c.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ Booking Sheet ============
function BookingSheet({ open, onClose, selectedDate, backups, onLaunchRapidFill, onSend, pro }) {
  const startTimes = ['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM'];
  const endTimes = ['3:00 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '7:00 PM'];
  const [startIdx, setStartIdx] = useState(2);
  const [endIdx, setEndIdx] = useState(3);
  const [lunchOn, setLunchOn] = useState(true);
  const [lunchMins, setLunchMins] = useState(45);

  const fullDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const shortMonths = ['Jan','Feb','Mar','April','May','June','July','Aug','Sep','Oct','Nov','Dec'];

  const dateLabel = useMemo(() => {
    if (!selectedDate) return '';
    return `${fullDays[selectedDate.getDay()]}, ${shortMonths[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
  }, [selectedDate]);

  const parseTime = (str) => {
    const [time, mer] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (mer === 'PM' && h !== 12) h += 12;
    if (mer === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const totalMins = useMemo(() => {
    let m = parseTime(endTimes[endIdx]) - parseTime(startTimes[startIdx]);
    if (lunchOn) m -= lunchMins;
    return Math.max(0, m);
  }, [startIdx, endIdx, lunchOn, lunchMins]);

  const totalShift = useMemo(() => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h${m ? ` ${m}m` : ''}`;
  }, [totalMins]);

  const totalCost = Math.round((totalMins / 60) * (pro?.rate || 0));

  const sendLabel = backups.length
    ? `Send to ${(pro?.name || '').split(' ')[0]} + ${backups.length} backup${backups.length > 1 ? 's' : ''}`
    : 'Send booking request';

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-[101] max-h-[92vh] overflow-y-auto transition-transform duration-300 sm:max-w-[480px] sm:left-1/2`}
        style={{
          transform: window.innerWidth >= 600
            ? (open ? 'translate(-50%, 0)' : 'translate(-50%, 100%)')
            : (open ? 'translateY(0)' : 'translateY(100%)'),
        }}
      >
        <div className="w-10 h-1 bg-[#ececec] rounded-full mx-auto mt-3 mb-1" />
        <div className="px-6 pt-3 pb-2 flex items-center justify-between">
          <div>
            <div className="text-xl font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>Book {(pro?.name || '').split(' ')[0]}</div>
            <div className="text-xs text-[#8a8a8a] mt-0.5">Confirm shift details to send request</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#1a1a1a]">
            <Icon.Close />
          </button>
        </div>

        {/* Date banner */}
        <div className="mx-6 mt-4 mb-2 bg-[#f1f9f5] border-[1.5px] border-[#e8f3ee] rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-[38px] h-[38px] bg-white rounded-xl flex items-center justify-center text-[#1a7f5e] flex-shrink-0">
            <Icon.Calendar />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-bold text-[#1a7f5e] uppercase tracking-wider">Selected date</div>
            <div className="text-base font-bold mt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>{dateLabel}</div>
          </div>
        </div>

        {/* Shift hours */}
        <div className="px-6 py-4">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">Shift hours</div>
          <div className="grid grid-cols-2 gap-2.5">
            <div onClick={() => setStartIdx((startIdx + 1) % startTimes.length)} className="bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl px-4 py-3.5 cursor-pointer">
              <div className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider">Start time</div>
              <div className="text-[17px] font-bold mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{startTimes[startIdx]}</div>
            </div>
            <div onClick={() => setEndIdx((endIdx + 1) % endTimes.length)} className="bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl px-4 py-3.5 cursor-pointer">
              <div className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider">End time</div>
              <div className="text-[17px] font-bold mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{endTimes[endIdx]}</div>
            </div>
          </div>
        </div>

        {/* Lunch break */}
        <div className="px-6 py-4">
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

        {/* Rapid Fill */}
        <div className="px-6 py-4">
          <div
            onClick={onLaunchRapidFill}
            className={`rounded-[18px] border-[1.5px] p-4 cursor-pointer transition-all ${
              backups.length
                ? 'border-[#1a7f5e] bg-gradient-to-br from-[#f1f9f5] to-white'
                : 'border-[#f3f3f3] bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${backups.length ? 'bg-[#1a7f5e] text-white' : 'bg-[#f1f9f5] text-[#1a7f5e]'}`}
              >
                <Icon.Bolt />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-bold leading-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Rapid Fill</div>
                <div className={`text-[11px] mt-0.5 leading-snug ${backups.length ? 'text-[#1a7f5e] font-semibold' : 'text-[#8a8a8a]'}`}>
                  {backups.length
                    ? `${backups.length} backup${backups.length > 1 ? 's' : ''} added`
                    : 'Add up to 9 backup pros. First to accept gets the shift.'}
                </div>
              </div>
              <span className="text-[#8a8a8a]"><Icon.ChevronRight /></span>
            </div>
            {backups.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-[#e8f3ee] flex items-center gap-2.5">
                <div className="flex items-center">
                  {backups.slice(0, 4).map((b, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[11px] font-bold border-2 border-white"
                      style={{
                        background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
                        marginLeft: i === 0 ? 0 : -8,
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      {b.initials}
                    </div>
                  ))}
                  {backups.length > 4 && (
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white bg-[#1a7f5e]"
                      style={{ marginLeft: -8, fontFamily: "'Outfit', sans-serif" }}
                    >
                      +{backups.length - 4}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onLaunchRapidFill(); }}
                  className="ml-auto text-xs font-bold text-[#1a7f5e] underline"
                >
                  Manage
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="px-6 py-4">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">Note for {(pro?.name || '').split(' ')[0]} (optional)</div>
          <textarea
            placeholder="e.g. Please wear navy scrubs. Park in lot B."
            className="w-full bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl px-4 py-3.5 text-sm min-h-[70px] resize-none focus:outline-none focus:border-[#1a7f5e]"
          />
        </div>

        {/* Cost summary */}
        <div className="px-6 py-4">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">Cost summary</div>
          <div className="bg-gradient-to-br from-[#1a7f5e] to-[#15604a] rounded-[18px] p-5 text-white">
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="opacity-85">Hourly rate</span>
              <span className="font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>${pro?.rate || 0}/hr</span>
            </div>
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="opacity-85">Total shift</span>
              <span className="font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{totalShift}</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/20">
              <span className="text-xs font-bold uppercase tracking-wider opacity-85">Estimated total</span>
              <span className="text-[28px] font-extrabold" style={{ fontFamily: "'Outfit', sans-serif" }}>${totalCost}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 pt-4 pb-7 border-t border-[#f3f3f3]">
          <button onClick={() => onSend()} className="w-full bg-[#1a7f5e] text-white rounded-full py-4 font-bold text-[15px]">
            {sendLabel}
          </button>
          <div className="text-center text-[11px] text-[#8a8a8a] mt-2.5 leading-snug">
            {(pro?.name || '').split(' ')[0]} has 4 hours to accept. You won't be charged until they confirm.
          </div>
        </div>
      </div>
    </>
  );
}

// ============ Section wrapper ============
function Section({ title, children }) {
  return (
    <div className="bg-white mx-4 mb-3 rounded-[20px] p-5 border border-[#f3f3f3]">
      <div className="text-base font-bold mb-3.5" style={{ fontFamily: "'Outfit', sans-serif" }}>{title}</div>
      {children}
    </div>
  );
}

// ============ Main Profile ============
export default function ProfessionalProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getToken } = useAuth();
  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [backups, setBackups] = useState(() => {
    try {
      const stored = sessionStorage.getItem('kazi_rapid_backups');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchPro = async () => {
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const [proRes, availRes] = await Promise.all([
          fetch(`${API_URL}/api/providers/${id}`, { headers }),
          fetch(`${API_URL}/api/providers/${id}/availability`, { headers }),
        ]);
        if (proRes.ok) {
          const data = await proRes.json();
          const u = data.user || {};
          const firstName = u.firstName || '';
          const lastName = u.lastName || '';
          const isDentist = data.role === 'dentist';
          const ROLE_MAP = { hygienist: 'Dental Hygienist', assistant: 'Dental Assistant', front: 'Front Desk', dentist: 'Dentist', specialist: 'Specialist' };
          const displayName = lastName ? `${isDentist ? 'Dr. ' : ''}${firstName} ${lastName.charAt(0)}.` : (firstName || 'Unknown');
          const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || '??';

          // Build available days from availability data
          const availability = availRes.ok ? await availRes.json() : [];
          const today = new Date();
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const availDays = [];
          availability.forEach(slot => {
            if (slot.isException) return;
            if (slot.date) {
              const d = new Date(slot.date);
              if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) {
                availDays.push(d.getDate());
              }
            } else if (slot.dayOfWeek != null) {
              for (let d = 1; d <= daysInMonth; d++) {
                if (new Date(today.getFullYear(), today.getMonth(), d).getDay() === slot.dayOfWeek) {
                  availDays.push(d);
                }
              }
            }
          });

          const reviews = data.reviews || [];
          const avgRating = data.avgRating || (reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0);

          setPro({
            name: displayName,
            initials,
            role: ROLE_MAP[data.role] || data.role || 'Professional',
            location: data.city && data.state ? `${data.city}, ${data.state}` : 'Houston, TX',
            creds: (data.credentials || []).map(c => c.type).slice(0, 5),
            rating: Number(avgRating) || 0,
            reviews: data.reviewCount || reviews.length || 0,
            distance: `${(Math.random() * 18 + 0.5).toFixed(0)} mi`,
            activity: 'Active recently',
            rate: data.hourlyRate || 0,
            bookings: data.shiftsCompleted || 0,
            reliability: data.reliabilityScore || 100,
            badges: ['Background Verified', ...(data.skills || []).slice(0, 2)],
            about: data.bio || 'No bio available.',
            credentialsList: (data.credentials || []).map(c => c.type),
            software: data.software || [],
            experience: data.skills || [],
            languages: [{ name: 'English', level: 'Native', native: true }],
            availableDays: [...new Set(availDays)],
            reviewsList: reviews.map(r => ({
              office: 'Verified Practice',
              date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              stars: r.rating,
              text: r.comment || 'Great experience.',
            })),
          });
        }
      } catch (err) { console.error('Fetch error:', err); }
      setLoading(false);
    };
    fetchPro();
  }, [id, getToken]);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSheetOpen(true);
  };

  const handleLaunchRapidFill = () => {
    try {
      sessionStorage.setItem('kazi_rapid_context', JSON.stringify({
        primary: pro.name,
        primaryInitials: pro.initials,
        date: selectedDate?.toISOString(),
      }));
    } catch {}
    setSheetOpen(false);
    navigate('/professionals?rapidfill=1');
  };

  const handleSend = async () => {
    try {
      const token = await getToken();
      const parsedDate = selectedDate || new Date();
      const res = await fetch(`${API_URL}/api/applications/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          providerId: id,
          date: parsedDate.toISOString(),
          startTime: '8:00 AM',
          endTime: '5:00 PM',
          hourlyRate: pro.rate || 0,
          role: pro.role || 'Dental Professional',
        }),
      });
      if (res.ok) {
        setSheetOpen(false);
        alert(`Booking request sent to ${pro.name}!`);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Failed to send booking request');
      }
    } catch { alert('Failed to send booking request'); }
  };

  const reliabilityTier = useMemo(() => {
    const r = pro?.reliability || 0;
    if (r >= 95) return { bg: '#f1f9f5', color: '#1a7f5e', border: '#e8f3ee' };
    if (r >= 85) return { bg: '#f1ebfa', color: '#7c3aed', border: '#e4d7f7' };
    if (r >= 70) return { bg: '#fef3e6', color: '#d97706', border: '#fce0bf' };
    return { bg: '#fdecec', color: '#dc2626', border: '#f9d4d4' };
  }, [pro?.reliability]);

  if (loading) return (
    <div className="bg-[#f9f8f6] min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Nav />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1a7f5e] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#8a8a8a]">Loading profile...</p>
        </div>
      </div>
    </div>
  );
  if (!pro) return (
    <div className="bg-[#f9f8f6] min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Nav />
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#8a8a8a]">Professional not found.</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f9f8f6] min-h-screen pb-28" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <Nav />
      {/* Top bar */}
      <div className="bg-white px-5 py-3.5 flex items-center gap-3.5 border-b border-[#f3f3f3] sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="w-[38px] h-[38px] rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#1a1a1a]">
          <Icon.Back />
        </button>
        <div className="flex-1" />
        <button className="w-[38px] h-[38px] rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#1a1a1a]">
          <Icon.Share />
        </button>
        <button className="w-[38px] h-[38px] rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#e8734a]">
          <Icon.Heart />
        </button>
      </div>

      {/* Hero */}
      <div className="bg-white px-5 pt-6 pb-7 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-52 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, #f1f9f5 0%, transparent 70%)' }}
        />
        <div className="relative">
          <div className="relative inline-block mb-3.5">
            <div
              className="w-[100px] h-[100px] rounded-[28px] flex items-center justify-center text-white text-4xl font-bold shadow-xl"
              style={{ background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)', fontFamily: "'Outfit', sans-serif" }}
            >
              {pro.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-[30px] h-[30px] bg-[#1a7f5e] rounded-full flex items-center justify-center border-[3px] border-white text-white">
              <Icon.Check className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-[26px] font-extrabold leading-tight mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>{pro.name}</div>
          <div className="text-sm text-[#5a5a5a] mb-2.5">{pro.role} · {pro.location}</div>
          <div className="inline-flex gap-1.5 mb-3 flex-wrap justify-center">
            {pro.creds.map((c) => (
              <span key={c} className="bg-[#f1f9f5] text-[#1a7f5e] text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide">{c}</span>
            ))}
          </div>
          <div className="text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#f4b740] text-[18px] leading-none">★</span>
              <span className="font-bold text-[15px]">{pro.rating.toFixed(1)}</span>
              <span className="text-[#8a8a8a]">({pro.reviews})</span>
            </span>
            <span className="text-[#ececec] mx-1">·</span>
            <span className="inline-flex items-center gap-1 text-[#5a5a5a]">
              <span className="text-[#8a8a8a]"><Icon.Pin /></span>
              {pro.distance}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7f5e] mt-2.5">
            <div className="w-[7px] h-[7px] bg-[#1a7f5e] rounded-full animate-pulse" />
            {pro.activity}
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center mt-3.5">
            {pro.badges.map((badge, idx) => {
              const isPurple = badge.toLowerCase().startsWith('top');
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border"
                  style={{
                    background: isPurple ? '#f1ebfa' : '#f1f9f5',
                    color: isPurple ? '#7c3aed' : '#1a7f5e',
                    borderColor: isPurple ? '#e4d7f7' : '#e8f3ee',
                  }}
                >
                  {idx === 0 && <span style={{ color: isPurple ? '#7c3aed' : '#1a7f5e' }}><Icon.Shield /></span>}
                  {badge}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-5 py-4 grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-2xl p-3.5 border border-[#f3f3f3] text-center">
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wide font-semibold mb-1">Rate</div>
          <div className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>${pro.rate}/hr</div>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-[#f3f3f3] text-center">
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wide font-semibold mb-1">Bookings</div>
          <div className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>{pro.bookings}</div>
        </div>
        <div
          className="rounded-2xl p-3.5 border text-center"
          style={{ background: reliabilityTier.bg, borderColor: reliabilityTier.border }}
        >
          <div className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: reliabilityTier.color }}>Reliability</div>
          <div className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: reliabilityTier.color }}>{pro.reliability}%</div>
        </div>
      </div>

      {/* About */}
      <Section title="About">
        <div className="text-sm leading-relaxed text-[#5a5a5a]">{pro.about}</div>
      </Section>

      {/* Calendar */}
      <div className="bg-white mx-4 mb-3 rounded-[20px] p-5 border border-[#f3f3f3]">
        <Calendar availableDays={pro.availableDays} onDayClick={handleDayClick} />
      </div>

      {/* Credentials */}
      <Section title="Credentials">
        <div className="flex flex-wrap gap-2">
          {pro.credentialsList.map((c) => (
            <span key={c} className="bg-[#f1f9f5] text-[#1a7f5e] border border-[#e8f3ee] px-3.5 py-2 rounded-full text-xs font-semibold">{c}</span>
          ))}
        </div>
      </Section>

      {/* Software */}
      {pro.software.length > 0 && (
        <Section title="Practice Software">
          <div className="flex flex-wrap gap-2">
            {pro.software.map((s) => (
              <span key={s} className="bg-[#f9f8f6] border border-[#f3f3f3] px-3.5 py-2 rounded-full text-xs font-semibold">{s}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {pro.experience.length > 0 && (
        <Section title="Experience Assisting">
          <div className="flex flex-wrap gap-2">
            {pro.experience.map((e) => (
              <span key={e} className="bg-[#f9f8f6] border border-[#f3f3f3] px-3.5 py-2 rounded-full text-xs font-semibold">{e}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Languages */}
      <Section title="Languages">
        {pro.languages.map((l, i) => (
          <div key={l.name} className={`flex items-center justify-between py-3 ${i !== pro.languages.length - 1 ? 'border-b border-[#f3f3f3]' : ''} ${i === 0 ? 'pt-0' : ''}`}>
            <span className="text-sm font-semibold">{l.name}</span>
            <span
              className={`text-[11px] font-semibold px-3 py-1 rounded-full ${l.native ? 'text-[#1a7f5e] bg-[#f1f9f5]' : 'text-[#8a8a8a] bg-[#f9f8f6]'}`}
            >
              {l.level}
            </span>
          </div>
        ))}
      </Section>

      {/* Reviews */}
      <Section title={`Reviews (${pro.reviews})`}>
        {pro.reviewsList.map((r, i) => (
          <div key={i} className={`py-3.5 ${i !== pro.reviewsList.length - 1 ? 'border-b border-[#f3f3f3]' : ''} ${i === 0 ? 'pt-0' : ''}`}>
            <div className="flex justify-between mb-1.5">
              <div className="text-[13px] font-bold">{r.office}</div>
              <div className="text-[11px] text-[#8a8a8a]">{r.date}</div>
            </div>
            <div className="text-[#f4b740] text-[13px] mb-1.5">{'★'.repeat(r.stars)}</div>
            <div className="text-[13px] leading-relaxed text-[#5a5a5a]">{r.text}</div>
          </div>
        ))}
        {pro.reviews > 0 && (
          <button className="block mx-auto mt-3.5 px-4 py-3 bg-[#f9f8f6] border border-[#f3f3f3] rounded-full text-[#1a7f5e] text-[13px] font-bold w-full text-center">
            See all {pro.reviews} reviews
          </button>
        )}
      </Section>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-5 pt-3.5 pb-7 border-t border-[#f3f3f3] flex gap-2.5 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <button className="w-14 h-[52px] rounded-full bg-[#f9f8f6] border border-[#ececec] flex items-center justify-center text-[#1a1a1a]">
          <Icon.Message />
        </button>
        <button
          onClick={() => {
            setSelectedDate(selectedDate || new Date());
            setSheetOpen(true);
          }}
          className="flex-1 bg-[#1a7f5e] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2"
        >
          <Icon.Calendar />
          Book {pro.name.split(' ')[0]}
        </button>
      </div>

      <BookingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        selectedDate={selectedDate}
        backups={backups}
        onLaunchRapidFill={handleLaunchRapidFill}
        onSend={handleSend}
        pro={pro}
      />
    </div>
  );
}
