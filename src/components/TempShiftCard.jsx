import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// Shared "large" temp shift card.
// Used on Find Shifts (vertical list) and the provider dashboard's
// "Shifts near you" horizontal carousel. The card is layout-agnostic
// — it sets its own internal padding but no outer margin, so the
// caller controls spacing/width.
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  gold: '#f4b740',
};

function getInitials(name) {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function OfficeAvatar({ item, onClick }) {
  const initials = getInitials(item.name) || item.initials;
  const [failed, setFailed] = useState(false);
  const baseStyle = {
    width: 48,
    height: 48,
    borderRadius: 14,
    flexShrink: 0,
    border: '1.5px solid white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    cursor: 'pointer',
  };
  if (item.logoUrl && !failed) {
    return (
      <img
        src={item.logoUrl}
        alt={item.name}
        onClick={onClick}
        onError={() => setFailed(true)}
        style={{ ...baseStyle, objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      onClick={onClick}
      style={{
        ...baseStyle,
        background: 'linear-gradient(135deg, #99f6e4 0%, #7dd3fc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        fontWeight: 800,
        fontSize: 13,
        color: 'white',
        letterSpacing: '-0.3px',
      }}
    >
      {initials}
    </div>
  );
}

export function CardHeader({ item }) {
  const navigate = useNavigate();
  const goOffice = (e) => {
    e.stopPropagation();
    navigate(`/office/${item.officeId || item.id || 'demo'}`);
  };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
      <OfficeAvatar item={item} onClick={goOffice} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          onClick={goOffice}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            color: '#111111',
            lineHeight: 1.2,
            marginBottom: 4,
            letterSpacing: '-0.3px',
            cursor: 'pointer',
          }}
        >
          {item.name}
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.textMid, lineHeight: 1.2, marginBottom: 6 }}>
          {item.role}
        </div>
        <div style={{ fontSize: 12, color: COLORS.textLight, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {item.distance}
        </div>
        {(item.rating || item.applied != null) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
            {item.rating && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700, color: COLORS.text }}>
                <span style={{ color: COLORS.gold, fontSize: 18, lineHeight: 1 }}>★</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16 }}>{item.rating}</span>
                {item.reviewCount != null && (
                  <span style={{ color: COLORS.textLight, fontWeight: 600, fontSize: 12 }}>({item.reviewCount})</span>
                )}
              </div>
            )}
            {item.applied != null && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: COLORS.green,
                  fontWeight: 700,
                  background: COLORS.greenTint,
                  border: `1px solid ${COLORS.greenSoft}`,
                  padding: '5px 10px',
                  borderRadius: 100,
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
                <strong style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13 }}>{item.applied}</strong> applied
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function ExtraChip({ children }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        padding: '7px 12px',
        borderRadius: 100,
        fontSize: 12,
        fontWeight: 700,
        color: COLORS.text,
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

export default function TempShiftCard({ shift, onApply, style }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 22,
        padding: 18,
        position: 'relative',
        ...style,
      }}
    >
      {/* Hourly rate — top right */}
      <div style={{ position: 'absolute', top: 18, right: 18, textAlign: 'right' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: COLORS.green, fontSize: 13, lineHeight: 1 }}>
          ${shift.pay}/hr
        </div>
      </div>
      <CardHeader item={shift} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '11px 14px',
          background: COLORS.bg,
          borderRadius: 12,
          marginBottom: 10,
          fontFamily: "'Outfit', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: COLORS.text,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {shift.when}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {shift.lunch && <ExtraChip>{shift.lunch}</ExtraChip>}
        {shift.software && <ExtraChip>{shift.software}</ExtraChip>}
        <button
          onClick={onApply}
          style={{
            background: COLORS.green,
            color: 'white',
            border: 'none',
            borderRadius: 100,
            padding: '7px 22px',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          Apply
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
}
