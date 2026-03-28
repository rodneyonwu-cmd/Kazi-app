import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const logoStyle = {
  fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
  fontSize: '36px',
  fontWeight: 900,
  letterSpacing: '-1px',
  WebkitTextStroke: '0.5px #1a7f5e',
}

// ── Segmented progress bar ───────────────────────────────────────
const ProgressBar = ({ step, total, label }) => (
  <div className="px-6 pt-4 pb-1 max-w-[520px] mx-auto w-full">
    <div className="flex gap-[5px] mb-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex-1 h-[3px] rounded-full transition-all duration-300"
          style={{ background: i < step ? '#1a7f5e' : '#e5e7eb' }} />
      ))}
    </div>
    <div className="flex items-center justify-between">
      <span className="text-[12px] font-bold text-[#9ca3af]">Step {step} of {total}</span>
      <span className="text-[13px] font-extrabold text-[#1a7f5e]">{label}</span>
    </div>
  </div>
)

// ── OTP Step ─────────────────────────────────────────────────────
function OTPStep({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(600)
  const inputs = useRef([])

  useEffect(() => {
    inputs.current[0]?.focus()
    const timer = setInterval(() => setCountdown(p => p > 0 ? p - 1 : 0), 1000)
    return () => clearInterval(timer)
  }, [])

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next); setError('')
    if (val && i < 5) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (p.length === 6) { setOtp(p.split('')); inputs.current[5]?.focus() }
  }

  const handleVerify = () => {
    if (otp.join('').length < 6) { setError('Please enter the full 6-digit code.'); return }
    setLoading(true); setError('')
    setTimeout(() => { setLoading(false); onVerified() }, 1200)
  }

  const handleResend = () => {
    setResent(true); setCountdown(600); setOtp(['', '', '', '', '', ''])
    inputs.current[0]?.focus()
    setTimeout(() => setResent(false), 4000)
  }

  const allFilled = otp.every(d => d !== '')

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7 w-full max-w-[480px]">
        <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round">
            <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
        </div>
        <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5 text-center">One last step</p>
        <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 text-center leading-tight">Verify your email</h2>
        <p className="text-[15px] text-[#6b7280] mb-6 text-center leading-relaxed">
          We sent a 6-digit code to <strong className="text-[#1a1a1a]">{email}</strong>.<br/>
          Enter it below to activate your account.
        </p>

        {error && (
          <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p className="text-sm text-[#991b1b] font-medium">{error}</p>
          </div>
        )}

        {resent && (
          <div className="bg-[#e8f5f0] border border-[#a7f3d0] rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
            <p className="text-sm text-[#065f46] font-medium">Code resent to {email}</p>
          </div>
        )}

        <div className="flex gap-2.5 justify-center mb-4" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input key={i} ref={el => inputs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-[50px] h-[58px] text-center text-[24px] font-black border-2 rounded-[14px] outline-none transition
                ${digit ? 'border-[#1a7f5e] bg-[#e8f5f0] text-[#1a7f5e]' : 'border-[#e5e7eb] bg-white text-[#1a1a1a]'}
                focus:border-[#1a7f5e]`}
            />
          ))}
        </div>

        <div className="text-center mb-5">
          {countdown > 0
            ? <p className="text-[13px] text-[#9ca3af]">Code expires in <strong className="text-[#1a1a1a]">{fmt(countdown)}</strong></p>
            : <p className="text-[13px] text-[#ef4444] font-medium">Code expired.</p>}
          <p className="text-[13px] text-[#9ca3af] mt-1">Didn't receive it?{' '}
            <span onClick={handleResend} className="text-[#1a7f5e] font-bold cursor-pointer hover:underline">Resend code</span>
          </p>
        </div>

        <button onClick={handleVerify} disabled={!allFilled || loading}
          className={`w-full font-extrabold py-[15px] rounded-full text-[16px] transition flex items-center justify-center gap-2
            ${allFilled && !loading ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed'}`}>
          {loading
            ? <><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Verifying...</>
            : 'Verify & activate account →'}
        </button>
        <button onClick={onBack} className="w-full mt-3 text-[14px] text-[#9ca3af] font-bold hover:text-[#374151] transition bg-transparent border-none cursor-pointer">
          ← Go back
        </button>
      </div>
    </div>
  )
}

// ── Main Onboarding ──────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('office')
  const [showOTP, setShowOTP] = useState(false)
  const [done, setDone] = useState(false)

  // Office state
  const [officeEmail, setOfficeEmail] = useState('')
  const [selectedPracticeTypes, setSelectedPracticeTypes] = useState(['General Dentistry'])
  const [selectedSoftware, setSelectedSoftware] = useState(['Eaglesoft'])
  const [selectedRoles, setSelectedRoles] = useState(['Dental Hygienist', 'Dental Assistant'])
  const [selectedPlan, setSelectedPlan] = useState('pps')

  // Provider state
  const [proStep, setProStep] = useState(1)
  const [proEmail, setProEmail] = useState('')
  const [profession, setProfession] = useState('')
  const [specialistType, setSpecialistType] = useState('')
  const [workPreference, setWorkPreference] = useState([])
  const [selectedCerts, setSelectedCerts] = useState([])
  const [selectedSW, setSelectedSW] = useState([])
  const [proRateType, setProRateType] = useState('hourly')

  const toggleItem = (item, list, setList) => {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  const currentEmail = role === 'office' ? officeEmail || 'you@example.com' : proEmail || 'you@example.com'

  // Shared nav
  const Nav = () => (
    <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 justify-between flex-shrink-0 sticky top-0 z-50">
      <span className="text-[#1a7f5e]" style={logoStyle}>kazi.</span>
      <span className="text-[14px] text-[#6b7280]">
        Already have an account?{' '}
        <span onClick={() => navigate('/login')} className="text-[#1a7f5e] font-bold cursor-pointer hover:underline">Sign in</span>
      </span>
    </nav>
  )

  // Shared bottom bar
  const BottomBar = ({ stepNum, total, onBack, onNext, nextLabel = 'Continue →' }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-6 py-3.5 flex items-center justify-between z-40">
      <span className="text-[14px] text-[#9ca3af] font-semibold">{stepNum > 0 ? `Step ${stepNum} of ${total}` : ''}</span>
      <div className="flex gap-2.5">
        {onBack && (
          <button onClick={onBack} className="border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] font-extrabold px-6 py-3 rounded-full text-[15px] hover:border-[#1a7f5e] transition">
            ← Back
          </button>
        )}
        <button onClick={onNext} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-extrabold px-6 py-3 rounded-full text-[15px] transition">
          {nextLabel}
        </button>
      </div>
    </div>
  )

  // ── Done screen ──
  if (done) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
        <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 sticky top-0 z-50">
          <span className="text-[#1a7f5e]" style={logoStyle}>kazi.</span>
        </nav>
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7 w-full max-w-[480px]">
            <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h2 className="text-[28px] font-black text-[#1a1a1a] text-center mb-2 leading-tight">You're all set! 🎉</h2>
            <p className="text-[15px] text-[#6b7280] text-center mb-6">Your kazi. {role === 'office' ? 'office' : 'professional'} account is ready.</p>
            <div className="border border-[#e5e7eb] rounded-[16px] bg-[#e8f5f0] overflow-hidden mb-6">
              <p className="text-[11px] font-extrabold text-[#1a7f5e] uppercase tracking-[.08em] px-5 py-3.5">What to do next</p>
              {(role === 'office' ? [
                { title: 'Complete your office profile', sub: 'Add a photo and description so professionals trust you', type: 'person' },
                { title: 'Post your first shift', sub: 'It takes less than 2 minutes', type: 'calendar' },
                { title: 'Browse available professionals', sub: 'Search by role, location, and availability', type: 'search' },
              ] : [
                { title: 'Complete your profile', sub: 'Add your photo and credentials so offices trust you', type: 'person' },
                { title: 'Browse available shifts', sub: 'Find shifts near you that match your skills', type: 'search' },
                { title: 'Get paid fast', sub: 'Payments processed within 24 hours of shift completion', type: 'dollar' },
              ]).map((item, i) => (
                <div key={i} className="flex items-start gap-3.5 px-5 py-3.5 border-t border-[rgba(26,127,94,.12)]">
                  <div className="w-[34px] h-[34px] rounded-[10px] border border-[rgba(26,127,94,.2)] bg-white flex items-center justify-center flex-shrink-0 text-[#1a7f5e]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      {item.type === 'person' && <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>}
                      {item.type === 'calendar' && <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                      {item.type === 'search' && <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>}
                      {item.type === 'dollar' && <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>}
                    </svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#1a1a1a] mb-0.5">{item.title}</p>
                    <p className="text-[13px] text-[#6b7280] leading-snug">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate(role === 'office' ? '/dashboard' : '/provider-dashboard')}
              className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-extrabold py-[15px] rounded-full text-[16px] transition">
              Go to my dashboard →
            </button>
            <p className="text-[13px] text-[#9ca3af] text-center mt-3 cursor-pointer hover:underline">You can always finish your profile later</p>
          </div>
        </div>
      </div>
    )
  }

  // ── OTP screen ──
  if (showOTP) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
        <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 flex-shrink-0 sticky top-0 z-50">
          <span className="text-[#1a7f5e]" style={logoStyle}>kazi.</span>
        </nav>
        <OTPStep email={currentEmail} onVerified={() => { setShowOTP(false); setDone(true) }} onBack={() => setShowOTP(false)} />
      </div>
    )
  }

  // ── PROVIDER ONBOARDING ──────────────────────────────────────
  if (role === 'professional' && step === 1) {
    const proLabels = ['Account', 'Profession', 'Credentials & Rate']
    const certOptions = ['CPR / BLS Certified','Local Anesthesia Permit','Nitrous Oxide Permit','Registered Dental Assistant','X-Ray Certified','Infection Control Certified','HIPAA Compliance Certified','DANB Certified','EFDA Certified','OSHA Certified']
    const softwareOptions = ['Eaglesoft','Dentrix','Open Dental','Curve Dental','Dexis','Carestream','Dolphin','Orthotrac','Nextech','Other']

    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
        <Nav />
        <ProgressBar step={proStep} total={3} label={proLabels[proStep - 1]} />
        <div className="flex-1 pb-[100px] max-w-[520px] mx-auto w-full px-4 pt-3">

          {proStep === 1 && (
            <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Your account</p>
              <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">Create your account</h2>
              <p className="text-[15px] text-[#6b7280] mb-5">You're setting up a Dental Professional account</p>

              {/* Google SSO */}
              <button className="w-full flex items-center justify-center gap-2.5 py-3.5 border-[1.5px] border-[#e5e7eb] rounded-[12px] text-[15px] font-semibold text-[#1a1a1a] bg-white hover:border-[#1a7f5e] transition mb-5">
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-[#e5e7eb]"/>
                <span className="text-[13px] text-[#9ca3af]">or</span>
                <div className="flex-1 h-px bg-[#e5e7eb]"/>
              </div>

              <div className="flex items-center gap-3.5 pb-5 border-b border-[#f3f4f6] mb-5">
                <div className="w-[60px] h-[60px] rounded-full border-2 border-dashed border-[#1a7f5e] bg-[#e8f5f0] flex items-center justify-center flex-shrink-0 cursor-pointer">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#1a1a1a] mb-1">Profile photo</p>
                  <p className="text-[13px] text-[#6b7280] mb-2 leading-snug">Offices are 3x more likely to book pros with a photo</p>
                  <button className="border-[1.5px] border-[#1a7f5e] text-[#1a7f5e] bg-transparent rounded-full px-3.5 py-1.5 text-[13px] font-extrabold hover:bg-[#e8f5f0] transition">Upload photo</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                <div><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">First Name</label><input type="text" placeholder="Sarah" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
                <div><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Last Name</label><input type="text" placeholder="Mitchell" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              </div>
              <div className="mb-3.5"><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Email</label><input type="email" value={proEmail} onChange={e => setProEmail(e.target.value)} placeholder="you@example.com" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              <div className="mb-3.5"><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Phone</label><input type="tel" placeholder="832-555-0000" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                <div><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">City</label><input type="text" placeholder="Houston" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
                <div><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">State</label><input type="text" placeholder="TX" maxLength={2} className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              </div>
              <div><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">Password</label><input type="password" placeholder="••••••••" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            </div>
          )}

          {proStep === 2 && (
            <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Your profession</p>
              <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">Tell us your role</h2>
              <p className="text-[15px] text-[#6b7280] mb-5">Select your primary profession and what type of work you're looking for</p>
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-3">Primary Role</p>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {['Dental Hygienist','Dental Assistant','Front Office','Dentist'].map((p, idx) => {
                  const ids = ['hygienist','assistant','front','dentist']
                  const sel = profession === ids[idx]
                  return (
                    <div key={p} onClick={() => setProfession(ids[idx])} className={`flex items-center gap-3 border-2 rounded-[14px] px-3.5 py-3 cursor-pointer transition ${sel ? 'border-[#1a7f5e] bg-[#e8f5f0]' : 'border-[#e5e7eb] hover:border-[#1a7f5e]'}`}>
                      <span className="text-[14px] font-bold text-[#1a1a1a] flex-1">{p}</span>
                      <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${sel ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
                        {sel && <div className="w-[7px] h-[7px] rounded-full bg-white"/>}
                      </div>
                    </div>
                  )
                })}
                <div onClick={() => setProfession('specialist')} className={`col-span-2 flex items-center gap-3 border-2 rounded-[14px] px-3.5 py-3 cursor-pointer transition ${profession === 'specialist' ? 'border-[#1a7f5e] bg-[#e8f5f0]' : 'border-[#e5e7eb] hover:border-[#1a7f5e]'}`}>
                  <span className="text-[14px] font-bold text-[#1a1a1a] flex-1">Specialist</span>
                  <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${profession === 'specialist' ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
                    {profession === 'specialist' && <div className="w-[7px] h-[7px] rounded-full bg-white"/>}
                  </div>
                </div>
              </div>
              {profession === 'specialist' && (
                <div className="bg-[#f9f8f6] rounded-[12px] p-3.5 mb-4 border border-[#e5e7eb]">
                  <label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-2.5">Specialist type</label>
                  <div className="flex flex-wrap gap-2">
                    {['Orthodontist','Periodontist','Endodontist','Oral Surgeon','Prosthodontist','Pediatric Dentist','Oral Pathologist','Oral Radiologist'].map(s => (
                      <button key={s} onClick={() => setSpecialistType(s)} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border-[1.5px] transition ${specialistType === s ? 'bg-[#1a7f5e] border-[#1a7f5e] text-white' : 'border-[#e5e7eb] text-[#6b7280] hover:border-[#1a7f5e] bg-white'}`}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="h-px bg-[#f3f4f6] my-5"/>
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-3">Work preference — select all that apply</p>
              <div className="grid grid-cols-3 gap-2">
                {[{id:'temporary',label:'Temporary'},{id:'part_time',label:'Part‑Time'},{id:'full_time',label:'Full‑Time'}].map(opt => {
                  const sel = workPreference.includes(opt.id)
                  return (
                    <div key={opt.id} onClick={() => toggleItem(opt.id, workPreference, setWorkPreference)} className={`flex flex-col items-center gap-2 border-2 rounded-[14px] px-2 py-3.5 cursor-pointer transition text-center ${sel ? 'border-[#1a7f5e] bg-[#e8f5f0]' : 'border-[#e5e7eb] hover:border-[#1a7f5e]'}`}>
                      <span className="text-[14px] font-extrabold text-[#1a1a1a] leading-tight">{opt.label}</span>
                      <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition ${sel ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
                        {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {proStep === 3 && (
            <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Credentials, skills & rate</p>
              <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">Almost there</h2>
              <p className="text-[15px] text-[#6b7280] mb-5">Just a few more details and you're ready to go</p>
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-3">Your Rate</p>
              <div className="flex gap-2 mb-3">
                {['hourly','salary'].map(type => (
                  <button key={type} onClick={() => setProRateType(type)} className={`flex-1 py-3 rounded-full text-[14px] font-bold border-2 transition ${proRateType === type ? 'border-[#1a7f5e] bg-[#e8f5f0] text-[#1a7f5e]' : 'border-[#e5e7eb] text-[#6b7280] bg-white'}`}>
                    {type === 'hourly' ? 'Hourly rate' : 'Annual salary'}
                  </button>
                ))}
              </div>
              <div className="flex items-center border-2 border-[#e5e7eb] rounded-[14px] px-4 py-3 focus-within:border-[#1a7f5e] transition mb-2">
                <span className="text-[20px] text-[#9ca3af] mr-2">$</span>
                <input type="number" placeholder={proRateType === 'hourly' ? '52' : '75000'} className="flex-1 text-[24px] font-black outline-none bg-transparent text-[#1a1a1a]"/>
                <span className="text-[14px] text-[#9ca3af] ml-2">{proRateType === 'hourly' ? '/hr' : '/yr'}</span>
              </div>
              {proRateType === 'hourly' && <p className="text-[13px] text-[#9ca3af] mb-4">Average for your role in Houston: <strong className="text-[#1a7f5e]">$48–$65/hr</strong></p>}
              <div className="h-px bg-[#f3f4f6] my-5"/>
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-3">Dental License</p>
              <div className="mb-1.5"><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">License Number</label><input type="text" placeholder="e.g. TX-12345678" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              <p className="text-[13px] text-[#9ca3af] mb-5 leading-relaxed">Your license will be verified before your profile goes live.</p>
              <div className="h-px bg-[#f3f4f6] my-5"/>
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-3">Certifications & Credentials</p>
              <div className="flex flex-col gap-2 mb-5">
                {certOptions.map(cert => {
                  const sel = selectedCerts.includes(cert)
                  return (
                    <div key={cert} onClick={() => toggleItem(cert, selectedCerts, setSelectedCerts)} className={`flex items-center gap-3 border-[1.5px] rounded-[12px] px-3.5 py-3 cursor-pointer transition ${sel ? 'border-[#1a7f5e] bg-[#e8f5f0]' : 'border-[#e5e7eb] hover:border-[#1a7f5e]'}`}>
                      <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center flex-shrink-0 transition ${sel ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
                        {sel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                      </div>
                      <span className="text-[14px] font-semibold text-[#1a1a1a]">{cert}</span>
                    </div>
                  )
                })}
              </div>
              <div className="h-px bg-[#f3f4f6] my-5"/>
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-3">Practice Software</p>
              <div className="grid grid-cols-2 gap-2">
                {softwareOptions.map(sw => {
                  const sel = selectedSW.includes(sw)
                  return (
                    <div key={sw} onClick={() => toggleItem(sw, selectedSW, setSelectedSW)} className={`flex items-center gap-2.5 border-2 rounded-[12px] px-3 py-3 cursor-pointer transition ${sel ? 'border-[#1a7f5e] bg-[#e8f5f0]' : 'border-[#e5e7eb] hover:border-[#1a7f5e]'}`}>
                      <div className={`w-[16px] h-[16px] rounded border-2 flex items-center justify-center flex-shrink-0 transition ${sel ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
                        {sel && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                      </div>
                      <span className="text-[14px] font-semibold text-[#1a1a1a]">{sw}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <BottomBar
          stepNum={proStep} total={3}
          onBack={proStep > 1 ? () => setProStep(proStep - 1) : () => setStep(0)}
          onNext={() => proStep < 3 ? setProStep(proStep + 1) : setShowOTP(true)}
          nextLabel={proStep === 3 ? 'Verify email →' : 'Continue →'}
        />
      </div>
    )
  }

  // ── OFFICE ONBOARDING ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <Nav />
      {step > 0 && (
        <ProgressBar step={step} total={4} label={['Account','Office Info','Details & Roles','Choose Plan'][step - 1]} />
      )}

      <div className={`flex-1 pb-[100px] ${step === 4 ? 'max-w-[780px]' : 'max-w-[520px]'} mx-auto w-full px-4 pt-3`}>

        {/* STEP 0: Role selection */}
        {step === 0 && (
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
            <p className="text-[11px] font-extrabold text-[#1a7f5e] uppercase tracking-[.1em] mb-1.5">Get started</p>
            <h1 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">Welcome to kazi.</h1>
            <p className="text-[15px] text-[#6b7280] mb-6">Tell us who you are to get started</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { id: 'office', label: 'Dental Office', sub: "I'm hiring for my practice", icon: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></> },
                { id: 'professional', label: 'Dental Professional', sub: "I'm looking for work", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> },
              ].map(r => (
                <div key={r.id} onClick={() => setRole(r.id)} className={`relative border-2 rounded-[16px] p-6 pb-5 cursor-pointer flex flex-col items-center gap-2.5 text-center transition ${role === r.id ? 'border-[#1a7f5e] bg-[#e8f5f0]' : 'border-[#e5e7eb] hover:border-[#1a7f5e]'}`}>
                  {role === r.id && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#1a7f5e] rounded-full flex items-center justify-center">
                      <svg width="10" height="8" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
                    </div>
                  )}
                  <div className={`w-[46px] h-[46px] rounded-[12px] flex items-center justify-center ${role === r.id ? 'bg-white' : 'bg-[#e8f5f0]'}`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="1.8" strokeLinecap="round">{r.icon}</svg>
                  </div>
                  <p className="text-[15px] font-extrabold text-[#1a1a1a]">{r.label}</p>
                  <p className="text-[13px] text-[#9ca3af]">{r.sub}</p>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-[#9ca3af] text-center">You can always change this later</p>
          </div>
        )}

        {/* STEP 1: Account */}
        {step === 1 && (
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
            <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Your account</p>
            <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">Create your account</h2>
            <p className="text-[15px] text-[#6b7280] mb-5">You're setting up a {role === 'office' ? 'Dental Office' : 'Dental Professional'} account</p>
            <button className="w-full flex items-center justify-center gap-2.5 py-3.5 border-[1.5px] border-[#e5e7eb] rounded-[12px] text-[15px] font-semibold text-[#1a1a1a] bg-white hover:border-[#1a7f5e] transition mb-5">
              <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
              Continue with Google
            </button>
            <div className="flex items-center gap-3 mb-5"><div className="flex-1 h-px bg-[#e5e7eb]"/><span className="text-[13px] text-[#9ca3af]">or</span><div className="flex-1 h-px bg-[#e5e7eb]"/></div>
            <div className="mb-3.5"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Full name</label><input type="text" placeholder="Dr. Sarah Mitchell" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            <div className="mb-3.5"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Work email address</label><input type="email" value={officeEmail} onChange={e => setOfficeEmail(e.target.value)} placeholder="you@example.com" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            <div className="mb-4"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Password</label><input type="password" placeholder="••••••••" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            <p className="text-[13px] text-[#9ca3af] leading-relaxed">By continuing you agree to kazi.'s <span className="text-[#1a7f5e] font-semibold cursor-pointer">Terms of Service</span> and <span className="text-[#1a7f5e] font-semibold cursor-pointer">Privacy Policy</span></p>
          </div>
        )}

        {/* STEP 2: Office Info */}
        {step === 2 && (
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
            <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Your office</p>
            <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">Tell us about your office</h2>
            <p className="text-[15px] text-[#6b7280] mb-5">This helps professionals find and recognize you</p>
            <div className="mb-3.5"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Practice name</label><input type="text" placeholder="Bright Smile Dental" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            <div className="mb-3.5">
              <label className="block text-[14px] font-semibold text-[#1a1a1a] mb-2">Practice type</label>
              <div className="flex flex-wrap gap-2">
                {['General Dentistry','Orthodontics','Pediatric Dentistry','Endodontics','Periodontics','Oral Surgery','Prosthodontics','Cosmetic Dentistry','Multi-Specialty'].map(t => (
                  <button key={t} onClick={() => toggleItem(t, selectedPracticeTypes, setSelectedPracticeTypes)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] transition ${selectedPracticeTypes.includes(t) ? 'bg-[#e8f5f0] border-[#1a7f5e] text-[#1a7f5e] font-bold' : 'border-[#e5e7eb] text-[#374151] bg-white hover:border-[#1a7f5e]'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="mb-3.5"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Street address</label><input type="text" placeholder="123 Main Street" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-1"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">City</label><input type="text" placeholder="Houston" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-3 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              <div><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">State</label><input type="text" placeholder="TX" maxLength={2} className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-3 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              <div><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">ZIP</label><input type="text" placeholder="77001" maxLength={5} className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-3 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            </div>
          </div>
        )}

        {/* STEP 3: Details */}
        {step === 3 && (
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
            <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Practice details</p>
            <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">A few more details</h2>
            <p className="text-[15px] text-[#6b7280] mb-5">Help professionals know what to expect</p>
            <div className="mb-3.5">
              <label className="block text-[14px] font-semibold text-[#1a1a1a] mb-2">Typical hours</label>
              <div className="grid grid-cols-2 gap-2.5">
                <div><p className="text-[12px] text-[#9ca3af] font-bold mb-1.5">Open</p><select className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-3 py-3 text-[15px] outline-none focus:border-[#1a7f5e] bg-white"><option>7:00 AM</option><option>7:30 AM</option><option>8:00 AM</option><option>9:00 AM</option></select></div>
                <div><p className="text-[12px] text-[#9ca3af] font-bold mb-1.5">Close</p><select className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-3 py-3 text-[15px] outline-none focus:border-[#1a7f5e] bg-white"><option>4:00 PM</option><option>4:30 PM</option><option>5:00 PM</option><option>6:00 PM</option></select></div>
              </div>
            </div>
            <div className="mb-3.5">
              <label className="block text-[14px] font-semibold text-[#1a1a1a] mb-2">Practice software</label>
              <div className="flex flex-wrap gap-2">
                {['Eaglesoft','Dentrix','Open Dental','Curve Dental','Dexis','Carestream','Dolphin','Other'].map(s => (
                  <button key={s} onClick={() => toggleItem(s, selectedSoftware, setSelectedSoftware)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] transition ${selectedSoftware.includes(s) ? 'bg-[#e8f5f0] border-[#1a7f5e] text-[#1a7f5e] font-bold' : 'border-[#e5e7eb] text-[#374151] bg-white hover:border-[#1a7f5e]'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="mb-5"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Additional notes <span className="font-normal text-[#9ca3af]">(optional)</span></label><textarea placeholder="e.g. We are a fast-paced 6-chair practice, parking available on site..." className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] resize-none h-24 transition bg-white"/></div>
            <div className="h-px bg-[#f3f4f6] mb-5"/>
            <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-3">What roles do you typically hire for?</p>
            <div className="grid grid-cols-2 gap-2.5">
              {['Dental Hygienist','Dental Assistant','Front Desk / Admin','Treatment Coordinator','Dentist / Associate','Sterilization Tech'].map(r => {
                const sel = selectedRoles.includes(r)
                return (
                  <div key={r} onClick={() => toggleItem(r, selectedRoles, setSelectedRoles)} className={`flex items-center justify-between border-2 rounded-[12px] px-3.5 py-3 cursor-pointer transition ${sel ? 'border-[#1a7f5e] bg-[#e8f5f0]' : 'border-[#e5e7eb] hover:border-[#1a7f5e]'}`}>
                    <span className="text-[14px] font-semibold text-[#1a1a1a]">{r}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${sel ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
                      {sel && <svg width="10" height="8" viewBox="0 0 12 9" fill="none"><path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Plan */}
        {step === 4 && (
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
            <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Your plan</p>
            <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">Choose your plan</h2>
            <p className="text-[15px] text-[#6b7280] mb-6">Simple pricing. No contracts. Cancel anytime.</p>
            <div className="grid grid-cols-3 gap-3.5 mb-4">
              {[
                { id: 'free', name: 'Free', desc: 'Best for single-location practices', price: '$0', sub: '/mo', features: ['Post up to 10 shifts/month','Browse verified professionals','In-app messaging','Basic office profile','Email support'] },
                { id: 'pps', name: 'Pay Per Shift', desc: 'Best for busy or growing practices', price: '15%', sub: ' fee', features: ['Unlimited shift postings','Rapid Fill — blast to 10 pros','Advanced search & filters','Saved professionals list','Priority matching','Ratings and reviews','Priority support'] },
                { id: 'monthly', name: 'Monthly', desc: 'Best for high-volume practices', price: '$89', sub: '/mo', popular: true, features: ['Unlimited shift postings','Rapid Fill — blast to 10 pros','Advanced search & filters','Saved professionals list','Priority matching','Ratings and reviews','Priority support'] },
              ].map(plan => (
                <div key={plan.id} onClick={() => setSelectedPlan(plan.id)} className={`relative border-2 rounded-[16px] p-5 cursor-pointer transition flex flex-col ${selectedPlan === plan.id ? 'border-[#1a7f5e]' : 'border-[#e5e7eb] hover:border-[#1a7f5e]'} ${plan.popular ? 'pt-8' : ''}`}>
                  {plan.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1a7f5e] text-white text-[11px] font-extrabold px-3.5 py-1 rounded-full whitespace-nowrap">Most Popular</div>}
                  <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-1">{plan.name}</p>
                  <p className="text-[12px] text-[#9ca3af] mb-3.5 leading-snug">{plan.desc}</p>
                  <p className="text-[32px] font-black text-[#1a1a1a] leading-none mb-3.5">{plan.price}<span className="text-[13px] font-normal text-[#9ca3af]">{plan.sub}</span></p>
                  <ul className="flex flex-col gap-1.5 mb-4 flex-1">
                    {plan.features.map(f => <li key={f} className="text-[12px] text-[#6b7280] flex items-start gap-1.5"><span className="text-[#1a7f5e] font-extrabold flex-shrink-0 mt-0.5">✓</span>{f}</li>)}
                  </ul>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mx-auto transition ${selectedPlan === plan.id ? 'border-[#1a7f5e]' : 'border-[#d1d5db]'}`}>
                    {selectedPlan === plan.id && <div className="w-[9px] h-[9px] rounded-full bg-[#1a7f5e]"/>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-[#9ca3af] text-center">All plans include a 14-day free trial. No credit card required.</p>
          </div>
        )}
      </div>

      <BottomBar
        stepNum={step} total={4}
        onBack={step > 0 ? () => setStep(step - 1) : null}
        onNext={() => {
          if (step === 0 && role === 'professional') setStep(1)
          else if (step < 4) setStep(step + 1)
          else setShowOTP(true)
        }}
        nextLabel={step === 0 ? 'Continue →' : step === 4 ? 'Verify email →' : 'Continue →'}
      />
    </div>
  )
}
