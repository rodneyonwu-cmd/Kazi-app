import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PostShift() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="min-h-screen bg-[#f9f8f6] flex flex-col items-center justify-center px-4">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-10 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-2">Shift posted!</h1>
          <p className="text-sm text-[#6b7280] mb-8">Your shift is live. Professionals in your area will be notified right away.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">
              Go to dashboard
            </button>
            <button onClick={() => { setStep(1); setDone(false) }} className="w-full bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">
              Post another shift
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <nav className="bg-white border-b border-[#e5e7eb] h-16 sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-6 h-full flex items-center justify-between">
          <span className="text-[#1a7f5e] font-bold text-2xl cursor-pointer" onClick={() => navigate('/dashboard')}>kazi.</span>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Applicants</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Professionals</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Bookings</span>
            <span className="text-sm text-[#6b7280] cursor-pointer hover:text-[#1a1a1a]">Messages</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1a7f5e] text-white text-sm font-bold flex items-center justify-center cursor-pointer">BS</div>
        </div>
      </nav>

      <div className="flex items-center justify-center gap-2 py-6">
        {[
          { n: 1, label: 'Role & Type' },
          { n: 2, label: 'Date & Time' },
          { n: 3, label: 'Rate & Details' },
          { n: 4, label: 'Review' },
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

      <div className="flex items-start justify-center px-4 pb-20">
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-8 w-full max-w-lg">

          {step === 1 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 1 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Role & shift type</h1>
              <p className="text-sm text-[#6b7280] mb-6">What position do you need filled?</p>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Role needed</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Dental Hygienist', 'Dental Assistant', 'Front Desk / Admin', 'Treatment Coordinator', 'Sterilization Tech', 'Dentist / Associate'].map(r => (
                    <button key={r} className="px-4 py-3 border-2 border-[#e5e7eb] rounded-xl text-sm font-semibold text-[#6b7280] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition text-left">
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-3">Shift type</label>
                <div className="flex border-2 border-[#e5e7eb] rounded-xl overflow-hidden">
                  <button className="flex-1 py-3 text-sm font-bold bg-[#1a7f5e] text-white transition">Temp shift</button>
                  <button className="flex-1 py-3 text-sm font-bold text-[#6b7280] hover:bg-[#f9f8f6] transition">Permanent job</button>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">
                Continue →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 2 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Date & time</h1>
              <p className="text-sm text-[#6b7280] mb-6">When do you need coverage?</p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Date</label>
                <input type="date" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Start time</label>
                  <input type="time" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">End time</label>
                  <input type="time" className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Lunch break</label>
                <select className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition">
                  <option>No lunch break</option>
                  <option>30 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">← Back</button>
                <button onClick={() => setStep(3)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">Continue →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 3 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Rate & details</h1>
              <p className="text-sm text-[#6b7280] mb-6">Set your rate and any requirements</p>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Hourly rate</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280] font-semibold">$</span>
                  <input type="number" placeholder="52" className="w-full border border-[#e5e7eb] rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition" />
                </div>
                <p className="text-xs text-[#1a7f5e] mt-1 font-medium">Market rate for Dental Hygienist: $48 – $65/hr</p>
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
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-1.5">Notes <span className="text-[#9ca3af] font-normal">(optional)</span></label>
                <textarea placeholder="Any special requirements or info about the shift..." className="w-full border border-[#e5e7eb] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#1a7f5e] transition resize-none h-24" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">← Back</button>
                <button onClick={() => setStep(4)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">Continue →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9ca3af] mb-2">Step 4 of 4</p>
              <h1 className="text-2xl font-extrabold text-[#1a1a1a] mb-1">Review & post</h1>
              <p className="text-sm text-[#6b7280] mb-6">Double check everything before posting</p>
              <div className="bg-[#f9f8f6] rounded-2xl p-5 mb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">Role</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">Dental Hygienist</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">Date & Time</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">Mon Mar 17 · 8:00am – 5:00pm</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">Rate</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">$52/hr</p>
                  </div>
                  <button onClick={() => setStep(3)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button>
                </div>
                <div className="h-px bg-[#e5e7eb]"></div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#9ca3af] font-semibold uppercase tracking-widest mb-1">Shift Type</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">Temp shift</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-[#1a7f5e] font-semibold">Edit</button>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="flex-1 bg-white border border-[#e5e7eb] text-[#1a1a1a] font-bold py-3 rounded-full text-sm hover:border-[#1a7f5e] transition">← Back</button>
                <button onClick={() => setDone(true)} className="flex-1 bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold py-3 rounded-full text-sm transition">Post shift 🚀</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}