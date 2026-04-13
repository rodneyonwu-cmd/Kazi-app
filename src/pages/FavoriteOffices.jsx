import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const styles = `
  .kazi-favorites {
    min-height: 100vh;
    background: #f9f8f6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding-bottom: 80px;
  }

  .kazi-favorites .container {
    max-width: 520px;
    margin: 0 auto;
    padding: 20px 16px 96px;
  }

  .kazi-favorites .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    font-weight: 600;
    color: #9ca3af;
    background: none;
    border: none;
    cursor: pointer;
    margin-bottom: 12px;
    transition: color 0.2s;
    font-family: inherit;
    padding: 0;
  }

  .kazi-favorites .back-btn:hover {
    color: #374151;
  }

  .kazi-favorites .page-title {
    font-size: 20px;
    font-weight: 900;
    color: #1a1a1a;
    margin-bottom: 2px;
  }

  .kazi-favorites .page-sub {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 16px;
  }

  .kazi-favorites .office-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .kazi-favorites .office-card:hover {
    border-color: #1a7f5e;
  }

  .kazi-favorites .office-avatar {
    width: 38px;
    height: 38px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 900;
    flex-shrink: 0;
  }

  .kazi-favorites .office-info {
    flex: 1;
    min-width: 0;
  }

  .kazi-favorites .office-name {
    font-size: 13px;
    font-weight: 800;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;
  }

  .kazi-favorites .office-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #6b7280;
  }

  .kazi-favorites .dot {
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #d1d5db;
  }

  .kazi-favorites .star {
    font-weight: 600;
    color: #F97316;
  }

  .kazi-favorites .bookmark-btn {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #ef4444;
    cursor: pointer;
    transition: border-color 0.2s;
    flex-shrink: 0;
  }

  .kazi-favorites .bookmark-btn:hover {
    border-color: #ef4444;
  }

  .kazi-favorites .office-rate {
    font-size: 11px;
    font-weight: 700;
    color: #1a7f5e;
    flex-shrink: 0;
  }

  {/* Confirmation modal */}
  .kazi-favorites .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 200;
  }

  .kazi-favorites .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 20px;
    padding: 24px;
    width: calc(100% - 32px);
    max-width: 340px;
    z-index: 210;
    box-shadow: 0 25px 50px rgba(0,0,0,0.25);
    text-align: center;
  }

  .kazi-favorites .modal-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #fee2e2;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }

  .kazi-favorites .modal-title {
    font-size: 16px;
    font-weight: 900;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .kazi-favorites .modal-desc {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 20px;
  }

  .kazi-favorites .modal-buttons {
    display: flex;
    gap: 8px;
  }

  .kazi-favorites .btn-cancel {
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

  .kazi-favorites .btn-remove {
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

  .kazi-favorites .btn-remove:hover {
    background: #dc2626;
  }

  {/* Empty state */}
  .kazi-favorites .empty-state {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 40px 20px;
    text-align: center;
  }

  .kazi-favorites .empty-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #e8f5f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .kazi-favorites .empty-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .kazi-favorites .empty-desc {
    font-size: 13px;
    color: #9ca3af;
    max-width: 260px;
    margin: 0 auto 16px;
  }

  @media (max-width: 480px) {
    .kazi-favorites .container {
      padding: 16px 14px 96px;
    }
  }
`;

const mockOffices = [
  {
    id: 'bs',
    name: 'Bright Smile Dental',
    initials: 'BS',
    type: 'General',
    distance: '3.2 mi',
    rating: '4.9',
    rate: '$55/hr',
    bg: '#e8f5f0',
    color: '#1a7f5e',
  },
  {
    id: 'mc',
    name: 'Missouri City Dental',
    initials: 'MC',
    type: 'Pediatric',
    distance: '5.1 mi',
    rating: '4.7',
    rate: '$50/hr',
    bg: '#ede9fe',
    color: '#7c3aed',
  },
  {
    id: 'bd',
    name: 'Bellaire Dental Group',
    initials: 'BD',
    type: 'Orthodontics',
    distance: '2.8 mi',
    rating: '4.8',
    rate: '$60/hr',
    bg: '#fef3c7',
    color: '#d97706',
  },
  {
    id: 'sl',
    name: 'Sugar Land Family Dental',
    initials: 'SL',
    type: 'Family',
    distance: '7.4 mi',
    rating: '4.6',
    rate: '$48/hr',
    bg: '#dbeafe',
    color: '#2563eb',
  },
];

export default function FavoriteOffices() {
  const navigate = useNavigate();
  const [confirmOffice, setConfirmOffice] = useState(null);

  return (
    <div className="kazi-favorites">
      <style>{styles}</style>
      <TopBar role="provider" />

      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>

        <h1 className="page-title">Favorite Offices</h1>
        <p className="page-sub">{mockOffices.length} saved office{mockOffices.length !== 1 ? 's' : ''}</p>

        {/* Office Cards */}
        {mockOffices.map((office) => (
          <div
            key={office.id}
            className="office-card"
            onClick={() => navigate('/office/demo')}
          >
            <div
              className="office-avatar"
              style={{ background: office.bg, color: office.color }}
            >
              {office.initials}
            </div>
            <div className="office-info">
              <div className="office-name">{office.name}</div>
              <div className="office-meta">
                <span>{office.type}</span>
                <span className="dot" />
                <span>{office.distance}</span>
                <span className="dot" />
                <span className="star">&#9733; {office.rating}</span>
              </div>
            </div>
            <span className="office-rate">{office.rate}</span>
            <button
              className="bookmark-btn"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOffice({ name: office.name, id: office.id });
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmOffice !== null && (
        <>
          <div className="modal-backdrop" onClick={() => setConfirmOffice(null)} />
          <div className="modal">
            <div className="modal-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div className="modal-title">Remove from favorites?</div>
            <div className="modal-desc">
              Are you sure you want to remove <strong>{confirmOffice.name}</strong> from your favorite offices?
            </div>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setConfirmOffice(null)}>Cancel</button>
              <button
                className="btn-remove"
                onClick={() => {
                  /* TODO: API delete call */
                  setConfirmOffice(null);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </>
      )}

      <ProviderBottomNav />
    </div>
  );
}
