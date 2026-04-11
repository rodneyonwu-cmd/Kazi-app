import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ProviderBottomNav from '../components/ProviderBottomNav';
import BookedShiftModal from './BookedShiftModal';
import TopBar from '../components/TopBar';

// Default profile photo for the current user (Rodney) when Clerk has no imageUrl
const DEFAULT_USER_PHOTO = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces';

// ============================================================
// KAZI PROVIDER DASHBOARD — Pro home (route: /provider)
// Locked design system: green/black/gray + gold, mobile-first
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  greenSoft: '#e8f3ee',
  greenTint: '#f1f9f5',
  coral: '#e8734a',
  coralSoft: '#fdeee7',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
  gold: '#f4b740',
};

// Mock data
const NEARBY_SHIFTS = [
  {
    id: 'shift-pwd',
    initials: 'PWD',
    name: 'Pearland Wellness Dental',
    distance: '3.1 mi away',
    role: 'Hygienist',
    when: 'Thu, Apr 11 · 8a–5p · RDH',
    pay: 62,
    urgent: true,
  },
  {
    id: 'shift-hdc',
    initials: 'HDC',
    name: 'Houston Dental Care',
    distance: '5.6 mi away',
    role: 'Hygienist',
    when: 'Sat, Apr 13 · 9a–3p · RDH',
    pay: 60,
  },
  {
    id: 'shift-kfd',
    initials: 'KFD',
    name: 'Katy Family Dental',
    distance: '12.4 mi away',
    role: 'Hygienist',
    when: 'Tue, Apr 16 · 8a–5p · RDH',
    pay: 58,
  },
];

const WEEK_DAYS = [
  { name: 'Tue', num: 9, status: 'today', label: 'Today' },
  { name: 'Wed', num: 10, status: 'booked', label: 'MCD\n8a–5p' },
  { name: 'Thu', num: 11, status: 'open', label: 'Open' },
  { name: 'Fri', num: 12, status: 'off', label: 'Off' },
  { name: 'Sat', num: 13, status: 'open', label: 'Open' },
  { name: 'Sun', num: 14, status: 'off', label: 'Off' },
  { name: 'Mon', num: 15, status: 'booked', label: 'SBD\n9a–4p' },
];

// Mock booked shifts keyed by day-of-month for April 2026
const BOOKED_SHIFTS = {
  10: {
    officeName: 'Missouri City Dental',
    officeInitials: 'MCD',
    officeRating: '4.9',
    officeBookingCount: 12,
    priorBookings: 3,
    dateTime: 'Wednesday, April 10 · 8:00 AM – 5:00 PM',
    duration: '9 hours · 1 hour lunch break',
    role: 'Dental Hygienist (RDH)',
    roleSub: 'General dentistry · Adult prophy + perio',
    payTotal: 464,
    paySub: '$58/hr × 8 paid hours',
    address: '7890 Highway 6, Missouri City, TX',
    distance: '4.2 miles · ~14 min drive',
  },
  14: {
    officeName: 'Sugar Land Bright Dental',
    officeInitials: 'SBD',
    officeRating: '4.6',
    officeBookingCount: 8,
    priorBookings: 1,
    dateTime: 'Monday, April 14 · 9:00 AM – 4:00 PM',
    duration: '7 hours · 30 min lunch break',
    role: 'Dental Hygienist (RDH)',
    roleSub: 'Cosmetic + general · Hygiene focus',
    payTotal: 385,
    paySub: '$55/hr × 7 paid hours',
    address: '4500 Highway 6, Sugar Land, TX',
    distance: '7.8 miles · ~22 min drive',
  },
  15: {
    officeName: 'Sugar Land Bright Dental',
    officeInitials: 'SBD',
    officeRating: '4.6',
    officeBookingCount: 8,
    priorBookings: 1,
    dateTime: 'Tuesday, April 15 · 9:00 AM – 4:00 PM',
    duration: '7 hours · 30 min lunch break',
    role: 'Dental Hygienist (RDH)',
    roleSub: 'Cosmetic + general · Hygiene focus',
    payTotal: 385,
    paySub: '$55/hr × 7 paid hours',
    address: '4500 Highway 6, Sugar Land, TX',
    distance: '7.8 miles · ~22 min drive',
  },
  20: { officeName: 'Pearland Wellness Dental', officeInitials: 'PWD', officeRating: '4.7', officeBookingCount: 6, dateTime: 'Sunday, April 20 · 8:00 AM – 5:00 PM', duration: '9 hours · 1 hour lunch break', role: 'Dental Hygienist (RDH)', payTotal: 558, paySub: '$62/hr × 9 paid hours', address: '4500 Broadway St, Pearland, TX', distance: '3.1 miles · ~11 min drive' },
  23: { officeName: 'Houston Dental Care', officeInitials: 'HDC', officeRating: '4.8', officeBookingCount: 9, dateTime: 'Wednesday, April 23 · 9:00 AM – 3:00 PM', duration: '6 hours · 30 min lunch break', role: 'Dental Hygienist (RDH)', payTotal: 330, paySub: '$60/hr × 5.5 paid hours', address: '1234 Main St, Houston, TX', distance: '5.6 miles · ~18 min drive' },
  28: { officeName: 'Missouri City Dental', officeInitials: 'MCD', officeRating: '4.9', officeBookingCount: 12, priorBookings: 3, dateTime: 'Monday, April 28 · 8:00 AM – 5:00 PM', duration: '9 hours · 1 hour lunch break', role: 'Dental Hygienist (RDH)', payTotal: 464, paySub: '$58/hr × 8 paid hours', address: '7890 Highway 6, Missouri City, TX', distance: '4.2 miles · ~14 min drive' },
};

// April 2026 — starts on Wednesday
const MONTH_CELLS = [
  null, null, null, { d: 1 }, { d: 2 }, { d: 3, s: 'off' }, { d: 4, s: 'off' },
  { d: 5 }, { d: 6 }, { d: 7 }, { d: 8 }, { d: 9, s: 'today' }, { d: 10, s: 'booked' }, { d: 11, s: 'off' },
  { d: 12, s: 'off' }, { d: 13 }, { d: 14, s: 'booked' }, { d: 15, s: 'booked' }, { d: 16 }, { d: 17, s: 'off' }, { d: 18, s: 'off' },
  { d: 19 }, { d: 20, s: 'booked' }, { d: 21 }, { d: 22 }, { d: 23, s: 'booked' }, { d: 24, s: 'off' }, { d: 25, s: 'off' },
  { d: 26 }, { d: 27 }, { d: 28, s: 'booked' }, { d: 29 }, { d: 30 }, null, null,
];

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [scheduleView, setScheduleView] = useState('week');
  const [bookedShift, setBookedShift] = useState(null);

  const firstName = user?.firstName || 'Sarah';
  const initials = (user?.firstName?.[0] || 'S') + (user?.lastName?.[0] || 'K');

  const openBooked = (dayNum) => {
    const data = BOOKED_SHIFTS[dayNum];
    if (data) setBookedShift(data);
  };

  return (
    <>
      <style>{`
        .kazi-pro-dash * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        .kazi-pro-dash button { font-family: inherit; cursor: pointer; }
        .kazi-pro-dash .scroll-x { scrollbar-width: none; -webkit-overflow-scrolling: touch; }
        .kazi-pro-dash .scroll-x::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="kazi-pro-dash"
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

        {/* GREETING */}
        <div style={{ padding: '22px 20px 8px' }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24, color: COLORS.text, lineHeight: 1.15 }}>
            Good morning, {firstName}
          </div>
          <div style={{ fontSize: 13, color: COLORS.textLight, marginTop: 4 }}>Tuesday, April 9 · Houston, TX</div>
        </div>

        {/* HERO CTA */}
        <div
          onClick={() => navigate('/find-shifts')}
          style={{
            margin: '18px 16px 8px',
            borderRadius: 24,
            padding: 22,
            background: '#fdfaf3',
            border: '1.5px solid #f0e9d6',
            color: COLORS.text,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'inline-block',
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 1,
                background: COLORS.green,
                color: 'white',
                padding: '5px 11px',
                borderRadius: 100,
                marginBottom: 14,
              }}
            >
              Quick Find
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, lineHeight: 1.2, marginBottom: 6, color: COLORS.text }}>
              Looking for work?
              <br />
              Find shifts near you.
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMid, marginBottom: 18, maxWidth: 280 }}>
              Browse open shifts from top-rated Houston dental offices.
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate('/find-shifts');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: COLORS.green,
                color: 'white',
                padding: '12px 20px',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
              }}
            >
              Find Shifts
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div style={{ padding: '22px 16px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <QuickTile
              onClick={() => navigate('/find-shifts')}
              tone="green"
              label="Find Shifts"
              icon={
                <>
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </>
              }
            />
            <QuickTile
              onClick={() => navigate('/requests')}
              tone="coral"
              label="Job Requests"
              badge={2}
              icon={
                <>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </>
              }
            />
          </div>
        </div>

        {/* SCHEDULE / AVAILABILITY */}
        <div style={{ padding: '22px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text }}>Availability</div>
            <div
              style={{
                display: 'inline-flex',
                background: COLORS.bg,
                border: `1px solid ${COLORS.borderSoft}`,
                borderRadius: 100,
                padding: 3,
                gap: 2,
              }}
            >
              <ToggleButton active={scheduleView === 'week'} onClick={() => setScheduleView('week')}>Week</ToggleButton>
              <ToggleButton active={scheduleView === 'month'} onClick={() => setScheduleView('month')}>Month</ToggleButton>
            </div>
          </div>

          {scheduleView === 'week' ? (
            <div className="scroll-x" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 4px', margin: '0 -16px' }}>
              {WEEK_DAYS.map((day) => (
                <DayCard key={day.num} day={day} onOpenBooked={() => openBooked(day.num)} />
              ))}
            </div>
          ) : (
            <MonthGrid onOpenBooked={openBooked} />
          )}
        </div>

        {/* SHIFTS NEARBY */}
        <div style={{ padding: '22px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: COLORS.text }}>Shifts in your area</div>
            <button
              onClick={() => navigate('/find-shifts')}
              style={{ fontSize: 12, fontWeight: 700, color: COLORS.green, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 3 }}
            >
              See all
              <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className="scroll-x" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px', margin: '0 -16px' }}>
            {NEARBY_SHIFTS.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} onClick={() => navigate(`/find-shifts/${shift.id}`)} />
            ))}
          </div>
        </div>

        <ProviderBottomNav />
      </div>
      {bookedShift && (
        <BookedShiftModal
          shift={bookedShift}
          onClose={() => setBookedShift(null)}
          onCancelShift={() => setBookedShift(null)}
          onMessageOffice={() => { setBookedShift(null); navigate('/provider-messages'); }}
        />
      )}
    </>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function QuickTile({ icon, tone, label, badge, onClick }) {
  const bg = tone === 'green' ? COLORS.greenTint : COLORS.coralSoft;
  const stroke = tone === 'green' ? COLORS.green : COLORS.coral;
  return (
    <div
      onClick={onClick}
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 18,
        padding: 16,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 17, height: 17 }}>
          {icon}
        </svg>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, color: COLORS.text, lineHeight: 1.2, flex: 1 }}>{label}</div>
      {badge != null && (
        <div
          style={{
            background: COLORS.coral,
            color: 'white',
            fontSize: 10,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 100,
            minWidth: 22,
            textAlign: 'center',
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? COLORS.green : 'none',
        border: 'none',
        fontSize: 11,
        fontWeight: 700,
        color: active ? 'white' : COLORS.textLight,
        padding: '6px 14px',
        borderRadius: 100,
        transition: 'all 0.2s',
      }}
    >
      {children}
    </button>
  );
}

function DayCard({ day, onOpenBooked }) {
  const isToday = day.status === 'today';
  const isBooked = day.status === 'booked';
  const isOff = day.status === 'off';
  const bg = isToday ? COLORS.green : isBooked ? COLORS.greenTint : isOff ? COLORS.bg : COLORS.card;
  const borderColor = isToday ? COLORS.green : isBooked ? COLORS.greenSoft : COLORS.borderSoft;
  const opacity = isOff ? 0.55 : 1;
  const nameColor = isToday ? 'rgba(255,255,255,0.85)' : isBooked ? COLORS.green : COLORS.textLight;
  const numColor = isToday ? 'white' : isBooked ? COLORS.green : COLORS.text;
  const statusColor = isToday ? 'rgba(255,255,255,0.95)' : isBooked ? COLORS.green : COLORS.textLight;

  return (
    <div
      onClick={isBooked ? onOpenBooked : undefined}
      style={{
        flexShrink: 0,
        width: 72,
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: '12px 8px',
        textAlign: 'center',
        cursor: isBooked ? 'pointer' : 'default',
        opacity,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, color: nameColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>{day.name}</div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, color: numColor, marginTop: 4, lineHeight: 1 }}>{day.num}</div>
      <div
        style={{
          fontSize: 9,
          marginTop: 6,
          fontWeight: 700,
          color: statusColor,
          textTransform: 'uppercase',
          letterSpacing: 0.3,
          lineHeight: 1.2,
          minHeight: 22,
          whiteSpace: 'pre-line',
        }}
      >
        {day.label}
      </div>
    </div>
  );
}

function MonthGrid({ onOpenBooked }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 20,
        padding: '18px 16px 14px',
        margin: '0 4px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 4px' }}>
        <NavBtn dir="left" />
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: COLORS.text }}>April 2026</div>
        <NavBtn dir="right" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: COLORS.textLight, textTransform: 'uppercase', padding: '4px 0 6px' }}>
            {d}
          </div>
        ))}
        {MONTH_CELLS.map((cell, i) => (
          <MonthCell key={i} cell={cell} onOpenBooked={cell?.s === 'booked' ? () => onOpenBooked(cell.d) : undefined} />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: 14,
          justifyContent: 'center',
          padding: '14px 4px 4px',
          borderTop: `1px solid ${COLORS.borderSoft}`,
          marginTop: 12,
        }}
      >
        <Legend color={COLORS.green} label="Today" />
        <Legend color={COLORS.greenTint} border={COLORS.greenSoft} label="Booked" />
        <Legend color="white" border={COLORS.border} label="Off" off />
      </div>
    </div>
  );
}

function NavBtn({ dir }) {
  return (
    <button
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: COLORS.bg,
        border: `1px solid ${COLORS.borderSoft}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke={COLORS.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
        {dir === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

function MonthCell({ cell, onOpenBooked }) {
  if (!cell) return <div style={{ aspectRatio: '1' }} />;
  const isToday = cell.s === 'today';
  const isBooked = cell.s === 'booked';
  const isOff = cell.s === 'off';
  const bg = isToday ? COLORS.green : isBooked ? COLORS.greenTint : 'transparent';
  const color = isToday ? 'white' : isBooked ? COLORS.green : COLORS.text;
  return (
    <div
      onClick={isBooked && onOpenBooked ? onOpenBooked : undefined}
      style={{
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 13,
        fontWeight: isToday || isBooked ? 700 : 600,
        color,
        background: bg,
        borderRadius: 10,
        cursor: isBooked ? 'pointer' : 'default',
        position: 'relative',
        opacity: isOff ? 0.55 : 1,
        textDecoration: isOff ? 'line-through' : 'none',
      }}
    >
      {cell.d}
    </div>
  );
}

function Legend({ color, border, label, off }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: COLORS.textLight, fontWeight: 600 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 3,
          background: color,
          border: border ? `1px solid ${border}` : 'none',
          position: 'relative',
          textDecoration: off ? 'line-through' : 'none',
        }}
      />
      {label}
    </div>
  );
}

function ShiftCard({ shift, onClick }) {
  const navigate = useNavigate();
  const goOffice = (e) => {
    e.stopPropagation();
    navigate(`/office/${shift.officeId || shift.id || 'demo'}`);
  };
  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 260,
        background: COLORS.card,
        border: `1px solid ${COLORS.borderSoft}`,
        borderRadius: 20,
        padding: 16,
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      {shift.urgent && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: COLORS.coral,
            color: 'white',
            fontSize: 9,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 100,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
          }}
        >
          Urgent
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div
          onClick={goOffice}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #f1f9f5 0%, #d4ead9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: 13,
            color: COLORS.green,
            flexShrink: 0,
            letterSpacing: '-0.5px',
            cursor: 'pointer',
          }}
        >
          {shift.initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            onClick={goOffice}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 13,
              color: COLORS.text,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: COLORS.greenSoft,
              textUnderlineOffset: 3,
            }}
          >
            {shift.name}
          </div>
          <div style={{ fontSize: 10, color: COLORS.textLight, marginTop: 2, fontWeight: 600 }}>{shift.distance}</div>
        </div>
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 17, color: COLORS.text, lineHeight: 1.2, marginBottom: 8 }}>
        {shift.role}
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMid, fontWeight: 600, marginBottom: 14 }}>{shift.when}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${COLORS.borderSoft}` }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: COLORS.green, lineHeight: 1 }}>
          ${shift.pay}
          <span style={{ fontSize: 11, color: COLORS.textLight, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginLeft: 2 }}>/hr</span>
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: COLORS.green,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </div>
  );
}
