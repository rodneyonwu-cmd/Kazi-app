import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// OTP Verification screen — used after both office and provider onboarding
// Props: email (string), onVerified (function), onBack (function)
export default function OTPVerification({ email = 'you@example.com', onVerified, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(600) // 10 min
  const inputs = useRef([])

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (s) => {
    const m = String(Math.floor(s / 60)).padStart(2, '0')
    const sec = String(s % 60).padStart(2, '0')
    return `${m}:${sec}`
  }

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const newOtp = [...otp]
    newOtp[i] = val
    setOtp(newOtp)
    setError('')
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      inputs.current[5]?.focus()
    }
  }

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Please enter the full 6-digit code.'); return }
    setLoading(true)
    setError('')
    // Simulate verification — in production this calls your API
    setTimeout(() => {
      setLoading(false)
      if (onVerified) onVerified()
    }, 1200)
  }

  const handleResend = () => {
    setResent(true)
    setCountdown(600)
    setOtp(['', '', '', '', '', ''])
    inputs.current[0]?.focus()
    setTimeout(() => setResent(false), 4000)
  }

  const allFilled = otp.every(d => d !== '')

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">

      {/* Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 justify-between flex-shrink-0">
        <span className="text-[#1a7f5e] font-bold text-3xl tracking-tight">kazi.</span>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-md">

          {/* Icon */}
          <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
              <rect x="5" y="2" width="14" height="20" rx="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>

          {/* Header */}
          <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2 text-center">Verify your email</p>
          <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-2 text-center">Check your inbox</h2>
          <p className="text-sm text-[#6b7280] mb-6 text-center leading-relaxed">
            We sent a 6-digit code to{' '}
            <strong className="text-[#1a1a1a]">{email}</strong>.
            <br/>Enter it below to verify your account.
          </p>

          {/* Error */}
          {error && (
            <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-[#991b1b] font-medium">{error}</p>
            </div>
          )}

          {/* Resent confirmation */}
          {resent && (
            <div className="bg-[#e8f5f0] border border-[#a7f3d0] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <p className="text-sm text-[#065f46] font-medium">Code resent to {email}</p>
            </div>
          )}

          {/* OTP inputs */}
          <div className="flex gap-3 justify-center mb-4" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className={`w-12 h-14 text-center text-[22px] font-black border-2 rounded-[14px] outline-none transition
                  ${digit ? 'border-[#1a7f5e] bg-[#e8f5f0] text-[#1a7f5e]' : 'border-[#e5e7eb] bg-white text-[#1a1a1a]'}
                  focus:border-[#1a7f5e]`}
              />
            ))}
          </div>

          {/* Countdown + resend */}
          <div className="text-center mb-6">
            {countdown > 0 ? (
              <p className="text-sm text-[#9ca3af]">
                Code expires in{' '}
                <strong className="text-[#1a1a1a]">{formatTime(countdown)}</strong>
              </p>
            ) : (
              <p className="text-sm text-[#9ca3af]">Code expired.</p>
            )}
            <p className="text-sm text-[#9ca3af] mt-1">
              Didn't receive it?{' '}
              <span onClick={handleResend} className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline">
                Resend code
              </span>
            </p>
          </div>

          {/* Verify button */}
          <button
            onClick={handleVerify}
            disabled={!allFilled || loading}
            className={`w-full font-bold py-3.5 rounded-full text-sm transition flex items-center justify-center gap-2
              ${allFilled && !loading
                ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white'
                : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                Verify email
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </>
            )}
          </button>

          {/* Back */}
          {onBack && (
            <button
              onClick={onBack}
              className="w-full mt-3 text-sm text-[#9ca3af] font-semibold hover:text-[#374151] transition"
            >
              ← Go back
            </button>
          )}

          {/* Wrong email */}
          <p className="text-center text-xs text-[#9ca3af] mt-4">
            Wrong email?{' '}
            <span onClick={onBack} className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline">
              Change it
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
