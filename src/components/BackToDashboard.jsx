import React from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// KAZI BACK TO DASHBOARD — Shared back button
// Circle + "Dashboard" label, navigates to /dashboard
// ============================================================

export default function BackToDashboard() {
  const navigate = useNavigate();
  const go = () => navigate('/dashboard');
  return (
    <div
      onClick={go}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        padding: '6px 8px 6px 0',
      }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); go(); }}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#f9f8f6',
          border: '1px solid #f3f3f3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          padding: 0,
          fontFamily: 'inherit',
        }}
        aria-label="Back to Dashboard"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: '#5a5a5a',
        }}
      >
        Dashboard
      </span>
    </div>
  );
}
