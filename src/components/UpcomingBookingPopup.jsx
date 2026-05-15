import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// KAZI UPCOMING BOOKING POPUP — office-facing confirmed-shift
// detail sheet. Mirrors the same popup shown in Bookings →
// Upcoming → tap provider, so the office sees a consistent
// "Confirmed shift" view regardless of where they opened it
// from (Bookings list or the dashboard calendar).
//
// Props:
//   booking: {
//     id, name, initials, avatarUrl, role, cred,
//     dateLong, timeRange, hours, hourlyRate, total, startsIn,
//   }
//   onClose: () => void
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  coral: '#e8734a',
  red: '#dc2626',
  redSoft: '#fee2e2',
  bg: '#f9f8f6',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
};

export default function UpcomingBookingPopup({ booking, onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!booking) return null;

  return (
    <>
      <style>{`
        @keyframes kaziUbpSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
        @keyframes kaziUbpFade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.55)',
          zIndex: 200,
          animation: 'kaziUbpFade 0.25s ease-out',
        }}
      />

      <div
        data-no-swipe-back
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          background: 'white',
          borderRadius: '28px 28px 0 0',
          zIndex: 201,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 50px rgba(0,0,0,0.25)',
          animation: 'kaziUbpSlide 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '12px auto 4px', flexShrink: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 18px 0', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px' }}>
          <Hero label="Confirmed shift" title={booking.timeRange} sub={`${booking.hours} hours`} />
          <Chip>Starts in <strong style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{booking.startsIn}</strong></Chip>
          <ProStrip booking={booking} />

          <Section title="Shift details">
            <InfoRow label="Hourly rate" value={`$${booking.hourlyRate}/hr`} />
            <InfoRow label="Hours" value={booking.hours.toString()} />
          </Section>

          <Section title="Location">
            <InfoRow label="Missouri City Dental" valueText="8027 Highway 6" />
            <InfoRow label="Parking" valueText="Free on-site" />
          </Section>
        </div>

        <Footer />
      </div>
    </>
  );
}

function Hero({ label, title, sub }) {
  return (
    <>
      <div style={{ fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: 22, color: COLORS.text, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{title}</div>
      <div style={{ fontSize: 13, color: COLORS.textMid, fontWeight: 500, letterSpacing: '-0.01em', marginTop: 6 }}>{sub}</div>
    </>
  );
}

function Chip({ children }) {
  return (
    <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', background: COLORS.greenTint, border: `1px solid ${COLORS.greenSoft}`, color: COLORS.green }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function ProStrip({ booking }) {
  const navigate = useNavigate();
  const goToProfile = () => navigate(`/professionals/${booking.id}`, {
    state: {
      mock: {
        id: booking.id,
        name: booking.name,
        initials: booking.initials,
        avatarUrl: booking.avatarUrl,
        role: booking.role || 'Dental Professional',
        cred: booking.cred,
        rate: booking.hourlyRate,
      },
    },
  });
  return (
    <div
      onClick={goToProfile}
      style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '16px 0', marginTop: 18, borderTop: `1px solid ${COLORS.borderSoft}`, borderBottom: `1px solid ${COLORS.borderSoft}`, cursor: 'pointer' }}
    >
      {booking.avatarUrl ? (
        <img
          src={booking.avatarUrl}
          alt={booking.name}
          style={{ width: 50, height: 50, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: `1px solid ${COLORS.borderSoft}` }}
        />
      ) : (
        <div style={{ width: 50, height: 50, borderRadius: 14, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text, fontWeight: 700, fontSize: 15, flexShrink: 0, letterSpacing: '-0.02em' }}>
          {booking.initials}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: COLORS.text, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 3 }}>{booking.name}</div>
        <div style={{ fontSize: 12.5, color: COLORS.textMid, fontWeight: 500, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{booking.role}</span>
          {booking.cred && (
            <span style={{ background: COLORS.greenTint, color: COLORS.green, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{booking.cred}</span>
          )}
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

function Section({ title, children }) {
  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ fontWeight: 700, fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function InfoRow({ label, value, valueText, valueGreen }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${COLORS.borderSoft}` }}>
      <div style={{ fontSize: 13, color: COLORS.textMid, fontWeight: 500, letterSpacing: '-0.01em' }}>{label}</div>
      <div style={{ fontWeight: 700, fontSize: valueText ? 12.5 : valueGreen ? 16 : 14, letterSpacing: '-0.01em', color: valueText ? COLORS.textMid : valueGreen ? COLORS.green : COLORS.text, textAlign: 'right' }}>
        {value || valueText}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{ padding: '14px 20px 26px', borderTop: `1px solid ${COLORS.borderSoft}`, background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        style={{ width: 52, height: 52, borderRadius: '50%', border: `1.5px solid ${COLORS.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
        aria-label="Message"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      <button
        style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #fca5a5', background: COLORS.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}
        aria-label="Cancel"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <button
        style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Add to calendar
      </button>
    </div>
  );
}
