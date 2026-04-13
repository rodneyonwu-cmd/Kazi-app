import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const styles = `
  .kazi-settings {
    min-height: 100vh;
    background: #f9f8f6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding-bottom: 80px;
  }

  .kazi-settings .container {
    max-width: 672px;
    margin: 0 auto;
    padding: 24px 16px;
    width: 100%;
  }

  .kazi-settings .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #9ca3af;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 16px;
    transition: color 0.2s;
    font-family: inherit;
    padding: 0;
  }

  .kazi-settings .back-btn:hover {
    color: #374151;
  }

  .kazi-settings .page-title {
    font-size: 22px;
    font-weight: 900;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .kazi-settings .page-sub {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 0;
  }

  .kazi-settings .header {
    margin-bottom: 24px;
  }

  .kazi-settings .card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    padding: 16px 20px;
    margin-bottom: 16px;
  }

  .kazi-settings .card-title {
    font-size: 15px;
    font-weight: 900;
    color: #1a1a1a;
    margin-bottom: 16px;
  }

  .kazi-settings .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;
  }

  .kazi-settings .setting-label {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .kazi-settings .setting-sub {
    font-size: 12px;
    color: #9ca3af;
  }

  .kazi-settings .divider {
    height: 1px;
    background: #f3f4f6;
    margin: 16px 0;
  }

  .kazi-settings .toggle {
    width: 44px;
    height: 24px;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
    position: relative;
    background: #1a7f5e;
  }

  .kazi-settings .toggle.off {
    background: #d1d5db;
  }

  .kazi-settings .toggle-knob {
    position: absolute;
    top: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    transition: left 0.2s;
    left: 20px;
  }

  .kazi-settings .toggle.off .toggle-knob {
    left: 2px;
  }

  {/* Account section - no padding card */}
  .kazi-settings .account-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .kazi-settings .account-header {
    font-size: 15px;
    font-weight: 900;
    color: #1a1a1a;
    padding: 16px 20px;
    border-bottom: 1px solid #f3f4f6;
  }

  .kazi-settings .account-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .kazi-settings .account-row:hover {
    background: #f9f8f6;
  }

  .kazi-settings .account-row + .account-row {
    border-top: 1px solid #f3f4f6;
  }

  .kazi-settings .account-label {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .kazi-settings .account-sub {
    font-size: 12px;
    color: #9ca3af;
  }

  {/* Danger zone */}
  .kazi-settings .danger-card {
    background: #fff;
    border: 1px solid #fee2e2;
    border-radius: 18px;
    padding: 16px 20px;
  }

  .kazi-settings .danger-title {
    font-size: 15px;
    font-weight: 900;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .kazi-settings .danger-sub {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 16px;
  }

  .kazi-settings .danger-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .kazi-settings .btn-deactivate {
    width: 100%;
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #374151;
    font-weight: 700;
    padding: 12px;
    min-height: 44px;
    border-radius: 999px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    font-family: inherit;
  }

  .kazi-settings .btn-deactivate:hover {
    border-color: #ef4444;
    color: #ef4444;
  }

  .kazi-settings .btn-delete {
    width: 100%;
    background: #fee2e2;
    color: #991b1b;
    font-weight: 700;
    padding: 12px;
    min-height: 44px;
    border-radius: 999px;
    font-size: 13px;
    border: none;
    cursor: pointer;
    transition: background 0.2s;
    font-family: inherit;
  }

  .kazi-settings .btn-delete:hover {
    background: #fecaca;
  }

  {/* Toast */}
  .kazi-settings .toast {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a1a;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    padding: 10px 16px;
    border-radius: 999px;
    z-index: 300;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    white-space: nowrap;
  }

  .kazi-settings .toast-check {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #1a7f5e;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  {/* Modal */}
  .kazi-settings .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 40;
  }

  .kazi-settings .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 20px;
    padding: 24px;
    width: calc(100% - 32px);
    max-width: 340px;
    max-height: 90vh;
    overflow-y: auto;
    z-index: 50;
    box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  }

  .kazi-settings .modal-title {
    font-size: 18px;
    font-weight: 900;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .kazi-settings .modal-desc {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 20px;
  }

  .kazi-settings .modal-buttons {
    display: flex;
    gap: 8px;
  }

  .kazi-settings .btn-cancel {
    flex: 1;
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #374151;
    font-weight: 700;
    padding: 12px;
    min-height: 44px;
    border-radius: 999px;
    font-size: 13px;
    cursor: pointer;
    font-family: inherit;
  }

  .kazi-settings .btn-confirm-delete {
    flex: 1;
    background: #ef4444;
    color: #fff;
    font-weight: 700;
    padding: 12px;
    min-height: 44px;
    border-radius: 999px;
    font-size: 13px;
    border: none;
    cursor: pointer;
    font-family: inherit;
  }

  @media (max-width: 480px) {
    .kazi-settings .container {
      padding: 16px 14px;
    }
    .kazi-settings .card {
      padding: 16px;
    }
  }
`;

export default function ProviderSettings() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const userEmail = user?.primaryEmailAddress?.emailAddress || 'provider@email.com';

  /* Notification channel toggles */
  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);

  /* Notification type toggles */
  const [shiftInvites, setShiftInvites] = useState(true);
  const [rapidFill, setRapidFill] = useState(true);
  const [messages, setMessages] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [payouts, setPayouts] = useState(true);
  const [marketing, setMarketing] = useState(false);

  /* Privacy toggles */
  const [profileVisible, setProfileVisible] = useState(true);
  const [showRatings, setShowRatings] = useState(true);
  const [weekendAvail, setWeekendAvail] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const notifTypes = [
    { label: 'Shift invitations', sub: 'When an office invites you to a shift', value: shiftInvites, set: setShiftInvites },
    { label: 'Rapid Fill alerts', sub: 'Urgent shift openings near you', value: rapidFill, set: setRapidFill },
    { label: 'New messages', sub: 'When an office sends you a message', value: messages, set: setMessages },
    { label: 'Shift reminders', sub: '24 hours before your confirmed shift', value: reminders, set: setReminders },
    { label: 'Payout updates', sub: 'When your earnings are processed', value: payouts, set: setPayouts },
    { label: 'Tips & updates', sub: 'Product news and platform updates', value: marketing, set: setMarketing },
  ];

  return (
    <div className="kazi-settings">
      <style>{styles}</style>
      <TopBar role="provider" />

      {/* Toast notification */}
      {toast && (
        <div className="toast">
          <div className="toast-check">
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      <div className="container">
        <div className="header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <h1 className="page-title">Settings</h1>
          <p className="page-sub">Manage your account preferences</p>
        </div>

        {/* Notification Channels */}
        <div className="card">
          <div className="card-title">Notification channels</div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Push notifications</div>
              <div className="setting-sub">Receive alerts on your device</div>
            </div>
            <div className={`toggle ${pushNotif ? '' : 'off'}`} onClick={() => setPushNotif(!pushNotif)}>
              <div className="toggle-knob" />
            </div>
          </div>

          <div className="divider" />

          <div className="setting-row">
            <div>
              <div className="setting-label">Email notifications</div>
              <div className="setting-sub">{userEmail}</div>
            </div>
            <div className={`toggle ${emailNotif ? '' : 'off'}`} onClick={() => setEmailNotif(!emailNotif)}>
              <div className="toggle-knob" />
            </div>
          </div>

          <div className="divider" />

          <div className="setting-row">
            <div>
              <div className="setting-label">SMS notifications</div>
              <div className="setting-sub">Text alerts for urgent shifts</div>
            </div>
            <div className={`toggle ${smsNotif ? '' : 'off'}`} onClick={() => setSmsNotif(!smsNotif)}>
              <div className="toggle-knob" />
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="card">
          <div className="card-title">Notification types</div>
          {notifTypes.map(({ label, sub, value, set }, i) => (
            <div key={label}>
              <div className="setting-row">
                <div>
                  <div className="setting-label">{label}</div>
                  <div className="setting-sub">{sub}</div>
                </div>
                <div className={`toggle ${value ? '' : 'off'}`} onClick={() => set(!value)}>
                  <div className="toggle-knob" />
                </div>
              </div>
              {i < notifTypes.length - 1 && <div className="divider" />}
            </div>
          ))}
        </div>

        {/* Privacy Preferences */}
        <div className="card">
          <div className="card-title">Privacy</div>

          <div className="setting-row">
            <div>
              <div className="setting-label">Profile visible to offices</div>
              <div className="setting-sub">Allow offices to discover your profile</div>
            </div>
            <div className={`toggle ${profileVisible ? '' : 'off'}`} onClick={() => setProfileVisible(!profileVisible)}>
              <div className="toggle-knob" />
            </div>
          </div>

          <div className="divider" />

          <div className="setting-row">
            <div>
              <div className="setting-label">Show ratings on profile</div>
              <div className="setting-sub">Display your rating to offices</div>
            </div>
            <div className={`toggle ${showRatings ? '' : 'off'}`} onClick={() => setShowRatings(!showRatings)}>
              <div className="toggle-knob" />
            </div>
          </div>

          <div className="divider" />

          <div className="setting-row">
            <div>
              <div className="setting-label">Weekend availability</div>
              <div className="setting-sub">Show you are available on weekends</div>
            </div>
            <div className={`toggle ${weekendAvail ? '' : 'off'}`} onClick={() => setWeekendAvail(!weekendAvail)}>
              <div className="toggle-knob" />
            </div>
          </div>
        </div>

        {/* Account */}
        <div className="account-card">
          <div className="account-header">Account</div>

          <div className="account-row" onClick={() => openUserProfile()}>
            <div>
              <div className="account-label">Change email</div>
              <div className="account-sub">{userEmail}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div className="account-row" onClick={() => openUserProfile()}>
            <div>
              <div className="account-label">Change password</div>
              <div className="account-sub">Update your password</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div className="account-row" onClick={() => openUserProfile()}>
            <div>
              <div className="account-label">Linked accounts</div>
              <div className="account-sub">Google</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>

          <div className="account-row" onClick={async () => { await signOut(); navigate('/login'); }}>
            <div>
              <div className="account-label" style={{ color: '#ef4444' }}>Sign out</div>
              <div className="account-sub">Log out of your account</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="danger-card">
          <div className="danger-title">Danger zone</div>
          <div className="danger-sub">These actions are permanent and cannot be undone.</div>
          <div className="danger-buttons">
            <button className="btn-deactivate" onClick={() => showToast('Account deactivation coming soon')}>
              Deactivate account
            </button>
            <button className="btn-delete" onClick={() => setShowDeleteConfirm(true)}>
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)} />
          <div className="modal">
            <div className="modal-title">Delete account?</div>
            <div className="modal-desc">This will permanently delete your profile, history, and all data. This cannot be undone.</div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
              <button className="btn-confirm-delete" onClick={() => setShowDeleteConfirm(false)}>Delete</button>
            </div>
          </div>
        </>
      )}

      <ProviderBottomNav />
    </div>
  );
}
