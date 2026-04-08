import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

// ============================================================
// KAZI POST PERMANENT JOB WIZARD (8 steps)
// ============================================================

const COLORS = {
  green: '#1a7f5e', greenDark: '#15604a', greenSoft: '#e8f3ee', greenTint: '#f1f9f5',
  coral: '#e8734a', bg: '#f9f8f6', card: '#ffffff', text: '#1a1a1a',
  textMid: '#5a5a5a', textLight: '#8a8a8a', border: '#ececec', borderSoft: '#f3f3f3',
  purple: '#7c3aed', purpleSoft: '#f1ebfa',
  danger: '#ef4444', white: '#ffffff',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ─── Option Arrays ─── */
const ROLES = ['Dental Assistant', 'Hygienist', 'Front Desk', 'Dentist', 'Office Manager', 'Treatment Coordinator'];
const PRACTICE_TYPES = ['General Dentistry', 'Pediatric', 'Orthodontic', 'Periodontal', 'Endodontic', 'Oral Surgery', 'Prosthodontic', 'Cosmetic', 'Multi-specialty', 'DSO / Corporate'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract'];
const DAYS_OF_WEEK = [
  { key: 'Mon', label: 'MON' },
  { key: 'Tue', label: 'TUE' },
  { key: 'Wed', label: 'WED' },
  { key: 'Thu', label: 'THU' },
  { key: 'Fri', label: 'FRI' },
  { key: 'Sat', label: 'SAT' },
  { key: 'Sun', label: 'SUN' },
];
const START_DATE_OPTIONS = ['ASAP', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'Flexible'];
const EXPERIENCE_OPTIONS = ['No minimum', '1+ years', '2+ years', '3+ years', '5+ years', '7+ years', '10+ years'];
const EDUCATION_OPTIONS = ['No minimum', 'High School Diploma', "Associate's Degree", "Bachelor's Degree", "Master's Degree", 'Doctorate (DDS/DMD)'];
const CREDENTIAL_OPTIONS = ['RDH', 'RDA', 'EFDA', 'CDA', 'BLS CPR', 'Radiology', 'Local Anesthesia', 'Nitrous Monitoring'];
const SOFTWARE_OPTIONS = ['Dentrix', 'Eaglesoft', 'Open Dental', 'Curve', 'Denticon', 'Carestream'];
const BENEFIT_OPTIONS = [
  'Health Insurance', 'Dental Insurance', 'Vision Insurance', '401(k)', '401(k) Match', 'Paid Time Off',
  'Paid Holidays', 'Sick Leave', 'CE Allowance', 'License Reimbursement', 'Uniform Allowance', 'Sign-on Bonus',
  'Performance Bonus', 'Profit Sharing', 'Free Dental Care', 'Family Discount', 'Life Insurance', 'Disability Insurance',
];

/* ─── Shared Style Constants ─── */
const questionStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 800,
  fontSize: 26,
  color: COLORS.text,
  margin: 0,
  lineHeight: 1.2,
};

const helperStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  color: COLORS.textMid,
  marginTop: 8,
  marginBottom: 28,
  lineHeight: 1.5,
};

const fieldLabelStyle = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0.6,
  color: COLORS.textLight,
  marginBottom: 10,
};

const pillBtnBase = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 14,
  fontWeight: 600,
  padding: '12px 18px',
  borderRadius: 100,
  border: `1.5px solid ${COLORS.border}`,
  background: COLORS.white,
  color: COLORS.textMid,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  outline: 'none',
};

const pillBtnActive = {
  ...pillBtnBase,
  borderColor: COLORS.green,
  background: COLORS.greenTint,
  color: COLORS.green,
  fontWeight: 700,
};

const pillBtnActivePurple = {
  ...pillBtnBase,
  borderColor: COLORS.purple,
  background: COLORS.purpleSoft,
  color: COLORS.purple,
  fontWeight: 700,
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function PostPermanentJobWizard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const totalSteps = 8;
  const [step, setStep] = useState(1);
  const [successOpen, setSuccessOpen] = useState(false);

  /* ─── Office Info ─── */
  const [officeName, setOfficeName] = useState('Your Practice');
  const [officeCity, setOfficeCity] = useState('Houston');

  /* ─── Step 1: Role ─── */
  const [role, setRole] = useState('');
  const [practiceType, setPracticeType] = useState('');
  const [practiceTypeOpen, setPracticeTypeOpen] = useState(false);
  const [employmentType, setEmploymentType] = useState('Full-time');

  /* ─── Step 2: Schedule ─── */
  const [days, setDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [defaultStart, setDefaultStart] = useState({ h: 8, m: '00', p: 'AM' });
  const [defaultEnd, setDefaultEnd] = useState({ h: 5, m: '00', p: 'PM' });
  const [differentHours, setDifferentHours] = useState(false);
  const [startDateOption, setStartDateOption] = useState('ASAP');
  const [startDateOpen, setStartDateOpen] = useState(false);

  /* ─── Step 3: Compensation ─── */
  const [payType, setPayType] = useState('hourly');
  const [payMin, setPayMin] = useState('');
  const [payMax, setPayMax] = useState('');

  /* ─── Step 4: Requirements ─── */
  const [experience, setExperience] = useState('3+ years');
  const [experienceOpen, setExperienceOpen] = useState(false);
  const [education, setEducation] = useState("Associate's Degree");
  const [educationOpen, setEducationOpen] = useState(false);

  /* ─── Step 5: Skills & Tools ─── */
  const [credentials, setCredentials] = useState([]);
  const [software, setSoftware] = useState([]);

  /* ─── Step 6: Benefits ─── */
  const [benefits, setBenefits] = useState([]);

  /* ─── Step 7: AI Builder ─── */
  const [selectedStyleIdx, setSelectedStyleIdx] = useState(0);
  const [aiGenerated, setAiGenerated] = useState('');
  const [aiEditing, setAiEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  /* ─── Fetch office name ─── */
  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/offices/me`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          if (data.name) setOfficeName(data.name);
          if (data.city) setOfficeCity(data.city);
        }
      } catch {}
    };
    fetchOffice();
  }, [getToken]);

  /* ─── Helpers ─── */
  const toggleArr = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const formatTime = (t) => {
    if (!t || typeof t !== 'object') return '';
    return `${t.h}:${t.m} ${t.p}`;
  };

  /* ─── Build AI ─── */
  const buildAi = useCallback(() => {
    const style = AI_STYLES[selectedStyleIdx] || AI_STYLES[0];
    const formData = {
      role: role || 'Dental Professional',
      employmentType,
      days: days.length ? days.join(', ') : 'Flexible',
      startTime: formatTime(defaultStart),
      endTime: formatTime(defaultEnd),
      payType,
      payMin,
      payMax,
      experience,
      education,
      credentials,
      software,
      benefits,
    };
    return style.fn(formData, { name: officeName, city: officeCity });
  }, [selectedStyleIdx, role, employmentType, days, defaultStart, defaultEnd, payType, payMin, payMax, experience, education, credentials, software, benefits, officeName, officeCity]);

  const handleGenerate = () => {
    setAiLoading(true);
    setTimeout(() => {
      setAiGenerated(buildAi());
      setHasGenerated(true);
      setAiLoading(false);
      setAiEditing(false);
    }, 800);
  };

  const handleTryAnother = () => {
    setSelectedStyleIdx((selectedStyleIdx + 1) % AI_STYLES.length);
    setAiLoading(true);
    setTimeout(() => {
      const nextIdx = (selectedStyleIdx + 1) % AI_STYLES.length;
      const style = AI_STYLES[nextIdx] || AI_STYLES[0];
      const formData = {
        role: role || 'Dental Professional',
        employmentType,
        days: days.length ? days.join(', ') : 'Flexible',
        startTime: formatTime(defaultStart),
        endTime: formatTime(defaultEnd),
        payType, payMin, payMax,
        experience, education, credentials, software, benefits,
      };
      setAiGenerated(style.fn(formData, { name: officeName, city: officeCity }));
      setAiLoading(false);
      setAiEditing(false);
    }, 600);
  };

  /* ─── Navigation ─── */
  const next = async () => {
    if (step < totalSteps) {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
    } else {
      try {
        const token = await getToken();
        const body = {
          role,
          jobType: 'PERMANENT',
          date: new Date().toISOString(),
          startTime: formatTime(defaultStart),
          endTime: formatTime(defaultEnd),
          hourlyRate: payType === 'hourly' ? parseFloat(payMin || '0') : 0,
          description: aiGenerated || '',
          schedule: `${employmentType} · ${days.join(', ')}`,
          benefits,
          software,
          experienceYr: experience,
          salaryMin: payType === 'salary' ? parseFloat(payMin || '0') : null,
          salaryMax: payType === 'salary' ? parseFloat(payMax || '0') : null,
        };
        const res = await fetch(`${API_URL}/api/shifts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        if (res.ok) setSuccessOpen(true);
        else {
          const err = await res.json().catch(() => ({}));
          alert(err.error || 'Failed to post job');
        }
      } catch {
        alert('Failed to post job');
      }
    }
  };

  const back = () => { if (step > 1) { setStep(s => s - 1); window.scrollTo(0, 0); } };
  const goToStep = (s) => { setStep(s); window.scrollTo(0, 0); };

  /* ─── Pay Display ─── */
  const payDisplay = () => {
    if (payType === 'salary') {
      if (payMin && payMax) return `$${Number(payMin).toLocaleString()} – $${Number(payMax).toLocaleString()} / year`;
      if (payMin) return `$${Number(payMin).toLocaleString()} / year`;
      return '—';
    }
    if (payMin && payMax) return `$${payMin} – $${payMax} / hr`;
    if (payMin) return `$${payMin} / hr`;
    return '—';
  };

  /* ─── Can Continue ─── */
  const canContinue = () => {
    if (step === 1) return !!role;
    if (step === 2) return days.length > 0;
    if (step === 3) return !!payMin;
    return true;
  };

  /* ─── Success Modal ─── */
  if (successOpen) {
    return (
      <SuccessModal
        onDashboard={() => navigate('/dashboard')}
        onPostAnother={() => {
          setSuccessOpen(false);
          setStep(1);
          setRole(''); setPracticeType(''); setEmploymentType('Full-time');
          setDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
          setDefaultStart({ h: 8, m: '00', p: 'AM' }); setDefaultEnd({ h: 5, m: '00', p: 'PM' });
          setDifferentHours(false); setStartDateOption('ASAP');
          setPayType('hourly'); setPayMin(''); setPayMax('');
          setExperience('3+ years'); setEducation("Associate's Degree");
          setCredentials([]); setSoftware([]); setBenefits([]);
          setSelectedStyleIdx(0); setAiGenerated(''); setAiEditing(false); setHasGenerated(false);
        }}
      />
    );
  }

  /* ─── Step Labels ─── */
  const stepLabels = ['Role', 'Schedule', 'Pay', 'Requirements', 'Skills & Tools', 'Benefits', 'Description', 'Review'];

  /* ─── Render ─── */
  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(15px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes shine { 0% { left: -100%; } 100% { left: 200%; } }
        .kazi-perm-wizard * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        .kazi-perm-wizard button { font-family: inherit; }
        .kazi-perm-wizard .wheel-col::-webkit-scrollbar { display: none; }
        .scroll-snap-y { scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch; }
        .scroll-snap-center { scroll-snap-align: center; }
      `}</style>

      <div className="kazi-perm-wizard" style={{ fontFamily: "'DM Sans', sans-serif", background: COLORS.bg, color: COLORS.text, WebkitFontSmoothing: 'antialiased', paddingBottom: 110, maxWidth: 480, margin: '0 auto', minHeight: '100vh', boxShadow: '0 0 40px rgba(0,0,0,0.06)', position: 'relative' }}>

        {/* ─── Header ─── */}
        <div style={{ padding: '18px 20px 16px', background: 'white', borderBottom: `1px solid ${COLORS.borderSoft}`, position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <button onClick={() => navigate('/dashboard')} style={{ width: 38, height: 38, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text, lineHeight: 1 }}>Post Permanent Job</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: COLORS.textLight, marginTop: 3, fontWeight: 600 }}>Step {step} of {totalSteps}</div>
            </div>
            <div style={{ background: COLORS.greenTint, color: COLORS.green, padding: '5px 11px', borderRadius: 100, fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0 }}>Permanent</div>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i < step ? COLORS.green : COLORS.borderSoft,
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: COLORS.textLight }}>
              Step {step} of {totalSteps}
            </span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: COLORS.green }}>
              {stepLabels[step - 1]}
            </span>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div style={{ padding: '24px 20px 20px', animation: 'slideIn 0.3s ease-out' }} key={step}>

          {/* ═══ STEP 1: WHO ARE YOU HIRING? ═══ */}
          {step === 1 && (
            <div>
              <p style={questionStyle}>Who are you hiring?</p>
              <p style={helperStyle}>Tell us about the role and your practice.</p>

              <p style={fieldLabelStyle}>Role</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {ROLES.map(r => (
                  <button key={r} onClick={() => setRole(r)}
                    style={role === r ? pillBtnActive : pillBtnBase}>
                    {r}
                  </button>
                ))}
              </div>

              <p style={fieldLabelStyle}>Practice Type</p>
              <div style={{ position: 'relative', marginBottom: 28 }}>
                <button onClick={() => setPracticeTypeOpen(!practiceTypeOpen)} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                  width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left',
                  border: `1.5px solid ${practiceType ? COLORS.green : COLORS.border}`,
                  background: COLORS.white, color: practiceType ? COLORS.text : COLORS.textLight,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif" }}>{practiceType || 'Select practice type'}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18, transform: practiceTypeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {practiceTypeOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14,
                    marginTop: 4, maxHeight: 240, overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}>
                    {PRACTICE_TYPES.map(pt => (
                      <button key={pt} onClick={() => { setPracticeType(pt); setPracticeTypeOpen(false); }} style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                        width: '100%', padding: '14px 18px', border: 'none', textAlign: 'left',
                        background: practiceType === pt ? COLORS.greenTint : 'transparent',
                        color: practiceType === pt ? COLORS.green : COLORS.text,
                        cursor: 'pointer', borderBottom: `1px solid ${COLORS.borderSoft}`,
                      }}>
                        {pt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p style={fieldLabelStyle}>Employment Type</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {EMPLOYMENT_TYPES.map(t => (
                  <button key={t} onClick={() => setEmploymentType(t)}
                    style={employmentType === t ? pillBtnActive : pillBtnBase}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ STEP 2: WHEN WILL THEY WORK? ═══ */}
          {step === 2 && (
            <div>
              <p style={questionStyle}>When will they work?</p>
              <p style={helperStyle}>Set the days, hours, and start date.</p>

              <p style={fieldLabelStyle}>Days Per Week</p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                {DAYS_OF_WEEK.map(d => {
                  const sel = days.includes(d.key);
                  return (
                    <button key={d.key} onClick={() => toggleArr(days, setDays, d.key)} style={{
                      fontFamily: sel ? "'Outfit', sans-serif" : "'DM Sans', sans-serif",
                      fontSize: 12, fontWeight: sel ? 700 : 600,
                      width: 48, height: 48, borderRadius: 14,
                      border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
                      background: sel ? COLORS.green : COLORS.white,
                      color: sel ? COLORS.white : COLORS.textMid,
                      cursor: 'pointer', transition: 'all 0.15s ease', outline: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {d.label}
                    </button>
                  );
                })}
              </div>

              <p style={fieldLabelStyle}>Default Hours</p>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <TimePickerCard label="START TIME" value={defaultStart} onChange={setDefaultStart} />
                <TimePickerCard label="END TIME" value={defaultEnd} onChange={setDefaultEnd} />
              </div>

              {/* Different hours toggle */}
              <button onClick={() => setDifferentHours(!differentHours)} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left',
                border: `1.5px solid ${differentHours ? COLORS.green : COLORS.border}`,
                background: COLORS.white, color: COLORS.text,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 28,
              }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Different hours on some days?</span>
                <div style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: differentHours ? COLORS.green : COLORS.border,
                  transition: 'background 0.2s ease', position: 'relative',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 9, background: COLORS.white,
                    position: 'absolute', top: 3,
                    left: differentHours ? 23 : 3,
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }} />
                </div>
              </button>

              <p style={fieldLabelStyle}>Ideal Start Date</p>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setStartDateOpen(!startDateOpen)} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                  width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left',
                  border: `1.5px solid ${COLORS.green}`,
                  background: COLORS.white, color: COLORS.text,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif" }}>{startDateOption}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18, transform: startDateOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {startDateOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14,
                    marginTop: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}>
                    {START_DATE_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => { setStartDateOption(opt); setStartDateOpen(false); }} style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                        width: '100%', padding: '14px 18px', border: 'none', textAlign: 'left',
                        background: startDateOption === opt ? COLORS.greenTint : 'transparent',
                        color: startDateOption === opt ? COLORS.green : COLORS.text,
                        cursor: 'pointer', borderBottom: `1px solid ${COLORS.borderSoft}`,
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 3: WHAT DOES IT PAY? ═══ */}
          {step === 3 && (
            <div>
              <p style={questionStyle}>What does it pay?</p>
              <p style={helperStyle}>Set a clear range — candidates expect transparency.</p>

              {/* Hourly / Salary Toggle */}
              <div style={{
                display: 'flex', background: COLORS.borderSoft, borderRadius: 100, padding: 4, marginBottom: 28,
              }}>
                {['hourly', 'salary'].map(t => (
                  <button key={t} onClick={() => setPayType(t)} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700,
                    flex: 1, padding: '14px 0', borderRadius: 100, border: 'none',
                    background: payType === t ? COLORS.white : 'transparent',
                    color: payType === t ? COLORS.text : COLORS.textLight,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    boxShadow: payType === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  }}>
                    {t === 'hourly' ? 'Hourly' : 'Salary'}
                  </button>
                ))}
              </div>

              {/* Min / Max Cards */}
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{
                  flex: 1, background: COLORS.white, border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 16, padding: '20px 18px', textAlign: 'center',
                }}>
                  <p style={{ ...fieldLabelStyle, marginBottom: 14, textAlign: 'center' }}>
                    {payType === 'salary' ? 'MIN / YR' : 'MIN / HR'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.green }}>$</span>
                    <input type="number" value={payMin} onChange={e => setPayMin(e.target.value)}
                      placeholder={payType === 'salary' ? '55000' : '48'}
                      style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700,
                        border: 'none', outline: 'none', background: 'transparent',
                        color: COLORS.text, width: payType === 'salary' ? 110 : 70, textAlign: 'center',
                      }} />
                  </div>
                </div>

                <div style={{
                  flex: 1, background: COLORS.white, border: `1.5px solid ${COLORS.border}`,
                  borderRadius: 16, padding: '20px 18px', textAlign: 'center',
                }}>
                  <p style={{ ...fieldLabelStyle, marginBottom: 14, textAlign: 'center' }}>
                    {payType === 'salary' ? 'MAX / YR' : 'MAX / HR'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: COLORS.green }}>$</span>
                    <input type="number" value={payMax} onChange={e => setPayMax(e.target.value)}
                      placeholder={payType === 'salary' ? '75000' : '62'}
                      style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700,
                        border: 'none', outline: 'none', background: 'transparent',
                        color: COLORS.text, width: payType === 'salary' ? 110 : 70, textAlign: 'center',
                      }} />
                  </div>
                </div>
              </div>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textLight, marginTop: 12, textAlign: 'center' }}>
                {payType === 'salary' ? 'Annual salary range.' : 'Hourly rate range.'} Max is optional.
              </p>
            </div>
          )}

          {/* ═══ STEP 4: WHAT'S REQUIRED? ═══ */}
          {step === 4 && (
            <div>
              <p style={questionStyle}>What's required?</p>
              <p style={helperStyle}>Set the minimum bar for candidates.</p>

              <p style={fieldLabelStyle}>Years of Experience</p>
              <div style={{ position: 'relative', marginBottom: 28 }}>
                <button onClick={() => setExperienceOpen(!experienceOpen)} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                  width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left',
                  border: `1.5px solid ${COLORS.green}`,
                  background: COLORS.white, color: COLORS.text,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif" }}>{experience}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18, transform: experienceOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {experienceOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14,
                    marginTop: 4, maxHeight: 260, overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}>
                    {EXPERIENCE_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => { setExperience(opt); setExperienceOpen(false); }} style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                        width: '100%', padding: '14px 18px', border: 'none', textAlign: 'left',
                        background: experience === opt ? COLORS.greenTint : 'transparent',
                        color: experience === opt ? COLORS.green : COLORS.text,
                        cursor: 'pointer', borderBottom: `1px solid ${COLORS.borderSoft}`,
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <p style={fieldLabelStyle}>Education Required</p>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setEducationOpen(!educationOpen)} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                  width: '100%', padding: '16px 18px', borderRadius: 14, textAlign: 'left',
                  border: `1.5px solid ${COLORS.green}`,
                  background: COLORS.white, color: COLORS.text,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: "'DM Sans', sans-serif" }}>{education}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" style={{ width: 18, height: 18, transform: educationOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {educationOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14,
                    marginTop: 4, maxHeight: 260, overflowY: 'auto',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  }}>
                    {EDUCATION_OPTIONS.map(opt => (
                      <button key={opt} onClick={() => { setEducation(opt); setEducationOpen(false); }} style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                        width: '100%', padding: '14px 18px', border: 'none', textAlign: 'left',
                        background: education === opt ? COLORS.greenTint : 'transparent',
                        color: education === opt ? COLORS.green : COLORS.text,
                        cursor: 'pointer', borderBottom: `1px solid ${COLORS.borderSoft}`,
                      }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ STEP 5: SKILLS & TOOLS ═══ */}
          {step === 5 && (
            <div>
              <p style={questionStyle}>Skills & tools</p>
              <p style={helperStyle}>Pick the credentials and software the role requires.</p>

              <p style={fieldLabelStyle}>Required Credentials</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                {CREDENTIAL_OPTIONS.map(c => (
                  <button key={c} onClick={() => toggleArr(credentials, setCredentials, c)}
                    style={credentials.includes(c) ? pillBtnActive : pillBtnBase}>
                    {c}
                  </button>
                ))}
              </div>

              <p style={fieldLabelStyle}>Dental Software</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SOFTWARE_OPTIONS.map(s => (
                  <button key={s} onClick={() => toggleArr(software, setSoftware, s)}
                    style={software.includes(s) ? pillBtnActivePurple : pillBtnBase}>
                    {s}
                  </button>
                ))}
              </div>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textLight, marginTop: 14 }}>
                {credentials.length === 0 && software.length === 0
                  ? 'No selections yet — this step is optional.'
                  : `${credentials.length} credential${credentials.length !== 1 ? 's' : ''}, ${software.length} software selected`}
              </p>
            </div>
          )}

          {/* ═══ STEP 6: BENEFITS ═══ */}
          {step === 6 && (
            <div>
              <p style={questionStyle}>What benefits do you offer?</p>
              <p style={helperStyle}>Strong benefits attract better candidates. Pick all that apply.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {BENEFIT_OPTIONS.map(b => {
                  const sel = benefits.includes(b);
                  return (
                    <button key={b} onClick={() => toggleArr(benefits, setBenefits, b)} style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                      padding: '16px 14px', borderRadius: 14, textAlign: 'left',
                      border: `1.5px solid ${sel ? COLORS.green : COLORS.border}`,
                      background: sel ? COLORS.greenTint : COLORS.white,
                      color: sel ? COLORS.green : COLORS.text,
                      cursor: 'pointer', transition: 'all 0.15s ease', outline: 'none',
                      display: 'flex', alignItems: 'center', gap: 10,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: `2px solid ${sel ? COLORS.green : COLORS.border}`,
                        background: sel ? COLORS.green : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s ease',
                      }}>
                        {sel && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", lineHeight: 1.3 }}>{b}</span>
                    </button>
                  );
                })}
              </div>

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textLight, marginTop: 14, textAlign: 'center' }}>
                {benefits.length === 0 ? 'No benefits selected yet.' : `${benefits.length} benefit${benefits.length !== 1 ? 's' : ''} selected`}
              </p>
            </div>
          )}

          {/* ═══ STEP 7: AI DESCRIPTION BUILDER ═══ */}
          {step === 7 && (
            <div>
              <p style={questionStyle}>Now let's write the description.</p>
              <p style={helperStyle}>Kazi AI will use everything you've entered to write a polished post.</p>

              {!hasGenerated ? (
                /* Pre-generate card */
                <div style={{
                  background: `linear-gradient(135deg, ${COLORS.purple} 0%, #9f67ff 100%)`,
                  borderRadius: 20, padding: '32px 24px', textAlign: 'center',
                  marginBottom: 24,
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: 40, height: 40 }}>
                      <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74L12 2z" fill="white" opacity="0.9" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.white, margin: '0 0 8px' }}>
                    AI Job Description Builder
                  </h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, margin: '0 0 24px' }}>
                    Tap below to generate. Flip through {AI_STYLES.length} different writing styles to find the perfect tone.
                  </p>
                  <button onClick={handleGenerate} disabled={aiLoading} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                    padding: '16px 32px', borderRadius: 100, border: 'none',
                    background: COLORS.white, color: COLORS.purple,
                    cursor: aiLoading ? 'wait' : 'pointer',
                    position: 'relative', overflow: 'hidden',
                    opacity: aiLoading ? 0.7 : 1,
                  }}>
                    {aiLoading ? 'Generating...' : 'Generate with AI'}
                    {!aiLoading && (
                      <div style={{
                        position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.15), transparent)',
                        animation: 'shine 2s infinite',
                      }} />
                    )}
                  </button>
                </div>
              ) : (
                /* Post-generate view */
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <p style={{ ...fieldLabelStyle, margin: 0 }}>
                      Style {selectedStyleIdx + 1} of {AI_STYLES.length} — {AI_STYLES[selectedStyleIdx].label}
                    </p>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: COLORS.textLight }}>
                      {AI_STYLES[selectedStyleIdx].emoji}
                    </span>
                  </div>

                  <textarea
                    value={aiGenerated}
                    onChange={e => { setAiGenerated(e.target.value); setAiEditing(true); }}
                    rows={8}
                    style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                      width: '100%', padding: 16, borderRadius: 14, resize: 'none',
                      border: `1.5px solid ${COLORS.border}`, outline: 'none',
                      background: COLORS.white, color: COLORS.text, lineHeight: 1.6,
                      boxSizing: 'border-box',
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textLight }}>
                      {aiGenerated.length} characters
                    </span>
                    <button onClick={handleTryAnother} disabled={aiLoading} style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
                      color: COLORS.purple, background: COLORS.purpleSoft,
                      border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 100,
                    }}>
                      {aiLoading ? 'Generating...' : 'Try another style'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ STEP 8: REVIEW ═══ */}
          {step === 8 && (
            <Step8Review
              role={role}
              practiceType={practiceType}
              employmentType={employmentType}
              days={days}
              startTime={formatTime(defaultStart)}
              endTime={formatTime(defaultEnd)}
              startDateOption={startDateOption}
              payDisplay={payDisplay()}
              payType={payType}
              experience={experience}
              education={education}
              credentials={credentials}
              software={software}
              benefits={benefits}
              aiGenerated={aiGenerated}
              goToStep={goToStep}
            />
          )}
        </div>

        {/* ─── Bottom Nav ─── */}
        <div style={{
          position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', maxWidth: 480, zIndex: 40,
          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
          borderTop: `1px solid ${COLORS.borderSoft}`,
        }}>
          <div style={{ padding: '14px 20px', display: 'flex', gap: 12 }}>
            {step > 1 && (
              <button onClick={back} style={{
                flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
                padding: '14px 0', borderRadius: 100, border: `1.5px solid ${COLORS.border}`,
                background: COLORS.white, color: COLORS.text, cursor: 'pointer',
              }}>
                Back
              </button>
            )}
            <button onClick={next} disabled={!canContinue()} style={{
              flex: step > 1 ? 1.5 : 1, fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
              padding: '14px 0', borderRadius: 100, border: 'none',
              background: canContinue() ? COLORS.green : COLORS.border,
              color: canContinue() ? COLORS.white : COLORS.textLight,
              cursor: canContinue() ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
            }}>
              {step === totalSteps ? 'Post Job' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════
   TIME PICKER CARD
   ═══════════════════════════════════════════════ */
function TimePickerCard({ label, value, onChange }) {
  const [open, setOpen] = useState(false);
  const display = value ? `${value.h}:${value.m} ${value.p}` : 'Select';

  return (
    <div style={{ flex: 1 }}>
      <button onClick={() => setOpen(!open)} style={{
        fontFamily: "'DM Sans', sans-serif",
        width: '100%', padding: '14px 16px', borderRadius: 14, textAlign: 'left',
        border: `1.5px solid ${value ? COLORS.green : COLORS.border}`,
        background: COLORS.white, cursor: 'pointer',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: COLORS.textLight }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 700, color: COLORS.text }}>{display}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}><path d="M6 9l6 6 6-6" /></svg>
        </div>
      </button>
      {open && (
        <TimeWheel
          value={value}
          onChange={(v) => { onChange(v); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TIME WHEEL (iOS-style scroll snap)
   ═══════════════════════════════════════════════ */
function TimeWheel({ value, onChange, onClose }) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = ['00', '15', '30', '45'];
  const periods = ['AM', 'PM'];

  const [h, setH] = useState(value?.h || 8);
  const [m, setM] = useState(value?.m || '00');
  const [p, setP] = useState(value?.p || 'AM');

  return (
    <div style={{
      marginTop: 8, background: COLORS.white, border: `1px solid ${COLORS.border}`,
      borderRadius: 16, padding: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <WheelColumn items={hours} value={h} onChange={setH} />
        <WheelColumn items={minutes} value={m} onChange={setM} />
        <WheelColumn items={periods} value={p} onChange={setP} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{
          flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          padding: '10px 0', borderRadius: 10, border: `1px solid ${COLORS.border}`,
          background: COLORS.white, color: COLORS.textMid, cursor: 'pointer',
        }}>Cancel</button>
        <button onClick={() => onChange({ h, m, p })} style={{
          flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700,
          padding: '10px 0', borderRadius: 10, border: 'none',
          background: COLORS.green, color: COLORS.white, cursor: 'pointer',
        }}>Set</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   WHEEL COLUMN (scroll snap)
   ═══════════════════════════════════════════════ */
function WheelColumn({ items, value, onChange }) {
  const ref = useRef(null);

  return (
    <div ref={ref} className="scroll-snap-y wheel-col" style={{
      flex: 1, maxHeight: 130, overflowY: 'auto', borderRadius: 10,
      background: COLORS.borderSoft,
    }}>
      {items.map(item => (
        <button key={item} className="scroll-snap-center" onClick={() => onChange(item)} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
          width: '100%', padding: '8px 0', border: 'none', cursor: 'pointer',
          borderRadius: 8, transition: 'all 0.15s ease',
          background: String(value) === String(item) ? COLORS.green : 'transparent',
          color: String(value) === String(item) ? COLORS.white : COLORS.textMid,
        }}>
          {item}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   AI WRITING STYLES (10 templates)
   ═══════════════════════════════════════════════ */
const AI_STYLES = [
  {
    id: 'professional', label: 'Professional', emoji: '💼',
    fn: (d, office) =>
      `${office.name} is seeking a ${d.employmentType} ${d.role} to join our growing team${office.city ? ` in ${office.city}` : ''}.\n\n` +
      `Schedule: ${d.days}, ${d.startTime} – ${d.endTime}.\n` +
      `${d.payType === 'salary' ? `Salary: $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? ` – $${Number(d.payMax).toLocaleString()}` : ''}/yr` : `Pay: $${d.payMin || '0'}${d.payMax ? ` – $${d.payMax}` : ''}/hr`}.\n\n` +
      `Requirements:\n` +
      `• ${d.experience} experience\n` +
      `• ${d.education}\n` +
      (d.credentials?.length ? `• ${d.credentials.join(', ')}\n` : '') +
      (d.software?.length ? `• Proficiency in ${d.software.join(', ')}\n` : '') +
      (d.benefits?.length ? `\nBenefits include ${d.benefits.join(', ')}.` : ''),
  },
  {
    id: 'friendly', label: 'Friendly & Warm', emoji: '😊',
    fn: (d, office) =>
      `Hey there! We're looking for an awesome ${d.role} to join the ${office.name} family${office.city ? ` here in ${office.city}` : ''}!\n\n` +
      `This is a ${d.employmentType} position — ${d.days}, ${d.startTime} to ${d.endTime}.\n\n` +
      `${d.payType === 'salary' ? `We're offering $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? `–$${Number(d.payMax).toLocaleString()}` : ''}/yr` : `Pay starts at $${d.payMin || '0'}/hr`}.\n\n` +
      `We'd love someone with ${d.experience} of experience and ${d.education.toLowerCase() !== 'no minimum' ? `a ${d.education}` : 'a passion for dentistry'}.\n\n` +
      (d.benefits?.length ? `Perks? Oh yeah — ${d.benefits.join(', ')}! Come grow with us!` : 'Come grow with us!'),
  },
  {
    id: 'concise', label: 'Short & Direct', emoji: '⚡',
    fn: (d, office) =>
      `${d.employmentType} ${d.role} — ${office.name}${office.city ? `, ${office.city}` : ''}.\n\n` +
      `${d.days}. ${d.startTime}–${d.endTime}.\n` +
      `${d.payType === 'salary' ? `$${Number(d.payMin || 0).toLocaleString()}/yr` : `$${d.payMin || '0'}/hr`}.\n` +
      `${d.experience} exp. ${d.education !== 'No minimum' ? d.education + '.' : ''}\n` +
      (d.credentials?.length ? d.credentials.join(', ') + '.\n' : '') +
      (d.benefits?.length ? `Benefits: ${d.benefits.join(', ')}.` : ''),
  },
  {
    id: 'enthusiastic', label: 'Enthusiastic', emoji: '🚀',
    fn: (d, office) =>
      `Exciting opportunity alert! ${office.name}${office.city ? ` in ${office.city}` : ''} is hiring a talented ${d.role}!\n\n` +
      `This ${d.employmentType} role features an amazing schedule — ${d.days}, ${d.startTime} to ${d.endTime}.\n\n` +
      `${d.payType === 'salary' ? `Salary: $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? `–$${Number(d.payMax).toLocaleString()}` : ''}/yr!` : `Competitive pay starting at $${d.payMin || '0'}/hr!`}\n\n` +
      `We're looking for someone with ${d.experience} of experience who's passionate about patient care.\n\n` +
      (d.benefits?.length ? `Amazing benefits including ${d.benefits.join(', ')}! Don't miss out — apply today!` : 'Apply today!'),
  },
  {
    id: 'clinical', label: 'Clinical', emoji: '🩺',
    fn: (d, office) =>
      `Position: ${d.employmentType} ${d.role}\nPractice: ${office.name}${office.city ? `, ${office.city}` : ''}\n\n` +
      `Clinical hours: ${d.days}, ${d.startTime}–${d.endTime}\n` +
      `Compensation: ${d.payType === 'salary' ? `$${Number(d.payMin || 0).toLocaleString()}/year` : `$${d.payMin || '0'}/hour`}\n\n` +
      `Required:\n` +
      `• Experience: ${d.experience}\n` +
      `• Education: ${d.education}\n` +
      (d.credentials?.length ? `• Certifications: ${d.credentials.join(', ')}\n` : '') +
      (d.software?.length ? `• Software: ${d.software.join(', ')}\n` : '') +
      (d.benefits?.length ? `\nBenefits: ${d.benefits.join(', ')}.` : ''),
  },
  {
    id: 'storytelling', label: 'Storytelling', emoji: '📖',
    fn: (d, office) =>
      `Imagine walking into a practice where your skills are valued and your growth matters. At ${office.name}${office.city ? ` in ${office.city}` : ''}, that's exactly what you'll find.\n\n` +
      `We're looking for a ${d.role} who wants to make a real difference. As a ${d.employmentType} team member working ${d.days}, you'll enjoy a supportive environment with hours from ${d.startTime} to ${d.endTime}.\n\n` +
      `${d.payType === 'salary' ? `We offer a competitive salary starting at $${Number(d.payMin || 0).toLocaleString()}/yr` : `Starting at $${d.payMin || '0'}/hr`}.\n\n` +
      (d.benefits?.length ? `Plus incredible benefits: ${d.benefits.join(', ')}.\n\n` : '') +
      `Ready to write the next chapter of your career?`,
  },
  {
    id: 'modern', label: 'Modern & Trendy', emoji: '✨',
    fn: (d, office) =>
      `${office.name} is leveling up${office.city ? ` in ${office.city}` : ''} — and we need YOU.\n\n` +
      `We're on the hunt for a ${d.employmentType} ${d.role} who's ready to bring their A-game.\n\n` +
      `The vibe: ${d.days}, ${d.startTime}–${d.endTime}.\n` +
      `The pay: ${d.payType === 'salary' ? `$${Number(d.payMin || 0).toLocaleString()}+/yr` : `$${d.payMin || '0'}+/hr`}.\n` +
      (d.benefits?.length ? `The perks: ${d.benefits.join(', ')}.\n\n` : '\n') +
      `Sound like your thing? Let's talk.`,
  },
  {
    id: 'benefits', label: 'Benefits-Focused', emoji: '🎁',
    fn: (d, office) =>
      `Looking for a ${d.role} position with an incredible benefits package? ${office.name}${office.city ? ` in ${office.city}` : ''} has you covered.\n\n` +
      (d.benefits?.length ? `We offer ${d.benefits.join(', ')} — because you deserve it.\n\n` : 'We offer a comprehensive benefits package.\n\n') +
      `This ${d.employmentType} position features a ${d.days} schedule, ${d.startTime} to ${d.endTime}.\n` +
      `${d.payType === 'salary' ? `Salary range: $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? `–$${Number(d.payMax).toLocaleString()}` : ''}/yr` : `Pay: $${d.payMin || '0'}${d.payMax ? `–$${d.payMax}` : ''}/hr`}.\n\n` +
      `${d.experience} of experience preferred. ${d.education !== 'No minimum' ? d.education + ' required.' : ''}`,
  },
  {
    id: 'inclusive', label: 'Inclusive', emoji: '🌈',
    fn: (d, office) =>
      `${office.name}${office.city ? ` in ${office.city}` : ''} welcomes applicants of all backgrounds!\n\n` +
      `We're hiring a ${d.employmentType} ${d.role} for our diverse, patient-centered team.\n\n` +
      `Schedule: ${d.days}, ${d.startTime}–${d.endTime}.\n` +
      `${d.payType === 'salary' ? `Competitive salary from $${Number(d.payMin || 0).toLocaleString()}/yr` : `Starting at $${d.payMin || '0'}/hr`}.\n\n` +
      `${d.experience} experience welcome. ${d.education !== 'No minimum' ? d.education + ' preferred.' : ''}\n\n` +
      (d.benefits?.length ? `Benefits include ${d.benefits.join(', ')}.\n\n` : '') +
      `We believe in creating a workplace where everyone thrives.`,
  },
  {
    id: 'urgent', label: 'Urgently Hiring', emoji: '🔥',
    fn: (d, office) =>
      `URGENTLY HIRING: ${d.employmentType} ${d.role} at ${office.name}${office.city ? ` in ${office.city}` : ''}!\n\n` +
      `We need someone ASAP for a ${d.days} schedule, ${d.startTime}–${d.endTime}.\n\n` +
      `${d.payType === 'salary' ? `Salary: $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? `–$${Number(d.payMax).toLocaleString()}` : ''}/yr` : `Pay: $${d.payMin || '0'}${d.payMax ? `–$${d.payMax}` : ''}/hr`}.\n\n` +
      `${d.experience} experience required. ${d.education !== 'No minimum' ? d.education + '.' : ''}\n` +
      (d.benefits?.length ? `Full benefits: ${d.benefits.join(', ')}.\n\n` : '\n') +
      `Apply now — interviews happening this week!`,
  },
];

/* ═══════════════════════════════════════════════
   STEP 8 REVIEW
   ═══════════════════════════════════════════════ */
function Step8Review({ role, practiceType, employmentType, days, startTime, endTime, startDateOption, payDisplay, payType, experience, education, credentials, software, benefits, aiGenerated, goToStep }) {
  return (
    <div>
      <p style={questionStyle}>Review and post.</p>
      <p style={helperStyle}>Take one last look. Tap Edit on any section to make changes.</p>

      <ReviewCard label="Role" value={role} step={1} goToStep={goToStep} />
      <ReviewCard label="Practice Type" value={practiceType || 'Not specified'} step={1} goToStep={goToStep} />
      <ReviewCard label="Employment" value={employmentType} step={1} goToStep={goToStep} />
      <ReviewCard label="Schedule" value={days.length ? `${days.join(', ')} · ${startTime} – ${endTime}` : 'Not set'} step={2} goToStep={goToStep} />
      <ReviewCard label="Start Date" value={startDateOption} step={2} goToStep={goToStep} />
      <ReviewCard label="Compensation" value={payDisplay} step={3} goToStep={goToStep} />
      <ReviewCard label="Experience" value={experience} step={4} goToStep={goToStep} />
      <ReviewCard label="Education" value={education} step={4} goToStep={goToStep} />

      {/* Credentials */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: `1px solid ${COLORS.borderSoft}` }}>
        <div style={{ flex: 1 }}>
          <p style={{ ...fieldLabelStyle, marginBottom: 8 }}>Credentials</p>
          <TagsList items={credentials} />
        </div>
        <button onClick={() => goToStep(5)} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer',
        }}>Edit</button>
      </div>

      {/* Software */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: `1px solid ${COLORS.borderSoft}` }}>
        <div style={{ flex: 1 }}>
          <p style={{ ...fieldLabelStyle, marginBottom: 8 }}>Software</p>
          <TagsList items={software} color="purple" />
        </div>
        <button onClick={() => goToStep(5)} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer',
        }}>Edit</button>
      </div>

      {/* Benefits */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: `1px solid ${COLORS.borderSoft}` }}>
        <div style={{ flex: 1 }}>
          <p style={{ ...fieldLabelStyle, marginBottom: 8 }}>Benefits</p>
          <TagsList items={benefits} />
        </div>
        <button onClick={() => goToStep(6)} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer',
        }}>Edit</button>
      </div>

      {/* Description */}
      <div style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{ ...fieldLabelStyle, margin: 0 }}>Job Description</p>
          <button onClick={() => goToStep(7)} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
            color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer',
          }}>Edit</button>
        </div>
        <div style={{
          background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 14,
          padding: 16,
        }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.text, lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
            {aiGenerated || 'No description generated.'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   REVIEW CARD (with Edit button)
   ═══════════════════════════════════════════════ */
function ReviewCard({ label, value, step, goToStep }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 0', borderBottom: `1px solid ${COLORS.borderSoft}`,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ ...fieldLabelStyle, marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: COLORS.text, margin: 0 }}>
          {value || '—'}
        </p>
      </div>
      <button onClick={() => goToStep(step)} style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
        color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer',
      }}>Edit</button>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   TAGS LIST
   ═══════════════════════════════════════════════ */
function TagsList({ items, color = 'green' }) {
  if (!items?.length) return (
    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: COLORS.textLight }}>None selected</span>
  );
  const bg = color === 'purple' ? COLORS.purpleSoft : COLORS.greenSoft;
  const fg = color === 'purple' ? COLORS.purple : COLORS.green;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map(t => (
        <span key={t} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          padding: '5px 12px', borderRadius: 100, background: bg, color: fg,
        }}>{t}</span>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SUCCESS MODAL (with confetti)
   ═══════════════════════════════════════════════ */
function SuccessModal({ onDashboard, onPostAnother }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <style>{`
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>
      <Confetti />
      <div style={{
        background: COLORS.white, borderRadius: 24, padding: '40px 28px', width: '100%', maxWidth: 380,
        textAlign: 'center', position: 'relative', zIndex: 1000, animation: 'popIn 0.35s ease',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.text, margin: '0 0 8px' }}>
          Your job is live!
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.textMid, lineHeight: 1.5, margin: '0 0 28px' }}>
          Your permanent position is now live. Qualified professionals in your area will be notified.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={onPostAnother} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
            padding: '14px 0', borderRadius: 100, border: `1.5px solid ${COLORS.border}`,
            background: COLORS.white, color: COLORS.text, cursor: 'pointer',
            width: '100%',
          }}>
            Post another
          </button>
          <button onClick={onDashboard} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
            padding: '14px 0', borderRadius: 100, border: 'none',
            background: COLORS.green, color: COLORS.white, cursor: 'pointer',
            width: '100%',
          }}>
            View posting
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   CONFETTI
   ═══════════════════════════════════════════════ */
function Confetti() {
  const colors = [COLORS.green, COLORS.purple, '#f59e0b', '#ef4444', '#3b82f6', '#10b981', COLORS.coral];
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: colors[i % colors.length],
    size: 6 + Math.random() * 8,
    duration: 1.5 + Math.random() * 2,
  }));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 999, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.left}%`,
          top: -20,
          width: p.size,
          height: p.size,
          borderRadius: p.id % 3 === 0 ? '50%' : 2,
          background: p.color,
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}
