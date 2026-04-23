import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';
import BottomNav from '../components/BottomNav';
import useUserRole from '../hooks/useUserRole';

function formatPhone(raw) {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function ProviderPhoneNumber() {
  const navigate = useNavigate();
  const { isOffice } = useUserRole();
  const [phone, setPhone] = useState(isOffice ? '(281) 555-0142' : '(713) 555-0142');
  const digits = phone.replace(/\D/g, '');
  const valid = digits.length === 10;

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role={isOffice ? 'office' : 'provider'} />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>{isOffice ? 'Office phone' : 'Phone number'}</div>
      </div>

      <div style={{ padding: '24px 20px 6px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>Offices use your phone only to coordinate a shift after booking. We'll text a code to confirm any change.</div>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Mobile number</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ padding: '14px 14px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>🇺🇸 +1</div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(555) 000-0000"
            style={{ flex: 1, padding: '14px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 15, fontFamily: 'inherit', color: '#1a1a1a', outline: 'none' }}
          />
        </div>
      </div>

      <div style={{ padding: '16px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: valid ? '#1a7f5e' : '#9ca3af', fontWeight: 600 }}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={valid ? '#1a7f5e' : '#d1d5db'} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Valid 10-digit US number
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <button
          disabled={!valid}
          onClick={() => navigate(-1)}
          style={{ width: '100%', padding: '16px 20px', borderRadius: 100, background: valid ? '#1a7f5e' : '#e5e7eb', color: valid ? 'white' : '#9ca3af', border: 'none', fontWeight: 800, fontSize: 15, fontFamily: "'Outfit', sans-serif", cursor: valid ? 'pointer' : 'not-allowed', letterSpacing: '-0.01em' }}
        >
          Send verification code
        </button>
      </div>

      {isOffice ? <BottomNav /> : <ProviderBottomNav />}
    </div>
  );
}
