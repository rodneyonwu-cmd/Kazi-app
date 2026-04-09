import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BackToDashboard from '../components/BackToDashboard';
import BottomNav from '../components/BottomNav';

// ============================================================
// KAZI MESSAGE THREAD — Standard bubbles, iMessage style
// Drop into src/pages/MessageThread.jsx
// Route: /messages/:conversationId
// ============================================================

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
// MOCK DATA — replace with backend fetch
// ============================================================
const MOCK_CONVERSATION = {
  id: 'conv-1',
  pro: {
    id: 'sarah',
    name: 'Sarah K.',
    initials: 'SK',
    avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
    role: 'Dental Hygienist',
    credential: 'RDH',
    avatarGradient: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
  },
  messages: [
    {
      id: 'm1',
      text: 'Hey Sarah, are you available Friday 8a–5p?',
      sentByMe: true,
      timestamp: new Date(Date.now() - 86400000 - 3600000).toISOString(), // yesterday 3:42pm
    },
    {
      id: 'm2',
      text: "Hi! Yes, I'm available. What type of practice?",
      sentByMe: false,
      timestamp: new Date(Date.now() - 86400000 - 3500000).toISOString(),
    },
    {
      id: 'm3',
      text: 'General practice in Missouri City. Dentrix.',
      sentByMe: true,
      timestamp: new Date(Date.now() - 86400000 - 3400000).toISOString(),
    },
    {
      id: 'm4',
      text: "Sounds great. I've worked with Dentrix for 6 years.",
      sentByMe: false,
      timestamp: new Date(Date.now() - 86400000 - 3300000).toISOString(),
    },
    {
      id: 'm5',
      text: 'Just confirming — Friday, 8a–5p in Missouri City?',
      sentByMe: false,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // today 9:15am
    },
    {
      id: 'm6',
      text: 'Yes, confirmed. Address is 8027 Highway 6.',
      sentByMe: true,
      timestamp: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: 'm7',
      text: 'Got it. What time do you need me?',
      sentByMe: false,
      timestamp: new Date(Date.now() - 3400000).toISOString(),
    },
  ],
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
  const gap = new Date(current.timestamp) - new Date(previous.timestamp);
  // Show separator if more than 1 hour between messages
  return gap > 60 * 60 * 1000;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function MessageThread() {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(MOCK_CONVERSATION);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // TODO: Replace mock data with real backend fetch
  // useEffect(() => {
  //   fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}`)
  //     .then(res => res.json())
  //     .then(data => setConversation(data));
  // }, [conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleSend = () => {
    if (!inputText.trim() && attachments.length === 0) return;

    const newMessage = {
      id: `m-${Date.now()}`,
      text: inputText.trim(),
      sentByMe: true,
      timestamp: new Date().toISOString(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    setConversation({
      ...conversation,
      messages: [...conversation.messages, newMessage],
    });
    setInputText('');
    setAttachments([]);

    // TODO: POST to backend
    // fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}/messages`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text: newMessage.text, attachments: newMessage.attachments }),
    // });
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map((file) => ({
      id: `att-${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      file, // keep reference for actual upload
    }));
    setAttachments([...attachments, ...newAttachments]);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBookPro = () => {
    // TODO: open the booking modal / sheet for this pro
    // Could reuse the BookingSheet component from FindProfessionals
    console.log('Book this pro:', conversation.pro.id);
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
        height: '100vh',
      }}
    >
      {/* ============================================================
          TOP BAR
          ============================================================ */}
      <div
        style={{
          background: COLORS.card,
          padding: '12px 14px 12px',
          borderBottom: `1px solid ${COLORS.borderSoft}`,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <BackToDashboard />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {conversation.pro.avatarUrl ? (
          <img
            src={conversation.pro.avatarUrl}
            alt={conversation.pro.name}
            style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: conversation.pro.avatarGradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 13, flexShrink: 0,
            }}
          >
            {conversation.pro.initials}
          </div>
        )}

        <div
          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={() => navigate(`/professionals/${conversation.pro.id}`)}
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
            {conversation.pro.name}
          </div>
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
            {conversation.pro.role} · {conversation.pro.credential}
          </div>
        </div>

        <button
          onClick={handleBookPro}
          style={{
            background: COLORS.green,
            color: 'white',
            border: 'none',
            borderRadius: 100,
            padding: '9px 15px',
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 12, height: 12 }}
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Book
        </button>
        </div>
      </div>

      {/* ============================================================
          MESSAGES BODY
          ============================================================ */}
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
        {conversation.messages.map((msg, idx) => {
          const prevMsg = conversation.messages[idx - 1];
          const showSeparator = shouldShowSeparator(msg, prevMsg);
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
                  {formatDateSeparator(msg.timestamp)}
                </div>
              )}
              <Bubble msg={msg} />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ============================================================
          ATTACHMENT PREVIEW BAR (shown only when attachments exist)
          ============================================================ */}
      {attachments.length > 0 && (
        <div
          style={{
            background: COLORS.card,
            padding: '10px 14px',
            borderTop: `1px solid ${COLORS.borderSoft}`,
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            flexShrink: 0,
          }}
        >
          {attachments.map((att) => (
            <div
              key={att.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: COLORS.bg,
                border: `1px solid ${COLORS.borderSoft}`,
                borderRadius: 12,
                padding: '8px 10px 8px 12px',
                flexShrink: 0,
                maxWidth: 200,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.green}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 14, height: 14, flexShrink: 0 }}
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  flex: 1,
                }}
              >
                {att.name}
              </span>
              <button
                onClick={() => removeAttachment(att.id)}
                style={{
                  width: 18,
                  height: 18,
                  background: COLORS.textLight,
                  border: 'none',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  padding: 0,
                }}
                aria-label="Remove attachment"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: 9, height: 9 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          INPUT BAR
          ============================================================ */}
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
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept="image/*,application/pdf,.doc,.docx"
        />

        {/* Attach button */}
        <button
          onClick={handleAttachClick}
          style={{
            width: 38,
            height: 38,
            background: COLORS.bg,
            border: `1px solid ${COLORS.borderSoft}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          aria-label="Attach file"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={COLORS.textMid}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 17, height: 17 }}
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        {/* Text input */}
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

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!inputText.trim() && attachments.length === 0}
          style={{
            width: 38,
            height: 38,
            background:
              inputText.trim() || attachments.length > 0
                ? COLORS.green
                : COLORS.border,
            border: 'none',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor:
              inputText.trim() || attachments.length > 0 ? 'pointer' : 'default',
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
      <BottomNav />
    </div>
  );
}

// ============================================================
// BUBBLE SUB-COMPONENT
// ============================================================
function Bubble({ msg }) {
  const isMine = msg.sentByMe;
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
      }}
    >
      {msg.text && <div>{msg.text}</div>}
      {msg.attachments && msg.attachments.length > 0 && (
        <div style={{ marginTop: msg.text ? 8 : 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {msg.attachments.map((att) => (
            <div
              key={att.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: isMine ? 'rgba(255,255,255,0.15)' : COLORS.bg,
                borderRadius: 10,
                padding: '8px 10px',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={isMine ? 'white' : COLORS.green}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 14, height: 14, flexShrink: 0 }}
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isMine ? 'white' : COLORS.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {att.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
