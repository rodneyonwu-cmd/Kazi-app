import React, { useState } from 'react';

// ============================================================
// KAZI RAPID FILL BANNER — Expandable info banner for rapid-fill shifts
// Renders between the office hero and the earn banner.
// Only shown when shift.isRapidFill === true.
// ============================================================

export default function RapidFillBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Banner */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          background: '#f3ecfd',
          border: '1.5px solid #d9c7f5',
          borderRadius: 14,
          margin: '0 20px 14px',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              color: '#5b21b6',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Rapid Fill Request
          </div>
          <div style={{ fontSize: 11, color: '#6b21a8', fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>
            First provider to accept gets the shift
          </div>
        </div>

        {/* Chevron */}
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(124, 58, 237, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Explainer (expandable) */}
      {open && (
        <div
          style={{
            background: '#faf6ff',
            border: '1.5px dashed #d9c7f5',
            borderRadius: 12,
            margin: '-8px 20px 14px',
            padding: '12px 14px',
            fontSize: 11.5,
            lineHeight: 1.5,
            color: '#5b21b6',
          }}
        >
          <strong style={{ fontWeight: 800 }}>What is Rapid Fill?</strong>{' '}
          This office needs coverage fast and has invited multiple providers at once.
          The first one to tap Accept locks the shift instantly — no waiting for approval.
          Act fast to secure it.
        </div>
      )}
    </>
  );
}
