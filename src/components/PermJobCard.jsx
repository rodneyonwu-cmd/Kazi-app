import React from 'react';
import { CardHeader } from './TempShiftCard';

// ============================================================
// Shared permanent-job card.
// Used on Find Shifts (vertical list) and the provider dashboard's
// "Permanent jobs near me" horizontal carousel. The card sets its
// own internal padding but no outer margin, so the caller controls
// spacing/width.
// ============================================================

const COLORS = {
  green: '#1a7f5e',
  bg: '#f9f8f6',
  card: '#ffffff',
  text: '#1a1a1a',
  textMid: '#5a5a5a',
  textLight: '#8a8a8a',
  border: '#ececec',
  borderSoft: '#f3f3f3',
};

export default function PermJobCard({ job, onTap, style }) {
  return (
    <div
      onClick={onTap}
      style={{
        background: COLORS.card,
        border: '1px solid #e8e6e1',
        borderRadius: 18,
        padding: 18,
        position: 'relative',
        cursor: 'pointer',
        ...style,
      }}
    >
      {/* Salary — top right */}
      <div style={{ position: 'absolute', top: 18, right: 18, textAlign: 'right' }}>
        <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: COLORS.green, fontSize: 13, lineHeight: 1 }}>
          {job.payRange}
        </div>
        <div style={{ fontSize: 9, color: COLORS.textLight, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>
          {job.payUnit}
        </div>
      </div>
      <CardHeader item={job} />
      {/* Tags row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: job.benefits?.length ? 10 : 0 }}>
        {job.tags?.map((t, i) => (
          <span
            key={i}
            style={{
              background: t.gray ? COLORS.bg : '#f3ecfd',
              color: t.gray ? COLORS.textMid : '#5b21b6',
              border: `1px solid ${t.gray ? COLORS.border : '#d9c7f5'}`,
              padding: '4px 10px',
              borderRadius: 100,
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {t.label}
          </span>
        ))}
      </div>
      {/* Benefits row — same style as gray tags */}
      {job.benefits?.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {job.benefits.map((b) => (
            <span
              key={b}
              style={{
                background: COLORS.bg,
                color: COLORS.textMid,
                border: `1px solid ${COLORS.border}`,
                padding: '4px 10px',
                borderRadius: 100,
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
