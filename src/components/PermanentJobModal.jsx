import { useEffect } from 'react';

export default function PermanentJobModal({ open, job, onClose }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open || !job) return null;

  const isPart = (job.badge || '').toLowerCase().includes('part');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        animation: 'pjm-fade .25s ease',
      }}
    >
      <style>{`
        @keyframes pjm-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pjm-slide { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '28px 28px 0 0', width: '100%', maxWidth: 480,
          maxHeight: '92vh', position: 'relative',
          animation: 'pjm-slide .3s ease',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Scrollable content */}
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

        {/* Content */}
        <div style={{ padding: '16px 20px 0' }}>
          {/* Title */}
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 22,
            letterSpacing: '-.02em', marginBottom: 10, paddingRight: 36,
          }}>
            {isPart ? 'Part-Time' : 'Full-Time'} {job.title}
          </div>

          {/* Type pill */}
          <span style={{
            display: 'inline-block', background: '#efe8f5', color: '#7c5aa8',
            fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 100,
            marginBottom: 16,
          }}>
            {job.badge}
          </span>

          {/* Salary */}
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 24,
            color: '#1a7f5e', letterSpacing: '-.02em', marginBottom: 24,
          }}>
            {job.salary}
          </div>

          {/* Schedule section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15,
              marginBottom: 8, letterSpacing: '-.01em',
            }}>Schedule</div>
            <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>{job.type}</div>
          </div>

          {/* Benefits section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15,
              marginBottom: 10, letterSpacing: '-.01em',
            }}>Benefits</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(job.benefits || []).map((b) => (
                <span key={b} style={{
                  background: '#efe8f5', color: '#7c5aa8', fontSize: 12, fontWeight: 700,
                  padding: '6px 14px', borderRadius: 100,
                }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* About section */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 15,
              marginBottom: 8, letterSpacing: '-.01em',
            }}>About This Role</div>
            <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
              Contact the office for full job details.
            </div>
          </div>
        </div>


        </div>{/* end scrollable content */}

        {/* Fixed apply button — outside scroll area */}
        <div style={{
          flexShrink: 0, padding: '14px 20px',
          paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          background: '#ffffff', borderTop: '1px solid #ececec',
        }}>
          <button
            onClick={() => alert('Applied!')}
            style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: 100,
              background: '#7c5aa8', color: 'white', fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(124,90,168,.25)',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
