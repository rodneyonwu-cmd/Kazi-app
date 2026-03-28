import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = () => {
    if (!email) { setError('Please enter your email address.'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address.'); return }
    setLoading(true)
    setError('')
    // Simulate API call — replace with real call later
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1200)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  // ── Sent state ───────────────────────────────────────────────
  if (sent) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
        <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6">
          <span className="text-[#1a7f5e] text-4xl tracking-tight cursor-pointer" style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",fontWeight:900,letterSpacing:"-1px",WebkitTextStroke:"0.5px #1a7f5e"}} onClick={() => navigate('/')}>kazi.</span>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-md text-center">

            {/* Success icon */}
            <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>

            <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Check your inbox</p>
            <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">Email sent!</h2>
            <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
              We sent a 6-digit reset code to{' '}
              <strong className="text-[#1a1a1a]">{email}</strong>.
              <br/>Enter it on the next screen to reset your password.
            </p>

            <button
              onClick={() => navigate('/reset-password', { state: { email } })}
              className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3.5 rounded-full text-sm transition flex items-center justify-center gap-2 mb-3"
            >
              Enter reset code
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <p className="text-sm text-[#9ca3af]">
              Didn't receive it?{' '}
              <span onClick={() => setSent(false)} className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline">
                Try again
              </span>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── Default state ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">

      {/* Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 justify-between flex-shrink-0">
        <span
          onClick={() => navigate('/')}
          className="text-[#1a7f5e] text-4xl tracking-tight cursor-pointer" style={{fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",fontWeight:900,letterSpacing:"-1px",WebkitTextStroke:"0.5px #1a7f5e"}}
        >
          kazi.
        </span>
        <span className="text-sm text-[#6b7280]">
          Remember it?{' '}
          <span onClick={() => navigate('/login')} className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline">
            Sign in
          </span>
        </span>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-md">

          {/* Back link */}
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#9ca3af] hover:text-[#374151] transition mb-6"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to sign in
          </button>

          {/* Icon */}
          <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          {/* Header */}
          <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2 text-center">Reset password</p>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-2 text-center">Forgot your password?</h1>
          <p className="text-sm text-[#6b7280] mb-6 text-center leading-relaxed">
            No problem. Enter your email and we'll send you a 6-digit code to reset it.
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

          {/* Email input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSend}
            disabled={loading}
            className={`w-full font-bold py-3.5 rounded-full text-sm transition flex items-center justify-center gap-2
              ${!loading ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#9ca3af] text-white cursor-not-allowed'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Sending...
              </>
            ) : (
              <>
                Send reset code
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </>
            )}
          </button>

          <p className="text-center text-sm text-[#9ca3af] mt-5">
            Remembered it?{' '}
            <span onClick={() => navigate('/login')} className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline">
              Sign in
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
