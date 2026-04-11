import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import SuccessToast from '../components/SuccessToast';

const styles = `
.kazi-shift * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.kazi-shift {
  --green: #1a7f5e;
  --green-soft: #e8f5f0;
  --orange: #F97316;
  --bg: #f9f8f6;
  --card: #fff;
  --text: #1a1a1a;
  --text-mid: #6b7280;
  --text-light: #9ca3af;
  --border: #e5e7eb;
  --border-soft: #f3f4f6;
  font-family: 'DM Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  padding-bottom: 110px;
  min-height: 100vh;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 0 40px rgba(0,0,0,.06);
  position: relative;
}
.kazi-shift button { font-family: inherit; cursor: pointer; }
.kazi-shift .topbar { position: sticky; top: 0; z-index: 50; background: var(--bg); padding: 14px 20px; display: flex; align-items: center; gap: 12px; }
.kazi-shift .close-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--card); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; cursor: pointer; }
.kazi-shift .close-btn svg { width: 15px; height: 15px; stroke: var(--text); stroke-width: 2.5; fill: none; }
.kazi-shift .hero { text-align: center; padding: 20px 20px 24px; }
.kazi-shift .office-logo { width: 72px; height: 72px; border-radius: 22px; background: linear-gradient(135deg,#a8c9b8,#7ab8a8); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 22px; letter-spacing: -.02em; margin: 0 auto 14px; }
.kazi-shift .office-name { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -.02em; line-height: 1.2; margin-bottom: 4px; }
.kazi-shift .office-meta { font-size: 14px; color: #8a8a8a; margin-bottom: 10px; }
.kazi-shift .rating-pill { display: inline-flex; align-items: center; gap: 6px; background: var(--card); border: 1px solid #f3f3f3; border-radius: 100px; padding: 7px 14px; }
.kazi-shift .rating-pill svg { width: 14px; height: 14px; fill: #f4b740; stroke: #f4b740; stroke-width: 1; }
.kazi-shift .rating-pill .star { display: none; }
.kazi-shift .rating-pill .num { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px; color: var(--text); }
.kazi-shift .rating-pill .count { font-size: 12px; color: #8a8a8a; font-weight: 600; }
.kazi-shift .earn-banner { background: #f1f9f5; border: none; border-radius: 16px; margin: 0 16px 12px; padding: 18px 20px; display: flex; justify-content: space-between; align-items: center; }
.kazi-shift .earn-label { font-size: 14px; color: #5a5a5a; font-weight: 600; }
.kazi-shift .earn-value { font-family: 'Outfit', sans-serif; font-size: 26px; font-weight: 800; color: var(--green); letter-spacing: -.02em; line-height: 1; }
.kazi-shift .details-card { background: var(--card); margin: 0 16px; border-radius: 20px; border: 1px solid #f3f3f3; padding: 0; overflow: hidden; }
.kazi-shift .details-title { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: var(--text); padding: 16px 18px 0; margin-bottom: 0; }
.kazi-shift .details-rows { padding: 14px 18px 16px; }
.kazi-shift .detail-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 0; border-bottom: 1px solid #f3f3f3; }
.kazi-shift .detail-row:last-child { border-bottom: none; }
.kazi-shift .detail-left { display: flex; align-items: center; gap: 10px; }
.kazi-shift .detail-icon { width: 32px; height: 32px; border-radius: 10px; background: #f9f8f6; border: none; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kazi-shift .detail-icon svg { width: 14px; height: 14px; stroke: #5a5a5a; stroke-width: 2.2; fill: none; }
.kazi-shift .detail-label { font-size: 13px; color: #8a8a8a; font-weight: 500; }
.kazi-shift .detail-val { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700; color: var(--text); text-align: right; letter-spacing: 0; }
.kazi-shift .detail-val.green { color: var(--green); }
.kazi-shift .action-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); max-width: 480px; width: 100%; background: var(--card); padding: 14px 20px 26px; border-top: 1px solid var(--border); display: flex; gap: 10px; z-index: 41; box-shadow: 0 -4px 20px rgba(0,0,0,.04); }
.kazi-shift .btn-apply { flex: 1; background: var(--green); color: white; border: none; border-radius: 100px; padding: 16px 20px; font-family: inherit; font-size: 15px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.kazi-shift .btn-apply svg { width: 16px; height: 16px; stroke: white; stroke-width: 3; fill: none; }
.kazi-shift .btn-save { background: var(--bg); color: var(--text); border: 1.5px solid var(--border); border-radius: 100px; padding: 16px 24px; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
`;

// Mock data — keyed by shift id, falls back to default
const MOCK = {
  default: {
    initials: 'MCD',
    officeName: 'Missouri City Dental',
    location: 'Missouri City, TX · 4.2 mi away',
    rating: '4.9',
    reviewCount: 124,
    earnings: 493,
    date: 'Wednesday, Apr 10',
    hours: '8:00 AM – 5:00 PM',
    lunch: '45 min',
    rate: '$58/hr',
    role: 'Dental Hygienist',
  },
};

export default function ShiftDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const shift = MOCK[id] || MOCK.default;
  const [toastOpen, setToastOpen] = useState(false);

  const handleApply = () => {
    setToastOpen(true);
  };

  const closeToast = () => {
    setToastOpen(false);
    navigate(-1);
  };

  const handleSave = () => {
    alert('Saved to favorites');
  };

  return (
    <div className="kazi-shift">
      <style>{styles}</style>
      <TopBar role="provider" />
      <div className="topbar">
        <button className="close-btn" onClick={() => navigate(-1)} aria-label="Close">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>
      </div>

      <div className="hero">
        <div className="office-logo">{shift.initials}</div>
        <div className="office-name">{shift.officeName}</div>
        <div className="office-meta">{shift.location}</div>
        <div className="rating-pill">
          <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          <span className="num">{shift.rating}</span>
          <span className="count">({shift.reviewCount} reviews)</span>
        </div>
      </div>

      <div className="earn-banner">
        <div className="earn-label">You'll earn</div>
        <div className="earn-value">${shift.earnings}</div>
      </div>

      <div className="details-card">
        <div className="details-title">Shift details</div>
        <div className="details-rows">
          <div className="detail-row">
            <div className="detail-left">
              <div className="detail-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div>
              <div className="detail-label">Date</div>
            </div>
            <div className="detail-val">{shift.date}</div>
          </div>
          <div className="detail-row">
            <div className="detail-left">
              <div className="detail-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div>
              <div className="detail-label">Hours</div>
            </div>
            <div className="detail-val">{shift.hours}</div>
          </div>
          <div className="detail-row">
            <div className="detail-left">
              <div className="detail-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11h18M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M5 11v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg></div>
              <div className="detail-label">Lunch break</div>
            </div>
            <div className="detail-val">{shift.lunch}</div>
          </div>
          <div className="detail-row">
            <div className="detail-left">
              <div className="detail-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div>
              <div className="detail-label">Your rate</div>
            </div>
            <div className="detail-val green">{shift.rate}</div>
          </div>
          <div className="detail-row">
            <div className="detail-left">
              <div className="detail-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div>
              <div className="detail-label">Role requested</div>
            </div>
            <div className="detail-val">{shift.role}</div>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <button className="btn-apply" onClick={handleApply}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          Apply for Shift · ${shift.earnings}
        </button>
        <button className="btn-save" onClick={handleSave}>Save</button>
      </div>
      <SuccessToast
        open={toastOpen}
        title="Application sent"
        subtitle={`${shift.officeName} will review your application and get back to you shortly.`}
        onClose={closeToast}
      />
    </div>
  );
}
