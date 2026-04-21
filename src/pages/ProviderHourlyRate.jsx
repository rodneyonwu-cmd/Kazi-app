import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const PRESETS = [22, 28, 35, 45];
const MIN_RATE = 15;
const MAX_RATE = 120;

export default function ProviderHourlyRate() {
  const navigate = useNavigate();
  const [rate, setRate] = useState(28);
  const clamp = (v) => Math.max(MIN_RATE, Math.min(MAX_RATE, v));

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role="provider" />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>Hourly rate</div>
      </div>

      <div style={{ background: 'white', padding: '36px 24px 28px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 16 }}>Your base rate</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <button onClick={() => setRate((r) => clamp(r - 1))} aria-label="Decrease" style={{ width: 46, height: 46, borderRadius: '50%', background: '#f9f8f6', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1a1a1a', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, padding: 0 }}>−</button>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', minWidth: 150 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 30, color: '#1a7f5e', marginRight: 2 }}>$</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 56, color: '#1a7f5e', lineHeight: 1, letterSpacing: '-0.03em' }}>{rate}</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: '#6b7280', marginLeft: 6 }}>/hr</span>
          </div>
          <button onClick={() => setRate((r) => clamp(r + 1))} aria-label="Increase" style={{ width: 46, height: 46, borderRadius: '50%', background: '#f9f8f6', border: '1.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1a1a1a', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, padding: 0 }}>+</button>
        </div>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Common rates</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button key={p} onClick={() => setRate(p)} style={{ padding: '10px 16px', borderRadius: 100, background: rate === p ? '#1a7f5e' : 'white', color: rate === p ? 'white' : '#1a1a1a', border: `1.5px solid ${rate === p ? '#1a7f5e' : '#e5e7eb'}`, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>${p}/hr</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ background: 'white', border: '1.5px solid #f3f4f6', borderRadius: 14, padding: 16, display: 'flex', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 10, background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1a7f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          </div>
          <div style={{ flex: 1, fontSize: 12.5, color: '#6b7280', lineHeight: 1.55 }}>Offices see this as your base rate when considering you. You can still accept individual shifts at different rates.</div>
        </div>
      </div>

      <div style={{ padding: '28px 20px 0' }}>
        <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '16px 20px', borderRadius: 100, background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 800, fontSize: 15, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', letterSpacing: '-0.01em' }}>Save changes</button>
      </div>

      <ProviderBottomNav />
    </div>
  );
}
