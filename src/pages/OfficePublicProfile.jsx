import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ShiftDetailModal from '../components/ShiftDetailModal';
import PermanentJobModal from '../components/PermanentJobModal';

const styles = `
.kazi-opp { --green: #1a7f5e; --green-soft: #e8f5f0; --orange: #F97316; --gold-bg: #dcfce7; --gold-text: #166534; --amber: #f4b740; --amber-soft: #fef6e4; --coral: #e8734a; --coral-soft: #fdeee7; --purple: #7c5aa8; --purple-soft: #efe8f5; --bg: #f9f8f6; --card: #fff; --text: #1a1a1a; --text-mid: #6b7280; --text-light: #9ca3af; --border: #e5e7eb; --border-soft: #f3f4f6; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; padding-bottom: 40px; max-width: 480px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 40px rgba(0,0,0,.06); position: relative; }
.kazi-opp * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
.kazi-opp button { font-family: inherit; cursor: pointer; }
.kazi-opp .topbar { position: sticky; top: 0; z-index: 50; background: var(--card); padding: 14px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-soft); }
.kazi-opp .icon-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.kazi-opp .icon-btn svg { width: 16px; height: 16px; stroke: var(--text); stroke-width: 2; fill: none; }
.kazi-opp .icon-btn.saved { background: var(--coral-soft); }
.kazi-opp .icon-btn.saved svg { stroke: var(--coral); fill: var(--coral); }
.kazi-opp .topbar-title { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 18px; flex: 1; letter-spacing: -.02em; }
.kazi-opp .hero-card { text-align: center; padding: 20px 20px 24px; position: relative; }
.kazi-opp .logo-wrap { position: relative; width: 96px; height: 96px; margin: 0 auto 18px; }
.kazi-opp .office-logo { width: 96px; height: 96px; border-radius: 24px; background: linear-gradient(135deg,#a8c9b8,#7ab8a8); display: flex; align-items: center; justify-content: center; color: white; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 30px; letter-spacing: -.02em; box-shadow: 0 6px 20px rgba(26,127,94,.15); }
.kazi-opp .verified-badge { position: absolute; bottom: -2px; right: -2px; width: 26px; height: 26px; background: var(--green); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--card); }
.kazi-opp .verified-badge svg { width: 12px; height: 12px; stroke: white; stroke-width: 3; fill: none; }
.kazi-opp .office-name { font-family: 'DM Sans', sans-serif; font-size: 22px; font-weight: 700; letter-spacing: -.02em; line-height: 1.15; margin-bottom: 6px; }
.kazi-opp .office-type { font-size: 14px; color: var(--text-light); margin-bottom: 14px; }
.kazi-opp .rating-row { display: inline-flex; align-items: center; gap: 6px; background: var(--card); border: 1.5px solid var(--border); border-radius: 100px; padding: 7px 16px; font-size: 14px; font-weight: 700; }
.kazi-opp .tabs { display: flex; gap: 4px; background: var(--card); margin: 14px 20px 0; border-radius: 14px; padding: 5px; border: 1.5px solid var(--border); }
.kazi-opp .tab { flex: 1; background: none; border: none; padding: 10px 6px; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; letter-spacing: -.01em; color: var(--text-mid); cursor: pointer; border-radius: 10px; }
.kazi-opp .tab.active { background: var(--green); color: white; }
.kazi-opp .section { background: var(--card); margin: 14px 20px 0; border-radius: 14px; padding: 20px; border: 1.5px solid var(--border); }
.kazi-opp .section-title { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 18px; letter-spacing: -.02em; margin-bottom: 12px; }
.kazi-opp .about-text { font-size: 14px; line-height: 1.6; color: var(--text-mid); }
.kazi-opp .about-text.clamped { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.kazi-opp .see-more-btn { background: none; border: none; color: var(--green); font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; padding: 8px 0 0; display: inline-flex; align-items: center; gap: 4px; }
.kazi-opp .see-more-btn svg { width: 11px; height: 11px; stroke: var(--green); stroke-width: 2.5; fill: none; transition: transform .2s; }
.kazi-opp .see-more-btn.open svg { transform: rotate(180deg); }
.kazi-opp .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--border-soft); font-size: 13px; }
.kazi-opp .detail-row:last-child { border-bottom: none; }
.kazi-opp .detail-label { color: var(--text-mid); font-weight: 500; }
.kazi-opp .detail-val { font-weight: 700; color: var(--text); }
.kazi-opp .location-card { background: var(--card); margin: 14px 20px 0; border-radius: 14px; border: 1.5px solid var(--border); overflow: hidden; }
.kazi-opp .map-preview { height: 180px; background: linear-gradient(135deg,#dfe9dc 0%,#c8dcc4 100%); position: relative; display: flex; align-items: center; justify-content: center; }
.kazi-opp .map-preview::before { content: ''; position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.4) 1px,transparent 1px); background-size: 32px 32px; }
.kazi-opp .map-pin { width: 44px; height: 44px; background: var(--green); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); position: relative; z-index: 2; box-shadow: 0 4px 14px rgba(0,0,0,.18); }
.kazi-opp .map-pin::after { content: ''; width: 14px; height: 14px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); }
.kazi-opp .loc-meta { padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 14px; }
.kazi-opp .loc-addr { font-size: 14px; color: var(--text); line-height: 1.5; font-weight: 500; }
.kazi-opp .loc-dist { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -.02em; color: var(--green); flex-shrink: 0; }
.kazi-opp .subtabs { display: flex; gap: 8px; margin-bottom: 14px; }
.kazi-opp .subtab { flex: 1; padding: 9px 10px; border-radius: 100px; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; border: 1.5px solid var(--border); background: var(--bg); color: var(--text-mid); display: flex; align-items: center; justify-content: center; gap: 6px; }
.kazi-opp .subtab.active { background: var(--green-soft); color: var(--green); border-color: #cfe8de; }
.kazi-opp .subtab.perm { color: var(--purple); border-color: var(--purple-soft); background: #faf7fc; }
.kazi-opp .subtab.perm.active { background: var(--purple); color: white; border-color: var(--purple); }
.kazi-opp .subtab-count { font-size: 10px; background: var(--card); color: var(--text-mid); padding: 1px 7px; border-radius: 100px; font-weight: 700; letter-spacing: .04em; }
.kazi-opp .subtab.active .subtab-count { background: var(--card); color: var(--green); }
.kazi-opp .subtab.perm.active .subtab-count { background: rgba(255,255,255,.25); color: white; }
.kazi-opp .shift-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border-soft); align-items: center; cursor: pointer; }
.kazi-opp .shift-item:last-child { border-bottom: none; padding-bottom: 0; }
.kazi-opp .shift-item:first-child { padding-top: 0; }
.kazi-opp .shift-date { width: 54px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 8px 4px; text-align: center; flex-shrink: 0; }
.kazi-opp .shift-date.gold { background: var(--amber-soft); border-color: #f5e3b8; }
.kazi-opp .shift-day-num { font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -.02em; line-height: 1; }
.kazi-opp .shift-day-name { font-size: 9px; font-weight: 700; color: var(--text-light); text-transform: uppercase; margin-top: 3px; }
.kazi-opp .shift-info { flex: 1; min-width: 0; }
.kazi-opp .shift-role { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 2px; }
.kazi-opp .shift-meta { font-size: 11px; color: var(--text-light); margin-bottom: 6px; }
.kazi-opp .shift-pay { font-size: 13px; font-weight: 700; letter-spacing: -.01em; color: var(--green); display: inline-block; margin-right: 8px; }
.kazi-opp .applicant-count { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 100px; background: var(--bg); color: var(--text-mid); border: 1px solid var(--border); }
.kazi-opp .applicant-count svg { width: 10px; height: 10px; stroke: var(--text-mid); stroke-width: 2; fill: none; }
.kazi-opp .shift-arrow { width: 36px; height: 36px; border-radius: 50%; background: var(--green-soft); border: 1.5px solid #cfe8de; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.kazi-opp .shift-arrow svg { width: 14px; height: 14px; stroke: var(--green); stroke-width: 3; fill: none; }
.kazi-opp .perm-card { background: linear-gradient(135deg,#faf7fc,#ffffff); border: 1.5px solid var(--purple-soft); border-radius: 14px; padding: 16px; margin-bottom: 10px; position: relative; }
.kazi-opp .perm-card:last-child { margin-bottom: 0; }
.kazi-opp .perm-badge { position: absolute; top: 12px; right: 12px; background: var(--purple); color: white; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 100px; text-transform: uppercase; letter-spacing: .06em; }
.kazi-opp .perm-title { font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 3px; letter-spacing: -.02em; }
.kazi-opp .perm-type { font-size: 11px; color: var(--text-light); font-weight: 600; margin-bottom: 10px; }
.kazi-opp .perm-salary { font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: -.02em; color: var(--green); margin-bottom: 10px; }
.kazi-opp .perm-benefits { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
.kazi-opp .benefit { background: var(--card); border: 1px solid var(--border); color: var(--text-mid); font-size: 10px; font-weight: 700; padding: 4px 9px; border-radius: 100px; }
.kazi-opp .rating-summary { display: flex; gap: 16px; align-items: center; padding: 4px 0 16px; border-bottom: 1px solid var(--border-soft); margin-bottom: 14px; }
.kazi-opp .rating-big { font-family: 'DM Sans', sans-serif; font-size: 44px; font-weight: 700; line-height: 1; letter-spacing: -.03em; }
.kazi-opp .rating-meta { flex: 1; }
.kazi-opp .rating-stars { color: #f4b740; font-size: 15px; letter-spacing: 1px; margin-bottom: 3px; }
.kazi-opp .rating-count { font-size: 12px; color: var(--text-light); font-weight: 600; }
.kazi-opp .breakdown { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.kazi-opp .bd-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.kazi-opp .bd-num { width: 14px; color: var(--text-light); font-weight: 700; text-align: right; }
.kazi-opp .bd-bar { flex: 1; height: 5px; background: var(--border-soft); border-radius: 100px; overflow: hidden; }
.kazi-opp .bd-fill { height: 100%; background: #f4b740; border-radius: 100px; }
.kazi-opp .bd-pct { width: 32px; color: var(--text-light); font-weight: 600; text-align: right; }
.kazi-opp .review { padding: 14px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-opp .review:last-child { border-bottom: none; }
.kazi-opp .review-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.kazi-opp .reviewer-avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#c8a8d4,#e8a87c); display: flex; align-items: center; justify-content: center; color: white; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: -.01em; flex-shrink: 0; }
.kazi-opp .reviewer-info { flex: 1; }
.kazi-opp .reviewer-name { font-size: 13px; font-weight: 700; }
.kazi-opp .review-date { font-size: 11px; color: var(--text-light); margin-top: 1px; }
.kazi-opp .review-stars { color: #f4b740; font-size: 12px; letter-spacing: .5px; }
.kazi-opp .review-text { font-size: 13px; line-height: 1.55; color: var(--text-mid); }
.kazi-opp .gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.kazi-opp .photo { aspect-ratio: 1; border-radius: 12px; position: relative; overflow: hidden; }
.kazi-opp .photo.p1 { background: linear-gradient(135deg,#a8d4e8,#7ab8d4); }
.kazi-opp .photo.p2 { background: linear-gradient(135deg,#c8e8d4,#88c9a1); }
.kazi-opp .photo.p3 { background: linear-gradient(135deg,#e8d4a8,#d4b888); }
.kazi-opp .photo.p4 { background: linear-gradient(135deg,#d4a8c8,#b888a8); }
.kazi-opp .photo.featured { grid-column: span 2; aspect-ratio: 2/1; }
.kazi-opp .photo-label { position: absolute; bottom: 8px; left: 10px; color: white; font-size: 11px; font-weight: 700; text-shadow: 0 1px 4px rgba(0,0,0,.3); }
`;

const TEMP_SHIFTS = [
  { id: 'sh-11', day: 11, name: 'Fri', gold: true, role: 'Dental Hygienist', meta: '8:00 AM – 5:00 PM · 8 hrs', pay: '$55/hr', applicants: 8, isRapidFill: true },
  { id: 'sh-14', day: 14, name: 'Mon', role: 'Dental Assistant', meta: '8:00 AM – 4:00 PM · 7 hrs', pay: '$28/hr', applicants: 3 },
  { id: 'sh-17', day: 17, name: 'Thu', role: 'Front Desk', meta: '9:00 AM – 5:00 PM · 7 hrs', pay: '$22/hr', applicants: 0 },
];

const PERM_JOBS = [
  { id: 'perm-1', badge: 'Full-Time', title: 'Dental Hygienist', type: 'Full-Time · Start date flexible', salary: '$65K – $78K / year', benefits: ['Health', 'Dental', '401(k)', 'PTO', 'CE Allowance'] },
  { id: 'perm-2', badge: 'Part-Time', title: 'Front Desk Coordinator', type: 'Part-Time · Starts May 1', salary: '$22 – $26 / hour', benefits: ['Flexible Hours', 'PTO'] },
];

const ABOUT = `Modern general dentistry practice in the Galleria area of Houston. Busy 4-chair office with a strong focus on patient experience, hygiene excellence, and a welcoming team culture. We hire for same-day coverage and longer engagements.

Our team has been serving the Houston community for over a decade. Dr. Patel leads a compassionate team dedicated to making every patient feel at home. We pride ourselves on modern equipment, digital workflows, and continuing education — our staff attend 40+ hours of CE annually.

We're looking for professionals who are reliable, friendly, and take pride in their craft. Same-day bookings preferred for hygienists, and we frequently need coverage for vacations, maternity leave, and busy seasons. If you're a great fit, we'll invite you back regularly.`;

export default function OfficePublicProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSub, setActiveSub] = useState('temp');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [saved, setSaved] = useState(true);
  const [selectedTempShift, setSelectedTempShift] = useState(null);
  const [selectedPermJob, setSelectedPermJob] = useState(null);

  const handleShare = () => {
    if (navigator.share) navigator.share({ url: window.location.href }).catch(() => {});
    else { navigator.clipboard?.writeText(window.location.href); alert('Link copied'); }
  };

  return (
    <div className="kazi-opp">
      <style>{styles}</style>
      <TopBar role="provider" />
      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="topbar-title">Office</div>
        <button className="icon-btn" onClick={handleShare} aria-label="Share">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
        </button>
        <button className={`icon-btn ${saved ? 'saved' : ''}`} onClick={() => setSaved((s) => !s)} aria-label="Save">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </button>
      </div>

      <div className="hero-card">
        <div className="logo-wrap">
          <div className="office-logo">BS</div>
          <div className="verified-badge"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
        </div>
        <div className="office-name">Bright Smile Dental</div>
        <div className="office-type">Houston, TX · Galleria area</div>
        <div className="rating-row">
          <span style={{ color: '#f4b740', fontSize: '15px' }}>★</span>
          <span style={{ color: 'var(--text)', fontWeight: 700, letterSpacing: '-0.02em' }}>4.8</span>
          <span style={{ color: 'var(--text-light)', fontWeight: 500, letterSpacing: '-0.01em' }}>(18 reviews)</span>
        </div>
      </div>

      <div className="tabs">
        {[
          { k: 'overview', label: 'Overview' },
          { k: 'shifts', label: 'Jobs' },
          { k: 'reviews', label: 'Reviews' },
          { k: 'photos', label: 'Photos' },
        ].map((t) => (
          <button key={t.k} className={`tab ${activeTab === t.k ? 'active' : ''}`} onClick={() => setActiveTab(t.k)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="section">
            <div className="section-title">About</div>
            <div className={`about-text ${aboutOpen ? '' : 'clamped'}`} style={{ whiteSpace: 'pre-line' }}>{ABOUT}</div>
            <button className={`see-more-btn ${aboutOpen ? 'open' : ''}`} onClick={() => setAboutOpen((o) => !o)}>
              {aboutOpen ? 'See less' : 'See more'}
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>
          <div className="section">
            <div className="section-title">Practice Details</div>
            <div className="detail-row"><span className="detail-label">Hours</span><span className="detail-val">Mon–Fri 8am–5pm</span></div>
            <div className="detail-row"><span className="detail-label">Chairs</span><span className="detail-val">4</span></div>
            <div className="detail-row"><span className="detail-label">Software</span><span className="detail-val">Dentrix · Dexis</span></div>
            <div className="detail-row"><span className="detail-label">Parking</span><span className="detail-val">Free lot</span></div>
            <div className="detail-row"><span className="detail-label">Dress code</span><span className="detail-val">Navy scrubs</span></div>
            <div className="detail-row"><span className="detail-label">Lunch</span><span className="detail-val">Provided</span></div>
          </div>
          <div className="location-card">
            <div className="map-preview"><div className="map-pin" /></div>
            <div className="loc-meta">
              <div className="loc-addr">4820 Westheimer Rd<br />Houston, TX 77056</div>
              <div className="loc-dist">3.1 mi</div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'shifts' && (
        <div className="section">
          <div className="subtabs">
            <button className={`subtab ${activeSub === 'temp' ? 'active' : ''}`} onClick={() => setActiveSub('temp')}>
              Temp Shifts <span className="subtab-count">{TEMP_SHIFTS.length}</span>
            </button>
            <button className={`subtab perm ${activeSub === 'perm' ? 'active' : ''}`} onClick={() => setActiveSub('perm')}>
              Permanent <span className="subtab-count">{PERM_JOBS.length}</span>
            </button>
          </div>
          {activeSub === 'temp' && TEMP_SHIFTS.map((s) => (
            <div key={s.id} className="shift-item" onClick={() => setSelectedTempShift(s)}>
              <div className={`shift-date ${s.gold ? 'gold' : ''}`}>
                <div className="shift-day-num">{s.day}</div>
                <div className="shift-day-name">{s.name}</div>
              </div>
              <div className="shift-info">
                <div className="shift-role">{s.role}</div>
                <div className="shift-meta">{s.meta}</div>
                <span className="shift-pay">{s.pay}</span>
                <span className="applicant-count">
                  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  {s.applicants} applicants
                </span>
              </div>
              <button className="shift-arrow" aria-label="Open">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          ))}
          {activeSub === 'perm' && PERM_JOBS.map((j) => (
            <div key={j.id} className="perm-card" onClick={() => setSelectedPermJob(j)} style={{ cursor: 'pointer' }}>
              <span className="perm-badge">{j.badge}</span>
              <div className="perm-title">{j.title}</div>
              <div className="perm-type">{j.type}</div>
              <div className="perm-salary">{j.salary}</div>
              <div className="perm-benefits">{j.benefits.map((b) => <span key={b} className="benefit">{b}</span>)}</div>
              <div style={{ textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em', color: '#7c5aa8', marginTop: 4 }}>
                View details →
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="section">
          <div className="section-title">Reviews</div>
          <div className="rating-summary">
            <div className="rating-big">4.8</div>
            <div className="rating-meta"><div className="rating-stars">★★★★★</div><div className="rating-count">Based on 18 provider reviews</div></div>
          </div>
          <div className="breakdown">
            {[{ n: 5, p: 85 }, { n: 4, p: 10 }, { n: 3, p: 3 }, { n: 2, p: 2 }, { n: 1, p: 0 }].map((r) => (
              <div key={r.n} className="bd-row">
                <span className="bd-num">{r.n}</span>
                <div className="bd-bar"><div className="bd-fill" style={{ width: `${r.p}%` }} /></div>
                <span className="bd-pct">{r.p}%</span>
              </div>
            ))}
          </div>
          {[
            { logo: 'SK', name: 'Sarah K., RDH', when: '2 weeks ago', text: 'Great office to work at. Dr. Patel is super organized and the team is welcoming. Got lunch provided and they paid out on time.' },
            { logo: 'MT', name: 'Marcus T., RDA', when: '1 month ago', text: "Modern setup with Dentrix and digital imaging. Clean, efficient, and well-run. I'd come back any time they need coverage." },
            { logo: 'JR', name: 'Jasmine R., RDH', when: '2 months ago', text: 'Front desk was prepared for my arrival, parking was easy. A+ office for RDHs.' },
          ].map((r) => (
            <div key={r.logo} className="review">
              <div className="review-head">
                <div className="reviewer-avatar">{r.logo}</div>
                <div className="reviewer-info"><div className="reviewer-name">{r.name}</div><div className="review-date">{r.when}</div></div>
                <div className="review-stars">★★★★★</div>
              </div>
              <div className="review-text">{r.text}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="section">
          <div className="section-title">Photos · 7</div>
          <div className="gallery">
            <div className="photo p1 featured"><div className="photo-label">Reception</div></div>
            <div className="photo p2"><div className="photo-label">Operatory 1</div></div>
            <div className="photo p3"><div className="photo-label">Operatory 2</div></div>
            <div className="photo p4"><div className="photo-label">Sterilization</div></div>
            <div className="photo p1"><div className="photo-label">Waiting area</div></div>
            <div className="photo p2"><div className="photo-label">Break room</div></div>
            <div className="photo p3"><div className="photo-label">Exterior</div></div>
          </div>
        </div>
      )}

      <ShiftDetailModal open={!!selectedTempShift} shift={selectedTempShift} onClose={() => setSelectedTempShift(null)} />
      <PermanentJobModal open={!!selectedPermJob} job={selectedPermJob} onClose={() => setSelectedPermJob(null)} />
    </div>
  );
}
