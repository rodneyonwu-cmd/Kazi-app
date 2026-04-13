import { useState } from 'react';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const styles = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.kazi-finance{--green:#1a7f5e;--green-d:#156649;--green-soft:#e8f5f0;--gold:#f4b740;--gold-bg:#fef6e4;--gold-text:#8b6914;--coral:#e8734a;--coral-soft:#fdeee7;--bg:#f9f8f6;--card:#fff;--text:#1a1a1a;--text-mid:#6b7280;--text-light:#9ca3af;--border:#e5e7eb;--border-soft:#f3f4f6;font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;padding-bottom:100px;max-width:480px;margin:0 auto;min-height:100vh;box-shadow:0 0 40px rgba(0,0,0,.06)}
.kazi-finance .page-title{font-family:'Outfit',sans-serif;font-size:28px;font-weight:800;letter-spacing:-.02em;padding:22px 20px 18px}
.kazi-finance .tabs{display:flex;gap:8px;padding:0 20px;margin-bottom:22px;overflow-x:auto;scrollbar-width:none}
.kazi-finance .tabs::-webkit-scrollbar{display:none}
.kazi-finance .tab{flex-shrink:0;background:var(--card);border:1.5px solid var(--border);color:var(--text-mid);font-family:inherit;font-size:13px;font-weight:700;padding:10px 18px;border-radius:100px;cursor:pointer;white-space:nowrap}
.kazi-finance .tab.active{background:var(--green);color:white;border-color:var(--green)}
.kazi-finance .section-label{font-size:11px;font-weight:800;color:var(--text-light);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;padding-left:4px}
.kazi-finance .search-wrap{position:relative;margin-bottom:12px;padding:0 20px}
.kazi-finance .search-input{width:100%;padding:12px 16px 12px 42px;background:var(--card);border:1.5px solid var(--border);border-radius:100px;font-family:inherit;font-size:13px;color:var(--text);outline:none;font-weight:500}
.kazi-finance .search-input:focus{border-color:var(--green)}
.kazi-finance .search-input::placeholder{color:var(--text-light)}
.kazi-finance .search-icon{position:absolute;left:36px;top:50%;transform:translateY(-50%);width:16px;height:16px;stroke:var(--text-light);fill:none;stroke-width:2.2;pointer-events:none}
.kazi-finance .tx-list{background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:6px 20px;margin:0 20px}
.kazi-finance .tx-row{display:flex;align-items:center;gap:12px;padding:16px 0;border-bottom:1px solid var(--border-soft);cursor:pointer}
.kazi-finance .tx-row:last-child{border-bottom:none}
.kazi-finance .tx-logo{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-family:'Outfit',sans-serif;font-weight:800;font-size:13px;flex-shrink:0}
.kazi-finance .tx-info{flex:1;min-width:0}
.kazi-finance .tx-name{font-size:14px;font-weight:700;margin-bottom:2px}
.kazi-finance .tx-meta{font-size:11px;color:var(--text-light)}
.kazi-finance .tx-right{text-align:right}
.kazi-finance .tx-amt{font-family:'Outfit',sans-serif;font-size:16px;font-weight:800;color:var(--green)}
.kazi-finance .tx-status{font-size:9px;font-weight:700;padding:2px 8px;border-radius:100px;margin-top:3px;display:inline-block;text-transform:uppercase;letter-spacing:.3px;background:var(--green-soft);color:var(--green)}
.kazi-finance .bank-connected{background:var(--card);border:1.5px solid var(--border);border-radius:16px;padding:18px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;margin:0 20px}
.kazi-finance .bank-icon-wrap{width:44px;height:44px;border-radius:12px;background:var(--green-soft);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.kazi-finance .bank-icon-wrap svg{width:20px;height:20px;stroke:var(--green);stroke-width:2;fill:none}
.kazi-finance .bank-body{flex:1;min-width:0}
.kazi-finance .bank-name-row{font-family:'Outfit',sans-serif;font-size:15px;font-weight:800;margin-bottom:3px;letter-spacing:-.01em}
.kazi-finance .bank-verified{font-size:11px;color:var(--green);font-weight:700;display:flex;align-items:center;gap:4px}
.kazi-finance .bank-verified svg{width:10px;height:10px;stroke:var(--green);stroke-width:3;fill:none}
.kazi-finance .bank-chev{width:16px;height:16px;stroke:var(--text-light);stroke-width:2;fill:none;flex-shrink:0}
.kazi-finance .add-another-btn{width:calc(100% - 40px);margin:10px 20px 0;background:var(--card);color:var(--green);border:1.5px dashed var(--green);border-radius:100px;padding:12px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer}
.kazi-finance .stripe-note{text-align:center;font-size:10px;color:var(--text-light);margin-top:14px;font-weight:600}
.kazi-finance .tax-row{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:var(--card);border:1.5px solid var(--border);border-radius:14px;margin:0 20px 10px;cursor:pointer}
.kazi-finance .tax-info{flex:1}
.kazi-finance .tax-label{font-size:14px;font-weight:700;color:var(--text);margin-bottom:2px}
.kazi-finance .tax-sub{font-size:11px;color:var(--text-light)}
.kazi-finance .tax-val{font-family:'Outfit',sans-serif;font-size:16px;font-weight:800;color:var(--green);letter-spacing:-.01em}
.kazi-finance .tax-row svg.chev{width:14px;height:14px;stroke:var(--text-light);stroke-width:2;fill:none}
`;

export default function ProviderFinance() {
  const [activeTab, setActiveTab] = useState('history');

  return (
    <div className="kazi-finance">
      <style>{styles}</style>
      <TopBar role="provider" />

      <div className="page-title">Finance</div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Transaction History</button>
        <button className={`tab ${activeTab === 'payout' ? 'active' : ''}`} onClick={() => setActiveTab('payout')}>Payout Accounts</button>
        <button className={`tab ${activeTab === 'tax' ? 'active' : ''}`} onClick={() => setActiveTab('tax')}>Tax Information</button>
      </div>

      {/* TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div>
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input className="search-input" placeholder="Search by office, role, or date" />
          </div>
          <div style={{ padding: '0 20px', marginBottom: 10 }}><div className="section-label">Deposit History</div></div>
          <div className="tx-list">
            <div className="tx-row"><div className="tx-logo" style={{background:'linear-gradient(135deg,#a8c9b8,#7ab8a8)'}}>MC</div><div className="tx-info"><div className="tx-name">Missouri City Dental</div><div className="tx-meta">Apr 10 · Hygienist · Paying out Apr 15</div></div><div className="tx-right"><div className="tx-amt" style={{color:'var(--gold-text)'}}>$493</div><span className="tx-status" style={{background:'var(--gold-bg)',color:'var(--gold-text)'}}>Pending</span></div></div>
            <div className="tx-row"><div className="tx-logo" style={{background:'linear-gradient(135deg,#7ab8d4,#5a9bb8)'}}>BS</div><div className="tx-info"><div className="tx-name">Bright Smile Dental</div><div className="tx-meta">Apr 9 · Hygienist · Paying out Apr 15</div></div><div className="tx-right"><div className="tx-amt" style={{color:'var(--gold-text)'}}>$440</div><span className="tx-status" style={{background:'var(--gold-bg)',color:'var(--gold-text)'}}>Pending</span></div></div>
            <div className="tx-row"><div className="tx-logo" style={{background:'linear-gradient(135deg,#c8a8d4,#9b88c4)'}}>BD</div><div className="tx-info"><div className="tx-name">Bellaire Dental Group</div><div className="tx-meta">Apr 7 · RDA · 7 hrs</div></div><div className="tx-right"><div className="tx-amt">$314.50</div><span className="tx-status">Paid</span></div></div>
            <div className="tx-row"><div className="tx-logo" style={{background:'linear-gradient(135deg,#e8a87c,#d48864)'}}>MM</div><div className="tx-info"><div className="tx-name">Memorial City Dental</div><div className="tx-meta">Apr 2 · Hygienist · 8 hrs</div></div><div className="tx-right"><div className="tx-amt">$480</div><span className="tx-status">Paid</span></div></div>
            <div className="tx-row"><div className="tx-logo" style={{background:'linear-gradient(135deg,#a8c9b8,#7ab8a8)'}}>SL</div><div className="tx-info"><div className="tx-name">Sugar Land Family Dental</div><div className="tx-meta">Mar 28 · RDA · 8 hrs</div></div><div className="tx-right"><div className="tx-amt">$400</div><span className="tx-status">Paid</span></div></div>
          </div>
        </div>
      )}

      {/* PAYOUT ACCOUNTS */}
      {activeTab === 'payout' && (
        <div>
          <div style={{ padding: '0 20px', marginBottom: 10 }}><div className="section-label">Payout Method</div></div>
          <div className="bank-connected">
            <div className="bank-icon-wrap"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v3" /><path d="M12 14v3" /><path d="M16 14v3" /></svg></div>
            <div className="bank-body"><div className="bank-name-row">Chase ••4521</div><div className="bank-verified"><svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>Verified · Payouts enabled</div></div>
            <svg className="bank-chev" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <button className="add-another-btn">+ Add another account</button>
          <div className="stripe-note">Powered by Stripe Connect</div>
        </div>
      )}

      {/* TAX INFORMATION */}
      {activeTab === 'tax' && (
        <div>
          <div style={{ padding: '0 20px', marginBottom: 10 }}><div className="section-label">Tax Documents</div></div>
          <div className="tax-row">
            <div className="tax-info"><div className="tax-label">2026 Earnings (YTD)</div><div className="tax-sub">Taxable income this year</div></div>
            <div className="tax-val">$11,240</div>
          </div>
          <div className="tax-row">
            <div className="tax-info"><div className="tax-label">Download 1099</div><div className="tax-sub">Available January 2027</div></div>
            <svg className="chev" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <div className="tax-row">
            <div className="tax-info"><div className="tax-label">W-9 Form</div><div className="tax-sub">Last updated Feb 2026 ✓</div></div>
            <svg className="chev" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        </div>
      )}

      <ProviderBottomNav />
    </div>
  );
}
