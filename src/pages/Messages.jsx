import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import Nav from '../components/Nav';

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

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yest';
  if (diffDay < 7) return `${diffDay}d`;
  const diffWk = Math.floor(diffDay / 7);
  return `${diffWk}w`;
}

function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || '') + (parts[1]?.[0] || '').toUpperCase();
}

export default function Messages() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        const convos = data.map(msg => {
          const otherUser = msg.provider?.user;
          const firstName = otherUser?.firstName || '';
          const lastName = otherUser?.lastName || '';
          const displayName = lastName
            ? `${firstName} ${lastName.charAt(0)}.`
            : firstName || 'Unknown';

          return {
            id: `${msg.officeId}-${msg.providerId}`,
            name: displayName,
            initials: getInitials(`${firstName} ${lastName}`),
            preview: msg.body || '',
            time: relativeTime(msg.createdAt),
            unreadCount: msg.unreadCount || 0,
            isOnline: false,
            sentByMe: msg.fromRole === 'OFFICE',
          };
        });
        setConversations(convos);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [getToken]);

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (convId) => {
    navigate(`/messages/${convId}`);
  };

  const handleCompose = () => {
    console.log('Compose new message');
  };

  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: '100vh',
        fontFamily: "'DM Sans', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Nav />

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.text, letterSpacing: '-0.4px' }}>
            Messages
          </div>
          <button
            onClick={handleCompose}
            style={{ width: 36, height: 36, borderRadius: '50%', background: COLORS.bg, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Compose new message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* Search box */}
        <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.borderSoft}`, borderRadius: 100, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.textLight} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages"
            style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 13, color: COLORS.text, fontFamily: 'inherit', fontWeight: 500 }}
          />
        </div>
      </div>

      {/* CONVERSATION LIST */}
      <div style={{ flex: 1, background: COLORS.card, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '60px 32px', textAlign: 'center' }}>
            <div style={{ width: 32, height: 32, border: `2px solid ${COLORS.green}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13, color: COLORS.textLight }}>Loading messages...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : filteredConversations.length === 0 ? (
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

function ConversationRow({ conv, gradient, onClick }) {
  const isUnread = conv.unreadCount > 0;
  const previewText = conv.sentByMe ? `You: ${conv.preview}` : conv.preview;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px',
        borderBottom: `1px solid ${COLORS.borderSoft}`,
        background: isUnread ? COLORS.greenTint : COLORS.card,
        position: 'relative', cursor: 'pointer', transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!isUnread) e.currentTarget.style.background = COLORS.bg; }}
      onMouseLeave={(e) => { if (!isUnread) e.currentTarget.style.background = COLORS.card; }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 48, height: 48, borderRadius: 15, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14 }}>
          {conv.initials}
        </div>
        {conv.isOnline && (
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, background: COLORS.green, border: `2px solid ${isUnread ? COLORS.greenTint : COLORS.card}`, borderRadius: '50%' }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: isUnread ? 32 : 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, color: COLORS.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {conv.name}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textLight, flexShrink: 0, fontWeight: 500 }}>
            {conv.time}
          </div>
        </div>
        <div style={{ fontSize: 12, color: isUnread ? COLORS.text : COLORS.textMid, fontWeight: isUnread ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.4 }}>
          {previewText}
        </div>
      </div>

      {isUnread && (
        <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(50%)', background: COLORS.green, color: 'white', fontSize: 10, fontWeight: 800, fontFamily: "'Outfit', sans-serif", padding: '3px 7px', borderRadius: 100, minWidth: 18, textAlign: 'center' }}>
          {conv.unreadCount}
        </div>
      )}
    </div>
  );
}

function EmptyState({ searchQuery }) {
  return (
    <div style={{ padding: '60px 32px', textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, background: COLORS.greenTint, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 16, color: COLORS.text, marginBottom: 6 }}>
        {searchQuery ? 'No matches found' : 'No messages yet'}
      </div>
      <div style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.5 }}>
        {searchQuery ? 'Try a different search term' : 'When you message a professional, your conversations will appear here.'}
      </div>
    </div>
  );
}
