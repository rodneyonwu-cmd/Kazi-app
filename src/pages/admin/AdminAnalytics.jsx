import { BADGE } from './adminStyles'

function StatCard({ icon, iconBg, value, label, delta, deltaType }) {
  const color = deltaType === 'up' ? 'text-[#1a7f5e]' : deltaType === 'warn' ? 'text-[#f59e0b]' : 'text-[#ef4444]'
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px]">
      <div className="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center mb-3" style={{ background: iconBg }}>{icon}</div>
      <div className="text-[26px] font-black text-[#1a1a1a] leading-none mb-0.5">{value}</div>
      <div className="text-[11px] text-[#9ca3af] font-medium mb-1">{label}</div>
      <div className={`text-[11px] font-bold ${color}`}>{delta}</div>
    </div>
  )
}

function BarRow({ label, pct, color, val }) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <span className="text-[11px] text-[#6b7280] w-[80px] flex-shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color || '#1a7f5e' }}/>
      </div>
      <span className="text-[11px] font-bold text-[#1a1a1a] w-9 flex-shrink-0">{val}</span>
    </div>
  )
}

export default function AdminAnalytics() {
  const cities = [
    { city: 'Houston, TX', offices: 142, pros: 389, shifts: 218, fill: '84%', fillColor: 'green' },
    { city: 'Dallas, TX', offices: 98, pros: 261, shifts: 143, fill: '79%', fillColor: 'green' },
    { city: 'Austin, TX', offices: 64, pros: 178, shifts: 94, fill: '71%', fillColor: 'yellow' },
    { city: 'San Antonio, TX', offices: 41, pros: 112, shifts: 57, fill: '68%', fillColor: 'yellow' },
    { city: 'El Paso, TX', offices: 18, pros: 44, shifts: 21, fill: '52%', fillColor: 'red' },
  ]

  return (
    <div>
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} iconBg="#e8f5f0" value="78%" label="Shift Fill Rate" delta="↑ 5% this month" deltaType="up"/>
        <StatCard icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} iconBg="#e8f5f0" value="48m" label="Avg Fill Time" delta="↓ 6m faster" deltaType="up"/>
        <StatCard icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>} iconBg="#fef9c3" value="7.2%" label="Cancellation Rate" delta="↑ 1.2% this week" deltaType="warn"/>
        <StatCard icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} iconBg="#e8f5f0" value="64%" label="Repeat Booking Rate" delta="↑ Strong retention" deltaType="up"/>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
          <div className="px-[18px] py-3.5 border-b border-[#f3f4f6]"><span className="text-[13px] font-extrabold text-[#1a1a1a]">Shift Volume by Role</span></div>
          <div className="p-4">
            <BarRow label="Hygienist" pct={82} color="#1a7f5e" val="82%"/>
            <BarRow label="Assistant" pct={54} color="#5b21b6" val="54%"/>
            <BarRow label="Front Desk" pct={38} color="#f59e0b" val="38%"/>
            <BarRow label="Tx Coord." pct={22} color="#ef4444" val="22%"/>
            <BarRow label="Sterilization" pct={14} color="#6b7280" val="14%"/>
          </div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
          <div className="px-[18px] py-3.5 border-b border-[#f3f4f6]"><span className="text-[13px] font-extrabold text-[#1a1a1a]">Revenue by Month</span></div>
          <div className="p-4">
            <BarRow label="October" pct={52} val="$32k"/>
            <BarRow label="November" pct={61} val="$38k"/>
            <BarRow label="December" pct={58} val="$36k"/>
            <BarRow label="January" pct={70} val="$43k"/>
            <BarRow label="February" pct={74} val="$46k"/>
            <BarRow label="March" pct={78} val="$48k"/>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        <div className="px-[18px] py-3.5 border-b border-[#f3f4f6]"><span className="text-[13px] font-extrabold text-[#1a1a1a]">Geographic Coverage — Top Cities</span></div>
        <table className="w-full border-collapse">
          <thead>
            <tr>{['City','Offices','Professionals','Shifts This Month','Fill Rate'].map(h => <th key={h} className="text-left text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] px-4 py-2.5 border-b border-[#f3f4f6] bg-[#fafafa]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {cities.map((c, i) => (
              <tr key={i} className="border-b border-[#f9f8f6] last:border-0">
                <td className="px-4 py-3 text-[12px] font-bold text-[#1a1a1a]">{c.city}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{c.offices}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{c.pros}</td>
                <td className="px-4 py-3 text-[12px] text-[#374151]">{c.shifts}</td>
                <td className="px-4 py-3"><span className={BADGE[c.fillColor]}>{c.fill}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
