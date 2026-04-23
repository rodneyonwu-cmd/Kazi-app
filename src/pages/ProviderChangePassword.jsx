import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';
import BottomNav from '../components/BottomNav';
import useUserRole from '../hooks/useUserRole';

function Field({ label, value, onChange, show, onToggleShow }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          style={{ width: '100%', padding: '14px 48px 14px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 15, fontFamily: 'inherit', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? 'Hide password' : 'Show password'}
          style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 34, height: 34, borderRadius: '50%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {show ? (
              <>
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.78 19.78 0 0 1 5.06-6.06" />
                <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.78 19.78 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            ) : (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ProviderChangePassword() {
  const navigate = useNavigate();
  const { isOffice } = useUserRole();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const lenOk = next.length >= 8;
  const matchOk = next.length > 0 && next === confirm;
  const canSave = current.length > 0 && lenOk && matchOk;

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role={isOffice ? 'office' : 'provider'} />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>Change password</div>
      </div>

      <div style={{ padding: '24px 20px 8px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>Use a password that's at least 8 characters. We recommend a mix of letters, numbers, and symbols.</div>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <Field label="Current password" value={current} onChange={setCurrent} show={showCurrent} onToggleShow={() => setShowCurrent(!showCurrent)} />
        <Field label="New password" value={next} onChange={setNext} show={showNext} onToggleShow={() => setShowNext(!showNext)} />
        <Field label="Confirm new password" value={confirm} onChange={setConfirm} show={showConfirm} onToggleShow={() => setShowConfirm(!showConfirm)} />
      </div>

      <div style={{ padding: '8px 22px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Checkline ok={lenOk} text="At least 8 characters" />
          <Checkline ok={matchOk} text="Both new password fields match" />
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <button
          disabled={!canSave}
          onClick={() => navigate(-1)}
          style={{ width: '100%', padding: '16px 20px', borderRadius: 100, background: canSave ? '#1a7f5e' : '#e5e7eb', color: canSave ? 'white' : '#9ca3af', border: 'none', fontWeight: 800, fontSize: 15, fontFamily: "'Outfit', sans-serif", cursor: canSave ? 'pointer' : 'not-allowed', letterSpacing: '-0.01em' }}
        >
          Update password
        </button>
      </div>

      {isOffice ? <BottomNav /> : <ProviderBottomNav />}
    </div>
  );
}

function Checkline({ ok, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: ok ? '#1a7f5e' : '#9ca3af', fontWeight: 600 }}>
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={ok ? '#1a7f5e' : '#d1d5db'} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {text}
    </div>
  );
}
