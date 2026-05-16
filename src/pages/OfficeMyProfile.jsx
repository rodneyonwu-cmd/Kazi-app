import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import TempShiftCard from '../components/TempShiftCard';
import PermJobCard from '../components/PermJobCard';

// ============================================================
// KAZI · Office "My Office" profile
//
// Aesthetic mirrors ProfessionalProfile: flat warm-beige page,
// inline hero (avatar + meta + rating), stat tiles separated
// from the hero by a top border, sticky underline tabs, and
// white rounded section cards for everything below.
// ============================================================

const MAP_URL = 'https://staticmap.openstreetmap.de/staticmap.php?center=29.7339,-95.4663&zoom=15&size=600x360&maptype=mapnik&markers=29.7339,-95.4663,red-pushpin';
const OFFICE_PHOTO_URL = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=240&q=80';

const PHOTOS = [
  { src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', label: 'Reception', featured: true },
  { src: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=600&q=80', label: 'Operatory 1' },
  { src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80', label: 'Operatory 2' },
  { src: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=600&q=80', label: 'Sterilization' },
  { src: 'https://images.unsplash.com/photo-1583912267550-d6c2f6e6d8f9?auto=format&fit=crop&w=600&q=80', label: 'Waiting area' },
  { src: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?auto=format&fit=crop&w=600&q=80', label: 'Break room' },
  { src: 'https://images.unsplash.com/photo-1631815587646-b85a1bb027e1?auto=format&fit=crop&w=600&q=80', label: 'Exterior' },
];

const HERO_STATS = [
  { label: 'Rating', value: '★ 4.8' },
  { label: 'Reviews', value: '18' },
  { label: 'Hires', value: '142' },
  { label: 'Response', value: '< 1h' },
];

// Mock shift data — shape matches the canonical TempShiftCard /
// PermJobCard so the office profile reuses the exact cards that
// providers see on FindShifts. `hideOffice` strips the redundant
// office header since the cards live on the office's own profile.
const TEMP_SHIFTS = [
  { id: 'sh-11', role: 'Dental Hygienist', when: 'Fri, Apr 11 · 8:00 AM – 5:00 PM', pay: 55, applied: 8, lunch: '45 min lunch', software: 'Dentrix' },
  { id: 'sh-14', role: 'Dental Assistant',  when: 'Mon, Apr 14 · 8:00 AM – 4:00 PM', pay: 28, applied: 3, lunch: '30 min lunch', software: 'Dentrix' },
  { id: 'sh-17', role: 'Front Desk',        when: 'Thu, Apr 17 · 9:00 AM – 5:00 PM', pay: 22, applied: 0, lunch: '30 min lunch' },
];

const PERM_JOBS = [
  {
    id: 'perm-1',
    role: 'Dental Hygienist',
    applied: 12,
    tags: [{ label: 'Full-time' }, { label: 'Mon–Fri', gray: true }, { label: 'Starts ASAP', gray: true }],
    benefits: ['Health', 'Dental', '401(k)', 'PTO', 'CE Allowance'],
    payRange: '$65K – $78K',
    payUnit: 'per year',
    // Kept for PermanentJobModal backward-compat
    badge: 'Full-Time', title: 'Dental Hygienist', type: 'Full-Time · Start date flexible', salary: '$65K – $78K / year',
  },
  {
    id: 'perm-2',
    role: 'Front Desk Coordinator',
    applied: 5,
    tags: [{ label: 'Part-time' }, { label: 'Mon/Wed/Fri', gray: true }, { label: 'Starts May 1', gray: true }],
    benefits: ['Flexible Hours', 'PTO'],
    payRange: '$22 – $26',
    payUnit: 'per hour',
    badge: 'Part-Time', title: 'Front Desk Coordinator', type: 'Part-Time · Starts May 1', salary: '$22 – $26 / hour',
  },
];

const ABOUT = `Modern general dentistry practice in the Galleria area of Houston. Busy 4-chair office with a strong focus on patient experience, hygiene excellence, and a welcoming team culture. We hire for same-day coverage and longer engagements.

Our team has been serving the Houston community for over a decade. Dr. Patel leads a compassionate team dedicated to making every patient feel at home. We pride ourselves on modern equipment, digital workflows, and continuing education — our staff attend 40+ hours of CE annually.

We're looking for professionals who are reliable, friendly, and take pride in their craft.`;

const DETAILS = [
  { label: 'Hours', value: 'Mon–Fri 8am–5pm' },
  { label: 'Chairs', value: '4' },
  { label: 'Software', value: 'Dentrix · Dexis' },
  { label: 'Parking', value: 'Free lot' },
  { label: 'Dress code', value: 'Navy scrubs' },
  { label: 'Lunch', value: 'Provided' },
];

const REVIEWS = [
  { logo: 'SK', name: 'Sarah K., RDH', when: '2 weeks ago', stars: 5, text: 'Great office to work at. Dr. Patel is super organized and the team is welcoming. Got lunch provided and they paid out on time.' },
  { logo: 'MT', name: 'Marcus T., RDA', when: '1 month ago', stars: 5, text: "Modern setup with Dentrix and digital imaging. Clean, efficient, and well-run. I'd come back any time they need coverage." },
  { logo: 'JR', name: 'Jasmine R., RDH', when: '2 months ago', stars: 5, text: 'Front desk was prepared for my arrival, parking was easy. A+ office for RDHs.' },
];

const RATING_BREAKDOWN = [
  { n: 5, p: 85 }, { n: 4, p: 10 }, { n: 3, p: 3 }, { n: 2, p: 2 }, { n: 1, p: 0 },
];

export default function OfficeMyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSub, setActiveSub] = useState('temp');
  const [aboutOpen, setAboutOpen] = useState(false);
  const notImpl = (label) => () => alert(`${label} — coming soon`);

  return (
    <div className="kazi-omp" style={{ background: '#ffffff', minHeight: '100vh', maxWidth: 480, margin: '0 auto', boxShadow: '0 0 40px rgba(0,0,0,0.06)', fontFamily: "'DM Sans', sans-serif", color: '#1a1a1a', WebkitFontSmoothing: 'antialiased', paddingBottom: 110, position: 'relative' }}>
      <style>{`
        .kazi-omp * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .kazi-omp button { font-family: inherit; cursor: pointer; }
      `}</style>

      <TopBar role="office" />

      {/* Local topbar — sticky on white */}
      <section style={{ position: 'sticky', top: 0, zIndex: 40, background: '#fff', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f0eee8' }}>
        <button onClick={() => navigate('/dashboard')} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#ffffff', border: '1px solid #ececec', display: 'grid', placeItems: 'center', padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>My Office</div>
        <button
          onClick={() => navigate('/office/me')}
          style={{ background: '#e8f5f0', color: '#1a7f5e', border: 'none', padding: '8px 14px', borderRadius: 100, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </button>
      </section>

      {/* Hero — flat on warm-beige page */}
      <section style={{ padding: '14px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 4 }}>
          <div style={{
            position: 'relative',
            width: 84,
            height: 84,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #a8c9b8 0%, #7ab8a8 100%)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: '-0.02em',
            flexShrink: 0,
            overflow: 'visible',
            boxShadow: '0 4px 14px rgba(15,29,27,0.12)',
          }}>
            {/* Initials underneath; img overlays. If the img fails
                to load, onError hides it and the initials show
                through against the sage gradient. */}
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>
              BS
            </span>
            <img
              src={OFFICE_PHOTO_URL}
              alt="Bright Smile Dental"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span style={{ position: 'absolute', bottom: 3, right: 3, width: 22, height: 22, borderRadius: '50%', background: '#1a7f5e', border: '2.5px solid #fff', display: 'grid', placeItems: 'center', zIndex: 2 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <button
              onClick={notImpl('Upload logo')}
              aria-label="Upload logo"
              style={{ position: 'absolute', top: -3, right: -3, width: 26, height: 26, borderRadius: '50%', background: '#1a1a1a', border: '2.5px solid #f9f8f6', display: 'grid', placeItems: 'center', padding: 0, zIndex: 3 }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 22, color: '#0f1a16', letterSpacing: '-0.02em', lineHeight: 1.15, minWidth: 0 }}>
                Bright Smile Dental
              </div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: '#9aa5a1', fontWeight: 500, letterSpacing: '-0.01em', flexShrink: 0 }}>
                3.1 mi
              </div>
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#6b7875', fontWeight: 500, letterSpacing: '-0.01em', marginTop: 2 }}>
              Houston, TX · Galleria area
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#0f1a16', fontWeight: 600, letterSpacing: '-0.01em' }}>
              <span style={{ color: '#f4b740', fontSize: 22, lineHeight: 1 }}>★</span>
              <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>4.8</span>
              <span style={{ color: '#9aa5a1', fontWeight: 500, fontSize: 13, letterSpacing: '-0.01em' }}>(18 reviews)</span>
            </div>
          </div>
        </div>

        {/* Stats tiles row — separated by top border */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f3f3f3' }}>
          {HERO_STATS.map((s) => (
            <OfficeStatTile key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </section>

      {/* Sticky underline tabs */}
      <section style={{ position: 'sticky', top: 60, zIndex: 30, background: '#ffffff', padding: '4px 20px 0' }}>
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #f0eee8' }}>
          {[
            { k: 'overview', label: 'Overview' },
            { k: 'shifts', label: 'Jobs' },
            { k: 'reviews', label: 'Reviews' },
            { k: 'photos', label: 'Photos' },
          ].map((t) => {
            const active = activeTab === t.k;
            return (
              <button
                key={t.k}
                onClick={() => setActiveTab(t.k)}
                style={{ background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: active ? '#0f1a16' : '#9aa5a1', padding: '12px 0', position: 'relative', letterSpacing: '-0.01em' }}
              >
                {t.label}
                {active && <span style={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, background: '#1a7f5e', borderRadius: 2 }} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab content — white section cards on warm-beige */}
      <section style={{ padding: '14px 0 30px' }}>
        {activeTab === 'overview' && (
          <>
            <ProfileSection title="About" trailing={<EditPill onClick={notImpl('Edit about')} />}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#444', letterSpacing: '-0.01em', lineHeight: 1.55, whiteSpace: 'pre-line', display: aboutOpen ? 'block' : '-webkit-box', WebkitLineClamp: aboutOpen ? 'unset' : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {ABOUT}
              </div>
              <button
                onClick={() => setAboutOpen((o) => !o)}
                style={{ background: 'none', border: 'none', color: '#1a7f5e', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: '-0.01em', padding: '8px 0 0', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                {aboutOpen ? 'See less' : 'See more'}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: aboutOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </ProfileSection>

            <ProfileSection title="Practice details" trailing={<EditPill onClick={notImpl('Edit details')} />}>
              {DETAILS.map((d, i) => (
                <DetailRow key={d.label} label={d.label} value={d.value} isLast={i === DETAILS.length - 1} />
              ))}
            </ProfileSection>

            <ProfileSection title="Location" noPadding trailing={<EditPill onClick={notImpl('Edit location')} />}>
              <div style={{ position: 'relative', height: 180, overflow: 'hidden', borderRadius: 14, marginBottom: 14, background: '#f9f8f6' }}>
                <img src={MAP_URL} alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', width: 38, height: 38, background: '#1a7f5e', borderRadius: '50% 50% 50% 0', transform: 'translate(-50%, -50%) rotate(-45deg)', boxShadow: '0 4px 14px rgba(0,0,0,0.28)' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: 12, height: 12, background: '#fff', borderRadius: '50%', transform: 'translate(-50%, -50%)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#1a1a1a', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.5 }}>
                  4820 Westheimer Rd<br />Houston, TX 77056
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#1a7f5e', letterSpacing: '-0.02em' }}>3.1 mi</div>
              </div>
            </ProfileSection>
          </>
        )}

        {activeTab === 'shifts' && (
          <div style={{ padding: '0 16px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <SubtabPill active={activeSub === 'temp'} onClick={() => setActiveSub('temp')} variant="temp">
                Temp shifts <CountChip active={activeSub === 'temp'}>{TEMP_SHIFTS.length}</CountChip>
              </SubtabPill>
              <SubtabPill active={activeSub === 'perm'} onClick={() => setActiveSub('perm')} variant="perm">
                Permanent <CountChip active={activeSub === 'perm'} variant="perm">{PERM_JOBS.length}</CountChip>
              </SubtabPill>
            </div>

            {activeSub === 'temp' && TEMP_SHIFTS.map((s) => (
              <div key={s.id} style={{ marginBottom: 12 }}>
                <TempShiftCard
                  shift={s}
                  hideOffice
                  onApply={() => navigate(`/shift/${s.id}`)}
                />
              </div>
            ))}
            {activeSub === 'perm' && PERM_JOBS.map((j) => (
              <div key={j.id} style={{ marginBottom: 12 }}>
                <PermJobCard
                  job={j}
                  hideOffice
                  onTap={() => navigate(`/shift/${j.id}`)}
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProfileSection title="Reviews">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid #f3f3f3', marginBottom: 14 }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 44, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em' }}>4.8</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#f4b740', fontSize: 15, letterSpacing: 1, marginBottom: 3 }}>★★★★★</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#9aa5a1', fontWeight: 600 }}>Based on 18 provider reviews</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {RATING_BREAKDOWN.map((r) => (
                <div key={r.n} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <span style={{ width: 14, color: '#9aa5a1', fontWeight: 700, textAlign: 'right' }}>{r.n}</span>
                  <div style={{ flex: 1, height: 5, background: '#f3f4f6', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: '#f4b740', borderRadius: 100, width: `${r.p}%` }} />
                  </div>
                  <span style={{ width: 32, color: '#9aa5a1', fontWeight: 600, textAlign: 'right' }}>{r.p}%</span>
                </div>
              ))}
            </div>
            {REVIEWS.map((r, i) => (
              <ReviewRow key={r.logo} review={r} isLast={i === REVIEWS.length - 1} />
            ))}
          </ProfileSection>
        )}

        {activeTab === 'photos' && (
          <ProfileSection title={`Photos · ${PHOTOS.length}`} trailing={<EditPill label="+ Add" onClick={notImpl('Add photo')} />}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {PHOTOS.map((p) => (
                <div
                  key={p.label}
                  style={{
                    position: 'relative',
                    aspectRatio: p.featured ? '2 / 1' : '1 / 1',
                    gridColumn: p.featured ? 'span 2' : 'auto',
                    borderRadius: 14,
                    overflow: 'hidden',
                    background: '#ffffff',
                  }}
                >
                  <img src={p.src} alt={p.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45))', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: 10, left: 12, color: '#fff', fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, fontWeight: 700, letterSpacing: '-0.01em' }}>{p.label}</div>
                </div>
              ))}
            </div>
          </ProfileSection>
        )}
      </section>

      <BottomNav />
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function OfficeStatTile({ label, value }) {
  return (
    <div style={{ flex: 1, background: '#ffffff', border: '1px solid #f0eee8', borderRadius: 12, padding: '10px 8px', textAlign: 'center', minWidth: 0 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a8a8a', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1, letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  );
}

function ProfileSection({ title, children, trailing, noPadding }) {
  return (
    <div style={{ background: '#ffffff', margin: '0 16px 12px', borderRadius: 20, padding: noPadding ? '18px 18px 18px' : '18px 18px 20px', border: '1px solid #f3f3f3' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#1a1a1a', letterSpacing: '-0.02em' }}>{title}</div>
        {trailing}
      </div>
      {children}
    </div>
  );
}

function EditPill({ label = 'Edit', onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#1a7f5e', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, letterSpacing: '-0.01em' }}>
      {label}
    </button>
  );
}

function DetailRow({ label, value, isLast }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: isLast ? 'none' : '1px solid #f3f3f3', fontFamily: "'DM Sans', sans-serif", fontSize: 13, letterSpacing: '-0.01em' }}>
      <span style={{ color: '#6b7875', fontWeight: 500 }}>{label}</span>
      <span style={{ color: '#1a1a1a', fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function SubtabPill({ active, onClick, variant, children }) {
  const isPerm = variant === 'perm';
  const bg = active ? (isPerm ? '#7c5aa8' : '#e8f5f0') : (isPerm ? '#faf7fc' : '#f9f8f6');
  const color = active ? (isPerm ? '#fff' : '#1a7f5e') : (isPerm ? '#7c5aa8' : '#6b7280');
  const borderColor = active ? (isPerm ? '#7c5aa8' : '#cfe8de') : (isPerm ? '#efe8f5' : '#efede8');
  return (
    <button
      onClick={onClick}
      style={{ flex: 1, padding: '9px 10px', borderRadius: 100, fontFamily: 'inherit', fontSize: 12, fontWeight: 700, border: `1px solid ${borderColor}`, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '-0.01em' }}
    >
      {children}
    </button>
  );
}

function CountChip({ active, variant, children }) {
  const isPerm = variant === 'perm';
  const bg = active ? (isPerm ? 'rgba(255,255,255,0.25)' : '#ffffff') : '#ffffff';
  const color = active ? (isPerm ? '#fff' : '#1a7f5e') : '#6b7280';
  return (
    <span style={{ fontSize: 10, background: bg, color, padding: '1px 7px', borderRadius: 100, fontWeight: 700, letterSpacing: '0.04em' }}>{children}</span>
  );
}

function ReviewRow({ review, isLast }) {
  return (
    <div style={{ padding: '14px 0', borderBottom: isLast ? 'none' : '1px solid #f3f3f3' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #c8a8d4, #e8a87c)', display: 'grid', placeItems: 'center', color: '#fff', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '-0.01em', flexShrink: 0 }}>{review.logo}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{review.name}</div>
          <div style={{ fontSize: 11, color: '#9aa5a1', marginTop: 1 }}>{review.when}</div>
        </div>
        <div style={{ color: '#f4b740', fontSize: 12, letterSpacing: 0.5 }}>{'★'.repeat(review.stars)}</div>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.55, color: '#6b7875' }}>{review.text}</div>
    </div>
  );
}
