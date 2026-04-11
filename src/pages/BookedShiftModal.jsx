import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = `
.kazi-bsm * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.kazi-bsm {
  --green: #1a7f5e;
  --green-soft: #e8f3ee;
  --green-tint: #f1f9f5;
  --coral: #e8734a;
  --coral-soft: #fdeee7;
  --amber: #f4b740;
  --amber-soft: #fef6e4;
  --bg: #f9f8f6;
  --card: #ffffff;
  --text: #1a1a1a;
  --text-mid: #5a5a5a;
  --text-light: #8a8a8a;
  --border: #ececec;
  --border-soft: #f3f3f3;
  --danger: #d64545;
  font-family: 'DM Sans', sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}
.kazi-bsm .backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 200;
}
.kazi-bsm .sheet-wrap {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  z-index: 201;
  display: flex;
  justify-content: center;
}
.kazi-bsm .sheet {
  position: relative;
  width: 100%;
  background: var(--bg);
  border-radius: 28px 28px 0 0;
  max-height: 92vh;
  overflow-y: auto;
  padding-bottom: 20px;
  animation: kaziBsmSlide 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
@keyframes kaziBsmSlide { from { transform: translateY(100%); } to { transform: translateY(0); } }
.kazi-bsm .handle { width: 40px; height: 4px; background: var(--border); border-radius: 100px; margin: 10px auto 0; }
.kazi-bsm .close-btn { position: absolute; top: 18px; right: 18px; width: 32px; height: 32px; border-radius: 50%; background: var(--card); border: 1px solid var(--border-soft); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; font-family: inherit; }
.kazi-bsm .close-btn svg { width: 14px; height: 14px; stroke: var(--text); stroke-width: 2.5; fill: none; }
.kazi-bsm .countdown { margin: 20px 20px 0; background: linear-gradient(135deg, var(--green) 0%, #15604a 100%); border-radius: 18px; padding: 16px 18px; color: white; display: flex; align-items: center; gap: 12px; overflow: hidden; position: relative; }
.kazi-bsm .countdown::before { content: ''; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(255,255,255,0.15), transparent 70%); border-radius: 50%; }
.kazi-bsm .countdown-icon { width: 40px; height: 40px; border-radius: 12px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative; }
.kazi-bsm .countdown-icon svg { width: 18px; height: 18px; stroke: white; fill: none; stroke-width: 2; }
.kazi-bsm .countdown-text { position: relative; }
.kazi-bsm .countdown-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.6px; opacity: 0.8; font-weight: 600; }
.kazi-bsm .countdown-value { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 700; margin-top: 2px; }
.kazi-bsm .office-hero { background: var(--card); margin: 14px 20px 0; border-radius: 20px; padding: 20px; border: 1px solid var(--border-soft); }
.kazi-bsm .office-row { display: flex; gap: 14px; align-items: center; }
.kazi-bsm .office-logo { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #88c9a1, #7ab8d4); display: flex; align-items: center; justify-content: center; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 20px; color: white; flex-shrink: 0; }
.kazi-bsm .office-info { flex: 1; min-width: 0; }
.kazi-bsm .office-name { font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 21px; color: var(--text); margin-bottom: 4px; line-height: 1.2; }
.kazi-bsm .office-meta { font-size: 12px; color: var(--text-light); display: flex; align-items: center; gap: 6px; }
.kazi-bsm .office-meta .star { color: var(--amber); }
.kazi-bsm .history-pill { background: var(--green-tint); color: var(--green); font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 100px; margin-top: 6px; display: inline-block; }
.kazi-bsm .details { background: var(--card); margin: 14px 20px 0; border-radius: 20px; padding: 4px 20px; border: 1px solid var(--border-soft); }
.kazi-bsm .detail-row { display: flex; align-items: flex-start; gap: 14px; padding: 16px 0; border-bottom: 1px solid var(--border-soft); }
.kazi-bsm .detail-row:last-child { border-bottom: none; }
.kazi-bsm .detail-icon { width: 36px; height: 36px; border-radius: 11px; background: var(--green-tint); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kazi-bsm .detail-icon svg { width: 16px; height: 16px; stroke: var(--green); stroke-width: 2; fill: none; }
.kazi-bsm .detail-content { flex: 1; min-width: 0; }
.kazi-bsm .detail-label { font-size: 11px; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-bottom: 3px; }
.kazi-bsm .detail-value { font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.3; }
.kazi-bsm .detail-sub { font-size: 12px; color: var(--text-mid); margin-top: 2px; }
.kazi-bsm .directions-btn { margin-top: 8px; display: inline-flex; align-items: center; gap: 5px; background: var(--green-tint); color: var(--green); padding: 6px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; border: none; cursor: pointer; font-family: inherit; }
.kazi-bsm .directions-btn svg { width: 11px; height: 11px; stroke: var(--green); stroke-width: 2.5; fill: none; }
.kazi-bsm .pay-highlight .detail-icon { background: var(--amber-soft); }
.kazi-bsm .pay-highlight .detail-icon svg { stroke: var(--amber); }
.kazi-bsm .pay-total { font-family: 'Outfit', sans-serif; font-size: 22px; font-weight: 800; color: var(--green); }
.kazi-bsm .cancel-note { margin: 14px 20px 0; background: var(--amber-soft); border: 1px solid #f5e3b8; border-radius: 14px; padding: 12px 14px; display: flex; gap: 10px; align-items: flex-start; }
.kazi-bsm .cancel-note svg { width: 16px; height: 16px; stroke: #b8860b; fill: none; stroke-width: 2.2; flex-shrink: 0; margin-top: 1px; }
.kazi-bsm .cancel-note-text { font-size: 12px; color: #8b6914; line-height: 1.4; }
.kazi-bsm .cancel-note-text strong { color: #6b4e0a; }
.kazi-bsm .actions { padding: 18px 20px 0; display: flex; flex-direction: column; gap: 10px; }
.kazi-bsm .btn { padding: 15px 20px; border-radius: 100px; border: none; font-family: inherit; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
.kazi-bsm .btn-primary { background: var(--green); color: white; }
.kazi-bsm .btn-primary svg { width: 16px; height: 16px; stroke: white; stroke-width: 2.5; fill: none; }
.kazi-bsm .btn-cancel { background: none; color: var(--danger); padding: 12px; font-size: 13px; }
`;

export default function BookedShiftModal({ shift, onClose, onCancelShift, onMessageOffice }) {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!shift) return null;

  const handleMessage = () => {
    if (onMessageOffice) onMessageOffice(shift);
    else navigate('/messages');
  };

  const handleCancel = () => {
    if (window.confirm('Cancel this shift? This may affect your reliability score.')) {
      if (onCancelShift) onCancelShift(shift);
      onClose && onClose();
    }
  };

  const handleDirections = () => {
    const q = encodeURIComponent(shift.address || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  return (
    <div className="kazi-bsm">
      <style>{styles}</style>
      <div className="backdrop" onClick={onClose} />
      <div className="sheet-wrap">
        <div className="sheet">
          <div className="handle" />
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>

          <div className="office-hero" style={{ marginTop: '20px' }}>
            <div className="office-row">
              <div className="office-logo">{shift.officeInitials || 'SD'}</div>
              <div className="office-info">
                <div className="office-name">{shift.officeName || 'Sugar Land Family Dental'}</div>
                <div className="office-meta">
                  <span className="star">★</span> <strong style={{ color: 'var(--text)' }}>{shift.officeRating || '4.9'}</strong> · {shift.officeBookingCount || 12} Kazi bookings
                </div>
                {shift.priorBookings ? <div className="history-pill">You've worked here {shift.priorBookings} times</div> : null}
              </div>
            </div>
          </div>

          <div className="details">
            <div className="detail-row">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              </div>
              <div className="detail-content">
                <div className="detail-label">Date & Time</div>
                <div className="detail-value">{shift.dateTime || 'Friday, Apr 11 · 8:00 AM – 5:00 PM'}</div>
                <div className="detail-sub">{shift.duration || '9 hours · 1 hour lunch break'}</div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
              </div>
              <div className="detail-content">
                <div className="detail-label">Role</div>
                <div className="detail-value">{shift.role || 'Dental Assistant (RDA)'}</div>
                <div className="detail-sub">{shift.roleSub || 'General dentistry · Chairside assisting'}</div>
              </div>
            </div>

            <div className="detail-row pay-highlight">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              </div>
              <div className="detail-content">
                <div className="detail-label">Pay</div>
                <div className="pay-total">${(shift.payTotal || 252).toFixed(2)}</div>
                <div className="detail-sub">{shift.paySub || '$28/hr × 8 paid hours'}</div>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon">
                <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
              </div>
              <div className="detail-content">
                <div className="detail-label">Location</div>
                <div className="detail-value">{shift.address || '4521 Highway 6, Sugar Land, TX'}</div>
                <div className="detail-sub">{shift.distance || '12 miles · ~22 min drive'}</div>
                <button className="directions-btn" onClick={handleDirections}>
                  <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11" /></svg>
                  Get Directions
                </button>
              </div>
            </div>
          </div>

          <div className="cancel-note">
            <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <div className="cancel-note-text">
              <strong>Cancelling within 24 hours</strong> will affect your reliability score and may impact your Top % badge.
            </div>
          </div>

          <div className="actions">
            <button className="btn btn-primary" onClick={handleMessage}>
              <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              Message Office
            </button>
            <button className="btn btn-cancel" onClick={handleCancel}>Cancel Shift</button>
          </div>
        </div>
      </div>
    </div>
  );
}
