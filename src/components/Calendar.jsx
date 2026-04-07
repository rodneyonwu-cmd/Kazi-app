import React from 'react';

// ============================================================
// Kazi - Monthly Availability Calendar
// Location: src/components/Calendar.jsx
//
// Props:
//   availableDays: number[]  -- e.g. [8, 9, 11, 14] (day-of-month numbers for current month)
//   onDayClick: (date: Date) => void
// ============================================================

export default function Calendar({ availableDays = [], onDayClick }) {
  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const todayDate = today.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push({ empty: true, key: `e${i}` });
  }
  for (let d = 1; d <= lastDate; d++) {
    const isPast = d < todayDate;
    const isAvailable = !isPast && availableDays.includes(d);
    const isToday = d === todayDate;
    cells.push({ day: d, isPast, isAvailable, isToday, key: `d${d}` });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div
          className="text-base font-bold text-[#1a1a1a]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Availability
        </div>
        <div
          className="text-sm font-bold text-[#5a5a5a]"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          {fullMonths[month]} {year}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3.5 text-[11px] text-[#8a8a8a] font-semibold">
        <div className="w-3 h-3 rounded bg-[#f1f9f5] border border-[#e8f3ee]" />
        <span>Tap an available day to book</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {dayLabels.map((l) => (
          <div
            key={l}
            className="text-center text-[10px] font-bold text-[#8a8a8a] uppercase tracking-wide pb-1"
          >
            {l}
          </div>
        ))}
        {cells.map((c) => {
          if (c.empty) return <div key={c.key} className="aspect-square" />;

          let classes =
            'aspect-square rounded-xl flex items-center justify-center font-semibold text-sm border-[1.5px]';
          const style = {
            fontFamily: "'Outfit', sans-serif",
            borderColor: 'transparent',
          };

          if (c.isPast) {
            classes += ' text-[#ececec]';
          } else if (c.isAvailable) {
            classes += ' bg-[#f1f9f5] text-[#1a7f5e] cursor-pointer font-bold active:scale-95 transition-transform';
            style.borderColor = '#e8f3ee';
          } else {
            classes += ' bg-[#f9f8f6] text-[#1a1a1a]';
          }

          if (c.isToday) {
            style.borderColor = '#1a7f5e';
            style.borderWidth = '2px';
          }

          return (
            <div
              key={c.key}
              className={classes}
              style={style}
              onClick={
                c.isAvailable
                  ? () => onDayClick && onDayClick(new Date(year, month, c.day))
                  : undefined
              }
            >
              {c.day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
