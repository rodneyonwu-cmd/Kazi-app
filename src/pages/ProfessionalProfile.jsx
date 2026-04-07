import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Calendar from '../components/Calendar';
import BookingSheet from '../components/BookingSheet';
import Nav from '../components/Nav';

// ============================================================
// Kazi - Professional Profile (uses Calendar + BookingSheet)
// Location: src/pages/ProfessionalProfile.jsx
// Route: /professionals/:id
// ============================================================

// Mock pro - replace with API fetch by id (useParams)
const PRO = {
  id: 'alexandra',
  name: 'Alexandra A.',
  firstName: 'Alexandra',
  initials: 'AA',
  role: 'Dental Assistant',
  location: 'Houston, TX',
  creds: ['RDA', 'EFDA'],
  rating: 5.0,
  reviews: 47,
  distance: '12 mi',
  activity: 'Active 42 min ago',
  rate: 28,
  bookings: 130,
  reliability: 96,
  badges: ['Background Verified', 'Top 2%', 'Bilingual ES/EN'],
  about:
    'Energetic Dental Assistant from Colombia, enthusiastic about dental health. Licensed since 2020 with experience in general practice. I genuinely enjoy my work and building lasting patient relationships.',
  credentialsList: ['RDA', 'EFDA', 'BLS CPR', 'CDA', 'Radiology'],
  software: ['Dentrix', 'Eaglesoft', 'Open Dental'],
  experience: ['General Dentistry', 'Endodontics', 'Oral Surgery', 'Orthodontics', 'Pediatric'],
  languages: [
    { name: 'Spanish', level: 'Native', native: true },
    { name: 'English', level: 'Conversational', native: false },
  ],
  availableDays: [8, 9, 11, 14, 15, 16, 18, 22, 23, 25, 28, 29, 30],
  reviewsList: [
    {
      office: 'Sugar Land Family Dental',
      date: 'Mar 28, 2026',
      stars: 5,
      text: 'Alexandra was fantastic. Showed up 15 minutes early, knew our workflow immediately, and patients loved her. Will absolutely book again.',
    },
    {
      office: 'Westchase Smile Studio',
      date: 'Mar 14, 2026',
      stars: 5,
      text: 'Professional, kind, and efficient. Her bilingual skills helped us with several Spanish-speaking patients that day.',
    },
    {
      office: 'Memorial Dental Group',
      date: 'Feb 22, 2026',
      stars: 5,
      text: "One of the best temps we've had. Picked up Dentrix in minutes and was a pleasure to work with all day.",
    },
  ],
};

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
  // const { id } = useParams(); // Use this to fetch the correct pro when API is ready

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Backups from sessionStorage (set by the Rapid Fill flow in FindProfessionals)
  const [backups, setBackups] = useState(() => {
    try {
      const stored = sessionStorage.getItem('kazi_rapid_backups');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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

  // ===== Event handlers =====
  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSheetOpen(true);
  };

  const handleBookButtonClick = () => {
    if (!selectedDate) setSelectedDate(new Date());
    setSheetOpen(true);
  };

  const handleLaunchRapidFill = () => {
    try {
      sessionStorage.setItem(
        'kazi_rapid_context',
        JSON.stringify({
          primary: PRO.name,
          primaryInitials: PRO.initials,
          date: selectedDate ? selectedDate.toISOString() : null,
        })
      );
    } catch {}
    setSheetOpen(false);
    navigate('/professionals?rapidfill=1');
  };

  const handleSend = (details) => {
    console.log('Sending booking:', { pro: PRO.id, backups, ...details });
    alert(
      `Booking request sent to ${PRO.name}` +
        (backups.length ? ` + ${backups.length} backup${backups.length > 1 ? 's' : ''}` : '')
    );
    setSheetOpen(false);
    sessionStorage.removeItem('kazi_rapid_backups');
    sessionStorage.removeItem('kazi_rapid_context');
    setBackups([]);
  };

  // ===== Reliability tier colors =====
  const reliabilityTier = useMemo(() => {
    if (PRO.reliability >= 95) return { bg: '#f1f9f5', color: '#1a7f5e', border: '#e8f3ee' };
    if (PRO.reliability >= 85) return { bg: '#f1ebfa', color: '#7c3aed', border: '#e4d7f7' };
    if (PRO.reliability >= 70) return { bg: '#fef3e6', color: '#d97706', border: '#fce0bf' };
    return { bg: '#fdecec', color: '#dc2626', border: '#f9d4d4' };
  }, []);

  return (
    <div
      className="bg-[#f9f8f6] min-h-screen pb-28"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Nav />
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
        <button className="w-[38px] h-[38px] rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#1a1a1a]">
          <IconShare />
        </button>
        <button className="w-[38px] h-[38px] rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#e8734a]">
          <IconHeart />
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
              style={{
                background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {PRO.initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-[30px] h-[30px] bg-[#1a7f5e] rounded-full flex items-center justify-center border-[3px] border-white text-white">
              <IconCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className="text-[26px] font-extrabold leading-tight mb-1 text-[#1a1a1a]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {PRO.name}
          </div>
          <div className="text-sm text-[#5a5a5a] mb-2.5">
            {PRO.role} · {PRO.location}
          </div>
          <div className="inline-flex gap-1.5 mb-3 flex-wrap justify-center">
            {PRO.creds.map((c) => (
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
              <span className="text-[#f4b740] text-[18px] leading-none">★</span>
              <span className="font-bold text-[15px] text-[#1a1a1a]">{PRO.rating.toFixed(1)}</span>
              <span className="text-[#8a8a8a]">({PRO.reviews})</span>
            </span>
            <span className="text-[#ececec] mx-1">·</span>
            <span className="inline-flex items-center gap-1 text-[#5a5a5a]">
              <span className="text-[#8a8a8a]">
                <IconPin />
              </span>
              {PRO.distance}
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a7f5e] mt-2.5">
            <div className="w-[7px] h-[7px] bg-[#1a7f5e] rounded-full animate-pulse" />
            {PRO.activity}
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center mt-3.5">
            {PRO.badges.map((badge, idx) => {
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
                  {idx === 0 && (
                    <span style={{ color: isPurple ? '#7c3aed' : '#1a7f5e' }}>
                      <IconShield />
                    </span>
                  )}
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
          <div className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            ${PRO.rate}/hr
          </div>
        </div>
        <div className="bg-white rounded-2xl p-3.5 border border-[#f3f3f3] text-center">
          <div className="text-[10px] text-[#8a8a8a] uppercase tracking-wide font-semibold mb-1">Bookings</div>
          <div className="text-lg font-bold text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {PRO.bookings}
          </div>
        </div>
        <div
          className="rounded-2xl p-3.5 border text-center"
          style={{ background: reliabilityTier.bg, borderColor: reliabilityTier.border }}
        >
          <div className="text-[10px] uppercase tracking-wide font-semibold mb-1" style={{ color: reliabilityTier.color }}>
            Reliability
          </div>
          <div className="text-lg font-bold" style={{ fontFamily: "'Outfit', sans-serif", color: reliabilityTier.color }}>
            {PRO.reliability}%
          </div>
        </div>
      </div>

      {/* About */}
      <Section title="About">
        <div className="text-sm leading-relaxed text-[#5a5a5a]">{PRO.about}</div>
      </Section>

      {/* Availability calendar — tapping a green day opens the BookingSheet */}
      <div className="bg-white mx-4 mb-3 rounded-[20px] p-5 border border-[#f3f3f3]">
        <Calendar availableDays={PRO.availableDays} onDayClick={handleDayClick} />
      </div>

      {/* Credentials */}
      <Section title="Credentials">
        <div className="flex flex-wrap gap-2">
          {PRO.credentialsList.map((c) => (
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
          {PRO.software.map((s) => (
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
          {PRO.experience.map((e) => (
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
        {PRO.languages.map((l, i) => (
          <div
            key={l.name}
            className={`flex items-center justify-between py-3 ${
              i !== PRO.languages.length - 1 ? 'border-b border-[#f3f3f3]' : ''
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
      <Section title={`Reviews (${PRO.reviews})`}>
        {PRO.reviewsList.map((r, i) => (
          <div
            key={i}
            className={`py-3.5 ${
              i !== PRO.reviewsList.length - 1 ? 'border-b border-[#f3f3f3]' : ''
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
          See all {PRO.reviews} reviews
        </button>
      </Section>

      {/* Sticky action bar — tapping Book also opens the BookingSheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-5 pt-3.5 pb-7 border-t border-[#f3f3f3] flex gap-2.5 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] sm:max-w-[480px] sm:left-1/2 sm:-translate-x-1/2">
        <button className="w-14 h-[52px] rounded-full bg-[#f9f8f6] border border-[#ececec] flex items-center justify-center text-[#1a1a1a]">
          <IconMessage />
        </button>
        <button
          onClick={handleBookButtonClick}
          className="flex-1 bg-[#1a7f5e] text-white rounded-full font-bold text-[15px] flex items-center justify-center gap-2"
        >
          <IconCalendarSmall />
          Book {PRO.firstName}
        </button>
      </div>

      {/* Booking sheet overlay */}
      <BookingSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        pro={PRO}
        selectedDate={selectedDate}
        backups={backups}
        onLaunchRapidFill={handleLaunchRapidFill}
        onSend={handleSend}
      />
    </div>
  );
}
