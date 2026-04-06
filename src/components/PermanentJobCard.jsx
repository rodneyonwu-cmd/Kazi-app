export default function PermanentJobCard({ job, onClick, statusBadge = null }) {
  const empType = job.schedule?.split(' · ')[0] || 'Full-time'
  const isPart = empType === 'Part-time'
  const salaryDisplay = job.salary
    || (job.salaryMin
      ? `$${Number(job.salaryMin).toLocaleString()}${job.salaryMax ? ` – $${Number(job.salaryMax).toLocaleString()}` : ''}/yr`
      : '')
  const rate = job.rate || (job.hourlyRate ? `$${job.hourlyRate}/hr` : '')
  const applicants = job._count?.applications ?? job.applicants ?? 0

  return (
    <button
      onClick={onClick}
      className="w-full bg-white border border-[#e5e7eb] hover:border-[#1a7f5e] rounded-[18px] p-4 flex items-center gap-4 transition text-left"
    >
      <div className="w-11 h-11 rounded-[11px] bg-[#e8f5f0] flex items-center justify-center flex-shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[14px] font-extrabold text-[#1a1a1a] truncate">{job.role || 'Permanent position'}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isPart ? 'bg-[#fef3c7] text-[#92400e]' : 'bg-[#e8f5f0] text-[#1a7f5e]'}`}>{empType}</span>
          {statusBadge}
        </div>
        <p className="text-[12px] text-[#6b7280]">{job.schedule?.split(' · ').slice(1).join(', ') || empType}</p>
      </div>
      <div className="text-right flex-shrink-0" style={{ maxWidth: 130 }}>
        <p className="text-[13px] font-black text-[#1a7f5e]">{salaryDisplay || rate || '—'}</p>
        {applicants > 0 && <p className="text-[11px] text-[#6b7280]">{applicants} applicant{applicants !== 1 ? 's' : ''}</p>}
      </div>
    </button>
  )
}
