import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const styles = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  .kazi-finance {
    min-height: 100vh;
    background: #f9f8f6;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding-bottom: 80px;
  }

  .kazi-finance .container {
    max-width: 520px;
    margin: 0 auto;
    padding: 20px 16px 96px;
  }

  .kazi-finance .page-title {
    font-size: 20px;
    font-weight: 900;
    color: #1a1a1a;
    margin-bottom: 12px;
  }

  .kazi-finance .tabs {
    display: flex;
    gap: 6px;
    margin-bottom: 20px;
    flex-wrap: wrap;
    overflow-x: auto;
  }

  .kazi-finance .tab {
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #6b7280;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    font-family: inherit;
  }

  .kazi-finance .tab:hover {
    border-color: #1a7f5e;
  }

  .kazi-finance .tab.active {
    background: #1a7f5e;
    border-color: #1a7f5e;
    color: #fff;
  }

  .kazi-finance .section-label {
    font-size: 10px;
    font-weight: 800;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }

  .kazi-finance .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 8px 12px;
    margin-bottom: 12px;
  }

  .kazi-finance .search-bar input {
    border: none;
    outline: none;
    font-size: 13px;
    color: #1a1a1a;
    background: transparent;
    width: 100%;
    font-family: inherit;
  }

  .kazi-finance .search-bar input::placeholder {
    color: #9ca3af;
  }

  .kazi-finance .tx-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 9px;
    padding: 10px 12px;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .kazi-finance .tx-info {
    flex: 1;
    min-width: 0;
  }

  .kazi-finance .tx-name {
    font-size: 11px;
    font-weight: 700;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .kazi-finance .tx-meta {
    font-size: 10px;
    color: #9ca3af;
  }

  .kazi-finance .tx-right {
    text-align: right;
    flex-shrink: 0;
  }

  .kazi-finance .tx-amount {
    font-size: 12px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .kazi-finance .tx-amount.deposited {
    color: #1a7f5e;
  }

  .kazi-finance .tx-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 999px;
    display: inline-block;
  }

  .kazi-finance .tx-badge.deposited {
    background: #e8f5f0;
    color: #1a7f5e;
  }

  .kazi-finance .tx-badge.processing {
    background: #fef9c3;
    color: #92400e;
  }

  .kazi-finance .empty-state {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 40px 20px;
    text-align: center;
  }

  .kazi-finance .empty-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #e8f5f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .kazi-finance .empty-title {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .kazi-finance .empty-desc {
    font-size: 13px;
    color: #9ca3af;
    max-width: 280px;
    margin: 0 auto;
  }

  {/* Payout tab styles */}
  .kazi-finance .payout-desc {
    font-size: 13px;
    color: #9ca3af;
    margin-bottom: 12px;
  }

  .kazi-finance .bank-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .kazi-finance .bank-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #e8f5f0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .kazi-finance .bank-name {
    font-size: 12px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .kazi-finance .bank-detail {
    font-size: 10px;
    color: #9ca3af;
  }

  .kazi-finance .bank-badge {
    font-size: 9px;
    font-weight: 700;
    background: #e8f5f0;
    color: #1a7f5e;
    padding: 2px 6px;
    border-radius: 999px;
    margin-left: auto;
    flex-shrink: 0;
  }

  .kazi-finance .add-card {
    background: #fff;
    border: 2px dashed #e5e7eb;
    border-radius: 10px;
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .kazi-finance .add-card:hover {
    border-color: #1a7f5e;
  }

  .kazi-finance .add-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .kazi-finance .add-label {
    font-size: 12px;
    font-weight: 700;
    color: #9ca3af;
  }

  .kazi-finance .add-sub {
    font-size: 10px;
    color: #9ca3af;
  }

  {/* Tax tab styles */}
  .kazi-finance .tax-row {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .kazi-finance .tax-row:hover {
    border-color: #1a7f5e;
  }

  .kazi-finance .tax-label {
    font-size: 13px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .kazi-finance .tax-sub {
    font-size: 11px;
    color: #9ca3af;
  }

  .kazi-finance .tax-status {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }

  .kazi-finance .tax-status.pending {
    background: #fef9c3;
    color: #92400e;
  }

  .kazi-finance .tax-status.complete {
    background: #e8f5f0;
    color: #1a7f5e;
  }

  @media (max-width: 480px) {
    .kazi-finance .container {
      padding: 16px 14px 96px;
    }
  }
`;

const mockTransactions = [
  { id: 1, office: 'Bright Smile Dental', date: 'Mar 15, 2026', hrs: '8 hrs', amount: '$420.00', status: 'deposited' },
  { id: 2, office: 'Missouri City Dental', date: 'Mar 12, 2026', hrs: '6 hrs', amount: '$315.00', status: 'deposited' },
  { id: 3, office: 'Bellaire Dental Group', date: 'Mar 10, 2026', hrs: '8 hrs', amount: '$440.00', status: 'processing' },
  { id: 4, office: 'Sugar Land Family Dental', date: 'Mar 8, 2026', hrs: '4 hrs', amount: '$210.00', status: 'deposited' },
  { id: 5, office: 'Katy Smiles', date: 'Mar 5, 2026', hrs: '8 hrs', amount: '$400.00', status: 'deposited' },
];

export default function ProviderFinance() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="kazi-finance">
      <style>{styles}</style>
      <TopBar role="provider" />

      <div className="container">
        <h1 className="page-title">Finance</h1>

        {/* Tab Navigation */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Transaction History
          </button>
          <button
            className={`tab ${activeTab === 'payout' ? 'active' : ''}`}
            onClick={() => setActiveTab('payout')}
          >
            Payout Accounts
          </button>
          <button
            className={`tab ${activeTab === 'tax' ? 'active' : ''}`}
            onClick={() => setActiveTab('tax')}
          >
            Tax Information
          </button>
        </div>

        {/* Transaction History Panel */}
        {activeTab === 'history' && (
          <div>
            <div className="section-label">Deposit history</div>

            {/* Search bar (decorative) */}
            <div className="search-bar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search transactions..." readOnly />
            </div>

            {mockTransactions.map((tx) => (
              <div key={tx.id} className="tx-card">
                <div className="tx-info">
                  <div className="tx-name">{tx.office}</div>
                  <div className="tx-meta">{tx.date} &middot; {tx.hrs}</div>
                </div>
                <div className="tx-right">
                  <div className={`tx-amount ${tx.status}`}>{tx.amount}</div>
                  <span className={`tx-badge ${tx.status}`}>
                    {tx.status === 'deposited' ? 'Deposited' : 'Processing'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payout Accounts Panel */}
        {activeTab === 'payout' && (
          <div>
            <div className="section-label">Payout account</div>

            {/* Connected bank card */}
            <div className="bank-card">
              <div className="bank-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div>
                <div className="bank-name">Chase Bank ****4892</div>
                <div className="bank-detail">Checking &middot; Connected via Stripe</div>
              </div>
              <span className="bank-badge">Primary</span>
            </div>

            {/* Add bank account */}
            <div className="add-card">
              <div className="add-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <div>
                <div className="add-label">Add bank account</div>
                <div className="add-sub">Securely connected via Stripe</div>
              </div>
            </div>
          </div>
        )}

        {/* Tax Information Panel */}
        {activeTab === 'tax' && (
          <div>
            <div className="section-label">Tax documents &amp; info</div>

            <div className="tax-row">
              <div>
                <div className="tax-label">W-9 Form</div>
                <div className="tax-sub">Required for all independent contractors</div>
              </div>
              <span className="tax-status pending">Pending</span>
            </div>

            <div className="tax-row">
              <div>
                <div className="tax-label">SSN / EIN</div>
                <div className="tax-sub">Required for tax reporting</div>
              </div>
              <span className="tax-status pending">Not submitted</span>
            </div>

            <div className="tax-row">
              <div>
                <div className="tax-label">1099-NEC (2025)</div>
                <div className="tax-sub">Available after year-end</div>
              </div>
              <span className="tax-status complete">Available</span>
            </div>

            <div className="tax-row">
              <div>
                <div className="tax-label">YTD Earnings Summary</div>
                <div className="tax-sub">Current year earnings breakdown</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <ProviderBottomNav />
    </div>
  );
}
