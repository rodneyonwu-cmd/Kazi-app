import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';

/**
 * OfficeAccountMenu
 * -----------------
 * Full-page takeover that opens when an office user taps the profile icon
 * in the topbar. This is the office's account hub — NOT the full editable
 * office profile, and NOT the provider-facing view of an office.
 *
 * This is a NEW component. Do not confuse with:
 *   - OfficeMyProfile / OfficeProfile (the office's own editable profile from bottom nav)
 *   - OfficeProfilePreview (read-only preview of own office profile)
 *   - OfficeProfile (the profile providers see when browsing offices)
 *
 * Page title shown to user: "Profile"
 * Sections: Identity, Office Rating hero card, Account, Settings and support
 *
 * Design tokens follow Kazi's locked system:
 *   - Primary green #1a7f5e · background #f9f8f6 · coral #e8734a · gold #f4b740
 *   - Sage gradient avatars (#a8c9b8 → #7ab8a8)
 *   - DM Sans body · Outfit headings · 16–20px card radius · 100px pill buttons
 */

// ── Mock data (replace with API response later) ──────────────
const mockStats = {
  shiftsFilled: 86,
  rating: 4.9,
  reviewCount: 127,
  fillRate: 94,
  repeatPros: 18,
  avgFillTime: '2.1h',
  officeName: 'Missouri City Dental',
};

// ── Component ────────────────────────────────────────────────
export default function OfficeAccountMenu() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();

  // Resolve display name and initials from Clerk
  // For office owners, we assume firstName/lastName on Clerk user
  // represents the owner (e.g., Dr. Osagie)
  const firstName = user?.firstName || 'Doctor';
  const lastName = user?.lastName || '';
  const displayName = lastName ? `Dr. ${lastName}` : `Dr. ${firstName}`;
  const initials = (
    (firstName?.[0] || '') + (lastName?.[0] || '')
  ).toUpperCase() || 'DR';

  const handleBack = () => navigate(-1);
  const handleHelp = () => navigate('/help');
  const handleNotificationsBell = () => navigate('/notifications');

  const handlePostJob = () => navigate('/post-shift');
  const handleEditAccount = () => navigate('/account/personal');

  const handleLogOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Account section rows
  const accountRows = [
    {
      label: 'Personal settings',
      icon: IconUser,
      onTap: () => navigate('/account/personal'),
    },
    {
      label: 'How providers view us',
      icon: IconEye,
      onTap: () => navigate('/office-profile'),
    },
    {
      label: 'Saved professionals',
      icon: IconHeart,
      onTap: () => navigate('/saved-professionals'),
    },
    {
      label: 'Team members',
      icon: IconUsers,
      onTap: () => navigate('/account/team'),
    },
  ];

  // Settings and support section rows
  const settingsRows = [
    {
      label: 'Settings',
      icon: IconSettings,
      onTap: () => navigate('/settings'),
    },
    {
      label: 'Help center',
      icon: IconHelp,
      onTap: () => navigate('/help'),
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
        <div className="flex-1 ml-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 22, color: '#0f1a16', letterSpacing: '-0.02em' }}>
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
            className="bg-[#e8f2ed] text-[#1a7f5e] border-none px-[14px] py-2 rounded-full cursor-pointer"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, letterSpacing: '-0.01em' }}
          >
            Get help
          </button>
        </div>
      </header>

      {/* Identity */}
      <section className="px-5 pt-3 pb-6 flex items-center gap-4">
        <div
          className="w-[88px] h-[88px] rounded-[24px] text-white grid place-items-center flex-shrink-0 relative"
          style={{ background: 'linear-gradient(135deg, #a8c9b8, #7ab8a8)', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em' }}
        >
          {initials}
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
          <div className="mb-[6px] leading-[1.15]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 22, color: '#0f1a16', letterSpacing: '-0.02em' }}>
            {displayName}
          </div>
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-[2px]">
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f1a16', letterSpacing: '-0.02em' }}>
                {mockStats.shiftsFilled}
              </span>
              <span className="uppercase" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, color: '#6b7875', fontWeight: 700, letterSpacing: '0.06em' }}>
                Shifts filled
              </span>
            </div>
            <div className="flex flex-col gap-[2px]">
              <span className="inline-flex items-center gap-[3px]" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#0f1a16', letterSpacing: '-0.02em' }}>
                <svg className="w-[13px] h-[13px]" viewBox="0 0 24 24" fill="#f4b740">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {mockStats.rating.toFixed(1)}
              </span>
              <span className="uppercase" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, color: '#6b7875', fontWeight: 700, letterSpacing: '0.06em' }}>
                Rating
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Office Rating hero card */}
      <div
        className="mx-4 rounded-[20px] p-[20px_18px_18px] text-center border"
        style={{
          background: 'linear-gradient(180deg, #e8f2ed, #ffffff)',
          borderColor: '#d4e7dd',
        }}
      >
        <div className="uppercase mb-2" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#6b7875' }}>
          Office Rating
        </div>
        <div className="inline-flex items-baseline gap-[6px] mb-1">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#f4b740" style={{ alignSelf: 'center' }}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span className="leading-none" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 52, color: '#1a7f5e', letterSpacing: '-0.03em' }}>
            {mockStats.rating.toFixed(1)}
          </span>
        </div>
        <div className="mb-[14px]" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: '#6b7875', fontWeight: 500, letterSpacing: '-0.01em' }}>
          {mockStats.officeName} · {mockStats.reviewCount} reviews
        </div>

        {/* Mini stats row */}
        <div className="flex items-stretch justify-center py-[10px] mb-[14px] border-t border-b border-[#efede8]">
          <MiniStat value={`${mockStats.fillRate}%`} label="Fill rate" />
          <div className="w-px bg-[#efede8] my-1" />
          <MiniStat value={mockStats.repeatPros} label="Repeat pros" />
          <div className="w-px bg-[#efede8] my-1" />
          <MiniStat value={mockStats.avgFillTime} label="Avg fill" />
        </div>

        <button
          onClick={handlePostJob}
          className="inline-flex items-center justify-center w-full py-[13px] px-5 bg-[#1a7f5e] text-white border-none rounded-full cursor-pointer gap-[6px]"
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '-0.01em' }}
        >
          <svg className="w-[15px] h-[15px] stroke-white" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Post a job
        </button>
      </div>

      {/* Account section */}
      <div className="flex items-center justify-between px-5 pt-7 pb-3">
        <h3 className="m-0" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#0f1a16', letterSpacing: '-0.02em' }}>
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
        <h3 className="m-0" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#0f1a16', letterSpacing: '-0.02em' }}>
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
      <div className="text-center py-6" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12.5, color: '#9aa5a1', fontWeight: 500, letterSpacing: '-0.01em' }}>
        Kazi · Version 1.0.0
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────
function MiniStat({ value, label }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-1">
      <span className="leading-none" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#0f1a16', letterSpacing: '-0.02em' }}>
        {value}
      </span>
      <span className="uppercase" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, color: '#6b7875', fontWeight: 700, letterSpacing: '0.06em' }}>
        {label}
      </span>
    </div>
  );
}

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
      <div className="flex-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: '#0f1a16', letterSpacing: '-0.01em' }}>
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
        className={`flex-1 ${
          danger ? 'text-[#d64545]' : 'text-[#0f1a16]'
        }`}
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}
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
function IconEye({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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
function IconUsers({ stroke = '#1a7f5e' }) {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
