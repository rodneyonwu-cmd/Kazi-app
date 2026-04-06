export default function ApplyConfirmModal({ shift, onCancel, onConfirm }) {
  if (!shift) return null

  const officeName = shift.name || shift.officeName || shift.office?.name || 'Office'
  const role = shift.role || '—'
  const rate = shift.rate || (shift.hourlyRate ? `$${shift.hourlyRate}/hr` : '—')
  const isPerm = shift.jobType === 'PERMANENT' || shift.isPerm
  const location = shift.distance || shift.location || (shift.office?.city ? `${shift.office.city}, ${shift.office.state || ''}` : '')
  const estPay = shift.estPay || ''
  const software = shift.software && shift.software !== 'N/A' ? shift.software : ''
  const description = shift.description || ''
  const parking = shift.parking && shift.parking !== 'Contact office' ? shift.parking : ''

  // Compute hours for temp shifts
  let hoursText = ''
  if (!isPerm && shift.time) {
    const parseTo24h = (t) => {
      if (!t) return [0, 0]
      if (!t.includes('AM') && !t.includes('PM')) return t.split(':').map(Number)
      const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i)
      if (!match) return [0, 0]
      let h = parseInt(match[1]), m = parseInt(match[2])
      if (match[3].toUpperCase() === 'PM' && h < 12) h += 12
      if (match[3].toUpperCase() === 'AM' && h === 12) h = 0
      return [h, m]
    }
    const parts = shift.time.split(' – ')
    if (parts.length === 2) {
      const [sh, sm] = parseTo24h(parts[0])
      const [eh, em] = parseTo24h(parts[1])
      const hrs = (eh + em / 60) - (sh + sm / 60)
      if (hrs > 0) hoursText = `${hrs % 1 === 0 ? hrs : hrs.toFixed(1)} hrs`
    }
  }

  // Date/time display
  let dateText = ''
  let timeText = ''
  if (isPerm) {
    dateText = shift.schedule?.split(' · ')[0] || 'Full-time'
  } else {
    dateText = shift.date || ''
    timeText = shift.time || ''
  }

  const Row = ({ label, value, accent }) => (
    <div className="flex justify-between items-start gap-3 py-2 border-b border-[#f0efed] last:border-0">
      <span className="text-[12px] text-[#9ca3af] flex-shrink-0">{label}</span>
      <span className={`text-[12px] font-semibold text-right ${accent ? 'text-[#1a7f5e]' : 'text-[#1a1a1a]'}`}>{value}</span>
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[200]" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-[440px] bg-white rounded-[20px] shadow-2xl z-[201] max-h-[90vh] overflow-y-auto">
        <div className="p-5">
          <div className="mb-3">
            <p className="text-[11px] font-bold text-[#1a7f5e] uppercase tracking-widest mb-1">Booking details</p>
            <p className="text-[18px] font-black text-[#1a1a1a] leading-tight">Review & confirm application</p>
          </div>

          {/* Shift summary */}
          <div className="bg-[#f9f8f6] rounded-[14px] px-4 py-2 mb-3">
            <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider pt-2 pb-1">Shift</p>
            <Row label="Office" value={officeName} />
            {location && <Row label="Location" value={location} />}
            <Row label="Role" value={role} />
            {isPerm ? (
              <Row label="Type" value={dateText || '—'} />
            ) : (
              <>
                <Row label="Date" value={dateText || '—'} />
                {timeText && <Row label="Time" value={timeText} />}
                {hoursText && <Row label="Duration" value={hoursText} />}
              </>
            )}
            {software && <Row label="Software" value={software} />}
            {parking && <Row label="Parking" value={parking} />}
          </div>

          {/* Pay summary */}
          <div className="bg-[#e8f5f0] rounded-[14px] px-4 py-2 mb-3">
            <p className="text-[10px] font-bold text-[#1a7f5e] uppercase tracking-wider pt-2 pb-1">Your pay</p>
            {isPerm && shift.salaryDisplay ? (
              <>
                <Row label="Salary" value={shift.salaryDisplay} accent />
                {rate && rate !== '—' && <Row label="Hourly rate" value={rate} accent />}
              </>
            ) : (
              <>
                <Row label="Hourly rate" value={rate} accent />
                {estPay && <Row label="Estimated total" value={estPay} accent />}
              </>
            )}
          </div>

          {description && (
            <div className="mb-4">
              <p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-wider mb-1">Description</p>
              <p className="text-[12px] text-[#374151] leading-relaxed">{description}</p>
            </div>
          )}

          <p className="text-[12px] text-[#6b7280] mb-4 text-center">By confirming, the office will receive your application and can review your profile.</p>

          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-3 min-h-[44px] rounded-full text-[13px] bg-white cursor-pointer hover:border-[#9ca3af] transition"
              style={{ fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 min-h-[44px] rounded-full text-[13px] border-none cursor-pointer transition"
              style={{ fontFamily: 'inherit' }}
            >
              Confirm application
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
