import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSignIn } from '@clerk/clerk-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, setActive, isLoaded } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    if (!isLoaded) return

    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        navigate('/dashboard')
      } else {
        setError('Sign-in requires additional steps. Please try again.')
      }
    } catch (err) {
      const message = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid email or password.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSSO = async () => {
    if (!isLoaded) return

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

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
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/onboarding')}
            className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline"
          >
            Sign up free
          </span>
        </span>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-md">

          {/* Header */}
          <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Welcome back</p>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Sign in to kazi.</h1>
          <p className="text-sm text-[#6b7280] mb-6">Enter your credentials to access your account</p>

          {/* Google SSO */}
          <button
            onClick={handleGoogleSSO}
            className="w-full flex items-center justify-center gap-3 py-3 border border-[#e5e7eb] rounded-full text-sm font-semibold text-[#1a1a1a] bg-white hover:border-[#1a7f5e] transition mb-5 shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e5e7eb]" />
            <span className="text-xs text-[#9ca3af]">or</span>
            <div className="flex-1 h-px bg-[#e5e7eb]" />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-[#991b1b] font-medium">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 pr-12 text-sm outline-none focus:border-[#1a7f5e] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151] transition"
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end mb-6">
            <span
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-[#1a7f5e] font-semibold cursor-pointer hover:underline"
            >
              Forgot password?
            </span>
          </div>

          {/* Sign in button */}
          <button
            onClick={handleLogin}
            disabled={loading || !isLoaded}
            className={`w-full font-bold py-3.5 rounded-full text-sm transition flex items-center justify-center gap-2
              ${!loading ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#9ca3af] text-white cursor-not-allowed'}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </>
            )}
          </button>

          {/* Terms */}
          <p className="text-xs text-[#9ca3af] text-center mt-4 leading-relaxed">
            By signing in you agree to kazi.'s{' '}
            <span className="text-[#1a7f5e] cursor-pointer hover:underline">Terms of Service</span>
            {' '}and{' '}
            <span className="text-[#1a7f5e] cursor-pointer hover:underline">Privacy Policy</span>
          </p>

          {/* Sign up link */}
          <p className="text-center text-sm text-[#9ca3af] mt-5">
            Don't have an account?{' '}
            <span
              onClick={() => navigate('/onboarding')}
              className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline"
            >
              Sign up free
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
