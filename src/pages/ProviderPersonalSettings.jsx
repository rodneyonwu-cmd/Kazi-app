import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';

function getStoredPhoto() {
  try { return localStorage.getItem('kazi_profile_photo') || null; } catch { return null; }
}

const styles = `
.kazi-settings{--green:#1a7f5e;--green-soft:#e8f5f0;--coral:#e8734a;--coral-soft:#fdeee7;--amber:#f4b740;--amber-soft:#fef6e4;--bg:#f9f8f6;--card:#fff;--text:#1a1a1a;--text-mid:#6b7280;--text-light:#9ca3af;--border:#e5e7eb;--border-soft:#f3f4f6;--danger:#d64545;font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;padding-bottom:100px;max-width:480px;margin:0 auto;min-height:100vh;box-shadow:0 0 40px rgba(0,0,0,.06)}
.kazi-settings .topbar{position:sticky;top:0;z-index:30;background:var(--card);padding:14px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-soft)}
.kazi-settings .icon-btn{width:36px;height:36px;border-radius:50%;background:var(--bg);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.kazi-settings .icon-btn svg{width:16px;height:16px;stroke:var(--text);stroke-width:2;fill:none}
.kazi-settings .topbar-title{font-family:'Outfit',sans-serif;font-weight:800;font-size:18px;flex:1;letter-spacing:-.01em}
.kazi-settings .section-label{font-size:11px;font-weight:800;color:var(--text-light);text-transform:uppercase;letter-spacing:.08em;margin:22px 24px 8px}
.kazi-settings .card{background:var(--card);margin:0 20px;border-radius:14px;border:1.5px solid var(--border);overflow:hidden}
.kazi-settings .row{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--border-soft);cursor:pointer;min-height:56px}
.kazi-settings .row:last-child{border-bottom:none}
.kazi-settings .row-icon{width:34px;height:34px;border-radius:10px;background:var(--bg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.kazi-settings .row-icon svg{width:15px;height:15px;stroke:var(--text-mid);stroke-width:2;fill:none}
.kazi-settings .row-body{flex:1;min-width:0}
.kazi-settings .row-label{font-size:13px;font-weight:600;color:var(--text);line-height:1.3}
.kazi-settings .row-sub{font-size:11px;color:var(--text-light);margin-top:2px}
.kazi-settings .row-value{font-size:12px;color:var(--text-mid);font-weight:600;text-align:right}
.kazi-settings .row-chev{width:14px;height:14px;stroke:var(--text-light);stroke-width:2;fill:none;flex-shrink:0}
.kazi-settings .profile-row{display:flex;align-items:center;gap:14px;padding:18px;border-bottom:1px solid var(--border-soft);cursor:pointer}
.kazi-settings .profile-avatar{width:56px;height:56px;border-radius:16px;overflow:hidden;position:relative;flex-shrink:0;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.kazi-settings .profile-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.kazi-settings .profile-avatar .cam{position:absolute;bottom:-3px;right:-3px;width:22px;height:22px;background:var(--text);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid var(--card)}
.kazi-settings .profile-avatar .cam svg{width:10px;height:10px;stroke:white;stroke-width:2.5;fill:none}
.kazi-settings .profile-info{flex:1;min-width:0}
.kazi-settings .profile-name{font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-bottom:2px;letter-spacing:-.01em}
.kazi-settings .profile-email{font-size:12px;color:var(--text-light)}
`;

const ChevRight = () => <svg className="row-chev" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;

export default function ProviderPersonalSettings() {
  const navigate = useNavigate();
  const { user } = useUser();
  const firstName = user?.firstName || 'Rodney';
  const lastName = user?.lastName || 'Onwu';
  const fullName = `${firstName} ${lastName}`.trim();
  const email = user?.primaryEmailAddress?.emailAddress || 'rodney@email.com';
  const avatarUrl = getStoredPhoto() || user?.imageUrl || DEFAULT_PHOTO;

  return (
    <div className="kazi-settings">
      <style>{styles}</style>
      <TopBar role="provider" />

      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg></button>
        <div className="topbar-title">Personal settings</div>
      </div>

      <div className="section-label">Account</div>
      <div className="card">
        <div className="profile-row" onClick={() => navigate('/account/profile-photo')}>
          <div className="profile-avatar">
            <img src={avatarUrl} alt={fullName} />
            <div className="cam"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg></div>
          </div>
          <div className="profile-info"><div className="profile-name">{fullName}</div><div className="profile-email">{email}</div></div>
          <ChevRight />
        </div>
        <div className="row" onClick={() => navigate('/account/change-password')}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div><div className="row-body"><div className="row-label">Change password</div></div><ChevRight /></div>
        <div className="row" onClick={() => navigate('/account/phone')}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13 1 .37 1.97.72 2.88a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.88.59 2.88.72A2 2 0 0 1 22 16.92z" /></svg></div><div className="row-body"><div className="row-label">Phone number</div><div className="row-sub">(713) 555-0142 · Verified</div></div><ChevRight /></div>
        <div className="row" onClick={() => navigate('/account/date-of-birth')}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg></div><div className="row-body"><div className="row-label">Date of birth</div></div><span className="row-value">Mar 14, 1995</span><ChevRight /></div>
        <div className="row" onClick={() => navigate('/account/home-address')}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div><div className="row-body"><div className="row-label">Home address</div><div className="row-sub">Houston, TX 77056</div></div><ChevRight /></div>
      </div>

      <ProviderBottomNav />
    </div>
  );
}
