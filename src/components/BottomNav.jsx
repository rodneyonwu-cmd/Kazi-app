import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';

// ============================================================
// KAZI BOTTOM NAV — Shared office-side bottom tab bar
// 5 tabs: Home / Find / Bookings / Messages / Profile
// Profile tab opens a popover with all account/settings/sign-out items
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f5f0',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#f3f3f3',
  borderSoft: '#f3f3f3',
  danger: '#dc2626',
};

const TABS = [
  {
    label: 'Home',
    path: '/dashboard',
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    label: 'Find',
    path: '/professionals',
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  {
    label: 'Bookings',
    path: '/bookings',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
  },
  {
    label: 'Messages',
    path: '/messages',
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
  {
    label: 'Profile',
    isProfile: true,
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profileOpen, setProfileOpen] = useState(false);
  const popoverRef = useRef(null);

  const firstName = user?.firstName || '';
  const lastName = user?.lastName || '';
  const displayName = `${firstName} ${lastName}`.trim() || 'My Office';
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const userImage = user?.imageUrl;
  const initials = ((firstName[0] || 'O') + (lastName[0] || '')).toUpperCase();

  useEffect(() => {
    if (!profileOpen) return;
    const onClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setProfileOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/professionals') return location.pathname.startsWith('/professionals');
    if (path === '/bookings') return location.pathname.startsWith('/bookings');
    if (path === '/messages') return location.pathname.startsWith('/messages');
    return false;
  };

  const isProfileActive = ['/office-profile', '/my-office', '/saved-professionals', '/post-shift', '/applicants', '/settings', '/help'].some((p) => location.pathname.startsWith(p));

  const goAndClose = (path) => () => { setProfileOpen(false); navigate(path); };
  const handleSignOut = async () => {
    setProfileOpen(false);
    try { await signOut(); } catch {}
    navigate('/login');
  };

  return (
    <>
      {profileOpen && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 24px)',
            maxWidth: 360,
            background: COLORS.card,
            border: `1px solid ${COLORS.borderSoft}`,
            borderRadius: 20,
            boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
            zIndex: 60,
            fontFamily: "'DM Sans', sans-serif",
            overflow: 'hidden',
            maxHeight: '70vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div
            onClick={goAndClose('/my-office')}
            style={{ padding: '16px 16px 14px', borderBottom: `1px solid ${COLORS.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          >
            {userImage ? (
              <img src={userImage} alt={displayName} style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg,#a8c9b8,#7ab8a8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                {initials}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text, lineHeight: 1.2 }}>{displayName}</div>
              {email && <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>}
              <div style={{ fontSize: 11, color: COLORS.green, fontWeight: 700, marginTop: 4 }}>View office →</div>
            </div>
          </div>

          {/* Account */}
          <Section label="Account">
            <Item icon="bell" label="Notifications" onClick={goAndClose('/notifications')} />
            <Item icon="eye" label="How professionals see me" onClick={goAndClose('/office-profile')} />
            <Item icon="heart" label="Saved professionals" onClick={goAndClose('/saved-professionals')} />
            <Item icon="cal" label="Post a shift" onClick={goAndClose('/post-shift')} />
            <Item icon="doc" label="Posted jobs" onClick={goAndClose('/applicants')} />
          </Section>

          <Section label="Settings & Support">
            <Item icon="gear" label="Settings" onClick={goAndClose('/settings')} />
            <Item icon="help" label="Help & support" onClick={goAndClose('/help')} />
          </Section>

          <div style={{ borderTop: `1px solid ${COLORS.borderSoft}` }}>
            <div
              onClick={handleSignOut}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', fontSize: 14, fontWeight: 700, color: COLORS.danger, cursor: 'pointer' }}
            >
              <Icon name="logout" color={COLORS.danger} />
              Sign out
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 480,
          width: '100%',
          background: COLORS.card,
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          padding: '10px 0 22px',
          paddingBottom: 'calc(22px + env(safe-area-inset-bottom, 0px))',
          zIndex: 40,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {TABS.map((tab) => {
          const active = tab.isProfile ? (isProfileActive || profileOpen) : isActive(tab.path);
          return (
            <button
              key={tab.label}
              onClick={() => {
                if (tab.isProfile) setProfileOpen((o) => !o);
                else { setProfileOpen(false); navigate(tab.path); }
              }}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                fontFamily: 'inherit',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={active ? COLORS.green : COLORS.textLight}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 22, height: 22 }}
              >
                {tab.icon}
              </svg>
              <span style={{ fontSize: 10, color: active ? COLORS.green : COLORS.textLight, fontWeight: 600 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ padding: '4px 18px 6px', fontSize: 10, fontWeight: 800, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</div>
      {children}
    </div>
  );
}

function Item({ icon, label, onClick, badge }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 18px',
        cursor: 'pointer',
        fontSize: 14,
        color: COLORS.text,
        fontWeight: 500,
      }}
    >
      <Icon name={icon} color="#9ca3af" />
      <span style={{ flex: 1 }}>{label}</span>
      {badge != null && (
        <span style={{ fontSize: 10, fontWeight: 800, background: COLORS.danger, color: 'white', padding: '2px 7px', borderRadius: 100 }}>{badge}</span>
      )}
    </div>
  );
}

function Icon({ name, color }) {
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'bell': return (<svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>);
    case 'eye': return (<svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
    case 'heart': return (<svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
    case 'cal': return (<svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
    case 'doc': return (<svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
    case 'gear': return (<svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
    case 'help': return (<svg {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
    case 'logout': return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);
    default: return null;
  }
}
