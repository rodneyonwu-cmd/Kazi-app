import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import useUserRole from '../hooks/useUserRole';

// ============================================================
// KAZI TOP BAR — Shared sticky top bar with kazi. logo + avatar
// Tapping the avatar opens a role-aware dropdown with account links.
// Used on every provider AND office page.
// ============================================================

const DEFAULT_USER_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f5f0',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  danger: '#dc2626',
};

const PROVIDER_ITEMS = {
  account: [
    { icon: 'bell', label: 'Notifications', path: '/notifications' },
    { icon: 'eye', label: 'How offices view me', path: '/provider-profile-preview' },
    { icon: 'doc', label: 'Documents & Credentials', path: '/provider-documents' },
    { icon: 'cal', label: 'Availability', path: '/provider-availability' },
    { icon: 'dollar', label: 'Finance', path: '/finance' },
    { icon: 'heart', label: 'Favorite Offices', path: '/favorites' },
  ],
  support: [
    { icon: 'gear', label: 'Settings', path: '/provider-settings' },
    { icon: 'help', label: 'Help Center', path: '/provider-help' },
    { icon: 'chat', label: 'Contact Support', path: '/provider-help' },
  ],
  viewProfilePath: '/my-profile',
};

const OFFICE_ITEMS = {
  account: [
    { icon: 'bell', label: 'Notifications', path: '/notifications' },
    { icon: 'eye', label: 'How professionals see me', path: '/office-profile' },
    { icon: 'heart', label: 'Saved professionals', path: '/saved-professionals' },
    { icon: 'cal', label: 'Post a shift', path: '/post-shift' },
    { icon: 'doc', label: 'Posted jobs', path: '/applicants' },
  ],
  support: [
    { icon: 'gear', label: 'Settings', path: '/settings' },
    { icon: 'help', label: 'Help & support', path: '/help' },
  ],
  viewProfilePath: '/my-office',
};

// Role is derived from useUserRole() (backed by /api/users/me).
// A legacy `role` prop may still be passed by older call sites —
// React ignores unknown props on function components, so it's harmless.
// The hook is the single source of truth.
export default function TopBar() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { role: hookRole } = useUserRole();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  const role = hookRole; // 'office' | 'provider' | null
  const items = role === 'office' ? OFFICE_ITEMS : role === 'provider' ? PROVIDER_ITEMS : null;

  const firstName = user?.firstName || (role === 'office' ? '' : 'Rodney');
  const lastName = user?.lastName || (role === 'office' ? '' : 'Onwu');
  const displayName = `${firstName} ${lastName}`.trim() || (role === 'office' ? 'My Office' : 'Rodney Onwu');
  const email = user?.primaryEmailAddress?.emailAddress || '';
  const officeImage = user?.imageUrl;
  const officeInitials = ((firstName[0] || 'O') + (lastName[0] || '')).toUpperCase() || 'OF';

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const goAndClose = (path) => () => { setOpen(false); navigate(path); };
  const handleSignOut = async () => {
    setOpen(false);
    try { await signOut(); } catch {}
    navigate('/login');
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: COLORS.card,
        borderBottom: `1px solid ${COLORS.borderSoft}`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        onClick={() => {
          if (role === 'office') navigate('/dashboard');
          else if (role === 'provider') navigate('/provider');
          // role unknown yet — do nothing rather than routing to the wrong dashboard
        }}
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: 36,
          color: COLORS.green,
          letterSpacing: '-1px',
          cursor: 'pointer',
          lineHeight: 1,
        }}
      >
        kazi.
      </div>

      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
        style={{
          padding: 0,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          flexShrink: 0,
        }}
      >
        {role === 'office' && officeImage ? (
          <img src={officeImage} alt={displayName} style={{ width: 36, height: 36, borderRadius: 12, objectFit: 'cover' }} />
        ) : role === 'office' ? (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'linear-gradient(135deg,#a8c9b8,#7ab8a8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {officeInitials}
          </div>
        ) : (
          <img src={DEFAULT_USER_PHOTO} alt={displayName} style={{ width: 36, height: 36, borderRadius: 12, objectFit: 'cover' }} />
        )}
      </button>

      {open && items && (
        <div
          ref={popoverRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 16,
            width: 280,
            background: COLORS.card,
            border: `1px solid ${COLORS.borderSoft}`,
            borderRadius: 20,
            boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
            zIndex: 60,
            overflow: 'hidden',
            maxHeight: '78vh',
            overflowY: 'auto',
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            onClick={goAndClose(items.viewProfilePath)}
            style={{
              padding: '16px 18px 14px',
              borderBottom: `1px solid ${COLORS.borderSoft}`,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            {role === 'office' && officeImage ? (
              <img src={officeImage} alt={displayName} style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
            ) : role === 'office' ? (
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg,#a8c9b8,#7ab8a8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 800,
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {officeInitials}
              </div>
            ) : (
              <img src={DEFAULT_USER_PHOTO} alt={displayName} style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15, color: COLORS.text, lineHeight: 1.2 }}>{displayName}</div>
              {email && <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>}
              <div style={{ fontSize: 11, color: COLORS.green, fontWeight: 700, marginTop: 4 }}>View profile →</div>
            </div>
          </div>

          <Section label="Account">
            {items.account.map((it) => (
              <Item key={it.label} icon={it.icon} label={it.label} onClick={goAndClose(it.path)} />
            ))}
          </Section>

          <Section label="Settings & Support">
            {items.support.map((it) => (
              <Item key={it.label} icon={it.icon} label={it.label} onClick={goAndClose(it.path)} />
            ))}
          </Section>

          <div style={{ borderTop: `1px solid ${COLORS.borderSoft}` }}>
            <div
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 18px',
                fontSize: 14,
                fontWeight: 700,
                color: COLORS.danger,
                cursor: 'pointer',
              }}
            >
              <Icon name="logout" color={COLORS.danger} />
              Sign out
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ padding: '10px 0' }}>
      <div style={{ padding: '4px 18px 6px', fontSize: 10, fontWeight: 800, color: '#c8c8c8', textTransform: 'uppercase', letterSpacing: 1.2 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Item({ icon, label, onClick }) {
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
        color: '#1a1a1a',
        fontWeight: 500,
      }}
    >
      <Icon name={icon} color="#9ca3af" />
      <span style={{ flex: 1 }}>{label}</span>
    </div>
  );
}

function Icon({ name, color }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  switch (name) {
    case 'bell': return (<svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>);
    case 'eye': return (<svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>);
    case 'doc': return (<svg {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>);
    case 'cal': return (<svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
    case 'dollar': return (<svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
    case 'heart': return (<svg {...props}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>);
    case 'gear': return (<svg {...props}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
    case 'help': return (<svg {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);
    case 'chat': return (<svg {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>);
    case 'logout': return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);
    default: return null;
  }
}
