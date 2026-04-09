import React, { useState, useMemo, useEffect } from 'react';

// ============================================================
// Kazi - Booking Sheet (bottom sheet)
// Location: src/components/BookingSheet.jsx
//
// Props:
//   open: boolean                -- whether the sheet is open
//   onClose: () => void
//   pro: { name, firstName, rate }   -- professional being booked
//   selectedDate: Date | null
//   backups: Array<{ name, initials }>   -- current Rapid Fill backups
//   onLaunchRapidFill: () => void  -- called when the Rapid Fill card is tapped
//   onSend: (details) => void      -- called with { date, start, end, lunchOn, lunchMins, note, totalCost }
// ============================================================

// ---------- Inline SVG icons ----------
const IconClose = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconCalendar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconChevronRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function BookingSheet({
  open,
  onClose,
  pro,
  selectedDate,
  backups = [],
  onLaunchRapidFill,
  onSend,
}) {
  const startTimes = ['7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM'];
  const endTimes = ['3:00 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '7:00 PM'];

  const [internalDate, setInternalDate] = useState(selectedDate);
  const [startIdx, setStartIdx] = useState(2); // 8:00 AM
  const [endIdx, setEndIdx] = useState(3);     // 5:00 PM
  const [lunchOn, setLunchOn] = useState(true);
  const [lunchMins, setLunchMins] = useState(45);
  const [note, setNote] = useState('');

  // Sync when prop changes
  useEffect(() => { setInternalDate(selectedDate); }, [selectedDate]);

  // Lock body scroll while sheet is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const fullDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const firstName = pro?.firstName || pro?.name?.split(' ')[0] || '';
  const hourlyRate = pro?.rate || 0;

  const dateLabel = useMemo(() => {
    if (!internalDate) return 'Select a date';
    return `${fullDays[internalDate.getDay()]}, ${shortMonths[internalDate.getMonth()]} ${internalDate.getDate()}`;
  }, [internalDate]);

  const parseTime = (str) => {
    const [time, mer] = str.split(' ');
    let [h, m] = time.split(':').map(Number);
    if (mer === 'PM' && h !== 12) h += 12;
    if (mer === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };

  const totalMins = useMemo(() => {
    let m = parseTime(endTimes[endIdx]) - parseTime(startTimes[startIdx]);
    if (lunchOn) m -= lunchMins;
    return Math.max(0, m);
  }, [startIdx, endIdx, lunchOn, lunchMins]);

  const totalShift = useMemo(() => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return `${h}h${m ? ` ${m}m` : ''}`;
  }, [totalMins]);

  const totalCost = Math.round((totalMins / 60) * hourlyRate);

  const sendLabel = backups.length
    ? `Send to ${firstName} + ${backups.length} backup${backups.length > 1 ? 's' : ''}`
    : 'Send booking request';

  const handleSend = () => {
    onSend &&
      onSend({
        date: internalDate,
        start: startTimes[startIdx],
        end: endTimes[endIdx],
        lunchOn,
        lunchMins,
        note,
        totalCost,
      });
  };

  // Handle translate values for both mobile and desktop widths
  const sheetStyle = {
    transform:
      typeof window !== 'undefined' && window.innerWidth >= 600
        ? open
          ? 'translate(-50%, 0)'
          : 'translate(-50%, 100%)'
        : open
        ? 'translateY(0)'
        : 'translateY(100%)',
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-250 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[28px] z-[101] max-h-[92vh] overflow-y-auto transition-transform duration-300 sm:max-w-[480px] sm:left-1/2"
        style={{
          ...sheetStyle,
          WebkitOverflowScrolling: 'touch',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#ececec] rounded-full mx-auto mt-3 mb-1" />

        {/* Header */}
        <div className="px-6 pt-3 pb-2 flex items-center justify-between">
          <div>
            <div
              className="text-xl font-extrabold text-[#1a1a1a]"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Book {firstName}
            </div>
            <div className="text-xs text-[#8a8a8a] mt-0.5">
              Confirm shift details to send request
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#f9f8f6] flex items-center justify-center text-[#1a1a1a]"
          >
            <IconClose />
          </button>
        </div>

        {/* Date banner or date picker */}
        {internalDate ? (
          <div className="mx-6 mt-4 mb-2 bg-[#f1f9f5] border-[1.5px] border-[#e8f3ee] rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <div className="w-[38px] h-[38px] bg-white rounded-xl flex items-center justify-center text-[#1a7f5e] flex-shrink-0">
              <IconCalendar />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold text-[#1a7f5e] uppercase tracking-wider">Selected date</div>
              <div className="text-base font-bold mt-0.5 text-[#1a1a1a]" style={{ fontFamily: "'Outfit', sans-serif" }}>{dateLabel}</div>
            </div>
            <button onClick={() => setInternalDate(null)} style={{ background: 'none', border: 'none', color: '#8a8a8a', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Change</button>
          </div>
        ) : (
          <div className="px-6 mt-4 mb-2">
            <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">Select a date</div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', margin: '0 -24px', padding: '0 24px 4px' }}>
              {Array.from({ length: 21 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                return d;
              }).map((d, i) => (
                <div
                  key={i}
                  onClick={() => setInternalDate(d)}
                  style={{
                    flexShrink: 0, width: 60, padding: '12px 8px',
                    background: '#f9f8f6', border: '1.5px solid #f3f3f3',
                    borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8a8a8a', textTransform: 'uppercase' }}>{fullDays[d.getDay()].slice(0, 3)}</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginTop: 4, lineHeight: 1 }}>{d.getDate()}</div>
                  <div style={{ fontSize: 10, color: '#8a8a8a', marginTop: 3, fontWeight: 600 }}>{shortMonths[d.getMonth()]}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shift hours */}
        <div className="px-6 py-4">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">
            Shift hours
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setStartIdx((startIdx + 1) % startTimes.length)}
              className="bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider">
                Start time
              </div>
              <div
                className="text-[17px] font-bold mt-1 text-[#1a1a1a]"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {startTimes[startIdx]}
              </div>
            </div>
            <div
              onClick={() => setEndIdx((endIdx + 1) % endTimes.length)}
              className="bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl px-4 py-3.5 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wider">
                End time
              </div>
              <div
                className="text-[17px] font-bold mt-1 text-[#1a1a1a]"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {endTimes[endIdx]}
              </div>
            </div>
          </div>
        </div>

        {/* Lunch break */}
        <div className="px-6 py-4">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">
            Lunch break
          </div>
          <div className="bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-[#1a1a1a]">Provide a lunch break</div>
                <div className="text-[11px] text-[#8a8a8a] mt-0.5">
                  Unpaid break during the shift
                </div>
              </div>
              <button
                onClick={() => setLunchOn(!lunchOn)}
                className={`relative w-[46px] h-[26px] rounded-full transition-colors ${
                  lunchOn ? 'bg-[#1a7f5e]' : 'bg-[#ececec]'
                }`}
                aria-label="Toggle lunch break"
              >
                <div
                  className={`absolute top-[3px] left-[3px] w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    lunchOn ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
            {lunchOn && (
              <div className="mt-3.5 pt-3.5 border-t border-[#f3f3f3]">
                <div className="flex gap-2 flex-wrap">
                  {[30, 45, 60].map((m) => (
                    <button
                      key={m}
                      onClick={() => setLunchMins(m)}
                      className={`px-4 py-2 rounded-full text-[13px] font-semibold border-[1.5px] transition-colors ${
                        lunchMins === m
                          ? 'bg-[#1a7f5e] text-white border-[#1a7f5e]'
                          : 'bg-white text-[#5a5a5a] border-[#ececec]'
                      }`}
                    >
                      {m === 60 ? '1 hour' : `${m} min`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rapid Fill launcher */}
        <div className="px-6 py-4">
          <div
            onClick={onLaunchRapidFill}
            className={`rounded-[18px] border-[1.5px] p-4 cursor-pointer transition-all ${
              backups.length
                ? 'border-[#1a7f5e]'
                : 'border-[#f3f3f3] bg-white'
            }`}
            style={
              backups.length
                ? { background: 'linear-gradient(135deg, #f1f9f5 0%, #ffffff 60%)' }
                : {}
            }
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                  backups.length ? 'bg-[#1a7f5e] text-white' : 'bg-[#f1f9f5] text-[#1a7f5e]'
                }`}
              >
                <IconBolt />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[15px] font-bold leading-tight text-[#1a1a1a]"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Rapid Fill
                </div>
                <div
                  className={`text-[11px] mt-0.5 leading-snug ${
                    backups.length ? 'text-[#1a7f5e] font-semibold' : 'text-[#8a8a8a]'
                  }`}
                >
                  {backups.length
                    ? `${backups.length} backup${backups.length > 1 ? 's' : ''} added`
                    : 'Add up to 9 backup pros. First to accept gets the shift.'}
                </div>
              </div>
              <span className="text-[#8a8a8a]">
                <IconChevronRight />
              </span>
            </div>

            {backups.length > 0 && (
              <div className="mt-3.5 pt-3.5 border-t border-[#e8f3ee] flex items-center gap-2.5">
                <div className="flex items-center">
                  {backups.slice(0, 4).map((b, i) => (
                    b.avatarUrl ? (
                      <img
                        key={i}
                        src={b.avatarUrl}
                        alt={b.name || ''}
                        className="w-8 h-8 rounded-[10px] border-2 border-white object-cover"
                        style={{ marginLeft: i === 0 ? 0 : -8 }}
                      />
                    ) : (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[11px] font-bold border-2 border-white"
                        style={{
                          background: '#f9f8f6',
                          color: '#1a1a1a',
                          marginLeft: i === 0 ? 0 : -8,
                          fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        {b.initials}
                      </div>
                    )
                  ))}
                  {backups.length > 4 && (
                    <div
                      className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white bg-[#1a7f5e]"
                      style={{ marginLeft: -8, fontFamily: "'Outfit', sans-serif" }}
                    >
                      +{backups.length - 4}
                    </div>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchRapidFill && onLaunchRapidFill();
                  }}
                  className="ml-auto text-xs font-bold text-[#1a7f5e] underline"
                >
                  Manage
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Note */}
        <div className="px-6 py-4">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">
            Note for {firstName} (optional)
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Please wear navy scrubs. Park in lot B."
            className="w-full bg-[#f9f8f6] border-[1.5px] border-[#f3f3f3] rounded-2xl px-4 py-3.5 text-sm min-h-[70px] resize-none focus:outline-none focus:border-[#1a7f5e] text-[#1a1a1a]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        {/* Cost summary */}
        <div className="px-6 py-4">
          <div className="text-[11px] font-bold text-[#8a8a8a] uppercase tracking-wider mb-2.5">
            Cost summary
          </div>
          <div
            className="rounded-[18px] p-5 text-white"
            style={{ background: 'linear-gradient(135deg, #1a7f5e 0%, #15604a 100%)' }}
          >
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="opacity-85">Hourly rate</span>
              <span className="font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                ${hourlyRate}/hr
              </span>
            </div>
            <div className="flex items-center justify-between py-1 text-sm">
              <span className="opacity-85">Total shift</span>
              <span className="font-bold" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {totalShift}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/20">
              <span className="text-xs font-bold uppercase tracking-wider opacity-85">
                Estimated total
              </span>
              <span
                className="text-[28px] font-extrabold"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                ${totalCost}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white px-6 pt-4 pb-7 border-t border-[#f3f3f3]">
          <button
            onClick={handleSend}
            className="w-full bg-[#1a7f5e] text-white rounded-full py-4 font-bold text-[15px] active:scale-[0.99] transition-transform"
          >
            {sendLabel}
          </button>
          <div className="text-center text-[11px] text-[#8a8a8a] mt-2.5 leading-snug">
            {firstName} has 4 hours to accept. You won't be charged until she confirms.
          </div>
        </div>
      </div>
    </>
  );
}
