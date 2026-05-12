import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProviderBottomNav from '../../components/ProviderBottomNav';
import { lookupLoungeUser } from './loungeUsers';

// ============================================================
// KAZI LOUNGE — Verified-provider community hub
// Reddit-style threaded feed + cross-role groups.
//
// Content-only page: renders its own in-Lounge title bar (search +
// bell), the feed/groups views, modal sheets, and the shared
// ProviderBottomNav. The app-wide TopBar is intentionally NOT
// rendered here — the in-Lounge title bar replaces it.
//
// All data is mocked inline. Each network call is marked TODO so
// it's easy to swap in fetch() against /api/lounge/* once the
// backend is live.
// ============================================================

// ── Constants (locked design system) ─────────────────────────
const GREEN = '#1a7f5e';
const CORAL = '#e8734a';
const BG = '#f9f8f6';
const CARD_BORDER = '#e5e2dc';
const SOFT_DIVIDER = '#f0eee8';
const SAGE_GRADIENT = 'linear-gradient(135deg, #a8c9b8 0%, #7ab8a8 100%)';
const ANON_GRADIENT = 'linear-gradient(135deg, #d4d4d4 0%, #a8a8a8 100%)';
const FONT_DM = "'DM Sans', sans-serif";
const FONT_OUTFIT = "'Outfit', sans-serif";

// ── Role chips (My Feed filter) ──────────────────────────────
const ROLES = [
  { id: 'all', name: 'All' },
  { id: 'dentist', name: 'Dentists' },
  { id: 'rdh', name: 'Hygienists' },
  { id: 'da', name: 'Assistants' },
  { id: 'fo', name: 'Front Office' },
];

// ── Groups (seeded constants — no DB table yet) ──────────────
const GROUPS = {
  hacks: { name: 'Dental Hacks & Recommendations', members: '1,184', section: 'all' },
  events: { name: 'Current Events', members: '892', section: 'all' },
  breakroom: { name: 'Break Room', members: '1,402', section: 'all' },
  'da-only': { name: 'Dental Assistants Only', members: '1,247 DAs', section: 'role' },
};

// ── Current user (replace with Clerk user + role from /api/users/me) ──
// TODO: replace ME with `useUserRole()` + Clerk user data
const ME = { initials: 'AO', name: 'You', role: 'Dental Assistant', roleId: 'da' };

// ── Mock threads (replace with fetchThreads(scope, roleType?)) ──
const MOCK_THREADS = [
  {
    id: 't1', scope: 'feed', roleType: 'da',
    author: { initials: 'RP', name: 'Rachel P.', role: 'DA · 4 yrs', anon: false },
    location: 'Sugar Land, TX',
    time: '3h', score: 28, downvotes: 2, vote: null, replyCount: 41,
    title: 'Fair hourly rate for an experienced DA in Houston metro?',
    body: "Trying to calibrate before my next shift. What are folks getting paid right now? Vote below — I'll share what I end up booking.",
    tag: 'Pay Talk',
    poll: {
      options: [
        { label: '$22–25/hr', pct: 18 },
        { label: '$26–30/hr', pct: 54, leading: true },
        { label: '$31–35/hr', pct: 21 },
        { label: '$36+/hr', pct: 7 },
      ],
      voted: null,
      meta: '124 votes · closes in 2d',
    },
    replies: [
      { id: 'r1-1', author: { initials: 'NG', anon: false, name: 'Nia G.', role: 'DA · 5 yrs' }, time: '2h', text: "$28-32 is the real market rate for experienced DAs right now. Don't let anyone lowball you.", likes: 14, liked: true },
      { id: 'r1-2', author: { initials: null, anon: true, name: 'Anonymous DA', role: 'verified' }, time: '1h', text: "I've been getting $30 consistently in Sugar Land + Pearland offices. Katy a little less.", likes: 8, liked: false },
      { id: 'r1-3', author: { initials: 'TK', anon: false, name: 'Tina K.', role: 'DA · 8 yrs' }, time: '42m', text: 'Never go below $27 if you have X-ray cert + expanded duties. Know your worth.', likes: 22, liked: false },
    ],
  },
  {
    id: 't2', scope: 'feed', roleType: 'da',
    author: { initials: 'MC', name: 'Maya C.', role: 'DA · 3 yrs', anon: false },
    location: 'Pearland, TX',
    time: '5h', score: 67, downvotes: 1, vote: 'up', replyCount: 19,
    title: 'PSA: confirm tray setup BEFORE first patient',
    body: 'Always check tray setup and where the ultrasonic tips are kept before first patient. 5 minutes saves a chaotic morning. Most chaos I’ve seen comes from skipping this.',
    tag: 'Tip',
    replies: [
      { id: 'r2-1', author: { initials: 'JT', anon: false, name: 'Jordan T.', role: 'DA · 7 yrs' }, time: '4h', text: 'Also ask where the sharpening stones live. Not every office keeps them at the main op.', likes: 18, liked: false },
      { id: 'r2-2', author: { initials: 'KM', anon: false, name: 'Kiara M.', role: 'DA · 4 yrs' }, time: '2h', text: '+ locate the emergency O2 and AED. Most temps never do.', likes: 34, liked: false },
    ],
  },
  {
    id: 't3', scope: 'feed', roleType: 'da',
    author: { initials: null, name: 'Anonymous DA', role: 'verified', anon: true },
    time: '2d', score: 32, downvotes: 0, vote: null, replyCount: 12,
    title: 'Evolve Dentistry — would book again',
    body: 'Worked a temp shift here last Friday. Clean office, friendly staff, and Dr. was totally hands-off in the best way. Pay was on time and lunch was covered.',
    tag: 'Office Review',
    office: { name: 'Evolve Dentistry', rating: '4.8' },
    replies: [
      { id: 'r3-1', author: { initials: 'RP', anon: false, name: 'Rachel P.', role: 'DA · 4 yrs' }, time: '1d', text: 'Evolve is on my regular rotation now. Dr. O treats temps like real team members.', likes: 16, liked: false },
    ],
  },
  {
    id: 't4', scope: 'feed', roleType: 'da',
    author: { initials: 'NG', name: 'Nia G.', role: 'DA · 5 yrs', anon: false },
    location: 'Cypress, TX',
    time: '1d', score: 89, downvotes: 4, vote: 'up', replyCount: 22,
    title: 'Why "high pay" offices often have the worst turnover',
    body: 'Real talk: the offices that pay the most usually have the worst turnover. Don’t just chase the rate — ask why the role is open before you accept anything.',
    tag: 'Pay Talk',
    replies: [
      { id: 'r4-1', author: { initials: 'TK', anon: false, name: 'Tina K.', role: 'DA · 8 yrs' }, time: '1d', text: 'This. Learned the hard way. $34/hr office, nobody lasted 3 months.', likes: 42, liked: false },
    ],
  },
  {
    id: 't5', scope: 'feed', roleType: 'rdh',
    author: { initials: 'AR', name: 'Anita R.', role: 'RDH · 6 yrs', anon: false },
    location: 'Katy, TX',
    time: '4h', score: 52, downvotes: 1, vote: null, replyCount: 16,
    title: 'Anyone using Air-Flow over traditional polishing?',
    body: 'Switched our practice to Air-Flow last month and patients are noticeably more comfortable. Curious if other RDHs have made the switch and how you’re billing for it.',
    tag: 'Clinical',
    replies: [
      { id: 'r5-1', author: { initials: 'JM', anon: false, name: 'Jenna M.', role: 'RDH · 4 yrs' }, time: '3h', text: 'Been using EMS Air-Flow for 2 years. We bill it under D1110 with patient education code as supplemental. Most insurance covers it.', likes: 18, liked: false },
    ],
  },
  {
    id: 't6', scope: 'feed', roleType: 'dentist',
    author: { initials: 'DR', name: 'Dr. Patel', role: 'DDS · 12 yrs', anon: false },
    location: 'Houston, TX',
    time: '7h', score: 134, downvotes: 8, vote: null, replyCount: 47,
    title: 'Looking for an associate — what are reasonable comp expectations in 2026?',
    body: 'Adding a second chair and recruiting an associate for the first time. What does the comp split look like in your markets right now? 30%? 35%? Daily guarantee?',
    tag: 'Owner Q',
    replies: [
      { id: 'r6-1', author: { initials: 'AS', anon: false, name: 'Dr. Sanders', role: 'DDS · 8 yrs' }, time: '6h', text: '30% of collections is the floor in TX right now. Good associates are getting 32-35% with a $700-800 daily guarantee for the first 6 months.', likes: 41, liked: false },
    ],
  },
  {
    id: 't7', scope: 'feed', roleType: 'fo',
    author: { initials: 'JE', name: 'Jenna E.', role: 'Front Office · 6 yrs', anon: false },
    location: 'Sugar Land, TX',
    time: '1d', score: 78, downvotes: 2, vote: null, replyCount: 23,
    title: '2026 CDT code changes — sleep apnea + SDF',
    body: 'Heads up to other front office folks: ADA released the 2026 CDT updates. Big changes for sleep apnea and SDF coding. Save the change log before billing season.',
    tag: 'Billing',
    replies: [
      { id: 'r7-1', author: { initials: 'BR', anon: false, name: 'Brittany R.', role: 'Front Office · 9 yrs' }, time: '20h', text: 'Bookmarked. Thank you. We always get caught flat-footed in January.', likes: 12, liked: false },
    ],
  },
  // Group threads
  {
    id: 'g-hacks-1', scope: 'hacks',
    author: { initials: 'JT', name: 'Jordan T.', role: 'DA · 7 yrs', anon: false },
    time: '2d', score: 142, downvotes: 0, vote: null, replyCount: 38,
    title: 'Cement cleanup hack that saved my career',
    body: 'Warm instruments slightly with the air-water syringe before removing temporary cement. Slides right off.',
    replies: [
      { id: 'gh1-1', author: { initials: 'MC', anon: false, name: 'Maya C.', role: 'DA · 3 yrs' }, time: '2d', text: 'Why was I not told this years ago.', likes: 28, liked: false },
      { id: 'gh1-2', author: { initials: 'BL', anon: false, name: 'Briana L.', role: 'DA · 2 yrs' }, time: '1d', text: 'Tried this today. Life changing.', likes: 19, liked: false },
    ],
  },
  {
    id: 'g-hacks-2', scope: 'hacks',
    author: { initials: 'DR', name: 'Dr. Patel', role: 'DDS · 12 yrs · Houston', anon: false },
    time: '6h', score: 87, downvotes: 0, vote: null, replyCount: 24,
    title: 'Mandibular blocks: try Gow-Gates on thick rami',
    body: 'Tip from the chair side: if you struggle with mandibular blocks, try the Gow-Gates technique on patients with thick rami. Higher success rate, fewer reinjections.',
    replies: [
      { id: 'gh2-1', author: { initials: 'AS', anon: false, name: 'Dr. Sanders', role: 'DDS · 8 yrs' }, time: '4h', text: 'Switched to this 5 years ago. Game changer for difficult anatomy.', likes: 12, liked: false },
    ],
  },
  {
    id: 'g-hacks-3', scope: 'hacks',
    author: { initials: 'KM', name: 'Kiara M.', role: 'DA · 4 yrs', anon: false },
    time: '4d', score: 76, downvotes: 0, vote: 'up', replyCount: 28,
    title: 'Real orthotics if you’re on your feet 8+ hours',
    body: 'My Danskos were killing my lower back until I got a proper fitted insole. Game changer.',
    replies: [
      { id: 'gh3-1', author: { initials: 'LS', anon: false, name: 'Lily S.', role: 'DA · 6 yrs' }, time: '3d', text: 'Where did you get them fitted?', likes: 4, liked: false },
    ],
  },
  {
    id: 'g-events-1', scope: 'events',
    author: { initials: 'TK', name: 'Tina K.', role: 'DA · 8 yrs', anon: false },
    time: '1d', score: 54, downvotes: 0, vote: null, replyCount: 16,
    title: 'TX RDA renewal — CE requirements updated',
    body: 'For anyone renewing RDA in Texas — the Board updated their CE requirements last month. Make sure you’re looking at the current list.',
    replies: [
      { id: 'ge1-1', author: { initials: 'DV', anon: false, name: 'Devon V.', role: 'DA · 3 yrs' }, time: '1d', text: 'Do you have the link?', likes: 5, liked: false },
    ],
  },
  {
    id: 'g-events-2', scope: 'events',
    author: { initials: 'DR', name: 'Dr. Vance', role: 'DDS · Practice Owner', anon: false },
    time: '8h', score: 41, downvotes: 0, vote: null, replyCount: 19,
    title: '2026 CDT updates — sleep apnea + SDF',
    body: 'ADA released their 2026 CDT code updates. Big changes for sleep apnea and SDF coding. Front office folks — worth bookmarking the change log before billing season.',
    replies: [
      { id: 'ge2-1', author: { initials: 'JE', anon: false, name: 'Jenna E.', role: 'Front Office · 6 yrs' }, time: '5h', text: 'Already saved. Thanks for flagging.', likes: 7, liked: false },
    ],
  },
  {
    id: 'g-break-1', scope: 'breakroom',
    author: { initials: null, name: 'Anonymous Member', role: 'verified', anon: true },
    time: '2h', score: 184, downvotes: 0, vote: 'up', replyCount: 47,
    title: 'Patient quote of the day',
    body: 'Patient today: "Is it okay if I floss only when I have a steak dinner?"',
    replies: [
      { id: 'gb1-1', author: { initials: 'MC', anon: false, name: 'Maya C.', role: 'DA · 3 yrs' }, time: '1h', text: 'I have heard variations of this for 3 years and it never gets easier.', likes: 32, liked: false },
      { id: 'gb1-2', author: { initials: 'AS', anon: false, name: 'Dr. Sanders', role: 'DDS · 8 yrs' }, time: '45m', text: 'My personal favorite: "Why do I need to floss if my gums bleed when I do?"', likes: 28, liked: false },
    ],
  },
  {
    id: 'g-break-2', scope: 'breakroom',
    author: { initials: 'NG', name: 'Nia G.', role: 'DA · 5 yrs', anon: false },
    time: '5h', score: 98, downvotes: 0, vote: null, replyCount: 31,
    title: '5 years in. It gets better.',
    body: 'Just hit 5 years in this field. Started thinking I’d burn out at 2. The longer I’m in it, the more I love it. To all the new DAs/RDHs feeling overwhelmed — it gets better.',
    replies: [
      { id: 'gb2-1', author: { initials: 'BL', anon: false, name: 'Briana L.', role: 'DA · 2 yrs' }, time: '4h', text: 'Needed to read this. Thank you.', likes: 24, liked: false },
    ],
  },
  {
    id: 'g-break-3', scope: 'breakroom',
    author: { initials: 'JT', name: 'Jordan T.', role: 'DA · 7 yrs', anon: false },
    time: '1d', score: 67, downvotes: 0, vote: null, replyCount: 22,
    title: 'Snack drawer "for the temps"',
    body: 'Office I temped at today had a snack drawer specifically labeled "for the temps." I almost cried. The bar is on the floor and yet.',
    replies: [
      { id: 'gb3-1', author: { initials: 'KM', anon: false, name: 'Kiara M.', role: 'DA · 4 yrs' }, time: '20h', text: 'Spill the office name immediately, we need to know.', likes: 41, liked: false },
    ],
  },
  {
    id: 'g-da-1', scope: 'da-only',
    author: { initials: 'RP', name: 'Rachel P.', role: 'DA · 4 yrs', anon: false },
    time: '6h', score: 34, downvotes: 0, vote: null, replyCount: 18,
    title: 'Temping → permanent: was the trade-off worth it?',
    body: 'DAs only — real question. Anyone successfully transitioned from temping to permanent and felt like the trade-off was worth it? Or did you regret losing the flexibility?',
    replies: [
      { id: 'gd1-1', author: { initials: 'TK', anon: false, name: 'Tina K.', role: 'DA · 8 yrs' }, time: '4h', text: 'Did permanent for 3 years, went back to temping. Flexibility wins for me.', likes: 19, liked: false },
    ],
  },
];

// ── Inline icons (kept tiny, no external deps) ───────────────
const Svg = ({ children, size = 20, stroke = 'currentColor', fill = 'none', strokeWidth = 2, style }) => (
  <svg
    viewBox="0 0 24 24"
    fill={fill}
    stroke={stroke}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: size, height: size, ...style }}
  >
    {children}
  </svg>
);

const ICONS = {
  search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  comment: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  arrowUp: <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>,
  arrowDown: <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
  back: <polyline points="15 18 9 12 15 6" />,
  chevR: <polyline points="9 18 15 12 9 6" />,
  send: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
  pencil: <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />,
  tag: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  heart: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  // Group icons
  hacks: <><path d="M9 11H1l3-3-3-3" /><path d="M22 12h-7" /><path d="M15 18l3 3 3-3" /><path d="M22 21h-7" /><path d="M9 6h13" /><path d="M5 11l-3 3 3 3" /></>,
  events: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  breakroom: <><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></>,
  'da-only': <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></>,
};

// ── Avatar ──────────────────────────────────────────────────
function Avatar({ author, size = 36, showVerify = true, onClick }) {
  const isAnon = author.anon;
  const fontSize = size <= 28 ? 10 : size <= 36 ? 12 : 13;
  const verifyDim = size <= 36 ? 12 : 14;
  const verifyIcon = size <= 36 ? 6 : 7;
  // Resolve avatar from the directory if the author isn't anon and the
  // caller didn't pass an override on the author object.
  const directoryEntry = !isAnon ? lookupLoungeUser(author.name) : undefined;
  const avatarUrl = !isAnon && (author.avatarUrl || directoryEntry?.avatarUrl);
  const handler = onClick && !isAnon ? (e) => { e.stopPropagation(); onClick(); } : undefined;
  return (
    <div
      onClick={handler}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: isAnon ? ANON_GRADIENT : SAGE_GRADIENT,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontWeight: 600,
        fontSize,
        flexShrink: 0,
        position: 'relative',
        fontFamily: FONT_DM,
        overflow: 'hidden',
        cursor: handler ? 'pointer' : 'default',
      }}
    >
      {isAnon ? (
        <Svg size={size * 0.55}>{ICONS.user}</Svg>
      ) : avatarUrl ? (
        <img
          src={avatarUrl}
          alt={author.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        author.initials
      )}
      {!isAnon && showVerify && (
        <span
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: verifyDim,
            height: verifyDim,
            borderRadius: '50%',
            background: GREEN,
            border: '2px solid #fff',
            display: 'grid',
            placeItems: 'center',
            zIndex: 1,
          }}
        >
          <Svg size={verifyIcon} stroke="#fff" strokeWidth={3}>{ICONS.check}</Svg>
        </span>
      )}
    </div>
  );
}

// ── Thread card (feed list item) ─────────────────────────────
function ThreadCard({ thread, onOpen, onVote, onAuthorTap }) {
  // Net score (Reddit-style: upvotes - downvotes shown in one pill).
  const netScore = thread.score;
  const upActive = thread.vote === 'up';
  const downActive = thread.vote === 'down';
  const canTapAuthor = !thread.author.anon && onAuthorTap;
  return (
    <div
      onClick={onOpen}
      style={{
        background: '#fff',
        borderBottom: `1px solid ${SOFT_DIVIDER}`,
        padding: '14px 16px',
        cursor: 'pointer',
        fontFamily: FONT_DM,
      }}
    >
      {/* Header — small avatar + author meta + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Avatar author={thread.author} size={26} showVerify={false} onClick={canTapAuthor ? onAuthorTap : undefined} />
        <div style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: '#6b7875', fontWeight: 500, lineHeight: 1.3 }}>
          <span
            onClick={canTapAuthor ? (e) => { e.stopPropagation(); onAuthorTap(); } : undefined}
            style={{ fontWeight: 600, color: '#1a1a1a', cursor: canTapAuthor ? 'pointer' : 'default' }}
          >
            {thread.author.name}
          </span>
          <span> · </span>
          <span>{thread.author.role}</span>
          <span> · </span>
          <span>{thread.time}</span>
        </div>
        {thread.tag && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '2px 9px',
              borderRadius: 100,
              background: 'rgba(26,127,94,0.1)',
              color: GREEN,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {thread.tag}
          </span>
        )}
      </div>

      {/* Title */}
      <div
        style={{
          fontFamily: FONT_OUTFIT,
          fontSize: 16.5,
          fontWeight: 600,
          lineHeight: 1.3,
          color: '#1a1a1a',
          letterSpacing: '-0.2px',
          marginBottom: 6,
        }}
      >
        {thread.title}
      </div>

      {/* Body preview */}
      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.5,
          color: '#5a5a5a',
          marginBottom: 12,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {thread.body}
      </div>

      {/* Reddit-style action row: combined vote pill + comments pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <RedditVoteBar
          netScore={netScore}
          upActive={upActive}
          downActive={downActive}
          onUp={(e) => { e.stopPropagation(); onVote('up'); }}
          onDown={(e) => { e.stopPropagation(); onVote('down'); }}
        />
        <ActionPill onClick={(e) => { e.stopPropagation(); onOpen(); }} icon={ICONS.comment} label={thread.replyCount} />
      </div>
    </div>
  );
}

// Combined up/down vote pill — Reddit-style. Net score sits between
// the arrows and shifts color based on the user's current vote.
function RedditVoteBar({ netScore, upActive, downActive, onUp, onDown }) {
  const scoreColor = upActive ? GREEN : downActive ? CORAL : '#1a1a1a';
  const bg = upActive
    ? 'rgba(26,127,94,0.10)'
    : downActive
      ? 'rgba(232,115,74,0.10)'
      : '#f3f4f6';
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 4px',
        borderRadius: 100,
        background: bg,
        userSelect: 'none',
        fontFamily: FONT_DM,
        transition: 'background 0.15s',
      }}
    >
      <button
        onClick={onUp}
        aria-label="Upvote"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          padding: 0,
        }}
      >
        <Svg size={16} stroke={upActive ? GREEN : '#1a1a1a'} strokeWidth={upActive ? 2.6 : 2.2}>
          {ICONS.arrowUp}
        </Svg>
      </button>
      <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor, minWidth: 18, textAlign: 'center' }}>
        {netScore}
      </span>
      <button
        onClick={onDown}
        aria-label="Downvote"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          padding: 0,
        }}
      >
        <Svg size={16} stroke={downActive ? CORAL : '#1a1a1a'} strokeWidth={downActive ? 2.6 : 2.2}>
          {ICONS.arrowDown}
        </Svg>
      </button>
    </div>
  );
}

// Generic Reddit-style action pill (icon + count). Used for the
// comment count on each thread card.
function ActionPill({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '6px 10px',
        borderRadius: 100,
        background: '#f3f4f6',
        border: 'none',
        cursor: 'pointer',
        userSelect: 'none',
        fontFamily: FONT_DM,
        fontSize: 13,
        fontWeight: 600,
        color: '#1a1a1a',
      }}
    >
      <Svg size={14} stroke="#1a1a1a" strokeWidth={2.2}>{icon}</Svg>
      {label}
    </button>
  );
}

// Kept for the thread-detail sheet which still uses the old
// VoteButton for its top-right vote/downvote display.
function VoteButton({ active, direction, onClick, count }) {
  const color = active ? (direction === 'up' ? GREEN : CORAL) : '#444';
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        padding: '6px 6px',
        borderRadius: 6,
        userSelect: 'none',
        fontSize: 13,
        fontWeight: 700,
        color,
      }}
    >
      <Svg size={18} stroke={color} strokeWidth={2.2}>
        {direction === 'up' ? ICONS.arrowUp : ICONS.arrowDown}
      </Svg>
      <span>{count}</span>
    </div>
  );
}

// ── Inline poll widget ──────────────────────────────────────
function Poll({ poll, onVote }) {
  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {poll.options.map((opt, i) => {
        const voted = poll.voted === i;
        const fillBg = voted
          ? 'rgba(26,127,94,0.25)'
          : opt.leading
            ? 'rgba(26,127,94,0.18)'
            : 'rgba(26,127,94,0.1)';
        return (
          <div
            key={i}
            onClick={() => onVote(i)}
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              position: 'relative',
              overflow: 'hidden',
              background: '#fafafa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${opt.pct}%`, background: fillBg }} />
            <span style={{ position: 'relative', zIndex: 1 }}>{opt.label}</span>
            <span style={{ position: 'relative', zIndex: 1, fontSize: 12, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
              {opt.pct}%
              {voted && <Svg size={11} stroke={GREEN} strokeWidth={2.5}>{ICONS.check}</Svg>}
            </span>
          </div>
        );
      })}
      <div style={{ fontSize: 11.5, color: '#999', marginTop: 4 }}>{poll.meta}</div>
    </div>
  );
}

// ── Office reference pill ───────────────────────────────────
function OfficeChip({ office }) {
  return (
    <div
      style={{
        marginTop: 10,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        background: BG,
        borderRadius: 100,
        fontSize: 12,
      }}
    >
      <div style={{ width: 18, height: 18, borderRadius: 6, background: SAGE_GRADIENT }} />
      <span style={{ fontWeight: 600 }}>{office.name}</span>
      <span style={{ color: '#888', display: 'flex', alignItems: 'center', gap: 3 }}>
        <Svg size={10} stroke="none" fill="#f4b740">{ICONS.star}</Svg>
        {office.rating}
      </span>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────
function EmptyState({ message }) {
  return (
    <div
      style={{
        padding: '80px 30px',
        textAlign: 'center',
        color: '#888',
        background: '#fff',
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 14,
        fontFamily: FONT_DM,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 20,
          background: '#f5f5f5',
          margin: '0 auto 14px',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Svg size={26} stroke="#bbb">{ICONS.comment}</Svg>
      </div>
      <h3 style={{ fontFamily: FONT_OUTFIT, fontSize: 16, fontWeight: 600, color: '#555', marginBottom: 6 }}>No posts yet</h3>
      <p style={{ fontSize: 13, maxWidth: 260, margin: '0 auto' }}>{message}</p>
    </div>
  );
}

// ── Toast ───────────────────────────────────────────────────
function Toast({ message, show }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 180,
        left: '50%',
        transform: `translateX(-50%) translateY(${show ? 0 : 20}px)`,
        background: '#1a1a1a',
        color: '#fff',
        padding: '10px 16px',
        borderRadius: 100,
        fontSize: 13,
        fontWeight: 500,
        zIndex: 90,
        opacity: show ? 1 : 0,
        pointerEvents: 'none',
        transition: 'all 0.25s',
        fontFamily: FONT_DM,
      }}
    >
      {message}
    </div>
  );
}

// ── Thread detail sheet ─────────────────────────────────────
function ThreadSheet({ thread, onClose, onVote, onPollVote, onReplyLike, onSendReply, onAuthorTap }) {
  const [replyText, setReplyText] = useState('');
  const bodyScrollRef = useRef(null);

  if (!thread) return null;
  const tapAuthor = (author) => { if (onAuthorTap && !author.anon) onAuthorTap(author); };

  const upvotes = thread.score + thread.downvotes;
  const upActive = thread.vote === 'up';
  const downActive = thread.vote === 'down';

  const send = () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    onSendReply(trimmed);
    setReplyText('');
    setTimeout(() => {
      const node = bodyScrollRef.current;
      if (node) node.scrollTop = node.scrollHeight;
    }, 50);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 60,
        }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 480,
          height: '100vh',
          background: '#fff',
          zIndex: 70,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: FONT_DM,
        }}
      >
        <div
          style={{
            padding: '14px 20px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            borderBottom: '1px solid #f0f0f0',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 5,
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              borderRadius: '50%',
              marginLeft: -8,
              background: 'none',
              border: 'none',
            }}
          >
            <Svg size={20} stroke="#1a1a1a" strokeWidth={2.3}>{ICONS.back}</Svg>
          </button>
          <h2 style={{ fontFamily: FONT_OUTFIT, fontSize: 16, fontWeight: 600 }}>Thread</h2>
        </div>

        <div ref={bodyScrollRef} style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
          <div style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <Avatar author={thread.author} size={40} onClick={() => tapAuthor(thread.author)} />
              <div style={{ flex: 1, minWidth: 0, fontSize: 13, lineHeight: 1.35 }}>
                <div>
                  <span
                    onClick={() => tapAuthor(thread.author)}
                    style={{ fontWeight: 700, cursor: !thread.author.anon && onAuthorTap ? 'pointer' : 'default' }}
                  >
                    {thread.author.name}
                  </span>
                  {' — '}
                  <span style={{ fontWeight: 600 }}>{thread.author.role}</span>
                </div>
                {thread.location && (
                  <div style={{ marginTop: 2 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontWeight: 600 }}>
                      <Svg size={12}>{ICONS.pin}</Svg>
                      {thread.location}
                    </span>
                  </div>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#666' }}>{thread.time}</span>
            </div>

            {thread.tag && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '4px 12px',
                  borderRadius: 100,
                  background: 'rgba(26,127,94,0.1)',
                  color: GREEN,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 14,
                }}
              >
                <Svg size={12}>{ICONS.tag}</Svg>
                {thread.tag}
              </div>
            )}

            <div
              style={{
                fontFamily: FONT_OUTFIT,
                fontSize: 22,
                fontWeight: 700,
                lineHeight: 1.25,
                letterSpacing: '-0.3px',
                marginBottom: 14,
              }}
            >
              {thread.title}
            </div>

            <div style={{ fontSize: 15, lineHeight: 1.55, color: '#222', marginBottom: 14, whiteSpace: 'pre-wrap' }}>
              {thread.body}
            </div>

            {thread.poll && <Poll poll={thread.poll} onVote={(i) => onPollVote(thread.id, i)} />}
            {thread.office && <OfficeChip office={thread.office} />}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 18, borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: GREEN, fontSize: 13, fontWeight: 600 }}>
                <Svg size={16} stroke={GREEN}>{ICONS.comment}</Svg>
                <span>{thread.replyCount} comments</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <VoteButton active={upActive} direction="up" onClick={() => onVote('up')} count={upvotes} />
                <VoteButton active={downActive} direction="down" onClick={() => onVote('down')} count={thread.downvotes} />
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 20px 6px', fontSize: 12.5, color: '#666', fontWeight: 600 }}>
            {thread.replies.length} replies
          </div>

          <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {thread.replies.map((r) => (
              <div key={r.id} style={{ display: 'flex', gap: 12 }}>
                <Avatar author={r.author} size={36} onClick={() => tapAuthor(r.author)} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span
                      onClick={() => tapAuthor(r.author)}
                      style={{ fontWeight: 600, cursor: !r.author.anon && onAuthorTap ? 'pointer' : 'default' }}
                    >
                      {r.author.name}
                    </span>
                    <span style={{ color: '#999', fontSize: 12 }}>{r.author.role}</span>
                    <span style={{ color: '#999', fontSize: 11.5, marginLeft: 'auto' }}>{r.time}</span>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.45, color: '#333', marginTop: 3 }}>{r.text}</div>
                  <div style={{ display: 'flex', gap: 14, marginTop: 6, fontSize: 11.5, color: '#888' }}>
                    <button
                      onClick={() => onReplyLike(r.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        cursor: 'pointer',
                        padding: '3px 4px',
                        margin: '-3px -4px',
                        borderRadius: 4,
                        background: 'none',
                        border: 'none',
                        color: r.liked ? CORAL : '#888',
                        fontFamily: 'inherit',
                      }}
                    >
                      <Svg size={12} stroke={r.liked ? CORAL : '#888'} fill={r.liked ? CORAL : 'none'}>{ICONS.heart}</Svg>
                      <span>{r.likes}</span>
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Reply</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            padding: '10px 16px 20px',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
          }}
        >
          <Avatar author={{ initials: ME.initials, anon: false }} size={32} showVerify={false} />
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Reply to thread…"
            rows={1}
            style={{
              flex: 1,
              padding: '9px 14px',
              background: '#f5f5f5',
              borderRadius: 20,
              fontSize: 14,
              color: '#1a1a1a',
              border: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              resize: 'none',
              maxHeight: 100,
              minHeight: 38,
            }}
          />
          <button
            onClick={send}
            disabled={replyText.trim().length === 0}
            style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: replyText.trim().length === 0 ? '#e0e0e0' : GREEN,
              display: 'grid',
              placeItems: 'center',
              cursor: replyText.trim().length === 0 ? 'default' : 'pointer',
              flexShrink: 0,
              border: 'none',
            }}
          >
            <Svg size={16} stroke="#fff" strokeWidth={2.5}>{ICONS.send}</Svg>
          </button>
        </div>
      </div>
    </>
  );
}

// ── Compose sheet ───────────────────────────────────────────
function ComposeSheet({ open, onClose, currentTab, currentGroupId, onPost }) {
  if (!open) return null;
  return (
    <ComposeSheetInner
      onClose={onClose}
      currentTab={currentTab}
      currentGroupId={currentGroupId}
      onPost={onPost}
    />
  );
}

function ComposeSheetInner({ onClose, currentTab, currentGroupId, onPost }) {
  const [text, setText] = useState('');
  const [anon, setAnon] = useState(false);
  const [selectedRole, setSelectedRole] = useState(ME.roleId);
  const [selectedGroup, setSelectedGroup] = useState(currentGroupId || 'hacks');

  let targetLabel;
  let pickerType; // 'role' | 'group' | null
  if (currentTab === 'feed') {
    targetLabel = (<>Posting to <strong style={{ color: '#1a1a1a', fontWeight: 600 }}>My Feed</strong></>);
    pickerType = 'role';
  } else if (currentGroupId) {
    targetLabel = (<>Posting to <strong style={{ color: '#1a1a1a', fontWeight: 600 }}>{GROUPS[currentGroupId].name}</strong></>);
    pickerType = null;
  } else {
    targetLabel = 'Pick a group to post in:';
    pickerType = 'group';
  }

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onPost({
      text: trimmed,
      anon,
      scope: currentTab === 'feed' ? 'feed' : (currentGroupId || selectedGroup),
      roleType: currentTab === 'feed' ? selectedRole : null,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        height: '100vh',
        background: '#fff',
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT_DM,
      }}
    >
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <button onClick={onClose} style={{ fontSize: 14, color: '#888', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          Cancel
        </button>
        <div style={{ fontFamily: FONT_OUTFIT, fontSize: 16, fontWeight: 600 }}>New post</div>
        <button
          onClick={send}
          disabled={text.trim().length === 0}
          style={{
            fontSize: 14,
            color: text.trim().length === 0 ? '#999' : '#fff',
            fontWeight: 600,
            background: text.trim().length === 0 ? '#e0e0e0' : GREEN,
            padding: '7px 16px',
            borderRadius: 100,
            border: 'none',
            cursor: text.trim().length === 0 ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Post
        </button>
      </div>

      <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, color: '#666' }}>
        {targetLabel}
      </div>

      {pickerType && (
        <div
          style={{
            padding: '12px 20px',
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            borderBottom: '1px solid #f0f0f0',
            scrollbarWidth: 'none',
          }}
        >
          {pickerType === 'role'
            ? ROLES.filter((r) => r.id !== 'all').map((r) => {
                const sel = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRole(r.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 100,
                      border: `1px solid ${sel ? GREEN : '#e0e0e0'}`,
                      background: sel ? GREEN : 'transparent',
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: sel ? '#fff' : '#666',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {r.name}
                  </button>
                );
              })
            : Object.keys(GROUPS).map((gid) => {
                const sel = selectedGroup === gid;
                return (
                  <button
                    key={gid}
                    onClick={() => setSelectedGroup(gid)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 100,
                      border: `1px solid ${sel ? GREEN : '#e0e0e0'}`,
                      background: sel ? GREEN : 'transparent',
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: sel ? '#fff' : '#666',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {GROUPS[gid].name}
                  </button>
                );
              })}
        </div>
      )}

      <div style={{ flex: 1, padding: '18px 20px', display: 'flex', gap: 12 }}>
        <Avatar author={{ initials: ME.initials, anon: anon }} size={36} showVerify={false} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            currentTab === 'feed'
              ? 'Share something with the Kazi community…'
              : currentGroupId
                ? `Share with the ${GROUPS[currentGroupId].name}…`
                : 'Share with the group…'
          }
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            fontSize: 16,
            lineHeight: 1.5,
            color: '#1a1a1a',
            resize: 'none',
            height: '100%',
          }}
        />
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: '#666', fontWeight: 500 }}>Anonymous</span>
          <div
            onClick={() => setAnon(!anon)}
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: anon ? GREEN : '#e0e0e0',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#fff',
                transform: anon ? 'translateX(16px)' : 'translateX(0)',
                transition: 'transform 0.15s',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Group row in groups landing ─────────────────────────────
function GroupRow({ groupId, group, onOpen }) {
  return (
    <div
      onClick={() => onOpen(groupId)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 16px',
        cursor: 'pointer',
        borderBottom: `1px solid ${SOFT_DIVIDER}`,
        transition: 'background 0.12s',
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: SAGE_GRADIENT,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
        }}
      >
        <Svg size={22} stroke="#fff">{ICONS[groupId] || ICONS.user}</Svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT_OUTFIT,
            fontSize: 15.5,
            fontWeight: 600,
            letterSpacing: '-0.2px',
            color: '#1a1a1a',
            marginBottom: 2,
          }}
        >
          {group.name}
        </div>
        <div style={{ fontSize: 12.5, color: '#888', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: GREEN, fontWeight: 600 }}>Joined</span>
          <span style={{ color: '#ccc' }}>·</span>
          <span>{group.members} members</span>
        </div>
      </div>
      <div style={{ color: '#bbb', flexShrink: 0 }}>
        <Svg size={16} stroke="#bbb" strokeWidth={2.3}>{ICONS.chevR}</Svg>
      </div>
    </div>
  );
}

// ============================================================
// Main page
// ============================================================
export default function Lounge() {
  const navigate = useNavigate();
  const openAuthorProfile = (author) => {
    if (!author || author.anon) return;
    const u = lookupLoungeUser(author.name);
    if (u?.handle) navigate(`/lounge/u/${u.handle}`);
  };
  const [currentTab, setCurrentTab] = useState('feed'); // 'feed' | 'groups'
  const [currentRole, setCurrentRole] = useState('all');
  const [currentGroupId, setCurrentGroupId] = useState(null);
  const [openThreadId, setOpenThreadId] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [groupJoined, setGroupJoined] = useState({ hacks: true, events: true, breakroom: true, 'da-only': true });
  const [toast, setToast] = useState({ message: '', show: false });
  const toastTimer = useRef(null);

  // ── TODO API: fetchThreads(scope, roleType?) ──
  // useEffect(() => {
  //   fetch(`/api/lounge/threads?scope=${currentTab === 'feed' ? 'feed' : currentGroupId}${currentRole !== 'all' ? `&role=${currentRole}` : ''}`)
  //     .then(r => r.json()).then(setThreads);
  // }, [currentTab, currentRole, currentGroupId]);

  const showToast = (msg) => {
    setToast({ message: msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 1800);
  };

  // ── Vote toggle ────────────────────────────────
  const toggleVote = (threadId, direction) => {
    // TODO API: castVote(threadId, direction)
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const prevVote = t.vote;
        let { score, downvotes } = t;
        let newVote;
        if (prevVote === direction) {
          newVote = null;
          if (direction === 'up') score -= 1;
          else { score += 1; downvotes -= 1; }
        } else if (prevVote === null) {
          newVote = direction;
          if (direction === 'up') score += 1;
          else { score -= 1; downvotes += 1; }
        } else {
          newVote = direction;
          if (direction === 'up') { score += 2; downvotes -= 1; }
          else { score -= 2; downvotes += 1; }
        }
        return { ...t, vote: newVote, score, downvotes };
      })
    );
  };

  // ── Poll vote ──────────────────────────────────
  const votePoll = (threadId, optionIdx) => {
    // TODO API: voteOnPoll(threadId, optionIdx)
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId || !t.poll || t.poll.voted === optionIdx) return t;
        return { ...t, poll: { ...t.poll, voted: optionIdx } };
      })
    );
    showToast('Vote recorded');
  };

  // ── Reply like toggle ──────────────────────────
  const toggleReplyLike = (threadId, replyId) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          replies: t.replies.map((r) => (r.id !== replyId ? r : { ...r, liked: !r.liked, likes: r.likes + (r.liked ? -1 : 1) })),
        };
      })
    );
  };

  // ── Send reply ─────────────────────────────────
  const sendReply = (threadId, text) => {
    // TODO API: postReply(threadId, text)
    const newReply = {
      id: `r-${threadId}-${Date.now()}`,
      author: { initials: ME.initials, anon: false, name: ME.name, role: ME.role },
      time: 'now',
      text,
      likes: 0,
      liked: false,
    };
    setThreads((prev) =>
      prev.map((t) => (t.id !== threadId ? t : { ...t, replies: [...t.replies, newReply], replyCount: t.replyCount + 1 }))
    );
    showToast('Reply sent');
  };

  // ── Post a new thread ──────────────────────────
  const postThread = ({ text, anon, scope, roleType }) => {
    // TODO API: postThread({ scope, roleType, text, anonymous })
    const lines = text.split(/\n+/);
    const title = lines[0].length <= 90 ? lines[0] : lines[0].slice(0, 90) + '…';
    const body = lines.slice(1).join('\n').trim() || text;
    const newThread = {
      id: `t-${Date.now()}`,
      scope,
      roleType,
      author: anon
        ? { initials: null, name: 'Anonymous Member', role: 'verified', anon: true }
        : { initials: ME.initials, name: ME.name, role: ME.role, anon: false },
      time: 'now',
      score: 0,
      downvotes: 0,
      vote: null,
      replyCount: 0,
      title,
      body,
      replies: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    setComposeOpen(false);
    if (scope === 'feed') {
      setCurrentTab('feed');
      if (roleType && currentRole !== 'all') setCurrentRole(roleType);
    } else {
      setCurrentTab('groups');
      setCurrentGroupId(scope);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Posted');
  };

  // ── Group join toggle ──────────────────────────
  const toggleJoin = (groupId) => {
    // TODO API: joinGroup(groupId) / leaveGroup(groupId)
    setGroupJoined((prev) => {
      const next = { ...prev, [groupId]: !prev[groupId] };
      showToast(next[groupId] ? 'Joined group' : 'Left group');
      return next;
    });
  };

  // ── Filtered threads for current view ──────────
  const visibleThreads = useMemo(() => {
    if (currentTab === 'feed') {
      const feedThreads = threads.filter((t) => t.scope === 'feed');
      return currentRole === 'all' ? feedThreads : feedThreads.filter((t) => t.roleType === currentRole);
    }
    if (currentGroupId) return threads.filter((t) => t.scope === currentGroupId);
    return [];
  }, [threads, currentTab, currentRole, currentGroupId]);

  const openThread = threads.find((t) => t.id === openThreadId);

  // ── Render ─────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: FONT_DM, paddingBottom: 90 }}>
      {/* In-Lounge title bar (replaces app TopBar on this screen) */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 41,
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(16px)',
          padding: '14px 20px 0',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h1 style={{ fontFamily: FONT_OUTFIT, fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px' }}>Lounge</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              aria-label="Search lounge"
              style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Svg size={20} stroke="#1a1a1a">{ICONS.search}</Svg>
            </button>
            <button
              type="button"
              aria-label="Notifications"
              style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}
            >
              <Svg size={20} stroke="#1a1a1a">{ICONS.bell}</Svg>
              <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: CORAL }} />
            </button>
          </div>
        </div>

        {/* My Feed | Groups tabs */}
        <div style={{ display: 'flex', gap: 28 }}>
          {[{ id: 'feed', label: 'My Feed' }, { id: 'groups', label: 'Groups', badge: 4 }].map((tab) => {
            const active = currentTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  setCurrentGroupId(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                style={{
                  fontFamily: FONT_OUTFIT,
                  fontSize: 17,
                  fontWeight: 600,
                  color: active ? '#1a1a1a' : '#aaa',
                  paddingBottom: 12,
                  cursor: 'pointer',
                  position: 'relative',
                  letterSpacing: '-0.2px',
                }}
              >
                {tab.label}
                {tab.badge && (
                  <span
                    style={{
                      marginLeft: 5,
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '1px 7px',
                      borderRadius: 100,
                      background: CORAL,
                      color: '#fff',
                      verticalAlign: 'middle',
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
                {active && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: GREEN,
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── My Feed view ── */}
      {currentTab === 'feed' && (
        <>
          <div
            style={{
              padding: '14px 20px 0',
              display: 'flex',
              gap: 18,
              overflowX: 'auto',
              borderBottom: '1px solid #f0f0f0',
              background: '#fff',
              scrollbarWidth: 'none',
            }}
          >
            {ROLES.map((r) => {
              const active = r.id === currentRole;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setCurrentRole(r.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    fontSize: 13.5,
                    fontWeight: active ? 600 : 500,
                    color: active ? '#1a1a1a' : '#888',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    paddingBottom: 12,
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  {r.name}
                  {active && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: '#1a1a1a',
                        borderRadius: 2,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div
            style={{
              background: '#ffffff',
              padding: '14px 16px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${SOFT_DIVIDER}`,
            }}
          >
            <h2 style={{ fontFamily: FONT_OUTFIT, fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Trending</h2>
          </div>

          <div style={{ background: '#ffffff', minHeight: 'calc(100vh - 200px)' }}>
            {visibleThreads.length === 0 ? (
              <div style={{ padding: 12 }}>
                <EmptyState message="Be the first to start a conversation here." />
              </div>
            ) : (
              visibleThreads.map((t) => (
                <ThreadCard
                  key={t.id}
                  thread={t}
                  onOpen={() => setOpenThreadId(t.id)}
                  onVote={(dir) => toggleVote(t.id, dir)}
                  onAuthorTap={() => openAuthorProfile(t.author)}
                />
              ))
            )}
          </div>
        </>
      )}

      {/* ── Groups landing ── */}
      {currentTab === 'groups' && !currentGroupId && (
        <div style={{ background: BG, minHeight: 'calc(100vh - 200px)' }}>
          <div style={{ padding: '18px 20px 14px' }}>
            <h2 style={{ fontFamily: FONT_OUTFIT, fontSize: 22, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 4 }}>Groups</h2>
            <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.45 }}>Spaces where every verified Kazi member can connect.</p>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 1, textTransform: 'uppercase', padding: '14px 20px 8px' }}>
            All-member groups
          </div>
          <div style={{ background: '#fff', margin: '0 12px 16px', border: `1px solid ${CARD_BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {Object.entries(GROUPS)
              .filter(([, g]) => g.section === 'all')
              .map(([gid, g]) => (
                <GroupRow key={gid} groupId={gid} group={g} onOpen={setCurrentGroupId} />
              ))}
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 1, textTransform: 'uppercase', padding: '14px 20px 8px' }}>
            Role-specific subgroups
          </div>
          <div style={{ background: '#fff', margin: '0 12px 16px', border: `1px solid ${CARD_BORDER}`, borderRadius: 14, overflow: 'hidden' }}>
            {Object.entries(GROUPS)
              .filter(([, g]) => g.section === 'role')
              .map(([gid, g]) => (
                <GroupRow key={gid} groupId={gid} group={g} onOpen={setCurrentGroupId} />
              ))}
          </div>
        </div>
      )}

      {/* ── Group detail view ── */}
      {currentTab === 'groups' && currentGroupId && (
        <div style={{ background: BG, minHeight: 'calc(100vh - 200px)' }}>
          <div style={{ padding: '16px 20px 14px', display: 'flex', alignItems: 'center', gap: 12, background: BG, borderBottom: '1px solid #ececec' }}>
            <button
              onClick={() => setCurrentGroupId(null)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: '#fff', border: '1px solid #ececec', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <Svg size={18} stroke="#1a1a1a" strokeWidth={2.3}>{ICONS.back}</Svg>
            </button>
            <div style={{ width: 44, height: 44, borderRadius: 12, display: 'grid', placeItems: 'center', flexShrink: 0, background: SAGE_GRADIENT }}>
              <Svg size={22} stroke="#fff">{ICONS[currentGroupId] || ICONS.user}</Svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FONT_OUTFIT, fontSize: 17, fontWeight: 700, letterSpacing: '-0.2px' }}>{GROUPS[currentGroupId].name}</div>
              <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{GROUPS[currentGroupId].members} members</div>
            </div>
            <button
              onClick={() => toggleJoin(currentGroupId)}
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: groupJoined[currentGroupId] ? '#888' : GREEN,
                padding: '7px 14px',
                border: `1px solid ${groupJoined[currentGroupId] ? '#ddd' : GREEN}`,
                borderRadius: 100,
                background: '#fff',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {groupJoined[currentGroupId] ? 'Joined' : 'Join'}
            </button>
          </div>

          <div style={{ background: '#ffffff' }}>
            {visibleThreads.length === 0 ? (
              <div style={{ padding: 12 }}>
                <EmptyState message="Be the first to post in this group." />
              </div>
            ) : (
              visibleThreads.map((t) => (
                <ThreadCard
                  key={t.id}
                  thread={t}
                  onOpen={() => setOpenThreadId(t.id)}
                  onVote={(dir) => toggleVote(t.id, dir)}
                  onAuthorTap={() => openAuthorProfile(t.author)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* FAB → open compose */}
      <button
        onClick={() => setComposeOpen(true)}
        aria-label="New post"
        style={{
          position: 'fixed',
          bottom: 110,
          right: 'max(20px, calc(50% - 220px))',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: GREEN,
          boxShadow: '0 6px 20px rgba(26,127,94,0.35)',
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          zIndex: 35,
          border: 'none',
        }}
      >
        <Svg size={22} stroke="#fff">{ICONS.pencil}</Svg>
      </button>

      {/* Thread sheet */}
      {openThread && (
        <ThreadSheet
          thread={openThread}
          onClose={() => setOpenThreadId(null)}
          onVote={(dir) => toggleVote(openThread.id, dir)}
          onPollVote={(tid, idx) => votePoll(tid, idx)}
          onReplyLike={(rid) => toggleReplyLike(openThread.id, rid)}
          onSendReply={(text) => sendReply(openThread.id, text)}
          onAuthorTap={openAuthorProfile}
        />
      )}

      {/* Compose sheet */}
      <ComposeSheet
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        currentTab={currentTab}
        currentGroupId={currentGroupId}
        onPost={postThread}
      />

      {/* Toast */}
      <Toast message={toast.message} show={toast.show} />

      {/* Bottom nav (shared) */}
      <ProviderBottomNav />
    </div>
  );
}
