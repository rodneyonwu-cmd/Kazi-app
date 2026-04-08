import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// KAZI OFFICE DASHBOARD
// Main home screen with embedded "Post a Job" chooser modal
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenDark: '#15604a',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  coral: '#e8734a',
  coralSoft: '#fdeee7',
  purple: '#7c3aed',
  purpleSoft: '#f1ebfa',
  orange: '#d97706',
  orangeSoft: '#fef3e6',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  gold: '#f4b740',
};

export default function OfficeDashboard() {
  const navigate = useNavigate();
  const [scheduleView, setScheduleView] = useState('week');
  const [chooserOpen, setChooserOpen] = useState(false);

  const openChooser = () => setChooserOpen(true);
  const closeChooser = () => setChooserOpen(false);
  const goToTemp = () => { closeChooser(); navigate('/post/temp'); };
  const goToPermanent = () => { closeChooser(); navigate('/post/permanent'); };

  return (
    <>
      <style>{`
        @keyframes ringPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }
        @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        .kazi-dashboard * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .kazi-dashboard button { font-family: inherit; }
      `}</style>

      <div
        className="kazi-dashboard"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: COLORS.bg,
          color: COLORS.text,
          WebkitFontSmoothing: 'antialiased',
          paddingBottom: 100,
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100vh',
          boxShadow: '0 0 40px rgba(0,0,0,0.06)',
          position: 'relative',
        }}
      >
        {/* TOP BAR */}
        <div
          style={{
            background: COLORS.card,
            padding: '18px 20px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: `1px solid ${COLORS.borderSoft}`,
          }}
        >
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 30,
              color: COLORS.green,
              letterSpacing: '-0.8px',
              flex: 1,
            }}
          >
            kazi.
          </div>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            DO
          </div>
        </div>

        {/* GREETING */}
        <div style={{ padding: '22px 20px 8px' }}>
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: COLORS.text,
              lineHeight: 1.15,
            }}
          >
            Good morning, Dr. Osagie
          </div>
          <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4 }}>
            Missouri City Dental · Tuesday, April 7
          </div>
        </div>

        {/* HERO CTA — Post a Job */}
        <div
          onClick={openChooser}
          style={{
            margin: '18px 16px 8px',
            borderRadius: 24,
            padding: 22,
            background: '#fdfaf3',
            border: '1.5px solid #f0e9d6',
            color: COLORS.text,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${COLORS.greenTint} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              right: 30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${COLORS.coralSoft} 0%, transparent 70%)`,
              pointerEvents: 'none',
            }}
          />
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                background: COLORS.green,
                color: 'white',
                padding: '5px 11px',
                borderRadius: 100,
                marginBottom: 14,
              }}
            >
              Quick Post
            </div>
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: 22,
                lineHeight: 1.2,
                marginBottom: 6,
                color: COLORS.text,
              }}
            >
              Need coverage?
              <br />
              Fill a shift in minutes.
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 18, maxWidth: 260 }}>
              Post a job and our top-rated Houston pros will respond fast.
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openChooser();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: COLORS.green,
                color: 'white',
                padding: '12px 20px',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Post a Job
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ padding: '22px 16px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={quickTileStyle}>
              <div style={quickIconStyle(COLORS.greenTint)}>
                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div style={quickLabelStyle}>Find Pros</div>
            </div>
            <div style={quickTileStyle}>
              <div style={quickIconStyle(COLORS.purpleSoft)}>
                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div style={quickLabelStyle}>My Bookings</div>
            </div>
          </div>
        </div>

        {/* TODAY'S OVERVIEW STATS */}
        <div style={{ padding: '18px 16px 0' }}>
          <SectionHeader title="Today's overview" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <StatCard color="green" icon="check" value="2" label="Active today" />
            <StatCard color="orange" icon="clock" value="3" label="Pending" />
            <StatCard color="coral" icon="alert" value="1" label="Unfilled" />
          </div>
        </div>

        {/* SCHEDULE — Week / Month toggle */}
        <div style={{ padding: '18px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text }}>
              {scheduleView === 'week' ? 'This week' : 'This month'}
            </div>
            <div style={{ display: 'inline-flex', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 100, padding: 3, gap: 2 }}>
              <button onClick={() => setScheduleView('week')} style={toggleBtnStyle(scheduleView === 'week')}>Week</button>
              <button onClick={() => setScheduleView('month')} style={toggleBtnStyle(scheduleView === 'month')}>Month</button>
            </div>
          </div>
          {scheduleView === 'week' ? <WeekStrip /> : <MonthGrid />}
        </div>

        {/* ON-SITE NOW */}
        <div style={{ padding: '18px 16px 0' }}>
          <SectionHeader title="On-site now" linkLabel="View all" />
          <div style={{ background: COLORS.card, margin: '0 4px', padding: 16, display: 'flex', alignItems: 'center', gap: 14, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 18 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: 'white', flexShrink: 0, position: 'relative' }}>
              SK
              <div style={{ position: 'absolute', inset: -3, borderRadius: 19, border: `2px solid ${COLORS.green}`, animation: 'ringPulse 2s infinite' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text, lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 8 }}>
                Sarah K.
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: COLORS.green, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  <span style={{ display: 'inline-block', width: 7, height: 7, background: COLORS.green, borderRadius: '50%', animation: 'pulseDot 2s infinite' }} />
                  Live
                </span>
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMid, marginTop: 3 }}>
                RDH · 8am–5pm <span style={{ color: COLORS.border, margin: '0 5px' }}>·</span> Checked in 7:52 AM
              </div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textMid} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </div>
        </div>

        {/* BOTTOM NAV */}
        <BottomNav />

        {/* POST A JOB CHOOSER MODAL */}
        {chooserOpen && (
          <>
            <div onClick={closeChooser} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)', zIndex: 100, animation: 'fadeIn 0.3s' }} />
            <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: 28, zIndex: 101, paddingBottom: 24, width: 'calc(100% - 40px)', maxWidth: 400, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <div style={{ padding: '24px 24px 8px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, lineHeight: 1.15, color: COLORS.text }}>Post a Job</div>
                  <div style={{ fontSize: 14, color: COLORS.textMid, marginTop: 6, lineHeight: 1.4 }}>What kind of position are you hiring for?</div>
                </div>
                <button onClick={closeChooser} style={{ width: 38, height: 38, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div style={{ padding: '24px 20px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <ChoiceCard type="temp" icon={<svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>} tag="Single day" title="Temp Shift" onClick={goToTemp} />
                <ChoiceCard type="perm" icon={<svg viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>} tag="Long-term hire" title="Permanent Role" onClick={goToPermanent} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function SectionHeader({ title, linkLabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text }}>{title}</div>
      {linkLabel && (
        <button style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
          {linkLabel}
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}
    </div>
  );
}

function StatCard({ color, icon, value, label }) {
  const bgMap = { green: COLORS.greenTint, orange: COLORS.orangeSoft, coral: COLORS.coralSoft };
  const strokeMap = { green: COLORS.green, orange: COLORS.orange, coral: COLORS.coral };
  return (
    <div style={{ background: COLORS.card, borderRadius: 18, padding: '14px 12px', border: `1px solid ${COLORS.borderSoft}`, cursor: 'pointer' }}>
      <div style={{ width: 30, height: 30, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, background: bgMap[color] }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={strokeMap[color]} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
          {icon === 'check' && <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>}
          {icon === 'clock' && <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>}
          {icon === 'alert' && <><path d="M12 9v3m0 3h.01" /><circle cx="12" cy="12" r="10" /></>}
        </svg>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.textLight, fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function WeekStrip() {
  const days = [
    { name: 'Tue', num: 7, dots: [true, true, false], today: true },
    { name: 'Wed', num: 8, dots: [true, false, false] },
    { name: 'Thu', num: 9, dots: [true, true, false] },
    { name: 'Fri', num: 10, dots: [true, false, false] },
    { name: 'Sat', num: 11, dots: [false, false, false] },
    { name: 'Sun', num: 12, dots: [false, false, false] },
    { name: 'Mon', num: 13, dots: [true, true, false] },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', padding: '0 16px 4px', margin: '0 -16px' }}>
      {days.map((d, i) => (
        <div key={i} style={{ flexShrink: 0, width: 72, background: d.today ? COLORS.green : COLORS.card, border: `1px solid ${d.today ? COLORS.green : COLORS.borderSoft}`, borderRadius: 16, padding: '12px 8px', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: d.today ? 'white' : COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>{d.name}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: d.today ? 'white' : COLORS.text, marginTop: 4 }}>{d.num}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 8, height: 6 }}>
            {d.dots.map((filled, j) => (
              <div key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: d.today ? (filled ? 'white' : 'rgba(255,255,255,0.5)') : (filled ? COLORS.green : COLORS.border) }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthGrid() {
  const cells = [
    null, null, null, 1, 2, 3, 4,
    5, 6, { num: 7, today: true }, { num: 8, booked: true }, { num: 9, booked: true }, { num: 10, booked: true }, 11,
    12, { num: 13, booked: true }, { num: 14, booked: true }, 15, { num: 16, booked: true }, 17, 18,
    19, { num: 20, booked: true }, 21, { num: 22, booked: true }, { num: 23, booked: true }, { num: 24, booked: true }, 25,
    26, { num: 27, booked: true }, { num: 28, booked: true }, 29, { num: 30, booked: true }, null, null,
  ];
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 20, padding: '18px 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 4px' }}>
        <button style={{ width: 30, height: 30, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.text }}>April 2026</div>
        <button style={{ width: 30, height: 30, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((l, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', padding: '4px 0 6px' }}>{l}</div>
        ))}
        {cells.map((cell, i) => {
          if (cell === null) return <div key={i} style={{ aspectRatio: '1' }} />;
          const isObj = typeof cell === 'object';
          const num = isObj ? cell.num : cell;
          const today = isObj && cell.today;
          const booked = isObj && cell.booked;
          return (
            <div key={i} style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: booked || today ? 700 : 600, color: today ? 'white' : booked ? COLORS.green : COLORS.text, background: today ? COLORS.green : booked ? COLORS.greenTint : 'transparent', borderRadius: 10, cursor: 'pointer' }}>
              {num}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BottomNav() {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', maxWidth: 480, width: '100%', background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, display: 'flex', padding: '10px 0 22px', zIndex: 40 }}>
      {[
        { label: 'Home', active: true, icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
        { label: 'Find', icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></> },
        { label: 'Bookings', icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></> },
        { label: 'Messages', icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
        { label: 'Profile', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
      ].map((item, i) => (
        <button key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={item.active ? COLORS.green : COLORS.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>{item.icon}</svg>
          <span style={{ fontSize: 10, color: item.active ? COLORS.green : COLORS.textLight, fontWeight: 600 }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function ChoiceCard({ type, icon, tag, title, onClick }) {
  const [hover, setHover] = useState(false);
  const isPerm = type === 'perm';
  const accent = isPerm ? COLORS.purple : COLORS.green;
  const accentSoft = isPerm ? COLORS.purpleSoft : COLORS.greenTint;
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ background: 'white', border: `2px solid ${hover ? accent : COLORS.border}`, borderRadius: 22, padding: 22, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit', transition: 'all 0.2s', position: 'relative', overflow: 'hidden', transform: hover ? 'translateY(-2px)' : 'none', boxShadow: hover ? `0 8px 24px ${isPerm ? 'rgba(124, 58, 237, 0.15)' : 'rgba(26, 127, 94, 0.15)'}` : 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: accentSoft }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 10px', borderRadius: 100, marginBottom: 6, background: accentSoft, color: accent }}>{tag}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.text, lineHeight: 1.15 }}>{title}</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent, transform: hover ? 'translateX(3px)' : 'none', transition: 'transform 0.2s' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </div>
      </div>
    </button>
  );
}

const quickTileStyle = { background: COLORS.card, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 18, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 };
const quickIconStyle = (bg) => ({ width: 38, height: 38, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
const quickLabelStyle = { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.text, lineHeight: 1.2 };
const toggleBtnStyle = (active) => ({ background: active ? COLORS.green : 'none', border: 'none', fontSize: 11, fontWeight: 700, color: active ? 'white' : COLORS.textLight, padding: '6px 14px', borderRadius: 100, cursor: 'pointer', transition: 'all 0.2s' });
