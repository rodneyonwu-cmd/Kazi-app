import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import TopBar from '../components/TopBar';

const styles = `
.kazi-pp { --green: #1a7f5e; --green-soft: #e8f5f0; --orange: #F97316; --gold-bg: #dcfce7; --gold-text: #166534; --amber: #f4b740; --bg: #f9f8f6; --card: #fff; --text: #1a1a1a; --text-mid: #6b7280; --text-light: #9ca3af; --border: #e5e7eb; --border-soft: #f3f4f6; font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; padding-bottom: 110px; max-width: 480px; margin: 0 auto; min-height: 100vh; box-shadow: 0 0 40px rgba(0,0,0,.06); position: relative; }
.kazi-pp * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
.kazi-pp button { font-family: inherit; cursor: pointer; }
.kazi-pp .topbar { background: var(--card); padding: 14px 20px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border-soft); position: sticky; top: 0; z-index: 50; }
.kazi-pp .icon-btn { width: 36px; height: 36px; border-radius: 50%; background: var(--bg); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; padding: 0; }
.kazi-pp .icon-btn svg { width: 16px; height: 16px; stroke: var(--text); stroke-width: 2; fill: none; }
.kazi-pp .icon-btn.saved { background: #fdeee7; }
.kazi-pp .icon-btn.saved svg { stroke: #e8734a; fill: #e8734a; }
.kazi-pp .topbar-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 18px; flex: 1; letter-spacing: -.01em; }
.kazi-pp .hero-card { background: var(--card); margin: 14px 20px 0; border-radius: 14px; border: 1.5px solid var(--border); padding: 22px; }
.kazi-pp .hero-top { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
.kazi-pp .photo-wrap { position: relative; flex-shrink: 0; }
.kazi-pp .hero-photo { width: 88px; height: 88px; border-radius: 24px; background: linear-gradient(135deg,#a8c9b8,#7ab8a8); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 32px; font-family: 'Outfit', sans-serif; letter-spacing: -.02em; box-shadow: 0 4px 14px rgba(26,127,94,.12); object-fit: cover; }
.kazi-pp .photo-verified { position: absolute; bottom: -3px; right: -3px; width: 26px; height: 26px; background: var(--green); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid var(--card); }
.kazi-pp .photo-verified svg { width: 12px; height: 12px; stroke: white; stroke-width: 3; fill: none; }
.kazi-pp .hero-info { flex: 1; min-width: 0; }
.kazi-pp .hero-name { font-family: 'Outfit', sans-serif; font-size: 25px; font-weight: 800; color: var(--text); margin-bottom: 3px; letter-spacing: -.02em; }
.kazi-pp .hero-role { font-size: 14px; color: var(--text-light); margin-bottom: 6px; }
.kazi-pp .hero-rate-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.kazi-pp .hero-rate { font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; color: var(--green); letter-spacing: -.01em; }
.kazi-pp .hero-stars { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.kazi-pp .stars-val { font-size: 16px; font-weight: 800; color: var(--orange); }
.kazi-pp .reviews-ct { font-size: 13px; color: var(--text-light); }
.kazi-pp .reliability-pill { font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 100px; background: var(--gold-bg); color: var(--gold-text); }
.kazi-pp .stat-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 8px; }
.kazi-pp .stat-tile { background: var(--bg); border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 8px; text-align: center; }
.kazi-pp .stat-tile-label { font-size: 9px; font-weight: 800; color: var(--text-light); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px; }
.kazi-pp .stat-tile-val { font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 800; color: var(--text); letter-spacing: -.01em; }
.kazi-pp .stat-tile-val.green { color: var(--green); }
.kazi-pp .stat-tile-val.gold { color: var(--gold-text); }
.kazi-pp .section { background: var(--card); margin: 14px 20px 0; border-radius: 14px; padding: 20px; border: 1.5px solid var(--border); }
.kazi-pp .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.kazi-pp .section-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -.01em; }
.kazi-pp .about-text { font-size: 14px; line-height: 1.6; color: var(--text-mid); }
.kazi-pp .chip-row { display: flex; flex-wrap: wrap; gap: 7px; }
.kazi-pp .chip { background: var(--bg); color: var(--text); padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; border: 1.5px solid var(--border); }
.kazi-pp .chip.green { background: var(--green-soft); color: var(--green); border-color: var(--green-soft); }
.kazi-pp .lang-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-pp .lang-row:last-child { border-bottom: none; }
.kazi-pp .lang-name { font-size: 14px; font-weight: 600; }
.kazi-pp .lang-level { font-size: 11px; color: var(--green); background: var(--green-soft); padding: 4px 10px; border-radius: 100px; font-weight: 700; }
.kazi-pp .cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.kazi-pp .cal-title { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 16px; letter-spacing: -.01em; }
.kazi-pp .cal-month { font-weight: 700; font-size: 13px; color: var(--text-mid); }
.kazi-pp .cal-legend { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--text-light); margin-bottom: 12px; }
.kazi-pp .cal-legend-sq { width: 12px; height: 12px; border-radius: 4px; background: var(--green-soft); border: 1.5px solid #cfe8de; }
.kazi-pp .cal-dow { display: grid; grid-template-columns: repeat(7,1fr); gap: 6px; margin-bottom: 6px; }
.kazi-pp .cal-dow-cell { font-size: 10px; font-weight: 800; color: var(--text-light); text-align: center; text-transform: uppercase; letter-spacing: .05em; }
.kazi-pp .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 6px; }
.kazi-pp .cal-cell { aspect-ratio: 1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; color: var(--text); font-family: 'Outfit', sans-serif; }
.kazi-pp .cal-cell.empty { background: transparent; }
.kazi-pp .cal-cell.past { color: #d1d5db; }
.kazi-pp .cal-cell.unavail { background: var(--bg); border: 1.5px solid var(--border-soft); }
.kazi-pp .cal-cell.available { background: var(--green-soft); color: var(--green); border: 1.5px solid var(--green-soft); cursor: pointer; }
.kazi-pp .cal-cell.today { color: var(--green); border: 2px solid var(--green); }
.kazi-pp .rating-summary { display: flex; gap: 16px; align-items: center; padding: 4px 0 16px; border-bottom: 1px solid var(--border-soft); margin-bottom: 14px; }
.kazi-pp .rating-big { font-family: 'Outfit', sans-serif; font-size: 44px; font-weight: 800; line-height: 1; letter-spacing: -.02em; }
.kazi-pp .rating-meta { flex: 1; }
.kazi-pp .rating-stars { color: var(--orange); font-size: 15px; letter-spacing: 1px; margin-bottom: 3px; }
.kazi-pp .rating-count { font-size: 12px; color: var(--text-light); font-weight: 600; }
.kazi-pp .review { padding: 14px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-pp .review:last-of-type { border-bottom: none; padding-bottom: 0; }
.kazi-pp .review-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.kazi-pp .reviewer-logo { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg,#88c9a1,#7ab8d4); display: flex; align-items: center; justify-content: center; color: white; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 12px; flex-shrink: 0; }
.kazi-pp .reviewer-info { flex: 1; min-width: 0; }
.kazi-pp .reviewer-name { font-size: 13px; font-weight: 700; }
.kazi-pp .review-date { font-size: 11px; color: var(--text-light); margin-top: 1px; }
.kazi-pp .review-stars { color: var(--orange); font-size: 12px; letter-spacing: .5px; }
.kazi-pp .review-text { font-size: 13px; line-height: 1.55; color: var(--text-mid); }
.kazi-pp .see-all { display: block; width: 100%; text-align: center; background: var(--bg); border: 1.5px solid var(--border); border-radius: 100px; padding: 10px; margin-top: 14px; font-family: inherit; font-size: 12px; font-weight: 700; color: var(--text); cursor: pointer; }
.kazi-pp .action-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); max-width: 480px; width: 100%; background: var(--card); padding: 14px 20px 26px; border-top: 1px solid var(--border); display: flex; gap: 10px; z-index: 41; box-shadow: 0 -4px 20px rgba(0,0,0,.04); }
.kazi-pp .btn { padding: 13px 18px; border-radius: 100px; border: none; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; }
.kazi-pp .btn-icon { flex: 0 0 50px; padding: 13px; background: var(--bg); border: 1.5px solid var(--border); color: var(--text); }
.kazi-pp .btn-icon svg { width: 16px; height: 16px; stroke: var(--text); fill: none; stroke-width: 2; }
.kazi-pp .btn-icon.saved { background: #fdeee7; border-color: #fdeee7; }
.kazi-pp .btn-icon.saved svg { stroke: #e8734a; fill: #e8734a; }
.kazi-pp .btn-primary { background: var(--green); color: white; flex: 2; }
.kazi-pp .btn-primary svg { width: 15px; height: 15px; stroke: white; fill: none; stroke-width: 2.5; }
`;

// Mock provider lookup keyed by id
const MOCK_PROVIDERS = {
  default: {
    initials: 'AA',
    firstName: 'Alexandra',
    lastInitial: 'A',
    role: 'Dental Assistant · Houston, TX',
    rate: '$28/hr',
    rating: '5.0',
    reviewCount: 47,
    reliability: '98%',
    stats: { shifts: 130, response: '<1 hr', reliability: '98%', score: 625 },
    about: "I am from Colombia, an energetic Dental Assistant enthusiastic about dental health. I earned my license in 2020 and have worked in general practice. I genuinely enjoy my work.",
    certs: [{ label: 'BLS CPR', green: true }, { label: 'CDA', green: true }, { label: 'EFDA' }, { label: 'Radiology' }],
    skills: ['Alginate Impressions', 'Bilingual', 'Bone Grafting', 'Bridges', 'Crowns', 'Digital X-Rays'],
    experience: ['Endodontics', 'General Dentistry', 'Oral Surgery', 'Orthodontics'],
    languages: [{ name: 'Spanish', level: 'Native' }, { name: 'English', level: 'Conversational' }],
  },
};

export default function ProviderProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const provider = MOCK_PROVIDERS[id] || MOCK_PROVIDERS.default;
  const [saved, setSaved] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${provider.firstName} ${provider.lastInitial}.`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied');
    }
  };

  const handleSave = () => setSaved((s) => !s);
  const handleMessage = () => navigate('/messages');
  const handleBook = () => alert(`Booking ${provider.firstName}…`);

  return (
    <div className="kazi-pp">
      <style>{styles}</style>
      <TopBar role="office" />
      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="topbar-title">Profile</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="icon-btn" onClick={handleShare} aria-label="Share">
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
          </button>
          <button className={`icon-btn ${saved ? 'saved' : ''}`} onClick={handleSave} aria-label="Save">
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          </button>
        </div>
      </div>

      <div className="hero-card">
        <div className="hero-top">
          <div className="photo-wrap">
            <div className="hero-photo">{provider.initials}</div>
            <div className="photo-verified">
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
          </div>
          <div className="hero-info">
            <div className="hero-name">{provider.firstName} {provider.lastInitial}.</div>
            <div className="hero-role">{provider.role}</div>
            <div className="hero-rate-row"><span className="hero-rate">{provider.rate}</span></div>
            <div className="hero-stars">
              <span className="stars-val">★ {provider.rating}</span>
              <span className="reviews-ct">({provider.reviewCount} reviews)</span>
              <span className="reliability-pill">Excellent · {provider.reliability}</span>
            </div>
          </div>
        </div>
        <div className="stat-grid">
          <div className="stat-tile"><div className="stat-tile-label">Shifts</div><div className="stat-tile-val">{provider.stats.shifts}</div></div>
          <div className="stat-tile"><div className="stat-tile-label">Response</div><div className="stat-tile-val">{provider.stats.response}</div></div>
          <div className="stat-tile"><div className="stat-tile-label">Reliability</div><div className="stat-tile-val gold">{provider.stats.reliability}</div></div>
          <div className="stat-tile"><div className="stat-tile-label">Score</div><div className="stat-tile-val green">{provider.stats.score}</div></div>
        </div>
      </div>

      <div className="section">
        <div className="section-header"><div className="section-title">About</div></div>
        <div className="about-text">{provider.about}</div>
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
        <div className="chip-row">{provider.certs.map((c, i) => <span key={i} className={`chip ${c.green ? 'green' : ''}`}>{c.label}</span>)}</div>
      </div>
      <div className="section">
        <div className="section-header"><div className="section-title">Skills</div></div>
        <div className="chip-row">{provider.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
      </div>
      <div className="section">
        <div className="section-header">
          <div className="section-title">Years of Experience</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#f1f9f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: '#1a1a1a' }}>{'\u2014'}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Set during onboarding</div>
          </div>
        </div>
      </div>
      <div className="section">
        <div className="section-header"><div className="section-title">Languages</div></div>
        {provider.languages.map((l) => (
          <div key={l.name} className="lang-row"><span className="lang-name">{l.name}</span><span className="lang-level">{l.level}</span></div>
        ))}
      </div>

      <div className="section">
        <div className="section-header"><div className="section-title">Reviews</div></div>
        <div className="rating-summary">
          <div className="rating-big">{provider.rating}</div>
          <div className="rating-meta"><div className="rating-stars">★★★★★</div><div className="rating-count">Based on {provider.reviewCount} reviews</div></div>
        </div>
        {[
          { logo: 'SD', name: 'Sugar Land Family Dental', when: '2 weeks ago', text: `${provider.firstName} was fantastic. Showed up early, jumped right in, and our hygienists loved working with her. Spanish-speaking patients were thrilled. Will definitely book again.` },
          { logo: 'BD', name: 'Bellaire Dental Group', when: '1 month ago', text: 'Professional, punctual, and great chairside manner. Handled a heavy day of crown preps without missing a beat. Highly recommend.' },
          { logo: 'MC', name: 'Memorial City Dental', when: '2 months ago', text: 'Excellent EFDA skills and very reliable. Now on our preferred list.' },
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
        <button className="see-all">See all {provider.reviewCount} reviews</button>
      </div>

      <div className="action-bar">
        <button className={`btn btn-icon ${saved ? 'saved' : ''}`} onClick={handleSave} aria-label="Save">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </button>
        <button className="btn btn-icon" onClick={handleMessage} aria-label="Message">
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        </button>
        <button className="btn btn-primary" onClick={handleBook}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
          Book {provider.firstName}
        </button>
      </div>
    </div>
  );
}
