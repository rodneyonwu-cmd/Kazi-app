import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProviderBottomNav from '../../components/ProviderBottomNav';
import { LOUNGE_USERS } from './loungeUsers';

// ============================================================
// LOUNGE PROFILE — Reddit-style provider profile inside the Lounge.
// Distinct from /professionals/:id (the office-facing view) and
// /my-profile (the provider-self view). This is the community-facing
// view that other Lounge members see when they tap an author.
//
// Content: hero w/ avatar + bio + follow/message + stats, then
// tabs (Posts / Comments / About). Posts and comments are sourced
// from the Lounge thread mock for now; real version will pull from
// /api/lounge/users/:handle.
// ============================================================

const GREEN = '#1a7f5e';
const CORAL = '#e8734a';
const BG = '#f9f8f6';
const CARD_BORDER = '#e8e6e1';
const SOFT_DIVIDER = '#f0eee8';
const SAGE_GRADIENT = 'linear-gradient(135deg, #a8c9b8 0%, #7ab8a8 100%)';
const FONT_DM = "'DM Sans', sans-serif";
const FONT_OUTFIT = "'Outfit', sans-serif";

const Svg = ({ children, size = 18, stroke = 'currentColor', fill = 'none', strokeWidth = 2, style }) => (
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

// ── Mock posts/comments (will come from /api/lounge/users/:handle) ──
// Both posts and comments here reference the user by handle so the
// page can render activity for any user from the directory.
const MOCK_POSTS_BY_HANDLE = {
  'rachel-p': [
    { id: 'p-rp-1', tag: 'Pay Talk',     title: 'Fair hourly rate for an experienced DA in Houston metro?', body: 'Trying to calibrate before my next shift. What are folks getting paid right now?', score: 28, replyCount: 41, time: '3h' },
    { id: 'p-rp-2', tag: 'Office Review', title: 'Evolve Dentistry on the Sugar Land side — would book again.', body: 'Clean office, friendly staff, hands-off doc.', score: 19, replyCount: 8, time: '6d' },
    { id: 'p-rp-3', tag: 'Tip',          title: 'Always pre-set the hand-piece tray for the first appointment.', body: 'Saves 5 minutes of chaos in the morning.', score: 31, replyCount: 12, time: '2w' },
  ],
  'maya-c': [
    { id: 'p-mc-1', tag: 'Tip',          title: 'PSA: confirm tray setup BEFORE first patient', body: 'Always check tray setup and where the ultrasonic tips are kept before first patient.', score: 67, replyCount: 19, time: '5h' },
    { id: 'p-mc-2', tag: 'Pay Talk',     title: 'Pearland average rates feeling stagnant?', body: 'Anyone notice rates flat for a while now?', score: 24, replyCount: 16, time: '3w' },
  ],
  'tina-k': [
    { id: 'p-tk-1', tag: 'Tip',          title: 'How to cleanly negotiate the first hour of a new shift', body: 'Three things to ask in the first 60 minutes.', score: 88, replyCount: 27, time: '1d' },
  ],
  'jordan-t': [
    { id: 'p-jt-1', tag: 'Tip',          title: 'Cement cleanup hack that saved my career', body: 'Warm instruments slightly with the air-water syringe.', score: 142, replyCount: 38, time: '2d' },
  ],
  'dr-patel': [
    { id: 'p-dp-1', tag: 'Owner Q',      title: 'Looking for an associate — what are reasonable comp expectations in 2026?', body: '30%? 35%? Daily guarantee?', score: 134, replyCount: 47, time: '7h' },
    { id: 'p-dp-2', tag: 'Owner Q',      title: 'Mandibular blocks: try Gow-Gates on thick rami', body: 'Tip from the chair side.', score: 87, replyCount: 24, time: '6h' },
  ],
};
const MOCK_COMMENTS_BY_HANDLE = {
  'rachel-p': [
    { id: 'c-rp-1', parentTitle: 'Evolve Dentistry — would book again', text: 'Evolve is on my regular rotation now. Dr. O treats temps like real team members.', score: 16, time: '1d' },
    { id: 'c-rp-2', parentTitle: 'Why "high pay" offices often have the worst turnover', text: 'I bailed on a $36/hr office after 2 weeks. Not worth the chaos.', score: 9, time: '4d' },
  ],
  'tina-k': [
    { id: 'c-tk-1', parentTitle: 'Fair hourly rate for an experienced DA in Houston metro?', text: 'Never go below $27 if you have X-ray cert + expanded duties. Know your worth.', score: 22, time: '42m' },
    { id: 'c-tk-2', parentTitle: 'Why "high pay" offices often have the worst turnover', text: 'This. Learned the hard way. $34/hr office, nobody lasted 3 months.', score: 42, time: '1d' },
  ],
  'maya-c': [
    { id: 'c-mc-1', parentTitle: 'Cement cleanup hack that saved my career', text: 'Why was I not told this years ago.', score: 28, time: '2d' },
  ],
  'dr-sanders': [
    { id: 'c-as-1', parentTitle: 'Looking for an associate', text: '30% of collections is the floor in TX right now. Good associates are getting 32-35% with a $700-800 daily guarantee for the first 6 months.', score: 41, time: '6h' },
  ],
};

// ── Tag color map (mirrors dashboard's LOUNGE_TAG_COLORS) ────
const TAG_COLORS = {
  'Pay Talk':      { bg: '#f3ecfd', text: '#5b21b6', border: '#d9c7f5' },
  'Tip':           { bg: '#e8f5f0', text: '#1a7f5e', border: '#c5e3d5' },
  'Office Review': { bg: '#fff4ec', text: '#b54a18', border: '#f7d6bc' },
  'Clinical':      { bg: '#e0f2fe', text: '#0369a1', border: '#bae0fb' },
  'Owner Q':       { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  'Billing':       { bg: '#f3ecfd', text: '#5b21b6', border: '#d9c7f5' },
};

// ── Avatar (large for hero) ─────────────────────────────────
function HeroAvatar({ user }) {
  return (
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: 24,
        background: SAGE_GRADIENT,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontFamily: FONT_OUTFIT,
        fontWeight: 700,
        fontSize: 32,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(15,29,27,0.12)',
      }}
    >
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        user.initials
      )}
      <span
        style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: GREEN,
          border: '3px solid #fff',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Svg size={10} stroke="#fff" strokeWidth={3.5}>
          <polyline points="20 6 9 17 4 12" />
        </Svg>
      </span>
    </div>
  );
}

// ── Stat block ──────────────────────────────────────────────
function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center text-center" style={{ flex: 1 }}>
      <div style={{ fontFamily: FONT_OUTFIT, fontWeight: 800, fontSize: 18, color: '#0f1a16', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#6b7875', fontWeight: 500, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Post card (reusable list item) ──────────────────────────
function PostCard({ post }) {
  const tag = TAG_COLORS[post.tag] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div className="flex items-center justify-between">
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: 100,
            background: tag.bg,
            color: tag.text,
            border: `1px solid ${tag.border}`,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: FONT_OUTFIT,
          }}
        >
          {post.tag}
        </span>
        <span style={{ fontSize: 12, color: '#9aa5a1', fontWeight: 500 }}>{post.time}</span>
      </div>
      <div style={{ fontFamily: FONT_OUTFIT, fontWeight: 600, fontSize: 16, color: '#0f1a16', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
        {post.title}
      </div>
      {post.body && (
        <div style={{ fontSize: 13.5, color: '#5a5a5a', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.body}
        </div>
      )}
      <div className="flex items-center gap-[14px] pt-[2px]">
        <span className="inline-flex items-center gap-[4px] text-[12px] font-semibold text-[#1a7f5e]">
          <Svg size={12} stroke={GREEN} strokeWidth={2.2}>
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </Svg>
          {post.score}
        </span>
        <span className="inline-flex items-center gap-[4px] text-[12px] font-semibold text-[#6b7875]">
          <Svg size={12} stroke="#6b7875">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </Svg>
          {post.replyCount}
        </span>
      </div>
    </div>
  );
}

// ── Comment card ────────────────────────────────────────────
function CommentCard({ comment }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div style={{ fontSize: 11.5, color: '#9aa5a1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
        Replied to
      </div>
      <div style={{ fontFamily: FONT_OUTFIT, fontWeight: 600, fontSize: 14.5, color: '#0f1a16', lineHeight: 1.3 }}>
        {comment.parentTitle}
      </div>
      <div style={{ borderLeft: `2px solid ${SOFT_DIVIDER}`, paddingLeft: 10, fontSize: 13.5, color: '#333', lineHeight: 1.45 }}>
        {comment.text}
      </div>
      <div className="flex items-center gap-[14px] pt-[2px]">
        <span className="inline-flex items-center gap-[4px] text-[12px] font-semibold text-[#e8734a]">
          <Svg size={12} stroke={CORAL} strokeWidth={2.2} fill={CORAL}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </Svg>
          {comment.score}
        </span>
        <span style={{ fontSize: 12, color: '#9aa5a1', fontWeight: 500 }}>{comment.time}</span>
      </div>
    </div>
  );
}

// ============================================================
// Main page
// ============================================================
export default function LoungeProfile() {
  const navigate = useNavigate();
  const { handle } = useParams();
  const user = LOUNGE_USERS[handle];
  const [tab, setTab] = useState('posts'); // 'posts' | 'comments' | 'about'
  const [following, setFollowing] = useState(false);

  const posts = useMemo(() => MOCK_POSTS_BY_HANDLE[handle] || [], [handle]);
  const comments = useMemo(() => MOCK_COMMENTS_BY_HANDLE[handle] || [], [handle]);

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT_DM, padding: 24, paddingBottom: 100 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', color: GREEN, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          ← Back
        </button>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6b7875' }}>
          <p style={{ fontFamily: FONT_OUTFIT, fontWeight: 600, fontSize: 18, marginBottom: 6 }}>Profile not found</p>
          <p style={{ fontSize: 14 }}>This member is no longer in the Lounge.</p>
        </div>
        <ProviderBottomNav />
      </div>
    );
  }

  const handleFollow = () => {
    // TODO API: POST /api/lounge/users/:handle/follow|unfollow
    setFollowing((v) => !v);
  };
  const handleMessage = () => {
    // TODO: route to a real lounge-DM thread; for now use existing messages.
    navigate('/messages');
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: FONT_DM, paddingBottom: 90 }}>
      {/* Sticky topbar */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 41,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(16px)',
          padding: '14px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: 10,
          }}
        >
          <Svg size={20} stroke="#1a1a1a" strokeWidth={2.3}>
            <polyline points="15 18 9 12 15 6" />
          </Svg>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT_OUTFIT, fontSize: 15, fontWeight: 700, color: '#0f1a16', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 11.5, color: '#9aa5a1', fontWeight: 500 }}>u/{user.handle}</div>
        </div>
      </div>

      {/* Hero card */}
      <section style={{ padding: '20px 16px 8px' }}>
        <div
          style={{
            background: '#ffffff',
            border: `1px solid ${CARD_BORDER}`,
            borderRadius: 18,
            padding: 18,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle banner gradient */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 70,
              background: 'linear-gradient(135deg, #d9efe2 0%, #f1f9f5 100%)',
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
            }}
          />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
            <HeroAvatar user={user} />
            <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
              <div style={{ fontFamily: FONT_OUTFIT, fontWeight: 700, fontSize: 22, color: '#0f1a16', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                {user.name}
              </div>
              <div style={{ fontSize: 13, color: '#6b7875', fontWeight: 500, marginTop: 2 }}>
                {user.roleShort} · {user.yearsExperience} yrs · {user.location}
              </div>
            </div>
          </div>

          {user.bio && (
            <p style={{ position: 'relative', fontSize: 14, lineHeight: 1.5, color: '#444', marginBottom: 14 }}>
              {user.bio}
            </p>
          )}

          {/* Action row */}
          <div style={{ position: 'relative', display: 'flex', gap: 8, marginBottom: 14 }}>
            <button
              onClick={handleFollow}
              className="kazi-tap"
              style={{
                flex: 1,
                background: following ? '#ffffff' : GREEN,
                color: following ? GREEN : '#ffffff',
                border: following ? `1px solid ${GREEN}` : 'none',
                borderRadius: 100,
                padding: '10px 16px',
                fontSize: 13.5,
                fontWeight: 700,
                fontFamily: FONT_DM,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Svg size={14} stroke={following ? GREEN : '#ffffff'} strokeWidth={2.4}>
                {following ? (
                  <polyline points="20 6 9 17 4 12" />
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                )}
              </Svg>
              {following ? 'Following' : 'Follow'}
            </button>
            <button
              onClick={handleMessage}
              className="kazi-tap"
              style={{
                flex: 1,
                background: '#ffffff',
                color: '#0f1a16',
                border: `1px solid ${CARD_BORDER}`,
                borderRadius: 100,
                padding: '10px 16px',
                fontSize: 13.5,
                fontWeight: 700,
                fontFamily: FONT_DM,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
              }}
            >
              <Svg size={14} stroke="#0f1a16" strokeWidth={2.2}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </Svg>
              Message
            </button>
          </div>

          {/* Stats row */}
          <div style={{ position: 'relative', display: 'flex', gap: 4, paddingTop: 14, borderTop: `1px solid ${SOFT_DIVIDER}` }}>
            <Stat label="Karma" value={user.karma} />
            <Stat label="Posts" value={user.postCount} />
            <Stat label="Comments" value={user.commentCount} />
            <Stat label="Followers" value={user.followerCount} />
          </div>
        </div>
      </section>

      {/* Tab strip */}
      <section style={{ padding: '0 16px', position: 'sticky', top: 65, zIndex: 30, background: BG }}>
        <div style={{ display: 'flex', gap: 24, borderBottom: `1px solid ${SOFT_DIVIDER}` }}>
          {[
            { id: 'posts', label: `Posts · ${user.postCount}` },
            { id: 'comments', label: `Comments · ${user.commentCount}` },
            { id: 'about', label: 'About' },
          ].map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: FONT_OUTFIT,
                  fontSize: 14,
                  fontWeight: 600,
                  color: active ? '#0f1a16' : '#9aa5a1',
                  padding: '12px 0',
                  position: 'relative',
                  letterSpacing: '-0.1px',
                }}
              >
                {t.label}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: GREEN,
                      borderRadius: 2,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tab content */}
      <section style={{ padding: '14px 16px 30px' }}>
        {tab === 'posts' && (
          posts.length === 0 ? (
            <EmptyTab label={`${user.name.split(' ')[0]} hasn't posted in the Lounge yet.`} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )
        )}

        {tab === 'comments' && (
          comments.length === 0 ? (
            <EmptyTab label={`${user.name.split(' ')[0]} hasn't commented in the Lounge yet.`} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {comments.map((c) => <CommentCard key={c.id} comment={c} />)}
            </div>
          )
        )}

        {tab === 'about' && (
          <div
            style={{
              background: '#ffffff',
              border: `1px solid ${CARD_BORDER}`,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <AboutRow label="Role" value={user.role} />
            <AboutRow label="Experience" value={`${user.yearsExperience} years`} />
            <AboutRow label="Location" value={user.location} />
            {user.certifications?.length > 0 && (
              <AboutRow
                label="Certifications"
                value={
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {user.certifications.map((c) => (
                      <span
                        key={c}
                        style={{
                          padding: '3px 9px',
                          background: '#f9f8f6',
                          border: '1px solid #e8e6e1',
                          borderRadius: 100,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#0f1a16',
                          fontFamily: FONT_OUTFIT,
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                }
              />
            )}
            {user.openTo?.length > 0 && (
              <AboutRow
                label="Open to"
                value={
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {user.openTo.map((o) => (
                      <span
                        key={o}
                        style={{
                          padding: '3px 9px',
                          background: '#e8f5f0',
                          border: '1px solid #c5e3d5',
                          borderRadius: 100,
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: '#1a7f5e',
                          fontFamily: FONT_OUTFIT,
                        }}
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                }
              />
            )}
            <AboutRow label="Joined" value={user.joinedDate} isLast />
          </div>
        )}
      </section>

      <ProviderBottomNav />
    </div>
  );
}

function EmptyTab({ label }) {
  return (
    <div
      style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: '#ffffff',
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        color: '#6b7875',
      }}
    >
      <div style={{ fontFamily: FONT_OUTFIT, fontWeight: 600, fontSize: 14, color: '#0f1a16', marginBottom: 4 }}>
        Nothing yet
      </div>
      <div style={{ fontSize: 13 }}>{label}</div>
    </div>
  );
}

function AboutRow({ label, value, isLast }) {
  return (
    <div
      style={{
        padding: '14px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${SOFT_DIVIDER}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 12, color: '#9aa5a1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', width: 100, flexShrink: 0, paddingTop: 2 }}>
        {label}
      </div>
      <div style={{ flex: 1, fontSize: 14, color: '#0f1a16', fontWeight: 500 }}>
        {value}
      </div>
    </div>
  );
}
