import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import ProviderNav from '../components/ProviderNav'

export default function ProviderSettings() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { openUserProfile } = useClerk()
  const userEmail = user?.primaryEmailAddress?.emailAddress || ''

  const [notifs, setNotifs] = useState({
    shiftInvites: true,
    rapidFill: true,
    messages: true,
    reminders: true,
    marketing: false,
    payouts: true,
  })


  const [pushEnabled, setPushEnabled] = useState(true)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [toast, setToast] = useState(null)
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const Toggle = ({ value, onChange }) => (
    <div onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full cursor-pointer transition-colors flex-shrink-0 relative ${value ? 'bg-[#1a7f5e]' : 'bg-[#d1d5db]'}`}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-5' : 'left-0.5'}`} />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f9f8f6] pb-24 md:pb-8">

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[12px] font-semibold px-4 py-2.5 rounded-full z-[300] flex items-center gap-2 shadow-xl whitespace-nowrap">
          <div className="w-4 h-4 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      <ProviderNav />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <button onClick={() => navigate('/provider-dashboard')} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#9ca3af] hover:text-[#374151] mb-4 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <h1 className="text-[22px] font-black text-[#1a1a1a] mb-1">Settings</h1>
          <p className="text-[13px] text-[#9ca3af]">Manage your account preferences</p>
        </div>

        {/* Notification channels */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 mb-4">
          <p className="text-[15px] font-black text-[#1a1a1a] mb-4">Notification channels</p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-[#1a1a1a]">Push notifications</p>
                <p className="text-[12px] text-[#9ca3af]">Receive alerts on your device</p>
              </div>
              <Toggle value={pushEnabled} onChange={setPushEnabled} />
            </div>
            <div className="h-px bg-[#f3f4f6]" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-[#1a1a1a]">Email notifications</p>
                <p className="text-[12px] text-[#9ca3af]">{userEmail}</p>
              </div>
              <Toggle value={emailEnabled} onChange={setEmailEnabled} />
            </div>
          </div>
        </div>

        {/* Notification types */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] p-5 mb-4">
          <p className="text-[15px] font-black text-[#1a1a1a] mb-4">Notification types</p>
          <div className="flex flex-col gap-4">
            {[
              { key: 'shiftInvites', label: 'Shift invitations', sub: 'When an office invites you to a shift' },
              { key: 'rapidFill', label: 'Rapid Fill alerts', sub: 'Urgent shift openings near you' },
              { key: 'messages', label: 'New messages', sub: 'When an office sends you a message' },
              { key: 'reminders', label: 'Shift reminders', sub: '24 hours before your confirmed shift' },
              { key: 'payouts', label: 'Payout updates', sub: 'When your earnings are processed' },
              { key: 'marketing', label: 'Tips & updates', sub: 'Product news and platform updates' },
            ].map(({ key, label, sub }, i, arr) => (
              <div key={key}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold text-[#1a1a1a]">{label}</p>
                    <p className="text-[12px] text-[#9ca3af]">{sub}</p>
                  </div>
                  <Toggle value={notifs[key]} onChange={v => setNotifs(prev => ({ ...prev, [key]: v }))} />
                </div>
                {i < arr.length - 1 && <div className="h-px bg-[#f3f4f6] mt-4" />}
              </div>
            ))}
          </div>
        </div>

        {/* Account */}
        <div className="bg-white border border-[#e5e7eb] rounded-[18px] overflow-hidden mb-4">
          <p className="text-[15px] font-black text-[#1a1a1a] px-5 py-4 border-b border-[#f3f4f6]">Account</p>
          {[
            { label: 'Change email', sub: userEmail, onClick: () => openUserProfile() },
            { label: 'Change password', sub: 'Update your password', onClick: () => openUserProfile() },
            { label: 'Linked accounts', sub: 'Google', onClick: () => openUserProfile() },
          ].map(({ label, sub, onClick }, i, arr) => (
            <div key={label} onClick={onClick} className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#f9f8f6] transition ${i < arr.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}>
              <div>
                <p className="text-[14px] font-semibold text-[#1a1a1a]">{label}</p>
                <p className="text-[12px] text-[#9ca3af]">{sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-[#fee2e2] rounded-[18px] p-5">
          <p className="text-[15px] font-black text-[#1a1a1a] mb-1">Danger zone</p>
          <p className="text-[12px] text-[#9ca3af] mb-4">These actions are permanent and cannot be undone.</p>
          <div className="flex flex-col gap-2">
            <button onClick={() => showToast('Account deactivation coming soon')} className="w-full border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px] hover:border-[#ef4444] hover:text-[#ef4444] transition">
              Deactivate account
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="w-full bg-[#fee2e2] text-[#991b1b] font-bold py-2.5 rounded-full text-[13px] hover:bg-[#fecaca] transition">
              Delete account
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-[20px] p-6 w-[340px] z-50 shadow-2xl">
            <p className="text-[18px] font-black text-[#1a1a1a] mb-1">Delete account?</p>
            <p className="text-[13px] text-[#9ca3af] mb-5">This will permanently delete your profile, history, and all data. This cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border border-[#e5e7eb] text-[#374151] font-bold py-2.5 rounded-full text-[13px]">Cancel</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-[#ef4444] text-white font-bold py-2.5 rounded-full text-[13px]">Delete</button>
            </div>
          </div>
        </>
      )}

      {/* Mobile toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] flex md:hidden z-50">
        {[
          { label: 'Home', path: '/provider-dashboard', icon: <HomeIcon /> },
          { label: 'Requests', path: '/provider-requests', icon: <ReqIcon /> },
          { label: 'Find Shifts', path: '/provider-find-shifts', icon: <SearchIcon /> },
          { label: 'Messages', path: '/provider-messages', icon: <MsgIcon /> },
          { label: 'Earnings', path: '/provider-earnings', icon: <EarnIcon /> },
        ].map(({ label, path, icon, badge }) => (
          <div key={label} onClick={() => navigate(path)} className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 cursor-pointer">
            <div className="relative"><span className="text-[#9ca3af]">{icon}</span>
              {badge && <span className="absolute -top-1 -right-1.5 bg-[#ef4444] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white">{badge}</span>}
            </div>
            <span className="text-[10px] font-semibold text-[#9ca3af]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HomeIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> }
function ReqIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function SearchIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function MsgIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> }
function EarnIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> }
