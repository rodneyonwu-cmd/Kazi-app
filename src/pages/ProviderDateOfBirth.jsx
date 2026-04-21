import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 82 }, (_, i) => THIS_YEAR - 18 - i);

function Select({ label, value, onChange, options, render }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', padding: '14px 40px 14px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 15, fontWeight: 600, fontFamily: 'inherit', color: '#1a1a1a', outline: 'none', appearance: 'none', cursor: 'pointer' }}
        >
          {options.map((o) => <option key={o} value={o}>{render ? render(o) : o}</option>)}
        </select>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </label>
  );
}

function daysInMonth(month1, year) {
  return new Date(year, month1, 0).getDate();
}

export default function ProviderDateOfBirth() {
  const navigate = useNavigate();
  const [month, setMonth] = useState('3');
  const [day, setDay] = useState('14');
  const [year, setYear] = useState('1995');

  const maxDay = daysInMonth(Number(month), Number(year));
  const days = Array.from({ length: maxDay }, (_, i) => String(i + 1));
  const pretty = `${MONTHS[Number(month) - 1]} ${day}, ${year}`;

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role="provider" />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>Date of birth</div>
      </div>

      <div style={{ background: 'white', padding: '32px 24px 26px', borderBottom: '1px solid #f3f4f6', textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Your date of birth</div>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: '#1a7f5e', letterSpacing: '-0.02em' }}>{pretty}</div>
      </div>

      <div style={{ padding: '22px 20px 0', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 10 }}>
        <Select label="Month" value={month} onChange={setMonth} options={MONTHS.map((_, i) => String(i + 1))} render={(v) => MONTHS[Number(v) - 1]} />
        <Select label="Day" value={day} onChange={setDay} options={days} />
        <Select label="Year" value={year} onChange={setYear} options={YEARS.map(String)} />
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ background: 'white', border: '1.5px solid #f3f4f6', borderRadius: 14, padding: 16, display: 'flex', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 10, background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#1a7f5e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          </div>
          <div style={{ flex: 1, fontSize: 12.5, color: '#6b7280', lineHeight: 1.55 }}>Your date of birth is used to verify your identity and credential eligibility. It is not shown to offices.</div>
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <button onClick={() => navigate(-1)} style={{ width: '100%', padding: '16px 20px', borderRadius: 100, background: '#1a7f5e', color: 'white', border: 'none', fontWeight: 800, fontSize: 15, fontFamily: "'Outfit', sans-serif", cursor: 'pointer', letterSpacing: '-0.01em' }}>Save changes</button>
      </div>

      <ProviderBottomNav />
    </div>
  );
}
