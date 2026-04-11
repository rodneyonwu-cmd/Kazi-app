import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import TopBar from '../components/TopBar';

const COLORS = {
  green: '#1a7f5e', greenDark: '#15604a', greenSoft: '#e8f3ee', greenTint: '#f1f9f5',
  coral: '#e8734a', bg: '#f9f8f6', card: '#ffffff', text: '#1a1a1a',
  textMid: '#5a5a5a', textLight: '#8a8a8a', border: '#ececec', borderSoft: '#f3f3f3',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ROLE_RATES = {
  'Dental Assistant': { avg: 22, min: 15, max: 40, plural: 'Dental Assistants' },
  'Hygienist':        { avg: 55, min: 35, max: 80, plural: 'Hygienists' },
  'Front Desk':       { avg: 20, min: 14, max: 32, plural: 'Front Desk staff' },
  'Dentist':          { avg: 95, min: 50, max: 200, plural: 'Dentists' },
  'Student Extern':   { avg: 17, min: 12, max: 25, plural: 'Student Externs' },
};

const ROLES = [
  { name: 'Dental Assistant', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  { name: 'Hygienist', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg> },
  { name: 'Front Desk', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
  { name: 'Dentist', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg> },
  { name: 'Student Extern', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg> },
];

const FULL_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const FULL_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function PostTempShiftWizard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const totalSteps = 7;
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('Dental Assistant');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState({ hour: 8, min: 0, ampm: 'AM' });
  const [endTime, setEndTime] = useState({ hour: 5, min: 0, ampm: 'PM' });
  const [lunchOn, setLunchOn] = useState(true);
  const [lunchDuration, setLunchDuration] = useState('45 min');
  const [rate, setRate] = useState(ROLE_RATES['Dental Assistant'].avg);
  const [notes, setNotes] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => { setRate(ROLE_RATES[role].avg); }, [role]);

  const next = async () => {
    if (step < totalSteps) { setStep(step + 1); window.scrollTo(0, 0); }
    else {
      try {
        const token = await getToken();
        const fmtTime = (t) => `${t.hour}:${t.min < 10 ? '0' + t.min : t.min} ${t.ampm}`;
        const res = await fetch(`${API_URL}/api/shifts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role, date: selectedDate.toISOString(), startTime: fmtTime(startTime), endTime: fmtTime(endTime), hourlyRate: rate, description: notes || null, jobType: 'TEMPORARY' }),
        });
        if (res.ok) setSuccessOpen(true);
        else { const err = await res.json().catch(() => ({})); alert(err.error || 'Failed to post shift'); }
      } catch { alert('Failed to post shift'); }
    }
  };
  const prev = () => { if (step > 1) { setStep(step - 1); window.scrollTo(0, 0); } };
  const jumpTo = (n) => { setStep(n); window.scrollTo(0, 0); };
  const closeSuccess = () => { setSuccessOpen(false); navigate('/dashboard'); };
  const formatTime = (t) => `${t.hour}:${t.min < 10 ? '0' + t.min : t.min} ${t.ampm}`;
  const formatDate = (d) => `${FULL_DAYS[d.getDay()]}, ${FULL_MONTHS[d.getMonth()]} ${d.getDate()}`;

  return (
    <>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes iconBounce { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 60% { transform: scale(1.2) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes iconWiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
        @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes confettiFall { 0% { top: -20px; opacity: 1; } 100% { top: 110%; opacity: 0; } }
        .kazi-temp-wizard * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .kazi-temp-wizard button { font-family: inherit; }
        .kazi-temp-wizard .wheel-col::-webkit-scrollbar { display: none; }
        .kazi-temp-wizard .date-strip::-webkit-scrollbar { display: none; }
      `}</style>
      <div className="kazi-temp-wizard" style={{ fontFamily: "'DM Sans', sans-serif", background: COLORS.bg, color: COLORS.text, WebkitFontSmoothing: 'antialiased', paddingBottom: 110, maxWidth: 480, margin: '0 auto', minHeight: '100vh', boxShadow: '0 0 40px rgba(0,0,0,0.06)', position: 'relative' }}>
        <TopBar role="office" />
        <div style={{ padding: '18px 20px 16px', background: 'white', borderBottom: `1px solid ${COLORS.borderSoft}`, position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <button onClick={() => navigate('/dashboard')} style={{ width: 38, height: 38, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text, lineHeight: 1 }}>Post Temp Shift</div>
              <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 3, fontWeight: 600 }}>Step {step} of {totalSteps}</div>
            </div>
            <div style={{ background: COLORS.greenTint, color: COLORS.green, padding: '5px 11px', borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0 }}>Temp</div>
          </div>
          <div style={{ height: 6, background: COLORS.borderSoft, borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${COLORS.green} 0%, #5eb896 100%)`, borderRadius: 100, width: `${(step / totalSteps) * 100}%`, transition: 'width 0.4s cubic-bezier(0.32, 0.72, 0, 1)' }} />
          </div>
        </div>
        <div style={{ padding: '24px 20px 20px', animation: 'slideIn 0.3s ease-out' }} key={step}>
          {step === 1 && <Step1Role role={role} setRole={setRole} />}
          {step === 2 && <Step2Date selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
          {step === 3 && <Step3Hours startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime} />}
          {step === 4 && <Step4Lunch lunchOn={lunchOn} setLunchOn={setLunchOn} lunchDuration={lunchDuration} setLunchDuration={setLunchDuration} />}
          {step === 5 && <Step5Rate role={role} rate={rate} setRate={setRate} />}
          {step === 6 && <Step6Notes notes={notes} setNotes={setNotes} />}
          {step === 7 && <Step7Review formatTime={formatTime} formatDate={formatDate} role={role} selectedDate={selectedDate} startTime={startTime} endTime={endTime} lunchOn={lunchOn} lunchDuration={lunchDuration} rate={rate} notes={notes} jumpTo={jumpTo} />}
        </div>
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', maxWidth: 480, width: '100%', background: 'white', padding: '14px 20px 26px', borderTop: `1px solid ${COLORS.borderSoft}`, zIndex: 50, display: 'flex', gap: 10 }}>
          <button onClick={prev} disabled={step === 1} style={{ background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 100, padding: '16px 22px', fontSize: 14, fontWeight: 700, cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1, flexShrink: 0 }}>Back</button>
          <button onClick={next} style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {step === totalSteps ? 'Post Shift' : 'Continue'}
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>{step === totalSteps ? <polyline points="20 6 9 17 4 12" /> : <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>}</svg>
          </button>
        </div>
        {successOpen && <SuccessModal onClose={closeSuccess} />}
      </div>
    </>
  );
}

function Step1Role({ role, setRole }) {
  return (<>
    <div style={questionStyle}>Which role do you need?</div>
    <div style={helperStyle}>Pick the type of professional for this shift.</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ROLES.map((r) => { const selected = role === r.name; return (
        <button key={r.name} onClick={() => setRole(r.name)} style={{ background: selected ? COLORS.greenTint : 'white', border: `2px solid ${selected ? COLORS.green : COLORS.border}`, borderRadius: 18, padding: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, width: '100%' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: selected ? COLORS.green : COLORS.greenTint, color: selected ? 'white' : COLORS.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.icon}</div>
          <div style={{ flex: 1, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 21, color: COLORS.text, textAlign: 'left', lineHeight: 1.2 }}>{r.name}</div>
          <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${selected ? COLORS.green : COLORS.border}`, background: selected ? COLORS.green : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {selected && <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><polyline points="20 6 9 17 4 12" /></svg>}
          </div>
        </button>
      ); })}
    </div>
  </>);
}

function Step2Date({ selectedDate, setSelectedDate }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const startDay = isCurrentMonth ? today.getDate() : 1;
  const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = []; for (let d = startDay; d <= lastDay; d++) cells.push(new Date(viewYear, viewMonth, d));
  const changeMonth = (delta) => { let nm = viewMonth + delta, ny = viewYear; if (nm < 0) { nm = 11; ny--; } if (nm > 11) { nm = 0; ny++; } if (ny < today.getFullYear() || (ny === today.getFullYear() && nm < today.getMonth())) return; const max = new Date(today.getFullYear(), today.getMonth() + 6, 1); if (ny > max.getFullYear() || (ny === max.getFullYear() && nm > max.getMonth())) return; setViewYear(ny); setViewMonth(nm); };
  return (<>
    <div style={questionStyle}>When do you need coverage?</div>
    <div style={helperStyle}>Pick the date for this shift.</div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <button onClick={() => changeMonth(-1)} disabled={isCurrentMonth} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', opacity: isCurrentMonth ? 0.35 : 1 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16 }}>{FULL_MONTHS[viewMonth]} {viewYear}</div>
      <button onClick={() => changeMonth(1)} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
    <div className="date-strip" style={{ display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', margin: '0 -20px', padding: '0 20px 8px' }}>
      {cells.map((d, i) => { const sel = d.getFullYear() === selectedDate.getFullYear() && d.getMonth() === selectedDate.getMonth() && d.getDate() === selectedDate.getDate(); return (
        <div key={i} onClick={() => setSelectedDate(d)} style={{ flexShrink: 0, width: 64, padding: '14px 8px', background: sel ? COLORS.green : 'white', border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`, borderRadius: 16, textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: sel ? 'white' : COLORS.textLight, textTransform: 'uppercase' }}>{days[d.getDay()]}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 700, color: sel ? 'white' : COLORS.text, marginTop: 4, lineHeight: 1 }}>{d.getDate()}</div>
          <div style={{ fontSize: 10, color: sel ? 'white' : COLORS.textLight, marginTop: 3, fontWeight: 600 }}>{months[d.getMonth()]}</div>
        </div>
      ); })}
    </div>
  </>);
}

function Step3Hours({ startTime, setStartTime, endTime, setEndTime }) {
  const [openWhich, setOpenWhich] = useState(null);
  const toggle = (which) => setOpenWhich(openWhich === which ? null : which);
  const fmtTime = (t) => `${t.hour}:${t.min < 10 ? '0' + t.min : t.min} ${t.ampm}`;
  return (<>
    <div style={questionStyle}>What are the shift hours?</div>
    <div style={helperStyle}>Set start and end times.</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><div style={fieldLabelStyle}>Start time</div><TimePickerCard open={openWhich === 'start'} value={startTime} displayValue={fmtTime(startTime)} onToggle={() => toggle('start')} onChange={setStartTime} /></div>
      <div><div style={fieldLabelStyle}>End time</div><TimePickerCard open={openWhich === 'end'} value={endTime} displayValue={fmtTime(endTime)} onToggle={() => toggle('end')} onChange={setEndTime} /></div>
    </div>
  </>);
}

function TimePickerCard({ open, value, displayValue, onToggle, onChange }) {
  return (
    <div style={{ background: 'white', border: `1.5px solid ${open ? COLORS.green : COLORS.border}`, borderRadius: 18, overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 700 }}>{displayValue}</div>
        <svg viewBox="0 0 24 24" fill="none" stroke={open ? COLORS.green : COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, transform: open ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
      </div>
      {open && <div style={{ padding: '8px 0 16px', borderTop: `1px solid ${COLORS.borderSoft}` }}><TimeWheel value={value} onChange={onChange} /></div>}
    </div>
  );
}

const ITEM_HEIGHT = 40;
function TimeWheel({ value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, position: 'relative', height: 168, padding: '0 24px' }}>
      <div style={{ position: 'absolute', top: '50%', left: 16, right: 16, transform: 'translateY(-50%)', height: 40, background: COLORS.bg, borderRadius: 12, pointerEvents: 'none', zIndex: 0 }} />
      <WheelColumn items={Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: i + 1 }))} selected={value.hour} onSelect={(v) => onChange({ ...value, hour: v })} />
      <WheelColumn items={Array.from({ length: 60 }, (_, i) => ({ label: i < 10 ? '0' + i : String(i), value: i }))} selected={value.min} onSelect={(v) => onChange({ ...value, min: v })} />
      <WheelColumn items={[{ label: 'AM', value: 'AM' }, { label: 'PM', value: 'PM' }]} selected={value.ampm} onSelect={(v) => onChange({ ...value, ampm: v })} />
    </div>
  );
}

function WheelColumn({ items, selected, onSelect }) {
  const colRef = useRef(null); const scrollTimeoutRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(items.findIndex((i) => i.value === selected));
  useEffect(() => { const idx = items.findIndex((i) => i.value === selected); if (idx !== -1 && colRef.current) { colRef.current.scrollTop = idx * ITEM_HEIGHT; setActiveIdx(idx); } }, [selected, items]);
  const handleScroll = useCallback(() => { if (!colRef.current) return; clearTimeout(scrollTimeoutRef.current); const idx = Math.max(0, Math.min(items.length - 1, Math.round(colRef.current.scrollTop / ITEM_HEIGHT))); setActiveIdx(idx); scrollTimeoutRef.current = setTimeout(() => { if (colRef.current) { const snapped = idx * ITEM_HEIGHT; if (Math.abs(colRef.current.scrollTop - snapped) > 1) colRef.current.scrollTo({ top: snapped, behavior: 'smooth' }); onSelect(items[idx].value); } }, 120); }, [items, onSelect]);
  return (
    <div ref={colRef} className="wheel-col" onScroll={handleScroll} style={{ flex: 1, height: 168, overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', position: 'relative', zIndex: 1, WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)', maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)' }}>
      <div style={{ padding: '64px 0' }}>
        {items.map((item, idx) => <div key={item.value} onClick={() => { if (colRef.current) colRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' }); }} style={{ height: 40, lineHeight: '40px', textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: idx === activeIdx ? 800 : 600, fontSize: 22, color: idx === activeIdx ? COLORS.text : COLORS.textLight, scrollSnapAlign: 'center', cursor: 'pointer' }}>{item.label}</div>)}
      </div>
    </div>
  );
}

function Step4Lunch({ lunchOn, setLunchOn, lunchDuration, setLunchDuration }) {
  const options = ['15 min', '30 min', '45 min', '60 min'];
  return (<>
    <div style={questionStyle}>Lunch break?</div>
    <div style={helperStyle}>Unpaid break during the shift. Choose a duration.</div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, background: 'white', border: `1.5px solid ${COLORS.border}`, borderRadius: 16, padding: '14px 18px' }}>
      <div><div style={{ fontSize: 14, fontWeight: 700 }}>Provide lunch break</div><div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>Toggle off if no break</div></div>
      <button onClick={() => setLunchOn(!lunchOn)} style={{ position: 'relative', width: 46, height: 26, background: lunchOn ? COLORS.green : COLORS.border, borderRadius: 100, cursor: 'pointer', border: 'none' }}>
        <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transform: lunchOn ? 'translateX(20px)' : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
      </button>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, opacity: lunchOn ? 1 : 0.4, pointerEvents: lunchOn ? 'auto' : 'none' }}>
      {options.map((opt) => { const sel = lunchDuration === opt; return <button key={opt} onClick={() => setLunchDuration(opt)} style={{ background: sel ? COLORS.green : 'white', border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`, borderRadius: 100, padding: '12px 18px', fontSize: 14, fontWeight: 600, color: sel ? 'white' : COLORS.textMid, cursor: 'pointer' }}>{opt}</button>; })}
    </div>
  </>);
}

function Step5Rate({ role, rate, setRate }) {
  const data = ROLE_RATES[role]; const sliderRef = useRef(null); const [dragging, setDragging] = useState(false);
  const setRateFromX = useCallback((clientX) => { if (!sliderRef.current) return; const rect = sliderRef.current.getBoundingClientRect(); let pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)); setRate(Math.round(data.min + pct * (data.max - data.min))); }, [data, setRate]);
  useEffect(() => { const move = (e) => { if (dragging) setRateFromX(e.clientX); }; const up = () => setDragging(false); const touch = (e) => { if (dragging) setRateFromX(e.touches[0].clientX); }; document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); document.addEventListener('touchmove', touch, { passive: true }); document.addEventListener('touchend', up); return () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); document.removeEventListener('touchmove', touch); document.removeEventListener('touchend', up); }; }, [dragging, setRateFromX]);
  const pct = ((rate - data.min) / (data.max - data.min)) * 100;
  return (<>
    <div style={questionStyle}>What's the hourly rate?</div>
    <div style={helperStyle}>What you'll pay per hour.</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', margin: '16px 0 6px' }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700 }}>$</span>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 64, fontWeight: 800, color: COLORS.green, lineHeight: 1 }}>{rate}</span>
      <span style={{ fontSize: 16, color: COLORS.textLight, fontWeight: 600 }}>/hr</span>
    </div>
    <div style={{ textAlign: 'center', fontSize: 12, color: COLORS.textLight, fontWeight: 600, marginBottom: 24 }}>Houston average for {data.plural}: <strong style={{ color: COLORS.green, fontWeight: 700 }}>${data.avg}/hr</strong></div>
    <div ref={sliderRef} onMouseDown={(e) => { setDragging(true); setRateFromX(e.clientX); }} onTouchStart={(e) => { setDragging(true); setRateFromX(e.touches[0].clientX); }} style={{ height: 8, background: COLORS.bg, borderRadius: 100, position: 'relative', margin: '0 12px', cursor: 'pointer' }}>
      <div style={{ position: 'absolute', height: '100%', left: 0, width: `${pct}%`, background: COLORS.green, borderRadius: 100 }} />
      <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 26, height: 26, background: 'white', border: `3px solid ${COLORS.green}`, borderRadius: '50%', boxShadow: '0 3px 8px rgba(0,0,0,0.15)' }} />
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 11, color: COLORS.textLight, fontWeight: 600, padding: '0 8px' }}><span>${data.min}</span><span>${data.max}</span></div>
  </>);
}

function Step6Notes({ notes, setNotes }) {
  return (<>
    <div style={questionStyle}>Any notes for the pro?</div>
    <div style={helperStyle}>Parking, dress code, where to check in. Optional.</div>
    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Please wear navy scrubs. Park in lot B. Ask for Maria at the front desk." style={{ width: '100%', background: 'white', border: `2px solid ${COLORS.border}`, borderRadius: 16, padding: '16px 18px', fontFamily: 'inherit', fontSize: 14, color: COLORS.text, resize: 'none', outline: 'none', minHeight: 120, lineHeight: 1.5 }} />
  </>);
}

function Step7Review({ formatTime, formatDate, role, selectedDate, startTime, endTime, lunchOn, lunchDuration, rate, notes, jumpTo }) {
  return (<>
    <div style={questionStyle}>Review and post.</div>
    <div style={helperStyle}>Take one last look. Tap Edit to change anything.</div>
    <ReviewCard title="Role" onEdit={() => jumpTo(1)}>{role}</ReviewCard>
    <ReviewCard title="Date" onEdit={() => jumpTo(2)}>{formatDate(selectedDate)}</ReviewCard>
    <ReviewCard title="Hours" onEdit={() => jumpTo(3)}>{formatTime(startTime)} – {formatTime(endTime)}</ReviewCard>
    <ReviewCard title="Lunch break" onEdit={() => jumpTo(4)}>{lunchOn ? lunchDuration : 'None'}</ReviewCard>
    <ReviewCard title="Hourly rate" onEdit={() => jumpTo(5)}>${rate}/hr</ReviewCard>
    <ReviewCard title="Notes" onEdit={() => jumpTo(6)}>{notes && notes.trim() ? <span style={{ fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{notes}</span> : <span style={{ fontStyle: 'italic', color: COLORS.textLight, fontWeight: 500, fontSize: 13 }}>No notes added</span>}</ReviewCard>
  </>);
}

function ReviewCard({ title, onEdit, children }) {
  return (
    <div style={{ background: 'white', border: `1.5px solid ${COLORS.border}`, borderRadius: 18, padding: '16px 18px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 12, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</div>
        <button onClick={onEdit} style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 100, padding: '6px 14px', fontSize: 11, fontWeight: 700, color: COLORS.green, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>Edit
        </button>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.text, lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}

function SuccessModal({ onClose }) {
  return (<>
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
    <div style={{ position: 'fixed', left: '50%', top: '50%', background: 'white', borderRadius: 28, padding: '32px 24px 24px', width: 'calc(100% - 48px)', maxWidth: 360, zIndex: 201, textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.35)', animation: 'scaleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', transform: 'translate(-50%, -50%)' }}>
      <Confetti />
      <div style={{ display: 'inline-block', marginBottom: 18 }}><div style={{ fontSize: 64, lineHeight: 1, animation: 'iconBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both, iconWiggle 2.5s ease-in-out 1s infinite', transformOrigin: 'bottom center' }}>🎉</div></div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 10, lineHeight: 1.15 }}>Your shift is live!</div>
      <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.5, marginBottom: 22 }}>Qualified Houston dental pros are being notified now.</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{ flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 100, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Post another</button>
        <button onClick={onClose} style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>View shift</button>
      </div>
    </div>
  </>);
}

function Confetti() {
  const pieces = [{left:'10%',bg:'#1a7f5e',delay:'0.1s',rotate:'20deg'},{left:'22%',bg:'#e8734a',delay:'0.25s',rotate:'-15deg'},{left:'35%',bg:'#7c3aed',delay:'0.05s',rotate:'45deg'},{left:'48%',bg:'#f4b740',delay:'0.3s',rotate:'-30deg'},{left:'60%',bg:'#1a7f5e',delay:'0.15s',rotate:'10deg'},{left:'72%',bg:'#e8734a',delay:'0.35s',rotate:'-45deg'},{left:'85%',bg:'#7c3aed',delay:'0.2s',rotate:'60deg'},{left:'5%',bg:'#f4b740',delay:'0.4s',rotate:'-10deg'},{left:'92%',bg:'#1a7f5e',delay:'0.18s',rotate:'35deg'},{left:'28%',bg:'#7c3aed',delay:'0.5s',rotate:'-25deg'},{left:'55%',bg:'#e8734a',delay:'0.45s',rotate:'15deg'},{left:'78%',bg:'#f4b740',delay:'0.32s',rotate:'-50deg'}];
  return <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>{pieces.map((p, i) => <span key={i} style={{ position: 'absolute', top: -20, left: p.left, width: 10, height: 14, borderRadius: 2, background: p.bg, transform: `rotate(${p.rotate})`, animation: `confettiFall 2.4s ease-in ${p.delay} forwards` }} />)}</div>;
}

const questionStyle = { fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, lineHeight: 1.2, color: COLORS.text, marginBottom: 8 };
const helperStyle = { fontSize: 14, color: COLORS.textMid, marginBottom: 28, lineHeight: 1.5 };
const fieldLabelStyle = { fontSize: 11, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 };
