import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Settings() {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('office')
  const [toast, setToast] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  // Office Profile state
  const [officeName, setOfficeName] = useState('Evolve Dentistry')
  const [officePhone, setOfficePhone] = useState('832-440-1144')
  const [officeAddress, setOfficeAddress] = useState('123 Dental Way')
  const [officeCity, setOfficeCity] = useState('Missouri City')
  const [officeState, setOfficeState] = useState('TX')
  const [officeZip, setOfficeZip] = useState('77459')
  const [officeWebsite, setOfficeWebsite] = useState('www.evolvedentistry.com')
  const [officeSpecialty, setOfficeSpecialty] = useState('General Dentistry')
  const [officeBio, setOfficeBio] = useState('A modern, patient-focused dental practice serving the Missouri City and Houston area. We pride ourselves on clinical excellence and a warm, welcoming environment.')

  // Notifications state
  const [notifBookings, setNotifBookings] = useState(true)
  const [notifApplicants, setNotifApplicants] = useState(true)
  const [notifMessages, setNotifMessages] = useState(true)
  const [notifReviews, setNotifReviews] = useState(true)
  const [notifReminders, setNotifReminders] = useState(true)
  const [notifPromoEmail, setNotifPromoEmail] = useState(false)
  const [notifSMS, setNotifSMS] = useState(true)
  const [notifEmail, setNotifEmail] = useState(true)

  // Account state
  const [currentEmail] = useState('rodney@evolvedentistry.com')
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Team members state
  const [teamMembers] = useState([
    { id: 1, name: 'Rodney O.', role: 'Owner / Lead Dentist', email: 'rodney@evolvedentistry.com', access: 'Admin', avatar: 'RO' },
    { id: 2, name: 'Tyree A.', role: 'Dental Assistant', email: 'tyree@evolvedentistry.com', access: 'Staff', avatar: 'TA' },
    { id: 3, name: 'Dee M.', role: 'Dental Assistant', email: 'dee@evolvedentistry.com', access: 'Staff', avatar: 'DM' },
    { id: 4, name: 'Lu P.', role: 'Dental Assistant', email: 'lu@evolvedentistry.com', access: 'Staff', avatar: 'LP' },
  ])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Staff')

  // Billing state
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardNumber, setNewCardNumber] = useState('')
  const [newCardExpiry, setNewCardExpiry] = useState('')
  const [newCardCVC, setNewCardCVC] = useState('')
  const [newCardName, setNewCardName] = useState('')
  const [invoiceFilter, setInvoiceFilter] = useState('All')

  const invoices = [
    { date: 'Mar 17, 2026', desc: 'Platform fee · Mar 17 shift', sub: 'Dental Hygienist · Sarah R.', amount: '$70.20', status: 'Paid', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
    { date: 'Mar 10, 2026', desc: 'Platform fee · Mar 10 shift', sub: 'Dental Assistant · Devon K.', amount: '$57.30', status: 'Paid', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
    { date: 'Mar 5, 2026', desc: 'Platform fee · Mar 5 shift', sub: 'Dental Hygienist · Nina P.', amount: '$0.00', status: 'Cancelled', statusStyle: 'bg-[#fef2f2] text-[#dc2626]' },
    { date: 'Feb 28, 2026', desc: 'Platform fee · Feb 28 shift', sub: 'Dental Hygienist · Aisha L.', amount: '$82.50', status: 'Paid', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
    { date: 'Feb 14, 2026', desc: 'Platform fee · Feb 14 shift', sub: 'Dental Assistant · Tara C.', amount: '$48.00', status: 'Paid', statusStyle: 'bg-[#e8f5f0] text-[#1a7f5e]' },
  ]

  const filteredInvoices = invoiceFilter === 'All' ? invoices : invoices.filter(i => i.date.startsWith(invoiceFilter))

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const navItems = [
    { id: 'office', label: 'Office Profile', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'notifications', label: 'Notifications', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
    { id: 'team', label: 'Team Members', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'billing', label: 'Billing & Plan', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { id: 'account', label: 'Email & Password', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
    { id: 'danger', label: 'Delete Account', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> },
  ]

  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} className={'relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ' + (value ? 'bg-[#1a7f5e]' : 'bg-[#d1d5db]')}>
      <div className={'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ' + (value ? 'translate-x-5' : 'translate-x-0.5')}></div>
    </button>
  )

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 pt-6 pb-4 border-b border-[#e5e7eb]">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h2 className="text-lg font-extrabold text-[#1a1a1a] text-center">Delete Account</h2>
              <p className="text-sm text-[#6b7280] text-center mt-1">This action is permanent and cannot be undone. All your data, bookings, and history will be deleted.</p>
            </div>
            <div className="px-6 py-5">
              <p className="text-xs font-bold text-[#1a1a1a] mb-2">Type <span className="text-red-500 font-extrabold">DELETE</span> to confirm</p>
              <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE here" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">Cancel</button>
                <button onClick={() => { if (deleteConfirm === 'DELETE') { setShowDeleteModal(false); setDeleteConfirm(''); showToast('Account deletion requested') } }} className={'flex-1 font-bold py-3 rounded-full text-sm transition ' + (deleteConfirm === 'DELETE' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed')}>
                  Delete my account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[860px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6 items-start">

          {/* LEFT NAV */}
          <div className="hidden md:block w-[220px] flex-shrink-0 sticky top-24">
            <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
              <div className="px-4 py-4 border-b border-[#e5e7eb]">
                <p className="text-xs font-extrabold text-[#9ca3af] uppercase tracking-widest">Settings</p>
              </div>
              <div className="p-2">
                {navItems.map(item => (
                  <button key={item.id} onClick={() => setActiveSection(item.id)} className={'w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition ' + (activeSection === item.id ? (item.id === 'danger' ? 'bg-red-50 text-red-500' : 'bg-[#e8f5f0] text-[#1a7f5e]') : (item.id === 'danger' ? 'text-red-400 hover:bg-red-50' : 'text-[#374151] hover:bg-[#f9f8f6]'))}>
                    <span className={activeSection === item.id ? (item.id === 'danger' ? 'text-red-500' : 'text-[#1a7f5e]') : (item.id === 'danger' ? 'text-red-400' : 'text-[#9ca3af]')}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MOBILE NAV */}
          <div className="md:hidden w-full mb-4 overflow-x-auto">
            <div className="flex gap-2 pb-1">
              {navItems.map(item => (
                <button key={item.id} onClick={() => setActiveSection(item.id)} className={'flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold border transition ' + (activeSection === item.id ? (item.id === 'danger' ? 'bg-red-50 text-red-500 border-red-200' : 'bg-[#e8f5f0] text-[#1a7f5e] border-[#1a7f5e]') : (item.id === 'danger' ? 'text-red-400 border-[#e5e7eb]' : 'text-[#374151] border-[#e5e7eb]'))}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* ── OFFICE PROFILE ── */}
            {activeSection === 'office' && (
              <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
                <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-4">Office Profile</h2>
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[#e5e7eb]">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-extrabold text-xl">ED</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a1a1a] mb-1">Office Logo</p>
                    <p className="text-xs text-[#6b7280] mb-2">PNG or JPG, max 2MB</p>
                    <button className="text-xs font-bold text-[#1a7f5e] border border-[#1a7f5e] px-3 py-1.5 rounded-full hover:bg-[#e8f5f0] transition">Upload logo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Office Name</label>
                    <input value={officeName} onChange={e => setOfficeName(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Phone</label>
                    <input value={officePhone} onChange={e => setOfficePhone(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Specialty</label>
                    <select value={officeSpecialty} onChange={e => setOfficeSpecialty(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]">
                      <option>General Dentistry</option>
                      <option>Cosmetic Dentistry</option>
                      <option>Orthodontics</option>
                      <option>Periodontics</option>
                      <option>Oral Surgery</option>
                      <option>Pediatric Dentistry</option>
                      <option>Endodontics</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Website</label>
                    <input value={officeWebsite} onChange={e => setOfficeWebsite(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Street Address</label>
                  <input value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]" />
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">City</label>
                    <input value={officeCity} onChange={e => setOfficeCity(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">State</label>
                    <input value={officeState} onChange={e => setOfficeState(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">ZIP</label>
                    <input value={officeZip} onChange={e => setOfficeZip(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]" />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Office Bio</label>
                  <textarea value={officeBio} onChange={e => setOfficeBio(e.target.value)} rows={3} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a] resize-none" />
                </div>
                <button onClick={() => showToast('Office profile saved!')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition">Save changes</button>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeSection === 'notifications' && (
              <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
                <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-4">Notification Preferences</h2>
                <div className="mb-5 pb-5 border-b border-[#e5e7eb]">
                  <p className="text-xs font-extrabold text-[#9ca3af] uppercase tracking-widest mb-3">Delivery Channels</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'Email notifications', sub: 'Receive updates to rodney@evolvedentistry.com', val: notifEmail, set: setNotifEmail },
                      { label: 'SMS notifications', sub: 'Receive text messages to 832-440-1144', val: notifSMS, set: setNotifSMS },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div><p className="text-sm font-semibold text-[#1a1a1a]">{item.label}</p><p className="text-xs text-[#6b7280]">{item.sub}</p></div>
                        <Toggle value={item.val} onChange={item.set} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-5 pb-5 border-b border-[#e5e7eb]">
                  <p className="text-xs font-extrabold text-[#9ca3af] uppercase tracking-widest mb-3">Activity</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: 'Bookings', sub: 'Requests, confirmations, and cancellations', val: notifBookings, set: setNotifBookings },
                      { label: 'Applicants', sub: 'When someone applies to one of your shifts', val: notifApplicants, set: setNotifApplicants },
                      { label: 'Messages', sub: 'When a professional sends you a message', val: notifMessages, set: setNotifMessages },
                      { label: 'Reviews', sub: 'When a professional leaves you a review', val: notifReviews, set: setNotifReviews },
                      { label: 'Shift reminders', sub: '24 hours before an upcoming shift', val: notifReminders, set: setNotifReminders },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div><p className="text-sm font-semibold text-[#1a1a1a]">{item.label}</p><p className="text-xs text-[#6b7280]">{item.sub}</p></div>
                        <Toggle value={item.val} onChange={item.set} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <p className="text-xs font-extrabold text-[#9ca3af] uppercase tracking-widest mb-3">Marketing</p>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-semibold text-[#1a1a1a]">Promotional emails</p><p className="text-xs text-[#6b7280]">Tips, new features, and kazi. updates</p></div>
                    <Toggle value={notifPromoEmail} onChange={setNotifPromoEmail} />
                  </div>
                </div>
                <button onClick={() => showToast('Notification preferences saved!')} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition">Save preferences</button>
              </div>
            )}

            {/* ── TEAM MEMBERS ── */}
            {activeSection === 'team' && (
              <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-extrabold text-[#1a1a1a]">Team Members</h2>
                  <button onClick={() => setShowInviteForm(!showInviteForm)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-4 py-2 rounded-full text-xs transition flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Invite member
                  </button>
                </div>
                {showInviteForm && (
                  <div className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-2xl p-4 mb-4">
                    <p className="text-xs font-extrabold text-[#9ca3af] uppercase tracking-widest mb-3">Invite New Member</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Email</label>
                        <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="name@evolvedentistry.com" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1a7f5e] bg-white" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Access Level</label>
                        <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1a7f5e] bg-white">
                          <option>Staff</option>
                          <option>Manager</option>
                          <option>Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowInviteForm(false)} className="border border-[#e5e7eb] text-[#1a1a1a] font-bold px-4 py-2 rounded-full text-xs hover:border-[#1a7f5e] transition">Cancel</button>
                      <button onClick={() => { setShowInviteForm(false); setInviteEmail(''); showToast('Invite sent!') }} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-4 py-2 rounded-full text-xs transition">Send invite</button>
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-3 border border-[#e5e7eb] rounded-2xl bg-[#f9f8f6]">
                      <div className="w-10 h-10 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-extrabold">{member.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1a1a1a]">{member.name}</p>
                        <p className="text-xs text-[#6b7280]">{member.role} · {member.email}</p>
                      </div>
                      <span className={'text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ' + (member.access === 'Admin' ? 'bg-[#ede9fe] text-[#5b21b6]' : member.access === 'Manager' ? 'bg-[#e8f5f0] text-[#1a7f5e]' : 'bg-[#f3f4f6] text-[#374151]')}>
                        {member.access}
                      </span>
                      {member.access !== 'Admin' && (
                        <button onClick={() => showToast(member.name + ' removed')} className="text-[#9ca3af] hover:text-red-400 transition text-xs ml-1">✕</button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 bg-[#f9f8f6] border border-[#e5e7eb] rounded-xl p-3">
                  <p className="text-xs text-[#6b7280]"><span className="font-bold text-[#1a1a1a]">Admin</span> — full access · <span className="font-bold text-[#1a1a1a]">Manager</span> — can book and message · <span className="font-bold text-[#1a1a1a]">Staff</span> — view only</p>
                </div>
              </div>
            )}

            {/* ── BILLING & PLAN ── */}
            {activeSection === 'billing' && (
              <>
                {/* Current plan hero */}
                <div className="rounded-2xl p-6" style={{ background: '#1a7f5e' }}>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,.6)' }}>Current Plan</p>
                      <p className="text-2xl font-extrabold text-white mb-1">Pay Per Shift</p>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,.65)' }}>15% per confirmed shift · No monthly fee</p>
                    </div>
                    <div className="rounded-xl p-3 text-right" style={{ background: 'rgba(255,255,255,.15)' }}>
                      <p className="text-[11px] font-bold mb-0.5" style={{ color: 'rgba(255,255,255,.6)' }}>This month</p>
                      <p className="text-2xl font-extrabold text-white">$127.50</p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,.5)' }}>fees paid</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => showToast('Plan upgrade coming soon!')} className="bg-white text-[#1a7f5e] font-bold px-5 py-2 rounded-full text-sm hover:bg-[#f0faf6] transition">Upgrade plan</button>
                    <button onClick={() => showToast('Plan options loaded')} className="font-bold px-5 py-2 rounded-full text-sm text-white transition" style={{ background: 'rgba(255,255,255,.15)' }}>View all plans</button>
                  </div>
                </div>

                {/* Plan comparison */}
                <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#e5e7eb]">
                    <h2 className="text-sm font-extrabold text-[#1a1a1a]">Compare plans</h2>
                  </div>
                  <div className="grid grid-cols-3">
                    {/* Free */}
                    <div className="p-5 border-r border-[#f3f4f6]">
                      <p className="text-sm font-extrabold text-[#1a1a1a] mb-1">Free</p>
                      <p className="text-2xl font-extrabold text-[#1a1a1a] mb-4">$0<span className="text-xs font-normal text-[#9ca3af]">/mo</span></p>
                      <ul className="flex flex-col gap-2">
                        {['10 shifts/mo','Browse pros','Messaging'].map(f => <li key={f} className="text-xs text-[#6b7280] flex items-start gap-1.5"><span className="text-[#1a7f5e] font-bold flex-shrink-0">✓</span>{f}</li>)}
                        {['Rapid Fill'].map(f => <li key={f} className="text-xs text-[#d1d5db] flex items-start gap-1.5"><span className="flex-shrink-0">✗</span>{f}</li>)}
                      </ul>
                    </div>
                    {/* Pay Per Shift - current */}
                    <div className="p-5 border-r border-[#c6e6d9] bg-[#f0faf5] relative">
                      <div className="absolute -top-px left-1/2 -translate-x-1/2 bg-[#1a7f5e] text-white text-[10px] font-extrabold px-3 py-0.5 rounded-b-lg">CURRENT</div>
                      <p className="text-sm font-extrabold text-[#1a1a1a] mb-1 mt-2">Pay Per Shift</p>
                      <p className="text-2xl font-extrabold text-[#1a1a1a] mb-4">15%<span className="text-xs font-normal text-[#9ca3af]"> fee</span></p>
                      <ul className="flex flex-col gap-2">
                        {['Unlimited shifts','Rapid Fill','Priority match','Priority support'].map(f => <li key={f} className="text-xs text-[#6b7280] flex items-start gap-1.5"><span className="text-[#1a7f5e] font-bold flex-shrink-0">✓</span>{f}</li>)}
                      </ul>
                    </div>
                    {/* Monthly */}
                    <div className="p-5">
                      <p className="text-sm font-extrabold text-[#1a1a1a] mb-1">Monthly</p>
                      <p className="text-2xl font-extrabold text-[#1a1a1a] mb-4">$89<span className="text-xs font-normal text-[#9ca3af]">/mo</span></p>
                      <ul className="flex flex-col gap-2 mb-4">
                        {['Unlimited shifts','Rapid Fill','Priority match','No per-shift fee'].map(f => <li key={f} className="text-xs text-[#6b7280] flex items-start gap-1.5"><span className="text-[#1a7f5e] font-bold flex-shrink-0">✓</span>{f}</li>)}
                      </ul>
                      <button onClick={() => showToast('Upgrading to Monthly plan...')} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2 rounded-full text-xs transition">Upgrade →</button>
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-extrabold text-[#1a1a1a]">Payment method</h2>
                    <button onClick={() => setShowAddCard(!showAddCard)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-4 py-2 rounded-full text-xs transition flex items-center gap-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add card
                    </button>
                  </div>

                  {/* Existing card */}
                  <div className="flex items-center gap-3 p-3 bg-[#f0faf5] border border-[#1a7f5e] rounded-2xl mb-3">
                    <div className="w-10 h-7 bg-[#1a7f5e] rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[9px] font-extrabold">VISA</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1a1a1a]">Visa ending in 4521</p>
                      <p className="text-xs text-[#6b7280]">Expires 09/27</p>
                    </div>
                    <span className="text-xs font-bold text-[#1a7f5e] bg-[#e8f5f0] px-2.5 py-1 rounded-full">Default</span>
                    <button onClick={() => showToast('Edit card coming soon')} className="text-xs font-semibold text-[#6b7280] hover:text-[#1a7f5e] transition ml-1">Edit</button>
                  </div>

                  {/* Add card form */}
                  {showAddCard && (
                    <div className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-2xl p-4">
                      <p className="text-xs font-extrabold text-[#9ca3af] uppercase tracking-widest mb-3">New Card</p>
                      <div className="mb-3">
                        <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Name on card</label>
                        <input value={newCardName} onChange={e => setNewCardName(e.target.value)} placeholder="Rodney Onwu" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white" />
                      </div>
                      <div className="mb-3">
                        <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Card number</label>
                        <input value={newCardNumber} onChange={e => setNewCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Expiry</label>
                          <input value={newCardExpiry} onChange={e => setNewCardExpiry(e.target.value)} placeholder="MM / YY" maxLength={7} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">CVC</label>
                          <input value={newCardCVC} onChange={e => setNewCardCVC(e.target.value)} placeholder="123" maxLength={4} className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setShowAddCard(false); setNewCardNumber(''); setNewCardExpiry(''); setNewCardCVC(''); setNewCardName('') }} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-xs hover:border-[#1a7f5e] transition">Cancel</button>
                        <button onClick={() => { setShowAddCard(false); setNewCardNumber(''); setNewCardExpiry(''); setNewCardCVC(''); setNewCardName(''); showToast('Card added!') }} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-2.5 rounded-full text-xs transition">Save card</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing history */}
                <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-[#1a1a1a]">Billing history</h2>
                    <div className="flex items-center gap-2">
                      <select value={invoiceFilter} onChange={e => setInvoiceFilter(e.target.value)} className="border border-[#e5e7eb] rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#1a7f5e] bg-white text-[#374151] font-semibold">
                        <option value="All">All time</option>
                        <option value="Mar">March 2026</option>
                        <option value="Feb">February 2026</option>
                      </select>
                      <button onClick={() => showToast('Downloading all invoices...')} className="border border-[#e5e7eb] text-[#6b7280] font-bold px-3 py-1.5 rounded-xl text-xs hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">Download all</button>
                    </div>
                  </div>
                  <div>
                    {filteredInvoices.length === 0 ? (
                      <p className="text-sm text-[#9ca3af] text-center py-8">No invoices for this period</p>
                    ) : filteredInvoices.map((invoice, i) => (
                      <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-[#f3f4f6] last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-[#1a1a1a]">{invoice.desc}</p>
                          <p className="text-xs text-[#9ca3af]">{invoice.sub}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-extrabold text-[#1a1a1a]">{invoice.amount}</span>
                          <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + invoice.statusStyle}>{invoice.status}</span>
                          <button onClick={() => showToast('Invoice downloaded!')} className="text-[#9ca3af] hover:text-[#1a7f5e] transition">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cancel plan */}
                <div className="bg-white border border-[#fecaca] rounded-2xl p-5">
                  <p className="text-sm font-extrabold text-[#dc2626] mb-2">Cancel subscription</p>
                  <p className="text-sm text-[#6b7280] leading-relaxed mb-4">Cancelling will revert your account to the Free plan at the end of your billing cycle. You won't lose any data.</p>
                  <button onClick={() => showToast('Plan cancellation requested')} className="bg-[#fee2e2] text-[#dc2626] font-bold px-5 py-2.5 rounded-full text-sm hover:bg-[#fecaca] transition">Cancel plan</button>
                </div>
              </>
            )}

            {/* ── EMAIL & PASSWORD ── */}
            {activeSection === 'account' && (
              <>
                <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
                  <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-4">Email Address</h2>
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Current Email</label>
                    <input value={currentEmail} disabled className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm bg-[#f9f8f6] text-[#6b7280] outline-none" />
                  </div>
                  <div className="mb-5">
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">New Email</label>
                    <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Enter new email address" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white text-[#1a1a1a]" />
                  </div>
                  <button onClick={() => { if (newEmail) { showToast('Email updated!'); setNewEmail('') } else showToast('Please enter a new email') }} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition">Update email</button>
                </div>
                <div className="bg-white border border-[#e5e7eb] rounded-2xl p-5">
                  <h2 className="text-sm font-extrabold text-[#1a1a1a] mb-4">Change Password</h2>
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Current Password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white" />
                  </div>
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 8 characters" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white" />
                  </div>
                  <div className="mb-5">
                    <label className="block text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1.5">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#1a7f5e] bg-white" />
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500 font-semibold mb-3">Passwords do not match</p>
                  )}
                  <button onClick={() => { if (!currentPassword) { showToast('Please enter your current password'); return } if (newPassword !== confirmPassword) { showToast('Passwords do not match'); return } if (newPassword.length < 8) { showToast('Password must be at least 8 characters'); return } showToast('Password updated!'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword('') }} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-6 py-2.5 rounded-full text-sm transition">Update password</button>
                </div>
              </>
            )}

            {/* ── DELETE ACCOUNT ── */}
            {activeSection === 'danger' && (
              <div className="bg-white border border-red-200 rounded-2xl p-5">
                <h2 className="text-sm font-extrabold text-red-500 mb-2">Delete Account</h2>
                <p className="text-sm text-[#6b7280] leading-relaxed mb-4">Permanently delete your kazi. account and all associated data including bookings, messages, team members, and billing history. This action <span className="font-bold text-[#1a1a1a]">cannot be undone</span>.</p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-5">
                  <p className="text-xs text-red-500 font-semibold">⚠ All active bookings will be cancelled and your team will lose access immediately.</p>
                </div>
                <button onClick={() => setShowDeleteModal(true)} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition">Delete my account</button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
