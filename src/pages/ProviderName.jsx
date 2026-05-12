import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';
import BottomNav from '../components/BottomNav';
import useUserRole from '../hooks/useUserRole';

// ============================================================
// Edit name page — first + last. Persists to Clerk via
// user.update({ firstName, lastName }) so changes show up in
// every place that reads from useUser() (TopBar avatar menu,
// ProviderPersonalSettings, ProfessionalProfile self-view, etc.).
// ============================================================

export default function ProviderName() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { isOffice } = useUserRole();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const valid = firstName.trim().length > 0 && lastName.trim().length > 0;
  const dirty = isLoaded && (firstName !== (user?.firstName || '') || lastName !== (user?.lastName || ''));

  const onSave = async () => {
    if (!valid || !dirty || saving || !user) return;
    setSaving(true);
    setError('');
    try {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      navigate(-1);
    } catch (e) {
      setError(e?.errors?.[0]?.message || e?.message || 'Could not save your name. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role={isOffice ? 'office' : 'provider'} />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>Your name</div>
      </div>

      <div style={{ padding: '24px 20px 6px' }}>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
          Offices see your full first name and last initial (e.g. "Rodney O."). This is also how your bookings, reviews, and Lounge posts are signed.
        </div>
      </div>

      <div style={{ padding: '18px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>First name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            autoComplete="given-name"
            style={{ width: '100%', padding: '14px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 15, fontFamily: 'inherit', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Last name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
            style={{ width: '100%', padding: '14px 16px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, fontSize: 15, fontFamily: 'inherit', color: '#1a1a1a', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {error && (
        <div style={{ margin: '14px 20px 0', padding: '10px 14px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 12, color: '#991b1b', fontSize: 13, fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div style={{ padding: '24px 20px 0' }}>
        <button
          disabled={!valid || !dirty || saving}
          onClick={onSave}
          style={{
            width: '100%',
            padding: '16px 20px',
            borderRadius: 100,
            background: valid && dirty && !saving ? '#1a7f5e' : '#e5e7eb',
            color: valid && dirty && !saving ? 'white' : '#9ca3af',
            border: 'none',
            fontWeight: 800,
            fontSize: 15,
            fontFamily: "'Outfit', sans-serif",
            cursor: valid && dirty && !saving ? 'pointer' : 'not-allowed',
            letterSpacing: '-0.01em',
          }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {isOffice ? <BottomNav /> : <ProviderBottomNav />}
    </div>
  );
}
