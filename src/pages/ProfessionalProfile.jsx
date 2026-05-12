import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import Calendar from '../components/Calendar';
import BookingSheet from '../components/BookingSheet';
import BottomNav from '../components/BottomNav';
import ProviderBottomNav from '../components/ProviderBottomNav';
import TopBar from '../components/TopBar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const ROLE_MAP = { hygienist: 'Dental Hygienist', assistant: 'Dental Assistant', front: 'Front Desk', dentist: 'Dentist', specialist: 'Specialist' };

// Preview mock: when a pro card is tapped from Bookings/Applicants, the
// strip passes the clicked record via navigation state. We expand it
// into a fully populated profile here so the page renders against the
// same person the user clicked on.
// Stable seeded fallback portrait when no real avatarUrl is available.
// Uses pravatar.cc keyed off the provider id so each provider gets a
// consistent placeholder image. Real headshots from /api/providers
// will replace these once the field is wired.
function fallbackAvatarUrl(id) {
  const seed = encodeURIComponent(id || 'pro');
  return `https://i.pravatar.cc/240?u=${seed}`;
}

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
  const id = mock.id || 'mock';
  return {
    id,
    name: mock.name || 'Unknown',
    firstName,
    initials: mock.initials || firstName.slice(0, 2).toUpperCase(),
    avatarUrl: mock.avatarUrl || fallbackAvatarUrl(id),
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
    // What the provider is open to. Decided during onboarding (TODO);
    // for now defaulted to both. Possible values: 'Temp shifts',
    // 'Permanent'. Shown on the office-facing profile under Availability.
    openTo: mock.openTo || ['Temp shifts', 'Permanent'],
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
          className="w-12 h-12 rounded-full flex items-center justify-center border-[2.5px]"
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
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();
  const { user } = useUser();
  // "Preview" mode — provider previewing their own page as offices see it.
  // Triggered by /professionals/me?preview=1. Renders a top banner with an
  // Exit-Preview affordance that returns to the editable self-view.
  const isPreviewMode = id === 'me' && searchParams.get('preview') === '1';

  const [pro, setPro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tab, setTab] = useState('about'); // 'about' | 'availability' | 'reviews'
  const [saved, setSaved] = useState(false);

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
      // Stable per-user seed for the placeholder portrait so the
      // preview doesn't look like a generic "me" face. Real photo
      // (localStorage > Clerk imageUrl) still wins when present.
      const seedId = user?.id || 'me-self';
      setPro(buildMockPro({
        id: seedId,
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
            avatarUrl: u.avatarUrl || fallbackAvatarUrl(data.id),
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
            // TODO API: source openTo from /api/providers/:id once the
            // onboarding flow stores it. For now default to both.
            openTo: data.openTo || ['Temp shifts', 'Permanent'],
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

  const handleShare = async () => {
    if (!pro) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `${pro.name} — ${pro.role} on Kazi`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: pro.name, text, url });
        return;
      } catch { /* user cancelled */ }
    }
    try { await navigator.clipboard.writeText(`${text} — ${url}`); } catch { /* clipboard unavailable */ }
  };

  const handleMessageClick = () => {
    navigate(`/messages/${pro.id}`, {
      state: { mock: { id: pro.id, name: pro.name, initials: pro.initials, avatarUrl: pro.avatarUrl, role: pro.role } },
    });
  };

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

  if (loading) return (
    <div className="bg-[#f9f8f6] min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <TopBar role="office" />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#1a7f5e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8a8a8a]">Loading profile...</p>
        </div>
      </div>
      {isPreviewMode ? <ProviderBottomNav /> : <BottomNav />}
    </div>
  );
  if (!pro) return (
    <div className="bg-[#f9f8f6] min-h-screen" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <TopBar role="office" />
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#8a8a8a]">Professional not found.</p>
      </div>
      {isPreviewMode ? <ProviderBottomNav /> : <BottomNav />}
    </div>
  );

  // Reliability color — green ≥95, amber 85-94, coral <85.
  const reliabilityColor = pro.reliability >= 95 ? '#1a7f5e' : pro.reliability >= 85 ? '#c98b16' : '#e8734a';

  return (
    <div
      style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'DM Sans', sans-serif", paddingBottom: 90 }}
    >
      {/* Preview banner — provider previewing their own page */}
      {isPreviewMode && (
        <div
          style={{
            background: '#fef6e4',
            color: '#8b6914',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 13,
            fontWeight: 600,
            borderBottom: '1px solid #f5e3b8',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b6914" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Preview · how offices see you
          </span>
          <button
            onClick={() => navigate('/my-profile')}
            style={{ background: '#fff', color: '#8b6914', border: '1px solid #f5e3b8', padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Exit preview
          </button>
        </div>
      )}

      {/* Sticky topbar — circular back (left) + circular share & save (right). */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 41,
          background: '#ffffff',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="kazi-tap"
          style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: '#f9f8f6', border: '1px solid #ececec', borderRadius: '50%', cursor: 'pointer', padding: 0 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleShare}
            aria-label="Share profile"
            className="kazi-tap"
            style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: '#f9f8f6', border: '1px solid #ececec', borderRadius: '50%', cursor: 'pointer', padding: 0 }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
          <button
            onClick={() => setSaved((s) => !s)}
            aria-label={saved ? 'Unsave profile' : 'Save profile'}
            className="kazi-tap"
            style={{
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              background: saved ? '#fdeee7' : '#f9f8f6',
              border: `1px solid ${saved ? '#fdeee7' : '#ececec'}`,
              borderRadius: '50%',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? '#e8734a' : 'none'} stroke={saved ? '#e8734a' : '#1a1a1a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hero — flat on the white page, no card */}
      <section style={{ padding: '4px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
          <div style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: 'linear-gradient(135deg, #a8c9b8 0%, #7ab8a8 100%)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: 32,
            flexShrink: 0,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(15,29,27,0.12)',
          }}>
            {/* Initials underneath; img overlays. If the img fails to
                load (or the URL is missing), onError hides it and the
                initials show through against the sage gradient. */}
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 32 }}>
              {pro.initials}
            </span>
            {pro.avatarUrl && (
              <img
                src={pro.avatarUrl}
                alt={pro.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
            <span style={{ position: 'absolute', bottom: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: '#1a7f5e', border: '3px solid #fff', display: 'grid', placeItems: 'center', zIndex: 2 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22, color: '#0f1a16', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
              {pro.name}
            </div>
            <div style={{ fontSize: 13, color: '#6b7875', fontWeight: 500, marginTop: 2 }}>
              {pro.role} · {pro.location}
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, fontSize: 13, color: '#0f1a16', fontWeight: 600 }}>
              <span style={{ color: '#f4b740', fontSize: 16, lineHeight: 1 }}>★</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{pro.rating.toFixed(1)}</span>
              <span style={{ color: '#9aa5a1', fontWeight: 500, fontSize: 12 }}>({pro.reviews} reviews)</span>
            </div>
          </div>
        </div>

        {pro.about && (
          <p style={{ fontSize: 14, lineHeight: 1.5, color: '#444', marginBottom: 14 }}>
            {pro.about}
          </p>
        )}

        {/* Action row — Book + Message inline (no sticky bottom bar) */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            onClick={handleBookButtonClick}
            className="kazi-tap"
            style={{
              flex: 1,
              background: '#1a7f5e',
              color: '#ffffff',
              border: 'none',
              borderRadius: 100,
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Book {pro.firstName || pro.name}
          </button>
          <button
            onClick={handleMessageClick}
            className="kazi-tap"
            style={{
              flex: 1,
              background: '#ffffff',
              color: '#0f1a16',
              border: '1px solid #e8e6e1',
              borderRadius: 100,
              padding: '10px 16px',
              fontSize: 13.5,
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f1a16" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Message
          </button>
        </div>

        {/* Stats row — flat, hairline-divided */}
        <div style={{ display: 'flex', gap: 4, paddingTop: 14, borderTop: '1px solid #f0eee8' }}>
          <ProStat label="Rating" value={pro.rating.toFixed(1)} valueColor="#0f1a16" prefix={<span style={{ color: '#f4b740', fontSize: 14, lineHeight: 1, marginRight: 2 }}>★</span>} />
          <ProStat label="Reliability" value={`${pro.reliability}%`} valueColor={reliabilityColor} />
          <ProStat label="Bookings" value={pro.bookings} valueColor="#0f1a16" />
          <ProStat label="Rate" value={`$${pro.rate}`} suffix="/hr" valueColor="#1a7f5e" />
        </div>
      </section>

      {/* Sticky tab strip */}
      <section style={{ padding: '0 20px', position: 'sticky', top: 65, zIndex: 30, background: '#ffffff' }}>
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #f0eee8' }}>
          {[
            { id: 'about', label: 'About' },
            { id: 'availability', label: 'Availability' },
            { id: 'reviews', label: `Reviews · ${pro.reviews}` },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: active ? '#0f1a16' : '#9aa5a1',
                  padding: '12px 0',
                  position: 'relative',
                  letterSpacing: '-0.1px',
                }}
              >
                {t.label}
                {active && (
                  <span style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: '#1a7f5e', borderRadius: 2 }} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab content */}
      <section style={{ padding: '14px 20px 30px' }}>
        {tab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {pro.openTo?.length > 0 && (
              <ProDetail label="Open to">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {pro.openTo.map((o) => {
                    const isPerm = /perm/i.test(o);
                    const palette = isPerm
                      ? { bg: '#f3ecfd', border: '#d9c7f5', text: '#5b21b6' }   // purple — permanent
                      : { bg: '#e8f5f0', border: '#c5e3d5', text: '#1a7f5e' }; // green — temp
                    return (
                      <span
                        key={o}
                        style={{
                          padding: '5px 11px',
                          background: palette.bg,
                          border: `1px solid ${palette.border}`,
                          borderRadius: 100,
                          fontSize: 12,
                          fontWeight: 600,
                          color: palette.text,
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        {o}
                      </span>
                    );
                  })}
                </div>
              </ProDetail>
            )}
            <ProDetail label="Credentials">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pro.credentialsList.map((c) => (
                  <span key={c} style={{ padding: '5px 11px', background: '#e8f5f0', border: '1px solid #c5e3d5', borderRadius: 100, fontSize: 12, fontWeight: 600, color: '#1a7f5e', fontFamily: "'Outfit', sans-serif" }}>
                    {c}
                  </span>
                ))}
              </div>
            </ProDetail>
            <ProDetail label="Practice software">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pro.software.map((s) => (
                  <span key={s} style={{ padding: '5px 11px', background: '#f9f8f6', border: '1px solid #e8e6e1', borderRadius: 100, fontSize: 12, fontWeight: 600, color: '#0f1a16', fontFamily: "'Outfit', sans-serif" }}>
                    {s}
                  </span>
                ))}
              </div>
            </ProDetail>
            <ProDetail label="Experience">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {pro.experience.map((e) => (
                  <span key={e} style={{ padding: '5px 11px', background: '#f9f8f6', border: '1px solid #e8e6e1', borderRadius: 100, fontSize: 12, fontWeight: 600, color: '#0f1a16', fontFamily: "'Outfit', sans-serif" }}>
                    {e}
                  </span>
                ))}
              </div>
            </ProDetail>
            <ProDetail label="Languages">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {pro.languages.map((l, i) => (
                  <div
                    key={l.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: i !== pro.languages.length - 1 ? '1px solid #f0eee8' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f1a16' }}>{l.name}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 100, color: l.native ? '#1a7f5e' : '#6b7875', background: l.native ? '#e8f5f0' : '#f9f8f6' }}>
                      {l.level}
                    </span>
                  </div>
                ))}
              </div>
            </ProDetail>
          </div>
        )}

        {tab === 'availability' && (
          <div style={{ background: '#ffffff', border: '1px solid #e8e6e1', borderRadius: 16, padding: 16 }}>
            <Calendar availableDays={pro.availableDays} onDayClick={handleDayClick} />
          </div>
        )}

        {tab === 'reviews' && (
          pro.reviewsList.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6b7875' }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14, color: '#0f1a16', marginBottom: 4 }}>No reviews yet</p>
              <p style={{ fontSize: 13 }}>Office reviews of {pro.firstName || pro.name} will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {pro.reviewsList.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 0',
                    borderBottom: i !== pro.reviewsList.length - 1 ? '1px solid #f0eee8' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#0f1a16' }}>{r.office}</div>
                    <div style={{ fontSize: 11.5, color: '#9aa5a1', fontWeight: 500 }}>{r.date}</div>
                  </div>
                  <div style={{ color: '#f4b740', fontSize: 13, marginBottom: 6, letterSpacing: '0.5px' }}>{'★'.repeat(r.stars)}</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.5, color: '#444' }}>{r.text}</div>
                </div>
              ))}
            </div>
          )
        )}
      </section>

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
      {isPreviewMode ? <ProviderBottomNav /> : <BottomNav />}
    </div>
  );
}

// ── Stats row item ─────────────────────────────────────────────
function ProStat({ label, value, valueColor, prefix, suffix }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: valueColor || '#0f1a16', letterSpacing: '-0.02em', lineHeight: 1, display: 'inline-flex', alignItems: 'center' }}>
        {prefix}
        {value}
        {suffix && <span style={{ fontSize: 12, color: '#9aa5a1', fontWeight: 600, marginLeft: 1 }}>{suffix}</span>}
      </div>
      <div style={{ fontSize: 11.5, color: '#6b7875', fontWeight: 500, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── About tab section block ────────────────────────────────────
function ProDetail({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: '#9aa5a1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
