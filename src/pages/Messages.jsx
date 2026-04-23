import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import BottomNav from '../components/BottomNav';
import ProviderBottomNav from '../components/ProviderBottomNav';
import TopBar from '../components/TopBar';
import useUserRole from '../hooks/useUserRole';

// ============================================================
// KAZI MESSAGES — Unified inbox (office + provider)
// Real API. Route: /messages
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  coral: '#e8734a',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  gold: '#f4b740',
};

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
  'linear-gradient(135deg, #c8a8d4 0%, #e8a87c 100%)',
  'linear-gradient(135deg, #88c9a1 0%, #c8d4a8 100%)',
  'linear-gradient(135deg, #e8a87c 0%, #7ab8d4 100%)',
  'linear-gradient(135deg, #d4a88f 0%, #7a9bd4 100%)',
];

// today → time, yesterday → "Yesterday", older → MMM D
function fmtTime(d) {
  if (!d) return '';
  const dt = new Date(d);
  const now = new Date();
  const diff = now - dt;
  if (diff < 86400000) return dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diff < 172800000) return 'Yesterday';
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Messages() {
  const navigate = useNavigate();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { isSignedIn } = useUser();
  const { role: ctxRole, isLoading: roleLoading } = useUserRole();
  const role = ctxRole === 'office' ? 'OFFICE' : ctxRole === 'provider' ? 'PROVIDER' : null;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load conversations once role + auth are ready
  useEffect(() => {
    if (!authLoaded || !isSignedIn) return;
    if (roleLoading || !role) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const detectedRole = role;

        // Fetch conversations
        const convRes = await fetch(`${API_URL}/api/messages/conversations`, { headers });
        if (!convRes.ok) {
          if (!cancelled) setLoading(false);
          return;
        }
        const data = await convRes.json();

        const mapped = data.map((c) => {
          let name = '';
          let avatarUrl = null;
          let initials = '??';

          if (detectedRole === 'OFFICE') {
            const first = c.provider?.user?.firstName || '';
            const last = c.provider?.user?.lastName || '';
            name = `${first} ${last}`.trim() || 'Provider';
            avatarUrl = c.provider?.user?.avatarUrl || null;
            initials = getInitials(name);
          } else {
            name = c.office?.name || 'Office';
            avatarUrl = c.office?.user?.avatarUrl || null;
            initials = name.slice(0, 2).toUpperCase();
          }

          return {
            id: `${c.officeId}-${c.providerId}`,
            officeId: c.officeId,
            providerId: c.providerId,
            name,
            avatarUrl,
            initials,
            lastMsg: c.body || '',
            time: fmtTime(c.createdAt),
            unread: c.unreadCount || 0,
          };
        });

        if (!cancelled) {
          setConversations(mapped);
          setLoading(false);
        }
      } catch (err) {
        console.error('Messages load error:', err);
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn, getToken]);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (convId) => {
    navigate(`/messages/${convId}`);
  };

  const handleCompose = () => {
    alert('Compose new message — coming soon');
  };

  // Never render either bottom nav until role is known — prevents the
  // office-user-sees-provider-nav leak after cross-tab navigation.
  if (roleLoading || !role) {
    return <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto' }} />;
  }

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: '100vh',
        maxWidth: 480,
        margin: '0 auto',
        boxShadow: '0 0 40px rgba(0,0,0,0.06)',
        fontFamily: "'DM Sans', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 110,
      }}
    >
      <TopBar role={role === 'OFFICE' ? 'office' : 'provider'} />
      {/* TOP BAR */}
      <div
        style={{
          background: COLORS.card,
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${COLORS.borderSoft}`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: COLORS.text,
              letterSpacing: '-0.4px',
            }}
          >
            Messages
          </div>
          <button
            onClick={handleCompose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: COLORS.bg,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="Compose new message"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.text}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 15, height: 15 }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* Search box */}
        <div
          style={{
            background: COLORS.bg,
            border: `1px solid ${COLORS.borderSoft}`,
            borderRadius: 100,
            padding: '11px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.textLight}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 14, height: 14, flexShrink: 0 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages"
            style={{
              flex: 1,
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: 13,
              color: COLORS.text,
              fontFamily: 'inherit',
              fontWeight: 500,
            }}
          />
        </div>
      </div>

      {/* CONVERSATION LIST */}
      <div
        style={{
          flex: 1,
          background: COLORS.card,
          overflowY: 'auto',
        }}
      >
        {loading ? (
          <SkeletonList />
        ) : filteredConversations.length === 0 ? (
          <EmptyState searchQuery={searchQuery} role={role} />
        ) : (
          filteredConversations.map((conv, idx) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              gradient={AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]}
              onClick={() => handleConversationClick(conv.id)}
            />
          ))
        )}
      </div>

      {role === 'OFFICE' ? <BottomNav /> : <ProviderBottomNav />}
    </div>
  );
}

// ============================================================
// CONVERSATION ROW
// ============================================================
function ConversationRow({ conv, gradient, onClick }) {
  const isUnread = conv.unread > 0;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '14px 16px',
        borderBottom: `1px solid ${COLORS.borderSoft}`,
        background: isUnread ? COLORS.greenTint : COLORS.card,
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!isUnread) e.currentTarget.style.background = COLORS.bg;
      }}
      onMouseLeave={(e) => {
        if (!isUnread) e.currentTarget.style.background = COLORS.card;
      }}
    >
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {conv.avatarUrl ? (
          <img
            src={conv.avatarUrl}
            alt={conv.name}
            style={{ width: 48, height: 48, borderRadius: 15, objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 15,
              background: gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {conv.initials}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingRight: isUnread ? 32 : 0 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            marginBottom: 3,
          }}
        >
          <div
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 14,
              color: COLORS.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {conv.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: COLORS.textLight,
              flexShrink: 0,
              fontWeight: 500,
            }}
          >
            {conv.time}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: isUnread ? COLORS.text : COLORS.textMid,
            fontWeight: isUnread ? 700 : 400,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.4,
          }}
        >
          {conv.lastMsg}
        </div>
      </div>

      {/* Unread badge */}
      {isUnread && (
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(50%)',
            background: COLORS.green,
            color: 'white',
            fontSize: 10,
            fontWeight: 800,
            fontFamily: "'Outfit', sans-serif",
            padding: '3px 7px',
            borderRadius: 100,
            minWidth: 18,
            textAlign: 'center',
          }}
        >
          {conv.unread}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SKELETON LOADER
// ============================================================
function SkeletonList() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            padding: '14px 16px',
            borderBottom: `1px solid ${COLORS.borderSoft}`,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 15,
              background: '#ececec',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                width: '50%',
                height: 12,
                background: '#ececec',
                borderRadius: 6,
                marginBottom: 8,
              }}
            />
            <div
              style={{
                width: '85%',
                height: 10,
                background: '#f3f3f3',
                borderRadius: 6,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ searchQuery, role }) {
  const officeBlurb = 'When providers reach out, your conversations will appear here.';
  const providerBlurb = 'When offices reach out to you, your conversations will appear here.';
  const blurb = role === 'OFFICE' ? officeBlurb : providerBlurb;

  return (
    <div
      style={{
        padding: '60px 32px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: COLORS.greenTint,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.green}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: 26, height: 26 }}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 800,
          fontSize: 16,
          color: COLORS.text,
          marginBottom: 6,
        }}
      >
        {searchQuery ? 'No matches found' : 'No messages yet'}
      </div>
      <div
        style={{
          fontSize: 13,
          color: COLORS.textLight,
          lineHeight: 1.5,
        }}
      >
        {searchQuery ? 'Try a different search term' : blurb}
      </div>
    </div>
  );
}
