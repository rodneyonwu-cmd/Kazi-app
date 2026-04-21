import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const styles = `
.kazi-settings{--green:#1a7f5e;--green-soft:#e8f5f0;--coral:#e8734a;--coral-soft:#fdeee7;--amber:#f4b740;--amber-soft:#fef6e4;--bg:#f9f8f6;--card:#fff;--text:#1a1a1a;--text-mid:#6b7280;--text-light:#9ca3af;--border:#e5e7eb;--border-soft:#f3f4f6;--danger:#d64545;font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;padding-bottom:100px;max-width:480px;margin:0 auto;min-height:100vh;box-shadow:0 0 40px rgba(0,0,0,.06)}
.kazi-settings .topbar{position:sticky;top:0;z-index:30;background:var(--card);padding:14px 20px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--border-soft)}
.kazi-settings .icon-btn{width:36px;height:36px;border-radius:50%;background:var(--bg);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.kazi-settings .icon-btn svg{width:16px;height:16px;stroke:var(--text);stroke-width:2;fill:none}
.kazi-settings .topbar-title{font-family:'Outfit',sans-serif;font-weight:800;font-size:18px;flex:1;letter-spacing:-.01em}
.kazi-settings .search-wrap{padding:14px 20px 0;position:relative}
.kazi-settings .search-input{width:100%;padding:12px 16px 12px 42px;background:var(--card);border:1.5px solid var(--border);border-radius:100px;font-family:inherit;font-size:13px;outline:none;font-weight:500}
.kazi-settings .search-input:focus{border-color:var(--green)}
.kazi-settings .search-input::placeholder{color:var(--text-light)}
.kazi-settings .search-icon{position:absolute;left:36px;top:50%;transform:translateY(-50%);width:16px;height:16px;stroke:var(--text-light);fill:none;stroke-width:2.2}
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
.kazi-settings .toggle{width:38px;height:22px;background:var(--green);border-radius:100px;position:relative;cursor:pointer;flex-shrink:0}
.kazi-settings .toggle::after{content:'';position:absolute;top:3px;right:3px;width:16px;height:16px;background:white;border-radius:50%}
.kazi-settings .toggle.off{background:var(--border)}
.kazi-settings .toggle.off::after{right:auto;left:3px}
.kazi-settings .profile-row{display:flex;align-items:center;gap:14px;padding:18px;border-bottom:1px solid var(--border-soft);cursor:pointer}
.kazi-settings .profile-avatar{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#a8c9b8,#7ab8a8);display:flex;align-items:center;justify-content:center;color:white;font-family:'Outfit',sans-serif;font-weight:800;font-size:20px;position:relative;flex-shrink:0}
.kazi-settings .profile-avatar .cam{position:absolute;bottom:-3px;right:-3px;width:22px;height:22px;background:var(--text);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid var(--card)}
.kazi-settings .profile-avatar .cam svg{width:10px;height:10px;stroke:white;stroke-width:2.5;fill:none}
.kazi-settings .profile-info{flex:1;min-width:0}
.kazi-settings .profile-name{font-family:'Outfit',sans-serif;font-size:17px;font-weight:800;margin-bottom:2px;letter-spacing:-.01em}
.kazi-settings .profile-email{font-size:12px;color:var(--text-light)}
.kazi-settings .row.danger .row-label{color:var(--danger)}
.kazi-settings .row.danger .row-icon{background:#fef0f0}
.kazi-settings .row.danger .row-icon svg{stroke:var(--danger)}
.kazi-settings .row.master{background:var(--green-soft)}
.kazi-settings .row.master .row-icon{background:var(--card)}
.kazi-settings .row.master .row-icon svg{stroke:var(--green)}
.kazi-settings .row.master .row-label{font-weight:700;color:var(--green)}
.kazi-settings .app-footer{padding:30px 20px 20px;text-align:center}
.kazi-settings .app-logo{font-family:'Outfit',sans-serif;font-size:22px;font-weight:800;color:var(--green);letter-spacing:-.02em;margin-bottom:4px}
.kazi-settings .app-version{font-size:10px;color:var(--text-light);font-weight:600}
`;

const ChevRight = () => <svg className="row-chev" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;

export default function ProviderSettings() {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const [rapidFill, setRapidFill] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [rapidFillNotif, setRapidFillNotif] = useState(true);
  const [acceptedNotif, setAcceptedNotif] = useState(true);
  const [declinedNotif, setDeclinedNotif] = useState(true);
  const [reminderNotif, setReminderNotif] = useState(true);
  const [msgNotif, setMsgNotif] = useState(true);
  const [paymentNotif, setPaymentNotif] = useState(true);
  const [reviewNotif, setReviewNotif] = useState(true);
  const [newOfficeNotif, setNewOfficeNotif] = useState(false);
  const [kaziNotif, setKaziNotif] = useState(false);

  const handleSignOut = async () => { await signOut(); navigate('/login'); };

  return (
    <div className="kazi-settings">
      <style>{styles}</style>
      <TopBar role="provider" />

      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg></button>
        <div className="topbar-title">Settings</div>
      </div>

      <div className="search-wrap">
        <svg className="search-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input className="search-input" placeholder="Search settings" />
      </div>

      {/* PROFESSIONAL */}
      <div className="section-label">Professional</div>
      <div className="card">
        <div className="row" onClick={() => navigate('/account/setting', { state: { title: 'Hourly rate' } })}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div><div className="row-body"><div className="row-label">Hourly rate</div></div><span className="row-value" style={{color:'var(--green)',fontWeight:800}}>$28/hr</span><ChevRight /></div>
        <div className="row" onClick={() => navigate('/account/setting', { state: { title: 'Travel radius' } })}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div><div className="row-body"><div className="row-label">Travel radius</div></div><span className="row-value">15 miles</span><ChevRight /></div>
        <div className="row" onClick={() => navigate('/account/setting', { state: { title: 'Minimum shift length' } })}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg></div><div className="row-body"><div className="row-label">Minimum shift length</div></div><span className="row-value">4 hours</span><ChevRight /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></div><div className="row-body"><div className="row-label">Auto accept requests</div><div className="row-sub">Accept same-day invitations</div></div><div className={`toggle ${rapidFill ? '' : 'off'}`} onClick={() => setRapidFill(!rapidFill)} /></div>
      </div>

      {/* NOTIFICATIONS */}
      <div className="section-label">Notifications</div>
      <div className="card">
        <div className="row master"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg></div><div className="row-body"><div className="row-label">Push notifications</div></div><div className={`toggle ${pushNotif ? '' : 'off'}`} onClick={() => setPushNotif(!pushNotif)} /></div>
        <div className="row master"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div><div className="row-body"><div className="row-label">Email notifications</div></div><div className={`toggle ${emailNotif ? '' : 'off'}`} onClick={() => setEmailNotif(!emailNotif)} /></div>
        <div className="row master"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div><div className="row-body"><div className="row-label">SMS notifications</div></div><div className={`toggle ${smsNotif ? '' : 'off'}`} onClick={() => setSmsNotif(!smsNotif)} /></div>
      </div>

      <div className="section-label">What to notify me about</div>
      <div className="card">
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg></div><div className="row-body"><div className="row-label">Auto accepted shift</div><div className="row-sub">Same-day shift invites</div></div><div className={`toggle ${rapidFillNotif ? '' : 'off'}`} onClick={() => setRapidFillNotif(!rapidFillNotif)} /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div><div className="row-body"><div className="row-label">Shift request accepted</div></div><div className={`toggle ${acceptedNotif ? '' : 'off'}`} onClick={() => setAcceptedNotif(!acceptedNotif)} /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></div><div className="row-body"><div className="row-label">Shift request declined</div></div><div className={`toggle ${declinedNotif ? '' : 'off'}`} onClick={() => setDeclinedNotif(!declinedNotif)} /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div><div className="row-body"><div className="row-label">Shift reminders</div><div className="row-sub">24 hours and 1 hour before</div></div><div className={`toggle ${reminderNotif ? '' : 'off'}`} onClick={() => setReminderNotif(!reminderNotif)} /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg></div><div className="row-body"><div className="row-label">Messages from offices</div></div><div className={`toggle ${msgNotif ? '' : 'off'}`} onClick={() => setMsgNotif(!msgNotif)} /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg></div><div className="row-body"><div className="row-label">Payment received</div></div><div className={`toggle ${paymentNotif ? '' : 'off'}`} onClick={() => setPaymentNotif(!paymentNotif)} /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg></div><div className="row-body"><div className="row-label">Reviews received</div></div><div className={`toggle ${reviewNotif ? '' : 'off'}`} onClick={() => setReviewNotif(!reviewNotif)} /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg></div><div className="row-body"><div className="row-label">New offices in your area</div></div><div className={`toggle ${newOfficeNotif ? '' : 'off'}`} onClick={() => setNewOfficeNotif(!newOfficeNotif)} /></div>
        <div className="row"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div><div className="row-body"><div className="row-label">Kazi product updates</div></div><div className={`toggle ${kaziNotif ? '' : 'off'}`} onClick={() => setKaziNotif(!kaziNotif)} /></div>
      </div>

      {/* LEGAL */}
      <div className="section-label">Legal</div>
      <div className="card">
        <div className="row" onClick={() => navigate('/account/setting', { state: { title: 'Terms of Service', description: 'The full Terms of Service document will appear here.' } })}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg></div><div className="row-body"><div className="row-label">Terms of Service</div></div><ChevRight /></div>
        <div className="row" onClick={() => navigate('/account/setting', { state: { title: 'Privacy Policy', description: 'The full Privacy Policy will appear here.' } })}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div><div className="row-body"><div className="row-label">Privacy Policy</div></div><ChevRight /></div>
        <div className="row" onClick={() => navigate('/account/setting', { state: { title: 'Community Guidelines', description: 'Kazi community guidelines will appear here.' } })}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg></div><div className="row-body"><div className="row-label">Community Guidelines</div></div><ChevRight /></div>
      </div>

      {/* DANGER ZONE */}
      <div className="section-label">Danger zone</div>
      <div className="card">
        <div className="row danger"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div><div className="row-body"><div className="row-label">Deactivate account</div><div className="row-sub">Pause temporarily</div></div><ChevRight /></div>
        <div className="row danger"><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg></div><div className="row-body"><div className="row-label">Delete account</div><div className="row-sub">Permanent — cannot be undone</div></div><ChevRight /></div>
        <div className="row danger" onClick={handleSignOut}><div className="row-icon"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg></div><div className="row-body"><div className="row-label">Sign out</div></div></div>
      </div>

      <div className="app-footer">
        <div className="app-logo">kazi.</div>
        <div className="app-version">Version 1.0.0 · Build 142</div>
      </div>

      <ProviderBottomNav />
    </div>
  );
}
