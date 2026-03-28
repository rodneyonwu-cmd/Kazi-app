import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Nav from '../components/Nav'

export default function Professionals() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.rapidFillPreselect) {
      setRapidFillSelected([location.state.rapidFillPreselect])
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [])

  const [search, setSearch] = useState('')
  const [date, setDate] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedReliability, setSelectedReliability] = useState('All')
  const [selectedCertifications, setSelectedCertifications] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [maxMiles, setMaxMiles] = useState(50)
  const [selectedLanguage, setSelectedLanguage] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedCert, setSelectedCert] = useState('')
  const [photoOnly, setPhotoOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const PROS_PER_PAGE = 8
  const [minRate, setMinRate] = useState(0)
  const [maxRate, setMaxRate] = useState(150)
  const [showCertMenu, setShowCertMenu] = useState(false)
  const [showSkillMenu, setShowSkillMenu] = useState(false)
  const [sortBy, setSortBy] = useState('Best match')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [rapidFillSelected, setRapidFillSelected] = useState([])
  const [showRapidFill, setShowRapidFill] = useState(false)
  const [rapidFillSubmitted, setRapidFillSubmitted] = useState(false)
  const [toast, setToast] = useState(null)
  const [expandedAvailability, setExpandedAvailability] = useState(null)
  const [bookingModal, setBookingModal] = useState(null)
  const [bookingSubmitted, setBookingSubmitted] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500) }

  const roles = ['All', 'Dental Hygienist', 'Dental Assistant', 'Front Desk', 'Treatment Coordinator', 'Sterilization Tech']
  const sortOptions = ['Best match', 'Highest rated', 'Most reliable', 'Lowest rate', 'Most shifts', 'Closest']

  const reliabilityLevels = [
    { label: 'All', val: 'All' },
    { label: 'Excellent', val: 'excellent', dotColor: '#16a34a', bg: 'bg-[#dcfce7]', textColor: 'text-[#166534]', range: '95%+' },
    { label: 'Very Good', val: 'verygood', dotColor: '#7c3aed', bg: 'bg-[#ede9fe]', textColor: 'text-[#5b21b6]', range: '85–94%' },
    { label: 'Good', val: 'good', dotColor: '#f97316', bg: 'bg-[#ffedd5]', textColor: 'text-[#9a3412]', range: '70–84%' },
    { label: 'Poor', val: 'poor', dotColor: '#ef4444', bg: 'bg-[#fee2e2]', textColor: 'text-[#991b1b]', range: '<70%' },
  ]

  const allCertifications = ['Texas RDH License','CPR/BLS Certified','Local Anesthesia Permit','Nitrous Oxide Permit','Registered Dental Assistant','X-Ray Certified','Infection Control Certified','HIPAA Compliance Certified','Dental Billing Specialist']
  const allSkills = ['Scaling & Root Planing','Periodontal Charting','Digital X-rays','Patient Education','Nitrous Oxide Monitoring','Four-Handed Dentistry','Impression Taking','Treatment Coordination','Insurance Verification','Recall Scheduling']

  const professionals = [
    { id: 'sarah', name: 'Sarah R.', role: 'Dental Hygienist', rate: 52, rating: 5.0, reviews: 63, reliability: 98, shiftsCompleted: 147, responseTime: '< 1 hr', lastLogin: 'Today', miles: 8.2, software: ['Eaglesoft','Dentrix','Open Dental'], certifications: ['Texas RDH License','CPR/BLS Certified','Local Anesthesia Permit','Nitrous Oxide Permit'], skills: ['Scaling & Root Planing','Periodontal Charting','Patient Education','Nitrous Oxide Monitoring'], about: 'Experienced RDH with 12 years in general and perio practices. Highly proficient in full-mouth debridement, periodontal charting, and advanced scaling procedures. Known for her gentle touch with anxious patients and her ability to run a full column independently without...', img: 'https://randomuser.me/api/portraits/women/44.jpg', booked: true, available: true, verified: true, calendar: { 16:{status:'available',time:'8:00am – 5:00pm'},17:{status:'available',time:'7:30am – 3:00pm'},18:{status:'booked',time:'8:00am – 5:00pm'},19:{status:'available',time:'8:00am – 4:00pm'},20:{status:'available',time:'9:00am – 5:00pm'},23:{status:'available',time:'7:00am – 3:00pm'},24:{status:'booked',time:'8:00am – 5:00pm'},25:{status:'available',time:'8:00am – 5:00pm'},26:{status:'available',time:'8:00am – 2:00pm'},30:{status:'available',time:'7:30am – 4:30pm'},31:{status:'available',time:'8:00am – 5:00pm'} } },
    { id: 'rachel', name: 'Rachel M.', role: 'Dental Hygienist', rate: 72, rating: 4.9, reviews: 71, reliability: 99, shiftsCompleted: 203, responseTime: '< 1 hr', lastLogin: 'Today', miles: 11.4, software: ['Eaglesoft','Open Dental'], certifications: ['Texas RDH License','CPR/BLS Certified','Nitrous Oxide Permit'], skills: ['Scaling & Root Planing','Digital X-rays','Patient Education'], about: 'With 12 years across general and specialty practices, Rachel brings precision and professionalism to every shift. She excels in perio maintenance, SRP, and patient education. Comfortable managing a high-volume schedule while maintaining exceptional quality of care and...', img: 'https://randomuser.me/api/portraits/women/55.jpg', booked: false, available: true, verified: true, calendar: { 17:{status:'available',time:'8:00am – 5:00pm'},18:{status:'available',time:'8:00am – 5:00pm'},19:{status:'booked',time:'8:00am – 4:00pm'},20:{status:'available',time:'7:30am – 3:30pm'},23:{status:'available',time:'8:00am – 5:00pm'},24:{status:'available',time:'9:00am – 5:00pm'},26:{status:'available',time:'8:00am – 4:00pm'},30:{status:'available',time:'7:00am – 3:00pm'} } },
    { id: 'aisha', name: 'Aisha L.', role: 'Dental Hygienist', rate: 58, rating: 5.0, reviews: 48, reliability: 94, shiftsCompleted: 142, responseTime: '< 2 hrs', lastLogin: 'Today', miles: 6.1, software: ['Dentrix','Curve Dental'], certifications: ['Texas RDH License','CPR/BLS Certified','Local Anesthesia Permit'], skills: ['Scaling & Root Planing','Periodontal Charting','Nitrous Oxide Monitoring'], about: 'Periodontal specialist with 15 years of clinical experience focused on advanced perio therapy, precision scaling, and early disease detection. Aisha is highly sought after by specialty practices for her ability to manage complex perio patients with outstanding results and...', img: 'https://randomuser.me/api/portraits/women/65.jpg', booked: false, available: true, verified: true, calendar: { 16:{status:'available',time:'8:00am – 4:00pm'},17:{status:'available',time:'9:00am – 5:00pm'},18:{status:'booked',time:'7:30am – 3:30pm'},20:{status:'available',time:'8:00am – 5:00pm'},24:{status:'available',time:'8:00am – 5:00pm'},25:{status:'available',time:'7:00am – 3:00pm'},27:{status:'available',time:'8:00am – 5:00pm'},30:{status:'available',time:'9:00am – 5:00pm'} } },
    { id: 'james', name: 'James T.', role: 'Dental Hygienist', rate: 75, rating: 4.8, reviews: 55, reliability: 91, shiftsCompleted: 88, responseTime: '< 2 hrs', lastLogin: '1 day ago', miles: 14.3, software: ['Open Dental','Eaglesoft'], certifications: ['Texas RDH License','CPR/BLS Certified'], skills: ['Periodontal Charting','Digital X-rays','Patient Education'], about: 'James thrives in collaborative, high-volume environments where communication and speed matter. With experience across several multi-doctor practices in the Houston area, he brings adaptability and professionalism to every shift. Particularly skilled in perio charting and...', img: 'https://randomuser.me/api/portraits/men/22.jpg', booked: false, available: false, verified: false, calendar: { 17:{status:'available',time:'8:00am – 5:00pm'},19:{status:'available',time:'9:00am – 3:00pm'},20:{status:'booked',time:'8:00am – 5:00pm'},24:{status:'available',time:'7:30am – 4:30pm'},25:{status:'available',time:'8:00am – 5:00pm'},31:{status:'available',time:'8:00am – 4:00pm'} } },
    { id: 'nina', name: 'Nina P.', role: 'Dental Assistant', rate: 34, rating: 4.9, reviews: 52, reliability: 86, shiftsCompleted: 98, responseTime: '< 2 hrs', lastLogin: 'Today', miles: 9.8, software: ['Dentrix','Eaglesoft'], certifications: ['Registered Dental Assistant','CPR/BLS Certified','X-Ray Certified'], skills: ['Four-Handed Dentistry','Impression Taking','Digital X-rays','Patient Education'], about: 'Nina brings warmth, efficiency, and clinical precision to every practice she joins. With 8 years assisting across general and cosmetic practices, she excels in four-handed dentistry, tray setup, and patient management. Offices consistently praise her calming chairside manner and...', img: 'https://randomuser.me/api/portraits/women/28.jpg', booked: false, available: true, verified: true, calendar: { 16:{status:'available',time:'8:00am – 5:00pm'},17:{status:'booked',time:'8:00am – 4:00pm'},18:{status:'available',time:'9:00am – 5:00pm'},19:{status:'available',time:'7:30am – 3:30pm'},24:{status:'available',time:'8:00am – 5:00pm'},25:{status:'available',time:'8:00am – 3:00pm'},30:{status:'available',time:'9:00am – 5:00pm'} } },
    { id: 'marcus', name: 'Marcus J.', role: 'Dental Assistant', rate: 38, rating: 4.8, reviews: 41, reliability: 73, shiftsCompleted: 54, responseTime: '< 3 hrs', lastLogin: '1 day ago', miles: 5.7, software: ['Dentrix','Open Dental'], certifications: ['Registered Dental Assistant','CPR/BLS Certified','Infection Control Certified','X-Ray Certified'], skills: ['Four-Handed Dentistry','Impression Taking'], about: 'Marcus is a dependable dental assistant with 8 years of hands-on experience in both general and pediatric settings. He is particularly skilled in instrument sterilization, impression taking, and managing young patients. His calm energy makes him a natural fit for practices that...', img: 'https://randomuser.me/api/portraits/men/32.jpg', booked: true, available: true, verified: false, calendar: { 17:{status:'available',time:'8:00am – 4:00pm'},18:{status:'available',time:'9:00am – 5:00pm'},20:{status:'available',time:'7:30am – 3:30pm'},23:{status:'available',time:'8:00am – 5:00pm'},26:{status:'available',time:'9:00am – 5:00pm'},31:{status:'available',time:'8:00am – 5:00pm'} } },
    { id: 'tara', name: 'Tara C.', role: 'Front Desk', rate: 28, rating: 4.7, reviews: 34, reliability: 98, shiftsCompleted: 61, responseTime: '< 2 hrs', lastLogin: 'Yesterday', miles: 7.5, software: ['Eaglesoft','Dentrix'], certifications: ['CPR/BLS Certified','HIPAA Compliance Certified'], skills: ['Insurance Verification','Recall Scheduling','Patient Education'], about: 'Tara is a polished front desk professional with a gift for patient relations and scheduling efficiency. She seamlessly steps into new office environments and quickly learns workflows, insurance verification procedures, and recall systems. Her communication skills are frequently...', img: 'https://randomuser.me/api/portraits/women/17.jpg', booked: false, available: true, verified: false, calendar: { 16:{status:'available',time:'8:00am – 5:00pm'},18:{status:'available',time:'9:00am – 4:00pm'},19:{status:'available',time:'8:00am – 5:00pm'},23:{status:'available',time:'8:00am – 5:00pm'},24:{status:'available',time:'7:30am – 3:30pm'},31:{status:'available',time:'8:00am – 5:00pm'} } },
    { id: 'devon', name: 'Devon K.', role: 'Treatment Coordinator', rate: 42, rating: 4.6, reviews: 28, reliability: 84, shiftsCompleted: 32, responseTime: '< 5 hrs', lastLogin: '2 days ago', miles: 18.2, software: ['Curve Dental','Dexis'], certifications: ['CPR/BLS Certified','HIPAA Compliance Certified','Dental Billing Specialist'], skills: ['Treatment Coordination','Insurance Verification','Patient Education'], about: 'Devon specializes in presenting treatment plans in a way that builds patient trust and drives case acceptance. With a strong background in insurance coordination and financial arrangements, he helps offices maximize production while keeping patients comfortable with their...', img: 'https://randomuser.me/api/portraits/men/41.jpg', booked: false, available: false, verified: false, calendar: { 17:{status:'available',time:'9:00am – 5:00pm'},19:{status:'available',time:'8:00am – 4:00pm'},24:{status:'available',time:'8:00am – 5:00pm'},25:{status:'available',time:'7:30am – 3:30pm'},30:{status:'available',time:'9:00am – 5:00pm'} } },
  ]

  const getReliabilityBand = (r) => { if (r >= 95) return 'excellent'; if (r >= 85) return 'verygood'; if (r >= 70) return 'good'; return 'poor' }
  const getReliabilityDisplay = (r) => { if (r >= 95) return { label:'Excellent',color:'text-[#166534]',bg:'bg-[#dcfce7]' }; if (r >= 85) return { label:'Very Good',color:'text-[#5b21b6]',bg:'bg-[#ede9fe]' }; if (r >= 70) return { label:'Good',color:'text-[#9a3412]',bg:'bg-[#ffedd5]' }; return { label:'Poor',color:'text-[#991b1b]',bg:'bg-[#fee2e2]' } }
  const toggleItem = (item, list, setList) => setList(prev => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item])
  const toggleRapidFill = (id) => { if (rapidFillSelected.includes(id)) setRapidFillSelected(prev => prev.filter(x => x !== id)); else if (rapidFillSelected.length < 10) setRapidFillSelected(prev => [...prev, id]) }

  const clearAllFilters = () => {
    setSelectedRole('All')
    setSelectedReliability('All')
    setSelectedLanguage('')
    setSelectedSkill('')
    setSelectedCert('')
    setPhotoOnly(false)
    setMaxMiles(50)
    setMinRate(0)
    setMaxRate(150)
    setSearch('')
    setCurrentPage(1)
  }

  const filtered = professionals.filter(p => {
    if (selectedRole !== 'All' && p.role !== selectedRole) return false
    if (selectedReliability !== 'All' && getReliabilityBand(p.reliability) !== selectedReliability) return false
    if (p.rate < minRate || p.rate > maxRate) return false
    if (p.miles > maxMiles) return false
    if (selectedCert && !p.certifications.includes(selectedCert)) return false
    if (selectedSkill && !p.skills.includes(selectedSkill)) return false
    if (selectedLanguage && !(p.languages || []).includes(selectedLanguage)) return false
    if (photoOnly && !p.img) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.role.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'Highest rated') return b.rating - a.rating
    if (sortBy === 'Most reliable') return b.reliability - a.reliability
    if (sortBy === 'Lowest rate') return a.rate - b.rate
    if (sortBy === 'Most shifts') return b.shiftsCompleted - a.shiftsCompleted
    if (sortBy === 'Closest') return a.miles - b.miles
    return b.reliability - a.reliability
  })

  const totalPages = Math.ceil(filtered.length / PROS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * PROS_PER_PAGE, currentPage * PROS_PER_PAGE)

  const firstName = (name) => name.split(' ')[0]
  const selectedPros = professionals.filter(p => rapidFillSelected.includes(p.id))
  const getDayStyle = (status) => { if (status === 'available') return 'bg-[#e8f5f0] text-[#1a7f5e] cursor-pointer hover:bg-[#1a7f5e] hover:text-white'; if (status === 'booked') return 'bg-[#fef3c7] text-[#92400e] cursor-not-allowed'; return 'bg-[#f3f4f6] text-[#9ca3af] cursor-not-allowed' }
  const activeFilterCount = [selectedRole !== 'All', selectedReliability !== 'All', selectedCertifications.length > 0, selectedSkills.length > 0, maxMiles !== 50, minRate !== 0 || maxRate !== 150].filter(Boolean).length

  // ── FILTER PANEL ─────────────────────────────────────────────────────────────
  const FilterPanel = () => (
    <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#f3f4f6]">
        <div className="flex items-center gap-2">
          <span className="text-[18px] font-extrabold text-[#1a1a1a]">Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[10px] font-extrabold bg-[#1a7f5e] text-white w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters} className="text-[11px] font-semibold text-[#1a7f5e] hover:underline">Clear all</button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Role */}
        <div>
          <p className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest mb-1.5">Role</p>
          <div className="relative">
            <select
              value={selectedRole}
              onChange={e => { setSelectedRole(e.target.value); setCurrentPage(1) }}
              className={"w-full border-[1.5px] rounded-xl px-3 py-2 pr-8 text-[13px] font-semibold font-sans outline-none appearance-none cursor-pointer transition-all " + (selectedRole !== 'All' ? "border-[#1a7f5e] bg-[#f0faf5] text-[#1a1a1a]" : "border-[#e5e7eb] bg-[#f9f8f6] text-[#1a1a1a]")}
            >
              <option value="All">All roles</option>
              <option value="Dental Hygienist">Dental Hygienist</option>
              <option value="Dental Assistant">Dental Assistant</option>
              <option value="Front Desk">Front Desk</option>
              <option value="Treatment Coordinator">Treatment Coordinator</option>
              <option value="Sterilization Tech">Sterilization Tech</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div className="h-px bg-[#f3f4f6]" />

        {/* Reliability */}
        <div>
          <p className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest mb-1.5">Reliability</p>
          <div className="relative">
            <select
              value={selectedReliability}
              onChange={e => { setSelectedReliability(e.target.value); setCurrentPage(1) }}
              className={"w-full border-[1.5px] rounded-xl px-3 py-2 pr-8 text-[13px] font-semibold font-sans outline-none appearance-none cursor-pointer transition-all " + (selectedReliability !== 'All' ? "border-[#1a7f5e] bg-[#f0faf5] text-[#1a1a1a]" : "border-[#e5e7eb] bg-[#f9f8f6] text-[#1a1a1a]")}
            >
              <option value="All">Any reliability</option>
              <option value="excellent">Excellent — 95%+</option>
              <option value="verygood">Very Good — 85–94%</option>
              <option value="good">Good — 70–84%</option>
              <option value="poor">Poor — &lt;70%</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div className="h-px bg-[#f3f4f6]" />

        {/* Language */}
        <div>
          <p className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest mb-1.5">Language</p>
          <div className="relative">
            <select
              value={selectedLanguage}
              onChange={e => { setSelectedLanguage(e.target.value); setCurrentPage(1) }}
              className={"w-full border-[1.5px] rounded-xl px-3 py-2 pr-8 text-[13px] font-semibold font-sans outline-none appearance-none cursor-pointer transition-all " + (selectedLanguage ? "border-[#1a7f5e] bg-[#f0faf5] text-[#1a1a1a]" : "border-[#e5e7eb] bg-[#f9f8f6] text-[#1a1a1a]")}
            >
              <option value="">Any language</option>
              <option value="Spanish">Spanish</option>
              <option value="Mandarin">Mandarin</option>
              <option value="Vietnamese">Vietnamese</option>
              <option value="Portuguese">Portuguese</option>
              <option value="Arabic">Arabic</option>
              <option value="French">French</option>
              <option value="Tagalog">Tagalog</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div className="h-px bg-[#f3f4f6]" />

        {/* Profile photo */}
        <div
          onClick={() => setPhotoOnly(!photoOnly)}
          className="flex items-start gap-3 cursor-pointer select-none"
        >
          <div className={"w-[17px] h-[17px] rounded-[5px] border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all " + (photoOnly ? "bg-[#1a7f5e] border-[#1a7f5e]" : "border-[#d1d5db] hover:border-[#1a7f5e]")}>
            {photoOnly && <svg width="9" height="7" viewBox="0 0 14 11" fill="none"><path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#1a1a1a]">Profile photo</p>
            <p className="text-[11px] text-[#9ca3af] mt-0.5">Only show pros with a photo</p>
          </div>
        </div>

        <div className="h-px bg-[#f3f4f6]" />

        {/* Hourly rate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest">Hourly Rate</p>
            <span className="text-[11px] font-bold text-[#1a7f5e]">${minRate} – ${maxRate}/hr</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[12px] font-semibold pointer-events-none">$</span>
              <input type="number" value={minRate} onChange={e => setMinRate(Math.max(0, Number(e.target.value)))} min="0" max="150" placeholder="Min"
                className="w-full border-[1.5px] border-[#e5e7eb] rounded-xl pl-5 pr-2 py-2 text-[13px] font-semibold text-[#1a1a1a] bg-[#f9f8f6] outline-none focus:border-[#1a7f5e] transition" />
            </div>
            <span className="text-[#d1d5db] font-semibold flex-shrink-0">—</span>
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9ca3af] text-[12px] font-semibold pointer-events-none">$</span>
              <input type="number" value={maxRate} onChange={e => setMaxRate(Math.min(300, Number(e.target.value)))} min="0" max="300" placeholder="Max"
                className="w-full border-[1.5px] border-[#e5e7eb] rounded-xl pl-5 pr-2 py-2 text-[13px] font-semibold text-[#1a1a1a] bg-[#f9f8f6] outline-none focus:border-[#1a7f5e] transition" />
            </div>
          </div>
        </div>

        <div className="h-px bg-[#f3f4f6]" />

        {/* Distance */}
        <div>
          <p className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest mb-1.5">Max Distance</p>
          <div className="flex flex-wrap gap-1.5">
            {[5, 10, 20, 35, 50].map(m => (
              <button key={m} onClick={() => setMaxMiles(m)}
                className={"px-3 py-1.5 rounded-full text-[12px] font-semibold border-[1.5px] transition-all " + (maxMiles === m ? "bg-[#1a7f5e] border-[#1a7f5e] text-white" : "border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e] hover:text-[#1a7f5e]")}>
                {m} mi
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-[#f3f4f6]" />

        {/* Skill */}
        <div>
          <p className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest mb-1.5">Skill</p>
          <div className="relative">
            <select
              value={selectedSkill}
              onChange={e => { setSelectedSkill(e.target.value); setCurrentPage(1) }}
              className={"w-full border-[1.5px] rounded-xl px-3 py-2 pr-8 text-[13px] font-semibold font-sans outline-none appearance-none cursor-pointer transition-all " + (selectedSkill ? "border-[#1a7f5e] bg-[#f0faf5] text-[#1a1a1a]" : "border-[#e5e7eb] bg-[#f9f8f6] text-[#1a1a1a]")}
            >
              <option value="">Any skill</option>
              <option value="Scaling & Root Planing">Scaling &amp; Root Planing</option>
              <option value="Periodontal Charting">Periodontal Charting</option>
              <option value="Digital X-rays">Digital X-rays</option>
              <option value="Patient Education">Patient Education</option>
              <option value="Nitrous Oxide Monitoring">Nitrous Oxide Monitoring</option>
              <option value="Four-Handed Dentistry">Four-Handed Dentistry</option>
              <option value="Impression Taking">Impression Taking</option>
              <option value="Treatment Coordination">Treatment Coordination</option>
              <option value="Insurance Verification">Insurance Verification</option>
              <option value="Recall Scheduling">Recall Scheduling</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

        <div className="h-px bg-[#f3f4f6]" />

        {/* Certification */}
        <div>
          <p className="text-[10px] font-extrabold text-[#9ca3af] uppercase tracking-widest mb-1.5">Certification</p>
          <div className="relative">
            <select
              value={selectedCert}
              onChange={e => { setSelectedCert(e.target.value); setCurrentPage(1) }}
              className={"w-full border-[1.5px] rounded-xl px-3 py-2 pr-8 text-[13px] font-semibold font-sans outline-none appearance-none cursor-pointer transition-all " + (selectedCert ? "border-[#1a7f5e] bg-[#f0faf5] text-[#1a1a1a]" : "border-[#e5e7eb] bg-[#f9f8f6] text-[#1a1a1a]")}
            >
              <option value="">Any certification</option>
              <option value="Texas RDH License">Texas RDH License</option>
              <option value="CPR/BLS Certified">CPR/BLS Certified</option>
              <option value="Local Anesthesia Permit">Local Anesthesia Permit</option>
              <option value="Nitrous Oxide Permit">Nitrous Oxide Permit</option>
              <option value="Registered Dental Assistant">Registered Dental Assistant</option>
              <option value="X-Ray Certified">X-Ray Certified</option>
              <option value="Infection Control Certified">Infection Control Certified</option>
              <option value="HIPAA Compliance Certified">HIPAA Compliance Certified</option>
              <option value="Dental Billing Specialist">Dental Billing Specialist</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9ca3af]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>

      </div>
    </div>
  )


  return (
    <div className="min-h-screen bg-[#f9f8f6]">
      <Nav />

      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-sm font-semibold px-5 py-3 rounded-full z-50 shadow-lg flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#1a7f5e] flex items-center justify-center flex-shrink-0">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {toast}
        </div>
      )}

      {showFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowFilters(false)}></div>
          <div className="relative ml-auto w-[85%] max-w-sm bg-[#f9f8f6] h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-base font-extrabold text-[#1a1a1a]">Filters {activeFilterCount > 0 && <span className="text-xs text-[#1a7f5e]">({activeFilterCount} active)</span>}</p>
              <button onClick={() => setShowFilters(false)} className="text-[#9ca3af] hover:text-[#1a1a1a] text-xl">✕</button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowFilters(false)} className="w-full mt-4 bg-[#1a7f5e] text-white font-bold py-3 rounded-full text-sm">Show {filtered.length} results</button>
          </div>
        </div>
      )}

      {bookingModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => { setBookingModal(null); setBookingSubmitted(false); setAgreedToTerms(false) }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-[#f9f8f6] px-5 pt-5 pb-4 border-b border-[#e5e7eb] flex items-center gap-4">
              <img src={bookingModal.pro.img} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-lg font-extrabold text-[#111827] leading-tight">{bookingModal.pro.name}</p>
                  {bookingModal.pro.verified && <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{backgroundColor:'#4c1d95'}}><svg width="10" height="8" viewBox="0 0 14 11" fill="none"><path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                </div>
                <p className="text-xs font-semibold text-[#4b5563] mb-1">{bookingModal.pro.role} · ${bookingModal.pro.rate}/hr</p>
                <p className="text-xs font-bold text-[#1a7f5e]">March {bookingModal.day}, 2026 · {bookingModal.time}</p>
              </div>
              <button onClick={() => { setBookingModal(null); setBookingSubmitted(false); setAgreedToTerms(false) }} className="text-[#9ca3af] hover:text-[#1a1a1a] text-xl transition flex-shrink-0 self-start">✕</button>
            </div>
            {!bookingSubmitted ? (
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div><p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Start</p><select className="w-full border border-[#e5e7eb] rounded-xl px-2 py-1.5 text-xs outline-none focus:border-[#1a7f5e] bg-white"><option>7:00 AM</option><option>7:30 AM</option><option>8:00 AM</option><option>8:30 AM</option><option>9:00 AM</option></select></div>
                  <div><p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">End</p><select className="w-full border border-[#e5e7eb] rounded-xl px-2 py-1.5 text-xs outline-none focus:border-[#1a7f5e] bg-white"><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option></select></div>
                </div>
                <div className="mb-2"><p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Lunch Break</p><select className="w-full border border-[#e5e7eb] rounded-xl px-2 py-1.5 text-xs outline-none focus:border-[#1a7f5e] bg-white"><option>No lunch break</option><option>30 minutes</option><option>60 minutes</option></select></div>
                <div className="mb-3"><p className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-1">Note <span className="font-normal normal-case">(optional)</span></p><textarea placeholder="e.g. Please arrive 10 minutes early..." className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#1a7f5e] resize-none h-10 bg-white" /></div>
                <div onClick={() => setAgreedToTerms(!agreedToTerms)} className="flex items-center gap-2 cursor-pointer mb-3 bg-[#f9f8f6] border border-[#e5e7eb] rounded-xl px-3 py-2.5">
                  <div className={'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ' + (agreedToTerms ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db] hover:border-[#1a7f5e]')}>
                    {agreedToTerms && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <p className="text-xs text-[#374151]">I agree to kazi.'s <span className="text-[#1a7f5e] font-semibold hover:underline">Booking Terms</span></p>
                </div>
                <div className="bg-[#e8f5f0] border border-[#1a7f5e]/20 rounded-xl p-3 mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#1a7f5e] rounded-full flex items-center justify-center flex-shrink-0"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                    <div><p className="text-xs font-extrabold text-[#0f4d38]">Fill this shift faster with Rapid Fill</p><p className="text-xs text-[#1a7f5e]">Blast to up to 10 professionals at once.</p></div>
                  </div>
                  <button onClick={() => { if (!agreedToTerms) { showToast('Please agree to the booking terms before using Rapid Fill'); return } if (bookingModal.pro) toggleRapidFill(bookingModal.pro.id); setBookingModal(null); setBookingSubmitted(false); setAgreedToTerms(false); setExpandedAvailability(null); showToast('Select more professionals then Launch Rapid Fill ⚡') }} className={'w-full text-xs font-bold py-2 rounded-full flex items-center justify-center gap-1.5 transition ' + (agreedToTerms ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#d1d5db] text-[#9ca3af] cursor-not-allowed')}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    Use Rapid Fill — select more professionals →
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setBookingModal(null); setBookingSubmitted(false); setAgreedToTerms(false) }} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2 rounded-full text-xs hover:border-[#1a7f5e] transition">Cancel</button>
                  <button onClick={() => { if (!agreedToTerms) { showToast('Please agree to the booking terms first'); return } setBookingSubmitted(true); showToast('Booking request sent to ' + bookingModal.pro.name + '!') }} className={'flex-1 font-bold py-2 rounded-full text-xs transition ' + (agreedToTerms ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed')}>Send request</button>
                </div>
              </div>
            ) : (
              <div className="px-5 py-8 text-center">
                <div className="w-12 h-12 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-3"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg></div>
                <p className="text-sm font-extrabold text-[#1a7f5e] mb-1">Booking request sent!</p>
                <p className="text-xs text-[#6b7280]">{firstName(bookingModal.pro.name)} will respond within {bookingModal.pro.responseTime}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showRapidFill && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md flex flex-col overflow-hidden" style={{maxHeight:'85vh'}}>
            {!rapidFillSubmitted ? (
              <>
                <div className="bg-[#f9f8f6] border-b border-[#e5e7eb] px-6 py-5 flex-shrink-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#1a7f5e] rounded-full flex items-center justify-center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div><h2 className="text-base font-extrabold text-[#1a1a1a]">Rapid Fill ⚡</h2></div>
                    <button onClick={() => setShowRapidFill(false)} className="text-[#9ca3af] hover:text-[#1a1a1a] text-xl transition">✕</button>
                  </div>
                  <p className="text-xs text-[#6b7280] ml-11">First to accept gets the shift — others are auto-cancelled</p>
                  <p className="text-xs text-[#9ca3af] ml-11 mt-1"><span className="font-bold text-[#1a7f5e]">{rapidFillSelected.length}</span>/10 selected</p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {selectedPros.length === 0 ? <p className="text-sm text-[#9ca3af] text-center py-6">No professionals selected.</p> : (
                    <div className="flex flex-col gap-2">
                      {selectedPros.map(pro => (
                        <div key={pro.id} className="flex items-center gap-3 bg-[#f9f8f6] rounded-xl p-3 border border-[#e5e7eb]">
                          <img src={pro.img} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-[#1a1a1a]">{pro.name}</p><p className="text-xs text-[#6b7280]">${pro.rate}/hr · {pro.reliability}% reliable · ★ {pro.rating}</p></div>
                          <button onClick={() => toggleRapidFill(pro.id)} className="text-[#9ca3af] hover:text-red-400 transition">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-[#e5e7eb] bg-white flex-shrink-0">
                  <p className="text-xs text-[#9ca3af] mb-4">Once one professional accepts, the shift is locked and all others are notified.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowRapidFill(false)} className="flex-1 border border-[#e5e7eb] text-[#1a1a1a] font-bold py-2.5 rounded-full text-sm hover:border-[#1a7f5e] transition">Cancel</button>
                    <button onClick={() => rapidFillSelected.length > 0 && setRapidFillSubmitted(true)} className={'flex-1 font-bold py-2.5 rounded-full text-sm transition flex items-center justify-center gap-2 ' + (rapidFillSelected.length > 0 ? 'bg-[#1a7f5e] hover:bg-[#156649] text-white' : 'bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed')}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Send to {rapidFillSelected.length}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-[#e8f5f0] rounded-full flex items-center justify-center mx-auto mb-4"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                <h3 className="text-xl font-extrabold text-[#1a1a1a] mb-2">Rapid Fill sent! ⚡</h3>
                <p className="text-sm text-[#6b7280] mb-1">Blasted to <strong>{rapidFillSelected.length} professionals</strong>.</p>
                <p className="text-xs text-[#9ca3af] mb-6">First to accept gets the shift.</p>
                <div className="flex justify-center mb-6">{selectedPros.slice(0,5).map((p,i) => <img key={i} src={p.img} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow -ml-2 first:ml-0" />)}</div>
                <button onClick={() => { setShowRapidFill(false); setRapidFillSelected([]); setRapidFillSubmitted(false); showToast('Rapid Fill sent!') }} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-8 py-2.5 rounded-full text-sm transition">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-[860px] mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6 items-start">
          <div className="hidden md:block w-[230px] flex-shrink-0 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto"><FilterPanel /></div>
          <div className="flex-1 min-w-0">
            <div className="bg-white border border-[#e5e7eb] rounded-2xl p-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Search by name or role..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 border border-[#e5e7eb] rounded-xl text-xs outline-none focus:border-[#1a7f5e] transition bg-[#f9f8f6] text-[#1a1a1a]" />
                </div>
                <div className="relative flex-shrink-0">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="pl-8 pr-3 py-2 border border-[#e5e7eb] rounded-xl text-xs outline-none focus:border-[#1a7f5e] bg-[#f9f8f6] text-[#6b7280] w-full sm:w-auto" />
                </div>
                <div className="relative flex-shrink-0">
                  <button onClick={() => setShowSortMenu(!showSortMenu)} className="flex items-center gap-1.5 border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs font-semibold text-[#374151] hover:border-[#1a7f5e] transition bg-[#f9f8f6] w-full sm:w-auto justify-between sm:justify-start">
                    Sort: <span className="text-[#1a7f5e]">{sortBy}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setShowSortMenu(false)}></div>
                      <div className="absolute right-0 top-10 bg-white border border-[#e5e7eb] rounded-2xl shadow-lg z-40 w-44 overflow-hidden">
                        {sortOptions.map(o => <button key={o} onClick={() => { setSortBy(o); setShowSortMenu(false) }} className={'w-full text-left px-4 py-2.5 text-xs font-semibold transition ' + (sortBy === o ? 'bg-[#e8f5f0] text-[#1a7f5e]' : 'text-[#374151] hover:bg-[#f9f8f6]')}>{o}</button>)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setShowFilters(true)} className="md:hidden flex items-center gap-2 border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs font-semibold text-[#374151] hover:border-[#1a7f5e] transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                  Filters {activeFilterCount > 0 && <span className="bg-[#1a7f5e] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{activeFilterCount}</span>}
                </button>
                <p className="text-xs text-[#6b7280]"><span className="font-bold text-[#1a1a1a]">{filtered.length}</span> professionals found</p>
              </div>
              {rapidFillSelected.length === 0 ? (
                <div className="hidden sm:flex items-center gap-1.5 bg-[#e8f5f0] px-3 py-1.5 rounded-full">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a7f5e" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <p className="text-xs font-semibold text-[#0f4d38]">Check boxes to use Rapid Fill</p>
                </div>
              ) : (
                <button onClick={() => setShowRapidFill(true)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-4 py-1.5 rounded-full text-xs transition flex items-center gap-1.5">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  Rapid Fill ({rapidFillSelected.length})
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-[#e5e7eb] rounded-2xl flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
                <p className="text-[17px] font-extrabold text-[#1a1a1a] mb-2">No professionals found</p>
                <p className="text-[14px] text-[#9ca3af] leading-relaxed mb-6 max-w-[280px]">No one matches your current filters. Try adjusting the role, distance, or availability.</p>
                <button onClick={() => { setSelectedRole('All'); setSelectedReliability('All'); setSelectedCertifications([]); setSelectedSkills([]); setMaxMiles(50); setMinRate(0); setMaxRate(150); setSearch('') }} className="border-[1.5px] border-[#e5e7eb] text-[#374151] font-bold px-6 py-2.5 rounded-full text-sm hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition">
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map(pro => {
                  const isSelected = rapidFillSelected.includes(pro.id)
                  const isAvailabilityOpen = expandedAvailability === pro.id
                  const rel = getReliabilityDisplay(pro.reliability)
                  return (
                    <div key={pro.id} className={'bg-white border rounded-2xl overflow-hidden transition cursor-pointer ' + (isSelected ? 'border-[#1a7f5e] ring-1 ring-[#1a7f5e]' : 'border-[#e5e7eb] hover:border-[#d1d5db]')} onClick={(e) => { if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea') || e.target.closest('[data-calendar]')) return; navigate('/profile'); window.scrollTo({top:0,behavior:'smooth'}) }}>
                      <div className="p-4 md:p-5">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 pt-1">
                            <div onClick={e => { e.stopPropagation(); toggleRapidFill(pro.id) }} className={'w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition ' + (isSelected ? 'bg-[#1a7f5e] border-[#1a7f5e]' : 'border-[#d1d5db] hover:border-[#1a7f5e]')}>
                              {isSelected && <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <img src={pro.img} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover" />
                              {pro.verified && <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center" style={{backgroundColor:'#4c1d95'}}><svg width="12" height="10" viewBox="0 0 14 11" fill="none"><path d="M1.5 5.5L5.5 9.5L12.5 1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-xl md:text-2xl font-extrabold text-[#111827] hover:text-[#1a7f5e] transition leading-tight">{pro.name}</h3>
                                {pro.booked && <span className="hidden sm:inline text-[10px] font-bold text-[#1a7f5e] bg-[#e8f5f0] px-2 py-0.5 rounded-full">✓ Worked with you</span>}
                                {pro.available ? <span className="text-[10px] font-semibold text-[#1a7f5e]">● Active</span> : <span className="text-[10px] font-semibold text-[#9ca3af]">○ Unavailable</span>}
                              </div>
                              <p className="text-xl font-extrabold text-[#111827] flex-shrink-0">${pro.rate}<span className="text-xs font-normal text-[#4b5563]">/hr</span></p>
                            </div>
                            <p className="text-xs font-semibold text-[#4b5563] mb-2">{pro.role} · {pro.miles} mi away</p>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className="text-lg font-extrabold text-[#F97316]">★ {pro.rating} <span className="text-sm text-[#4b5563] font-normal">({pro.reviews} reviews)</span></span>
                              <span className="text-[#d1d5db]">·</span>
                              <span className={'text-xs font-extrabold px-2.5 py-1 rounded-full ' + rel.bg + ' ' + rel.color}>{rel.label} · {pro.reliability}%</span>
                              <span className="text-[#d1d5db]">·</span>
                              <span className="text-xs font-semibold text-[#374151]">{pro.shiftsCompleted} shifts</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                              {pro.software.map(s => <span key={s} className="text-[10px] md:text-[11px] font-semibold text-[#0f4d38] bg-[#e8f5f0] px-2 py-0.5 rounded-full">{s}</span>)}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {pro.certifications.map(c => <span key={c} className="text-[10px] font-semibold text-[#374151] bg-[#f3f4f6] px-2 py-0.5 rounded-full">✓ {c}</span>)}
                            </div>
                          </div>
                        </div>
                        <p className="text-[15px] text-[#374151] leading-relaxed mt-3 mb-4">{pro.about}</p>
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={e => { e.stopPropagation(); navigate('/messages') }} className="border border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e] hover:text-[#1a7f5e] text-xs font-semibold px-3 md:px-4 py-2 rounded-full transition flex items-center gap-1.5">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span className="hidden sm:inline">Message</span>
                          </button>
                          <button onClick={e => { e.stopPropagation(); setExpandedAvailability(isAvailabilityOpen ? null : pro.id) }} className="bg-[#1a7f5e] hover:bg-[#156649] text-white text-xs font-bold px-3 md:px-4 py-2 rounded-full transition flex items-center gap-1.5">
                            Availability
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points={isAvailabilityOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/></svg>
                          </button>
                        </div>
                      </div>
                      {isAvailabilityOpen && (
                        <div data-calendar className="border-t border-[#e5e7eb] bg-[#f9f8f6] px-4 md:px-5 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-extrabold text-[#1a1a1a]">March 2026</p>
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#1a7f5e]"></div><span className="text-[10px] text-[#4b5563]">Available</span></div>
                              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div><span className="text-[10px] text-[#4b5563]">Booked</span></div>
                              <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-[#d1d5db]"></div><span className="text-[10px] text-[#4b5563]">Unavailable</span></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-center text-[10px] font-bold text-[#9ca3af] py-1">{d}</div>)}
                          </div>
                          <div className="grid grid-cols-7 gap-1 mb-3">
                            {[...Array(31)].map((_,i) => {
                              const day = i + 1
                              const info = pro.calendar[day]
                              if (!info) return <div key={day} className="text-center text-[10px] py-2 rounded-lg text-[#d1d5db] font-semibold">{day}</div>
                              return (
                                <div key={day} onClick={e => { e.stopPropagation(); if (info.status === 'available') { setBookingModal({pro,day,time:info.time}); setBookingSubmitted(false); setAgreedToTerms(false) } }} className={'text-center rounded-lg font-semibold transition py-1.5 ' + getDayStyle(info.status)} title={info.time || 'Unavailable'}>
                                  <div className="text-[10px] md:text-[11px]">{day}</div>
                                  {info.time && info.status === 'available' && <div className="text-[7px] md:text-[8px] leading-tight opacity-80 px-0.5 hidden sm:block">{info.time.split(' – ')[0]}</div>}
                                </div>
                              )
                            })}
                          </div>
                          <p className="text-[11px] text-[#9ca3af] italic">Tap an available date to send a booking request</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1.5 mt-6 pb-4">
        <button
          onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-[10px] border border-[#e5e7eb] bg-white flex items-center justify-center text-[#9ca3af] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className={"w-9 h-9 rounded-[10px] border text-[13px] font-bold transition " + (currentPage === p ? "bg-[#1a7f5e] border-[#1a7f5e] text-white" : "bg-white border-[#e5e7eb] text-[#374151] hover:border-[#1a7f5e] hover:text-[#1a7f5e]")}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-9 h-9 rounded-[10px] border border-[#e5e7eb] bg-white flex items-center justify-center text-[#9ca3af] hover:border-[#1a7f5e] hover:text-[#1a7f5e] transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      
      {rapidFillSelected.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-sm md:max-w-none md:w-auto">
          <div className="bg-[#1a1a1a] text-white px-4 md:px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 justify-between md:justify-start">
            <div className="flex -space-x-2">{selectedPros.slice(0,3).map((p,i) => <img key={i} src={p.img} className="w-7 h-7 rounded-full object-cover border-2 border-[#1a1a1a]" />)}</div>
            <p className="text-xs font-semibold">{rapidFillSelected.length} selected</p>
            <button onClick={() => setShowRapidFill(true)} className="bg-[#1a7f5e] hover:bg-[#156649] text-white font-bold px-4 py-2 rounded-full text-xs transition flex items-center gap-1.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Launch Rapid Fill
            </button>
            <button onClick={() => setRapidFillSelected([])} className="text-[#9ca3af] hover:text-white transition text-lg">✕</button>
          </div>
        </div>
      )}
    </div>
  )
}
