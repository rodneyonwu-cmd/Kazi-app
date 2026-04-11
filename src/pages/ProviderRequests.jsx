import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ProviderBottomNav from '../components/ProviderBottomNav';
import TopBar from '../components/TopBar';

const DEFAULT_USER_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';

// ============================================================
// KAZI PROVIDER REQUESTS — Inbox of incoming invitations
// Tabs: Incoming / Accepted / Declined / Expired
// Route: /requests
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  gold: '#f4b740',
};

const INCOMING_REQUESTS = [
  {
    id: 'req-1',
    initials: 'MC',
    name: 'Missouri City Dental',
    rating: '4.9',
    distance: '4.2 mi',
    expires: '45m',
    date: 'Today',
    hours: '9am – 5pm',
    rate: '$55/hr',
    earnings: 440,
    note: null,
  },
  {
    id: 'req-2',
    initials: 'SP',
    name: 'Sugarland Premier Dental',
    rating: '4.7',
    distance: '7.8 mi',
    expires: '6h 22m',
    date: 'Mon, Apr 14',
    hours: '8am – 4pm',
    rate: '$50/hr',
    earnings: 400,
    note: 'Looking for an experienced RDH comfortable with Eaglesoft. Friendly team, scrubs provided.',
  },
  {
    id: 'req-3',
    initials: 'ED',
    name: 'Evolve Dentistry',
    rating: '5.0',
    distance: '2.1 mi',
    expires: '23h 10m',
    date: 'Wed, Apr 16',
    hours: '8am – 5pm',
    rate: '$52/hr',
    earnings: 468,
    note: null,
  },
];

const RECENT = [
  { id: 'past-1', initials: 'HF', name: 'Houston Family Dental', meta: 'Apr 5 · 8am – 4pm · $50/hr', status: 'Accepted' },
  { id: 'past-2', initials: 'KD', name: 'Katy Dental Associates', meta: 'Apr 3 · 9am – 5pm · $45/hr', status: 'Declined' },
  { id: 'past-3', initials: 'RD', name: 'Richmond Dental Care', meta: 'Apr 1 · 8am – 3pm · $52/hr', status: 'Expired' },
];

const TABS = [
  { id: 'incoming', label: 'Incoming', count: 3 },
  { id: 'accepted', label: 'Accepted', count: 2 },
  { id: 'declined', label: 'Declined', count: null },
  { id: 'expired', label: 'Expired', count: null },
];

export default function ProviderRequests() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('incoming');

  const initials = (user?.firstName?.[0] || 'S') + (user?.lastName?.[0] || 'K');

  return (
    <>
      <style>{`
        .kazi-pro-req * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .kazi-pro-req button { font-family: inherit; cursor: pointer; }
        .kazi-pro-req .scroll-x { scrollbar-width: none; }
        .kazi-pro-req .scroll-x::-webkit-scrollbar { display: none; }
      `}</style>
      <div
        className="kazi-pro-req"
        style={{
          background: COLORS.bg,
          color: COLORS.text,
          fontFamily: "'DM Sans', sans-serif",
          WebkitFontSmoothing: 'antialiased',
          paddingBottom: 100,
          maxWidth: 480,
          margin: '0 auto',
          minHeight: '100vh',
          boxShadow: '0 0 40px rgba(0,0,0,0.06)',
          position: 'relative',
        }}
      >
        <TopBar role="provider" />
        {/* Top bar */}
        <div
          style={{
            background: COLORS.card,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${COLORS.borderSoft}`,
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: COLORS.text, flex: 1 }}>Requests</div>
          <img
            src={DEFAULT_USER_PHOTO}
            alt="me"
            style={{ width: 36, height: 36, borderRadius: 12, objectFit: 'cover' }}
          />
        </div>

        {/* Tabs */}
        <div className="scroll-x" style={{ display: 'flex', gap: 6, padding: '14px 16px 12px', overflowX: 'auto' }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flexShrink: 0,
                  padding: '8px 16px',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 700,
                  color: active ? 'white' : COLORS.textLight,
                  background: active ? COLORS.text : COLORS.card,
                  border: `1px solid ${active ? COLORS.text : COLORS.borderSoft}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {tab.label}
                {tab.count != null && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      minWidth: 18,
                      height: 18,
                      borderRadius: 100,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 5px',
                      background: active ? 'rgba(255,255,255,0.2)' : COLORS.border,
                      color: active ? 'white' : COLORS.textMid,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {activeTab === 'incoming' && (
          <div style={{ padding: '0 16px' }}>
            {INCOMING_REQUESTS.map((req) => (
              <RequestCard key={req.id} req={req} onOpen={() => navigate(`/requests/${req.id}`)} />
            ))}
          </div>
        )}
        {activeTab !== 'incoming' && (
          <div style={{ padding: '40px 32px', textAlign: 'center', color: COLORS.textLight, fontSize: 13 }}>No {activeTab} requests yet.</div>
        )}

        {/* Recently resolved */}
        {activeTab === 'incoming' && (
          <>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: COLORS.textLight, padding: '6px 20px 12px' }}>
              Recently resolved
            </div>
            {RECENT.map((p) => (
              <PastCard key={p.id} past={p} />
            ))}
          </>
        )}

        <ProviderBottomNav />
      </div>
    </>
  );
}

function RequestCard({ req, onOpen }) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: COLORS.card,
        borderRadius: 20,
        border: `1px solid ${COLORS.borderSoft}`,
        padding: 18,
        marginBottom: 12,
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: 'white',
          }}
        >
          {req.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text, lineHeight: 1.2 }}>{req.name}</div>
          <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: COLORS.gold, stroke: COLORS.gold, strokeWidth: 1, flexShrink: 0 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text }}>{req.rating}</span>
            <span>· {req.distance}</span>
          </div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textLight, flexShrink: 0, textAlign: 'right', lineHeight: 1.4 }}>
          Expires
          <br />
          <strong style={{ color: COLORS.text, fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>{req.expires}</strong>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 0',
          borderTop: `1px solid ${COLORS.borderSoft}`,
          borderBottom: `1px solid ${COLORS.borderSoft}`,
          marginBottom: 16,
        }}
      >
        <Detail label="Date" value={req.date} />
        <Divider />
        <Detail label="Hours" value={req.hours} />
        <Divider />
        <Detail label="Your rate" value={req.rate} green />
      </div>

      <div
        style={{
          background: COLORS.greenTint,
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: req.note ? 16 : 16,
          fontSize: 13,
          color: COLORS.textMid,
        }}
      >
        You'll earn <strong style={{ color: COLORS.green, fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>${req.earnings}</strong> for this shift
      </div>

      {req.note && (
        <div style={{ background: COLORS.bg, borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: COLORS.textMid, lineHeight: 1.5 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.textLight, marginBottom: 4 }}>
            Note from office
          </div>
          {req.note}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert(`Accepted: ${req.name}`);
          }}
          style={{
            flex: 1,
            padding: 13,
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 700,
            background: COLORS.green,
            color: 'white',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Accept
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Decline ${req.name}?`)) alert('Declined');
          }}
          style={{
            padding: '13px 20px',
            borderRadius: 100,
            fontSize: 14,
            fontWeight: 700,
            background: COLORS.bg,
            color: COLORS.textMid,
            border: `1px solid ${COLORS.border}`,
          }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}

function Detail({ label, value, green }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.textLight, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          color: green ? COLORS.green : COLORS.text,
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 32, background: COLORS.borderSoft, flexShrink: 0 }} />;
}

function PastCard({ past }) {
  const isAccepted = past.status === 'Accepted';
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 16,
        border: `1px solid ${COLORS.borderSoft}`,
        padding: '14px 16px',
        margin: '0 16px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #7ab8d4 0%, #88c9a1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          color: 'white',
        }}
      >
        {past.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.text }}>{past.name}</div>
        <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>{past.meta}</div>
      </div>
      <div
        style={{
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 700,
          padding: '5px 10px',
          borderRadius: 100,
          background: isAccepted ? COLORS.greenTint : COLORS.bg,
          color: isAccepted ? COLORS.green : COLORS.textLight,
          border: `1px solid ${isAccepted ? COLORS.greenSoft : COLORS.borderSoft}`,
        }}
      >
        {past.status}
      </div>
    </div>
  );
}
