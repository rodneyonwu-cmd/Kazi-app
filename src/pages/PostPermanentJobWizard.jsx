import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

// ============================================================
// KAZI POST PERMANENT JOB WIZARD (8 steps)
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenLight: '#e8f5ee',
  greenTint: '#f1f9f5',
  purple: '#7c3aed',
  purpleTint: '#f5f0ff',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  danger: '#ef4444',
  white: '#ffffff',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/* ─── Option Arrays ─── */
const ROLES = ['Dental Hygienist', 'Dental Assistant', 'Front Desk', 'Office Manager', 'Treatment Coordinator', 'Dentist (Associate)'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Temp-to-Perm'];
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EXPERIENCE_LEVELS = ['No minimum', '1+ years', '2+ years', '3+ years', '5+ years', '7+ years', '10+ years'];
const CREDENTIAL_OPTIONS = ['RDH License', 'CDA', 'EFDA', 'CPR / BLS', 'Radiology Cert', 'Local Anesthesia Permit', 'Nitrous Oxide Cert', 'DANB'];
const SOFTWARE_OPTIONS = ['Dentrix', 'Eaglesoft', 'Open Dental', 'Curve Dental', 'Carestream', 'Dexis', 'Practice-Web', 'SoftDent'];
const BENEFIT_OPTIONS = ['Health Insurance', 'Dental Coverage', 'Vision', '401(k)', '401(k) Match', 'PTO', 'Paid Holidays', 'CE Reimbursement', 'Signing Bonus', 'Uniform Allowance'];

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
  letterSpacing: 1.2,
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
  background: COLORS.purpleTint,
  color: COLORS.purple,
  fontWeight: 700,
};

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function PostPermanentJobWizard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [step, setStep] = useState(1);
  const [successOpen, setSuccessOpen] = useState(false);

  /* ─── Office Info ─── */
  const [officeName, setOfficeName] = useState('Your Practice');
  const [officeCity, setOfficeCity] = useState('Houston');

  /* ─── Step 1: Role ─── */
  const [role, setRole] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');

  /* ─── Step 2: Schedule ─── */
  const [days, setDays] = useState([]);
  const [defaultStart, setDefaultStart] = useState({ h: 8, m: '00', p: 'AM' });
  const [defaultEnd, setDefaultEnd] = useState({ h: 5, m: '00', p: 'PM' });
  const [startDate, setStartDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ─── Step 3: Compensation ─── */
  const [payType, setPayType] = useState('hourly');
  const [payMin, setPayMin] = useState('');
  const [payMax, setPayMax] = useState('');

  /* ─── Step 4: Experience ─── */
  const [experience, setExperience] = useState('No minimum');

  /* ─── Step 5: Credentials ─── */
  const [credentials, setCredentials] = useState([]);

  /* ─── Step 6: Software & Benefits ─── */
  const [software, setSoftware] = useState([]);
  const [benefits, setBenefits] = useState([]);

  /* ─── Step 7: AI Builder ─── */
  const [selectedStyleIdx, setSelectedStyleIdx] = useState(0);
  const [aiGenerated, setAiGenerated] = useState('');
  const [aiEditing, setAiEditing] = useState(false);

  /* ─── Fetch office name ─── */
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

  /* ─── Helpers ─── */
  const toggleArr = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const formatTime = (t) => {
    if (!t || typeof t !== 'object') return '';
    return `${t.h}:${t.m} ${t.p}`;
  };

  const formatDateDisplay = (d) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
      credentials,
      software,
      benefits,
    };
    return style.fn(formData, formatTime, { name: officeName, city: officeCity });
  }, [selectedStyleIdx, role, employmentType, days, defaultStart, defaultEnd, payType, payMin, payMax, experience, credentials, software, benefits, officeName, officeCity]);

  useEffect(() => {
    if (step === 7 && !aiEditing) {
      setAiGenerated(buildAi());
    }
  }, [step, selectedStyleIdx, buildAi, aiEditing]);

  /* ─── Navigation ─── */
  const next = async () => {
    if (step < 8) {
      setStep(s => s + 1);
    } else {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/shifts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            role, jobType: 'PERMANENT', date: new Date().toISOString(),
            startTime: formatTime(defaultStart), endTime: formatTime(defaultEnd),
            hourlyRate: payType === 'hourly' ? parseFloat(payMin) : 0,
            description: aiGenerated ? aiGenerated : '',
            schedule: employmentType + ' · ' + days.join(', '),
            benefits, software,
          }),
        });
        if (res.ok) setSuccessOpen(true);
        else { const err = await res.json().catch(() => ({})); alert(err.error || 'Failed to post job'); }
      } catch { alert('Failed to post job'); }
    }
  };

  const back = () => { if (step > 1) setStep(s => s - 1); };

  const goToStep = (s) => setStep(s);

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

  /* ─── Success ─── */
  if (successOpen) {
    return (
      <SuccessModal
        onDashboard={() => navigate('/dashboard')}
        onPostAnother={() => {
          setSuccessOpen(false);
          setStep(1);
          setRole(''); setEmploymentType('Full-time'); setDays([]);
          setDefaultStart({ h: 8, m: '00', p: 'AM' }); setDefaultEnd({ h: 5, m: '00', p: 'PM' });
          setStartDate(''); setPayType('hourly'); setPayMin(''); setPayMax('');
          setExperience('No minimum'); setCredentials([]); setSoftware([]); setBenefits([]);
          setSelectedStyleIdx(0); setAiGenerated(''); setAiEditing(false);
        }}
      />
    );
  }

  /* ─── Render ─── */
  return (
    <div style={{ minHeight: '100vh', background: COLORS.bg }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes confettiFall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .scroll-snap-y { scroll-snap-type: y mandatory; -webkit-overflow-scrolling: touch; }
        .scroll-snap-center { scroll-snap-align: center; }
      `}</style>

      {/* ─── Header ─── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate('/dashboard')} style={{
            width: 36, height: 36, borderRadius: 18, border: 'none', background: COLORS.borderSoft,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text }}>Post Permanent Job</span>
          <div style={{ width: 36 }} />
        </div>
      </div>

      {/* ─── Progress ─── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 20px 8px' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i < step ? COLORS.green : COLORS.border,
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: COLORS.textLight }}>
            Step {step} of 8
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: COLORS.green }}>
            {['Role', 'Schedule', 'Pay', 'Experience', 'Credentials', 'Software & Benefits', 'AI Builder', 'Review'][step - 1]}
          </span>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 140px', animation: 'fadeIn 0.35s ease' }} key={step}>

        {/* ═══ STEP 1: ROLE ═══ */}
        {step === 1 && (
          <div>
            <p style={questionStyle}>Who are you hiring?</p>
            <p style={helperStyle}>Choose the role and employment type for this permanent position.</p>

            <p style={fieldLabelStyle}>Role</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {ROLES.map(r => (
                <button key={r} onClick={() => setRole(r)}
                  style={role === r ? pillBtnActive : pillBtnBase}>
                  {r}
                </button>
              ))}
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

        {/* ═══ STEP 2: SCHEDULE ═══ */}
        {step === 2 && (
          <div>
            <p style={questionStyle}>What's the schedule?</p>
            <p style={helperStyle}>Select working days, hours, and when they'd start.</p>

            <p style={fieldLabelStyle}>Days of the Week</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {DAYS_OF_WEEK.map(d => (
                <button key={d} onClick={() => toggleArr(days, setDays, d)}
                  style={days.includes(d) ? pillBtnActive : pillBtnBase}>
                  {d}
                </button>
              ))}
            </div>

            <p style={fieldLabelStyle}>Typical Hours</p>
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <TimePickerCard label="Start" value={defaultStart} onChange={setDefaultStart} />
              <TimePickerCard label="End" value={defaultEnd} onChange={setDefaultEnd} />
            </div>

            <p style={fieldLabelStyle}>Start Date</p>
            <button onClick={() => setShowDatePicker(!showDatePicker)} style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
              padding: '14px 18px', borderRadius: 14, width: '100%', textAlign: 'left',
              border: `1.5px solid ${startDate ? COLORS.green : COLORS.border}`,
              background: COLORS.white, color: startDate ? COLORS.text : COLORS.textLight,
              cursor: 'pointer',
            }}>
              {startDate ? formatDateDisplay(startDate) : 'Select a start date'}
            </button>
            {showDatePicker && (
              <DatePickerSheet value={startDate} onChange={(d) => { setStartDate(d); setShowDatePicker(false); }} onClose={() => setShowDatePicker(false)} />
            )}
          </div>
        )}

        {/* ═══ STEP 3: PAY ═══ */}
        {step === 3 && (
          <div>
            <p style={questionStyle}>Compensation</p>
            <p style={helperStyle}>Set the pay type and range for this position.</p>

            <p style={fieldLabelStyle}>Pay Type</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
              {['hourly', 'salary'].map(t => (
                <button key={t} onClick={() => setPayType(t)}
                  style={payType === t ? pillBtnActive : pillBtnBase}>
                  {t === 'hourly' ? 'Hourly Rate' : 'Annual Salary'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={fieldLabelStyle}>{payType === 'salary' ? 'Min Salary' : 'Min Rate'}</p>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: COLORS.textLight,
                  }}>$</span>
                  <input type="number" value={payMin} onChange={e => setPayMin(e.target.value)}
                    placeholder={payType === 'salary' ? '55000' : '30'}
                    style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                      width: '100%', padding: '14px 14px 14px 30px', borderRadius: 14,
                      border: `1.5px solid ${COLORS.border}`, outline: 'none', background: COLORS.white,
                      color: COLORS.text, boxSizing: 'border-box',
                    }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={fieldLabelStyle}>{payType === 'salary' ? 'Max Salary' : 'Max Rate'}</p>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: COLORS.textLight,
                  }}>$</span>
                  <input type="number" value={payMax} onChange={e => setPayMax(e.target.value)}
                    placeholder={payType === 'salary' ? '75000' : '45'}
                    style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                      width: '100%', padding: '14px 14px 14px 30px', borderRadius: 14,
                      border: `1.5px solid ${COLORS.border}`, outline: 'none', background: COLORS.white,
                      color: COLORS.text, boxSizing: 'border-box',
                    }} />
                </div>
              </div>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textLight, marginTop: 10 }}>
              {payType === 'salary' ? 'Annual salary range.' : 'Hourly rate range.'} Max is optional.
            </p>
          </div>
        )}

        {/* ═══ STEP 4: EXPERIENCE ═══ */}
        {step === 4 && (
          <div>
            <p style={questionStyle}>Experience level?</p>
            <p style={helperStyle}>How much experience should the ideal candidate have?</p>

            <p style={fieldLabelStyle}>Minimum Experience</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXPERIENCE_LEVELS.map(lvl => (
                <button key={lvl} onClick={() => setExperience(lvl)}
                  style={experience === lvl ? pillBtnActive : pillBtnBase}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 5: CREDENTIALS ═══ */}
        {step === 5 && (
          <div>
            <p style={questionStyle}>Required credentials</p>
            <p style={helperStyle}>Select all certifications and licenses needed for this role.</p>

            <p style={fieldLabelStyle}>Certifications & Licenses</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CREDENTIAL_OPTIONS.map(c => (
                <button key={c} onClick={() => toggleArr(credentials, setCredentials, c)}
                  style={credentials.includes(c) ? pillBtnActive : pillBtnBase}>
                  {c}
                </button>
              ))}
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textLight, marginTop: 14 }}>
              {credentials.length === 0 ? 'No credentials selected — this step is optional.' : `${credentials.length} credential${credentials.length > 1 ? 's' : ''} selected`}
            </p>
          </div>
        )}

        {/* ═══ STEP 6: SOFTWARE & BENEFITS ═══ */}
        {step === 6 && (
          <div>
            <p style={questionStyle}>Software & Benefits</p>
            <p style={helperStyle}>What software does your office use and what benefits do you offer?</p>

            <p style={fieldLabelStyle}>Software</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              {SOFTWARE_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleArr(software, setSoftware, s)}
                  style={software.includes(s) ? pillBtnActivePurple : pillBtnBase}>
                  {s}
                </button>
              ))}
            </div>

            <p style={fieldLabelStyle}>Benefits</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {BENEFIT_OPTIONS.map(b => (
                <button key={b} onClick={() => toggleArr(benefits, setBenefits, b)}
                  style={benefits.includes(b) ? pillBtnActive : pillBtnBase}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 7: AI BUILDER ═══ */}
        {step === 7 && (
          <div>
            <p style={questionStyle}>AI Job Description</p>
            <p style={helperStyle}>Pick a writing style. We'll generate the description from your inputs.</p>

            <p style={fieldLabelStyle}>Writing Style</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {AI_STYLES.map((s, idx) => (
                <button key={s.id} onClick={() => { setSelectedStyleIdx(idx); setAiEditing(false); }}
                  style={selectedStyleIdx === idx ? pillBtnActivePurple : pillBtnBase}>
                  <span style={{ marginRight: 6 }}>{s.emoji}</span>{s.label}
                </button>
              ))}
            </div>

            <p style={fieldLabelStyle}>Generated Description</p>
            <textarea
              value={aiGenerated}
              onChange={e => { setAiGenerated(e.target.value); setAiEditing(true); }}
              rows={7}
              style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                width: '100%', padding: 16, borderRadius: 14, resize: 'none',
                border: `1.5px solid ${COLORS.border}`, outline: 'none',
                background: COLORS.white, color: COLORS.text, lineHeight: 1.6,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: COLORS.textLight }}>
                {aiGenerated.length} characters
              </span>
              <button onClick={() => { setAiEditing(false); setAiGenerated(buildAi()); }}
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
                  color: COLORS.purple, background: 'none', border: 'none', cursor: 'pointer',
                }}>
                ↻ Regenerate
              </button>
            </div>
          </div>
        )}

        {/* ═══ STEP 8: REVIEW ═══ */}
        {step === 8 && (
          <Step8Review
            role={role}
            employmentType={employmentType}
            days={days}
            startTime={formatTime(defaultStart)}
            endTime={formatTime(defaultEnd)}
            startDate={startDate}
            formatDateDisplay={formatDateDisplay}
            payDisplay={payDisplay()}
            experience={experience}
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
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '14px 20px', display: 'flex', gap: 12 }}>
          {step > 1 && (
            <button onClick={back} style={{
              flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
              padding: '14px 0', borderRadius: 100, border: `1.5px solid ${COLORS.border}`,
              background: COLORS.white, color: COLORS.text, cursor: 'pointer',
            }}>
              Back
            </button>
          )}
          <button onClick={next} style={{
            flex: step > 1 ? 1.5 : 1, fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
            padding: '14px 0', borderRadius: 100, border: 'none',
            background: COLORS.green, color: COLORS.white, cursor: 'pointer',
            opacity: (step === 1 && !role) ? 0.4 : 1,
          }} disabled={step === 1 && !role}>
            {step === 8 ? 'Post Job' : 'Next'}
          </button>
        </div>
      </div>
    </div>
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
      <p style={{ ...fieldLabelStyle, marginBottom: 6 }}>{label}</p>
      <button onClick={() => setOpen(!open)} style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
        width: '100%', padding: '14px 16px', borderRadius: 14, textAlign: 'left',
        border: `1.5px solid ${value ? COLORS.green : COLORS.border}`,
        background: COLORS.white, color: COLORS.text, cursor: 'pointer',
      }}>
        {display}
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
    <div ref={ref} className="scroll-snap-y" style={{
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
   DATE PICKER SHEET (bottom sheet overlay)
   ═══════════════════════════════════════════════ */
function DatePickerSheet({ value, onChange, onClose }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 480, background: COLORS.white,
        borderRadius: '24px 24px 0 0', padding: '24px 20px 36px',
        animation: 'slideUp 0.3s ease',
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: COLORS.border, margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <button onClick={prevMonth} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 18, background: 'none', border: 'none',
            color: COLORS.textMid, cursor: 'pointer', padding: '4px 10px',
          }}>‹</button>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.text }}>{monthName}</span>
          <button onClick={nextMonth} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 18, background: 'none', border: 'none',
            color: COLORS.textMid, cursor: 'pointer', padding: '4px 10px',
          }}>›</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 6 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: COLORS.textLight, padding: 4 }}>{d}</span>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
          {Array(firstDay).fill(null).map((_, i) => <span key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const d = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0]);
            const isSel = value === dateStr;
            return (
              <button key={d} disabled={isPast} onClick={() => onChange(dateStr)} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                width: 38, height: 38, borderRadius: 19, border: 'none', cursor: isPast ? 'default' : 'pointer',
                margin: '0 auto',
                background: isSel ? COLORS.green : 'transparent',
                color: isSel ? COLORS.white : isPast ? COLORS.border : COLORS.text,
                transition: 'all 0.15s ease',
              }}>
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   AI WRITING STYLES (10 templates)
   ═══════════════════════════════════════════════ */
const AI_STYLES = [
  {
    id: 'professional', label: 'Professional', emoji: '💼',
    fn: (d, fmt, office) =>
      `${office.name} is seeking a ${d.employmentType} ${d.role} to join our growing team${office.city ? ` in ${office.city}` : ''}. ` +
      `Schedule: ${d.days}. Hours: ${fmt(d.startTime) || d.startTime} – ${fmt(d.endTime) || d.endTime}. ` +
      `${d.payType === 'salary' ? `Salary: $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? ` – $${Number(d.payMax).toLocaleString()}` : ''}/yr` : `Pay: $${d.payMin || '0'}${d.payMax ? ` – $${d.payMax}` : ''}/hr`}. ` +
      `Requirements: ${d.experience} experience${d.credentials?.length ? `, ${d.credentials.join(', ')}` : ''}. ` +
      (d.benefits?.length ? `Benefits include ${d.benefits.join(', ')}.` : ''),
  },
  {
    id: 'friendly', label: 'Friendly & Warm', emoji: '😊',
    fn: (d, fmt, office) =>
      `Hey there! We're looking for an awesome ${d.role} to join the ${office.name} family${office.city ? ` here in ${office.city}` : ''}! ` +
      `This is a ${d.employmentType} gig — ${d.days}, ${fmt(d.startTime) || d.startTime} to ${fmt(d.endTime) || d.endTime}. ` +
      `${d.payType === 'salary' ? `We're offering $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? `–$${Number(d.payMax).toLocaleString()}` : ''}/yr` : `Pay starts at $${d.payMin || '0'}/hr`}. ` +
      `We'd love someone with ${d.experience} of experience. ` +
      (d.benefits?.length ? `Perks? Oh yeah — ${d.benefits.join(', ')}! Come grow with us!` : 'Come grow with us!'),
  },
  {
    id: 'concise', label: 'Short & Direct', emoji: '⚡',
    fn: (d, fmt, office) =>
      `${d.employmentType} ${d.role} — ${office.name}${office.city ? `, ${office.city}` : ''}. ` +
      `${d.days}. ${fmt(d.startTime) || d.startTime}–${fmt(d.endTime) || d.endTime}. ` +
      `${d.payType === 'salary' ? `$${Number(d.payMin || 0).toLocaleString()}/yr` : `$${d.payMin || '0'}/hr`}. ` +
      `${d.experience} exp. ${d.credentials?.length ? d.credentials.join(', ') + '.' : ''} ` +
      (d.benefits?.length ? `Benefits: ${d.benefits.join(', ')}.` : ''),
  },
  {
    id: 'enthusiastic', label: 'Enthusiastic', emoji: '🚀',
    fn: (d, fmt, office) =>
      `Exciting opportunity alert! ${office.name}${office.city ? ` in ${office.city}` : ''} is hiring a talented ${d.role}! ` +
      `This ${d.employmentType} role features an amazing schedule — ${d.days}, ${fmt(d.startTime) || d.startTime} to ${fmt(d.endTime) || d.endTime}. ` +
      `${d.payType === 'salary' ? `Salary: $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? `–$${Number(d.payMax).toLocaleString()}` : ''}/yr!` : `Competitive pay starting at $${d.payMin || '0'}/hr!`} ` +
      `We're looking for someone with ${d.experience} of experience who's passionate about patient care. ` +
      (d.benefits?.length ? `Amazing benefits including ${d.benefits.join(', ')}!` : 'Apply today!'),
  },
  {
    id: 'clinical', label: 'Clinical', emoji: '🩺',
    fn: (d, fmt, office) =>
      `Position: ${d.employmentType} ${d.role}. Practice: ${office.name}${office.city ? `, ${office.city}` : ''}. ` +
      `Clinical hours: ${d.days}, ${fmt(d.startTime) || d.startTime}–${fmt(d.endTime) || d.endTime}. ` +
      `Compensation: ${d.payType === 'salary' ? `$${Number(d.payMin || 0).toLocaleString()}/year` : `$${d.payMin || '0'}/hour`}. ` +
      `Required experience: ${d.experience}. ` +
      (d.credentials?.length ? `Required certifications: ${d.credentials.join(', ')}. ` : '') +
      (d.software?.length ? `Software proficiency: ${d.software.join(', ')}. ` : '') +
      (d.benefits?.length ? `Benefits: ${d.benefits.join(', ')}.` : ''),
  },
  {
    id: 'storytelling', label: 'Storytelling', emoji: '📖',
    fn: (d, fmt, office) =>
      `Imagine walking into a practice where your skills are valued and your growth matters. At ${office.name}${office.city ? ` in ${office.city}` : ''}, ` +
      `we're looking for a ${d.role} who wants to make a real difference. ` +
      `As a ${d.employmentType} team member working ${d.days}, you'll enjoy a supportive environment ` +
      `with hours from ${fmt(d.startTime) || d.startTime} to ${fmt(d.endTime) || d.endTime}. ` +
      `${d.payType === 'salary' ? `We offer a competitive salary starting at $${Number(d.payMin || 0).toLocaleString()}/yr` : `Starting at $${d.payMin || '0'}/hr`}. ` +
      (d.benefits?.length ? `Plus incredible benefits: ${d.benefits.join(', ')}. ` : '') +
      `Ready to write the next chapter of your career?`,
  },
  {
    id: 'modern', label: 'Modern & Trendy', emoji: '✨',
    fn: (d, fmt, office) =>
      `${office.name} is leveling up${office.city ? ` in ${office.city}` : ''} — and we need YOU. ` +
      `We're on the hunt for a ${d.employmentType} ${d.role} who's ready to bring their A-game. ` +
      `The vibe: ${d.days}, ${fmt(d.startTime) || d.startTime}–${fmt(d.endTime) || d.endTime}. ` +
      `The pay: ${d.payType === 'salary' ? `$${Number(d.payMin || 0).toLocaleString()}+/yr` : `$${d.payMin || '0'}+/hr`}. ` +
      (d.benefits?.length ? `The perks: ${d.benefits.join(', ')}. ` : '') +
      `Sound like your thing? Let's talk.`,
  },
  {
    id: 'benefits', label: 'Benefits-Focused', emoji: '🎁',
    fn: (d, fmt, office) =>
      `Looking for a ${d.role} position with an incredible benefits package? ${office.name}${office.city ? ` in ${office.city}` : ''} has you covered. ` +
      (d.benefits?.length ? `We offer ${d.benefits.join(', ')} — because you deserve it. ` : 'We offer a comprehensive benefits package. ') +
      `This ${d.employmentType} position features a ${d.days} schedule, ${fmt(d.startTime) || d.startTime} to ${fmt(d.endTime) || d.endTime}. ` +
      `${d.payType === 'salary' ? `Salary range: $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? `–$${Number(d.payMax).toLocaleString()}` : ''}/yr` : `Pay: $${d.payMin || '0'}${d.payMax ? `–$${d.payMax}` : ''}/hr`}. ` +
      `${d.experience} of experience preferred.`,
  },
  {
    id: 'inclusive', label: 'Inclusive & Welcoming', emoji: '🌈',
    fn: (d, fmt, office) =>
      `${office.name}${office.city ? ` in ${office.city}` : ''} welcomes applicants of all backgrounds! ` +
      `We're hiring a ${d.employmentType} ${d.role} for our diverse, patient-centered team. ` +
      `Schedule: ${d.days}, ${fmt(d.startTime) || d.startTime}–${fmt(d.endTime) || d.endTime}. ` +
      `${d.payType === 'salary' ? `Competitive salary from $${Number(d.payMin || 0).toLocaleString()}/yr` : `Starting at $${d.payMin || '0'}/hr`}. ` +
      `${d.experience} experience welcome. ` +
      (d.benefits?.length ? `Benefits include ${d.benefits.join(', ')}. ` : '') +
      `We believe in creating a workplace where everyone thrives.`,
  },
  {
    id: 'urgent', label: 'Urgently Hiring', emoji: '🔥',
    fn: (d, fmt, office) =>
      `URGENTLY HIRING: ${d.employmentType} ${d.role} at ${office.name}${office.city ? ` in ${office.city}` : ''}! ` +
      `We need someone ASAP for a ${d.days} schedule, ${fmt(d.startTime) || d.startTime}–${fmt(d.endTime) || d.endTime}. ` +
      `${d.payType === 'salary' ? `Salary: $${Number(d.payMin || 0).toLocaleString()}${d.payMax ? `–$${Number(d.payMax).toLocaleString()}` : ''}/yr` : `Pay: $${d.payMin || '0'}${d.payMax ? `–$${d.payMax}` : ''}/hr`}. ` +
      `${d.experience} experience required. ` +
      (d.benefits?.length ? `Full benefits: ${d.benefits.join(', ')}. ` : '') +
      `Apply now — interviews happening this week!`,
  },
];

/* ═══════════════════════════════════════════════
   STEP 8 REVIEW
   ═══════════════════════════════════════════════ */
function Step8Review({ role, employmentType, days, startTime, endTime, startDate, formatDateDisplay, payDisplay, experience, credentials, software, benefits, aiGenerated, goToStep }) {
  return (
    <div>
      <p style={questionStyle}>Review & Post</p>
      <p style={helperStyle}>Make sure everything looks right before posting your job.</p>

      <ReviewCard icon="👤" label="Role" value={role} step={1} goToStep={goToStep} />
      <ReviewCard icon="📋" label="Employment" value={employmentType} step={1} goToStep={goToStep} />
      <ReviewCard icon="📅" label="Schedule" value={days.length ? `${days.join(', ')} · ${startTime} – ${endTime}` : 'Not set'} step={2} goToStep={goToStep} />
      <ReviewCard icon="📆" label="Start Date" value={startDate ? formatDateDisplay(startDate) : 'ASAP'} step={2} goToStep={goToStep} />
      <ReviewCard icon="💰" label="Compensation" value={payDisplay} step={3} goToStep={goToStep} />
      <ReviewCard icon="⭐" label="Experience" value={experience} step={4} goToStep={goToStep} />

      {/* Credentials */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: `1px solid ${COLORS.borderSoft}` }}>
        <span style={{ fontSize: 18, marginTop: 2 }}>📜</span>
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
        <span style={{ fontSize: 18, marginTop: 2 }}>💻</span>
        <div style={{ flex: 1 }}>
          <p style={{ ...fieldLabelStyle, marginBottom: 8 }}>Software</p>
          <TagsList items={software} color="purple" />
        </div>
        <button onClick={() => goToStep(6)} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer',
        }}>Edit</button>
      </div>

      {/* Benefits */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0', borderBottom: `1px solid ${COLORS.borderSoft}` }}>
        <span style={{ fontSize: 18, marginTop: 2 }}>🎁</span>
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
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 0' }}>
        <span style={{ fontSize: 18, marginTop: 2 }}>📝</span>
        <div style={{ flex: 1 }}>
          <p style={{ ...fieldLabelStyle, marginBottom: 8 }}>Job Description</p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.text, lineHeight: 1.6, margin: 0 }}>
            {aiGenerated || 'No description generated.'}
          </p>
        </div>
        <button onClick={() => goToStep(7)} style={{
          fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700,
          color: COLORS.green, background: 'none', border: 'none', cursor: 'pointer',
        }}>Edit</button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   REVIEW CARD (with Edit button)
   ═══════════════════════════════════════════════ */
function ReviewCard({ icon, label, value, step, goToStep }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 0', borderBottom: `1px solid ${COLORS.borderSoft}`,
    }}>
      <span style={{ fontSize: 18, marginTop: 2 }}>{icon}</span>
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
  const bg = color === 'purple' ? COLORS.purpleTint : COLORS.greenLight;
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
      <Confetti />
      <div style={{
        background: COLORS.white, borderRadius: 24, padding: '40px 28px', width: '100%', maxWidth: 380,
        textAlign: 'center', position: 'relative', zIndex: 1000, animation: 'popIn 0.35s ease',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>💼</div>
        <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.text, margin: '0 0 8px' }}>
          Job Posted!
        </h2>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: COLORS.textMid, lineHeight: 1.5, margin: '0 0 28px' }}>
          Your permanent position is now live. Qualified professionals in your area will be notified.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={onDashboard} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
            padding: '14px 0', borderRadius: 100, border: 'none',
            background: COLORS.green, color: COLORS.white, cursor: 'pointer',
            width: '100%',
          }}>
            Go to Dashboard
          </button>
          <button onClick={onPostAnother} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700,
            padding: '14px 0', borderRadius: 100, border: `1.5px solid ${COLORS.border}`,
            background: COLORS.white, color: COLORS.text, cursor: 'pointer',
            width: '100%',
          }}>
            Post Another Job
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
  const colors = [COLORS.green, COLORS.purple, '#f59e0b', '#ef4444', '#3b82f6', '#10b981'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
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
          borderRadius: 2,
          background: p.color,
          animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}
