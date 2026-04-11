import React, { useEffect, useState } from 'react';

// ============================================================
// KAZI ADD LANGUAGE SHEET
// Pick a language + level
// Props: open, options[], levels[], existingNames[], onClose, onConfirm({ name, level })
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f5f0',
  greenTint: '#f1f9f5',
  card: '#ffffff',
  bg: '#f9f8f6',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
};

export default function AddLanguageSheet({ open, options = [], levels = [], existingNames = [], onClose, onConfirm }) {
  const [pickedName, setPickedName] = useState('');
  const [pickedLevel, setPickedLevel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPickedName('');
      setPickedLevel('');
      setSubmitting(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const existingSet = new Set(existingNames.map((n) => n.toLowerCase()));

  const handleSubmit = async () => {
    if (!pickedName || !pickedLevel || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm({ name: pickedName, level: pickedLevel });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes kaziLangFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kaziLangSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 200,
          animation: 'kaziLangFade 0.22s ease-out',
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 0,
          transform: 'translate(-50%, 0)',
          width: '100%',
          maxWidth: 480,
          background: COLORS.card,
          borderRadius: '28px 28px 0 0',
          zIndex: 201,
          fontFamily: "'DM Sans', sans-serif",
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -16px 48px rgba(0,0,0,0.2)',
          animation: 'kaziLangSlide 0.36s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px 18px 8px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.text, letterSpacing: '-0.3px' }}>
              Add Language
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: COLORS.bg,
                border: `1px solid ${COLORS.borderSoft}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ padding: '8px 18px 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Language
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 22 }}>
            {options.map((name) => {
              const already = existingSet.has(name.toLowerCase());
              const isPicked = pickedName === name;
              return (
                <button
                  key={name}
                  onClick={() => { if (!already) setPickedName(name); }}
                  disabled={already}
                  style={{
                    background: already ? COLORS.greenTint : isPicked ? COLORS.green : COLORS.bg,
                    color: already ? COLORS.green : isPicked ? 'white' : COLORS.text,
                    border: `1.5px solid ${already ? COLORS.greenSoft : isPicked ? COLORS.green : COLORS.border}`,
                    padding: '8px 14px',
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    cursor: already ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    opacity: already ? 0.85 : 1,
                  }}
                >
                  {(already || isPicked) && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {name}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Proficiency
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {levels.map((lvl) => {
              const isPicked = pickedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setPickedLevel(lvl)}
                  style={{
                    flex: '1 1 calc(50% - 4px)',
                    minWidth: 120,
                    background: isPicked ? COLORS.green : COLORS.bg,
                    color: isPicked ? 'white' : COLORS.text,
                    border: `1.5px solid ${isPicked ? COLORS.green : COLORS.border}`,
                    padding: '12px 14px',
                    borderRadius: 14,
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    cursor: 'pointer',
                  }}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            padding: '14px 18px 24px',
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
            borderTop: `1px solid ${COLORS.borderSoft}`,
            background: COLORS.card,
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={!pickedName || !pickedLevel || submitting}
            style={{
              width: '100%',
              padding: '15px 18px',
              borderRadius: 100,
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: 15,
              background: !pickedName || !pickedLevel || submitting ? COLORS.border : COLORS.green,
              color: 'white',
              border: 'none',
              cursor: !pickedName || !pickedLevel || submitting ? 'default' : 'pointer',
            }}
          >
            {submitting ? 'Adding…' : 'Add Language'}
          </button>
        </div>
      </div>
    </>
  );
}
