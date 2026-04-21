import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const OPTIONS = [
  { hours: 2, label: '2 hours', sub: 'Short fill-ins' },
  { hours: 4, label: '4 hours', sub: 'Half day minimum' },
  { hours: 6, label: '6 hours', sub: 'Most shifts qualify' },
  { hours: 8, label: '8 hours', sub: 'Full day only' },
];

export default function ProviderMinimumShift() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(4);

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role="provider" />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>Minimum shift length</div>
      </div>

      <div style={{ padding: '24px 20px 8px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>What's the shortest shift you'll accept? Anything below this won't appear in your feed.</div>
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        {OPTIONS.map((opt) => {
          const isSel = selected === opt.hours;
          return (
            <button key={opt.hours} onClick={() => setSelected(opt.hours)} style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 18px',
              marginBottom: 10,
              background: 'white',
              border: `1.5px solid ${isSel ? '#1a7f5e' : '#e5e7eb'}`,
              borderRadius: 16,
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              textAlign: 'left',
              boxShadow: isSel ? '0 2px 12px rgba(26,127,94,0.12)' : 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: isSel ? '#1a7f5e' : '#f9f8f6', color: isSel ? 'white' : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>{opt.hours}h</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: '#1a1a1a', marginBottom: 2 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>{opt.sub}</div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${isSel ? '#1a7f5e' : '#e5e7eb'}`, background: isSel ? '#1a7f5e' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {isSel && <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '16px 20px', borderRadius: 100, background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 800, fontSize: 15, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', letterSpacing: '-0.01em' }}>Save changes</button>
      </div>

      <ProviderBottomNav />
    </div>
  );
}
