import { useEffect } from 'react';
import RapidFillBanner from './RapidFillBanner';

export default function ShiftDetailModal({ open, shift, onClose }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || !shift) return null;

  // Normalize data from both OfficePublicProfile (day/name/meta/pay-string)
  // and FindShifts (when/pay-number/lunch/software) shapes
  const officeName = shift.officeName || shift.name || 'Office';
  const officeInitials = shift.officeInitials || shift.initials || officeName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  const payDisplay = typeof shift.pay === 'number' ? `$${shift.pay}` : (shift.pay || '$0').replace('/hr', '');
  const payRate = typeof shift.pay === 'number' ? `$${shift.pay}/hr` : (shift.pay || '$0/hr');
  const dateDisplay = shift.when || (shift.name && shift.day ? `${shift.name}, ${shift.day}th` : '—');
  const hoursDisplay = shift.meta || shift.hours || '—';
  const lunchDisplay = shift.lunch || 'Provided';
  const roleDisplay = shift.role || '—';
  const location = shift.distance || shift.location || '';
  const rating = shift.rating || '4.8';
  const reviewCount = shift.reviewCount || 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'sdm-fade .25s ease',
      }}
    >
      <style>{`
        @keyframes sdm-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sdm-slide { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 480,
          maxHeight: '92vh', overflowY: 'auto', position: 'relative',
          animation: 'sdm-slide .3s ease', WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 100, background: '#d1d5db' }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 16, width: 32, height: 32,
            borderRadius: '50%', background: '#f3f4f6', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
          }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Office hero */}
        <div style={{ textAlign: 'center', padding: '16px 20px 20px' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg,#a8c9b8,#7ab8a8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20,
            margin: '0 auto 12px', boxShadow: '0 4px 14px rgba(26,127,94,.12)',
          }}>{officeInitials}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-.02em', marginBottom: 4 }}>
            {officeName}
          </div>
          {location && <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 6 }}>{location}</div>}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: '#f4b740', fontSize: 14 }}>★</span>
            <span>{rating}</span>
            {reviewCount > 0 && <span style={{ color: '#9ca3af', fontWeight: 500 }}>({reviewCount} reviews)</span>}
          </div>
        </div>

        {shift.isRapidFill && <RapidFillBanner />}

        {/* Earnings banner */}
        <div style={{
          margin: '0 20px 16px', background: '#e8f5f0', borderRadius: 14, padding: '14px 18px',
          textAlign: 'center', border: '1.5px solid #cfe8de',
        }}>
          <div style={{ fontSize: 13, color: '#1a7f5e', fontWeight: 600, marginBottom: 2 }}>You'll earn</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 28, color: '#1a7f5e', letterSpacing: '-.02em' }}>
            {payDisplay}
            <span style={{ fontSize: 14, fontWeight: 600 }}> /hr</span>
          </div>
        </div>

        {/* Detail rows */}
        <div style={{ margin: '0 20px', background: '#f9f8f6', borderRadius: 14, padding: '4px 18px', border: '1.5px solid #e5e7eb' }}>
          {[
            { label: 'Date', value: dateDisplay },
            { label: 'Hours', value: hoursDisplay },
            { label: 'Lunch', value: lunchDisplay },
            { label: 'Rate', value: payRate },
            { label: 'Role', value: roleDisplay },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
              fontSize: 13,
            }}>
              <span style={{ color: '#6b7280', fontWeight: 500 }}>{row.label}</span>
              <span style={{ fontWeight: 700, color: row.label === 'Rate' ? '#1a7f5e' : '#1a1a1a' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Spacer for sticky button */}
        <div style={{ height: 80 }} />

        {/* Sticky apply button */}
        <div style={{
          position: 'sticky', bottom: 0, padding: '14px 20px', paddingBottom: 28,
          background: 'linear-gradient(transparent, #fff 12px)', zIndex: 2,
        }}>
          <button
            onClick={() => alert('Applied!')}
            style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: 100,
              background: '#1a7f5e', color: 'white', fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(26,127,94,.25)',
            }}
          >
            Apply for Shift
          </button>
        </div>
      </div>
    </div>
  );
}
