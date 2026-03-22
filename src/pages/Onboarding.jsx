import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center px-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">You're all set!</h1>
          <p className="text-sm text-[#6b7280] mb-8">Your kazi. account is ready. Start posting shifts and finding great dental professionals.</p>
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex items-center gap-3 bg-[#f9f8f6] rounded-xl p-4 text-left">
              <div className="w-9 h-9 bg-[#e8f5f0] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#1a7f5e] font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a]">Post your first shift</p>
                <p className="text-xs text-[#6b7280]">It only takes 2 minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#f9f8f6] rounded-xl p-4 text-left">
              <div className="w-9 h-9 bg-[#e8f5f0] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#1a7f5e] font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a]">Browse professionals</p>
                <p className="text-xs text-[#6b7280]">Find verified dental staff near you</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#f9f8f6] rounded-xl p-4 text-left">
              <div className="w-9 h-9 bg-[#e8f5f0] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#1a7f5e] font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a]">Complete your office profile</p>
                <p className="text-xs text-[#6b7280]">Help professionals know what to expect</p>
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">
            Go to my dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">

      {/* Nav */}
      <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 justify-between">
        <span className="text-[#1a7f5e] font-bold text-2xl">kazi.</span>
        <span className="text-sm text-[#6b7280]">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-[#1a7f5e] font-semibold cursor-pointer">
            Sign in
          </span>
        </span>
      </nav>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 py-6">
        {[
          { n: 1, label: 'Account' },
          { n: 2, label: 'Office Info' },
          { n: 3, label: 'Details & Roles' },
          { n: 4, label: 'Plan' },
        ].map((s) => (
          <div key={s.n} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition
                ${step === s.n ? 'border-[#1a7f5e] text-[#1a7f5e]' : ''}
                ${step > s.n ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : ''}
                ${step < s.n ? 'border-[#e5e7eb] text-[#9ca3af]' : ''}
              `}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className={`text-xs font-semibold whitespace-nowrap ${step === s.n ? 'text-[#1a7f5e]' : 'text-[#9ca3af]'}`}>{s.label}</span>
            </div>
            {s.n < 4 && <div className={`w-12 h-0.5 mb-4 ${step > s.n ? 'bg-[#1a7f5e]' : 'bg-[#e5e7eb]'}`}></div>}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className={`bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full ${step === 4 ? 'max-w-3xl' : 'max-w-md'}`}>

          {/* Step 1 - Account */}
          {step === 1 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 1 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Create your account</h1>
              <p className="text-sm text-[#6b7280] mb-6">Start with your basic info</p>

              <button className="w-full flex items-center justify-center gap-3 py-3 border border-[#e5e7eb] rounded-full text-sm font-semibold text-[#1a1a1a] bg-white hover:border-[#1a7f5e] transition mb-5">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#e5e7eb]"></div>
                <span className="text-xs text-[#9ca3af]">or continue with email</span>
                <div className="flex-1 h-px bg-[#e5e7eb]"></div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Full name</label>
                <input type="text" placeholder="Dr. Jane Smith" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Work email</label>
                <input type="email" placeholder="you@practice.com" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Password</label>
                <input type="password" placeholder="Create a password" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
              </div>

              <button onClick={() => setStep(2)} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">
                Continue →
              </button>
            </div>
          )}

          {/* Step 2 - Office Info */}
          {step === 2 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 2 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Office information</h1>
              <p className="text-sm text-[#6b7280] mb-6">Tell us about your practice</p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Practice name</label>
                <input type="text" placeholder="Bright Smile Dental" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Practice type</label>
                <div className="flex flex-wrap gap-2">
                  {['General', 'Pediatric', 'Orthodontics', 'Periodontics', 'Oral Surgery', 'Endodontics'].map(t => (
                    <button key={t} className="px-3 py-1.5 border border-[#e5e7eb] rounded-full text-xs font-semibold text-[#6b7280] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Street address</label>
                <input type="text" placeholder="123 Main St" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">City</label>
                  <input type="text" placeholder="Houston" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">ZIP code</label>
                  <input type="text" placeholder="77001" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">
                  ← Back
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 3 - Details & Roles */}
          {step === 3 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 3 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Details & roles</h1>
              <p className="text-sm text-[#6b7280] mb-6">Help professionals know what to expect</p>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Roles you typically hire</label>
                <div className="flex flex-wrap gap-2">
                  {['Dental Hygienist', 'Dental Assistant', 'Front Desk', 'Treatment Coordinator', 'Sterilization Tech'].map(r => (
                    <button key={r} className="px-3 py-1.5 border border-[#e5e7eb] rounded-full text-xs font-semibold text-[#6b7280] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Practice software</label>
                <div className="flex flex-wrap gap-2">
                  {['Eaglesoft', 'Dentrix', 'Open Dental', 'Curve Dental'].map(s => (
                    <button key={s} className="px-3 py-1.5 border border-[#e5e7eb] rounded-full text-xs font-semibold text-[#6b7280] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Notes for professionals <span className="text-[#9ca3af] font-normal">(optional)</span></label>
                <textarea placeholder="Any important details about your practice..." className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition resize-none h-24" />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">
                  ← Back
                </button>
                <button onClick={() => setStep(4)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 4 - Plan */}
          {step === 4 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 4 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Choose your plan</h1>
              <p className="text-sm text-[#6b7280] mb-6">Simple pricing. No contracts. Cancel anytime.</p>

              <div className="grid grid-cols-3 gap-4 mb-6">

                {/* Free */}
                <div className="border-2 border-[#e5e7eb] hover:border-[#1a7f5e] rounded-2xl p-4 cursor-pointer transition">
                  <p className="text-2xl font-extrabold text-[#1a7f5e] mb-1">$0/mo</p>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-1">Free</p>
                  <p className="text-xs text-[#6b7280] mb-3">Best for single-location practices</p>
                  <ul className="flex flex-col gap-1">
                    {['Post up to 10 shifts/month', 'Browse verified professionals', 'In-app messaging', 'Basic office profile', 'Email support'].map(f => (
                      <li key={f} className="text-xs text-[#6b7280] flex items-center gap-2">
                        <span className="text-[#1a7f5e] font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pay Per Shift */}
                <div className="border-2 border-[#1a7f5e] rounded-2xl p-4 cursor-pointer transition relative">
                  <span className="absolute -top-3 left-4 bg-[#1a7f5e] text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                  <p className="text-2xl font-extrabold text-[#1a7f5e] mb-1">15% fee</p>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-1">Pay Per Shift</p>
                  <p className="text-xs text-[#6b7280] mb-3">Best for busy or growing practices</p>
                  <ul className="flex flex-col gap-1">
                    {['Unlimited shift postings', 'Rapid Fill — blast invite up to 10 pros', 'Advanced search and filters', 'Saved professionals list', 'Priority matching', 'Ratings and reviews', 'Priority support'].map(f => (
                      <li key={f} className="text-xs text-[#6b7280] flex items-center gap-2">
                        <span className="text-[#1a7f5e] font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Monthly */}
                <div className="border-2 border-[#e5e7eb] hover:border-[#1a7f5e] rounded-2xl p-4 cursor-pointer transition">
                  <p className="text-2xl font-extrabold text-[#1a7f5e] mb-1">$89/mo</p>
                  <p className="text-sm font-bold text-[#1a1a1a] mb-1">Monthly</p>
                  <p className="text-xs text-[#6b7280] mb-3">Best for high-volume practices</p>
                  <ul className="flex flex-col gap-1">
                    {['Unlimited shift postings', 'Rapid Fill — blast invite up to 10 pros', 'Advanced search and filters', 'Saved professionals list', 'Priority matching', 'Ratings and reviews', 'Priority support'].map(f => (
                      <li key={f} className="text-xs text-[#6b7280] flex items-center gap-2">
                        <span className="text-[#1a7f5e] font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">
                  ← Back
                </button>
                <button onClick={() => setDone(true)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">
                  Get started →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}