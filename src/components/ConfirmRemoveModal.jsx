import React, { useEffect } from 'react';

// ============================================================
// KAZI CONFIRM REMOVE MODAL — small bottom sheet for destructive actions
// "Remove [name]?" with Cancel + Remove buttons
// ============================================================

const COLORS = {
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  bg: '#f9f8f6',
  danger: '#dc2626',
  dangerSoft: '#fef2f2',
};

export default function ConfirmRemoveModal({ open, itemName, onCancel, onConfirm }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onCancel && onCancel(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes kaziConfirmFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kaziConfirmSlide { from { transform: translate(-50%, 30%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>

      <div
        onClick={onCancel}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 200,
          animation: 'kaziConfirmFade 0.22s ease-out',
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
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
          animation: 'kaziConfirmSlide 0.32s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: COLORS.dangerSoft,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.danger} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
            <path d="M3 6h18" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
            marginBottom: 6,
          }}
        >
          Remove {itemName}?
        </div>
        <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.5, marginBottom: 18 }}>
          This can&apos;t be undone.
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '13px 0',
              borderRadius: 100,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              background: COLORS.bg,
              color: COLORS.text,
              border: `1.5px solid ${COLORS.border}`,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '13px 0',
              borderRadius: 100,
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              background: COLORS.danger,
              color: 'white',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </>
  );
}
