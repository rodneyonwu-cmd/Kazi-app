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
function Stat({ label, value, valueColor }) {
  return (
    <div className="flex flex-col items-center text-center" style={{ flex: 1 }}>
      <div style={{ fontFamily: FONT_OUTFIT, fontWeight: 800, fontSize: 18, color: valueColor || '#0f1a16', letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: '#6b7875', fontWeight: 500, marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Reddit-style vote bar (matches Lounge feed) ─────────────
// Inline copy of the same pattern used on the Lounge feed cards so
// the profile's posts/comments tabs share the visual language.
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
      }}
    >
      <button
        onClick={onUp}
        aria-label="Upvote"
        style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}
      >
        <Svg size={18} stroke={upActive ? GREEN : '#5a5a5a'} fill={upActive ? GREEN : 'none'} strokeWidth={2}>
          <polygon points="12 5 20 16 4 16" />
        </Svg>
      </button>
      <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor, minWidth: 18, textAlign: 'center' }}>
        {netScore}
      </span>
      <button
        onClick={onDown}
        aria-label="Downvote"
        style={{ width: 28, height: 28, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center', padding: 0 }}
      >
        <Svg size={18} stroke={downActive ? CORAL : '#5a5a5a'} fill={downActive ? CORAL : 'none'} strokeWidth={2}>
          <polygon points="12 19 20 8 4 8" />
        </Svg>
      </button>
    </div>
  );
}

function ActionPill({ onClick, label, icon }) {
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

// ── Post card (Reddit-style row, no author meta) ────────────
// On a profile we already know who the user is, so we drop the
// author header from the post card. Each post is a row separated
// by a hairline divider — matches the Lounge feed.
function PostCard({ post }) {
  const tag = TAG_COLORS[post.tag] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
  return (
    <div
      style={{
        background: '#ffffff',
        borderBottom: `1px solid ${SOFT_DIVIDER}`,
        padding: '14px 16px',
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
            padding: '2px 9px',
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
      <div style={{ fontFamily: FONT_OUTFIT, fontWeight: 600, fontSize: 16.5, color: '#1a1a1a', letterSpacing: '-0.2px', lineHeight: 1.3 }}>
        {post.title}
      </div>
      {post.body && (
        <div style={{ fontSize: 13.5, color: '#5a5a5a', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.body}
        </div>
      )}
      <div className="flex items-center gap-[8px] mt-[4px]">
        <RedditVoteBar netScore={post.score} upActive={false} downActive={false} onUp={() => {}} onDown={() => {}} />
        <ActionPill
          icon={<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />}
          label={post.replyCount}
          onClick={() => {}}
        />
      </div>
    </div>
  );
}

// ── Comment card (Reddit-style row) ─────────────────────────
function CommentCard({ comment }) {
  return (
    <div
      style={{
        background: '#ffffff',
        borderBottom: `1px solid ${SOFT_DIVIDER}`,
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 11.5, color: '#9aa5a1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          Replied to
        </div>
        <span style={{ fontSize: 12, color: '#9aa5a1', fontWeight: 500 }}>{comment.time}</span>
      </div>
      <div style={{ fontFamily: FONT_OUTFIT, fontWeight: 600, fontSize: 14.5, color: '#1a1a1a', lineHeight: 1.3, letterSpacing: '-0.1px' }}>
        {comment.parentTitle}
      </div>
      <div style={{ borderLeft: `2px solid ${SOFT_DIVIDER}`, paddingLeft: 10, fontSize: 13.5, color: '#444', lineHeight: 1.5 }}>
        {comment.text}
      </div>
      <div className="flex items-center gap-[8px] mt-[2px]">
        <RedditVoteBar netScore={comment.score} upActive={false} downActive={false} onUp={() => {}} onDown={() => {}} />
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
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: FONT_DM, paddingBottom: 90 }}>
      {/* Sticky topbar */}
      {/* Sticky topbar — circular back button only, no name. */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 41,
          background: '#ffffff',
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="kazi-tap"
          style={{
            width: 36,
            height: 36,
            display: 'grid',
            placeItems: 'center',
            background: '#f9f8f6',
            border: '1px solid #ececec',
            borderRadius: '50%',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Svg size={16} stroke="#1a1a1a" strokeWidth={2.4}>
            <polyline points="15 18 9 12 15 6" />
          </Svg>
        </button>
      </div>

      {/* Hero — flows flat on the white page, no bordered card */}
      <section style={{ padding: '18px 20px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 14 }}>
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
          <p style={{ fontSize: 14, lineHeight: 1.5, color: '#444', marginBottom: 14 }}>
            {user.bio}
          </p>
        )}

        {/* Action row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
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

        {/* Stats row — Upvotes (green) + Posts. Downvotes and
            Followers intentionally omitted; aggregated reputation
            score deferred. */}
        <div style={{ display: 'flex', gap: 4, paddingTop: 14, borderTop: `1px solid ${SOFT_DIVIDER}` }}>
          <Stat label="Upvotes" value={user.upvoteCount} valueColor="#1a7f5e" />
          <Stat label="Posts" value={user.postCount} />
        </div>
      </section>

      {/* Tab strip */}
      <section style={{ padding: '0 20px', position: 'sticky', top: 65, zIndex: 30, background: '#ffffff' }}>
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

      {/* Tab content. Posts and comments tabs run as continuous
          white feeds with hairline dividers between rows — same
          pattern as the Lounge feed. About tab keeps the rounded
          card style since it's a single info panel. */}
      <section style={{ padding: '0 0 30px' }}>
        {tab === 'posts' && (
          posts.length === 0 ? (
            <div style={{ padding: '14px 16px' }}>
              <EmptyTab label={`${user.name.split(' ')[0]} hasn't posted in the Lounge yet.`} />
            </div>
          ) : (
            <div style={{ background: '#ffffff', borderTop: `1px solid ${SOFT_DIVIDER}` }}>
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )
        )}

        {tab === 'comments' && (
          comments.length === 0 ? (
            <div style={{ padding: '14px 16px' }}>
              <EmptyTab label={`${user.name.split(' ')[0]} hasn't commented in the Lounge yet.`} />
            </div>
          ) : (
            <div style={{ background: '#ffffff', borderTop: `1px solid ${SOFT_DIVIDER}` }}>
              {comments.map((c) => <CommentCard key={c.id} comment={c} />)}
            </div>
          )
        )}

        {tab === 'about' && (
          <div style={{ padding: '14px 16px' }}>
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
