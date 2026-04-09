import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ============================================================
// KAZI MESSAGES — Inbox list (iMessage-style)
// Drop into src/pages/Messages.jsx or src/components/Messages.jsx
// ============================================================

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

// Avatar gradients — cycled by index for variety
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
  'linear-gradient(135deg, #c8a8d4 0%, #e8a87c 100%)',
  'linear-gradient(135deg, #88c9a1 0%, #c8d4a8 100%)',
  'linear-gradient(135deg, #e8a87c 0%, #7ab8d4 100%)',
  'linear-gradient(135deg, #d4a88f 0%, #7a9bd4 100%)',
];

// ============================================================
// MOCK DATA — replace with backend fetch
// ============================================================
const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    name: 'Sarah K.',
    initials: 'SK',
    preview: "Yes, I'm available Friday! What time do you need me?",
    time: '2m',
    unreadCount: 2,
    isOnline: true,
    sentByMe: false,
  },
  {
    id: 'conv-2',
    name: 'Maria G.',
    initials: 'MG',
    preview: 'Thanks for considering me. Happy to chat more about the role.',
    time: '1h',
    unreadCount: 1,
    isOnline: false,
    sentByMe: false,
  },
  {
    id: 'conv-3',
    name: 'Rachel M.',
    initials: 'RM',
    preview: 'See you tomorrow at 8am — thanks!',
    time: '3h',
    unreadCount: 0,
    isOnline: false,
    sentByMe: false,
  },
  {
    id: 'conv-4',
    name: 'Anthony B.',
    initials: 'AB',
    preview: "Sounds good, I'll bring my EFDA license",
    time: 'Yest',
    unreadCount: 0,
    isOnline: false,
    sentByMe: false,
  },
  {
    id: 'conv-5',
    name: 'David L.',
    initials: 'DL',
    preview: 'Let me check the schedule and get back to you',
    time: '2d',
    unreadCount: 0,
    isOnline: false,
    sentByMe: true,
  },
  {
    id: 'conv-6',
    name: 'Marcus T.',
    initials: 'MT',
    preview: 'Thanks, looking forward to it',
    time: '3d',
    unreadCount: 0,
    isOnline: false,
    sentByMe: false,
  },
  {
    id: 'conv-7',
    name: 'Jasmine P.',
    initials: 'JP',
    preview: 'I can do Tuesday or Wednesday next week',
    time: '4d',
    unreadCount: 0,
    isOnline: false,
    sentByMe: false,
  },
  {
    id: 'conv-8',
    name: 'Chloe N.',
    initials: 'CN',
    preview: 'You: Perfect, see you then!',
    time: '1w',
    unreadCount: 0,
    isOnline: false,
    sentByMe: true,
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace mock data with real backend fetch
  // useEffect(() => {
  //   fetch(`${import.meta.env.VITE_API_URL}/api/conversations`)
  //     .then(res => res.json())
  //     .then(data => setConversations(data));
  // }, []);

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (convId) => {
    navigate(`/messages/${convId}`);
  };

  const handleCompose = () => {
    // TODO: open compose new message flow
    console.log('Compose new message');
  };

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
        paddingBottom: 80, // leave room for the existing bottom nav
      }}
    >
      {/* ============================================================
          TOP BAR
          ============================================================ */}
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

      {/* ============================================================
          CONVERSATION LIST
          ============================================================ */}
      <div
        style={{
          flex: 1,
          background: COLORS.card,
          overflowY: 'auto',
        }}
      >
        {filteredConversations.length === 0 ? (
          <EmptyState searchQuery={searchQuery} />
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
    </div>
  );
}

// ============================================================
// CONVERSATION ROW
// ============================================================
function ConversationRow({ conv, gradient, onClick }) {
  const isUnread = conv.unreadCount > 0;
  const previewText = conv.sentByMe ? `You: ${conv.preview}` : conv.preview;

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
      {/* Avatar with optional online dot */}
      <div
        style={{
          position: 'relative',
          flexShrink: 0,
        }}
      >
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
        {conv.isOnline && (
          <div
            style={{
              position: 'absolute',
              bottom: -1,
              right: -1,
              width: 12,
              height: 12,
              background: COLORS.green,
              border: `2px solid ${isUnread ? COLORS.greenTint : COLORS.card}`,
              borderRadius: '50%',
            }}
          />
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
          {previewText}
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
          {conv.unreadCount}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EMPTY STATE
// ============================================================
function EmptyState({ searchQuery }) {
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
        {searchQuery
          ? 'Try a different search term'
          : 'When you message a professional, your conversations will appear here.'}
      </div>
    </div>
  );
}
