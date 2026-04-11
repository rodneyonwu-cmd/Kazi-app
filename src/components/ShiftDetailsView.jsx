import React from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// KAZI SHIFT DETAILS VIEW — Shared detail screen
// Used by both RequestDetail (invite) and ApplyShift (browse)
// Switch via `mode` prop: "invite" | "browse"
// ============================================================

const DEFAULT_SHIFT = {
  office: {
    id: 'demo',
    initials: 'SP',
    name: 'Sugarland Premier Dental',
    location: 'Sugar Land, TX · 7.8 mi away',
    rating: '4.7',
    reviewCount: 31,
    practiceType: 'General Dentistry',
    software: 'Eaglesoft',
    teamSize: '8 staff',
    parking: 'Free on-site',
    dressCode: 'Scrubs provided',
    address: '1234 Sweetwater Blvd\nSugar Land, TX 77479',
    distance: '7.8 mi',
  },
  date: 'Monday, Apr 14',
  hours: '8:00 AM – 4:00 PM',
  lunch: '45 min',
  rate: '$50/hr',
  role: 'Dental Hygienist',
  earnings: 400,
  note: 'Looking for an experienced RDH comfortable with Eaglesoft. We have a friendly, close-knit team. Scrubs provided. Free parking on-site.',
  expiresIn: '6h 22m',
};

export default function ShiftDetailsView({ mode = 'invite', shift = DEFAULT_SHIFT, onAccept, onDecline, onApply, onSave }) {
  const navigate = useNavigate();
  const isInvite = mode === 'invite';

  return (
    <>
      <style>{`
        .kazi-shift-details * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .kazi-shift-details button { font-family: inherit; cursor: pointer; }
      `}</style>
      <div
        className="kazi-shift-details"
        style={{
          background: '#f9f8f6',
          minHeight: '100vh',
          maxWidth: 480,
          margin: '0 auto',
          boxShadow: '0 0 40px rgba(0,0,0,0.06)',
          fontFamily: "'DM Sans', sans-serif",
          color: '#1a1a1a',
          WebkitFontSmoothing: 'antialiased',
          paddingBottom: 120,
          position: 'relative',
        }}
      >
        {/* Sticky Header */}
        <div
          style={{
            background: '#ffffff',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderBottom: '1px solid #f3f3f3',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: '#f9f8f6',
              border: '1px solid #f3f3f3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              padding: 0,
            }}
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 17, color: '#1a1a1a', flex: 1 }}>
            {isInvite ? 'Shift Request' : 'Shift Details'}
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#8a8a8a', textAlign: 'right', lineHeight: 1.4 }}>
            {isInvite ? (
              <>
                Expires in
                <br />
                <strong style={{ color: '#1a1a1a', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
                  {shift.expiresIn}
                </strong>
              </>
            ) : (
              <>
                Open
                <br />
                <strong style={{ color: '#1a1a1a', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>shift</strong>
              </>
            )}
          </div>
        </div>

        {/* Office hero */}
        <div style={{ padding: '24px 20px', textAlign: 'center' }}>
          <div
            onClick={() => navigate(`/office/${shift.office.id || 'demo'}`)}
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {shift.office.initials}
          </div>
          <div
            onClick={() => navigate(`/office/${shift.office.id || 'demo'}`)}
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#1a1a1a', lineHeight: 1.2, cursor: 'pointer' }}
          >
            {shift.office.name}
          </div>
          <div style={{ fontSize: 14, color: '#8a8a8a', marginTop: 4 }}>{shift.office.location}</div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 10,
              background: '#ffffff',
              border: '1px solid #f3f3f3',
              padding: '7px 14px',
              borderRadius: 100,
            }}
          >
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: '#f4b740', stroke: '#f4b740', strokeWidth: 1 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{shift.office.rating}</span>
            <span style={{ fontSize: 12, color: '#8a8a8a', fontWeight: 600 }}>({shift.office.reviewCount} reviews)</span>
          </div>
        </div>

        {/* Earnings banner */}
        <div
          style={{
            margin: '0 16px 12px',
            background: '#f1f9f5',
            borderRadius: 16,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 14, color: '#5a5a5a', fontWeight: 600 }}>You'll earn</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: '#1a7f5e' }}>${shift.earnings}</div>
        </div>

        {/* Shift details card */}
        <DetailCard title="Shift details">
          <DetailRow icon="calendar" label="Date" value={shift.date} />
          <DetailRow icon="clock" label="Hours" value={shift.hours} />
          <DetailRow icon="lunch" label="Lunch break" value={shift.lunch} />
          <DetailRow icon="dollar" label="Your rate" value={shift.rate} green />
          <DetailRow icon="user" label="Role requested" value={shift.role} />
        </DetailCard>

        {/* Note from office */}
        <div
          style={{
            background: '#ffffff',
            margin: '0 16px 12px',
            borderRadius: 20,
            border: '1px solid #f3f3f3',
            padding: 18,
          }}
        >
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 10 }}>Note from office</div>
          <div style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.6 }}>{shift.note}</div>
        </div>

        {/* View Office Profile */}
        <button
          onClick={() => navigate(`/office/${shift.office.id || 'demo'}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
            margin: '0 0 12px',
            padding: 18,
            background: '#ffffff',
            border: 'none',
            borderTop: '1px solid #f3f3f3',
            borderBottom: '1px solid #f3f3f3',
            borderRadius: 0,
            fontSize: 15,
            fontWeight: 700,
            color: '#1a7f5e',
          }}
        >
          View Office Profile
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* About the office */}
        <DetailCard title="About the office">
          <InfoRow label="Practice type" value={shift.office.practiceType} />
          <InfoRow label="Software" value={shift.office.software} />
          <InfoRow label="Team size" value={shift.office.teamSize} />
          <InfoRow label="Parking" value={shift.office.parking} />
          <InfoRow label="Dress code" value={shift.office.dressCode} />
        </DetailCard>

        {/* Map */}
        <div
          style={{
            margin: '0 16px 12px',
            background: '#ffffff',
            borderRadius: 20,
            border: '1px solid #f3f3f3',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: 140,
              background: 'linear-gradient(135deg, #e8f0e4 0%, #d4e4dc 50%, #e0ead8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: '#1a7f5e',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 12px rgba(26,127,94,0.3)',
              }}
            >
              <div style={{ width: 12, height: 12, background: 'white', borderRadius: '50%', transform: 'rotate(45deg)' }} />
            </div>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{shift.office.address}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a7f5e', flexShrink: 0, marginLeft: 12 }}>{shift.office.distance}</div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 480,
            width: '100%',
            background: '#ffffff',
            borderTop: '1px solid #ececec',
            padding: '14px 16px 28px',
            paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            gap: 10,
            zIndex: 40,
          }}
        >
          <button
            onClick={isInvite ? onAccept : onApply}
            style={{
              flex: 1,
              padding: 15,
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 700,
              background: '#1a7f5e',
              color: 'white',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {isInvite ? `Accept Shift · $${shift.earnings}` : `Apply for Shift · $${shift.earnings}`}
          </button>
          <button
            onClick={isInvite ? onDecline : onSave}
            style={{
              padding: '15px 22px',
              borderRadius: 100,
              fontSize: 15,
              fontWeight: 700,
              background: '#f9f8f6',
              color: '#5a5a5a',
              border: '1px solid #ececec',
            }}
          >
            {isInvite ? 'Decline' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}

function DetailCard({ title, children }) {
  return (
    <div
      style={{
        background: '#ffffff',
        margin: '0 16px 12px',
        borderRadius: 20,
        border: '1px solid #f3f3f3',
        overflow: 'hidden',
      }}
    >
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', padding: '16px 18px 0' }}>
        {title}
      </div>
      <div style={{ padding: '14px 18px 16px' }}>{children}</div>
    </div>
  );
}

function DetailRow({ icon, label, value, green }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #f3f3f3',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: '#f9f8f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={icon} />
        </div>
        <div style={{ fontSize: 13, color: '#8a8a8a' }}>{label}</div>
      </div>
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: green ? '#1a7f5e' : '#1a1a1a',
          textAlign: 'right',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f3f3' }}>
      <div style={{ fontSize: 13, color: '#8a8a8a', flex: 1 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', textAlign: 'right' }}>{value}</div>
    </div>
  );
}

function Icon({ name }) {
  const props = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: '#5a5a5a',
    strokeWidth: 2.2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: { width: 14, height: 14 },
  };
  switch (name) {
    case 'calendar':
      return (
        <svg {...props}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'lunch':
      return (
        <svg {...props}>
          <path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
          <path d="M7 8H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
          <rect x="7" y="4" width="10" height="16" rx="1" />
        </svg>
      );
    case 'dollar':
      return (
        <svg {...props}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}
