import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function Text({ label, value, onChange, placeholder, type = 'text', maxLength }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{ width: '100%', padding: '14px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 15, fontFamily: 'inherit', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  );
}

export default function ProviderHomeAddress() {
  const navigate = useNavigate();
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('Houston');
  const [state, setState] = useState('TX');
  const [zip, setZip] = useState('77056');

  const zipOk = /^\d{5}$/.test(zip);
  const canSave = street.trim().length > 3 && city.trim().length > 0 && state && zipOk;

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role="provider" />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>Home address</div>
      </div>

      <div style={{ padding: '24px 20px 8px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>We use your home address to calculate distance from shifts and your travel radius. Offices never see your exact address.</div>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <Text label="Street address" value={street} onChange={setStreet} placeholder="1234 Main St" />
        <Text label="Apartment, suite, etc. (optional)" value={apt} onChange={setApt} placeholder="Apt 4B" />
        <Text label="City" value={city} onChange={setCity} placeholder="Houston" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>State</label>
            <div style={{ position: 'relative' }}>
              <select value={state} onChange={(e) => setState(e.target.value)} style={{ width: '100%', padding: '14px 40px 14px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 15, fontWeight: 600, fontFamily: 'inherit', color: '#1a1a1a', outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          <Text label="ZIP" value={zip} onChange={(v) => setZip(v.replace(/\D/g, '').slice(0, 5))} placeholder="77056" />
        </div>
      </div>

      <div style={{ padding: '12px 20px 0' }}>
        <button
          disabled={!canSave}
          onClick={() => navigate(-1)}
          style={{ width: '100%', padding: '16px 20px', borderRadius: 100, background: canSave ? '#1a7f5e' : '#e5e7eb', color: canSave ? 'white' : '#9ca3af', border: 'none', fontWeight: 800, fontSize: 15, fontFamily: "'Outfit', sans-serif", cursor: canSave ? 'pointer' : 'not-allowed', letterSpacing: '-0.01em' }}
        >
          Save changes
        </button>
      </div>

      <ProviderBottomNav />
    </div>
  );
}
