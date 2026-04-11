import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const DEFAULT_USER_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';

const styles = `
.kazi-ppp { --green: #1a7f5e; --green-soft: #e8f5f0; --orange: #F97316; --gold-bg: #dcfce7; --gold-text: #166534; --amber: #f4b740; --amber-soft: #fef6e4; --bg: #f9f8f6; --card: #fff; --text: #1a1a1a; --text-mid: #6b7280; --text-light: #9ca3af; --border: #e5e7eb; --border-soft: #f3f4f6; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; padding-bottom: 110px; max-width: 480px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 40px rgba(0,0,0,.06); position: relative; }
.kazi-ppp * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
.kazi-ppp button { font-family: inherit; cursor: pointer; }
.kazi-ppp .topbar { background: var(--card); padding: 14px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-soft); position: sticky; top: 0; z-index: 50; }
.kazi-ppp .back-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.kazi-ppp .back-btn svg { width: 16px; height: 16px; stroke: var(--text); stroke-width: 2; fill: none; }
.kazi-ppp .topbar-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 18px; flex: 1; letter-spacing: -.01em; }
.kazi-ppp .preview-btn { background: #fef6e4; color: #8b6914; border: none; padding: 8px 14px; border-radius: 100px; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 5px; }
.kazi-ppp .preview-btn svg { width: 12px; height: 12px; stroke: #8b6914; stroke-width: 2.5; fill: none; }
.kazi-ppp .hero-card { background: var(--card); margin: 14px 20px 0; border-radius: 14px; border: 1.5px solid var(--border); padding: 22px; }
.kazi-ppp .hero-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
.kazi-ppp .photo-wrap { position: relative; flex-shrink: 0; }
.kazi-ppp .hero-photo { width: 88px; height: 88px; border-radius: 24px; background: linear-gradient(135deg,#a8c9b8,#7ab8a8); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 32px; font-family: 'Outfit', sans-serif; letter-spacing: -.02em; box-shadow: 0 4px 14px rgba(26,127,94,.12); object-fit: cover; }
.kazi-ppp .photo-verified { position: absolute; bottom: -3px; right: -3px; width: 26px; height: 26px; background: var(--green); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--card); z-index: 1; }
.kazi-ppp .photo-verified svg { width: 12px; height: 12px; stroke: white; stroke-width: 3; fill: none; }
.kazi-ppp .hero-info { flex: 1; min-width: 0; }
.kazi-ppp .hero-name { font-family: 'Outfit', sans-serif; font-size: 25px; font-weight: 800; color: var(--text); margin-bottom: 3px; letter-spacing: -.02em; }
.kazi-ppp .hero-role { font-size: 14px; color: var(--text-light); margin-bottom: 6px; }
.kazi-ppp .hero-rate-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.kazi-ppp .hero-rate { font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; color: var(--green); letter-spacing: -.01em; }
.kazi-ppp .hero-stars { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.kazi-ppp .stars-val { font-size: 16px; font-weight: 800; color: var(--orange); }
.kazi-ppp .reviews-ct { font-size: 13px; color: var(--text-light); }
.kazi-ppp .reliability-pill { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 100px; background: var(--gold-bg); color: var(--gold-text); }
.kazi-ppp .stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
.kazi-ppp .stat-tile { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 8px; text-align: center; }
.kazi-ppp .stat-tile-label { font-size: 9px; font-weight: 800; color: var(--text-light); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; }
.kazi-ppp .stat-tile-val { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800; color: var(--text); letter-spacing: -.01em; }
.kazi-ppp .stat-tile-val.green { color: var(--green); }
.kazi-ppp .stat-tile-val.gold { color: var(--gold-text); }
.kazi-ppp .section { background: var(--card); margin: 14px 20px 0; border-radius: 14px; padding: 20px; border: 1.5px solid var(--border); }
.kazi-ppp .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.kazi-ppp .section-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -.01em; }
.kazi-ppp .about-text { font-size: 14px; line-height: 1.6; color: var(--text-mid); }
.kazi-ppp .chip-row { display: flex; flex-wrap: wrap; gap: 7px; }
.kazi-ppp .chip { background: var(--bg); color: var(--text); padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; border: 1.5px solid var(--border); }
.kazi-ppp .chip.green { background: var(--green-soft); color: var(--green); border-color: var(--green-soft); }
.kazi-ppp .lang-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-ppp .lang-row:last-child { border-bottom: none; }
.kazi-ppp .lang-name { font-size: 14px; font-weight: 600; }
.kazi-ppp .lang-level { font-size: 11px; color: var(--green); background: var(--green-soft); padding: 4px 10px; border-radius: 100px; font-weight: 700; }
.kazi-ppp .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.kazi-ppp .cal-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -.01em; }
.kazi-ppp .cal-month { font-weight: 700; font-size: 13px; color: var(--text-mid); }
.kazi-ppp .cal-legend { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text-light); margin-bottom: 12px; }
.kazi-ppp .cal-legend-sq { width: 12px; height: 12px; border-radius: 4px; background: var(--green-soft); border: 1.5px solid #cfe8de; }
.kazi-ppp .cal-dow { display: grid; grid-template-columns: repeat(7,1fr); gap: 6px; margin-bottom: 6px; }
.kazi-ppp .cal-dow-cell { font-size: 10px; font-weight: 800; color: var(--text-light); text-align: center; text-transform: uppercase; letter-spacing: .05em; }
.kazi-ppp .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 6px; }
.kazi-ppp .cal-cell { aspect-ratio: 1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: var(--text); font-family: 'Outfit', sans-serif; }
.kazi-ppp .cal-cell.empty { background: transparent; }
.kazi-ppp .cal-cell.past { color: #d1d5db; }
.kazi-ppp .cal-cell.unavail { background: var(--bg); color: var(--text); border: 1.5px solid var(--border-soft); }
.kazi-ppp .cal-cell.available { background: var(--green-soft); color: var(--green); border: 1.5px solid var(--green-soft); cursor: pointer; }
.kazi-ppp .cal-cell.today { color: var(--green); border: 2px solid var(--green); }
.kazi-ppp .rating-summary { display: flex; gap: 16px; align-items: center; padding: 4px 0 16px; border-bottom: 1px solid var(--border-soft); margin-bottom: 14px; }
.kazi-ppp .rating-big { font-family: 'Outfit', sans-serif; font-size: 44px; font-weight: 800; line-height: 1; letter-spacing: -.02em; }
.kazi-ppp .rating-meta { flex: 1; }
.kazi-ppp .rating-stars { color: var(--orange); font-size: 15px; letter-spacing: 1px; margin-bottom: 3px; }
.kazi-ppp .rating-count { font-size: 12px; color: var(--text-light); font-weight: 600; }
.kazi-ppp .review { padding: 14px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-ppp .review:last-of-type { border-bottom: none; padding-bottom: 0; }
.kazi-ppp .review-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.kazi-ppp .reviewer-logo { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#88c9a1,#7ab8d4); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 12px; flex-shrink: 0; }
.kazi-ppp .reviewer-info { flex: 1; min-width: 0; }
.kazi-ppp .reviewer-name { font-size: 13px; font-weight: 700; }
.kazi-ppp .review-date { font-size: 11px; color: var(--text-light); margin-top: 1px; }
.kazi-ppp .review-stars { color: var(--orange); font-size: 12px; letter-spacing: .5px; }
.kazi-ppp .review-text { font-size: 13px; line-height: 1.55; color: var(--text-mid); }
.kazi-ppp .see-all { display: block; width: 100%; text-align: center; background: var(--bg); border: 1.5px solid var(--border); border-radius: 100px; padding: 10px; margin-top: 14px; font-family: inherit; font-size: 12px; font-weight: 700; color: var(--text); cursor: pointer; }
.kazi-ppp .action-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); max-width: 480px; width: 100%; background: var(--card); padding: 14px 20px 26px; border-top: 1px solid var(--border); display: flex; gap: 10px; z-index: 41; box-shadow: 0 -4px 20px rgba(0,0,0,.04); }
.kazi-ppp .btn { padding: 13px 18px; border-radius: 100px; border: none; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; }
.kazi-ppp .btn-icon { flex: 0 0 50px; padding: 13px; background: var(--bg); border: 1.5px solid var(--border); color: var(--text); }
.kazi-ppp .btn-icon svg { width: 16px; height: 16px; stroke: var(--text); fill: none; stroke-width: 2; }
.kazi-ppp .btn-primary { background: var(--green); color: white; flex: 2; }
.kazi-ppp .btn-primary svg { width: 15px; height: 15px; stroke: white; fill: none; stroke-width: 2.5; }
`;

export default function ProviderProfilePreview() {
  const navigate = useNavigate();
  const { user } = useUser();

  const firstName = user?.firstName || 'Alexandra';
  const lastInitial = user?.lastName?.[0] || 'A';
  const initials = (firstName[0] || 'A') + lastInitial;
  const displayName = `${firstName} ${lastInitial}.`;

  return (
    <div className="kazi-ppp">
      <style>{styles}</style>
      <div className="topbar">
        <button className="back-btn" onClick={() => navigate('/my-profile')} aria-label="Back">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="topbar-title">Profile</div>
        <button className="preview-btn" onClick={() => navigate('/my-profile')}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
          Exit Preview
        </button>
      </div>

      <div className="hero-card">
        <div className="hero-top">
          <div className="photo-wrap">
            <img
              src={DEFAULT_USER_PHOTO}
              alt={displayName}
              className="hero-photo"
            />
            <div className="photo-verified">
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
          </div>
          <div className="hero-info">
            <div className="hero-name">{displayName}</div>
            <div className="hero-role">Dental Assistant · Houston, TX</div>
            <div className="hero-rate-row"><span className="hero-rate">$28/hr</span></div>
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
        <div className="section-header"><div className="section-title">About</div></div>
        <div className="about-text">I am from Colombia, an energetic Dental Assistant enthusiastic about dental health. I earned my license in 2020 and have worked in general practice. I genuinely enjoy my work.</div>
      </div>

      <div className="section">
        <div className="cal-header"><div className="cal-title">Availability</div><div className="cal-month">April 2026</div></div>
        <div className="cal-legend"><div className="cal-legend-sq" />Tap an available day to book</div>
        <div className="cal-dow">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="cal-dow-cell">{d}</div>)}</div>
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
        <div className="chip-row"><span className="chip green">BLS CPR</span><span className="chip green">CDA</span><span className="chip">EFDA</span><span className="chip">Radiology</span></div>
      </div>
      <div className="section">
        <div className="section-header"><div className="section-title">Skills</div></div>
        <div className="chip-row">{['Alginate Impressions', 'Bilingual', 'Bone Grafting', 'Bridges', 'Crowns', 'Digital X-Rays'].map((s) => <span key={s} className="chip">{s}</span>)}</div>
      </div>
      <div className="section">
        <div className="section-header"><div className="section-title">Experience Assisting</div></div>
        <div className="chip-row">{['Endodontics', 'General Dentistry', 'Oral Surgery', 'Orthodontics'].map((s) => <span key={s} className="chip">{s}</span>)}</div>
      </div>
      <div className="section">
        <div className="section-header"><div className="section-title">Languages</div></div>
        <div className="lang-row"><span className="lang-name">Spanish</span><span className="lang-level">Native</span></div>
        <div className="lang-row"><span className="lang-name">English</span><span className="lang-level">Conversational</span></div>
      </div>

      <div className="section">
        <div className="section-header"><div className="section-title">Reviews</div></div>
        <div className="rating-summary">
          <div className="rating-big">5.0</div>
          <div className="rating-meta"><div className="rating-stars">★★★★★</div><div className="rating-count">Based on 47 reviews</div></div>
        </div>
        {[
          { logo: 'SD', name: 'Sugar Land Family Dental', when: '2 weeks ago', text: 'Alexandra was fantastic. Showed up early, jumped right in, and our hygienists loved working with her.' },
          { logo: 'BD', name: 'Bellaire Dental Group', when: '1 month ago', text: 'Professional, punctual, and great chairside manner. Highly recommend.' },
          { logo: 'MC', name: 'Memorial City Dental', when: '2 months ago', text: 'Excellent EFDA skills and very reliable. She\'s now on our preferred list.' },
        ].map((r) => (
          <div className="review" key={r.logo}>
            <div className="review-head">
              <div className="reviewer-logo">{r.logo}</div>
              <div className="reviewer-info"><div className="reviewer-name">{r.name}</div><div className="review-date">{r.when}</div></div>
              <div className="review-stars">★★★★★</div>
            </div>
            <div className="review-text">{r.text}</div>
          </div>
        ))}
        <button className="see-all">See all 47 reviews</button>
      </div>

      <div className="action-bar">
        <button className="btn btn-icon" aria-label="Save">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </button>
        <button className="btn btn-icon" aria-label="Message">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </button>
        <button className="btn btn-primary">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Book {firstName}
        </button>
      </div>
    </div>
  );
}
