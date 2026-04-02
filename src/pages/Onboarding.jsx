import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth, useSession } from '@clerk/clerk-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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

// ── Loading screen ───────────────────────────────────────────────
const LoadingScreen = ({ message }) => (
  <div className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center">
    <span className="text-[#1a7f5e] mb-6" style={logoStyle}>kazi.</span>
    <svg className="animate-spin mb-4" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    <p className="text-[15px] text-[#6b7280] font-medium">{message}</p>
  </div>
)

// ── Success screen ───────────────────────────────────────────────
const SuccessScreen = ({ role, onContinue }) => (
  <div className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center px-4">
    <div className="bg-white border border-[#e5e7eb] rounded-[24px] p-10 max-w-[460px] w-full text-center">
      <div className="w-20 h-20 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      </div>
      <h1 className="text-[28px] font-black text-[#1a1a1a] mb-2">Welcome to kazi.!</h1>
      <p className="text-[15px] text-[#6b7280] mb-8">
        {role === 'office'
          ? "Your office profile is ready. Start posting shifts and finding great dental professionals."
          : "Your provider profile is ready. Start finding shifts that match your schedule and skills."}
      </p>
      <button
        onClick={onContinue}
        className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-extrabold py-4 rounded-full text-[16px] transition"
      >
        {role === 'office' ? 'Go to my dashboard →' : 'Find shifts →'}
      </button>
    </div>
  </div>
)

// ── Main Onboarding ──────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate()
  const { user, isLoaded: userLoaded } = useUser()
  const { getToken, isSignedIn } = useAuth()
  const { session } = useSession()
  const cachedTokenRef = useRef(null)
  const [step, setStep] = useState(0)
  const [role, setRole] = useState('office')
  const [checking, setChecking] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  // Save state
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Office state
  const [officeName, setOfficeName] = useState('')
  const [officeAddress, setOfficeAddress] = useState('')
  const [officeCity, setOfficeCity] = useState('')
  const [officeState, setOfficeState] = useState('')
  const [officeZip, setOfficeZip] = useState('')
  const [officeNotes, setOfficeNotes] = useState('')
  const [selectedPracticeTypes, setSelectedPracticeTypes] = useState(['General Dentistry'])
  const [selectedSoftware, setSelectedSoftware] = useState(['Eaglesoft'])
  const [selectedRoles, setSelectedRoles] = useState(['Dental Hygienist', 'Dental Assistant'])
  const [selectedPlan, setSelectedPlan] = useState('pps')

  // Provider state
  const [proStep, setProStep] = useState(1)
  const [profession, setProfession] = useState('')
  const [specialistType, setSpecialistType] = useState('')
  const [workPreference, setWorkPreference] = useState([])
  const [selectedCerts, setSelectedCerts] = useState([])
  const [selectedSW, setSelectedSW] = useState([])
  const [proRateType, setProRateType] = useState('hourly')
  const [proRate, setProRate] = useState('')
  const [proLicense, setProLicense] = useState('')

  const toggleItem = (item, list, setList) => {
    setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  }

  // Check if user is already onboarded
  useEffect(() => {
    if (!userLoaded) return
    if (!user || !isSignedIn) { setChecking(false); return }

    const checkOnboarding = async () => {
      try {
        const token = await getToken()
        if (!token) { setChecking(false); return }
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) { setChecking(false); return }
        const data = await res.json()
        if (data.office) { navigate('/dashboard', { replace: true }); return }
        if (data.provider) { navigate('/provider-dashboard', { replace: true }); return }
      } catch {
        // User not found yet — continue with onboarding
      }
      setChecking(false)
    }
    checkOnboarding()
  }, [userLoaded, user, isSignedIn])

  // Proactively cache auth token as soon as session is available
  useEffect(() => {
    const cacheToken = async () => {
      try {
        // Try session.getToken() first (more reliable right after signup)
        if (session) {
          const t = await session.getToken()
          if (t) { cachedTokenRef.current = t; console.log('[Onboarding] Token cached via session'); return }
        }
        // Fallback to useAuth getToken
        const t = await getToken()
        if (t) { cachedTokenRef.current = t; console.log('[Onboarding] Token cached via useAuth') }
      } catch {}
    }
    if (isSignedIn) cacheToken()
  }, [isSignedIn, session, getToken])

  // Helper to get a valid token with multiple strategies and retries
  const getValidToken = async () => {
    // 1. Use cached token if available
    if (cachedTokenRef.current) return cachedTokenRef.current
    // 2. Try session.getToken() (works best right after signup)
    if (session) {
      try {
        const t = await session.getToken()
        if (t) { cachedTokenRef.current = t; return t }
      } catch {}
    }
    // 3. Try useAuth getToken() with retries
    for (let i = 0; i < 8; i++) {
      try {
        const t = await getToken()
        if (t) { cachedTokenRef.current = t; return t }
      } catch {}
      console.log(`[Onboarding] Token attempt ${i + 1}/8 failed, waiting...`)
      await new Promise(r => setTimeout(r, 1500))
    }
    return null
  }

  // Save onboarding data to API
  const saveOnboarding = async () => {
    setSaving(true)
    setSaveError('')
    try {
      // Initial delay to let Clerk session propagate after signup
      if (!cachedTokenRef.current) {
        console.log('[Onboarding] No cached token, waiting 3s for session...')
        await new Promise(r => setTimeout(r, 3000))
      }

      const token = await getValidToken()
      const headers = { 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      else console.log('[Onboarding] No token available, proceeding without auth (server will use _email fallback)')
      const email = user?.primaryEmailAddress?.emailAddress || ''

      if (role === 'office') {
        const body = {
          name: officeName,
          specialty: selectedPracticeTypes.join(', '),
          software: selectedSoftware,
          address: officeAddress,
          city: officeCity,
          state: officeState,
          zip: officeZip,
          bio: officeNotes,
          plan: selectedPlan,
          hiringRoles: selectedRoles,
          _email: email,
        }
        console.log('[Onboarding] POST /api/offices', body)
        const res = await fetch(`${API_URL}/api/offices`, { method: 'POST', headers, body: JSON.stringify(body) })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `Failed to create office profile (${res.status})`)
        }
      } else {
        const providerRole = profession === 'specialist' && specialistType ? specialistType : profession
        const body = {
          role: providerRole,
          software: selectedSW,
          skills: selectedCerts,
          hourlyRate: proRateType === 'hourly' && proRate ? parseFloat(proRate) : null,
          licenseNumber: proLicense || null,
          _email: email,
        }
        console.log('[Onboarding] POST /api/providers', body)
        const res = await fetch(`${API_URL}/api/providers`, { method: 'POST', headers, body: JSON.stringify(body) })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || `Failed to create provider profile (${res.status})`)
        }
      }

      console.log('[Onboarding] Success!')
      setShowSuccess(true)
    } catch (err) {
      console.error('[Onboarding] Save error:', err)
      if (err.message === 'AUTH_FAILED') {
        setSaveError('RETRY')
      } else if (err.message === 'Failed to fetch') {
        setSaveError('Cannot connect to server. Make sure the API server is running on port 3001.')
      } else {
        setSaveError(err.message)
      }
    } finally {
      setSaving(false)
    }
  }

  // Show loading while checking
  if (checking || !userLoaded) {
    return <LoadingScreen message="Loading your account..." />
  }

  // Show success screen after save
  if (showSuccess) {
    return (
      <SuccessScreen
        role={role}
        onContinue={() => navigate(role === 'office' ? '/dashboard' : '/provider-dashboard', { replace: true })}
      />
    )
  }

  // Shared nav
  const Nav = () => (
    <nav className="bg-white border-b border-[#e5e7eb] h-16 flex items-center px-6 justify-between flex-shrink-0 sticky top-0 z-50">
      <span className="text-[#1a7f5e]" style={logoStyle}>kazi.</span>
      {!isSignedIn && (
        <span className="text-[14px] text-[#6b7280]">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-[#1a7f5e] font-bold cursor-pointer hover:underline">Sign in</span>
        </span>
      )}
    </nav>
  )

  // Shared bottom bar
  const BottomBar = ({ stepNum, total, onBack, onNext, nextLabel = 'Continue →', disabled = false }) => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e7eb] px-6 py-3.5 flex items-center justify-between z-40">
      <span className="text-[14px] text-[#9ca3af] font-semibold">{stepNum > 0 ? `Step ${stepNum} of ${total}` : ''}</span>
      <div className="flex gap-2.5">
        {onBack && (
          <button onClick={onBack} className="border-[1.5px] border-[#e5e7eb] bg-white text-[#1a1a1a] font-extrabold px-6 py-3 rounded-full text-[15px] hover:border-[#1a7f5e] transition">
            ← Back
          </button>
        )}
        <button onClick={onNext} disabled={disabled}
          className={`font-extrabold px-6 py-3 rounded-full text-[15px] transition ${disabled ? 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed' : 'bg-[#1a7f5e] hover:bg-[#156649] text-white'}`}>
          {nextLabel}
        </button>
      </div>
    </div>
  )

  // ── PROVIDER ONBOARDING ──────────────────────────────────────
  if (role === 'professional' && step === 1) {
    const proLabels = ['Profession', 'Credentials & Rate']
    const certOptions = ['CPR / BLS Certified','Local Anesthesia Permit','Nitrous Oxide Permit','Registered Dental Assistant','X-Ray Certified','Infection Control Certified','HIPAA Compliance Certified','DANB Certified','EFDA Certified','OSHA Certified']
    const softwareOptions = ['Eaglesoft','Dentrix','Open Dental','Curve Dental','Dexis','Carestream','Dolphin','Orthotrac','Nextech','Other']

    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
        <Nav />
        <ProgressBar step={proStep} total={2} label={proLabels[proStep - 1]} />
        <div className="flex-1 pb-[100px] max-w-[520px] mx-auto w-full px-4 pt-3">

          {proStep === 1 && (
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
                {[{id:'temporary',label:'Temporary'},{id:'part_time',label:'Part\u2011Time'},{id:'full_time',label:'Full\u2011Time'}].map(opt => {
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

          {proStep === 2 && (
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
                <input type="number" value={proRate} onChange={e => setProRate(e.target.value)} placeholder={proRateType === 'hourly' ? '52' : '75000'} className="flex-1 text-[24px] font-black outline-none bg-transparent text-[#1a1a1a]"/>
                <span className="text-[14px] text-[#9ca3af] ml-2">{proRateType === 'hourly' ? '/hr' : '/yr'}</span>
              </div>
              {proRateType === 'hourly' && <p className="text-[13px] text-[#9ca3af] mb-4">Average for your role: <strong className="text-[#1a7f5e]">$48–$65/hr</strong></p>}
              <div className="h-px bg-[#f3f4f6] my-5"/>
              <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-3">Dental License</p>
              <div className="mb-1.5"><label className="block text-[12px] font-extrabold text-[#9ca3af] uppercase tracking-[.08em] mb-1.5">License Number</label><input type="text" value={proLicense} onChange={e => setProLicense(e.target.value)} placeholder="e.g. TX-12345678" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
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

              {saveError && (
                <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 mt-5">
                  {saveError === 'RETRY' ? (
                    <div className="text-center">
                      <p className="text-sm text-[#991b1b] font-medium mb-2">Your account is still being set up. This can take a few seconds.</p>
                      <button onClick={() => { setSaveError(''); saveOnboarding() }} className="bg-[#991b1b] text-white font-bold px-5 py-2 rounded-full text-sm">Retry now</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <p className="text-sm text-[#991b1b] font-medium flex-1">{saveError}</p>
                      <button onClick={() => { setSaveError(''); saveOnboarding() }} className="text-[#991b1b] font-bold text-sm underline flex-shrink-0">Retry</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <BottomBar
          stepNum={proStep} total={2}
          onBack={proStep > 1 ? () => setProStep(proStep - 1) : () => setStep(0)}
          onNext={() => proStep < 2 ? setProStep(proStep + 1) : saveOnboarding()}
          nextLabel={proStep === 2 ? (saving ? 'Setting up...' : 'Complete setup →') : 'Continue →'}
          disabled={saving}
        />
      </div>
    )
  }

  // ── OFFICE ONBOARDING ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f9f8f6] flex flex-col">
      <Nav />
      {step > 0 && (
        <ProgressBar step={step} total={3} label={['Office Info','Details & Roles','Choose Plan'][step - 1]} />
      )}

      <div className={`flex-1 pb-[100px] ${step === 3 ? 'max-w-[780px]' : 'max-w-[520px]'} mx-auto w-full px-4 pt-3`}>

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

        {/* STEP 1: Office Info */}
        {step === 1 && (
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
            <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Your office</p>
            <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">Tell us about your office</h2>
            <p className="text-[15px] text-[#6b7280] mb-5">This helps professionals find and recognize you</p>
            <div className="mb-3.5"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Practice name</label><input type="text" value={officeName} onChange={e => setOfficeName(e.target.value)} placeholder="Bright Smile Dental" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            <div className="mb-3.5">
              <label className="block text-[14px] font-semibold text-[#1a1a1a] mb-2">Practice type</label>
              <div className="flex flex-wrap gap-2">
                {['General Dentistry','Orthodontics','Pediatric Dentistry','Endodontics','Periodontics','Oral Surgery','Prosthodontics','Cosmetic Dentistry','Multi-Specialty'].map(t => (
                  <button key={t} onClick={() => toggleItem(t, selectedPracticeTypes, setSelectedPracticeTypes)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] transition ${selectedPracticeTypes.includes(t) ? 'bg-[#e8f5f0] border-[#1a7f5e] text-[#1a7f5e] font-bold' : 'border-[#e5e7eb] text-[#374151] bg-white hover:border-[#1a7f5e]'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="mb-3.5"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Street address</label><input type="text" value={officeAddress} onChange={e => setOfficeAddress(e.target.value)} placeholder="123 Main Street" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="col-span-1"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">City</label><input type="text" value={officeCity} onChange={e => setOfficeCity(e.target.value)} placeholder="Houston" className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-3 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              <div><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">State</label><input type="text" value={officeState} onChange={e => setOfficeState(e.target.value)} placeholder="TX" maxLength={2} className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-3 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
              <div><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">ZIP</label><input type="text" value={officeZip} onChange={e => setOfficeZip(e.target.value)} placeholder="77001" maxLength={5} className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-3 py-3 text-[15px] outline-none focus:border-[#1a7f5e] transition bg-white"/></div>
            </div>
          </div>
        )}

        {/* STEP 2: Details */}
        {step === 2 && (
          <div className="bg-white border border-[#e5e7eb] rounded-[20px] p-7">
            <p className="text-[11px] font-extrabold text-[#9ca3af] uppercase tracking-[.1em] mb-1.5">Practice details</p>
            <h2 className="text-[26px] font-black text-[#1a1a1a] mb-1.5 leading-tight">A few more details</h2>
            <p className="text-[15px] text-[#6b7280] mb-5">Help professionals know what to expect</p>
            <div className="mb-3.5">
              <label className="block text-[14px] font-semibold text-[#1a1a1a] mb-2">Practice software</label>
              <div className="flex flex-wrap gap-2">
                {['Eaglesoft','Dentrix','Open Dental','Curve Dental','Dexis','Carestream','Dolphin','Other'].map(s => (
                  <button key={s} onClick={() => toggleItem(s, selectedSoftware, setSelectedSoftware)} className={`px-3 py-1.5 rounded-full text-[13px] font-semibold border-[1.5px] transition ${selectedSoftware.includes(s) ? 'bg-[#e8f5f0] border-[#1a7f5e] text-[#1a7f5e] font-bold' : 'border-[#e5e7eb] text-[#374151] bg-white hover:border-[#1a7f5e]'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="mb-5"><label className="block text-[14px] font-semibold text-[#1a1a1a] mb-1.5">Additional notes <span className="font-normal text-[#9ca3af]">(optional)</span></label><textarea value={officeNotes} onChange={e => setOfficeNotes(e.target.value)} placeholder="e.g. We are a fast-paced 6-chair practice, parking available on site..." className="w-full border-[1.5px] border-[#e5e7eb] rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#1a7f5e] resize-none h-24 transition bg-white"/></div>
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

        {/* STEP 3: Plan */}
        {step === 3 && (
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

            {saveError && (
              <div className="bg-[#fee2e2] border border-[#fecaca] rounded-xl px-4 py-3 mt-4 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-sm text-[#991b1b] font-medium">{saveError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomBar
        stepNum={step} total={3}
        onBack={step > 0 ? () => setStep(step - 1) : null}
        onNext={() => {
          if (step === 0 && role === 'professional') setStep(1)
          else if (step < 3) setStep(step + 1)
          else saveOnboarding()
        }}
        nextLabel={step === 0 ? 'Continue →' : step === 3 ? (saving ? 'Setting up...' : 'Complete setup →') : 'Continue →'}
        disabled={saving}
      />
    </div>
  )
}
