import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

export default function ProviderSettingStub() {
  const navigate = useNavigate();
  const location = useLocation();
  const title = location.state?.title || 'Setting';
  const description = location.state?.description || `${title} editor is coming soon.`;

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 100, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role="provider" />
      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>{title}</div>
      </div>
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, color: '#1a1a1a', marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55, maxWidth: 320, margin: '0 auto' }}>{description}</div>
      </div>
      <ProviderBottomNav />
    </div>
  );
}
