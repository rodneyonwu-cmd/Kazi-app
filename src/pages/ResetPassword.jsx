import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || 'you@example.com'

  const [step, setStep] = useState('otp') // 'otp' | 'password' | 'done'

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const [countdown, setCountdown] = useState(600)
  const inputs = useRef([])

  // Password state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    if (step === 'otp') inputs.current[0]?.focus()
    const timer = setInterval(() => setCountdown(p => p > 0 ? p - 1 : 0), 1000)
    return () => clearInterval(timer)
  }, [step])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  // OTP handlers
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next); setOtpError('')
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (p.length === 6) { setOtp(p.split('')); inputs.current[5]?.focus() }
  }

  const handleVerifyOtp = () => {
    if (otp.join('').length < 6) { setOtpError('Please enter the full 6-digit code.'); return }
    setOtpLoading(true)
    setTimeout(() => { setOtpLoading(false); setStep('password') }, 1200)
  }

  const handleResend = () => {
    setResent(true); setCountdown(600); setOtp(['', '', '', '', '', ''])
    inputs.current[0]?.focus()
    setTimeout(() => setResent(false), 4000)
  }

  // Password strength
  const getStrength = (val) => {
    if (!val) return { score: 0, label: '', color: '' }
    const checks = [val.length >= 8, /[A-Z]/.test(val), /[0-9]/.test(val), /[^a-zA-Z0-9]/.test(val)]
    const score = checks.filter(Boolean).length
    if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' }
    if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' }
    if (score === 3) return { score: 3, label: 'Good', color: '#1a7f5e' }
    return { score: 4, label: 'Strong', color: '#1a7f5e' }
  }

  const strength = getStrength(newPassword)

  const handleSetPassword = () => {
    if (!newPassword) { setPwError('Please enter a new password.'); return }
    if (newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return }
    setPwLoading(true); setPwError('')
    setTimeout(() => { setPwLoading(false); setStep('done') }, 1200)
  }

  const allOtpFilled = otp.every(d => d !== '')

  // ── Done screen ──────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
        <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6">
          <span className="text-[#1a7f5e] text-4xl tracking-tight" style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",fontWeight:900,letterSpacing:"-1px",WebkitTextStroke:"0.5px #1a7f5e"}}>kazi.</span>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-md text-center">
            <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">All done</p>
            <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">Password updated!</h2>
            <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
              Your password has been successfully reset. You can now sign in with your new password.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3.5 rounded-full text-sm transition flex items-center justify-center gap-2"
            >
              Sign in now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">

      {/* Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 justify-between flex-shrink-0">
        <span className="text-[#1a7f5e] text-4xl tracking-tight cursor-pointer" style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",fontWeight:900,letterSpacing:"-1px",WebkitTextStroke:"0.5px #1a7f5e"}} onClick={() => navigate('/')}>kazi.</span>
        <span className="text-sm text-[#6b7280]">
          Remember it?{' '}
          <span onClick={() => navigate('/login')} className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline">Sign in</span>
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-md">

          {/* ── OTP Step ── */}
          {step === 'otp' && (
            <>
              <button onClick={() => navigate('/forgot-password')} className="flex items-center gap-1.5 text-sm font-semibold text-[#9ca3af] hover:text-[#374151] transition mb-6">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back
              </button>

              <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
                </svg>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2 text-center">Verification</p>
              <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-2 text-center">Enter your code</h2>
              <p className="text-sm text-[#6b7280] mb-6 text-center leading-relaxed">
                We sent a 6-digit code to <strong className="text-[#1a1a1a]">{email}</strong>
              </p>

              {otpError && (
                <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-sm text-[#991b1b] font-medium">{otpError}</p>
                </div>
              )}

              {resent && (
                <div className="bg-[#e8f5f0] border border-[#a7f3d0] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
                  <p className="text-sm text-[#065f46] font-medium">Code resent to {email}</p>
                </div>
              )}

              <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => inputs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-[22px] font-black border-2 rounded-[14px] outline-none transition
                      ${digit ? 'border-[#1a7f5e] bg-[#e8f5f0] text-[#1a7f5e]' : 'border-[#e5e7eb] bg-white text-[#1a1a1a]'}
                      focus:border-[#1a7f5e]`}
                  />
                ))}
              </div>

              <div className="text-center mb-6">
                {countdown > 0
                  ? <p className="text-sm text-[#9ca3af]">Code expires in <strong className="text-[#1a1a1a]">{fmt(countdown)}</strong></p>
                  : <p className="text-sm text-[#ef4444] font-medium">Code expired.</p>
                }
                <p className="text-sm text-[#9ca3af] mt-1">
                  Didn't receive it?{' '}
                  <span onClick={handleResend} className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline">Resend code</span>
                </p>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={!allOtpFilled || otpLoading}
                className={`w-full font-bold py-3.5 rounded-full text-sm transition flex items-center justify-center gap-2
                  ${allOtpFilled && !otpLoading ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}
              >
                {otpLoading ? (
                  <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Verifying...</>
                ) : (
                  <>Verify code <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></>
                )}
              </button>
            </>
          )}

          {/* ── New Password Step ── */}
          {step === 'password' && (
            <>
              <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2 text-center">New password</p>
              <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-2 text-center">Set a new password</h2>
              <p className="text-sm text-[#6b7280] mb-6 text-center">Choose a strong password for your kazi. account</p>

              {pwError && (
                <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-sm text-[#991b1b] font-medium">{pwError}</p>
                </div>
              )}

              {/* New password */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">New password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPwError('') }}
                    placeholder="••••••••"
                    className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-[#1a7f5e] transition"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition">
                    {showNew
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>

                {/* Strength meter */}
                {newPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i <= strength.score ? strength.color : '#e5e7eb' }} />
                      ))}
                    </div>
                    <p className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Confirm new password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setPwError('') }}
                    placeholder="••••••••"
                    className={`w-full border rounded-xl px-4 py-3 pr-12 text-sm outline-none transition
                      ${confirmPassword && newPassword !== confirmPassword ? 'border-[#ef4444] focus:border-[#ef4444]' : 'border-[#e5e7eb] focus:border-[#1a7f5e]'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition">
                    {showConfirm
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-[#ef4444] font-medium mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-[#1a7f5e] font-medium mt-1 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Requirements */}
              <div className="bg-[#f9f8f6] border border-[#e5e7eb] rounded-xl p-3 mb-5">
                <p className="text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-2">Requirements</p>
                {[
                  { label: 'At least 8 characters', met: newPassword.length >= 8 },
                  { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
                  { label: 'One number', met: /[0-9]/.test(newPassword) },
                ].map(req => (
                  <div key={req.label} className={`flex items-center gap-2 text-xs mb-1 ${req.met ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}`}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    {req.label}
                  </div>
                ))}
              </div>

              <button
                onClick={handleSetPassword}
                disabled={pwLoading}
                className={`w-full font-bold py-3.5 rounded-full text-sm transition flex items-center justify-center gap-2
                  ${!pwLoading ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#9ca3af] text-white cursor-not-allowed'}`}
              >
                {pwLoading ? (
                  <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Updating...</>
                ) : (
                  <>Set new password <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg></>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
