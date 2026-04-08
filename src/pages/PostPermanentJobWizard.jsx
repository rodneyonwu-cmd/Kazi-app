import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

// ============================================================
// KAZI POST PERMANENT JOB WIZARD (8 steps)
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenDark: '#15604a',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  coral: '#e8734a',
  purple: '#7c3aed',
  purpleSoft: '#f1ebfa',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const PRACTICE_TYPES = [
  'General Dentistry', 'Family Dentistry', 'Cosmetic Dentistry', 'Pediatric Dentistry',
  'Orthodontics', 'Endodontics', 'Periodontics', 'Prosthodontics', 'Oral Surgery',
  'DSO / Group Practice', 'Community Health Clinic', 'Mobile / In-home Dentistry',
];

const ROLES = ['Dental Assistant', 'Hygienist', 'Front Desk', 'Dentist', 'Office Manager', 'Treatment Coordinator'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract'];
const EXPERIENCE_LEVELS = ['Any', '1+ yrs', '3+ yrs', '5+ yrs', '10+ yrs'];
const CREDENTIAL_OPTIONS = ['RDH', 'RDA', 'EFDA', 'CDA', 'BLS CPR', 'Radiology Cert', 'Local Anesthesia', 'Nitrous Cert'];
const SOFTWARE_OPTIONS = ['Dentrix', 'Eaglesoft', 'Open Dental', 'Curve Dental', 'Carestream', 'Practice-Web'];
const BENEFIT_OPTIONS = ['Health Insurance', 'Dental', 'Vision', '401k', 'PTO', 'Paid Holidays', 'CE Reimbursement', 'Uniform Allowance'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SHORT_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const ITEM_HEIGHT = 40;

export default function PostPermanentJobWizard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const totalSteps = 8;

  const [step, setStep] = useState(1);
  const [officeName, setOfficeName] = useState('Your Practice');
  const [officeCity, setOfficeCity] = useState('Houston');

  const [role, setRole] = useState('Hygienist');
  const [practiceType, setPracticeType] = useState('General Dentistry');
  const [employmentType, setEmploymentType] = useState('Full-time');

  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [defaultStart, setDefaultStart] = useState({ hour: 8, min: 0, ampm: 'AM' });
  const [defaultEnd, setDefaultEnd] = useState({ hour: 5, min: 0, ampm: 'PM' });
  const [customHoursOn, setCustomHoursOn] = useState(false);
  const [perDayHours, setPerDayHours] = useState({});
  const [startDateLabel, setStartDateLabel] = useState('ASAP');

  const [payType, setPayType] = useState('hourly');
  const [payMin, setPayMin] = useState('48');
  const [payMax, setPayMax] = useState('62');

  const [experience, setExperience] = useState('3+ yrs');
  const [credentials, setCredentials] = useState(['RDH', 'BLS CPR']);
  const [software, setSoftware] = useState(['Dentrix']);
  const [benefits, setBenefits] = useState(['Health Insurance', 'Dental', 'Vision', '401k', 'PTO', 'Paid Holidays']);

  const [aiGenerated, setAiGenerated] = useState(false);
  const [styleIndex, setStyleIndex] = useState(0);

  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/offices/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) { const data = await res.json(); if (data.name) setOfficeName(data.name); if (data.city) setOfficeCity(data.city); }
      } catch {}
    };
    fetchOffice();
  }, [getToken]);

  const next = async () => {
    if (step < totalSteps) { setStep(step + 1); window.scrollTo(0, 0); }
    else {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/shifts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            role, jobType: 'PERMANENT', date: new Date().toISOString(),
            startTime: formatTime(defaultStart), endTime: formatTime(defaultEnd),
            hourlyRate: payType === 'hourly' ? parseFloat(payMin) : 0,
            description: aiGenerated ? 'AI Generated' : '',
            schedule: employmentType + ' · ' + days.join(', '),
            benefits, software,
          }),
        });
        if (res.ok) setSuccessOpen(true);
        else { const err = await res.json().catch(() => ({})); alert(err.error || 'Failed to post job'); }
      } catch { alert('Failed to post job'); }
    }
  };
  const prev = () => { if (step > 1) { setStep(step - 1); window.scrollTo(0, 0); } };
  const jumpTo = (n) => { setStep(n); window.scrollTo(0, 0); };
  const closeSuccess = () => { setSuccessOpen(false); navigate('/dashboard'); };

  const formatTime = (t) => `${t.hour}:${t.min < 10 ? '0' + t.min : t.min} ${t.ampm}`;

  const formData = {
    role, practiceType, employmentType, days, defaultStart, defaultEnd, customHoursOn, perDayHours,
    startDateLabel, payType, payMin, payMax, experience, credentials, software, benefits,
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes iconBounce { 0% { transform: scale(0) rotate(-30deg); opacity: 0; } 60% { transform: scale(1.2) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        @keyframes iconWiggle { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(-6deg); } 75% { transform: rotate(6deg); } }
        @keyframes scaleIn { from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes confettiFall { 0% { top: -20px; opacity: 1; } 100% { top: 110%; opacity: 0; } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35), 0 0 0 0 rgba(124, 58, 237, 0.4); } 50% { box-shadow: 0 4px 14px rgba(124, 58, 237, 0.45), 0 0 0 12px rgba(124, 58, 237, 0); } }
        @keyframes brightShine { 0%, 100% { transform: translateX(-100%) skewX(-20deg); } 50% { transform: translateX(250%) skewX(-20deg); } }
        @keyframes sparkleStar { 0%, 100% { transform: rotate(0deg) scale(1); filter: drop-shadow(0 0 4px rgba(255,255,255,0.8)); } 50% { transform: rotate(180deg) scale(1.15); filter: drop-shadow(0 0 8px rgba(255,255,255,1)); } }
        .kazi-perm-wizard * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .kazi-perm-wizard button { font-family: inherit; }
        .kazi-perm-wizard .wheel-col::-webkit-scrollbar { display: none; }
        .kazi-perm-wizard .date-strip::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="kazi-perm-wizard"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          background: COLORS.bg,
          color: COLORS.text,
          WebkitFontSmoothing: 'antialiased',
          paddingBottom: 110,
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100vh',
          boxShadow: '0 0 40px rgba(0,0,0,0.06)',
          position: 'relative',
        }}
      >
        <div
          style={{
            padding: '18px 20px 16px',
            background: 'white',
            borderBottom: `1px solid ${COLORS.borderSoft}`,
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                width: 38, height: 38, borderRadius: '50%', background: COLORS.bg, border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text, lineHeight: 1 }}>
                Post Permanent Job
              </div>
              <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 3, fontWeight: 600 }}>
                Step {step} of {totalSteps}
              </div>
            </div>
            <div style={{ background: COLORS.purpleSoft, color: COLORS.purple, padding: '5px 11px', borderRadius: 100, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0 }}>
              Permanent
            </div>
          </div>
          <div style={{ height: 6, background: COLORS.borderSoft, borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: `linear-gradient(90deg, ${COLORS.green} 0%, #5eb896 100%)`, borderRadius: 100, width: `${(step / totalSteps) * 100}%`, transition: 'width 0.4s cubic-bezier(0.32, 0.72, 0, 1)' }} />
          </div>
        </div>

        <div style={{ padding: '24px 20px 20px', animation: 'slideIn 0.3s ease-out' }} key={step}>
          {step === 1 && <Step1Who role={role} setRole={setRole} practiceType={practiceType} setPracticeType={setPracticeType} employmentType={employmentType} setEmploymentType={setEmploymentType} />}
          {step === 2 && <Step2Schedule
            days={days} setDays={setDays}
            defaultStart={defaultStart} setDefaultStart={setDefaultStart}
            defaultEnd={defaultEnd} setDefaultEnd={setDefaultEnd}
            customHoursOn={customHoursOn} setCustomHoursOn={setCustomHoursOn}
            perDayHours={perDayHours} setPerDayHours={setPerDayHours}
            startDateLabel={startDateLabel} setStartDateLabel={setStartDateLabel}
            formatTime={formatTime}
          />}
          {step === 3 && <Step3Pay payType={payType} setPayType={setPayType} payMin={payMin} setPayMin={setPayMin} payMax={payMax} setPayMax={setPayMax} />}
          {step === 4 && <Step4Experience experience={experience} setExperience={setExperience} />}
          {step === 5 && <Step5Credentials credentials={credentials} setCredentials={setCredentials} />}
          {step === 6 && <Step6SoftwareBenefits software={software} setSoftware={setSoftware} benefits={benefits} setBenefits={setBenefits} />}
          {step === 7 && <Step7AIBuilder formData={formData} formatTime={formatTime} aiGenerated={aiGenerated} setAiGenerated={setAiGenerated} styleIndex={styleIndex} setStyleIndex={setStyleIndex} />}
          {step === 8 && <Step8Review formData={formData} formatTime={formatTime} styleIndex={styleIndex} aiGenerated={aiGenerated} jumpTo={jumpTo} />}
        </div>

        <div
          style={{
            position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
            maxWidth: 480, width: '100%', background: 'white', padding: '14px 20px 26px',
            borderTop: `1px solid ${COLORS.borderSoft}`, zIndex: 50, display: 'flex', gap: 10,
          }}
        >
          <button
            onClick={prev}
            disabled={step === 1}
            style={{
              background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`,
              borderRadius: 100, padding: '16px 22px', fontSize: 14, fontWeight: 700,
              cursor: step === 1 ? 'not-allowed' : 'pointer', opacity: step === 1 ? 0.4 : 1, flexShrink: 0,
            }}
          >
            Back
          </button>
          <button
            onClick={next}
            style={{
              flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100,
              padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {step === totalSteps ? 'Post Job' : 'Continue'}
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              {step === totalSteps ? <polyline points="20 6 9 17 4 12" /> : <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>}
            </svg>
          </button>
        </div>

        {successOpen && <SuccessModal onClose={closeSuccess} />}
      </div>
    </>
  );
}

// ============================================================
// STEP 1: WHO
// ============================================================
function Step1Who({ role, setRole, practiceType, setPracticeType, employmentType, setEmploymentType }) {
  const [practiceOpen, setPracticeOpen] = useState(false);
  return (
    <>
      <div style={questionStyle}>Who are you hiring?</div>
      <div style={helperStyle}>Tell us about the role and your practice.</div>

      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabelStyle}>Role</div>
        <PillRow options={ROLES} selected={role} onSelect={setRole} />
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabelStyle}>Practice type</div>
        <Dropdown
          value={practiceType}
          open={practiceOpen}
          onToggle={() => setPracticeOpen(!practiceOpen)}
          options={PRACTICE_TYPES.map((p) => ({ label: p, onClick: () => { setPracticeType(p); setPracticeOpen(false); } }))}
        />
      </div>

      <div>
        <div style={fieldLabelStyle}>Employment type</div>
        <PillRow options={EMPLOYMENT_TYPES} selected={employmentType} onSelect={setEmploymentType} />
      </div>
    </>
  );
}

function PillRow({ options, selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const sel = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              background: sel ? COLORS.green : 'white',
              border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
              borderRadius: 100, padding: '12px 18px', fontSize: 14, fontWeight: 600,
              color: sel ? 'white' : COLORS.textMid, cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function MultiPillRow({ options, selected, onToggle }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const sel = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            style={{
              background: sel ? COLORS.green : 'white',
              border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
              borderRadius: 100, padding: '12px 18px', fontSize: 14, fontWeight: 600,
              color: sel ? 'white' : COLORS.textMid, cursor: 'pointer',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Dropdown({ value, open, onToggle, options }) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={onToggle}
        style={{
          background: 'white', border: `1.5px solid ${open ? COLORS.green : COLORS.border}`,
          borderRadius: 16, padding: '14px 18px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', cursor: 'pointer',
          fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: COLORS.text,
        }}
      >
        <span>{value}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 14, height: 14, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
          background: 'white', border: `1.5px solid ${COLORS.border}`, borderRadius: 16,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)', zIndex: 30, maxHeight: 280, overflowY: 'auto',
        }}>
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={opt.onClick}
              style={{
                padding: '12px 18px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                color: opt.color || COLORS.text,
                borderBottom: i < options.length - 1 ? `1px solid ${COLORS.borderSoft}` : 'none',
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// STEP 2: SCHEDULE
// ============================================================
function Step2Schedule({
  days, setDays, defaultStart, setDefaultStart, defaultEnd, setDefaultEnd,
  customHoursOn, setCustomHoursOn, perDayHours, setPerDayHours,
  startDateLabel, setStartDateLabel, formatTime,
}) {
  const [openWhich, setOpenWhich] = useState(null);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const toggleDay = (day) => {
    if (days.includes(day)) setDays(days.filter((d) => d !== day));
    else setDays([...days, day]);
  };

  const toggleTimePicker = (which) => setOpenWhich(openWhich === which ? null : which);

  const updatePerDay = (day, side, value) => {
    const current = perDayHours[day] || { start: defaultStart, end: defaultEnd, edited: false };
    setPerDayHours({ ...perDayHours, [day]: { ...current, [side]: value, edited: true } });
  };

  return (
    <>
      <div style={questionStyle}>When will they work?</div>
      <div style={helperStyle}>Set the days, hours, and start date.</div>

      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabelStyle}>Days per week</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DAYS_OF_WEEK.map((day) => {
            const sel = days.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                style={{
                  background: sel ? COLORS.green : 'white',
                  border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
                  color: sel ? 'white' : COLORS.textMid,
                  borderRadius: 100, padding: '12px 16px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Outfit', sans-serif", minWidth: 50,
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabelStyle}>Default hours</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ ...fieldLabelStyle, fontSize: 10, marginBottom: 6 }}>Start time</div>
            <TimePickerCard open={openWhich === 'start'} value={defaultStart} displayValue={formatTime(defaultStart)} onToggle={() => toggleTimePicker('start')} onChange={setDefaultStart} />
          </div>
          <div>
            <div style={{ ...fieldLabelStyle, fontSize: 10, marginBottom: 6 }}>End time</div>
            <TimePickerCard open={openWhich === 'end'} value={defaultEnd} displayValue={formatTime(defaultEnd)} onToggle={() => toggleTimePicker('end')} onChange={setDefaultEnd} />
          </div>
        </div>

        <div
          onClick={() => setCustomHoursOn(!customHoursOn)}
          style={{
            marginTop: 12, background: customHoursOn ? COLORS.greenTint : 'white',
            border: `1.5px solid ${customHoursOn ? COLORS.green : COLORS.border}`,
            borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: customHoursOn ? COLORS.green : COLORS.bg,
            color: customHoursOn ? 'white' : COLORS.textMid,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>Different hours on some days?</div>
            <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>Set unique hours per day</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ width: 14, height: 14, transition: 'transform 0.2s', transform: customHoursOn ? 'rotate(180deg)' : 'none' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {customHoursOn && (
          <div style={{ marginTop: 12, background: 'white', border: `1.5px solid ${COLORS.greenSoft}`, borderRadius: 14, overflow: 'hidden' }}>
            {days.map((day, i) => {
              const dayData = perDayHours[day] || { start: defaultStart, end: defaultEnd, edited: false };
              const startActive = openWhich === `day-${day}-start`;
              const endActive = openWhich === `day-${day}-end`;
              return (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', borderBottom: i < days.length - 1 ? `1px solid ${COLORS.borderSoft}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 12 }}>
                    <div style={{ width: 50, fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.text, display: 'flex', alignItems: 'center', gap: 5 }}>
                      {day}
                      {dayData.edited && <span style={{ width: 6, height: 6, background: COLORS.green, borderRadius: '50%' }} />}
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                      <div
                        onClick={() => toggleTimePicker(`day-${day}-start`)}
                        style={{
                          background: startActive ? COLORS.green : (dayData.edited ? COLORS.greenTint : COLORS.bg),
                          border: `1px solid ${startActive ? COLORS.green : (dayData.edited ? COLORS.greenSoft : COLORS.borderSoft)}`,
                          borderRadius: 10, padding: '7px 12px',
                          fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13,
                          color: startActive ? 'white' : (dayData.edited ? COLORS.green : COLORS.text),
                          cursor: 'pointer', minWidth: 78, textAlign: 'center',
                        }}
                      >
                        {formatTime(dayData.start)}
                      </div>
                      <span style={{ color: COLORS.textLight, fontSize: 14, fontWeight: 700 }}>→</span>
                      <div
                        onClick={() => toggleTimePicker(`day-${day}-end`)}
                        style={{
                          background: endActive ? COLORS.green : (dayData.edited ? COLORS.greenTint : COLORS.bg),
                          border: `1px solid ${endActive ? COLORS.green : (dayData.edited ? COLORS.greenSoft : COLORS.borderSoft)}`,
                          borderRadius: 10, padding: '7px 12px',
                          fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13,
                          color: endActive ? 'white' : (dayData.edited ? COLORS.green : COLORS.text),
                          cursor: 'pointer', minWidth: 78, textAlign: 'center',
                        }}
                      >
                        {formatTime(dayData.end)}
                      </div>
                    </div>
                  </div>
                  {(startActive || endActive) && (
                    <div style={{ padding: '10px 14px 14px', borderTop: `1px solid ${COLORS.borderSoft}` }}>
                      <TimeWheel value={startActive ? dayData.start : dayData.end} onChange={(v) => updatePerDay(day, startActive ? 'start' : 'end', v)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <div style={fieldLabelStyle}>
          Ideal start date <span style={{ color: COLORS.textLight, fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>· Optional</span>
        </div>
        <Dropdown
          value={startDateLabel}
          open={startDateOpen}
          onToggle={() => setStartDateOpen(!startDateOpen)}
          options={[
            { label: 'ASAP', onClick: () => { setStartDateLabel('ASAP'); setStartDateOpen(false); } },
            { label: 'Within 3 months', onClick: () => { setStartDateLabel('Within 3 months'); setStartDateOpen(false); } },
            { label: '📅 Pick a specific date...', color: COLORS.green, onClick: () => { setStartDateOpen(false); setDatePickerOpen(true); } },
          ]}
        />
      </div>

      {datePickerOpen && (
        <DatePickerSheet
          onClose={() => setDatePickerOpen(false)}
          onSelect={(d) => {
            const label = `${FULL_DAYS[d.getDay()]}, ${FULL_MONTHS[d.getMonth()]} ${d.getDate()}`;
            setStartDateLabel(label);
            setDatePickerOpen(false);
          }}
        />
      )}
    </>
  );
}

function DatePickerSheet({ onClose, onSelect }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const startDay = isCurrentMonth ? today.getDate() : 1;
  const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let d = startDay; d <= lastDay; d++) cells.push(new Date(viewYear, viewMonth, d));

  const changeMonth = (delta) => {
    let nm = viewMonth + delta, ny = viewYear;
    if (nm < 0) { nm = 11; ny--; }
    if (nm > 11) { nm = 0; ny++; }
    if (ny < today.getFullYear() || (ny === today.getFullYear() && nm < today.getMonth())) return;
    const max = new Date(today.getFullYear(), today.getMonth() + 6, 1);
    if (ny > max.getFullYear() || (ny === max.getFullYear() && nm > max.getMonth())) return;
    setViewYear(ny); setViewMonth(nm);
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} />
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        maxWidth: 480, width: '100%', background: 'white', borderRadius: '28px 28px 0 0',
        zIndex: 101, paddingBottom: 28,
      }}>
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '12px auto 4px' }} />
        <div style={{ padding: '14px 24px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.text }}>Pick a start date</div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 24px 14px' }}>
          <button onClick={() => changeMonth(-1)} disabled={isCurrentMonth} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', opacity: isCurrentMonth ? 0.35 : 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text }}>
            {FULL_MONTHS[viewMonth]} {viewYear}
          </div>
          <button onClick={() => changeMonth(1)} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <div className="date-strip" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 24px 8px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {cells.map((d, i) => (
            <div key={i} onClick={() => onSelect(d)} style={{ flexShrink: 0, width: 60, padding: '12px 8px', background: COLORS.bg, border: `1.5px solid ${COLORS.borderSoft}`, borderRadius: 14, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase' }}>{SHORT_DAYS[d.getDay()]}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.text, marginTop: 4, lineHeight: 1 }}>{d.getDate()}</div>
              <div style={{ fontSize: 10, color: COLORS.textLight, marginTop: 3, fontWeight: 600 }}>{SHORT_MONTHS[d.getMonth()]}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ============================================================
// TIME PICKER
// ============================================================
function TimePickerCard({ open, value, displayValue, onToggle, onChange }) {
  return (
    <div style={{ background: 'white', border: `1.5px solid ${open ? COLORS.green : COLORS.border}`, borderRadius: 18, overflow: 'hidden', transition: 'border-color 0.2s' }}>
      <div onClick={onToggle} style={{ padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 700, color: COLORS.text }}>{displayValue}</div>
        <svg viewBox="0 0 24 24" fill="none" stroke={open ? COLORS.green : COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ width: 14, height: 14, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && (
        <div style={{ padding: '8px 0 16px', borderTop: `1px solid ${COLORS.borderSoft}`, position: 'relative' }}>
          <TimeWheel value={value} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

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
  const colRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(items.findIndex((i) => i.value === selected));

  useEffect(() => {
    const idx = items.findIndex((i) => i.value === selected);
    if (idx !== -1 && colRef.current) {
      colRef.current.scrollTop = idx * ITEM_HEIGHT;
      setActiveIdx(idx);
    }
  }, [selected, items]);

  const handleScroll = useCallback(() => {
    if (!colRef.current) return;
    clearTimeout(scrollTimeoutRef.current);
    const idx = Math.max(0, Math.min(items.length - 1, Math.round(colRef.current.scrollTop / ITEM_HEIGHT)));
    setActiveIdx(idx);
    scrollTimeoutRef.current = setTimeout(() => {
      if (colRef.current) {
        const snapped = idx * ITEM_HEIGHT;
        if (Math.abs(colRef.current.scrollTop - snapped) > 1) {
          colRef.current.scrollTo({ top: snapped, behavior: 'smooth' });
        }
        onSelect(items[idx].value);
      }
    }, 120);
  }, [items, onSelect]);

  return (
    <div
      ref={colRef}
      className="wheel-col"
      onScroll={handleScroll}
      style={{
        flex: 1, height: 168, overflowY: 'scroll', scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', position: 'relative', zIndex: 1,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
      }}
    >
      <div style={{ padding: '64px 0' }}>
        {items.map((item, idx) => (
          <div
            key={item.value}
            onClick={() => { if (colRef.current) colRef.current.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' }); }}
            style={{
              height: 40, lineHeight: '40px', textAlign: 'center',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: idx === activeIdx ? 800 : 600,
              fontSize: 22, color: idx === activeIdx ? COLORS.text : COLORS.textLight,
              scrollSnapAlign: 'center', cursor: 'pointer',
              transition: 'color 0.15s, font-weight 0.15s',
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// STEP 3: PAY
// ============================================================
function Step3Pay({ payType, setPayType, payMin, setPayMin, payMax, setPayMax }) {
  return (
    <>
      <div style={questionStyle}>What does it pay?</div>
      <div style={helperStyle}>Set a clear range — candidates expect transparency.</div>

      <div style={{ display: 'flex', background: 'white', border: `2px solid ${COLORS.border}`, borderRadius: 100, padding: 4, marginBottom: 16 }}>
        {['hourly', 'salary'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setPayType(type);
              if (type === 'hourly') { setPayMin('48'); setPayMax('62'); }
              else { setPayMin('85000'); setPayMax('110000'); }
            }}
            style={{
              flex: 1, padding: 12,
              background: payType === type ? COLORS.green : 'none',
              color: payType === type ? 'white' : COLORS.textLight,
              border: 'none', borderRadius: 100, fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {type === 'hourly' ? 'Hourly' : 'Salary'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <div style={{ ...fieldLabelStyle, fontSize: 10, marginBottom: 6 }}>Minimum</div>
          <div style={{ background: 'white', border: `1.5px solid ${COLORS.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.text }}>$</span>
            <input value={payMin} onChange={(e) => setPayMin(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.text, width: '100%' }} />
          </div>
        </div>
        <div>
          <div style={{ ...fieldLabelStyle, fontSize: 10, marginBottom: 6 }}>Maximum</div>
          <div style={{ background: 'white', border: `1.5px solid ${COLORS.border}`, borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.text }}>$</span>
            <input value={payMax} onChange={(e) => setPayMax(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'none', fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: COLORS.text, width: '100%' }} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: COLORS.textLight, fontWeight: 600, textAlign: 'center' }}>
        {payType === 'hourly' ? 'Per hour' : 'Per year'}
      </div>
    </>
  );
}

// ============================================================
// STEP 4: EXPERIENCE
// ============================================================
function Step4Experience({ experience, setExperience }) {
  return (
    <>
      <div style={questionStyle}>How much experience?</div>
      <div style={helperStyle}>Minimum years required for this role.</div>
      <PillRow options={EXPERIENCE_LEVELS} selected={experience} onSelect={setExperience} />
    </>
  );
}

// ============================================================
// STEP 5: CREDENTIALS
// ============================================================
function Step5Credentials({ credentials, setCredentials }) {
  const toggle = (c) => {
    if (credentials.includes(c)) setCredentials(credentials.filter((x) => x !== c));
    else setCredentials([...credentials, c]);
  };
  return (
    <>
      <div style={questionStyle}>Required credentials?</div>
      <div style={helperStyle}>Pick all that apply.</div>
      <MultiPillRow options={CREDENTIAL_OPTIONS} selected={credentials} onToggle={toggle} />
    </>
  );
}

// ============================================================
// STEP 6: SOFTWARE & BENEFITS
// ============================================================
function Step6SoftwareBenefits({ software, setSoftware, benefits, setBenefits }) {
  const toggleSoftware = (s) => {
    if (software.includes(s)) setSoftware(software.filter((x) => x !== s));
    else setSoftware([...software, s]);
  };
  const toggleBenefit = (b) => {
    if (benefits.includes(b)) setBenefits(benefits.filter((x) => x !== b));
    else setBenefits([...benefits, b]);
  };
  return (
    <>
      <div style={questionStyle}>Software & benefits</div>
      <div style={helperStyle}>What systems do you use, and what do you offer?</div>

      <div style={{ marginBottom: 22 }}>
        <div style={fieldLabelStyle}>Practice management software</div>
        <MultiPillRow options={SOFTWARE_OPTIONS} selected={software} onToggle={toggleSoftware} />
      </div>

      <div>
        <div style={fieldLabelStyle}>Benefits offered</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {BENEFIT_OPTIONS.map((b) => {
            const sel = benefits.includes(b);
            return (
              <button
                key={b}
                onClick={() => toggleBenefit(b)}
                style={{
                  background: sel ? COLORS.greenTint : 'white',
                  border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
                  borderRadius: 14, padding: '12px 14px', fontSize: 13, fontWeight: 600,
                  color: sel ? COLORS.green : COLORS.textMid, cursor: 'pointer',
                  textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 5,
                  background: sel ? COLORS.green : 'white',
                  border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {sel && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {b}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ============================================================
// STEP 7: AI BUILDER
// ============================================================
function Step7AIBuilder({ formData, formatTime, aiGenerated, setAiGenerated, styleIndex, setStyleIndex }) {
  const handleGenerate = () => {
    setStyleIndex(0);
    setAiGenerated(true);
  };

  const tryAnotherStyle = () => setStyleIndex((styleIndex + 1) % AI_STYLES.length);

  const currentStyle = AI_STYLES[styleIndex];
  const generatedHtml = currentStyle.fn(formData, formatTime);

  return (
    <>
      <div style={questionStyle}>AI Job Description</div>
      <div style={helperStyle}>Let AI write a compelling description from your inputs.</div>

      {!aiGenerated && (
        <>
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.purpleSoft} 0%, ${COLORS.bg} 80%)`,
            border: `1.5px solid #e4d7f7`, borderRadius: 20, padding: 22, marginBottom: 18,
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 18, background: COLORS.purple, margin: '0 auto 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(124,58,237,0.35)',
            }}>
              <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
                <path d="M12 2l1.88 5.76L20 9.27l-4.5 4.39 1.06 6.18L12 16.77l-4.56 2.4 1.06-6.18L4 9.27l6.12-1.51L12 2z" />
              </svg>
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 19, color: COLORS.text, marginBottom: 6 }}>
              AI Job Description Builder
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.5 }}>
              Tap below to generate. Flip through 10 different writing styles to find the perfect tone.
            </div>
          </div>

          <button
            onClick={handleGenerate}
            style={{
              width: '100%', background: COLORS.purple, color: 'white', border: 'none',
              borderRadius: 100, padding: 16, fontSize: 15, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
              position: 'relative', overflow: 'hidden',
              animation: 'pulseGlow 2.4s ease-in-out infinite',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 48%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.6) 52%, transparent 70%)',
              animation: 'brightShine 2.8s ease-in-out infinite', pointerEvents: 'none',
            }} />
            <svg viewBox="0 0 24 24" fill="white" style={{ width: 16, height: 16, animation: 'sparkleStar 1.6s ease-in-out infinite', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.8))', position: 'relative', zIndex: 1 }}>
              <path d="M12 2l1.88 5.76L20 9.27l-4.5 4.39 1.06 6.18L12 16.77l-4.56 2.4 1.06-6.18L4 9.27l6.12-1.51L12 2z" />
            </svg>
            <span style={{ position: 'relative', zIndex: 1 }}>Generate with AI</span>
          </button>
        </>
      )}

      {aiGenerated && (
        <div style={{ background: 'white', border: `1.5px solid #e4d7f7`, borderRadius: 18, padding: '20px 22px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: COLORS.purpleSoft, color: COLORS.purple, fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Style {styleIndex + 1} of {AI_STYLES.length}
              </div>
              <div style={{ fontSize: 11, color: COLORS.textLight, fontWeight: 600 }}>{currentStyle.name}</div>
            </div>
          </div>

          <div style={{ fontSize: 16, lineHeight: 1.65, color: COLORS.text }} dangerouslySetInnerHTML={{ __html: generatedHtml }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <button
              onClick={tryAnotherStyle}
              style={{
                flex: 1, background: COLORS.purpleSoft, color: COLORS.purple,
                border: `1.5px solid #e4d7f7`, borderRadius: 100, padding: 14,
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Try another style
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// AI WRITING STYLES (10 templates)
// ============================================================
const AI_STYLES = [
  {
    name: 'Professional',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">About Missouri City Dental</h4>`;
      h += `We are a ${d.practiceType} practice in the Houston area looking for a dedicated ${d.role} to join our team.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Position Summary</h4>`;
      h += `${d.employmentType} ${d.role} position. ${scheduleLine(d, formatTime)}`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Compensation</h4>`;
      h += `${payLine(d)}. ${startDateLine(d)}`;
      if (d.credentials.length) h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Required Credentials</h4>${bulletList(d.credentials)}`;
      if (d.benefits.length) h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Benefits</h4>${bulletList(d.benefits)}`;
      return h;
    },
  },
  {
    name: 'Warm & inviting',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">Hi, we're Missouri City Dental 👋</h4>`;
      h += `We're a friendly ${d.practiceType.toLowerCase()} office in Fort Bend, and we're growing! We're hoping to welcome a ${d.role.toLowerCase()} to our close-knit team.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">What you'd be doing</h4>`;
      h += `Joining us ${d.employmentType.toLowerCase()}, working alongside our amazing crew. ${scheduleLine(d, formatTime)}`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">What we offer</h4>`;
      h += `${payLine(d)}, plus ${d.benefits.length ? d.benefits.slice(0, 3).join(', ').toLowerCase() : 'great benefits'} and more.`;
      return h;
    },
  },
  {
    name: 'Energetic',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">🚀 We're Hiring a ${d.role}!</h4>`;
      h += `Tired of the same old boring practice? Missouri City Dental is looking for someone who LOVES dentistry as much as we do.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">The Gig</h4>`;
      h += `${d.employmentType} role. ${scheduleLine(d, formatTime)} Pay? ${payLine(d)}.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">What You Bring</h4>`;
      h += `${d.experience} of experience, ${d.credentials.length ? d.credentials.join(' / ') : 'the right credentials'}, and ENERGY!`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Ready?</h4>Apply today. ${startDateLine(d)}`;
      return h;
    },
  },
  {
    name: 'Story-driven',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">Our Story</h4>`;
      h += `Missouri City Dental was built on the belief that dental care should feel personal. Today, we're a ${d.practiceType.toLowerCase()} practice serving Fort Bend families with care.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">The Chapter We're Writing Now</h4>`;
      h += `We need a ${d.role.toLowerCase()} who shares our values. ${scheduleLine(d, formatTime)} Compensation: ${payLine(d)}.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Could That Be You?</h4>`;
      h += `If you have ${d.experience} of experience and are ready to be part of something meaningful, we'd love to hear from you.`;
      return h;
    },
  },
  {
    name: 'Bullet-heavy',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">The Practice</h4>${bulletList(['Type: ' + d.practiceType, 'Location: Missouri City, TX', 'Team-focused environment'])}`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">The Role</h4>${bulletList(['Position: ' + d.role, 'Type: ' + d.employmentType, 'Schedule: ' + scheduleLine(d, formatTime).replace(d.employmentType + ', ', ''), 'Pay: ' + payLine(d), 'Experience: ' + d.experience, 'Start: ' + d.startDateLabel])}`;
      if (d.credentials.length) h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Credentials</h4>${bulletList(d.credentials)}`;
      if (d.benefits.length) h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Benefits</h4>${bulletList(d.benefits)}`;
      return h;
    },
  },
  {
    name: 'Conversational Q&A',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">What's the role?</h4>${d.role}, ${d.employmentType.toLowerCase()}.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">What's the schedule like?</h4>${scheduleLine(d, formatTime)} ${startDateLine(d)}`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">What does it pay?</h4>${payLine(d)}.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">What do you need from me?</h4>${d.experience} of experience${d.credentials.length ? ' and credentials in: ' + d.credentials.join(', ') : ''}.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">What's in it for me?</h4>${d.benefits.length ? 'Solid benefits including ' + d.benefits.slice(0, 4).join(', ') + '.' : 'A great work environment and growth opportunities.'}`;
      return h;
    },
  },
  {
    name: 'Mission-focused',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">Our Mission</h4>`;
      h += `At Missouri City Dental, we believe every patient deserves compassionate, expert care. As a ${d.practiceType.toLowerCase()} practice, we put people first — patients and team members alike.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">How You'd Contribute</h4>`;
      h += `As our next ${d.role}, you'd be on the front lines of our mission. ${scheduleLine(d, formatTime)}`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">What We Invest In You</h4>`;
      h += `${payLine(d)}${d.benefits.length ? ', plus ' + d.benefits.slice(0, 3).join(', ').toLowerCase() : ''}.`;
      return h;
    },
  },
  {
    name: 'Detail-rich',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">Position Details</h4>`;
      h += `Title: ${d.role}<br>Type: ${d.employmentType}<br>Practice: ${d.practiceType}<br>Location: Missouri City, TX (Fort Bend County)<br>${scheduleLine(d, formatTime)}<br>Compensation: ${payLine(d)}<br>Start: ${d.startDateLabel}`;
      if (d.credentials.length) h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Credential Requirements</h4>${bulletList(d.credentials)}`;
      if (d.software.length) h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Software</h4>Practice uses: ${d.software.join(', ')}.`;
      if (d.benefits.length) h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Benefits Package</h4>${bulletList(d.benefits)}`;
      return h;
    },
  },
  {
    name: 'Candidate-first',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">This Could Be Your Next Move</h4>`;
      h += `If you're a ${d.role.toLowerCase()} with ${d.experience} of experience looking for a meaningful next step, read on.`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Why You'll Love It Here</h4>`;
      h += `${d.benefits.length ? bulletList(d.benefits.slice(0, 5)) : 'Great culture and supportive team.'}`;
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">The Practical Stuff</h4>`;
      h += `${d.employmentType} role. ${scheduleLine(d, formatTime)} ${payLine(d)}. ${startDateLine(d)}`;
      return h;
    },
  },
  {
    name: 'Concise',
    fn: (d, formatTime) => {
      let h = '';
      h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:0;margin-bottom:10px">${d.role} — Missouri City Dental</h4>`;
      h += `${d.employmentType} ${d.role.toLowerCase()} role at a ${d.practiceType.toLowerCase()} practice. ${scheduleLine(d, formatTime)} ${payLine(d)}. ${d.experience} of experience required${d.credentials.length ? '. ' + d.credentials.join(', ') + ' preferred' : ''}.`;
      if (d.benefits.length) h += `<h4 style="font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-top:22px;margin-bottom:10px">Benefits</h4>${d.benefits.join(' · ')}`;
      return h;
    },
  },
];

function scheduleLine(d, formatTime) {
  let base = `${d.employmentType}, ${formatDays(d.days)}`;
  if (d.customHoursOn && Object.keys(d.perDayHours).length) base += ' with custom hours per day.';
  else base += `, ${formatTime(d.defaultStart)} to ${formatTime(d.defaultEnd)}.`;
  return base;
}

function formatDays(days) {
  if (days.length === 5 && days.includes('Mon') && days.includes('Tue') && days.includes('Wed') && days.includes('Thu') && days.includes('Fri')) {
    return 'Monday through Friday';
  }
  return days.join(', ');
}

function payLine(d) {
  if (d.payType === 'hourly') return `$${d.payMin}–$${d.payMax} per hour`;
  return `$${d.payMin}–$${d.payMax} per year`;
}

function startDateLine(d) {
  if (d.startDateLabel && d.startDateLabel !== 'ASAP') return ` Start date: ${d.startDateLabel}.`;
  return ' Starting ASAP.';
}

function bulletList(items) {
  return '<ul style="margin: 6px 0 6px 20px; padding: 0;">' + items.map((i) => `<li style="margin-bottom: 4px;">${i}</li>`).join('') + '</ul>';
}

// ============================================================
// STEP 8: REVIEW
// ============================================================
function Step8Review({ formData, formatTime, styleIndex, aiGenerated, jumpTo }) {
  const d = formData;
  const aiHtml = aiGenerated ? AI_STYLES[styleIndex].fn(d, formatTime) : null;

  return (
    <>
      <div style={questionStyle}>Review and post.</div>
      <div style={helperStyle}>Take one last look. Tap Edit on any section to make changes.</div>

      <ReviewCard title="Role" onEdit={() => jumpTo(1)}>
        {d.role}
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: COLORS.textMid, marginTop: 4 }}>
          {d.employmentType} · {d.practiceType}
        </div>
      </ReviewCard>

      <ReviewCard title="Schedule" onEdit={() => jumpTo(2)}>
        {formatDays(d.days)}
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: COLORS.textMid, marginTop: 4 }}>
          {d.customHoursOn && Object.keys(d.perDayHours).length
            ? d.days.map((day) => {
                const data = d.perDayHours[day] || { start: d.defaultStart, end: d.defaultEnd, edited: false };
                return `${day}: ${formatTime(data.start)} – ${formatTime(data.end)}${data.edited ? ' ✏️' : ''}`;
              }).join(' · ')
            : `${formatTime(d.defaultStart)} – ${formatTime(d.defaultEnd)}`}
          <br />Start: {d.startDateLabel}
        </div>
      </ReviewCard>

      <ReviewCard title="Pay" onEdit={() => jumpTo(3)}>
        ${d.payMin} – ${d.payMax}{d.payType === 'hourly' ? '/hr' : '/yr'}
      </ReviewCard>

      <ReviewCard title="Experience" onEdit={() => jumpTo(4)}>{d.experience}</ReviewCard>

      <ReviewCard title="Credentials" onEdit={() => jumpTo(5)}>
        {d.credentials.length > 0 ? <TagsList tags={d.credentials} /> : <Empty />}
      </ReviewCard>

      <ReviewCard title="Software" onEdit={() => jumpTo(6)}>
        {d.software.length > 0 ? <TagsList tags={d.software} /> : <Empty />}
      </ReviewCard>

      <ReviewCard title="Benefits" onEdit={() => jumpTo(6)}>
        {d.benefits.length > 0 ? <TagsList tags={d.benefits} /> : <Empty />}
      </ReviewCard>

      <div style={{
        background: 'white', border: `1.5px solid #e4d7f7`, borderRadius: 18, padding: '16px 18px',
        marginBottom: 10, maxHeight: 240, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 12, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Job Description
          </div>
          <button onClick={() => jumpTo(7)} style={{
            background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 100,
            padding: '6px 14px', fontSize: 11, fontWeight: 700, color: COLORS.green, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit
          </button>
        </div>
        {aiHtml ? (
          <div style={{ fontSize: 12, lineHeight: 1.55, color: COLORS.text }} dangerouslySetInnerHTML={{ __html: aiHtml }} />
        ) : (
          <div style={{ fontStyle: 'italic', color: COLORS.textLight, fontSize: 13, fontWeight: 500 }}>
            No description generated yet. Go back to step 7 to create one.
          </div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
          background: 'linear-gradient(to bottom, transparent, white)', pointerEvents: 'none',
        }} />
      </div>
    </>
  );
}

function Empty() {
  return <span style={{ fontStyle: 'italic', color: COLORS.textLight, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", fontSize: 13 }}>None selected</span>;
}

function TagsList({ tags }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {tags.map((t) => (
        <span key={t} style={{ background: COLORS.greenTint, color: COLORS.green, padding: '4px 10px', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600 }}>
          {t}
        </span>
      ))}
    </div>
  );
}

function ReviewCard({ title, onEdit, children }) {
  return (
    <div style={{ background: 'white', border: `1.5px solid ${COLORS.border}`, borderRadius: 18, padding: '16px 18px', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 12, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </div>
        <button onClick={onEdit} style={{
          background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 100,
          padding: '6px 14px', fontSize: 11, fontWeight: 700, color: COLORS.green, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: COLORS.text, lineHeight: 1.4 }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// SUCCESS MODAL
// ============================================================
function SuccessModal({ onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', left: '50%', top: '50%',
        background: 'white', borderRadius: 28, padding: '32px 24px 24px',
        width: 'calc(100% - 48px)', maxWidth: 360, zIndex: 201, textAlign: 'center',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        animation: 'scaleIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        transform: 'translate(-50%, -50%)',
      }}>
        <Confetti />
        <div style={{ display: 'inline-block', marginBottom: 18, position: 'relative' }}>
          <div style={{
            fontSize: 64, lineHeight: 1, display: 'inline-block',
            animation: 'iconBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both, iconWiggle 2.5s ease-in-out 1s infinite',
            transformOrigin: 'bottom center',
          }}>
            🎉
          </div>
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.text, marginBottom: 10, lineHeight: 1.15 }}>
          Your job is live!
        </div>
        <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.5, marginBottom: 22, padding: '0 4px' }}>
          Qualified Houston dental professionals are being notified right now. You'll get a notification when applications start rolling in.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, background: COLORS.bg, color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 100, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            Post another
          </button>
          <button onClick={onClose} style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            View posting
          </button>
        </div>
      </div>
    </>
  );
}

function Confetti() {
  const pieces = [
    { left: '10%', bg: '#1a7f5e', delay: '0.1s', rotate: '20deg' },
    { left: '22%', bg: '#e8734a', delay: '0.25s', rotate: '-15deg' },
    { left: '35%', bg: '#7c3aed', delay: '0.05s', rotate: '45deg' },
    { left: '48%', bg: '#f4b740', delay: '0.3s', rotate: '-30deg' },
    { left: '60%', bg: '#1a7f5e', delay: '0.15s', rotate: '10deg' },
    { left: '72%', bg: '#e8734a', delay: '0.35s', rotate: '-45deg' },
    { left: '85%', bg: '#7c3aed', delay: '0.2s', rotate: '60deg' },
    { left: '5%', bg: '#f4b740', delay: '0.4s', rotate: '-10deg' },
    { left: '92%', bg: '#1a7f5e', delay: '0.18s', rotate: '35deg' },
    { left: '28%', bg: '#7c3aed', delay: '0.5s', rotate: '-25deg' },
    { left: '55%', bg: '#e8734a', delay: '0.45s', rotate: '15deg' },
    { left: '78%', bg: '#f4b740', delay: '0.32s', rotate: '-50deg' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
      {pieces.map((p, i) => (
        <span key={i} style={{
          position: 'absolute', top: -20, left: p.left,
          width: 10, height: 14, borderRadius: 2,
          background: p.bg, transform: `rotate(${p.rotate})`,
          animation: `confettiFall 2.4s ease-in ${p.delay} forwards`,
        }} />
      ))}
    </div>
  );
}

// ============================================================
// SHARED INLINE STYLES
// ============================================================
const questionStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 800,
  fontSize: 26,
  lineHeight: 1.2,
  color: COLORS.text,
  marginBottom: 8,
};

const helperStyle = {
  fontSize: 14,
  color: COLORS.textMid,
  marginBottom: 28,
  lineHeight: 1.5,
};

const fieldLabelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: COLORS.textLight,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  marginBottom: 10,
};
