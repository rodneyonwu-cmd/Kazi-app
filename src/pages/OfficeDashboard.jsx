import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COLORS = {
  green: '#1a7f5e', greenDark: '#15604a', greenSoft: '#e8f3ee', greenTint: '#f1f9f5',
  coral: '#e8734a', coralSoft: '#fdeee7', purple: '#7c3aed', purpleSoft: '#f1ebfa',
  orange: '#d97706', orangeSoft: '#fef3e6', bg: '#f9f8f6', card: '#ffffff',
  text: '#1a1a1a', textMid: '#5a5a5a', textLight: '#8a8a8a', border: '#ececec',
  borderSoft: '#f3f3f3', gold: '#f4b740',
};

export default function OfficeDashboard() {
  const navigate = useNavigate();
  const [chooserOpen, setChooserOpen] = useState(false);
  const openChooser = () => setChooserOpen(true);
  const closeChooser = () => setChooserOpen(false);
  const goToTemp = () => { closeChooser(); navigate('/post/temp'); };
  const goToPermanent = () => { closeChooser(); navigate('/post/permanent'); };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: COLORS.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '22px 20px 8px' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24 }}>Office Dashboard</div>
        <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4 }}>Reference layout</div>
      </div>
      <div onClick={openChooser} style={{ margin: '18px 16px', borderRadius: 24, padding: 22, background: '#fdfaf3', border: '1.5px solid #f0e9d6', cursor: 'pointer' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Need coverage?</div>
        <div style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 18 }}>Post a job and our top-rated Houston pros will respond fast.</div>
        <button onClick={(e) => { e.stopPropagation(); openChooser(); }} style={{ background: COLORS.green, color: 'white', padding: '12px 20px', borderRadius: 100, fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Post a Job</button>
      </div>

      {chooserOpen && (
        <>
          <div onClick={closeChooser} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 100 }} />
          <div style={{ position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', background: 'white', borderRadius: 28, zIndex: 101, paddingBottom: 24, width: 'calc(100% - 40px)', maxWidth: 400, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}>
            <div style={{ padding: '24px 24px 8px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26 }}>Post a Job</div>
                <div style={{ fontSize: 14, color: COLORS.textMid, marginTop: 6 }}>What kind of position?</div>
              </div>
              <button onClick={closeChooser} style={{ width: 38, height: 38, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div style={{ padding: '24px 20px 8px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <button onClick={goToTemp} style={{ background: 'white', border: '2px solid ' + COLORS.border, borderRadius: 22, padding: 22, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 10px', borderRadius: 100, marginBottom: 6, background: COLORS.greenTint, color: COLORS.green, display: 'inline-block' }}>Single day</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22 }}>Temp Shift</div>
              </button>
              <button onClick={goToPermanent} style={{ background: 'white', border: '2px solid ' + COLORS.border, borderRadius: 22, padding: 22, cursor: 'pointer', textAlign: 'left', width: '100%', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, padding: '4px 10px', borderRadius: 100, marginBottom: 6, background: COLORS.purpleSoft, color: COLORS.purple, display: 'inline-block' }}>Long-term hire</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22 }}>Permanent Role</div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
