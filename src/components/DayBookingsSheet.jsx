import { useEffect } from 'react';

// ============================================================
// KAZI DAY BOOKINGS SHEET — bottom sheet that opens when the
// office user taps a booked day on the dashboard calendar.
//
// Shows that day's bookings inline (no nav away) with quick
// access to each shift's full detail page. For days that still
// have open shifts (booked-open), also surfaces an "Open shifts"
// section that routes into Bookings → Open tab.
//
// Props:
//   open: boolean
//   onClose: () => void
//   day: { date, label, bookings: [{ id, providerName, providerInitials, role, timeRange, status }], openShifts: [{ id, role, timeRange, applicants }] }
//   onBookingTap: (booking) => void
//   onOpenShiftTap: (shift) => void
//   onViewAllOpen: () => void
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenDark: '#146449',
  greenSoft: '#f5faf7',
  greenBorder: '#dcebe3',
  coral: '#e8734a',
  coralSoft: '#fdeee7',
  text: '#0f1a16',
  textMid: '#6b7875',
  textLight: '#9aa5a1',
  border: '#e8e6e1',
};

export default function DayBookingsSheet({
  open,
  onClose,
  day,
  onBookingTap,
  onOpenShiftTap,
  onViewAllOpen,
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !day) return null;

  const bookings = day.bookings || [];
  const openShifts = day.openShifts || [];
  const totalBookings = bookings.length;
  const totalOpen = openShifts.length;

  let subtitle = '';
  if (totalBookings > 0 && totalOpen > 0) {
    subtitle = `${totalBookings} booking${totalBookings === 1 ? '' : 's'} · ${totalOpen} open shift${totalOpen === 1 ? '' : 's'}`;
  } else if (totalBookings > 0) {
    subtitle = `${totalBookings} booking${totalBookings === 1 ? '' : 's'}`;
  } else if (totalOpen > 0) {
    subtitle = `${totalOpen} open shift${totalOpen === 1 ? '' : 's'}`;
  } else {
    subtitle = 'No activity on this day';
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 26, 22, 0.45)',
          zIndex: 90,
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
      />

      <div
        data-no-swipe-back
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: 0,
          width: '100%',
          maxWidth: 480,
          background: '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.18)',
          zIndex: 100,
          maxHeight: '85dvh',
          display: 'flex',
          flexDirection: 'column',
          touchAction: 'pan-y',
        }}
      >
        {/* Grabber */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
          <span style={{ width: 42, height: 4, background: '#e2e0db', borderRadius: 999 }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: 19,
                color: COLORS.text,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              {day.label}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                fontSize: 13,
                color: COLORS.textMid,
                letterSpacing: '-0.01em',
                marginTop: 4,
              }}
            >
              {subtitle}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#f3f2ee',
              border: 'none',
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#3a4a44" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '4px 16px 24px', flex: 1 }}>
          {bookings.length > 0 && (
            <SectionHeader label="Bookings" />
          )}
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} onTap={() => onBookingTap(b)} />
          ))}

          {openShifts.length > 0 && (
            <>
              <SectionHeader label="Open shifts" trailing={
                <button
                  onClick={onViewAllOpen}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: COLORS.green,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  View all
                </button>
              } />
              {openShifts.map((s) => (
                <OpenShiftRow key={s.id} shift={s} onTap={() => onOpenShiftTap(s)} />
              ))}
            </>
          )}

          {bookings.length === 0 && openShifts.length === 0 && (
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 14,
                color: COLORS.textMid,
                textAlign: 'center',
                padding: '24px 0',
              }}
            >
              Nothing scheduled for this day.
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SectionHeader({ label, trailing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 4px 8px' }}>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: 11.5,
          color: COLORS.textLight,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {trailing}
    </div>
  );
}

function BookingRow({ booking, onTap }) {
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'checked-in';
  const roleText = booking.shortRole || booking.role;
  const timeText = booking.timeShort || booking.timeRange;
  return (
    <button
      onClick={onTap}
      style={{
        width: '100%',
        background: '#ffffff',
        border: `1px solid #f3f3f3`,
        borderRadius: 18,
        padding: '16px 18px',
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      {booking.avatarUrl ? (
        <img
          src={booking.avatarUrl}
          alt={booking.providerName}
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            objectFit: 'cover',
            flexShrink: 0,
            border: '1px solid #f3f3f3',
          }}
        />
      ) : (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#f9f8f6',
            border: '1px solid #f3f3f3',
            color: '#1a1a1a',
            display: 'grid',
            placeItems: 'center',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {booking.providerInitials}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: '#1a1a1a',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: 2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {booking.providerName}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12.5,
            color: '#8a8a8a',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            lineHeight: 1.35,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexWrap: 'wrap',
          }}
        >
          <span>{roleText}</span>
          <Dot />
          <span>{timeText}</span>
          {typeof booking.hours === 'number' && (
            <>
              <Dot />
              <span>{booking.hours} hrs</span>
            </>
          )}
        </div>
      </div>

      <div style={{ flexShrink: 0 }}>
        {isConfirmed ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              background: '#1a7f5e',
              color: 'white',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '5px 10px',
              borderRadius: 100,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 8, height: 8 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Confirmed
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '5px 10px',
              borderRadius: 100,
              background: '#fef3e6',
              color: '#d97706',
              border: '1px solid #fce0bf',
            }}
          >
            Pending
          </span>
        )}
      </div>
    </button>
  );
}

function Dot() {
  return <span style={{ width: 2, height: 2, background: '#8a8a8a', borderRadius: '50%' }} />;
}

function OpenShiftRow({ shift, onTap }) {
  return (
    <button
      onClick={onTap}
      style={{
        width: '100%',
        background: COLORS.coralSoft,
        border: `1px solid #fad9c9`,
        borderRadius: 14,
        padding: '12px 14px',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: COLORS.coral,
          color: '#ffffff',
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12" y2="16" />
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: COLORS.text,
            letterSpacing: '-0.02em',
            marginBottom: 3,
          }}
        >
          {shift.role}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12.5,
            fontWeight: 500,
            color: COLORS.textMid,
            letterSpacing: '-0.01em',
          }}
        >
          {shift.timeRange}
          {typeof shift.applicants === 'number' && ` · ${shift.applicants} applicant${shift.applicants === 1 ? '' : 's'}`}
        </div>
      </div>

      <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>
  );
}
