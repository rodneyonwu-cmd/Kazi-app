import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { BADGE } from './adminStyles'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const PLAN_PRICES = { free: 0, pps: 10, monthly: 99, starter: 49, growth: 99, enterprise: 249 }
const PLAN_LABELS = { free: 'Free', pps: 'Pay-per-shift', monthly: 'Monthly', starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' }

export default function AdminBilling() {
  const { getToken } = useAuth()
  const [offices, setOffices] = useState([])
  const [planCounts, setPlanCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`${API_URL}/api/admin/billing`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          setOffices(data.offices || [])
          setPlanCounts(data.planCounts || {})
        }
      } catch (err) { console.error('[AdminBilling]', err) }
      setLoading(false)
    }
    load()
  }, [getToken])

  const filtered = offices.filter(o => !search || o.name?.toLowerCase().includes(search.toLowerCase()))

  const totalMrr = Object.entries(planCounts).reduce((sum, [plan, count]) => sum + (PLAN_PRICES[plan] || 0) * count, 0)

  const tiers = Object.entries(planCounts).map(([plan, count]) => ({
    name: PLAN_LABELS[plan] || plan,
    price: `$${PLAN_PRICES[plan] || 0}`,
    count,
    mrr: `$${((PLAN_PRICES[plan] || 0) * count).toLocaleString()}`,
  }))

  return (
    <div>
      {/* Plan tiers */}
      <div className="grid grid-cols-3 gap-3.5 mb-5">
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px]">
          <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-1">Total MRR</div>
          <div className="text-[26px] font-black text-[#1a1a1a] leading-none">${totalMrr.toLocaleString()}</div>
          <div className="text-[11px] text-[#6b7280] mt-1">{offices.length} offices</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px]">
          <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-1">Paying Offices</div>
          <div className="text-[26px] font-black text-[#1a1a1a] leading-none">{offices.filter(o => o.plan && o.plan !== 'free').length}</div>
          <div className="text-[11px] text-[#6b7280] mt-1">{offices.filter(o => !o.plan || o.plan === 'free').length} on free tier</div>
        </div>
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px]">
          <div className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-wider mb-1">Avg Revenue / Office</div>
          <div className="text-[26px] font-black text-[#1a1a1a] leading-none">${offices.length > 0 ? Math.round(totalMrr / offices.length) : 0}</div>
          <div className="text-[11px] text-[#6b7280] mt-1">per month</div>
        </div>
      </div>

      {tiers.length > 0 && (
        <div className="bg-white border border-[#e5e7eb] rounded-[14px] p-[18px] mb-4">
          <div className="text-[13px] font-extrabold text-[#1a1a1a] mb-3">Plan Distribution</div>
          <div className="grid grid-cols-4 gap-3">
            {tiers.map(t => (
              <div key={t.name} className="bg-[#f9f8f6] rounded-[10px] p-3">
                <div className="text-[11px] font-bold text-[#6b7280]">{t.name}</div>
                <div className="text-[18px] font-black text-[#1a1a1a]">{t.count}</div>
                <div className="text-[10px] text-[#9ca3af]">{t.mrr} MRR</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Offices table */}
      <div className="bg-white border border-[#e5e7eb] rounded-[14px] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#f3f4f6] flex items-center justify-between gap-2.5 flex-wrap">
          <div className="text-[13px] font-extrabold text-[#1a1a1a]">All Offices</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="border border-[#e5e7eb] rounded-[9px] px-[11px] py-[6px] text-[12px] outline-none bg-[#f9f8f6] text-[#1a1a1a] w-[200px] focus:border-[#1a7f5e]" style={{ fontFamily: 'inherit' }}/>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>{['Office','Plan','Shifts','Bookings','Joined','Est. Monthly'].map(h => <th key={h} className="text-left text-[9px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] px-4 py-2.5 border-b border-[#f3f4f6] bg-[#fafafa] whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-[12px] text-[#9ca3af]">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="6" className="px-4 py-12 text-center text-[12px] text-[#9ca3af]">No offices</td></tr>
            ) : filtered.map(o => {
              const initials = (o.name || '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
              const monthly = PLAN_PRICES[o.plan || 'free'] || 0
              return (
                <tr key={o.id} className="border-b border-[#f9f8f6] last:border-0 hover:bg-[#fafffe]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {o.logoUrl ? (
                        <img src={o.logoUrl.startsWith('http') ? o.logoUrl : `${API_URL}${o.logoUrl}`} className="w-[28px] h-[28px] rounded-full object-cover flex-shrink-0"/>
                      ) : (
                        <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 bg-[#e8f5f0] text-[#1a7f5e]">{initials}</div>
                      )}
                      <div>
                        <div className="text-[12px] font-bold text-[#1a1a1a]">{o.name}</div>
                        <div className="text-[10px] text-[#9ca3af]">{o.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={BADGE[o.plan === 'free' || !o.plan ? 'gray' : 'green']}>{PLAN_LABELS[o.plan || 'free']}</span></td>
                  <td className="px-4 py-3 text-[12px] text-[#374151]">{o._count?.shifts || 0}</td>
                  <td className="px-4 py-3 text-[12px] text-[#374151]">{o._count?.bookings || 0}</td>
                  <td className="px-4 py-3 text-[12px] text-[#374151]">{new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-4 py-3 text-[12px] font-bold text-[#1a1a1a]">${monthly}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
