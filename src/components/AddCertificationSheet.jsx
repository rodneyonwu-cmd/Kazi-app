import React, { useEffect, useMemo, useState } from 'react';

// ============================================================
// KAZI ADD CERTIFICATION SHEET
// Pick a cert + optional expiration date + (placeholder) file upload
// Props: open, options[], existingNames[], onClose, onConfirm({ name, expirationDate })
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

export default function AddCertificationSheet({ open, options = [], existingNames = [], onClose, onConfirm }) {
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setQuery('');
      setPicked('');
      setExpirationDate('');
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

  const existingSet = useMemo(() => new Set(existingNames.map((n) => n.toLowerCase())), [existingNames]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const handleSubmit = async () => {
    if (!picked || submitting) return;
    setSubmitting(true);
    try {
      await onConfirm({ name: picked, expirationDate: expirationDate || null });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes kaziCertFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kaziCertSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 200,
          animation: 'kaziCertFade 0.22s ease-out',
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
          animation: 'kaziCertSlide 0.36s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '12px 18px 8px', flexShrink: 0 }}>
          <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.text, letterSpacing: '-0.3px' }}>
              Add Certification
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

        <div style={{ padding: '8px 18px 12px', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: COLORS.bg,
              border: `1px solid ${COLORS.borderSoft}`,
              borderRadius: 100,
              padding: '11px 16px',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search certifications…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'none',
                fontSize: 13,
                fontFamily: 'inherit',
                color: COLORS.text,
                fontWeight: 500,
              }}
            />
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 18px 12px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignContent: 'flex-start',
          }}
        >
          {filtered.map((name) => {
            const already = existingSet.has(name.toLowerCase());
            const isPicked = picked === name;
            return (
              <button
                key={name}
                onClick={() => { if (!already) setPicked(name); }}
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

        {/* Optional fields */}
        <div style={{ padding: '0 18px 12px', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            Expiration date (optional)
          </div>
          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 14px',
              borderRadius: 12,
              border: `1.5px solid ${COLORS.border}`,
              background: COLORS.bg,
              fontFamily: 'inherit',
              fontSize: 14,
              color: COLORS.text,
              outline: 'none',
            }}
          />

          <button
            type="button"
            disabled
            title="Coming soon"
            style={{
              marginTop: 10,
              width: '100%',
              padding: '11px 14px',
              borderRadius: 12,
              border: `1.5px dashed ${COLORS.border}`,
              background: COLORS.bg,
              fontFamily: 'inherit',
              fontSize: 13,
              color: COLORS.textLight,
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload proof — coming soon
          </button>
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
            disabled={!picked || submitting}
            style={{
              width: '100%',
              padding: '15px 18px',
              borderRadius: 100,
              fontFamily: 'inherit',
              fontWeight: 800,
              fontSize: 15,
              background: !picked || submitting ? COLORS.border : COLORS.green,
              color: 'white',
              border: 'none',
              cursor: !picked || submitting ? 'default' : 'pointer',
            }}
          >
            {submitting ? 'Adding…' : 'Add Certification'}
          </button>
        </div>
      </div>
    </>
  );
}
