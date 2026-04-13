import React, { useState, useEffect, useRef } from 'react';

// ============================================================
// KAZI ZIP INPUT SHEET — Bottom sheet with zip code text input
// Props: open, currentZip, onApply(zip), onClose
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  card: '#ffffff',
  bg: '#f9f8f6',
  text: '#1a1a1a',
  textLight: '#9ca3af',
  border: '#e5e7eb',
  borderSoft: '#f3f4f6',
};

export default function ZipInputSheet({ open, currentZip = '', onApply, onClose }) {
  const [draft, setDraft] = useState(currentZip);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft(currentZip);
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, currentZip]);

  if (!open) return null;

  const handleApply = () => {
    const clean = draft.trim().replace(/\D/g, '').slice(0, 5);
    if (clean.length === 5) {
      onApply(clean);
      onClose();
    }
  };

  return (
    <>
      <style>{`
        @keyframes zipFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zipSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
      `}</style>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 200, animation: 'zipFade .22s ease-out' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', left: '50%', bottom: 0, transform: 'translate(-50%, 0)',
          width: '100%', maxWidth: 480, background: COLORS.card,
          borderRadius: '28px 28px 0 0', zIndex: 201,
          fontFamily: "'DM Sans', sans-serif", padding: '12px 20px 28px',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -16px 48px rgba(0,0,0,0.2)',
          animation: 'zipSlide .36s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
      >
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '0 auto 14px' }} />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text, marginBottom: 16 }}>Zip Code</div>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={5}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, '').slice(0, 5))}
          onKeyDown={(e) => { if (e.key === 'Enter') handleApply(); }}
          placeholder="Enter 5-digit zip"
          style={{
            width: '100%',
            padding: '14px 18px',
            borderRadius: 14,
            border: `1.5px solid ${COLORS.border}`,
            background: COLORS.bg,
            fontFamily: "'Outfit', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.text,
            outline: 'none',
            textAlign: 'center',
            letterSpacing: 4,
            marginBottom: 16,
          }}
        />

        <button
          onClick={handleApply}
          disabled={draft.replace(/\D/g, '').length !== 5}
          style={{
            width: '100%',
            padding: 15,
            borderRadius: 100,
            fontFamily: 'inherit',
            fontWeight: 800,
            fontSize: 15,
            background: draft.replace(/\D/g, '').length === 5 ? COLORS.green : COLORS.border,
            color: 'white',
            border: 'none',
            cursor: draft.replace(/\D/g, '').length === 5 ? 'pointer' : 'default',
          }}
        >
          Apply
        </button>
      </div>
    </>
  );
}
