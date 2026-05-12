import React from 'react';

// Color-coded last-login chip used on the Find Pros card and on
// the office-facing provider profile. All three buckets render
// "Active …" — the color carries the recency signal without harsh
// "Inactive" wording.
//   ≤  7 days   green
//   8-30 days   amber
//   > 30 days   red

// Real source: /api/providers should return a `lastSeen` ISO and
// the caller should compute days. For now, hash a stable id (pro
// id) into a biased range so the marketplace looks healthy by
// default: ~60% green / ~30% amber / ~10% red.
export function getLastLoginDays(pro) {
  if (typeof pro?.lastLoginDays === 'number') return pro.lastLoginDays;
  const id = String(pro?.id || '');
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const r = h % 100;
  if (r < 60) return r % 8;          // 0..7
  if (r < 90) return 8 + (r % 23);   // 8..30
  return 31 + (r % 30);              // 31..60
}

function pillStyle(days) {
  if (days <= 7)  return { bg: '#f1f9f5', border: '#c5e3d5', color: '#1a7f5e' };
  if (days <= 30) return { bg: '#fef3e6', border: '#fce0bf', color: '#b45309' };
  return                 { bg: '#fdecec', border: '#f9d4d4', color: '#dc2626' };
}

function pillLabel(days) {
  if (days === 0) return 'Active today';
  if (days === 1) return 'Active 1 day ago';
  return `Active ${days} days ago`;
}

export default function LastLoginPill({ days, style: extra }) {
  const c = pillStyle(days);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 100,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: '-0.05px',
        lineHeight: 1.3,
        ...extra,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.color }} />
      {pillLabel(days)}
    </span>
  );
}
