import { useNavigate } from 'react-router-dom'
import { useToast } from './ToastContext'
import { BADGE } from './adminStyles'

function StatCard({ icon, iconBg, value, label, delta, deltaType }) {
  const color = deltaType === 'up' ? 'text-[#1a7f5e]' : deltaType === 'warn' ? 'text-[#f59e0b]' : 'text-[#ef4444]'
  return (
    <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px]">
      <div className={`w-[38px] h-[38px] rounded-[9px] flex items-center justify-center mb-3`} style={{ background: iconBg }}>{icon}</div>
      <div className="text-[26px] font-black text-[#1a1a1a] leading-none mb-0.5">{value}</div>
      <div className="text-[11px] text-[#9ca3af] font-medium mb-1">{label}</div>
      <div className={`text-[11px] font-bold ${color}`}>{delta}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const showToast = useToast()

  const users = [
    { name: 'Sarah R.', email: 'sarah@email.com', img: 'https://randomuser.me/api/portraits/women/44.jpg', type: 'Professional', status: 'Active', joined: 'Mar 25', statusColor: 'green' },
    { name: 'Evolve Dentistry', email: 'evolve@dental.com', initials: 'ED', bg: '#e8f5f0', color: '#1a7f5e', type: 'Office', status: 'Active', joined: 'Mar 24', statusColor: 'green' },
    { name: 'Marcus J.', email: 'marcus@email.com', img: 'https://randomuser.me/api/portraits/men/32.jpg', type: 'Professional', status: 'Pending', joined: 'Mar 22', statusColor: 'yellow' },
    { name: 'Bright Smile Dental', email: 'bright@dental.com', initials: 'BS', bg: '#fef9c3', color: '#92400e', type: 'Office', status: 'Suspended', joined: 'Mar 20', statusColor: 'red' },
  ]

  const activity = [
    { dot: '#1a7f5e', text: <><strong>Sarah R.</strong> Texas RDH License approved</>, time: '2m ago' },
    { dot: '#f59e0b', text: <><strong>Ticket #1042</strong> billing dispute opened</>, time: '14m ago' },
    { dot: '#1a7f5e', text: <><strong>Clear Lake Dental</strong> posted new shift</>, time: '31m ago' },
    { dot: '#ef4444', text: <><strong>Bright Smile Dental</strong> account suspended</>, time: '1h ago' },
    { dot: '#5b21b6', text: <><strong>Nina P.</strong> submitted CPR/BLS cert</>, time: '2h ago' },
    { dot: '#1a7f5e', text: <><strong>Marcus J.</strong> created new account</>, time: '3h ago' },
    { dot: '#f59e0b', text: <><strong>Ticket #1041</strong> cancellation dispute resolved</>, time: '5h ago' },
  ]

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        <StatCard icon={<UsersIco/>} iconBg="#e8f5f0" value="1,284" label="Total Users" delta="↑ 24 this week" deltaType="up"/>
        <StatCard icon={<CalIco/>} iconBg="#e8f5f0" value="342" label="Active Shifts" delta="↑ 18 today" deltaType="up"/>
        <StatCard icon={<DolIco/>} iconBg="#e8f5f0" value="$48.2k" label="MRR" delta="↑ 12% vs last month" deltaType="up"/>
        <StatCard icon={<ShieldIco/>} iconBg="#fef9c3" value="4" label="Pending Verifications" delta="Needs review" deltaType="warn"/>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Recent Users */}
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
          <div className="px-[18px] py-3.5 border-b border-[#f3f4f6] flex items-center justify-between">
            <span className="text-[13px] font-extrabold text-[#1a1a1a]">Recent Users</span>
            <button onClick={() => navigate('/admin/users')} className="text-[12px] font-semibold text-[#1a7f5e] bg-none border-none cursor-pointer" style={{ fontFamily: 'inherit' }}>View all →</button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['User','Type','Status','Joined'].map(h => (
                  <th key={h} className="text-left text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] px-4 py-2.5 border-b border-[#f3f4f6] bg-[#fafafa]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="hover:bg-[#fafffe] cursor-pointer" onClick={() => navigate('/admin/users')}>
                  <td className="px-4 py-3 text-[12px] border-b border-[#f9f8f6] last:border-0">
                    <div className="flex items-center gap-2">
                      {u.img ? <img src={u.img} className="w-[30px] h-[30px] rounded-full object-cover flex-shrink-0"/> : <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0" style={{ background: u.bg, color: u.color }}>{u.initials}</div>}
                      <div><div className="text-[12px] font-bold text-[#1a1a1a]">{u.name}</div><div className="text-[10px] text-[#9ca3af]">{u.email}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b border-[#f9f8f6]"><span className={BADGE[u.type === 'Professional' ? 'purple' : 'blue']}>{u.type}</span></td>
                  <td className="px-4 py-3 border-b border-[#f9f8f6]"><span className={BADGE[u.statusColor]}>{u.status}</span></td>
                  <td className="px-4 py-3 text-[12px] text-[#374151] border-b border-[#f9f8f6]">{u.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity Feed */}
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
          <div className="px-[18px] py-3.5 border-b border-[#f3f4f6]">
            <span className="text-[13px] font-extrabold text-[#1a1a1a]">Recent Activity</span>
          </div>
          {activity.map((a, i) => (
            <div key={i} className="flex items-start gap-2.5 px-4 py-3 border-b border-[#f9f8f6] last:border-0">
              <div className="w-[7px] h-[7px] rounded-full flex-shrink-0 mt-1" style={{ background: a.dot }}/>
              <div className="text-[12px] text-[#374151] flex-1 leading-snug [&_strong]:text-[#1a1a1a] [&_strong]:font-bold">{a.text}</div>
              <div className="text-[10px] text-[#9ca3af] flex-shrink-0">{a.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UsersIco() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> }
function CalIco() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> }
function DolIco() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
function ShieldIco() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> }
