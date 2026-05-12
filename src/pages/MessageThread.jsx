import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import BottomNav from '../components/BottomNav';
import ProviderBottomNav from '../components/ProviderBottomNav';
import TopBar from '../components/TopBar';
import useUserRole from '../hooks/useUserRole';

// ============================================================
// KAZI MESSAGE THREAD — Unified (office + provider)
// Real API. Route: /messages/:conversationId
// conversationId encoded as `${officeId}-${providerId}`
// ============================================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const COLORS = {
  green: '#1a7f5e',
  greenDark: '#15604a',
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
};

// ============================================================
// HELPERS
// ============================================================
function formatDateSeparator(date) {
  const d = new Date(date);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (isToday) return `Today ${time}`;
  if (isYesterday) return `Yesterday ${time}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + time;
}

function shouldShowSeparator(current, previous) {
  if (!previous) return true;
  const gap = new Date(current.createdAt) - new Date(previous.createdAt);
  return gap > 60 * 60 * 1000;
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
export default function MessageThread() {
  const navigate = useNavigate();
  const location = useLocation();
  const { conversationId } = useParams();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { isSignedIn } = useUser();
  const previewMock = location.state?.mock || null;

  // Parse conversationId on first hyphen
  const dashIdx = (conversationId || '').indexOf('-');
  const officeId = dashIdx >= 0 ? conversationId.substring(0, dashIdx) : '';
  const providerId = dashIdx >= 0 ? conversationId.substring(dashIdx + 1) : '';

  const { role: ctxRole, isLoading: roleLoading } = useUserRole();
  const role = ctxRole === 'office' ? 'OFFICE' : ctxRole === 'provider' ? 'PROVIDER' : null;
  const [messages, setMessages] = useState([]);
  const [otherParty, setOtherParty] = useState(null); // { name, avatarUrl, subtitle }
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Detect role + load thread + other party + mark read
  useEffect(() => {
    if (previewMock) {
      setOtherParty({
        name: previewMock.name || 'Provider',
        avatarUrl: previewMock.avatarUrl || null,
        subtitle: previewMock.role || 'Dental Professional',
      });
      setMessages([]);
      setLoading(false);
      return;
    }
    if (!authLoaded || !isSignedIn) return;
    if (roleLoading || !role) return;
    if (!officeId || !providerId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };
        const detectedRole = role;

        // Fetch messages
        const msgRes = await fetch(
          `${API_URL}/api/messages/${officeId}/${providerId}`,
          { headers }
        );
        if (msgRes.ok) {
          const msgs = await msgRes.json();
          if (!cancelled) setMessages(msgs);
        }

        // Fetch other party info
        try {
          if (detectedRole === 'OFFICE') {
            // We're an office, the other party is the provider
            const r = await fetch(`${API_URL}/api/providers/${providerId}`, { headers });
            if (r.ok) {
              const p = await r.json();
              const first = p?.user?.firstName || '';
              const last = p?.user?.lastName || '';
              const isDentist = (p?.role || '').toLowerCase().includes('dentist');
              const namePrefix = isDentist ? 'Dr. ' : '';
              const name = `${namePrefix}${first} ${last}`.trim() || 'Provider';
              if (!cancelled) {
                setOtherParty({
                  name,
                  avatarUrl: p?.user?.avatarUrl || null,
                  subtitle: p?.role || '',
                });
              }
            }
          } else if (detectedRole === 'PROVIDER') {
            // We're a provider, the other party is the office
            const r = await fetch(`${API_URL}/api/offices/${officeId}`, { headers });
            if (r.ok) {
              const o = await r.json();
              if (!cancelled) {
                setOtherParty({
                  name: o?.name || 'Office',
                  avatarUrl: o?.user?.avatarUrl || null,
                  subtitle: [o?.city, o?.state].filter(Boolean).join(', '),
                });
              }
            }
          }
        } catch (e) {
          console.error('Other party fetch error:', e);
        }

        // Mark thread as read
        try {
          await fetch(
            `${API_URL}/api/messages/read-all/${officeId}/${providerId}`,
            { method: 'PATCH', headers }
          );
        } catch (e) {
          console.error('Mark read error:', e);
        }

        if (!cancelled) setLoading(false);
      } catch (err) {
        console.error('Thread load error:', err);
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn, getToken, officeId, providerId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    const optimisticId = `tmp-${Date.now()}`;
    const optimistic = {
      id: optimisticId,
      officeId,
      providerId,
      fromRole: role,
      body: text,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputText('');

    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ officeId, providerId, body: text }),
      });
      if (!res.ok) throw new Error('Send failed');
      const created = await res.json();
      // Replace optimistic with real
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticId ? { ...created } : m))
      );
    } catch (err) {
      console.error('Send error:', err);
      alert('Could not send message. Please try again.');
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => navigate('/messages');

  const handleViewProfile = () => {
    if (role === 'OFFICE') {
      navigate(`/professionals/${providerId}`);
    } else {
      navigate(`/office/${officeId}`);
    }
  };

  const handleSecondaryAction = () => {
    if (role === 'OFFICE') {
      alert('Booking flow coming soon');
    } else {
      navigate(`/find-shifts?office=${officeId}`);
    }
  };

  const otherName = otherParty?.name || (loading ? '' : 'Conversation');
  const otherAvatar = otherParty?.avatarUrl || null;
  const otherInitials = getInitials(otherName);
  const otherSubtitle = otherParty?.subtitle || '';

  // Never render either bottom nav until role is known (unless we're in
  // the preview-mock path, where the office context is implied).
  if (!previewMock && (roleLoading || !role)) {
    return <div style={{ background: COLORS.bg, minHeight: '100vh', maxWidth: 480, margin: '0 auto' }} />;
  }

  const effectiveRole = previewMock ? 'OFFICE' : role;

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
        minHeight: '100vh',
      }}
    >
      <TopBar role={effectiveRole === 'OFFICE' ? 'office' : 'provider'} />
      {/* TOP BAR */}
      <div
        style={{
          background: COLORS.card,
          padding: '14px 14px 12px',
          borderBottom: `1px solid ${COLORS.borderSoft}`,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Back */}
          <button
            onClick={handleBack}
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
              flexShrink: 0,
            }}
            aria-label="Back"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.text}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: 16, height: 16 }}
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Avatar */}
          {otherAvatar ? (
            <img
              src={otherAvatar}
              alt={otherName}
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {otherInitials}
            </div>
          )}

          {/* Name + subtitle */}
          <div
            style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
            onClick={handleViewProfile}
          >
            <div
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                color: COLORS.text,
                lineHeight: 1.15,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {otherName || ' '}
            </div>
            {otherSubtitle && (
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.textLight,
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {otherSubtitle}
              </div>
            )}
          </div>

          {/* Secondary action button */}
          <button
            onClick={handleSecondaryAction}
            style={{
              background: COLORS.green,
              color: 'white',
              border: 'none',
              borderRadius: 100,
              padding: '9px 14px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            {effectiveRole === 'OFFICE' ? 'Book again' : 'See shifts'}
          </button>
        </div>
      </div>

      {/* MESSAGES BODY */}
      <div
        style={{
          flex: 1,
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          overflowY: 'auto',
          background: COLORS.bg,
        }}
      >
        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: COLORS.textLight,
              fontSize: 13,
            }}
          >
            Loading messages…
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 0',
              color: COLORS.textLight,
              fontSize: 13,
            }}
          >
            No messages yet. Say hello!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const showSeparator = shouldShowSeparator(msg, prevMsg);
            const isMine = msg.fromRole === role;
            return (
              <div key={msg.id} style={{ display: 'contents' }}>
                {showSeparator && (
                  <div
                    style={{
                      alignSelf: 'center',
                      fontSize: 11,
                      color: COLORS.textLight,
                      fontWeight: 600,
                      margin: '12px 0 6px',
                    }}
                  >
                    {formatDateSeparator(msg.createdAt)}
                  </div>
                )}
                <Bubble msg={msg} isMine={isMine} />
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT BAR */}
      <div
        style={{
          background: COLORS.card,
          padding: '12px 14px 12px',
          borderTop: `1px solid ${COLORS.borderSoft}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
          marginBottom: 76,
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message…"
          style={{
            flex: 1,
            background: COLORS.bg,
            border: `1px solid ${COLORS.borderSoft}`,
            borderRadius: 100,
            padding: '11px 16px',
            fontSize: 13,
            color: COLORS.text,
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!inputText.trim() || sending}
          style={{
            width: 38,
            height: 38,
            background: inputText.trim() ? COLORS.green : COLORS.border,
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'default',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
          aria-label="Send message"
        >
          <svg
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 14, height: 14 }}
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {effectiveRole === 'OFFICE' ? <BottomNav /> : <ProviderBottomNav />}
    </div>
  );
}

// ============================================================
// BUBBLE
// ============================================================
function Bubble({ msg, isMine }) {
  return (
    <div
      style={{
        maxWidth: '78%',
        padding: '10px 14px',
        borderRadius: 18,
        fontSize: 14,
        lineHeight: 1.45,
        background: isMine ? COLORS.green : COLORS.card,
        color: isMine ? 'white' : COLORS.text,
        border: isMine ? 'none' : `1px solid ${COLORS.borderSoft}`,
        alignSelf: isMine ? 'flex-end' : 'flex-start',
        borderBottomLeftRadius: isMine ? 18 : 5,
        borderBottomRightRadius: isMine ? 5 : 18,
        wordBreak: 'break-word',
      }}
    >
      {msg.body}
    </div>
  );
}
