import React, { useState, useEffect, useMemo, useRef } from 'react';

// ============================================================
// KAZI FIND PROS SHEET — Slide-up bottom sheet
// Opens from OfficeDashboard "Find Pros" quick tile
// Collects role, date, time, lunch, rapid fill preferences,
// then navigates to /professionals with query params.
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenDark: '#15604a',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  amber: '#d97706',
  red: '#dc2626',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
};

const ROLES = ['Hygienist', 'Assistant', 'Front Desk', 'Dentist'];
const LUNCH_OPTIONS = [30, 45, 60];
const SHORT_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function FindProsSheet({ open, onClose, onSubmit }) {
  const today = new Date();
  const [role, setRole] = useState('Hygienist');
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [lunchOn, setLunchOn] = useState(true);
  const [lunchMins, setLunchMins] = useState(45);

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [open]);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const dates = useMemo(() => {
    const startDay = isCurrentMonth ? today.getDate() : 1;
    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out = [];
    for (let d = startDay; d <= lastDay; d++) {
      out.push(new Date(viewYear, viewMonth, d));
    }
    return out;
  }, [viewYear, viewMonth, isCurrentMonth]);

  const changeMonth = (delta) => {
    let nm = viewMonth + delta;
    let ny = viewYear;
    if (nm < 0) { nm = 11; ny--; }
    if (nm > 11) { nm = 0; ny++; }
    if (ny < today.getFullYear() || (ny === today.getFullYear() && nm < today.getMonth())) return;
    const max = new Date(today.getFullYear(), today.getMonth() + 6, 1);
    if (ny > max.getFullYear() || (ny === max.getFullYear() && nm > max.getMonth())) return;
    setViewYear(ny);
    setViewMonth(nm);
  };

  const isDateSelected = (d) =>
    d.getFullYear() === selectedDate.getFullYear() &&
    d.getMonth() === selectedDate.getMonth() &&
    d.getDate() === selectedDate.getDate();

  const fmt12 = (t) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const handleSubmit = (rapid = false) => {
    onSubmit && onSubmit({
      role,
      date: selectedDate.toISOString().split('T')[0],
      startTime,
      endTime,
      lunchBreakDuration: lunchOn ? lunchMins : null,
      rapidFillEnabled: rapid,
      rapidFillCount: rapid ? 9 : 0,
    });
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes kaziSheetSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
        @keyframes kaziFPOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        .kazi-fp-sheet * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .kazi-fp-sheet .scroll-hide::-webkit-scrollbar { display: none; }
        /* Cap height with dvh so iOS Safari's address bar doesn't push the
           top of the sheet behind the URL bar; vh fallback for older browsers. */
        .kazi-fp-sheet { max-height: 85vh; max-height: 85dvh; }
      `}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200,
          animation: 'kaziFPOverlayFade 0.25s ease-out',
        }}
      />

      {/* Sheet */}
      <div
        className="kazi-fp-sheet"
        style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translate(-50%, 0)',
          width: '100%', maxWidth: 480, background: 'white',
          borderRadius: '28px 28px 0 0', zIndex: 201,
          display: 'flex', flexDirection: 'column',
          fontFamily: "'DM Sans', sans-serif", color: COLORS.text,
          WebkitFontSmoothing: 'antialiased',
          animation: 'kaziSheetSlide 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -10px 50px rgba(0,0,0,0.25)',
        }}
      >
        {/* Drag handle */}
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '12px auto 4px', flexShrink: 0 }} />

        {/* Header */}
        <div style={{ padding: '12px 24px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.text, letterSpacing: '-0.4px', lineHeight: 1.1 }}>
              Find Professionals
            </div>
            <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4 }}>Tell us what you need</div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="scroll-hide" style={{ flex: 1, overflowY: 'auto', padding: '0 0 16px' }}>
          {/* ROLE */}
          <div style={{ padding: '0 24px 22px' }}>
            <div style={sectionLabel}>Role</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {ROLES.map((r) => {
                const sel = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    style={{
                      background: sel ? COLORS.green : 'white',
                      border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
                      color: sel ? 'white' : COLORS.textMid,
                      borderRadius: 100, padding: '10px 18px',
                      fontSize: 13, fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{ height: 8, background: COLORS.bg }} />

          {/* SELECT A DATE */}
          <div style={{ padding: '22px 0 22px' }}>
            <div style={{ padding: '0 24px' }}>
              <div style={sectionLabel}>Select a date</div>
              {/* Month header with chevrons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <button
                  onClick={() => changeMonth(-1)}
                  disabled={isCurrentMonth}
                  style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
                    opacity: isCurrentMonth ? 0.35 : 1,
                  }}
                  aria-label="Previous month"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: COLORS.text, letterSpacing: '-0.2px' }}>
                  {FULL_MONTHS[viewMonth]} {viewYear}
                </div>
                <button
                  onClick={() => changeMonth(1)}
                  style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  aria-label="Next month"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Date strip */}
            <div className="scroll-hide" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 24px 4px', WebkitOverflowScrolling: 'touch' }}>
              {dates.map((d, idx) => {
                const sel = isDateSelected(d);
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(d)}
                    style={{
                      flexShrink: 0, width: 70, padding: '14px 8px',
                      background: sel ? COLORS.greenTint : COLORS.bg,
                      border: `1.5px solid ${sel ? COLORS.green : COLORS.borderSoft}`,
                      borderRadius: 18, textAlign: 'center', cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 10, color: sel ? COLORS.green : COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      {SHORT_DAYS[d.getDay()]}
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, color: sel ? COLORS.green : COLORS.text, marginTop: 4, lineHeight: 1, letterSpacing: '-0.5px' }}>
                      {d.getDate()}
                    </div>
                    <div style={{ fontSize: 10, color: sel ? COLORS.green : COLORS.textLight, marginTop: 4, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                      {SHORT_MONTHS[d.getMonth()]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{ height: 8, background: COLORS.bg }} />

          {/* SHIFT HOURS */}
          <div style={{ padding: '22px 24px' }}>
            <div style={sectionLabel}>Shift hours</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <TimeCard label="Start time" value={startTime} onChange={setStartTime} display={fmt12(startTime)} />
              <TimeCard label="End time" value={endTime} onChange={setEndTime} display={fmt12(endTime)} />
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{ height: 8, background: COLORS.bg }} />

          {/* LUNCH BREAK */}
          <div style={{ padding: '22px 24px' }}>
            <div style={sectionLabel}>Lunch break</div>
            <div style={{ background: 'white', border: `1.5px solid ${COLORS.borderSoft}`, borderRadius: 18, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.text }}>Provide a lunch break</div>
                  <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>Unpaid break during the shift</div>
                </div>
                <button
                  onClick={() => setLunchOn(!lunchOn)}
                  style={{
                    position: 'relative', width: 46, height: 26,
                    background: lunchOn ? COLORS.green : COLORS.border,
                    borderRadius: 100, border: 'none', cursor: 'pointer',
                    transition: 'background 0.2s', flexShrink: 0, padding: 0,
                  }}
                  aria-label="Toggle lunch break"
                >
                  <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transform: lunchOn ? 'translateX(20px)' : 'none', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                </button>
              </div>
              {lunchOn && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.borderSoft}`, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {LUNCH_OPTIONS.map((m) => {
                    const sel = lunchMins === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setLunchMins(m)}
                        style={{
                          background: sel ? COLORS.green : 'white',
                          border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
                          color: sel ? 'white' : COLORS.textMid,
                          borderRadius: 100, padding: '8px 16px',
                          fontSize: 12, fontWeight: 700,
                          fontFamily: "'DM Sans', sans-serif",
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        {m === 60 ? '1 hour' : `${m} min`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{ height: 8, background: COLORS.bg }} />

          {/* RAPID FILL */}
          <div style={{ padding: '22px 24px' }}>
            <div style={sectionLabel}>Rapid fill</div>
            <div onClick={() => handleSubmit(true)} style={{ background: 'white', border: `1.5px solid ${COLORS.borderSoft}`, borderRadius: 18, padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: COLORS.greenTint, border: `1px solid ${COLORS.greenSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill={COLORS.green} stroke={COLORS.green} strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.text, lineHeight: 1.2 }}>Rapid Fill</div>
                <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 3, lineHeight: 1.4 }}>Add up to 9 backup pros. First to accept gets the shift.</div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{ padding: '14px 20px 26px', borderTop: `1px solid ${COLORS.borderSoft}`, background: 'white', flexShrink: 0 }}>
          <button
            onClick={() => handleSubmit(false)}
            style={{
              width: '100%', background: COLORS.green, color: 'white',
              border: 'none', borderRadius: 100, padding: '16px 20px',
              fontSize: 15, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
            }}
          >
            Find professionals
          </button>
        </div>
      </div>
    </>
  );
}

function TimeCard({ label, value, onChange, display }) {
  const inputRef = useRef(null);
  return (
    <div
      onClick={() => inputRef.current?.showPicker?.() || inputRef.current?.focus()}
      style={{
        background: 'white', border: `1.5px solid ${COLORS.borderSoft}`,
        borderRadius: 18, padding: '14px 16px', cursor: 'pointer',
        position: 'relative',
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: COLORS.text, letterSpacing: '-0.3px' }}>
        {display}
      </div>
      <input
        ref={inputRef}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', border: 'none', background: 'transparent' }}
      />
    </div>
  );
}

const sectionLabel = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: COLORS.textLight,
  marginBottom: 14,
};
