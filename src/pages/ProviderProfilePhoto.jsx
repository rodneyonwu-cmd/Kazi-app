import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import TopBar from '../components/TopBar';
import ProviderBottomNav from '../components/ProviderBottomNav';
import BottomNav from '../components/BottomNav';
import useUserRole from '../hooks/useUserRole';

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';
const STORAGE_KEY = 'kazi_profile_photo';

function getStoredPhoto() {
  try { return localStorage.getItem(STORAGE_KEY) || null; } catch { return null; }
}

export default function ProviderProfilePhoto() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isOffice } = useUserRole();
  const fileRef = useRef(null);

  const base = getStoredPhoto() || user?.imageUrl || DEFAULT_PHOTO;
  const [preview, setPreview] = useState(base);
  const [dirty, setDirty] = useState(false);

  const openPicker = () => fileRef.current?.click();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
      setDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPreview(user?.imageUrl || DEFAULT_PHOTO);
    setDirty(true);
  };

  const save = () => {
    try {
      if (preview === (user?.imageUrl || DEFAULT_PHOTO)) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, preview);
      }
    } catch {}
    navigate(-1);
  };

  return (
    <div style={{ background: '#f9f8f6', minHeight: '100vh', maxWidth: 480, margin: '0 auto', paddingBottom: 110, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 40px rgba(0,0,0,.06)' }}>
      <TopBar role={isOffice ? 'office' : 'provider'} />

      <div style={{ padding: '14px 20px', background: 'white', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate(-1)} aria-label="Back" style={{ width: 36, height: 36, borderRadius: '50%', background: '#f9f8f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: '-0.01em' }}>Profile photo</div>
      </div>

      <div style={{ background: 'white', padding: '36px 24px 30px', borderBottom: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: 176, height: 176, borderRadius: '50%', overflow: 'hidden', border: '4px solid white', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', background: '#e5e7eb', position: 'relative' }}>
          <img src={preview} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 14, fontWeight: 600, letterSpacing: '0.02em' }}>
          {dirty ? 'Unsaved changes' : 'Current photo'}
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />

      <div style={{ padding: '20px 20px 0' }}>
        <button onClick={openPicker} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', marginBottom: 10, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a1a' }}>Choose from library</div>
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>JPG, PNG, or WebP · up to 5MB</div>
          </div>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button onClick={openPicker} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', marginBottom: 10, background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#e8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: '#1a1a1a' }}>Take a new photo</div>
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>Use your camera</div>
          </div>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button onClick={removePhoto} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#d64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: '#d64545' }}>Remove photo</div>
            <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>Restore the default photo</div>
          </div>
        </button>
      </div>

      <div style={{ padding: '28px 20px 0' }}>
        <button
          disabled={!dirty}
          onClick={save}
          style={{ width: '100%', padding: '16px 20px', borderRadius: 100, background: dirty ? '#1a7f5e' : '#e5e7eb', color: dirty ? 'white' : '#9ca3af', border: 'none', fontWeight: 800, fontSize: 15, fontFamily: "'Outfit', sans-serif", cursor: dirty ? 'pointer' : 'not-allowed', letterSpacing: '-0.01em' }}
        >
          Save photo
        </button>
      </div>

      {isOffice ? <BottomNav /> : <ProviderBottomNav />}
    </div>
  );
}
