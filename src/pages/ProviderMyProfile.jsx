import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ProviderBottomNav from '../components/ProviderBottomNav';

const styles = `
.kazi-pmp { --green: #1a7f5e; --green-soft: #e8f5f0; --orange: #F97316; --gold-bg: #dcfce7; --gold-text: #166534; --amber: #f4b740; --amber-soft: #fef6e4; --bg: #f9f8f6; --card: #fff; --text: #1a1a1a; --text-mid: #6b7280; --text-light: #9ca3af; --border: #e5e7eb; --border-soft: #f3f4f6; --danger: #ef4444; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; padding-bottom: 110px; max-width: 480px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 40px rgba(0,0,0,.06); position: relative; }
.kazi-pmp * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
.kazi-pmp button { font-family: inherit; cursor: pointer; }
.kazi-pmp .topbar { background: var(--card); padding: 14px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-soft); position: sticky; top: 0; z-index: 50; }
.kazi-pmp .back-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.kazi-pmp .back-btn svg { width: 16px; height: 16px; stroke: var(--text); stroke-width: 2; fill: none; }
.kazi-pmp .topbar-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 18px; flex: 1; letter-spacing: -.01em; }
.kazi-pmp .preview-btn { background: var(--green-soft); color: var(--green); border: none; padding: 8px 14px; border-radius: 100px; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.kazi-pmp .preview-btn svg { width: 12px; height: 12px; stroke: var(--green); stroke-width: 2.5; fill: none; }
.kazi-pmp .meter { background: var(--card); margin: 14px 20px 0; padding: 14px 16px; border-radius: 14px; border: 1.5px solid var(--border); }
.kazi-pmp .meter-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
.kazi-pmp .meter-label { font-size: 12px; color: var(--text-mid); font-weight: 600; }
.kazi-pmp .meter-pct { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 15px; color: var(--green); }
.kazi-pmp .meter-bar { height: 6px; background: var(--bg); border-radius: 100px; overflow: hidden; border: 1px solid var(--border-soft); }
.kazi-pmp .meter-fill { height: 100%; width: 85%; background: var(--green); border-radius: 100px; }
.kazi-pmp .meter-hint { font-size: 11px; color: var(--text-light); margin-top: 6px; }
.kazi-pmp .hero-card { background: var(--card); margin: 14px 20px 0; border-radius: 14px; border: 1.5px solid var(--border); padding: 22px; }
.kazi-pmp .hero-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
.kazi-pmp .photo-wrap { position: relative; flex-shrink: 0; }
.kazi-pmp .hero-photo { width: 88px; height: 88px; border-radius: 24px; background: linear-gradient(135deg,#a8c9b8,#7ab8a8); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 32px; font-family: 'Outfit', sans-serif; letter-spacing: -.02em; box-shadow: 0 4px 14px rgba(26,127,94,.12); object-fit: cover; }
.kazi-pmp img.hero-photo { padding: 0; }
.kazi-pmp .photo-verified { position: absolute; bottom: -3px; right: -3px; width: 26px; height: 26px; background: var(--green); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--card); z-index: 1; }
.kazi-pmp .photo-verified svg { width: 12px; height: 12px; stroke: white; stroke-width: 3; fill: none; }
.kazi-pmp .photo-edit { position: absolute; top: -3px; right: -3px; width: 26px; height: 26px; background: var(--text); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--card); cursor: pointer; z-index: 2; }
.kazi-pmp .photo-edit svg { width: 11px; height: 11px; stroke: white; stroke-width: 2.5; fill: none; }
.kazi-pmp .hero-info { flex: 1; min-width: 0; }
.kazi-pmp .hero-name { font-family: 'Outfit', sans-serif; font-size: 25px; font-weight: 800; color: var(--text); margin-bottom: 3px; display: flex; align-items: center; gap: 6px; letter-spacing: -.02em; }
.kazi-pmp .lock-icon { width: 11px; height: 11px; stroke: var(--text-light); stroke-width: 2; fill: none; flex-shrink: 0; }
.kazi-pmp .hero-role { font-size: 14px; color: var(--text-light); margin-bottom: 6px; }
.kazi-pmp .hero-rate-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.kazi-pmp .hero-rate { font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; color: var(--green); letter-spacing: -.01em; }
.kazi-pmp .rate-edit { background: none; border: none; color: var(--green); font-size: 11px; font-weight: 600; cursor: pointer; font-family: inherit; }
.kazi-pmp .hero-stars { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.kazi-pmp .stars-val { font-size: 16px; font-weight: 800; color: var(--orange); }
.kazi-pmp .reviews-ct { font-size: 13px; color: var(--text-light); }
.kazi-pmp .reliability-pill { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 100px; background: var(--gold-bg); color: var(--gold-text); }
.kazi-pmp .stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
.kazi-pmp .stat-tile { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 8px; text-align: center; }
.kazi-pmp .stat-tile-label { font-size: 9px; font-weight: 800; color: var(--text-light); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; }
.kazi-pmp .stat-tile-val { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800; color: var(--text); letter-spacing: -.01em; }
.kazi-pmp .stat-tile-val.green { color: var(--green); }
.kazi-pmp .stat-tile-val.gold { color: var(--gold-text); }
.kazi-pmp .section { background: var(--card); margin: 14px 20px 0; border-radius: 14px; padding: 20px; border: 1.5px solid var(--border); }
.kazi-pmp .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.kazi-pmp .section-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -.01em; }
.kazi-pmp .edit-btn { background: none; border: none; color: var(--green); font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }
.kazi-pmp .about-text { font-size: 14px; line-height: 1.6; color: var(--text-mid); }
.kazi-pmp .chip-row { display: flex; flex-wrap: wrap; gap: 7px; }
.kazi-pmp .chip { background: var(--bg); color: var(--text); padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; border: 1.5px solid var(--border); display: inline-flex; align-items: center; gap: 6px; }
.kazi-pmp .chip.green { background: var(--green-soft); color: var(--green); border-color: var(--green-soft); }
.kazi-pmp .chip .x { color: currentColor; opacity: .5; font-size: 13px; line-height: 1; cursor: pointer; }
.kazi-pmp .chip-add { background: var(--card); color: var(--green); border: 1.5px dashed var(--green); padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; }
.kazi-pmp .lang-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-pmp .lang-row:last-child { border-bottom: none; }
.kazi-pmp .lang-name { font-size: 14px; font-weight: 600; }
.kazi-pmp .lang-level { font-size: 11px; color: var(--green); background: var(--green-soft); padding: 4px 10px; border-radius: 100px; font-weight: 700; }
.kazi-pmp .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.kazi-pmp .cal-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -.01em; }
.kazi-pmp .cal-month { font-weight: 700; font-size: 13px; color: var(--text-mid); }
.kazi-pmp .cal-legend { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text-light); margin-bottom: 12px; }
.kazi-pmp .cal-legend-sq { width: 12px; height: 12px; border-radius: 4px; background: var(--green-soft); border: 1.5px solid #cfe8de; }
.kazi-pmp .cal-dow { display: grid; grid-template-columns: repeat(7,1fr); gap: 6px; margin-bottom: 6px; }
.kazi-pmp .cal-dow-cell { font-size: 10px; font-weight: 800; color: var(--text-light); text-align: center; text-transform: uppercase; letter-spacing: .05em; }
.kazi-pmp .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 6px; }
.kazi-pmp .cal-cell { aspect-ratio: 1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: var(--text); font-family: 'Outfit', sans-serif; }
.kazi-pmp .cal-cell.empty { background: transparent; }
.kazi-pmp .cal-cell.past { color: #d1d5db; font-weight: 700; }
.kazi-pmp .cal-cell.unavail { background: var(--bg); color: var(--text); border: 1.5px solid var(--border-soft); }
.kazi-pmp .cal-cell.available { background: var(--green-soft); color: var(--green); border: 1.5px solid var(--green-soft); cursor: pointer; }
.kazi-pmp .cal-cell.today { background: transparent; color: var(--green); border: 2px solid var(--green); cursor: pointer; }
.kazi-pmp .rating-summary { display: flex; gap: 16px; align-items: center; padding: 4px 0 16px; border-bottom: 1px solid var(--border-soft); margin-bottom: 14px; }
.kazi-pmp .rating-big { font-family: 'Outfit', sans-serif; font-size: 44px; font-weight: 800; color: var(--text); line-height: 1; letter-spacing: -.02em; }
.kazi-pmp .rating-meta { flex: 1; }
.kazi-pmp .rating-stars { color: var(--orange); font-size: 15px; letter-spacing: 1px; margin-bottom: 3px; }
.kazi-pmp .rating-count { font-size: 12px; color: var(--text-light); font-weight: 600; }
.kazi-pmp .review { padding: 14px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-pmp .review:last-of-type { border-bottom: none; padding-bottom: 0; }
.kazi-pmp .review-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.kazi-pmp .reviewer-logo { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#88c9a1,#7ab8d4); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 12px; flex-shrink: 0; }
.kazi-pmp .reviewer-info { flex: 1; min-width: 0; }
.kazi-pmp .reviewer-name { font-size: 13px; font-weight: 700; color: var(--text); }
.kazi-pmp .review-date { font-size: 11px; color: var(--text-light); margin-top: 1px; }
.kazi-pmp .review-stars { color: var(--orange); font-size: 12px; letter-spacing: .5px; }
.kazi-pmp .review-text { font-size: 13px; line-height: 1.55; color: var(--text-mid); }
.kazi-pmp .see-all { display: block; width: 100%; text-align: center; background: var(--bg); border: 1.5px solid var(--border); border-radius: 100px; padding: 10px; margin-top: 14px; font-family: inherit; font-size: 12px; font-weight: 700; color: var(--text); cursor: pointer; }
`;

export default function ProviderMyProfile() {
  const navigate = useNavigate();
  const { user } = useUser();

  const firstName = user?.firstName || 'Alexandra';
  const lastInitial = user?.lastName?.[0] || 'A';
  const initials = (firstName[0] || 'A') + lastInitial;
  const displayName = `${firstName} ${lastInitial}.`;

  const notImpl = (label) => () => alert(`${label} — coming soon`);

  return (
    <div className="kazi-pmp">
      <style>{styles}</style>
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="topbar-title">My Profile <span style={{ fontSize: 9, color: '#1a7f5e', background: '#e8f5f0', padding: '2px 6px', borderRadius: 100, marginLeft: 6, verticalAlign: 'middle' }}>v2</span></div>
        <button className="preview-btn" onClick={() => navigate('/provider-profile-preview')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          Preview
        </button>
      </div>

      <div className="meter">
        <div className="meter-row">
          <span className="meter-label">Profile strength</span>
          <span className="meter-pct">85%</span>
        </div>
        <div className="meter-bar"><div className="meter-fill" /></div>
        <div className="meter-hint">Add 2 more skills to reach 100% and boost your score</div>
      </div>

      <div className="hero-card">
        <div className="hero-top">
          <div className="photo-wrap">
            {user?.imageUrl ? (
              <img src={user.imageUrl} alt={displayName} className="hero-photo" />
            ) : (
              <div className="hero-photo">{initials}</div>
            )}
            <div className="photo-verified">
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div className="photo-edit" onClick={notImpl('Photo upload')}>
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
            </div>
          </div>
          <div className="hero-info">
            <div className="hero-name">
              {displayName}
              <svg className="lock-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </div>
            <div className="hero-role">Dental Assistant · Houston, TX</div>
            <div className="hero-rate-row">
              <span className="hero-rate">$28/hr</span>
              <button className="rate-edit" onClick={notImpl('Edit rate')}>Edit</button>
            </div>
            <div className="hero-stars">
              <span className="stars-val">★ 5.0</span>
              <span className="reviews-ct">(47 reviews)</span>
              <span className="reliability-pill">Excellent · 98%</span>
            </div>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-tile"><div className="stat-tile-label">Shifts</div><div className="stat-tile-val">130</div></div>
          <div className="stat-tile"><div className="stat-tile-label">Response</div><div className="stat-tile-val">&lt;1 hr</div></div>
          <div className="stat-tile"><div className="stat-tile-label">Reliability</div><div className="stat-tile-val gold">98%</div></div>
          <div className="stat-tile"><div className="stat-tile-label">Score</div><div className="stat-tile-val green">625</div></div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">About</div>
          <button className="edit-btn" onClick={notImpl('Edit about')}>Edit</button>
        </div>
        <div className="about-text">I am from Colombia, an energetic Dental Assistant enthusiastic about dental health. I earned my license in 2020 and have worked in general practice. I genuinely enjoy my work.</div>
      </div>

      <div className="section">
        <div className="cal-header">
          <div className="cal-title">Availability</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="cal-month">April 2026</div>
            <button className="edit-btn" onClick={() => navigate('/provider-availability')}>Manage</button>
          </div>
        </div>
        <div className="cal-legend"><div className="cal-legend-sq" />Green days are set as available</div>
        <div className="cal-dow">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="cal-dow-cell">{d}</div>)}
        </div>
        <div className="cal-grid">
          <div className="cal-cell empty" /><div className="cal-cell empty" /><div className="cal-cell empty" />
          <div className="cal-cell past">1</div><div className="cal-cell past">2</div><div className="cal-cell past">3</div><div className="cal-cell past">4</div>
          <div className="cal-cell past">5</div><div className="cal-cell past">6</div><div className="cal-cell past">7</div><div className="cal-cell past">8</div><div className="cal-cell past">9</div><div className="cal-cell past">10</div><div className="cal-cell today">11</div>
          <div className="cal-cell unavail">12</div><div className="cal-cell available">13</div><div className="cal-cell available">14</div><div className="cal-cell available">15</div><div className="cal-cell available">16</div><div className="cal-cell available">17</div><div className="cal-cell unavail">18</div>
          <div className="cal-cell unavail">19</div><div className="cal-cell available">20</div><div className="cal-cell available">21</div><div className="cal-cell available">22</div><div className="cal-cell available">23</div><div className="cal-cell available">24</div><div className="cal-cell unavail">25</div>
          <div className="cal-cell unavail">26</div><div className="cal-cell available">27</div><div className="cal-cell available">28</div><div className="cal-cell available">29</div><div className="cal-cell available">30</div>
        </div>
      </div>

      <div className="section">
        <div className="section-header"><div className="section-title">Certifications</div></div>
        <div className="chip-row">
          <span className="chip green">BLS CPR <span className="x" onClick={notImpl('Remove cert')}>×</span></span>
          <span className="chip green">CDA <span className="x" onClick={notImpl('Remove cert')}>×</span></span>
          <span className="chip">EFDA <span className="x" onClick={notImpl('Remove cert')}>×</span></span>
          <span className="chip">Radiology <span className="x" onClick={notImpl('Remove cert')}>×</span></span>
          <button className="chip-add" onClick={notImpl('Add cert')}>+ Add</button>
        </div>
      </div>

      <div className="section">
        <div className="section-header"><div className="section-title">Skills</div></div>
        <div className="chip-row">
          {['Alginate Impressions', 'Bilingual', 'Bone Grafting', 'Bridges', 'Crowns', 'Digital X-Rays'].map((s) => (
            <span key={s} className="chip">{s} <span className="x" onClick={notImpl('Remove skill')}>×</span></span>
          ))}
          <button className="chip-add" onClick={notImpl('Add skill')}>+ Add skill</button>
        </div>
      </div>

      <div className="section">
        <div className="section-header"><div className="section-title">Experience Assisting</div></div>
        <div className="chip-row">
          {['Endodontics', 'General Dentistry', 'Oral Surgery', 'Orthodontics'].map((s) => (
            <span key={s} className="chip">{s} <span className="x" onClick={notImpl('Remove')}>×</span></span>
          ))}
          <button className="chip-add" onClick={notImpl('Add experience')}>+ Add</button>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Languages</div>
          <button className="edit-btn" onClick={notImpl('Add language')}>+ Add</button>
        </div>
        <div className="lang-row"><span className="lang-name">Spanish</span><span className="lang-level">Native</span></div>
        <div className="lang-row"><span className="lang-name">English</span><span className="lang-level">Conversational</span></div>
      </div>

      <div className="section">
        <div className="section-header"><div className="section-title">Reviews</div></div>
        <div className="rating-summary">
          <div className="rating-big">5.0</div>
          <div className="rating-meta">
            <div className="rating-stars">★★★★★</div>
            <div className="rating-count">Based on 47 reviews</div>
          </div>
        </div>
        {[
          { logo: 'SD', name: 'Sugar Land Family Dental', when: '2 weeks ago', text: 'Alexandra was fantastic. Showed up early, jumped right in, and our hygienists loved working with her. Spanish-speaking patients were thrilled. Will definitely book again.' },
          { logo: 'BD', name: 'Bellaire Dental Group', when: '1 month ago', text: 'Professional, punctual, and great chairside manner. Handled a heavy day of crown preps without missing a beat. Highly recommend.' },
          { logo: 'MC', name: 'Memorial City Dental', when: '2 months ago', text: 'Excellent EFDA skills and very reliable. She\'s now on our preferred list.' },
        ].map((r) => (
          <div className="review" key={r.logo}>
            <div className="review-head">
              <div className="reviewer-logo">{r.logo}</div>
              <div className="reviewer-info">
                <div className="reviewer-name">{r.name}</div>
                <div className="review-date">{r.when}</div>
              </div>
              <div className="review-stars">★★★★★</div>
            </div>
            <div className="review-text">{r.text}</div>
          </div>
        ))}
        <button className="see-all" onClick={notImpl('See all reviews')}>See all 47 reviews</button>
      </div>

      <ProviderBottomNav />
    </div>
  );
}
