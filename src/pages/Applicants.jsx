import { useState, useMemo, useEffect } from 'react';

// ============================================================
// KAZI APPLICANTS — Minimal redesign
// Shifts grouped with their applicants in collapsible blocks
// Top: All / Temp / Permanent segmented toggle
// Tap applicant row → detail popup
// Status-aware ✓ / × icon buttons
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
  gold: '#f4b740',
};

// ============================================================
// MOCK DATA — replace with backend fetches later
// ============================================================
const MOCK_SHIFTS = [
  {
    id: 'shift-1',
    type: 'temp',
    tagText: 'Tomorrow',
    tagVariant: 'urgent',
    title: 'Dental Hygienist',
    timeText: '8:00 AM – 5:00 PM',
    rate: '$58/hr',
    filled: false,
    applicants: [
      { id: 'sarah', name: 'Sarah K.', initials: 'SK', role: 'Dental Hygienist', cred: 'RDH', rating: 4.9, reviewCount: 82, reliability: 99, experience: '8 yrs', distance: '3.2 mi', distanceText: '3.2 mi away', status: 'pending', bio: 'Experienced hygienist with a calm chairside manner. Specializes in periodontal therapy and patient education. Available for temp coverage Mon–Fri.', skills: ['Dentrix', 'Periodontal therapy', 'Spanish-speaking', 'Pediatric experience', 'X-ray certified'] },
      { id: 'maria', name: 'Maria G.', initials: 'MG', role: 'Dental Hygienist', cred: 'RDH', rating: 5.0, reviewCount: 56, reliability: 91, experience: '6 yrs', distance: '7.4 mi', distanceText: '7.4 mi away', status: 'pending', bio: 'Detail-oriented hygienist who has worked in both pediatric and general practices. Strong relationship-builder with patients of all ages.', skills: ['Eaglesoft', 'Spanish-speaking', 'Pediatric experience', 'Local anesthesia certified'] },
      { id: 'priya', name: 'Priya S.', initials: 'PS', role: 'Dental Hygienist', cred: 'RDH', rating: 4.7, reviewCount: 34, reliability: 94, experience: '4 yrs', distance: '12.1 mi', distanceText: '12.1 mi away', status: 'pending', bio: 'Reliable hygienist with strong clinical skills. Comfortable working independently and adapting to different practice software.', skills: ['Dentrix', 'Open Dental', 'X-ray certified'] },
    ],
  },
  {
    id: 'shift-2',
    type: 'temp',
    tagText: 'Apr 11',
    tagVariant: 'temp',
    title: 'Dental Assistant',
    timeText: '9:00 AM – 5:00 PM',
    rate: '$24/hr',
    filled: true,
    applicants: [
      { id: 'michelle', name: 'Michelle O.', initials: 'MO', role: 'Dental Assistant', cred: 'RDA', rating: 4.7, reviewCount: 41, reliability: 96, experience: '5 yrs', distance: '4.5 mi', distanceText: '4.5 mi away', status: 'accepted', bio: 'Versatile dental assistant comfortable with all chairside duties. Quick learner who adapts to new offices easily.', skills: ['Dentrix', 'X-ray certified', 'Sterilization', 'Impressions'] },
      { id: 'alexandra', name: 'Alexandra A.', initials: 'AA', role: 'Dental Assistant', cred: 'RDA', rating: 4.8, reviewCount: 22, reliability: 96, experience: '3 yrs', distance: '6.8 mi', distanceText: '6.8 mi away', status: 'not-selected', bio: 'Friendly and energetic dental assistant with strong patient communication skills.', skills: ['Eaglesoft', 'X-ray certified', 'Sterilization'] },
      { id: 'anthony', name: 'Anthony B.', initials: 'AB', role: 'Dental Assistant', cred: 'EFDA', rating: 4.9, reviewCount: 53, reliability: 97, experience: '7 yrs', distance: '9.2 mi', distanceText: '9.2 mi away', status: 'not-selected', bio: 'Expanded function dental assistant with extensive experience in cosmetic and restorative procedures.', skills: ['Open Dental', 'EFDA certified', 'Cosmetic dentistry', 'X-ray certified', 'Impressions'] },
    ],
  },
  {
    id: 'shift-3',
    type: 'perm',
    tagText: 'Permanent',
    tagVariant: 'perm',
    title: 'Full-time Hygienist',
    timeText: 'Posted 2 days ago',
    rate: '$48–62/hr',
    filled: false,
    applicants: [
      { id: 'rachel', name: 'Rachel M.', initials: 'RM', role: 'Dental Hygienist', cred: 'RDH', rating: 4.8, reviewCount: 67, reliability: 98, experience: '5 yrs', distance: '5.5 mi', distanceText: '5 yrs experience', status: 'pending', bio: 'Looking for a permanent position with a forward-thinking practice. Strong background in preventive care and patient education.', skills: ['Dentrix', 'Eaglesoft', 'Periodontal therapy', 'Patient education', 'X-ray certified'] },
      { id: 'chloe', name: 'Chloe N.', initials: 'CN', role: 'Dental Hygienist', cred: 'RDH', rating: 5.0, reviewCount: 29, reliability: 100, experience: '3 yrs', distance: '8.3 mi', distanceText: '3 yrs experience', status: 'pending', bio: 'Recent graduate with perfect reliability score. Eager to grow with a stable practice and build long-term patient relationships.', skills: ['Open Dental', 'Pediatric experience', 'X-ray certified'] },
    ],
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Applicants() {
  const [segment, setSegment] = useState('all');
  const [collapsed, setCollapsed] = useState({});
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState({ role: 'All roles', hideFilled: false, hideNotSelected: false });

  const hasActiveFilters = filters.role !== 'All roles' || filters.hideFilled || filters.hideNotSelected;

  const visibleShifts = useMemo(() => {
    return MOCK_SHIFTS.filter((s) => {
      if (segment !== 'all' && s.type !== segment) return false;
      if (filters.hideFilled && s.filled) return false;
      return true;
    });
  }, [segment, filters]);

  const counts = {
    all: MOCK_SHIFTS.length,
    temp: MOCK_SHIFTS.filter((s) => s.type === 'temp').length,
    perm: MOCK_SHIFTS.filter((s) => s.type === 'perm').length,
  };

  const totalPending = MOCK_SHIFTS.reduce((acc, s) => acc + s.applicants.filter((a) => a.status === 'pending').length, 0);

  const toggleCollapse = (id) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <style>{`
        .kazi-applicants * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .kazi-applicants button, .kazi-applicants input { font-family: inherit; cursor: pointer; }
        .kazi-applicants input { outline: none; }
        @keyframes kaziSheetSlide { from { transform: translate(-50%, 100%); } to { transform: translate(-50%, 0); } }
        @keyframes kaziOverlayFade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div className="kazi-applicants" style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.06)', fontFamily: "'DM Sans', sans-serif", color: COLORS.text, WebkitFontSmoothing: 'antialiased', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* TOP BAR */}
        <div style={{ background: 'white', padding: '18px 18px 16px', borderBottom: `1px solid ${COLORS.borderSoft}`, flexShrink: 0, position: 'sticky', top: 0, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: COLORS.text, letterSpacing: '-0.5px', lineHeight: 1.1 }}>Applicants</div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 4 }}>{totalPending} applicants across {visibleShifts.length} jobs</div>
            </div>
            <button onClick={() => setFilterSheetOpen(true)} style={{ width: 40, height: 40, borderRadius: '50%', background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }} aria-label="Filter">
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {hasActiveFilters && <div style={{ position: 'absolute', top: 7, right: 9, width: 7, height: 7, background: COLORS.coral, borderRadius: '50%', border: '1.5px solid white' }} />}
            </button>
          </div>

          {/* Segmented toggle */}
          <SegmentedToggle segment={segment} setSegment={setSegment} counts={counts} />
        </div>

        {/* SCROLL AREA */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 0 40px' }}>
          {visibleShifts.map((shift) => (
            <ShiftBlock
              key={shift.id}
              shift={shift}
              collapsed={!!collapsed[shift.id]}
              onToggleCollapse={() => toggleCollapse(shift.id)}
              onApplicantClick={(applicant) => setSelectedApplicant({ applicant, shift })}
              hideNotSelected={filters.hideNotSelected}
            />
          ))}
        </div>

        {selectedApplicant && (
          <ApplicantDetailSheet applicant={selectedApplicant.applicant} onClose={() => setSelectedApplicant(null)} />
        )}

        {filterSheetOpen && (
          <FilterSheet filters={filters} setFilters={setFilters} onClose={() => setFilterSheetOpen(false)} />
        )}
      </div>
    </>
  );
}

// ============================================================
// SEGMENTED TOGGLE
// ============================================================
function SegmentedToggle({ segment, setSegment, counts }) {
  const segs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'temp', label: 'Temp shifts', count: counts.temp },
    { id: 'perm', label: 'Permanent', count: counts.perm },
  ];
  return (
    <div style={{ marginTop: 14, display: 'flex', background: 'white', border: `1px solid ${COLORS.borderSoft}`, borderRadius: 100, padding: 4, gap: 2 }}>
      {segs.map((s) => {
        const isActive = segment === s.id;
        return (
          <button key={s.id} onClick={() => setSegment(s.id)} style={{ flex: 1, background: isActive ? COLORS.green : 'none', border: 'none', padding: '10px 8px', fontSize: 12, fontWeight: 700, color: isActive ? 'white' : COLORS.textLight, borderRadius: 100, fontFamily: "'Outfit', sans-serif", transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            {s.label}
            <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100, background: isActive ? 'rgba(255,255,255,0.25)' : COLORS.bg, color: isActive ? 'white' : COLORS.textLight, minWidth: 16 }}>{s.count}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// SHIFT BLOCK
// ============================================================
function ShiftBlock({ shift, collapsed, onToggleCollapse, onApplicantClick, hideNotSelected }) {
  const visibleApplicants = hideNotSelected ? shift.applicants.filter((a) => a.status !== 'not-selected') : shift.applicants;
  const pendingCount = shift.applicants.filter((a) => a.status === 'pending').length;

  return (
    <div style={{ margin: '0 16px 16px', background: shift.filled ? COLORS.greenTint : 'white', border: `1px solid ${shift.filled ? COLORS.greenSoft : COLORS.borderSoft}`, borderRadius: 20, overflow: 'hidden', transition: 'background 0.2s' }}>
      {/* Header */}
      <div onClick={onToggleCollapse} style={{ padding: '18px 18px 14px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, cursor: 'pointer', userSelect: 'none' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <ShiftTag variant={shift.tagVariant}>{shift.tagText}</ShiftTag>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: COLORS.text, lineHeight: 1.15, letterSpacing: '-0.2px', marginTop: 6 }}>{shift.title}</div>
          <div style={{ fontSize: 12, color: COLORS.textMid, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span>{shift.timeText}</span>
            <span style={{ width: 2.5, height: 2.5, background: COLORS.textLight, borderRadius: '50%' }} />
            <span style={{ color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>{shift.rate}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {shift.filled ? (
            <span style={{ background: COLORS.green, color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 9, padding: '5px 11px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 9, height: 9 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Filled
            </span>
          ) : (
            <span style={{ background: COLORS.text, color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 11, padding: '5px 12px', borderRadius: 100, lineHeight: 1.4 }}>
              <span style={{ fontSize: 13 }}>{pendingCount}</span> applicants
            </span>
          )}
          <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.25s', marginLeft: 4, marginTop: 2, transform: collapsed ? 'rotate(-90deg)' : 'none' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </div>

      {/* Applicants list */}
      {!collapsed && (
        <div style={{ borderTop: `1px solid ${shift.filled ? COLORS.greenSoft : COLORS.borderSoft}`, background: 'white' }}>
          {visibleApplicants.map((applicant, idx) => (
            <ApplicantRow
              key={applicant.id}
              applicant={applicant}
              isLast={idx === visibleApplicants.length - 1}
              onClick={() => onApplicantClick(applicant)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ShiftTag({ variant, children }) {
  const styles = {
    temp: { background: COLORS.greenTint, color: COLORS.green },
    perm: { background: COLORS.purpleSoft, color: COLORS.purple },
    urgent: { background: COLORS.coralSoft, color: COLORS.coral },
  };
  return (
    <span style={{ display: 'inline-block', fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: "'Outfit', sans-serif", ...styles[variant] }}>
      {children}
    </span>
  );
}

// ============================================================
// APPLICANT ROW
// ============================================================
function ApplicantRow({ applicant, isLast, onClick }) {
  const isPending = applicant.status === 'pending';
  const isAccepted = applicant.status === 'accepted';
  const isNotSelected = applicant.status === 'not-selected';

  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: isLast ? 'none' : `1px solid ${COLORS.borderSoft}`, cursor: 'pointer', transition: 'background 0.1s', opacity: isNotSelected ? 0.5 : 1 }}>
      <Initials text={applicant.initials} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text, lineHeight: 1.15, letterSpacing: '-0.2px' }}>{applicant.name}</div>
        <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ color: COLORS.gold, fontSize: 11 }}>★</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: COLORS.textMid }}>{applicant.rating}</span>
          <span style={{ width: 2, height: 2, background: COLORS.textLight, borderRadius: '50%' }} />
          <span>{applicant.distanceText}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {isPending && (
          <>
            <IconBtn variant="reject" onClick={(e) => { e.stopPropagation(); }} ariaLabel="Pass">
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </IconBtn>
            <IconBtn variant="accept" onClick={(e) => { e.stopPropagation(); }} ariaLabel="Accept">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </IconBtn>
          </>
        )}
        {isAccepted && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, padding: '6px 10px', borderRadius: 100, background: COLORS.green, color: 'white' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 9, height: 9 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Hired
          </span>
        )}
        {isNotSelected && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.3, padding: '6px 10px', borderRadius: 100, background: COLORS.bg, color: COLORS.textLight, border: `1px solid ${COLORS.border}` }}>
            Not selected
          </span>
        )}
      </div>
    </div>
  );
}

function IconBtn({ variant, onClick, ariaLabel, children }) {
  const styles = {
    reject: { background: COLORS.redSoft, borderColor: '#fca5a5' },
    accept: { background: COLORS.green, borderColor: COLORS.green },
  };
  return (
    <button onClick={onClick} aria-label={ariaLabel} style={{ width: 38, height: 38, borderRadius: '50%', border: '1.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, ...styles[variant] }}>
      {children}
    </button>
  );
}

function Initials({ text }) {
  return (
    <div style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0, letterSpacing: '-0.3px' }}>
      {text}
    </div>
  );
}

// ============================================================
// APPLICANT DETAIL SHEET
// ============================================================
function ApplicantDetailSheet({ applicant, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, animation: 'kaziOverlayFade 0.25s ease-out' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '28px 28px 0 0', zIndex: 201, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 50px rgba(0,0,0,0.25)', animation: 'kaziSheetSlide 0.35s cubic-bezier(0.32, 0.72, 0, 1)', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '12px auto 4px', flexShrink: 0 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 18px 0', flexShrink: 0 }}>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 24px 20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, flexShrink: 0, letterSpacing: '-0.5px' }}>
              {applicant.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.text, lineHeight: 1.1, letterSpacing: '-0.4px', marginBottom: 4 }}>{applicant.name}</div>
              <div style={{ fontSize: 13, color: COLORS.textMid, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>{applicant.role}</span>
                <span style={{ background: COLORS.greenTint, color: COLORS.green, fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 100, letterSpacing: 0.2, fontFamily: "'Outfit', sans-serif" }}>{applicant.cred}</span>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 22 }}>
            <StatTile num={<><span style={{ color: COLORS.gold, fontSize: 14, marginRight: 1 }}>★</span>{applicant.rating}</>} label={`${applicant.reviewCount} reviews`} />
            <StatTile num={<>{applicant.reliability}<span style={{ fontSize: 14 }}>%</span></>} label="Reliability" />
            <StatTile num={applicant.experience} label="Experience" />
          </div>

          <DetailSection title="About">
            <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.55 }}>{applicant.bio}</div>
          </DetailSection>

          <DetailSection title="Skills & certifications">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {applicant.skills.map((s) => (
                <span key={s} style={{ background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 100, padding: '6px 11px', fontSize: 11, color: COLORS.textMid, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Location">
            <div style={{ fontSize: 13, color: COLORS.textMid, lineHeight: 1.55 }}>{applicant.distance} from your office</div>
          </DetailSection>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px 26px', borderTop: `1px solid ${COLORS.borderSoft}`, background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ width: 52, height: 52, borderRadius: '50%', border: `1.5px solid ${COLORS.border}`, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label="Message">
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #fca5a5', background: COLORS.redSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} aria-label="Pass">
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.red} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <button style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Accept
          </button>
        </div>
      </div>
    </>
  );
}

function StatTile({ num, label }) {
  return (
    <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: COLORS.text, lineHeight: 1, letterSpacing: '-0.3px' }}>{num}</div>
      <div style={{ fontSize: 9, color: COLORS.textLight, textTransform: 'uppercase', fontWeight: 700, marginTop: 5, letterSpacing: 0.4 }}>{label}</div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 11, color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

// ============================================================
// FILTER SHEET
// ============================================================
function FilterSheet({ filters, setFilters, onClose }) {
  const [local, setLocal] = useState(filters);
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const apply = () => { setFilters(local); onClose(); };
  const reset = () => setLocal({ role: 'All roles', hideFilled: false, hideNotSelected: false });

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, animation: 'kaziOverlayFade 0.25s ease-out' }} />
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: 'white', borderRadius: '28px 28px 0 0', zIndex: 201, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', animation: 'kaziSheetSlide 0.35s cubic-bezier(0.32, 0.72, 0, 1)', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ width: 40, height: 4, background: COLORS.border, borderRadius: 100, margin: '12px auto 4px', flexShrink: 0 }} />
        <div style={{ padding: '14px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${COLORS.borderSoft}`, flexShrink: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.text, letterSpacing: '-0.3px' }}>Filter applicants</div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '20px 24px 18px' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.text, marginBottom: 12 }}>Role</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['All roles', 'Hygienist', 'Assistant', 'Front Desk', 'Dentist'].map((opt) => {
                const isSel = local.role === opt;
                return (
                  <button key={opt} onClick={() => setLocal({ ...local, role: opt })} style={{ background: isSel ? COLORS.green : 'white', border: `1.5px solid ${isSel ? COLORS.green : COLORS.border}`, borderRadius: 100, padding: '10px 16px', fontSize: 12, fontWeight: 700, color: isSel ? 'white' : COLORS.textMid }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ height: 8, background: COLORS.bg }} />
          <ToggleRow title="Hide filled jobs" sub="Only show jobs needing decisions" value={local.hideFilled} onChange={(v) => setLocal({ ...local, hideFilled: v })} isFirst />
          <ToggleRow title='Hide "not selected"' sub="Cleaner view, no grayed-out applicants" value={local.hideNotSelected} onChange={(v) => setLocal({ ...local, hideNotSelected: v })} />
          <div style={{ height: 20 }} />
        </div>
        <div style={{ padding: '14px 20px 26px', borderTop: `1px solid ${COLORS.borderSoft}`, background: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={reset} style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 700, color: COLORS.textMid, padding: '14px 4px', textDecoration: 'underline', flexShrink: 0 }}>Reset all</button>
          <button onClick={apply} style={{ flex: 1, background: COLORS.green, color: 'white', border: 'none', borderRadius: 100, padding: '16px 20px', fontSize: 15, fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>Apply filters</button>
        </div>
      </div>
    </>
  );
}

function ToggleRow({ title, sub, value, onChange, isFirst }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderTop: isFirst ? 'none' : `1px solid ${COLORS.borderSoft}` }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 3 }}>{sub}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{ position: 'relative', width: 46, height: 26, background: value ? COLORS.green : COLORS.border, borderRadius: 100, border: 'none', flexShrink: 0, padding: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'transform 0.2s', transform: value ? 'translateX(20px)' : 'none', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} />
      </button>
    </div>
  );
}
