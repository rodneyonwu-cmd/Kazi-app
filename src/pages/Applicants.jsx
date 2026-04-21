import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import useProviderIds, { resolveProviderId } from '../hooks/useProviderIds';

// ============================================================
// KAZI APPLICANTS — Inbound applicants (they applied to your shifts/jobs)
// Temp Shifts (green) + Permanent Jobs (purple) toggle
// Collapsible shift/job cards, detail sheets, pipeline picker
// Style matches Bookings.jsx component exactly
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  purple: '#7c3aed',
  purpleSoft: '#f3ecfd',
  purpleD: '#5b21b6',
  blue: '#0369a1',
  blueSoft: '#e0f2fe',
  gold: '#f4b740',
  goldBg: '#fef6e4',
  goldText: '#8b6914',
  coral: '#e8734a',
  amber: '#d97706',
  amberSoft: '#fef3e6',
  red: '#dc2626',
  redSoft: '#fee2e2',
  bg: '#f9f8f6',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
};

// ============================================================
// MOCK DATA — replace with API fetches
// ============================================================
const AVATARS = {
  MG: 'https://randomuser.me/api/portraits/women/90.jpg',
  JL: 'https://randomuser.me/api/portraits/men/22.jpg',
  TP: 'https://randomuser.me/api/portraits/women/52.jpg',
  SK: 'https://randomuser.me/api/portraits/women/68.jpg',
  DW: 'https://randomuser.me/api/portraits/men/47.jpg',
  JS: 'https://randomuser.me/api/portraits/women/31.jpg',
  RN: 'https://randomuser.me/api/portraits/women/76.jpg',
  KM: 'https://randomuser.me/api/portraits/women/82.jpg',
  SN: 'https://randomuser.me/api/portraits/women/14.jpg',
  FM: 'https://randomuser.me/api/portraits/women/25.jpg',
};

const MOCK_TEMP_SHIFTS = [
  { id: 's1', role: 'Dental Hygienist', date: 'Monday, April 14', dateShort: 'Mon, Apr 14', month: 'APR', day: 14, time: '8:00 AM - 5:00 PM', timeShort: '8a-5p', hours: 8.5, hourlyRate: 58,
    applicants: [
      { id: 'a1', name: 'Maria G.', initials: 'MG', avatarUrl: AVATARS.MG, cred: 'RDH', rate: 58, dist: '5.3 mi', stars: '4.7', reviews: 45, status: 'new', appliedAgo: '2 hours ago' },
      { id: 'a2', name: 'Julian L.', initials: 'JL', avatarUrl: AVATARS.JL, cred: 'RDH', rate: 52, dist: '8.1 mi', stars: '4.5', reviews: 31, status: 'new', appliedAgo: '4 hours ago' },
      { id: 'a3', name: 'Tara P.', initials: 'TP', avatarUrl: AVATARS.TP, cred: 'RDH', rate: 60, dist: '12 mi', stars: '4.3', reviews: 18, status: 'new', appliedAgo: '6 hours ago' },
      { id: 'a4', name: 'Sarah K.', initials: 'SK', avatarUrl: AVATARS.SK, cred: 'RDH', rate: 55, dist: '2.1 mi', stars: '4.9', reviews: 82, status: 'new', appliedAgo: '8 hours ago' },
    ],
  },
  { id: 's2', role: 'Dental Assistant', date: 'Wednesday, April 16', dateShort: 'Wed, Apr 16', month: 'APR', day: 16, time: '9:00 AM - 5:00 PM', timeShort: '9a-5p', hours: 8, hourlyRate: 28,
    applicants: [
      { id: 'a5', name: 'David W.', initials: 'DW', avatarUrl: AVATARS.DW, cred: 'CDA', rate: 26, dist: '6.4 mi', stars: '4.6', reviews: 24, status: 'new', appliedAgo: '1 hour ago' },
    ],
  },
  { id: 's3', role: 'Front Desk', date: 'Friday, April 18', dateShort: 'Fri, Apr 18', month: 'APR', day: 18, time: '8:00 AM - 4:00 PM', timeShort: '8a-4p', hours: 7.5, hourlyRate: 22, applicants: [] },
];

const MOCK_PERM_JOBS = [
  { id: 'p1', title: 'Full-Time Dental Hygienist', salary: '$75k-$90k/yr', type: 'Full-Time', posted: 'Apr 5',
    applicants: [
      { id: 'pa1', name: 'Jessica S.', initials: 'JS', avatarUrl: AVATARS.JS, cred: 'RDH', exp: '6 yrs', stars: '4.9', reviews: 82, dist: '4.2 mi', stage: 'applied', appliedAgo: '2 days ago' },
      { id: 'pa2', name: 'Rachel N.', initials: 'RN', avatarUrl: AVATARS.RN, cred: 'RDH', exp: '3 yrs', stars: '4.7', reviews: 45, dist: '8.1 mi', stage: 'reviewing', appliedAgo: '3 days ago' },
      { id: 'pa3', name: 'Karen M.', initials: 'KM', avatarUrl: AVATARS.KM, cred: 'RDH', exp: '10+ yrs', stars: '5.0', reviews: 127, dist: '3.8 mi', stage: 'interview', appliedAgo: '5 days ago' },
    ],
  },
  { id: 'p2', title: 'Part-Time Dental Assistant', salary: '$38k-$45k/yr', type: 'Part-Time', posted: 'Apr 8',
    applicants: [
      { id: 'pa4', name: 'Serena N.', initials: 'SN', avatarUrl: AVATARS.SN, cred: 'RDA', exp: '2 yrs', stars: '4.8', reviews: 34, dist: '5.6 mi', stage: 'applied', appliedAgo: '1 day ago' },
      { id: 'pa5', name: 'Florence M.', initials: 'FM', avatarUrl: AVATARS.FM, cred: 'CDA', exp: '1 yr', stars: '4.5', reviews: 12, dist: '9.3 mi', stage: 'applied', appliedAgo: '1 day ago' },
    ],
  },
];

const STAGE_LABELS = { applied: 'Applied', reviewing: 'Reviewing', interview: 'Interview', offered: 'Offered', hired: 'Hired', rejected: 'Declined' };
const STAGE_BG = { applied: COLORS.purpleSoft, reviewing: COLORS.goldBg, interview: COLORS.blueSoft, offered: COLORS.greenSoft, hired: COLORS.green, rejected: COLORS.redSoft };
const STAGE_COLOR = { applied: COLORS.purple, reviewing: COLORS.goldText, interview: COLORS.blue, offered: COLORS.green, hired: 'white', rejected: COLORS.red };
const STAGE_LIST = [
  { id: 'applied', label: 'Applied', desc: 'Just submitted their application' },
  { id: 'reviewing', label: 'Reviewing', desc: 'You are reviewing their profile' },
  { id: 'interview', label: 'Interview', desc: 'Schedule or completed interview' },
  { id: 'offered', label: 'Offered', desc: 'Extend a job offer' },
  { id: 'hired', label: 'Hired', desc: 'Applicant accepted the offer' },
  { id: 'rejected', label: 'Declined', desc: 'Not moving forward' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Applicants() {
  const [activeType, setActiveType] = useState('temp');
  const [tempFilter, setTempFilter] = useState('new');
  const [permFilter, setPermFilter] = useState('all');
  const [collapsed, setCollapsed] = useState({});
  const [tempShifts, setTempShifts] = useState(MOCK_TEMP_SHIFTS);
  const [permJobs, setPermJobs] = useState(MOCK_PERM_JOBS);
  const [selectedApp, setSelectedApp] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [pipelineTarget, setPipelineTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, color) => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const countTemp = (status) => {
    let c = 0;
    tempShifts.forEach(s => s.applicants.forEach(a => { if (status === 'all' || a.status === status) c++; }));
    return c;
  };

  const countPerm = (stage) => {
    let c = 0;
    permJobs.forEach(j => j.applicants.forEach(a => { if (stage === 'all' || a.stage === stage) c++; }));
    return c;
  };

  const toggleCollapse = (id) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAccept = (shiftId, appId, name) => {
    const alreadyFilled = tempShifts.some(s => s.id === shiftId && s.applicants.some(a => a.status === 'accepted'));
    if (alreadyFilled) { showToast('This shift is already filled', COLORS.amber); setConfirmAction(null); return; }
    setTempShifts(prev => prev.map(s => s.id !== shiftId ? s : { ...s, applicants: s.applicants.map(a => a.id === appId ? { ...a, status: 'accepted' } : a.status === 'new' ? { ...a, status: 'declined' } : a) }));
    setConfirmAction(null);
    setTempFilter('accepted');
    showToast(name + ' accepted', COLORS.green);
  };

  const handleDecline = (shiftId, appId, name) => {
    setTempShifts(prev => prev.map(s => s.id !== shiftId ? s : { ...s, applicants: s.applicants.map(a => a.id === appId ? { ...a, status: 'declined' } : a) }));
    setConfirmAction(null);
    showToast(name + ' declined', COLORS.red);
  };

  const handlePipeline = (jobId, appId, newStage, name) => {
    setPermJobs(prev => prev.map(j => j.id !== jobId ? j : { ...j, applicants: j.applicants.map(a => a.id === appId ? { ...a, stage: newStage } : a) }));
    setPipelineTarget(null);
    showToast(name + ' moved to ' + STAGE_LABELS[newStage], COLORS.purple);
  };

  const isTemp = activeType === 'temp';

  return (
    <>
      <style>{`
        .kazi-applicants * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .kazi-applicants button, .kazi-applicants input { font-family: inherit; cursor: pointer; }
        @keyframes kaziSheetSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
        @keyframes kaziOverlayFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes kaziToastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>

      <div className="kazi-applicants" style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.06)', fontFamily: "'DM Sans', sans-serif", color: COLORS.text, WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <TopBar role="office" />

        {/* TOP BAR */}
        <div style={{ background: 'white', padding: '18px 18px 0', borderBottom: `1px solid ${COLORS.borderSoft}`, flexShrink: 0, position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Applicants</div>
          <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>
            {isTemp ? `${countTemp('all')} across ${tempShifts.length} shifts` : `${countPerm('all')} across ${permJobs.length} jobs`}
          </div>

          {/* TYPE TOGGLE */}
          <TypeToggle activeType={activeType} setActiveType={setActiveType} tempCount={countTemp('all')} permCount={countPerm('all')} />

          {/* SUB TABS */}
          <div style={{ marginTop: 12, display: 'flex', gap: 6, paddingBottom: 14, overflowX: 'auto' }}>
            {isTemp ? (
              <>
                <SubTab label="New" count={countTemp('new')} active={tempFilter === 'new'} onClick={() => setTempFilter('new')} />
                <SubTab label="All" count={countTemp('all')} active={tempFilter === 'all'} onClick={() => setTempFilter('all')} />
                <SubTab label="Accepted" count={countTemp('accepted')} active={tempFilter === 'accepted'} onClick={() => setTempFilter('accepted')} />
                <SubTab label="Declined" count={countTemp('declined')} active={tempFilter === 'declined'} onClick={() => setTempFilter('declined')} />
              </>
            ) : (
              <>
                <SubTab label="All" count={countPerm('all')} active={permFilter === 'all'} onClick={() => setPermFilter('all')} />
                <SubTab label="Applied" count={countPerm('applied')} active={permFilter === 'applied'} onClick={() => setPermFilter('applied')} />
                <SubTab label="Reviewing" count={countPerm('reviewing')} active={permFilter === 'reviewing'} onClick={() => setPermFilter('reviewing')} />
                <SubTab label="Interview" count={countPerm('interview')} active={permFilter === 'interview'} onClick={() => setPermFilter('interview')} />
                <SubTab label="Offered" count={countPerm('offered')} active={permFilter === 'offered'} onClick={() => setPermFilter('offered')} />
              </>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 0 110px' }}>
          {isTemp && tempShifts.map(shift => (
            <TempShiftCard key={shift.id} shift={shift} filter={tempFilter} isCollapsed={!!collapsed[shift.id]}
              onToggle={() => toggleCollapse(shift.id)}
              onAccept={(appId, name) => setConfirmAction({ action: 'accept', shiftId: shift.id, appId, name })}
              onDecline={(appId, name) => setConfirmAction({ action: 'decline', shiftId: shift.id, appId, name })}
              onOpenDetail={(app) => setSelectedApp({ type: 'temp', data: app, shift })}
            />
          ))}
          {!isTemp && permJobs.map(job => (
            <PermJobCard key={job.id} job={job} filter={permFilter} isCollapsed={!!collapsed[job.id]}
              onToggle={() => toggleCollapse(job.id)}
              onOpenDetail={(app) => setSelectedApp({ type: 'perm', data: app, job })}
              onOpenPipeline={(app) => setPipelineTarget({ jobId: job.id, appId: app.id, name: app.name, currentStage: app.stage })}
            />
          ))}
        </div>

        <BottomNav />
      </div>

      {/* DETAIL SHEET */}
      {selectedApp && (
        <DetailSheet
          selected={selectedApp}
          onClose={() => setSelectedApp(null)}
          onAccept={(shiftId, appId, name) => { setSelectedApp(null); setConfirmAction({ action: 'accept', shiftId, appId, name }); }}
          onDecline={(shiftId, appId, name) => { setSelectedApp(null); setConfirmAction({ action: 'decline', shiftId, appId, name }); }}
          onOpenPipeline={(jobId, appId, name, stage) => { setSelectedApp(null); setPipelineTarget({ jobId, appId, name, currentStage: stage }); }}
        />
      )}

      {/* CONFIRM MODAL */}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => confirmAction.action === 'accept' ? handleAccept(confirmAction.shiftId, confirmAction.appId, confirmAction.name) : handleDecline(confirmAction.shiftId, confirmAction.appId, confirmAction.name)}
        />
      )}

      {/* PIPELINE MODAL */}
      {pipelineTarget && (
        <PipelineModal
          target={pipelineTarget}
          onClose={() => setPipelineTarget(null)}
          onApply={(newStage) => handlePipeline(pipelineTarget.jobId, pipelineTarget.appId, newStage, pipelineTarget.name)}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: toast.color, color: 'white', padding: '12px 22px', borderRadius: 100, fontSize: 13, fontWeight: 800, zIndex: 400, boxShadow: '0 10px 30px rgba(0,0,0,.2)', whiteSpace: 'nowrap', animation: 'kaziToastIn 0.3s ease-out', fontFamily: "'DM Sans', sans-serif" }}>{toast.msg}</div>
      )}
    </>
  );
}

// ============================================================
// TYPE TOGGLE
// ============================================================
function TypeToggle({ activeType, setActiveType, tempCount, permCount }) {
  const tabs = [
    { id: 'temp', label: 'Temp Shifts', count: tempCount, color: COLORS.green },
    { id: 'perm', label: 'Permanent', count: permCount, color: COLORS.purple },
  ];
  return (
    <div style={{ marginTop: 14, display: 'flex', background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 100, padding: 4, gap: 2 }}>
      {tabs.map(t => {
        const isActive = activeType === t.id;
        return (
          <button key={t.id} onClick={() => setActiveType(t.id)} style={{ flex: 1, background: isActive ? t.color : 'transparent', border: 'none', padding: '10px 8px', fontSize: 12, fontWeight: 700, color: isActive ? 'white' : COLORS.textLight, borderRadius: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s' }}>
            {t.label}
            <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100, background: isActive ? 'rgba(255,255,255,0.25)' : COLORS.bg, color: isActive ? 'white' : COLORS.textLight }}>{t.count}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// SUB TAB
// ============================================================
function SubTab({ label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, background: active ? COLORS.text : 'white', border: `1px solid ${active ? COLORS.text : COLORS.borderSoft}`, color: active ? 'white' : COLORS.textLight, fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
      {label}
      <span style={{ fontSize: 10, fontWeight: 800, background: active ? 'rgba(255,255,255,0.2)' : COLORS.bg, color: active ? 'white' : COLORS.textLight, padding: '1px 6px', borderRadius: 100 }}>{count}</span>
    </button>
  );
}

// ============================================================
// TEMP SHIFT CARD
// ============================================================
function TempShiftCard({ shift, filter, isCollapsed, onToggle, onAccept, onDecline, onOpenDetail }) {
  const filtered = shift.applicants.filter(a => filter === 'all' || a.status === filter);
  const cnt = shift.applicants.length;
  const cntColor = cnt > 0 ? COLORS.green : COLORS.textLight;
  const cntBg = cnt > 0 ? COLORS.greenSoft : COLORS.bg;

  return (
    <div style={{ margin: '0 16px 12px', background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 18, overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ padding: '16px 18px', borderBottom: isCollapsed ? 'none' : `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <DateBlock month={shift.month} day={shift.day} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '-0.2px', lineHeight: 1.15, marginBottom: 2 }}>{shift.role}</div>
          <div style={{ fontSize: 12, color: COLORS.textLight, display: 'flex', alignItems: 'center', gap: 5 }}>
            {shift.dateShort} <Sep /> {shift.timeShort} <Sep /> <span style={{ color: COLORS.textMid, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>${shift.hourlyRate}/hr</span>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 800, padding: '5px 10px', borderRadius: 100, background: cntBg, color: cntColor }}>{cnt} applicant{cnt !== 1 ? 's' : ''}</span>
        <Chevron isCollapsed={isCollapsed} />
      </div>
      {!isCollapsed && (
        <>
          {filtered.length === 0 && cnt === 0 && (
            <div style={{ padding: '36px 18px', textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: COLORS.textLight }}>No applicants yet</div>
              <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 4 }}>Applicants will appear here when providers apply</div>
            </div>
          )}
          {filtered.length === 0 && cnt > 0 && (
            <div style={{ padding: '28px 18px', textAlign: 'center', fontSize: 13, color: COLORS.textLight }}>No applicants in this filter</div>
          )}
          {filtered.map(a => (
            <div key={a.id} onClick={() => onOpenDetail(a)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${COLORS.borderSoft}`, cursor: 'pointer' }}>
              <Initials text={a.initials} url={a.avatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '-0.2px', lineHeight: 1.15, marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textLight, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span>{a.cred}</span>
                  <Sep />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: COLORS.gold, fontSize: 15, lineHeight: 1 }}>★</span>
                    <span style={{ color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13 }}>{a.stars}</span>
                  </span>
                  <Sep />
                  <span>{a.dist}</span>
                </div>
              </div>
              {a.status === 'new' && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <AcceptBtn onClick={(e) => { e.stopPropagation(); onAccept(a.id, a.name); }} />
                  <DeclineBtn onClick={(e) => { e.stopPropagation(); onDecline(a.id, a.name); }} />
                </div>
              )}
              {a.status === 'accepted' && <ConfirmedPill />}
              {a.status === 'declined' && <span style={{ fontSize: 10, color: COLORS.textLight, fontWeight: 700, fontStyle: 'italic' }}>Declined</span>}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================
// PERM JOB CARD
// ============================================================
function PermJobCard({ job, filter, isCollapsed, onToggle, onOpenDetail, onOpenPipeline }) {
  const filtered = job.applicants.filter(a => filter === 'all' || a.stage === filter);

  return (
    <div style={{ margin: '0 16px 12px', background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 18, overflow: 'hidden' }}>
      <div onClick={onToggle} style={{ padding: '16px 18px', borderBottom: isCollapsed ? 'none' : `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.purpleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '-0.2px', marginBottom: 2 }}>{job.title}</div>
          <div style={{ fontSize: 12, color: COLORS.textLight }}><span style={{ color: COLORS.purple, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{job.salary}</span> <Sep /> Posted {job.posted}</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 800, color: COLORS.purple, background: COLORS.purpleSoft, padding: '4px 9px', borderRadius: 100, textTransform: 'uppercase', flexShrink: 0 }}>{job.type}</span>
        <Chevron isCollapsed={isCollapsed} />
      </div>
      {!isCollapsed && (
        <>
          {filtered.length === 0 && (
            <div style={{ padding: '28px 18px', textAlign: 'center', fontSize: 13, color: COLORS.textLight }}>No applicants in this stage</div>
          )}
          {filtered.map(a => (
            <div key={a.id} onClick={() => onOpenDetail(a)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${COLORS.borderSoft}`, cursor: 'pointer' }}>
              <Initials text={a.initials} url={a.avatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '-0.2px', lineHeight: 1.15, marginBottom: 2 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textLight, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span>{a.cred} · {a.exp}</span>
                  <Sep />
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ color: COLORS.gold, fontSize: 15, lineHeight: 1 }}>★</span>
                    <span style={{ color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13 }}>{a.stars}</span>
                  </span>
                  <Sep />
                  <span>{a.dist}</span>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); onOpenPipeline(a); }} style={{ fontSize: 9, fontWeight: 800, padding: '5px 11px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 0.3, background: STAGE_BG[a.stage], color: STAGE_COLOR[a.stage], border: 'none', cursor: 'pointer' }}>{STAGE_LABELS[a.stage]}</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ============================================================
// DETAIL SHEET
// ============================================================
function DetailSheet({ selected, onClose, onAccept, onDecline, onOpenPipeline }) {
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  const { type, data, shift, job } = selected;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, animation: 'kaziOverlayFade 0.25s ease-out' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '28px 28px 0 0', zIndex: 201, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 50px rgba(0,0,0,0.25)', animation: 'kaziSheetSlide 0.35s cubic-bezier(0.32, 0.72, 0, 1)', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '12px auto 4px', flexShrink: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 18px 0', flexShrink: 0 }}>
          <CloseBtn onClick={onClose} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px' }}>
          {type === 'temp' ? (
            <>
              <SheetLabel text="Temp shift applicant" />
              <SheetTitle text={shift.date} />
              <SheetSub text={`${shift.time} · ${shift.hours} hours`} />
              <InfoChip variant="green">Applied <strong style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{data.appliedAgo}</strong></InfoChip>
              <ApplicantStrip applicant={data} subLine={`${shift.role} · ${data.cred}`} />
              <SectionTitle text="Shift details" />
              <InfoRow label="Date" value={shift.date} />
              <InfoRow label="Time" value={shift.time} />
              <InfoRow label="Hours" value={shift.hours.toString()} />
              <InfoRow label="Hourly rate" value={`$${shift.hourlyRate}/hr`} valueColor={COLORS.green} valueLarge />
              <InfoRow label="Est. total" value={`$${shift.hourlyRate * shift.hours}`} valueColor={COLORS.green} valueLarge />
            </>
          ) : (
            <>
              <SheetLabel text="Permanent job applicant" />
              <SheetTitle text={job.title} />
              <SheetSub text={`${job.salary} · ${job.type}`} />
              <InfoChip variant="purple">
                Applied <strong style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{data.appliedAgo}</strong> · Stage:&nbsp;
                <strong style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{STAGE_LABELS[data.stage]}</strong>
              </InfoChip>
              <ApplicantStrip applicant={data} subLine={`${data.cred} · ${data.exp}`} />
              <SectionTitle text="Job details" />
              <InfoRow label="Position" value={job.title} />
              <InfoRow label="Type" value={job.type} />
              <InfoRow label="Salary" value={job.salary} valueColor={COLORS.purple} />
              <InfoRow label="Posted" value={job.posted} />
            </>
          )}
        </div>
        <div style={{ padding: '14px 20px 26px', borderTop: `1px solid ${COLORS.borderSoft}`, background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageBtn />
          {type === 'temp' && data.status === 'new' && (
            <>
              <button onClick={() => onDecline(shift.id, data.id, data.name)} style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #fca5a5', background: COLORS.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
              <button onClick={() => onAccept(shift.id, data.id, data.name)} style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12" /></svg>
                Accept applicant
              </button>
            </>
          )}
          {type === 'temp' && data.status !== 'new' && (
            <button style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>View profile</button>
          )}
          {type === 'perm' && (
            <button onClick={() => onOpenPipeline(job.id, data.id, data.name, data.stage)} style={{ flex: 1, background: COLORS.purple, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Update status</button>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================================
// CONFIRM MODAL
// ============================================================
function ConfirmModal({ action, onClose, onConfirm }) {
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  const isAccept = action.action === 'accept';
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, animation: 'kaziOverlayFade 0.2s ease-out' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '28px 28px 0 0', zIndex: 301, boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', animation: 'kaziSheetSlide 0.3s cubic-bezier(0.32, 0.72, 0, 1)', fontFamily: "'DM Sans', sans-serif", padding: '20px 24px 32px' }}>
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '0 auto 18px' }} />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>{isAccept ? 'Accept' : 'Decline'} {action.name}?</div>
        <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.5, marginBottom: 20 }}>
          {isAccept ? `This will confirm ${action.name} for this shift. You can message them to coordinate details.` : `${action.name} will be notified they were not selected for this shift.`}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 100, border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 14, fontWeight: 800 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 14, borderRadius: 100, border: 'none', background: isAccept ? COLORS.green : COLORS.red, color: 'white', fontSize: 14, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{isAccept ? 'Accept' : 'Decline'}</button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// PIPELINE MODAL
// ============================================================
function PipelineModal({ target, onClose, onApply }) {
  const [selected, setSelected] = useState(target.currentStage);
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, animation: 'kaziOverlayFade 0.2s ease-out' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '28px 28px 0 0', zIndex: 301, boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', animation: 'kaziSheetSlide 0.3s cubic-bezier(0.32, 0.72, 0, 1)', fontFamily: "'DM Sans', sans-serif", padding: '20px 24px 32px', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '0 auto 18px' }} />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Update {target.name}</div>
        <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.5, marginBottom: 16 }}>Move this applicant to a new stage</div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {STAGE_LIST.map(s => (
            <div key={s.id} onClick={() => setSelected(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: selected === s.id ? COLORS.purpleSoft : COLORS.bg, border: `1.5px solid ${selected === s.id ? COLORS.purple : COLORS.border}`, borderRadius: 14, cursor: 'pointer', marginBottom: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === s.id ? COLORS.purple : COLORS.border}`, background: selected === s.id ? COLORS.purple : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {selected === s.id && <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 100, border: `1.5px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 14, fontWeight: 800 }}>Cancel</button>
          <button onClick={() => onApply(selected)} style={{ flex: 1, padding: 14, borderRadius: 100, border: 'none', background: COLORS.purple, color: 'white', fontSize: 14, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Update</button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================
function DateBlock({ month, day }) {
  return (
    <div style={{ width: 48, height: 48, borderRadius: 12, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 9, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.5 }}>{month}</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text, marginTop: 3, letterSpacing: '-0.5px' }}>{day}</div>
    </div>
  );
}

function Initials({ text, url, size = 42 }) {
  if (url) {
    return <img src={url} alt={text} style={{ width: size, height: size, borderRadius: 12, objectFit: 'cover', border: `1px solid ${COLORS.borderSoft}`, flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 12, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{text}</div>
  );
}

function Sep() { return <span style={{ width: 2, height: 2, background: COLORS.textLight, borderRadius: '50%', display: 'inline-block' }} />; }

function Chevron({ isCollapsed }) {
  return (
    <div style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.2s', transform: `rotate(${isCollapsed ? '0' : '180'}deg)` }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}><polyline points="6 9 12 15 18 9" /></svg>
    </div>
  );
}

function AcceptBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.greenSoft, border: '1.5px solid rgba(26,127,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><polyline points="20 6 9 17 4 12" /></svg>
    </button>
  );
}

function DeclineBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.redSoft, border: '1.5px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    </button>
  );
}

function ConfirmedPill() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.4, padding: '5px 10px', borderRadius: 100, background: COLORS.green, color: 'white' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 8, height: 8 }}><polyline points="20 6 9 17 4 12" /></svg>
      Confirmed
    </span>
  );
}

function CloseBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
    </button>
  );
}

function MessageBtn() {
  return (
    <button style={{ width: 52, height: 52, borderRadius: '50%', border: `1.5px solid ${COLORS.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
    </button>
  );
}

function SheetLabel({ text }) { return <div style={{ fontSize: 10, color: COLORS.textLight, textTransform: 'uppercase', fontWeight: 800, letterSpacing: 0.6, marginBottom: 8 }}>{text}</div>; }
function SheetTitle({ text }) { return <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-0.6px', lineHeight: 1.1 }}>{text}</div>; }
function SheetSub({ text }) { return <div style={{ fontSize: 14, color: COLORS.textMid, marginTop: 6 }}>{text}</div>; }
function SectionTitle({ text }) { return <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12, marginTop: 22 }}>{text}</div>; }

function InfoChip({ variant, children }) {
  const map = {
    green: { bg: COLORS.greenTint, border: COLORS.greenSoft, fg: COLORS.green },
    purple: { bg: COLORS.purpleSoft, border: COLORS.purpleSoft, fg: COLORS.purple },
    amber: { bg: COLORS.amberSoft, border: '#fce0bf', fg: COLORS.amber },
  };
  const s = map[variant] || map.green;
  return (
    <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, background: s.bg, border: `1px solid ${s.border}`, color: s.fg }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={s.fg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

function ApplicantStrip({ applicant, subLine }) {
  const navigate = useNavigate();
  const realIds = useProviderIds();
  const targetId = resolveProviderId(applicant.id, realIds);
  return (
    <div onClick={() => navigate(`/professionals/${targetId}`)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '16px 0', marginTop: 18, borderTop: `1px solid ${COLORS.borderSoft}`, borderBottom: `1px solid ${COLORS.borderSoft}`, cursor: 'pointer' }}>
      {applicant.avatarUrl ? (
        <img src={applicant.avatarUrl} alt={applicant.name} style={{ width: 50, height: 50, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: `1px solid ${COLORS.borderSoft}` }} />
      ) : (
        <div style={{ width: 50, height: 50, borderRadius: 14, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, flexShrink: 0, letterSpacing: '-0.3px' }}>
          {applicant.initials}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text, lineHeight: 1.1, letterSpacing: '-0.3px', marginBottom: 4 }}>{applicant.name}</div>
        <div style={{ fontSize: 12, color: COLORS.textMid, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span>{subLine}</span>
          <Sep />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <span style={{ color: COLORS.gold, fontSize: 18, lineHeight: 1 }}>★</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: COLORS.text, fontSize: 15 }}>{applicant.stars}</span>
            <span style={{ color: COLORS.textLight, marginLeft: 2 }}>({applicant.reviews})</span>
          </span>
        </div>
      </div>
      <div style={{ color: COLORS.textLight, flexShrink: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
    </div>
  );
}

function RatingRow({ stars, reviews }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
      <span style={{ color: COLORS.gold, fontSize: 20 }}>★</span>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20 }}>{stars}</span>
      <span style={{ fontSize: 13, color: COLORS.textLight }}>({reviews} reviews)</span>
    </div>
  );
}

function InfoRow({ label, value, valueColor, valueLarge }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${COLORS.borderSoft}` }}>
      <div style={{ fontSize: 13, color: COLORS.textMid }}>{label}</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: valueLarge ? 16 : 14, color: valueColor || COLORS.text, textAlign: 'right' }} dangerouslySetInnerHTML={{ __html: value }} />
    </div>
  );
}
