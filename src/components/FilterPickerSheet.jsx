import React, { useEffect } from 'react';

// ============================================================
// KAZI FILTER PICKER SHEET — Generic option picker bottom sheet
// Reused for Distance, Min Pay, Posted Within filters
// Props: open, title, options[{label, value}], selected, onSelect(value), onClose
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f5f0',
  card: '#ffffff',
  bg: '#f9f8f6',
  text: '#1a1a1a',
  textLight: '#9ca3af',
  border: '#e5e7eb',
  borderSoft: '#f3f4f6',
};

export default function FilterPickerSheet({ open, title, options = [], selected, onSelect, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes fpFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fpSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
      `}</style>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 200, animation: 'fpFade .22s ease-out' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', left: '50%', bottom: 0, transform: 'translate(-50%, 0)',
          width: '100%', maxWidth: 480, background: COLORS.card,
          borderRadius: '28px 28px 0 0', zIndex: 201,
          fontFamily: "'DM Sans', sans-serif", padding: '12px 20px 28px',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -16px 48px rgba(0,0,0,0.2)',
          animation: 'fpSlide .36s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
      >
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '0 auto 14px' }} />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text, marginBottom: 16 }}>{title}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((opt) => {
            const isActive = selected === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => { onSelect(opt.value); onClose(); }}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  borderRadius: 14,
                  background: isActive ? COLORS.greenSoft : COLORS.bg,
                  border: `1.5px solid ${isActive ? COLORS.green : COLORS.border}`,
                  color: isActive ? COLORS.green : COLORS.text,
                  fontFamily: 'inherit',
                  fontSize: 14,
                  fontWeight: isActive ? 800 : 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                {opt.label}
                {isActive && (
                  <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
