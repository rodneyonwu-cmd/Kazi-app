import React, { useEffect } from 'react';

// ============================================================
// KAZI SUCCESS TOAST — Slide-up confirmation card
// Used when a provider applies to a shift or accepts a request
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f5f0',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  border: '#ececec',
};

export default function SuccessToast({ open, title, subtitle, onClose, autoDismissMs = 2200 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => { onClose && onClose(); }, autoDismissMs);
    return () => clearTimeout(t);
  }, [open, autoDismissMs, onClose]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes kaziToastFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kaziToastSlide {
          0%   { transform: translate(-50%, 100%); opacity: 0; }
          60%  { transform: translate(-50%, -8%); opacity: 1; }
          100% { transform: translate(-50%, 0);    opacity: 1; }
        }
        @keyframes kaziCheckPop {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(3px)',
          zIndex: 200,
          animation: 'kaziToastFade 0.22s ease-out',
        }}
      />

      {/* Sheet */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 'calc(36px + env(safe-area-inset-bottom, 0px))',
          transform: 'translate(-50%, 0)',
          width: 'calc(100% - 32px)',
          maxWidth: 360,
          background: COLORS.card,
          borderRadius: 22,
          padding: '22px 22px 20px',
          boxShadow: '0 20px 56px rgba(0,0,0,0.22)',
          zIndex: 201,
          fontFamily: "'DM Sans', sans-serif",
          textAlign: 'center',
          animation: 'kaziToastSlide 0.42s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: COLORS.greenSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            animation: 'kaziCheckPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: COLORS.text,
            letterSpacing: '-0.3px',
            lineHeight: 1.25,
            marginBottom: subtitle ? 6 : 0,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>
            {subtitle}
          </div>
        )}
      </div>
    </>
  );
}
