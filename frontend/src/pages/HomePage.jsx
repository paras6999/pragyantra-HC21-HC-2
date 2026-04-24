import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CategoryCard    from '../components/Hero/CategoryCard'
import LanguageSwitcher from '../components/shared/LanguageSwitcher'
import VoiceButton     from '../components/Voice/VoiceButton'

const CATEGORY_VOICE_MAP = {
  education:  ['education', 'scholarship', 'school', 'college', 'shiksha'],
  health:     ['health', 'medical', 'hospital', 'insurance', 'swasthya'],
  housing:    ['housing', 'house', 'home', 'hostel', 'awas'],
  financial:  ['pension', 'financial', 'money', 'income', 'arthik'],
  employment: ['employment', 'job', 'skill', 'work', 'rozgaar'],
  other:      ['other', 'misc', 'anya'],
  all:        ['all', 'sab', 'every', 'sabhi'],
}

const SORT_OPTIONS = [
  { value: 'default',   label: 'Default' },
  { value: 'name_asc',  label: 'A → Z' },
  { value: 'name_desc', label: 'Z → A' },
]

const DEFAULT_CATEGORIES = [
  { id: 'education',  name: 'Education / Scholarship',  icon: '🎓', color: 'blue',   description: 'Scholarships & fellowships for students with disabilities' },
  { id: 'health',     name: 'Health Insurance',          icon: '🏥', color: 'green',  description: 'Medical coverage & healthcare support schemes' },
  { id: 'housing',    name: 'Housing / Hostel',          icon: '🏠', color: 'purple', description: 'Housing assistance & subsidised accommodation' },
  { id: 'financial',  name: 'Pension / Financial',       icon: '💰', color: 'yellow', description: 'Disability pensions & financial aid programs' },
  { id: 'employment', name: 'Employment / Skills',       icon: '💼', color: 'orange', description: 'Skill training, loans & employment support' },
  { id: 'other',      name: 'Other Schemes',             icon: '📋', color: 'pink',   description: 'Assistive devices, ID cards & more' },
  { id: 'all',        name: 'All Schemes',               icon: '🌐', color: 'indigo', description: 'Explore all 20+ government schemes at once' },
]

function sortCategories(cats, sortBy) {
  const arr = [...cats]
  if (sortBy === 'name_asc')  return arr.sort((a, b) => a.name.localeCompare(b.name))
  if (sortBy === 'name_desc') return arr.sort((a, b) => b.name.localeCompare(a.name))
  return arr
}

export default function HomePage() {
  const navigate  = useNavigate()
  const { t, setSelectedCategory, resetWizard, screenReader, setScreenReader } = useApp()
  const [categories, setCategories] = useState([])
  const [sortBy, setSortBy]         = useState('default')

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => setCategories(DEFAULT_CATEGORIES))
  }, [])

  const handleCategoryClick = (id) => navigate(`/schemes/${id}`)

  const handleCheckAll = () => {
    resetWizard()
    setSelectedCategory('all')
    navigate('/wizard')
  }

  const handleVoice = (transcript) => {
    for (const [cat, keywords] of Object.entries(CATEGORY_VOICE_MAP)) {
      if (keywords.some(kw => transcript.includes(kw))) {
        handleCategoryClick(cat)
        return
      }
    }
  }

  const displayed = sortCategories(categories, sortBy)

  return (
    <div className="min-h-screen bg-[#F0F4F8]">

      {/* ── Tricolor Top Bar ── */}
      <div className="tricolor-bar" />

      {/* ── Top Black Accessibility Bar ── */}
      <div className="bg-[#1a2332] text-white text-xs py-1.5 px-4 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreenReader(!screenReader)} className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${screenReader ? 'bg-[#FF6600] text-white' : 'hover:bg-white/10'}`}>
            <span>♿</span>
            <span className="hidden sm:inline">{screenReader ? 'Screen Reader ON' : 'Screen Reader Accessible'}</span>
          </button>
          <span className="hidden md:flex items-center gap-1.5">
            <span>🔊</span>
            <span>Voice Enabled</span>
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <span>🌐</span>
            <span>3 Languages</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/50">|</span>
          <LanguageSwitcher />
        </div>
      </div>

      {/* ── Government Header ── */}
      <header className="bg-[#1a3569] shadow-gov-md">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex items-center justify-between gap-4">

          {/* Left — Logo + Title */}
          <div className="flex items-center gap-4">
            {/* National Emblem placeholder */}
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md flex-shrink-0">
              <span className="text-3xl">🇮🇳</span>
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium tracking-wide uppercase">
                Government of India &nbsp;|&nbsp; Ministry of Social Justice &amp; Empowerment
              </p>
              <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight leading-tight">
                Sahayak — Disability Scheme Navigator
              </h1>
              <p className="text-white/60 text-xs mt-0.5 hidden sm:block">
                सहायक — दिव्यांगजन योजना मार्गदर्शक
              </p>
            </div>
          </div>

          {/* Right — Voice + Skip link */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <VoiceButton onResult={handleVoice} compact />
            <a href="#categories"
              className="hidden md:block text-white/70 hover:text-white text-xs border border-white/20 rounded px-3 py-1.5 transition-colors">
              Skip to Schemes ↓
            </a>
          </div>
        </div>
      </header>

      {/* ── Thin Saffron Sub-nav strip ── */}
      <div className="bg-[#FF6600] text-white text-xs py-2 px-4 md:px-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-6 gap-y-1">
          <span className="font-semibold">🏠 Home</span>
          <a href="#categories" className="hover:underline opacity-90">Schemes</a>
          <button onClick={handleCheckAll} className="hover:underline opacity-90">Check Eligibility</button>
          <a href="https://disabilityaffairs.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-90 hidden md:inline">DEPwD Portal</a>
          <a href="https://swavlambancard.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-90 hidden md:inline">UDID Card</a>
          <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="hover:underline opacity-90 hidden md:inline">NSP Scholarships</a>
        </div>
      </div>

      {/* ── Hero Banner ── */}
      <section className="bg-gradient-to-r from-[#1a3569] via-[#1e3f7a] to-[#1a3569] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #FF6600 0%, transparent 50%), radial-gradient(circle at 80% 50%, #138808 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-12 md:py-16 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-slide-in-up">
              {/* Official badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded px-3 py-1.5 text-xs font-semibold mb-5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                RPwD Act 2016 — 21 Categories of Disability Covered
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-4">
                Find Government Schemes
                <br />
                <span className="text-[#FF6600]">Made for You</span>
              </h2>
              <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                Instantly discover which disability schemes you qualify for. Enter your details once — get personalised eligibility results, document checklists, and application guidance.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCheckAll}
                  className="gov-btn-saffron px-8 py-3.5 text-base rounded-md shadow-lg hover:scale-105 transition-transform"
                >
                  ✅ Check My Eligibility Now
                </button>
                <a
                  href="#categories"
                  className="gov-btn-secondary px-8 py-3.5 text-base rounded-md border-white/40 text-white hover:bg-white/10 text-center"
                >
                  📋 Browse All Schemes
                </a>
              </div>
            </div>

            {/* Stats panel */}
            <div className="animate-slide-in-up grid grid-cols-2 gap-4" style={{ animationDelay: '120ms' }}>
              {[
                { icon: '📋', value: '20+', label: 'Government Schemes', color: '#FF6600' },
                { icon: '♿', value: '21',  label: 'Disability Categories', color: '#138808' },
                { icon: '🗣️', value: '3',   label: 'Languages Supported', color: '#FF6600' },
                { icon: '🆓', value: '100%', label: 'Free Service', color: '#138808' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 border border-white/15 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-white/70 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Info Strip ── */}
      <div className="bg-[#DCFCE7] border-y border-[#86efac]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-3 flex flex-wrap items-center gap-x-8 gap-y-2">
          <span className="text-[#15803d] text-sm font-semibold flex items-center gap-2">
            <span className="text-base">✅</span> Right of Persons with Disabilities Act, 2016
          </span>
          <span className="text-[#15803d] text-sm flex items-center gap-2">
            <span>🏛️</span> Ministry of Social Justice &amp; Empowerment
          </span>
          <span className="text-[#15803d] text-sm flex items-center gap-2">
            <span>💳</span> Direct Benefit Transfer (DBT) enabled
          </span>
        </div>
      </div>

      {/* ── Category Cards ── */}
      <section id="categories" className="max-w-7xl mx-auto px-4 md:px-10 py-10">

        {/* Section header */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="gov-section-title">Scheme Categories</h2>
            <p className="text-gov-muted text-sm mt-1">
              Select a category to view schemes, benefits, and eligibility details
            </p>
          </div>

          {/* Sort control */}
          <div className="flex items-center gap-2">
            <span className="text-gov-muted text-xs">Sort by:</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all border ${
                  sortBy === opt.value
                    ? 'bg-[#1a3569] text-white border-[#1a3569]'
                    : 'bg-white text-gov-muted border-gov-border hover:border-[#1a3569] hover:text-[#1a3569]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              {...cat}
              onClick={handleCategoryClick}
              delay={i * 60}
            />
          ))}
        </div>
      </section>

      {/* ── Quick Help Strip ── */}
      <section className="bg-white border-y border-gov-border py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-10">
          <h2 className="gov-section-title mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '📂', title: 'Choose Category', desc: 'Select a scheme category that matches your needs' },
              { step: '02', icon: '📝', title: 'Fill Your Details', desc: 'Enter age, income, disability details — takes 2 minutes' },
              { step: '03', icon: '✅', title: 'Get Results', desc: 'See which schemes you qualify for, and which are within reach' },
              { step: '04', icon: '📄', title: 'Apply Online', desc: 'Get document checklist and direct links to apply' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1a3569] text-white flex items-center justify-center font-black text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-2xl mb-1">{item.icon}</p>
                  <h3 className="font-bold text-[#1a3569] text-sm mb-1">{item.title}</h3>
                  <p className="text-gov-muted text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-[#FF6600] py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-10 text-center">
          <h2 className="text-white text-2xl md:text-3xl font-black mb-3">
            ♿ Ready to Find Your Schemes?
          </h2>
          <p className="text-white/90 text-base mb-6 max-w-xl mx-auto">
            Takes less than 3 minutes. Discover all disability schemes you are eligible for — completely free.
          </p>
          <button
            onClick={handleCheckAll}
            className="bg-white text-[#FF6600] font-bold text-base px-10 py-4 rounded-md shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            Start Eligibility Check →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#0d1f3c] text-white/60 py-8 px-4 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 mb-6 text-sm">
            <div>
              <h4 className="text-white font-bold mb-2 flex items-center gap-2"><span>🇮🇳</span> Sahayak Portal</h4>
              <p className="text-xs leading-relaxed">
                A digital initiative to help Persons with Disabilities discover and access government welfare schemes under the RPwD Act, 2016.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Useful Links</h4>
              <ul className="space-y-1 text-xs">
                <li><a href="https://disabilityaffairs.gov.in" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">DEPwD — Department of Empowerment</a></li>
                <li><a href="https://swavlambancard.gov.in" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">UDID Card Portal</a></li>
                <li><a href="https://scholarships.gov.in" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">National Scholarship Portal</a></li>
                <li><a href="https://nsap.nic.in" className="hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">NSAP — Pension Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2">Helplines</h4>
              <ul className="space-y-1 text-xs">
                <li>📞 Disability Helpline: <span className="text-white">1800-11-4515</span></li>
                <li>📞 Aadhaar: <span className="text-white">1947</span></li>
                <li>📞 PM-JAY (Ayushman): <span className="text-white">14555</span></li>
                <li>📞 NHFDC: <span className="text-white">1800-11-8139</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4 text-center text-xs">
            © 2025 Sahayak · Government of India · Ministry of Social Justice &amp; Empowerment ·
            Data sourced from DEPwD, National Trust, UGC &amp; Ministry of Skill Development
          </div>
        </div>
      </footer>
    </div>
  )
}
