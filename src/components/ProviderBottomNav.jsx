import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ============================================================
// KAZI PROVIDER BOTTOM NAV — Shared provider-side bottom tab bar
// 5 tabs: Home / Find Shifts / Requests / Messages / Profile
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  card: '#ffffff',
  textLight: '#8a8a8a',
  border: '#ececec',
};

const TABS = [
  {
    label: 'Home',
    path: '/provider',
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    label: 'Find Shifts',
    path: '/find-shifts',
    icon: (
      <>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  {
    label: 'Requests',
    path: '/requests',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
      </>
    ),
  },
  {
    label: 'Messages',
    path: '/provider-messages',
    icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  },
  {
    label: 'Profile',
    path: '/my-profile',
    icon: (
      <>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </>
    ),
  },
];

export default function ProviderBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/provider') return location.pathname === '/provider';
    if (path === '/find-shifts') return location.pathname.startsWith('/find-shifts');
    if (path === '/requests') return location.pathname.startsWith('/requests');
    if (path === '/provider-messages') return location.pathname.startsWith('/provider-messages');
    if (path === '/my-profile') return location.pathname === '/my-profile' || location.pathname === '/provider-profile-preview';
    return false;
  };

  return (
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
        const active = isActive(tab.path);
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
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
            <span
              style={{
                fontSize: 10,
                color: active ? COLORS.green : COLORS.textLight,
                fontWeight: 600,
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
