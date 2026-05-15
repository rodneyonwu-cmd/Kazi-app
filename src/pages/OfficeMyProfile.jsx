import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';

const styles = `
.kazi-omp { --green: #1a7f5e; --green-dark: #0f1d1b; --green-deep: #1a2e2c; --green-soft: #e8f5f0; --orange: #F97316; --gold-bg: #dcfce7; --gold-text: #166534; --amber: #f4b740; --amber-soft: #fef6e4; --coral: #e8734a; --coral-soft: #fdeee7; --purple: #7c5aa8; --purple-soft: #efe8f5; --bg: #f9f8f6; --card: #fff; --text: #1a1a1a; --text-mid: #6b7280; --text-light: #9ca3af; --border: #e5e7eb; --border-soft: #f3f4f6; --chrome: #efede8; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; padding-bottom: 110px; max-width: 480px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 40px rgba(0,0,0,.06); position: relative; }
.kazi-omp * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
.kazi-omp button { font-family: inherit; cursor: pointer; }
.kazi-omp .topbar { position: sticky; top: 0; z-index: 50; background: var(--card); padding: 14px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-soft); }
.kazi-omp .icon-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.kazi-omp .icon-btn svg { width: 16px; height: 16px; stroke: var(--text); stroke-width: 2; fill: none; }
.kazi-omp .topbar-title { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 18px; flex: 1; letter-spacing: -.02em; }
.kazi-omp .preview-btn { background: var(--green-soft); color: var(--green); border: none; padding: 8px 14px; border-radius: 100px; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.kazi-omp .preview-btn svg { width: 12px; height: 12px; stroke: var(--green); stroke-width: 2.5; fill: none; }

.kazi-omp .hero { position: relative; }
.kazi-omp .hero-cover { height: 130px; position: relative; overflow: hidden; background: linear-gradient(135deg, #1a2e2c, #0f1d1b); }
.kazi-omp .hero-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.kazi-omp .hero-cover-grad { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(15,29,27,0) 0%, rgba(15,29,27,0.55) 65%, #0f1d1b 100%); }
.kazi-omp .hero-cover-edit { position: absolute; top: 12px; right: 14px; background: rgba(255,255,255,0.16); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.22); color: white; font-family: inherit; font-size: 11.5px; font-weight: 700; letter-spacing: -.01em; padding: 7px 12px 7px 9px; border-radius: 100px; display: inline-flex; align-items: center; gap: 5px; cursor: pointer; }
.kazi-omp .hero-cover-edit svg { width: 12px; height: 12px; stroke: white; stroke-width: 2.5; fill: none; }
.kazi-omp .hero-content { background: linear-gradient(180deg, #0f1d1b 0%, #1a2e2c 100%); color: white; padding: 0 20px 22px; position: relative; }
.kazi-omp .hero-top { display: flex; align-items: flex-end; gap: 14px; margin-top: -34px; position: relative; }
.kazi-omp .hero-logo-wrap { position: relative; width: 78px; height: 78px; flex-shrink: 0; }
.kazi-omp .office-logo { width: 78px; height: 78px; border-radius: 20px; background: linear-gradient(135deg, #a8c9b8, #7ab8a8); display: flex; align-items: center; justify-content: center; color: #0f1d1b; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 26px; letter-spacing: -.02em; border: 3px solid #0f1d1b; box-shadow: 0 6px 16px rgba(0,0,0,0.25); }
.kazi-omp .verified-badge { position: absolute; bottom: -2px; right: -2px; width: 22px; height: 22px; background: var(--green); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #0f1d1b; }
.kazi-omp .verified-badge svg { width: 10px; height: 10px; stroke: white; stroke-width: 3; fill: none; }
.kazi-omp .photo-edit { position: absolute; top: -2px; right: -2px; width: 24px; height: 24px; background: var(--text); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid #0f1d1b; cursor: pointer; z-index: 2; }
.kazi-omp .photo-edit svg { width: 11px; height: 11px; stroke: white; stroke-width: 2.5; fill: none; }
.kazi-omp .hero-meta { flex: 1; min-width: 0; padding-bottom: 6px; }
.kazi-omp .office-name { font-family: 'DM Sans', sans-serif; font-size: 19px; font-weight: 700; letter-spacing: -.02em; line-height: 1.15; color: white; margin: 0; display: inline-flex; align-items: center; gap: 7px; }
.kazi-omp .office-type { font-size: 12.5px; color: rgba(255,255,255,0.7); font-weight: 500; letter-spacing: -.01em; margin-top: 4px; }
.kazi-omp .hero-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 7px; margin-top: 18px; }
.kazi-omp .hero-stat { text-align: left; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.09); border-radius: 12px; padding: 9px 10px 11px; }
.kazi-omp .hero-stat-value { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 16px; line-height: 1; letter-spacing: -.02em; color: white; display: flex; align-items: center; gap: 3px; }
.kazi-omp .hero-stat-star { color: var(--amber); font-size: 13px; line-height: 1; }
.kazi-omp .hero-stat-label { font-size: 9.5px; color: rgba(255,255,255,0.6); font-weight: 700; letter-spacing: .06em; text-transform: uppercase; margin-top: 6px; }

.kazi-omp .tabs { display: flex; gap: 4px; background: var(--card); margin: 14px 20px 0; border-radius: 14px; padding: 4px; border: 1px solid var(--chrome); box-shadow: 0 1px 2px rgba(15,29,27,0.04); }
.kazi-omp .tab { flex: 1; background: none; border: none; padding: 10px 6px; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; letter-spacing: -.01em; color: var(--text-mid); cursor: pointer; border-radius: 10px; }
.kazi-omp .tab.active { background: var(--green); color: white; }
.kazi-omp .section { background: var(--card); margin: 14px 20px 0; border-radius: 16px; padding: 18px 18px 20px; border: 1px solid var(--chrome); box-shadow: 0 1px 2px rgba(15,29,27,0.04); }
.kazi-omp .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.kazi-omp .section-title { font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 18px; letter-spacing: -.02em; }
.kazi-omp .edit-btn { background: none; border: none; color: var(--green); font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.kazi-omp .about-text { font-size: 14px; line-height: 1.6; color: var(--text-mid); }
.kazi-omp .about-text.clamped { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.kazi-omp .see-more-btn { background: none; border: none; color: var(--green); font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; padding: 8px 0 0; display: inline-flex; align-items: center; gap: 4px; }
.kazi-omp .see-more-btn svg { width: 11px; height: 11px; stroke: var(--green); stroke-width: 2.5; fill: none; transition: transform .2s; }
.kazi-omp .see-more-btn.open svg { transform: rotate(180deg); }
.kazi-omp .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 11px 0; border-bottom: 1px solid var(--border-soft); font-size: 13px; }
.kazi-omp .detail-row:last-child { border-bottom: none; }
.kazi-omp .detail-label { color: var(--text-mid); font-weight: 500; }
.kazi-omp .detail-val { font-weight: 700; color: var(--text); }

.kazi-omp .location-card { background: var(--card); margin: 14px 20px 0; border-radius: 16px; border: 1px solid var(--chrome); overflow: hidden; box-shadow: 0 1px 2px rgba(15,29,27,0.04); }
.kazi-omp .map-preview { height: 180px; position: relative; overflow: hidden; background: var(--bg); }
.kazi-omp .map-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.kazi-omp .map-pin { width: 38px; height: 38px; background: var(--green); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); position: absolute; top: 50%; left: 50%; margin: -19px 0 0 -19px; z-index: 2; box-shadow: 0 4px 14px rgba(0,0,0,.28); }
.kazi-omp .map-pin::after { content: ''; width: 12px; height: 12px; background: white; border-radius: 50%; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); }
.kazi-omp .loc-meta { padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; gap: 14px; }
.kazi-omp .loc-addr { font-size: 14px; color: var(--text); line-height: 1.5; font-weight: 500; }
.kazi-omp .loc-dist { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -.02em; color: var(--green); flex-shrink: 0; }

.kazi-omp .subtabs { display: flex; gap: 8px; margin-bottom: 14px; }
.kazi-omp .subtab { flex: 1; padding: 9px 10px; border-radius: 100px; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; border: 1px solid var(--chrome); background: var(--bg); color: var(--text-mid); display: flex; align-items: center; justify-content: center; gap: 6px; }
.kazi-omp .subtab.active { background: var(--green-soft); color: var(--green); border-color: #cfe8de; }
.kazi-omp .subtab.perm { color: var(--purple); border-color: var(--purple-soft); background: #faf7fc; }
.kazi-omp .subtab.perm.active { background: var(--purple); color: white; border-color: var(--purple); }
.kazi-omp .subtab-count { font-size: 10px; background: var(--card); color: var(--text-mid); padding: 1px 7px; border-radius: 100px; font-weight: 700; letter-spacing: .04em; }
.kazi-omp .subtab.active .subtab-count { background: var(--card); color: var(--green); }
.kazi-omp .subtab.perm.active .subtab-count { background: rgba(255,255,255,.25); color: white; }
.kazi-omp .shift-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border-soft); align-items: center; cursor: pointer; }
.kazi-omp .shift-item:last-child { border-bottom: none; padding-bottom: 0; }
.kazi-omp .shift-item:first-child { padding-top: 0; }
.kazi-omp .shift-date { width: 54px; background: var(--bg); border: 1px solid var(--chrome); border-radius: 10px; padding: 8px 4px; text-align: center; flex-shrink: 0; }
.kazi-omp .shift-date.gold { background: var(--amber-soft); border-color: #f5e3b8; }
.kazi-omp .shift-day-num { font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -.02em; line-height: 1; }
.kazi-omp .shift-day-name { font-size: 9px; font-weight: 700; color: var(--text-light); text-transform: uppercase; margin-top: 3px; }
.kazi-omp .shift-info { flex: 1; min-width: 0; }
.kazi-omp .shift-role { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 2px; }
.kazi-omp .shift-meta { font-size: 11px; color: var(--text-light); margin-bottom: 6px; }
.kazi-omp .shift-pay { font-size: 13px; font-weight: 700; letter-spacing: -.01em; color: var(--green); display: inline-block; margin-right: 8px; }
.kazi-omp .applicant-count { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 100px; background: var(--bg); color: var(--text-mid); border: 1px solid var(--chrome); }
.kazi-omp .applicant-count svg { width: 10px; height: 10px; stroke: var(--text-mid); stroke-width: 2; fill: none; }
.kazi-omp .shift-arrow { width: 36px; height: 36px; border-radius: 50%; background: var(--green-soft); border: 1px solid #cfe8de; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.kazi-omp .shift-arrow svg { width: 14px; height: 14px; stroke: var(--green); stroke-width: 3; fill: none; }
.kazi-omp .perm-card { background: linear-gradient(135deg,#faf7fc,#ffffff); border: 1px solid var(--purple-soft); border-radius: 14px; padding: 16px; margin-bottom: 10px; position: relative; }
.kazi-omp .perm-card:last-child { margin-bottom: 0; }
.kazi-omp .perm-badge { position: absolute; top: 12px; right: 12px; background: var(--purple); color: white; font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 100px; text-transform: uppercase; letter-spacing: .06em; }
.kazi-omp .perm-icon { width: 36px; height: 36px; border-radius: 10px; background: var(--purple-soft); display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
.kazi-omp .perm-icon svg { width: 16px; height: 16px; stroke: var(--purple); fill: none; stroke-width: 2; }
.kazi-omp .perm-title { font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 3px; letter-spacing: -.02em; }
.kazi-omp .perm-type { font-size: 11px; color: var(--text-light); font-weight: 600; margin-bottom: 10px; }
.kazi-omp .perm-salary { font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: -.02em; color: var(--green); margin-bottom: 10px; }
.kazi-omp .perm-benefits { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
.kazi-omp .benefit { background: var(--card); border: 1px solid var(--chrome); color: var(--text-mid); font-size: 10px; font-weight: 700; padding: 4px 9px; border-radius: 100px; }
.kazi-omp .perm-apply { width: 100%; background: var(--purple); color: white; border: none; border-radius: 100px; padding: 10px; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
.kazi-omp .rating-summary { display: flex; gap: 16px; align-items: center; padding: 4px 0 16px; border-bottom: 1px solid var(--border-soft); margin-bottom: 14px; }
.kazi-omp .rating-big { font-family: 'DM Sans', sans-serif; font-size: 44px; font-weight: 700; line-height: 1; letter-spacing: -.03em; }
.kazi-omp .rating-meta { flex: 1; }
.kazi-omp .rating-stars { color: #f4b740; font-size: 15px; letter-spacing: 1px; margin-bottom: 3px; }
.kazi-omp .rating-count { font-size: 12px; color: var(--text-light); font-weight: 600; }
.kazi-omp .breakdown { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.kazi-omp .bd-row { display: flex; align-items: center; gap: 8px; font-size: 11px; }
.kazi-omp .bd-num { width: 14px; color: var(--text-light); font-weight: 700; text-align: right; }
.kazi-omp .bd-bar { flex: 1; height: 5px; background: var(--border-soft); border-radius: 100px; overflow: hidden; }
.kazi-omp .bd-fill { height: 100%; background: #f4b740; border-radius: 100px; }
.kazi-omp .bd-pct { width: 32px; color: var(--text-light); font-weight: 600; text-align: right; }
.kazi-omp .review { padding: 14px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-omp .review:last-child { border-bottom: none; }
.kazi-omp .review-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.kazi-omp .reviewer-avatar { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#c8a8d4,#e8a87c); display: flex; align-items: center; justify-content: center; color: white; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 12px; letter-spacing: -.01em; flex-shrink: 0; }
.kazi-omp .reviewer-info { flex: 1; }
.kazi-omp .reviewer-name { font-size: 13px; font-weight: 700; }
.kazi-omp .review-date { font-size: 11px; color: var(--text-light); margin-top: 1px; }
.kazi-omp .review-stars { color: #f4b740; font-size: 12px; letter-spacing: .5px; }
.kazi-omp .review-text { font-size: 13px; line-height: 1.55; color: var(--text-mid); }
.kazi-omp .gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.kazi-omp .photo { aspect-ratio: 1; border-radius: 14px; position: relative; overflow: hidden; background: var(--bg); }
.kazi-omp .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.kazi-omp .photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.45)); pointer-events: none; }
.kazi-omp .photo.featured { grid-column: span 2; aspect-ratio: 2/1; }
.kazi-omp .photo-label { position: absolute; bottom: 10px; left: 12px; color: white; font-size: 11.5px; font-weight: 700; letter-spacing: -.01em; z-index: 1; }
`;

const COVER_URL = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80';
const MAP_URL = 'https://staticmap.openstreetmap.de/staticmap.php?center=29.7339,-95.4663&zoom=15&size=600x360&maptype=mapnik&markers=29.7339,-95.4663,red-pushpin';

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
  { value: '4.8', star: true, label: 'Rating' },
  { value: '18', label: 'Reviews' },
  { value: '142', label: 'Hires' },
  { value: '< 1h', label: 'Response' },
];

const TEMP_SHIFTS = [
  { id: 'sh-11', day: 11, name: 'Fri', gold: true, role: 'Dental Hygienist', meta: '8:00 AM – 5:00 PM · 8 hrs', pay: '$55/hr', applicants: 8 },
  { id: 'sh-14', day: 14, name: 'Mon', role: 'Dental Assistant', meta: '8:00 AM – 4:00 PM · 7 hrs', pay: '$28/hr', applicants: 3 },
  { id: 'sh-17', day: 17, name: 'Thu', role: 'Front Desk', meta: '9:00 AM – 5:00 PM · 7 hrs', pay: '$22/hr', applicants: 0 },
];

const PERM_JOBS = [
  { id: 'perm-1', badge: 'Full-Time', title: 'Dental Hygienist', type: 'Full-Time · Start date flexible', salary: '$65K – $78K / year', benefits: ['Health', 'Dental', '401(k)', 'PTO', 'CE Allowance'] },
  { id: 'perm-2', badge: 'Part-Time', title: 'Front Desk Coordinator', type: 'Part-Time · Starts May 1', salary: '$22 – $26 / hour', benefits: ['Flexible Hours', 'PTO'] },
];

const ABOUT = `Modern general dentistry practice in the Galleria area of Houston. Busy 4-chair office with a strong focus on patient experience, hygiene excellence, and a welcoming team culture. We hire for same-day coverage and longer engagements.

Our team has been serving the Houston community for over a decade. Dr. Patel leads a compassionate team dedicated to making every patient feel at home. We pride ourselves on modern equipment, digital workflows, and continuing education — our staff attend 40+ hours of CE annually.

We're looking for professionals who are reliable, friendly, and take pride in their craft.`;

export default function OfficeMyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSub, setActiveSub] = useState('temp');
  const [aboutOpen, setAboutOpen] = useState(false);
  const notImpl = (label) => () => alert(`${label} — coming soon`);

  return (
    <div className="kazi-omp">
      <style>{styles}</style>
      <TopBar role="office" />
      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate('/dashboard')} aria-label="Back">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="topbar-title">My Office</div>
        <button className="preview-btn" onClick={() => navigate('/office/me')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          Preview
        </button>
      </div>

      <div className="hero">
        <div className="hero-cover">
          <img src={COVER_URL} alt="" />
          <div className="hero-cover-grad" />
          <button className="hero-cover-edit" onClick={notImpl('Edit cover')}>
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            Cover
          </button>
        </div>
        <div className="hero-content">
          <div className="hero-top">
            <div className="hero-logo-wrap">
              <div className="office-logo">BS</div>
              <div className="verified-badge"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
              <div className="photo-edit" onClick={notImpl('Upload logo')}>
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
              </div>
            </div>
            <div className="hero-meta">
              <h1 className="office-name">Bright Smile Dental</h1>
              <div className="office-type">Houston, TX · Galleria area</div>
            </div>
          </div>
          <div className="hero-stats">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-value">
                  {s.star && <span className="hero-stat-star">★</span>}
                  {s.value}
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tabs">
        {[{ k: 'overview', label: 'Overview' }, { k: 'shifts', label: 'Jobs' }, { k: 'reviews', label: 'Reviews' }, { k: 'photos', label: 'Photos' }].map((t) => (
          <button key={t.k} className={`tab ${activeTab === t.k ? 'active' : ''}`} onClick={() => setActiveTab(t.k)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="section">
            <div className="section-header">
              <div className="section-title">About</div>
              <button className="edit-btn" onClick={notImpl('Edit about')}>Edit</button>
            </div>
            <div className={`about-text ${aboutOpen ? '' : 'clamped'}`} style={{ whiteSpace: 'pre-line' }}>{ABOUT}</div>
            <button className={`see-more-btn ${aboutOpen ? 'open' : ''}`} onClick={() => setAboutOpen((o) => !o)}>
              {aboutOpen ? 'See less' : 'See more'}
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
          </div>
          <div className="section">
            <div className="section-header">
              <div className="section-title">Practice Details</div>
              <button className="edit-btn" onClick={notImpl('Edit details')}>Edit</button>
            </div>
            <div className="detail-row"><span className="detail-label">Hours</span><span className="detail-val">Mon–Fri 8am–5pm</span></div>
            <div className="detail-row"><span className="detail-label">Chairs</span><span className="detail-val">4</span></div>
            <div className="detail-row"><span className="detail-label">Software</span><span className="detail-val">Dentrix · Dexis</span></div>
            <div className="detail-row"><span className="detail-label">Parking</span><span className="detail-val">Free lot</span></div>
            <div className="detail-row"><span className="detail-label">Dress code</span><span className="detail-val">Navy scrubs</span></div>
            <div className="detail-row"><span className="detail-label">Lunch</span><span className="detail-val">Provided</span></div>
          </div>
          <div className="location-card">
            <div className="map-preview">
              <img src={MAP_URL} alt="Map of office location" />
              <div className="map-pin" />
            </div>
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
            <div key={s.id} className="shift-item" onClick={() => navigate(`/shift/${s.id}`)}>
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
            <div key={j.id} className="perm-card">
              <span className="perm-badge">{j.badge}</span>
              <div className="perm-icon">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              </div>
              <div className="perm-title">{j.title}</div>
              <div className="perm-type">{j.type}</div>
              <div className="perm-salary">{j.salary}</div>
              <div className="perm-benefits">{j.benefits.map((b) => <span key={b} className="benefit">{b}</span>)}</div>
              <button className="perm-apply" onClick={() => navigate(`/shift/${j.id}`)}>View & Apply</button>
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
          <div className="section-header">
            <div className="section-title">Photos · {PHOTOS.length}</div>
            <button className="edit-btn" onClick={notImpl('Add photo')}>+ Add</button>
          </div>
          <div className="gallery">
            {PHOTOS.map((p) => (
              <div key={p.label} className={`photo ${p.featured ? 'featured' : ''}`}>
                <img src={p.src} alt={p.label} />
                <div className="photo-label">{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
