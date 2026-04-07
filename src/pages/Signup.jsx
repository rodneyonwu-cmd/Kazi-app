import { SignUp } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <nav className="bg-white border-b border-[#e5e7eb] min-h-16 flex flex-col md:flex-row items-center px-4 md:px-6 py-3 md:py-0 md:h-16 gap-2 md:gap-0 justify-between flex-shrink-0">
        <span
          onClick={() => navigate('/')}
          className="text-[#1a7f5e] text-3xl md:text-4xl tracking-tight cursor-pointer"
          style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontWeight: 900, letterSpacing: '-1px' }}
        >
          kazi.
        </span>
        <span className="text-[13px] md:text-sm text-[#6b7280] text-center">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </span>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-6 md:py-12 w-full">
        <SignUp
          routing="hash"
          afterSignUpUrl="/onboarding"
          signInUrl="/login"
          appearance={{
            variables: {
              colorPrimary: '#1a7f5e',
              borderRadius: '12px',
              fontFamily: 'DM Sans, sans-serif',
            }
          }}
        />
      </div>
    </div>
  )
}