import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';

/**
 * ProviderAccountMenu
 * -------------------
 * Full-page takeover that opens when the provider taps the profile icon
 * in the topbar. This is the provider's account hub — NOT the full editable
 * profile page, and NOT the office-facing view of a provider.
 *
 * This is a NEW component. Do not confuse with:
 *   - ProviderMyProfile (the provider's editable profile — from bottom nav)
 *   - ProfessionalProfile (the office-facing profile, also reachable via
 *     /professionals/me?preview=1 for the provider's own preview)
 *
 * Page title shown to user: "Profile"
 * Sections: Identity + Kazi Profile Score card, Account, Settings and support
 *
 * Design tokens follow Kazi's locked system:
 *   - Primary green #1a7f5e · background #f9f8f6 · coral #e8734a · gold #f4b740
 *   - Sage gradient avatars (#a8c9b8 → #7ab8a8)
 *   - DM Sans body · Outfit headings · 16–20px card radius · 100px pill buttons
 */

// ── Mock data (replace with API response later) ──────────────
const mockStats = {
  shifts: 42,
  earnings: '$18.2k',
  profileScore: 650,
  scoreRange: { min: 300, max: 850 },
  scoreStatus: 'Good standing',
};

// ── Component ────────────────────────────────────────────────
export default function ProviderAccountMenu() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  const firstName = user?.firstName || 'Rodney';
  const lastName = user?.lastName || 'Onwu';
  const fullName = `${firstName} ${lastName}`.trim();
  const storedPhoto = (() => { try { return localStorage.getItem('kazi_profile_photo') || null; } catch { return null; } })();
  const avatarUrl = storedPhoto || user?.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';

  const handleBack = () => navigate(-1);
  const handleHelp = () => navigate('/provider-help');
  const handleNotificationsBell = () => navigate('/notifications');

  const handleFindShift = () => navigate('/find-shifts');

  const handleEditAccount = () => navigate('/account/personal');

  const handleLogOut = async () => {
    await signOut();
    navigate('/login');
  };

  const accountRows = [
    {
      label: 'Personal settings',
      icon: IconUser,
      onTap: () => navigate('/account/personal'),
    },
    {
      label: 'Notifications',
      icon: IconBell,
      onTap: () => navigate('/account/notifications'),
    },
    {
      label: 'How offices view me',
      icon: IconEye,
      onTap: () => navigate('/professionals/me?preview=1'),
    },
    {
      label: 'Availability',
      icon: IconCalendar,
      onTap: () => navigate('/provider-availability'),
    },
    {
      label: 'Favorite offices',
      icon: IconHeart,
      onTap: () => navigate('/favorites'),
    },
  ];

  const settingsRows = [
    {
      label: 'Settings',
      icon: IconSettings,
      onTap: () => navigate('/provider-settings'),
    },
    {
      label: 'Help center',
      icon: IconHelp,
      onTap: () => navigate('/provider-help'),
    },
    {
      label: 'Contact support',
      icon: IconChat,
      onTap: () => navigate('/support'),
    },
    {
      label: 'Log out',
      icon: IconLogOut,
      onTap: handleLogOut,
      danger: true,
    },
  ];

  return (
    <div className="bg-[#f9f8f6] min-h-screen pb-8">
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 pt-4 pb-[14px] bg-[#f9f8f6]">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-xl bg-transparent border-none grid place-items-center cursor-pointer"
          aria-label="Back"
        >
          <svg className="w-[22px] h-[22px] stroke-[#0f1a16]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="font-[Outfit] font-bold text-[22px] text-[#0f1a16] tracking-[-0.02em] flex-1 ml-1">
          Profile
        </div>
        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleNotificationsBell}
            className="w-10 h-10 rounded-xl bg-transparent border-none grid place-items-center cursor-pointer relative"
            aria-label="Notifications"
          >
            <svg className="w-[22px] h-[22px] stroke-[#0f1a16]" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-[9px] right-[10px] w-[7px] h-[7px] rounded-full bg-[#e8734a] border-2 border-[#f9f8f6]" />
          </button>
          <button
            onClick={handleHelp}
            className="bg-[#e8f2ed] text-[#1a7f5e] border-none px-[14px] py-2 rounded-full font-[DM_Sans] font-semibold text-[13.5px] cursor-pointer"
          >
            Get help
          </button>
        </div>
      </header>

      {/* Identity */}
      <section className="px-5 pt-3 pb-6 flex items-center gap-4">
        <div className="w-[88px] h-[88px] rounded-[24px] flex-shrink-0 relative overflow-hidden border-2 border-white" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <img src={avatarUrl} alt={fullName} className="w-full h-full object-cover" />
          <button
            onClick={handleEditAccount}
            className="absolute -bottom-1 -right-1 w-[30px] h-[30px] rounded-full bg-white border-2 border-[#f9f8f6] grid place-items-center cursor-pointer"
            aria-label="Edit profile"
          >
            <svg className="w-[14px] h-[14px] stroke-[#1a7f5e]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-[Outfit] font-bold text-[22px] text-[#0f1a16] tracking-[-0.02em] mb-[6px] leading-[1.15]">
            {fullName}
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-[2px]">
              <span className="font-[Outfit] font-bold text-[16px] text-[#0f1a16] tracking-[-0.01em]">
                {mockStats.shifts}
              </span>
              <span className="text-[10.5px] text-[#6b7875] font-semibold uppercase tracking-[0.06em]">
                Shifts
              </span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="font-[Outfit] font-bold text-[16px] text-[#1a7f5e] tracking-[-0.01em]">
                {mockStats.earnings}
              </span>
              <span className="text-[10.5px] text-[#6b7875] font-semibold uppercase tracking-[0.06em]">
                Earned
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Kazi Profile Score card */}
      <div
        className="mx-4 rounded-[20px] p-[20px_18px_18px] text-center border"
        style={{
          background: 'linear-gradient(180deg, #e8f2ed, #ffffff)',
          borderColor: '#d4e7dd',
        }}
      >
        <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6b7875] mb-2">
          Kazi Profile Score
        </div>
        <div className="font-[Outfit] font-extrabold text-[52px] text-[#1a7f5e] leading-none tracking-[-0.03em] mb-1">
          {mockStats.profileScore}
        </div>
        <div className="text-[12px] text-[#6b7875] font-medium mb-[14px]">
          {mockStats.scoreStatus} · {mockStats.scoreRange.min}–{mockStats.scoreRange.max} range
        </div>
        <div className="h-2 bg-[#efede8] rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.round(
                ((mockStats.profileScore - mockStats.scoreRange.min) /
                  (mockStats.scoreRange.max - mockStats.scoreRange.min)) *
                  100
              )}%`,
              background: 'linear-gradient(90deg, #1a7f5e, #2ea37a)',
            }}
          />
        </div>
        <button
          onClick={handleFindShift}
          className="inline-flex items-center justify-center w-full py-[13px] px-5 bg-[#1a7f5e] text-white border-none rounded-full font-[DM_Sans] font-semibold text-[14.5px] cursor-pointer gap-[6px]"
        >
          <svg className="w-[15px] h-[15px] stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Find your next shift
        </button>
      </div>

      {/* Account section */}
      <div className="px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[18px] tracking-[-0.01em] text-[#0f1a16] m-0">
          Account
        </h3>
      </div>
      <div className="mx-4 bg-white border border-[#e8e6e1] rounded-[18px] overflow-hidden">
        {accountRows.map((row, i) => (
          <AccountRow
            key={row.label}
            label={row.label}
            IconComp={row.icon}
            onTap={row.onTap}
            isLast={i === accountRows.length - 1}
          />
        ))}
      </div>

      {/* Settings and support section */}
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="font-[Outfit] font-bold text-[18px] tracking-[-0.01em] text-[#0f1a16] m-0">
          Settings and support
        </h3>
      </div>
      <div className="px-4 flex flex-col gap-[10px]">
        {settingsRows.map((row) => (
          <ManageRow
            key={row.label}
            label={row.label}
            IconComp={row.icon}
            onTap={row.onTap}
            danger={row.danger}
          />
        ))}
      </div>

      {/* Version */}
      <div className="text-center text-[12px] text-[#9aa5a1] font-medium py-6">
        Kazi · Version 1.0.0
      </div>
    </div>
  );
}

// ── Row components ───────────────────────────────────────────
function AccountRow({ label, IconComp, onTap, isLast }) {
  return (
    <div
      onClick={onTap}
      className={`flex items-center gap-[14px] px-4 py-[14px] cursor-pointer active:bg-[#f5faf7] transition-colors ${
        !isLast ? 'border-b border-[#efede8]' : ''
      }`}
    >
      <div className="w-8 h-8 rounded-[10px] bg-[#f5faf7] grid place-items-center flex-shrink-0">
        <IconComp stroke="#1a7f5e" />
      </div>
      <div className="flex-1 text-[14px] font-semibold text-[#0f1a16]">
        {label}
      </div>
    </div>
  );
}

function ManageRow({ label, IconComp, onTap, danger }) {
  return (
    <div
      onClick={onTap}
      className="flex items-center gap-[14px] p-4 bg-white border border-[#e8e6e1] rounded-[16px] cursor-pointer active:scale-[0.99] transition-transform"
    >
      <div
        className={`w-9 h-9 rounded-[11px] grid place-items-center flex-shrink-0 ${
          danger ? 'bg-[#fbeaea]' : 'bg-[#e8f2ed]'
        }`}
      >
        <IconComp stroke={danger ? '#d64545' : '#1a7f5e'} />
      </div>
      <div
        className={`flex-1 text-[14.5px] font-semibold ${
          danger ? 'text-[#d64545]' : 'text-[#0f1a16]'
        }`}
      >
        {label}
      </div>
      <svg className="w-[18px] h-[18px] stroke-[#9aa5a1]" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────
function IconUser({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconBell({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function IconEye({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconCalendar({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconHeart({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IconSettings({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconHelp({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconChat({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconLogOut({ stroke = '#d64545' }) {
  return (
    <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
