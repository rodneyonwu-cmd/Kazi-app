import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const MIN_R = 5;
const MAX_R = 50;
const TICKS = [5, 10, 15, 25, 50];

export default function ProviderTravelRadius() {
  const navigate = useNavigate();
  const [miles, setMiles] = useState(15);
  const pct = ((miles - MIN_R) / (MAX_R - MIN_R)) * 100;

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role="provider" />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>Travel radius</div>
      </div>

      <div style={{ background: 'white', padding: '36px 24px 30px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 14 }}>How far will you travel?</div>
        <div style={{ textAlign: 'center', display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 68, color: '#1a7f5e', lineHeight: 1, letterSpacing: '-0.03em' }}>{miles}</span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 17, color: '#6b7280', marginLeft: 8 }}>miles</span>
        </div>
      </div>

      <div style={{ padding: '32px 24px 0' }}>
        <div style={{ position: 'relative', height: 6, background: '#e5e7eb', borderRadius: 100 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: '#1a7f5e', borderRadius: 100 }} />
          <input type="range" min={MIN_R} max={MAX_R} value={miles} onChange={(e) => setMiles(Number(e.target.value))} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} aria-label="Travel radius in miles" />
          <div style={{ position: 'absolute', left: `calc(${pct}% - 12px)`, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24, borderRadius: '50%', background: 'white', border: '3px solid #1a7f5e', boxShadow: '0 2px 6px rgba(0,0,0,0.12)', pointerEvents: 'none' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, padding: '0 2px' }}>
          {TICKS.map((t) => (
            <button key={t} onClick={() => setMiles(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: miles === t ? '#1a7f5e' : '#9ca3af', fontFamily: "'DM Sans', sans-serif", padding: '4px 2px' }}>{t} mi</button>
          ))}
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ background: 'white', border: '1.5px solid #f3f4f6', borderRadius: 14, padding: 16, display: 'flex', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 10, background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1a7f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
          </div>
          <div style={{ flex: 1, fontSize: 12.5, color: '#6b7280', lineHeight: 1.55 }}>We'll only show shifts within this distance of your home address. A larger radius means more shifts — and more driving.</div>
        </div>
      </div>

      <div style={{ padding: '28px 20px 0' }}>
        <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '16px 20px', borderRadius: 100, background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 800, fontSize: 15, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', letterSpacing: '-0.01em' }}>Save changes</button>
      </div>

      <ProviderBottomNav />
    </div>
  );
}
