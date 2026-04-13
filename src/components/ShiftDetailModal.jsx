import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShiftDetailModal({ open, shift, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || !shift) return null;

  // Normalize data from both OfficePublicProfile and FindShifts shapes
  const officeName = shift.officeName || shift.name || 'Office';
  const officeInitials = shift.officeInitials || shift.initials || officeName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
  const hourlyRate = typeof shift.pay === 'number' ? shift.pay : parseFloat((shift.pay || '0').replace(/[^0-9.]/g, '')) || 0;
  const payRate = `$${hourlyRate}/hr`;
  const dateDisplay = shift.when || (shift.name && shift.day ? `${shift.name}, ${shift.day}th` : '—');
  const hoursDisplay = shift.meta || shift.hours || '—';
  const lunchDisplay = shift.lunch || '45 min';
  const roleDisplay = shift.role || '—';
  const location = shift.distance || shift.location || 'Houston, TX';
  const rating = shift.rating || '4.8';
  const reviewCount = shift.reviewCount || 0;
  const note = shift.note || 'Please arrive 10 minutes early. Check in at the front desk. Scrubs provided.';
  const officeId = shift.officeId || shift.id || 'demo';

  // Estimate total earnings: extract hours from meta ("8 hrs") or time range, minus lunch
  const hrsMatch = (shift.meta || '').match(/(\d+)\s*hrs?/i);
  const paidHours = hrsMatch ? parseInt(hrsMatch[1]) : (shift.earnings ? Math.round(shift.earnings / hourlyRate) : 8);
  const lunchMinutes = parseInt((lunchDisplay.match(/(\d+)/) || [])[1] || '0');
  const estimatedEarnings = shift.earnings || Math.round(hourlyRate * (paidHours - lunchMinutes / 60));

  const handleViewOffice = () => {
    onClose();
    navigate(`/office/${officeId}`);
  };

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
          maxHeight: '92vh', position: 'relative',
          animation: 'sdm-slide .3s ease',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Scrollable content area */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>

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
            width: 72, height: 72, borderRadius: 22,
            background: 'linear-gradient(135deg,#7ab8d4,#88c9a1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 22,
            margin: '0 auto 14px',
          }}>{officeInitials}</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22, color: '#1a1a1a', lineHeight: 1.2 }}>
            {officeName}
          </div>
          <div style={{ fontSize: 14, color: '#8a8a8a', marginTop: 4 }}>{location}</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
            background: '#ffffff', border: '1px solid #f3f3f3', padding: '7px 14px', borderRadius: 100,
          }}>
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, fill: '#f4b740', stroke: '#f4b740', strokeWidth: 1 }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{rating}</span>
            {reviewCount > 0 && <span style={{ fontSize: 12, color: '#8a8a8a', fontWeight: 600 }}>({reviewCount} reviews)</span>}
          </div>
        </div>

        {/* Earnings banner */}
        <div style={{
          margin: '0 16px 12px', background: '#f1f9f5', borderRadius: 16,
          padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 14, color: '#5a5a5a', fontWeight: 600 }}>You'll earn</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 26, color: '#1a7f5e' }}>${estimatedEarnings}</div>
        </div>

        {/* Shift details card */}
        <div style={{ background: '#ffffff', margin: '0 16px 12px', borderRadius: 20, border: '1px solid #f3f3f3', overflow: 'hidden' }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', padding: '16px 18px 0' }}>Shift details</div>
          <div style={{ padding: '14px 18px 16px' }}>
            {[
              { icon: 'cal', label: 'Date', value: dateDisplay },
              { icon: 'clock', label: 'Hours', value: hoursDisplay },
              { icon: 'lunch', label: 'Lunch break', value: lunchDisplay },
              { icon: 'dollar', label: 'Your rate', value: payRate, green: true },
              { icon: 'user', label: 'Role requested', value: roleDisplay },
            ].map((row) => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: '1px solid #f3f3f3',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: '#f9f8f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <DetailIcon name={row.icon} />
                  </div>
                  <div style={{ fontSize: 13, color: '#8a8a8a' }}>{row.label}</div>
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: row.green ? '#1a7f5e' : '#1a1a1a', textAlign: 'right' }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Note from office */}
        <div style={{ background: '#ffffff', margin: '0 16px 12px', borderRadius: 20, border: '1px solid #f3f3f3', padding: 18 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', marginBottom: 10 }}>Note from office</div>
          <div style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.6 }}>{note}</div>
        </div>

        {/* View Office Profile */}
        <button
          onClick={handleViewOffice}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', margin: '0 0 12px', padding: 18,
            background: '#ffffff', border: 'none',
            borderTop: '1px solid #f3f3f3', borderBottom: '1px solid #f3f3f3',
            borderRadius: 0, fontSize: 15, fontWeight: 700, color: '#1a7f5e',
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          View Office Profile
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* About the office */}
        <div style={{ background: '#ffffff', margin: '0 16px 12px', borderRadius: 20, border: '1px solid #f3f3f3', overflow: 'hidden' }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', padding: '16px 18px 0' }}>About the office</div>
          <div style={{ padding: '14px 18px 16px' }}>
            {[
              { label: 'Practice type', value: 'General Dentistry' },
              { label: 'Software', value: shift.software || 'Dentrix' },
              { label: 'Team size', value: '8 staff' },
              { label: 'Parking', value: 'Free on-site' },
              { label: 'Dress code', value: 'Scrubs provided' },
            ].map((row) => (
              <div key={row.label} style={{
                display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f3f3',
              }}>
                <div style={{ fontSize: 13, color: '#8a8a8a', flex: 1 }}>{row.label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', textAlign: 'right' }}>{row.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Map / Address */}
        <div style={{ margin: '0 16px 12px', background: '#ffffff', borderRadius: 20, border: '1px solid #f3f3f3', overflow: 'hidden' }}>
          <div style={{
            width: '100%', height: 140,
            background: 'linear-gradient(135deg, #e8f0e4 0%, #d4e4dc 50%, #e0ead8 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 36, height: 36, background: '#1a7f5e',
              borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 12px rgba(26,127,94,0.3)',
            }}>
              <div style={{ width: 12, height: 12, background: 'white', borderRadius: '50%', transform: 'rotate(45deg)' }} />
            </div>
          </div>
          <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.4 }}>4820 Westheimer Rd{'\n'}Houston, TX 77056</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1a7f5e', flexShrink: 0, marginLeft: 12 }}>3.1 mi</div>
          </div>
        </div>

        </div>{/* end scrollable content */}

        {/* Fixed apply button bar — outside the scroll area */}
        <div style={{
          flexShrink: 0, padding: '14px 16px 28px',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          background: '#ffffff', borderTop: '1px solid #ececec',
          display: 'flex', gap: 10,
        }}>
          <button
            onClick={() => alert('Application submitted!')}
            style={{
              flex: 1, padding: 15, borderRadius: 100, fontSize: 15, fontWeight: 700,
              background: '#1a7f5e', color: 'white', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Apply for Shift · ${estimatedEarnings}
          </button>
          <button
            style={{
              padding: '15px 22px', borderRadius: 100, fontSize: 15, fontWeight: 700,
              background: '#f9f8f6', color: '#5a5a5a', border: '1px solid #ececec',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailIcon({ name }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: '#5a5a5a', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round', style: { width: 14, height: 14 } };
  switch (name) {
    case 'cal': return (<svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>);
    case 'clock': return (<svg {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>);
    case 'lunch': return (<svg {...props}><path d="M17 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" /><path d="M7 8H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><rect x="7" y="4" width="10" height="16" rx="1" /></svg>);
    case 'dollar': return (<svg {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
    case 'user': return (<svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /></svg>);
    default: return null;
  }
}
