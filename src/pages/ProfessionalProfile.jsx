import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import Calendar from '../components/Calendar';
import BookingSheet from '../components/BookingSheet';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ROLE_MAP = { hygienist: 'Dental Hygienist', assistant: 'Dental Assistant', front: 'Front Desk', dentist: 'Dentist', specialist: 'Specialist' };

// Preview mock: when a pro card is tapped from Bookings/Applicants, the
// strip passes the clicked record via navigation state. We expand it
// into a fully populated profile here so the page renders against the
// same person the user clicked on.
function buildMockPro(mock) {
  const firstName = (mock.name || '').split(' ')[0] || 'Pro';
  const cred = mock.cred || 'RDH';
  const rating = typeof mock.rating === 'number' ? mock.rating : parseFloat(mock.stars) || 4.8;
  const reviewCount = mock.reviews ?? 54;
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const availableDays = [];
  for (let d = today.getDate(); d <= daysInMonth; d++) {
    if (d % 3 !== 0) availableDays.push(d);
  }
  return {
    id: mock.id || 'mock',
    name: mock.name || 'Unknown',
    firstName,
    initials: mock.initials || firstName.slice(0, 2).toUpperCase(),
    avatarUrl: mock.avatarUrl || null,
    role: mock.role || 'Dental Professional',
    location: mock.location || 'Houston, TX',
    creds: [cred, 'BLS'],
    rating,
    reviews: reviewCount,
    distance: mock.distance || mock.dist || '4 mi',
    activity: 'Active recently',
    rate: mock.rate || mock.hourlyRate || 55,
    bookings: mock.bookings || 142,
    reliability: mock.reliability || 98,
    responseTime: '< 1 hr',
    badges: ['Background Verified', 'Top 5%'],
    about: `${firstName} is a dedicated ${cred} with years of experience in busy practice environments. Known for reliability, patient rapport, and a calm, organized approach on complex days.`,
    credentialsList: [cred, 'BLS'],
    software: ['Dentrix', 'Eaglesoft', 'Open Dental'],
    experience: ['Operative', 'Crowns & bridges', 'Periodontal care', 'Pediatric'],
    languages: [{ name: 'English', level: 'Native', native: true }, { name: 'Spanish', level: 'Conversational', native: false }],
    availableDays,
    reviewsList: [
      { office: 'Missouri City Dental', date: 'Mar 14, 2026', stars: 5, text: `${firstName} was a pleasure to work with. On time, prepared, and great with patients.` },
      { office: 'Sugar Land Family Dental', date: 'Feb 28, 2026', stars: 5, text: 'Quick to pick up our flow and kept up with a packed schedule without complaint.' },
      { office: 'Pearland Smiles', date: 'Jan 12, 2026', stars: 4, text: 'Solid work. Would book again when we need extra help.' },
    ],
  };
}

// ---------- Inline icons ----------
const IconBack = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);
const IconShare = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const IconHeart = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconCheck = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px]">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-[10px] h-[10px]">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
  </svg>
);
const IconMessage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconCalendarSmall = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

// ---------- Trust badges ----------
// Four Kazi-aesthetic credibility chips shown at the top of every
// professional profile: Background checked, Top 5%, Rapid responder,
// Cross-trained. Colors are pulled from the existing Kazi palette.
const BADGE_ICONS = {
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[34px] h-[34px]">
      <path d="M12 2l9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6l9-4z" fill="currentColor" fillOpacity="0.22" />
      <polyline points="8.5 12.5 11 15 15.5 10.5" strokeWidth="2.4" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[28px] h-[28px]">
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" fill="currentColor" fillOpacity="0.18" stroke="currentColor" />
      <path d="M17 5h2a2 2 0 0 1 0 4h-2" />
      <path d="M7 5H5a2 2 0 0 0 0 4h2" />
      <line x1="9" y1="19" x2="15" y2="19" />
      <line x1="12" y1="15" x2="12" y2="19" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[28px] h-[28px]">
      <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />
    </svg>
  ),
  shuffle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-[28px] h-[28px]">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
};

const BADGES = [
  { icon: 'check',   label: 'Background\nchecked', bg: '#f1f9f5', color: '#1a7f5e', border: '#e8f3ee' },
  { icon: 'trophy',  label: 'Top 5%',              bg: '#fef6e4', color: '#c98b16', border: '#f7e6bd' },
  { icon: 'bolt',    label: 'Rapid\nresponder',    bg: '#fdeee7', color: '#e8734a', border: '#fad9c9' },
  { icon: 'shuffle', label: 'Cross-\ntrained',     bg: '#f1ebfa', color: '#7c3aed', border: '#e4d7f7' },
];

function TrustBadges() {
  return (
    <div className="flex items-center gap-3 mt-4">
      {BADGES.map((b) => (
        <div
          key={b.label}
          title={b.label.replace('\n', ' ')}
          aria-label={b.label.replace('\n', ' ')}
          className="w-12 h-12 rounded-full flex items-center justify-center border-[1.5px]"
          style={{ background: b.bg, borderColor: b.color, color: b.color }}
        >
          {BADGE_ICONS[b.icon]}
        </div>
      ))}
    </div>
  );
}

// ---------- Section wrapper ----------
function Section({ title, children }) {
  return (
    <div className="bg-white mx-4 mb-3 rounded-[20px] p-5 border border-[#f3f3f3]">
      <div
        className="text-base font-bold mb-3.5 text-[#1a1a1a]"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

// ---------- Main component ----------
export default function ProfessionalProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { getToken } = useAuth();
  const { user } = useUser();

  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [backups, setBackups] = useState(() => {
    try {
      const stored = sessionStorage.getItem('kazi_rapid_backups');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  // Fetch provider data + availability
  useEffect(() => {
    // Preview path: if navigated here from Bookings/Applicants, the strip
    // passes the clicked record as navigation state — render it directly.
    const mock = location.state?.mock;
    if (mock) {
      setPro(buildMockPro(mock));
      setLoading(false);
      return;
    }
    // Self-view: the provider-side Profile tab routes here with id="me".
    if (id === 'me') {
      const firstName = user?.firstName || 'Rodney';
      const lastName = user?.lastName || 'Onwu';
      let storedPhoto = null;
      try { storedPhoto = localStorage.getItem('kazi_profile_photo'); } catch {}
      setPro(buildMockPro({
        id: 'me',
        name: `${firstName} ${lastName}`.trim(),
        initials: `${firstName[0] || 'R'}${lastName[0] || 'O'}`.toUpperCase(),
        avatarUrl: storedPhoto || user?.imageUrl || null,
        role: 'Dental Assistant',
        cred: 'RDA',
        stars: '4.9',
        reviews: 82,
        dist: '—',
        rate: 28,
      }));
      setLoading(false);
      return;
    }
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
          const displayName = lastName ? `${isDentist ? 'Dr. ' : ''}${firstName} ${lastName.charAt(0)}.` : (firstName || 'Unknown');
          const initials = `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase() || '??';

          // Build available days from availability data
          const availability = availRes.ok ? await availRes.json() : [];
          const today = new Date();
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const availDaysSet = new Set();
          availability.forEach(slot => {
            if (slot.isException) return;
            if (slot.date) {
              const d = new Date(slot.date);
              if (d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()) availDaysSet.add(d.getDate());
            } else if (slot.dayOfWeek != null) {
              for (let d = 1; d <= daysInMonth; d++) {
                if (new Date(today.getFullYear(), today.getMonth(), d).getDay() === slot.dayOfWeek) availDaysSet.add(d);
              }
            }
          });

          const reviews = data.reviews || [];
          const avgRating = data.avgRating || (reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0);

          setPro({
            id: data.id,
            name: displayName,
            firstName,
            initials,
            avatarUrl: u.avatarUrl || null,
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
            responseTime: data.responseTime || '< 1 hr',
            badges: ['Background Verified', ...(data.skills || []).slice(0, 2)],
            about: data.bio || 'No bio available.',
            credentialsList: (data.credentials || []).map(c => c.type),
            software: data.software || [],
            experience: data.skills || [],
            languages: [{ name: 'English', level: 'Native', native: true }],
            availableDays: [...availDaysSet],
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
  }, [id, getToken, location.state, user]);

  // When returning from Rapid Fill, auto-reopen the sheet
  useEffect(() => {
    try {
      const returning = sessionStorage.getItem('kazi_rapid_return');
      if (returning === '1') {
        sessionStorage.removeItem('kazi_rapid_return');
        const stored = sessionStorage.getItem('kazi_rapid_backups');
        if (stored) setBackups(JSON.parse(stored));
        const ctx = sessionStorage.getItem('kazi_rapid_context');
        if (ctx) {
          const parsed = JSON.parse(ctx);
          if (parsed.date) setSelectedDate(new Date(parsed.date));
        }
        setSheetOpen(true);
      }
    } catch {}
  }, []);

  const handleDayClick = (date) => { setSelectedDate(date); setSheetOpen(true); };
  const handleBookButtonClick = () => { if (!selectedDate) setSelectedDate(new Date()); setSheetOpen(true); };

  const handleLaunchRapidFill = () => {
    if (!pro) return;
    try {
      sessionStorage.setItem('kazi_rapid_context', JSON.stringify({
        primary: pro.name, primaryInitials: pro.initials,
        date: selectedDate ? selectedDate.toISOString() : null,
      }));
    } catch {}
    setSheetOpen(false);
    navigate('/professionals?rapidfill=1');
  };

  const handleSend = async (details) => {
    if (!pro) return;
    try {
      const token = await getToken();
      const parsedDate = details.date || selectedDate || new Date();
      const res = await fetch(`${API_URL}/api/applications/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          providerId: id,
          date: parsedDate.toISOString(),
          startTime: details.start || '8:00 AM',
          endTime: details.end || '5:00 PM',
          hourlyRate: pro.rate || 0,
          role: pro.role || 'Dental Professional',
          note: details.note || null,
        }),
      });
      if (res.ok) {
        setSheetOpen(false);
        sessionStorage.removeItem('kazi_rapid_backups');
        sessionStorage.removeItem('kazi_rapid_context');
        setBackups([]);
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
      <TopBar role="office" />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1a7f5e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8a8a8a]">Loading profile...</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
  if (!pro) return (
    <div className="bg-[#f9f8f6] min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <TopBar role="office" />
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#8a8a8a]">Professional not found.</p>
      </div>
      <BottomNav />
    </div>
  );

  return (
    <div
      className="bg-[#f9f8f6] min-h-screen pb-[180px]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <TopBar role="office" />
      {/* Top bar */}
      <div className="bg-white px-5 py-3.5 flex items-center gap-3.5 border-b border-[#f3f3f3] sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="w-[38px] h-[38px] rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#1a1a1a]"
          aria-label="Back"
        >
          <IconBack />
        </button>
        <div className="flex-1" />
      </div>

      {/* Hero */}
      <div className="bg-white pl-8 pr-5 pt-6 pb-6 text-left relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-72 h-52 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, #f1f9f5 0%, transparent 70%)' }}
        />

        {/* Share / favorite — moved down from the sticky top bar */}
        <div className="absolute top-4 right-5 flex gap-2 z-10">
          <button
            aria-label="Share"
            className="w-[38px] h-[38px] rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#1a1a1a] border border-[#f3f3f3]"
          >
            <IconShare />
          </button>
          <button
            aria-label="Save"
            className="w-[38px] h-[38px] rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#e8734a] border border-[#f3f3f3]"
          >
            <IconHeart />
          </button>
        </div>

        <div className="relative">
          <div className="relative inline-block mb-3">
            {pro.avatarUrl ? (
              <img
                src={pro.avatarUrl}
                alt={pro.name}
                className="w-[72px] h-[72px] rounded-[20px] object-cover shadow-md"
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-[20px] flex items-center justify-center text-white text-2xl font-bold shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {pro.initials}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-[24px] h-[24px] bg-[#1a7f5e] rounded-full flex items-center justify-center border-[3px] border-white text-white">
              <IconCheck className="w-3 h-3" />
            </div>
          </div>
          <div
            className="text-[24px] font-extrabold leading-tight mb-1 text-[#1a1a1a]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {pro.name}
          </div>
          <div className="text-sm text-[#5a5a5a] mb-2.5">
            {pro.role} · {pro.location}
          </div>
          <div className="inline-flex gap-1.5 mb-3 flex-wrap">
            {pro.creds.map((c) => (
              <span
                key={c}
                className="bg-[#f1f9f5] text-[#1a7f5e] text-[11px] font-bold px-2.5 py-1 rounded-full tracking-wide"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="text-sm">
            <span className="inline-flex items-center gap-1.5">
              <span className="text-[#f4b740] text-[26px] leading-none">★</span>
              <span className="font-bold text-[20px] text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif" }}>{pro.rating.toFixed(1)}</span>
              <span className="text-[#8a8a8a] text-[14px]">({pro.reviews})</span>
            </span>
            <span className="text-[#ececec] mx-1.5">·</span>
            <span className="inline-flex items-center gap-1 text-[#5a5a5a]">
              <span className="text-[#8a8a8a]">
                <IconPin />
              </span>
              {pro.distance}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7f5e] mt-2.5">
            <div className="w-[7px] h-[7px] bg-[#1a7f5e] rounded-full animate-pulse" />
            {pro.activity}
          </div>
          <TrustBadges />
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-5 py-4 grid grid-cols-4 gap-2">
        <div className="bg-white rounded-2xl p-3 border border-[#f3f3f3] text-center">
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wide font-semibold mb-1">Rate</div>
          <div className="text-[15px] font-bold text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            ${pro.rate}/hr
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-[#f3f3f3] text-center">
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wide font-semibold mb-1">Bookings</div>
          <div className="text-[15px] font-bold text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {pro.bookings}
          </div>
        </div>
        <div
          className="rounded-2xl p-3 border text-center"
          style={{ background: reliabilityTier.bg, borderColor: reliabilityTier.border }}
        >
          <div className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: reliabilityTier.color }}>
            Reliability
          </div>
          <div className="text-[15px] font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: reliabilityTier.color }}>
            {pro.reliability}%
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3 border border-[#f3f3f3] text-center">
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wide font-semibold mb-1">Response</div>
          <div className="text-[15px] font-bold text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {pro.responseTime}
          </div>
        </div>
      </div>

      {/* About */}
      <Section title="About">
        <div className="text-sm leading-relaxed text-[#5a5a5a]">{pro.about}</div>
      </Section>

      {/* Availability calendar — tapping a green day opens the BookingSheet */}
      <div className="bg-white mx-4 mb-3 rounded-[20px] p-5 border border-[#f3f3f3]">
        <Calendar availableDays={pro.availableDays} onDayClick={handleDayClick} />
      </div>

      {/* Credentials */}
      <Section title="Credentials">
        <div className="flex flex-wrap gap-2">
          {pro.credentialsList.map((c) => (
            <span
              key={c}
              className="bg-[#f1f9f5] text-[#1a7f5e] border border-[#e8f3ee] px-3.5 py-2 rounded-full text-xs font-semibold"
            >
              {c}
            </span>
          ))}
        </div>
      </Section>

      {/* Practice Software */}
      <Section title="Practice Software">
        <div className="flex flex-wrap gap-2">
          {pro.software.map((s) => (
            <span
              key={s}
              className="bg-[#f9f8f6] border border-[#f3f3f3] px-3.5 py-2 rounded-full text-xs font-semibold text-[#1a1a1a]"
            >
              {s}
            </span>
          ))}
        </div>
      </Section>

      {/* Experience */}
      <Section title="Experience Assisting">
        <div className="flex flex-wrap gap-2">
          {pro.experience.map((e) => (
            <span
              key={e}
              className="bg-[#f9f8f6] border border-[#f3f3f3] px-3.5 py-2 rounded-full text-xs font-semibold text-[#1a1a1a]"
            >
              {e}
            </span>
          ))}
        </div>
      </Section>

      {/* Languages */}
      <Section title="Languages">
        {pro.languages.map((l, i) => (
          <div
            key={l.name}
            className={`flex items-center justify-between py-3 ${
              i !== pro.languages.length - 1 ? 'border-b border-[#f3f3f3]' : ''
            } ${i === 0 ? 'pt-0' : ''}`}
          >
            <span className="text-sm font-semibold text-[#1a1a1a]">{l.name}</span>
            <span
              className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
                l.native ? 'text-[#1a7f5e] bg-[#f1f9f5]' : 'text-[#8a8a8a] bg-[#f9f8f6]'
              }`}
            >
              {l.level}
            </span>
          </div>
        ))}
      </Section>

      {/* Reviews */}
      <Section title={`Reviews (${pro.reviews})`}>
        {pro.reviewsList.map((r, i) => (
          <div
            key={i}
            className={`py-3.5 ${
              i !== pro.reviewsList.length - 1 ? 'border-b border-[#f3f3f3]' : ''
            } ${i === 0 ? 'pt-0' : ''}`}
          >
            <div className="flex justify-between mb-1.5">
              <div className="text-[13px] font-bold text-[#1a1a1a]">{r.office}</div>
              <div className="text-[11px] text-[#8a8a8a]">{r.date}</div>
            </div>
            <div className="text-[#f4b740] text-[13px] mb-1.5">{'★'.repeat(r.stars)}</div>
            <div className="text-[13px] leading-relaxed text-[#5a5a5a]">{r.text}</div>
          </div>
        ))}
        <button className="block mx-auto mt-3.5 px-4 py-3 bg-[#f9f8f6] border border-[#f3f3f3] rounded-full text-[#1a7f5e] text-[13px] font-bold w-full text-center">
          See all {pro.reviews} reviews
        </button>
      </Section>

      {/* Sticky action bar — tapping Book also opens the BookingSheet */}
      <div
        className="fixed left-0 right-0 bg-white px-5 pt-3.5 pb-4 border-t border-[#f3f3f3] flex gap-2.5 z-[45] shadow-[0_-4px_20px_rgba(0,0,0,0.04)] sm:max-w-[480px] sm:left-1/2 sm:-translate-x-1/2"
        style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
      >
        <button className="w-14 h-[52px] rounded-full bg-[#f9f8f6] border border-[#ececec] flex items-center justify-center text-[#1a1a1a]">
          <IconMessage />
        </button>
        <button
          onClick={handleBookButtonClick}
          className="flex-1 bg-[#1a7f5e] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2"
        >
          <IconCalendarSmall />
          Book {pro.firstName}
        </button>
      </div>

      {/* Booking sheet overlay */}
      <BookingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        pro={pro}
        selectedDate={selectedDate}
        backups={backups}
        onLaunchRapidFill={handleLaunchRapidFill}
        onSend={handleSend}
      />
      <BottomNav />
    </div>
  );
}
