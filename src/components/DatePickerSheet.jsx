import React, { useState, useEffect } from 'react';

// ============================================================
// KAZI DATE PICKER SHEET — Calendar bottom sheet for shift date filter
// Shows April 2026 with green-tinted dates that have available shifts.
// Props: open, selectedDate, availableDates[], onSelect(dateStr), onClose
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f5f0',
  greenTint: '#f1f9f5',
  card: '#ffffff',
  bg: '#f9f8f6',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#9ca3af',
  border: '#e5e7eb',
  borderSoft: '#f3f4f6',
};

const MONTH = 'April 2026';
const YEAR = 2026;
const MONTH_IDX = 3; // April
const DAYS_IN_MONTH = 30;
const START_DOW = 3; // April 1 2026 = Wednesday (0=Sun)
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TODAY = 12; // Apr 12

export default function DatePickerSheet({ open, selectedDate, availableDates = [], onSelect, onClose }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const availSet = new Set(availableDates.map((d) => {
    if (typeof d === 'number') return d;
    const parsed = new Date(d + 'T12:00:00');
    return parsed.getDate();
  }));

  const selectedDay = selectedDate ? new Date(selectedDate + 'T12:00:00').getDate() : null;

  const cells = [];
  for (let i = 0; i < START_DOW; i++) cells.push(null);
  for (let d = 1; d <= DAYS_IN_MONTH; d++) cells.push(d);

  const handlePick = (day) => {
    if (!day || day < TODAY) return;
    const dd = String(day).padStart(2, '0');
    onSelect(`${YEAR}-${String(MONTH_IDX + 1).padStart(2, '0')}-${dd}`);
  };

  return (
    <>
      <style>{`
        @keyframes dpFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dpSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
      `}</style>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 200, animation: 'dpFade .22s ease-out' }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed', left: '50%', bottom: 0, transform: 'translate(-50%, 0)',
          width: '100%', maxWidth: 480, background: COLORS.card,
          borderRadius: '28px 28px 0 0', zIndex: 201,
          fontFamily: "'DM Sans', sans-serif", padding: '12px 20px 28px',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          boxShadow: '0 -16px 48px rgba(0,0,0,0.2)',
          animation: 'dpSlide .36s cubic-bezier(0.32, 0.72, 0, 1) both',
        }}
      >
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text }}>{MONTH}</div>
          <button onClick={onClose} style={{ background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 12, fontSize: 10, color: COLORS.textLight, fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.greenSoft, border: `1px solid ${COLORS.green}40` }} />
            Shifts available
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.green }} />
            Selected
          </div>
        </div>

        {/* Day of week headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {DOW_LABELS.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: COLORS.textLight, textTransform: 'uppercase', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`e${i}`} style={{ aspectRatio: '1' }} />;
            const isPast = day < TODAY;
            const isToday = day === TODAY;
            const isSelected = day === selectedDay;
            const hasShifts = availSet.has(day) && !isPast;
            const tappable = !isPast;

            let bg = 'transparent';
            let color = COLORS.text;
            let border = 'none';
            let fontWeight = 600;

            if (isSelected) { bg = COLORS.green; color = 'white'; fontWeight = 800; }
            else if (isToday) { bg = 'transparent'; color = COLORS.green; border = `2px solid ${COLORS.green}`; fontWeight = 800; }
            else if (hasShifts) { bg = COLORS.greenSoft; color = COLORS.green; fontWeight = 700; }
            else if (isPast) { color = '#d1d5db'; }

            return (
              <div
                key={day}
                onClick={() => tappable && handlePick(day)}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 14,
                  fontWeight,
                  color,
                  background: bg,
                  border,
                  borderRadius: 10,
                  cursor: tappable ? 'pointer' : 'default',
                  position: 'relative',
                }}
              >
                {day}
                {hasShifts && !isSelected && (
                  <div style={{ position: 'absolute', bottom: 3, width: 4, height: 4, borderRadius: '50%', background: COLORS.green }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Clear filter button */}
        {selectedDate && (
          <button
            onClick={() => { onSelect(''); onClose(); }}
            style={{
              width: '100%', marginTop: 16, padding: 14, borderRadius: 100,
              background: COLORS.bg, border: `1.5px solid ${COLORS.border}`,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: COLORS.textMid,
              cursor: 'pointer',
            }}
          >
            Clear date filter
          </button>
        )}
      </div>
    </>
  );
}
