import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">

      <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 justify-between">
        <span className="text-[#1a7f5e] font-bold text-2xl">kazi.</span>
        <span className="text-sm text-[#6b7280]">
          Don't have an account?{' '}
          <span onClick={() => navigate('/onboarding')} className="text-[#1a7f5e] font-semibold cursor-pointer">
            Sign up
          </span>
        </span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-md">

          <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Welcome back</p>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Sign in to kazi.</h1>
          <p className="text-sm text-[#6b7280] mb-7">Enter your credentials to continue</p>

          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center justify-center gap-3 py-3 border border-[#e5e7eb] rounded-full text-sm font-semibold text-[#1a1a1a] bg-white hover:border-[#1a7f5e] transition mb-5">
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[#e5e7eb]"></div>
            <span className="text-xs text-[#9ca3af]">or sign in with email</span>
            <div className="flex-1 h-px bg-[#e5e7eb]"></div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Email address</label>
            <input type="email" placeholder="you@practice.com" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-semibold text-[#1a1a1a]">Password</label>
              <span className="text-xs text-[#1a7f5e] font-semibold cursor-pointer">Forgot password?</span>
            </div>
            <input type="password" placeholder="Enter your password" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
          </div>

          <button onClick={() => navigate('/dashboard')} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition mb-4">
            Sign in →
          </button>

          <p className="text-xs text-[#9ca3af] text-center">
            By signing in you agree to our{' '}
            <span className="text-[#1a7f5e] cursor-pointer">Terms</span> and{' '}
            <span className="text-[#1a7f5e] cursor-pointer">Privacy Policy</span>
          </p>

        </div>
      </div>
    </div>
  )
}