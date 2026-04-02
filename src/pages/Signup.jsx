import { SignUp } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 justify-between flex-shrink-0">
        <span
          onClick={() => navigate('/')}
          className="text-[#1a7f5e] text-4xl tracking-tight cursor-pointer"
          style={{ fontFamily: "'Inter',-apple-system,sans-serif", fontWeight: 900, letterSpacing: '-1px' }}
        >
          kazi.
        </span>
        <span className="text-sm text-[#6b7280]">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-[#1a7f5e] font-semibold cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </span>
      </nav>
      <div className="flex-1 flex items-center justify-center px-4 py-12">
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