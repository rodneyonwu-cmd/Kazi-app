import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const styles = `
.kazi-favorites{--green:#1a7f5e;--green-soft:#e8f5f0;--gold:#f4b740;--coral:#e8734a;--coral-soft:#fdeee7;--bg:#f9f8f6;--card:#fff;--text:#1a1a1a;--text-mid:#6b7280;--text-light:#9ca3af;--border:#e5e7eb;--border-soft:#f3f4f6;--danger:#d64545;font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;padding-bottom:100px;max-width:480px;margin:0 auto;min-height:100vh;box-shadow:0 0 40px rgba(0,0,0,.06)}
.kazi-favorites .topbar{background:var(--card);padding:14px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-soft)}
.kazi-favorites .icon-btn{width:36px;height:36px;border-radius:50%;background:var(--bg);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.kazi-favorites .icon-btn svg{width:16px;height:16px;stroke:var(--text);stroke-width:2;fill:none}
.kazi-favorites .topbar-title{font-family:'Outfit',sans-serif;font-weight:800;font-size:18px;flex:1;letter-spacing:-.01em}
.kazi-favorites .meta-bar{display:flex;justify-content:space-between;align-items:center;padding:16px 20px 8px}
.kazi-favorites .count{font-size:13px;color:var(--text-mid);font-weight:600}
.kazi-favorites .count strong{color:var(--text);font-weight:800}
.kazi-favorites .office-card{background:var(--card);margin:0 20px 10px;border-radius:14px;border:1.5px solid var(--border);padding:14px;cursor:pointer}
.kazi-favorites .card-top{display:flex;gap:12px;align-items:center}
.kazi-favorites .office-logo{width:46px;height:46px;border-radius:13px;display:flex;align-items:center;justify-content:center;color:white;font-family:'Outfit',sans-serif;font-weight:800;font-size:14px;flex-shrink:0;position:relative;letter-spacing:-.01em}
.kazi-favorites .logo-a{background:linear-gradient(135deg,#a8c9b8,#7ab8a8)}
.kazi-favorites .logo-b{background:linear-gradient(135deg,#7ab8d4,#5a9bb8)}
.kazi-favorites .logo-c{background:linear-gradient(135deg,#c8a8d4,#9b88c4)}
.kazi-favorites .logo-d{background:linear-gradient(135deg,#e8a87c,#d48864)}
.kazi-favorites .verified-badge{position:absolute;bottom:-2px;right:-2px;width:18px;height:18px;background:var(--green);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--card)}
.kazi-favorites .verified-badge svg{width:9px;height:9px;stroke:white;stroke-width:3;fill:none}
.kazi-favorites .office-info{flex:1;min-width:0}
.kazi-favorites .office-name-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:3px}
.kazi-favorites .name-with-dist{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap;min-width:0}
.kazi-favorites .name-with-dist .office-name{font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;letter-spacing:-.01em;line-height:1.25;color:var(--text)}
.kazi-favorites .name-with-dist .dist{font-size:12px;color:var(--text-light);font-weight:600;line-height:1.25}
.kazi-favorites .heart-btn{background:none;border:none;padding:2px;cursor:pointer;flex-shrink:0}
.kazi-favorites .heart-btn svg{width:22px;height:22px;stroke:var(--green);fill:var(--green);stroke-width:2}
.kazi-favorites .rating-row{display:flex;align-items:center;gap:6px;font-size:14px}
.kazi-favorites .stars{color:var(--gold);font-size:15px}
.kazi-favorites .rating-num{font-weight:800;color:var(--text)}
.kazi-favorites .review-count{color:var(--text-light)}
.kazi-favorites .backdrop{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:flex-end;justify-content:center}
.kazi-favorites .confirm-sheet{background:var(--card);width:100%;max-width:480px;border-radius:24px 24px 0 0;padding:24px 24px 32px;position:relative;animation:favSlideUp .25s ease-out}
@keyframes favSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
.kazi-favorites .sheet-handle{width:40px;height:4px;background:var(--border);border-radius:100px;margin:0 auto 18px}
.kazi-favorites .confirm-icon{width:56px;height:56px;border-radius:50%;background:var(--green-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 14px}
.kazi-favorites .confirm-icon svg{width:24px;height:24px;stroke:var(--green);stroke-width:2;fill:var(--green)}
.kazi-favorites .confirm-title{font-family:'Outfit',sans-serif;font-size:19px;font-weight:800;letter-spacing:-.01em;text-align:center;margin-bottom:6px}
.kazi-favorites .confirm-body{font-size:13px;color:var(--text-mid);text-align:center;line-height:1.5;margin-bottom:20px}
.kazi-favorites .confirm-body strong{color:var(--text);font-weight:700}
.kazi-favorites .confirm-btn{width:100%;padding:14px;border-radius:100px;border:none;font-family:inherit;font-size:14px;font-weight:800;cursor:pointer}
.kazi-favorites .confirm-btn.cancel{background:var(--bg);color:var(--text);border:1.5px solid var(--border)}
.kazi-favorites .confirm-btn.remove{background:var(--danger);color:white}
`;

const OFFICES = [
  { id: 'bs', name: 'Bright Smile Dental', initials: 'BS', logo: 'logo-b', dist: '3.1 mi', rating: '4.8', reviews: 18 },
  { id: 'mc', name: 'Missouri City Dental', initials: 'MC', logo: 'logo-a', dist: '4.2 mi', rating: '4.9', reviews: 124 },
  { id: 'bd', name: 'Bellaire Dental Group', initials: 'BD', logo: 'logo-c', dist: '6.8 mi', rating: '4.7', reviews: 42 },
  { id: 'sl', name: 'Sugar Land Family Dental', initials: 'SL', logo: 'logo-d', dist: '12 mi', rating: '5.0', reviews: 37 },
];

export default function ProviderFavorites() {
  const navigate = useNavigate();
  const [confirmOffice, setConfirmOffice] = useState(null);

  return (
    <div className="kazi-favorites">
      <style>{styles}</style>
      <TopBar role="provider" />

      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="topbar-title">Favorite Offices</div>
      </div>

      <div className="meta-bar">
        <div className="count"><strong>{OFFICES.length}</strong> saved offices</div>
      </div>

      {OFFICES.map((o) => (
        <div key={o.id} className="office-card" onClick={() => navigate(`/office/${o.id}`)}>
          <div className="card-top">
            <div className={`office-logo ${o.logo}`}>
              {o.initials}
              <div className="verified-badge"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
            </div>
            <div className="office-info">
              <div className="office-name-row">
                <div className="name-with-dist">
                  <span className="office-name">{o.name}</span>
                  <span className="dist">· {o.dist}</span>
                </div>
                <button className="heart-btn" onClick={(e) => { e.stopPropagation(); setConfirmOffice(o); }}>
                  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                </button>
              </div>
              <div className="rating-row">
                <span className="stars">★</span>
                <span className="rating-num">{o.rating}</span>
                <span className="review-count">({o.reviews})</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Confirmation modal */}
      {confirmOffice && (
        <div className="backdrop" onClick={() => setConfirmOffice(null)}>
          <div className="confirm-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="confirm-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg></div>
            <div className="confirm-title">Remove from Favorites?</div>
            <div className="confirm-body"><strong>{confirmOffice.name}</strong> will be removed from your favorites.</div>
            <button className="confirm-btn remove" style={{ marginBottom: 10 }} onClick={() => setConfirmOffice(null)}>Remove</button>
            <button className="confirm-btn cancel" onClick={() => setConfirmOffice(null)}>Cancel</button>
          </div>
        </div>
      )}

      <ProviderBottomNav />
    </div>
  );
}
