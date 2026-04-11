import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import CategoryCard   from '../components/Hero/CategoryCard'
import LanguageSwitcher from '../components/shared/LanguageSwitcher'
import VoiceButton    from '../components/Voice/VoiceButton'

const CATEGORY_VOICE_MAP = {
  education: ['education', 'scholarship', 'school', 'college', 'shiksha'],
  health:    ['health', 'medical', 'hospital', 'insurance', 'swasthya'],
  housing:   ['housing', 'house', 'home', 'hostel', 'awas'],
  financial: ['pension', 'financial', 'money', 'income', 'arthik'],
  employment:['employment', 'job', 'skill', 'work', 'rozgaar'],
  other:     ['other', 'misc', 'anya'],
  all:       ['all', 'sab', 'every', 'sabhi'],
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t, setSelectedCategory, setCurrentStep, resetWizard } = useApp()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {
        // Fallback static list if backend not running
        setCategories([
          { id: 'education',  name: 'Education / Scholarship',  icon: '🎓', color: 'blue',   description: 'Scholarships & fellowships for students with disabilities' },
          { id: 'health',     name: 'Health Insurance',          icon: '🏥', color: 'green',  description: 'Medical coverage & healthcare support schemes' },
          { id: 'housing',    name: 'Housing / Hostel',          icon: '🏠', color: 'purple', description: 'Housing assistance & subsidised accommodation' },
          { id: 'financial',  name: 'Pension / Financial',       icon: '💰', color: 'yellow', description: 'Disability pensions & financial aid programs' },
          { id: 'employment', name: 'Employment / Skills',       icon: '💼', color: 'orange', description: 'Skill training, loans & employment support' },
          { id: 'other',      name: 'Other Schemes',             icon: '📋', color: 'pink',   description: 'Assistive devices, ID cards & more' },
          { id: 'all',        name: 'All Schemes',               icon: '🌐', color: 'indigo', description: 'Explore all 15+ government schemes at once' },
        ])
      })
  }, [])

  const handleCategoryClick = (id) => {
    resetWizard()
    setSelectedCategory(id)
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

  const STATS = [
    { value: '15+', label: t('schemes_count') },
    { value: '3',   label: t('languages_count') },
    { value: '100%', label: t('free_label') },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at 20% 20%, #1e1b4b 0%, #0a0a1a 55%, #0d1117 100%)' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-10 py-4 glass border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-lg font-black shadow-lg glow-purple">
            स
          </div>
          <span className="text-white font-extrabold text-lg tracking-tight">{t('app_name')}</span>
        </div>
        <div className="flex items-center gap-3">
          <VoiceButton onResult={handleVoice} compact />
          <LanguageSwitcher />
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative px-5 md:px-10 pt-20 pb-16 text-center overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-500/30 text-purple-300 text-xs font-medium mb-6 animate-slide-in-up">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          AI-Powered Eligibility Navigator
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight animate-slide-in-up"
          style={{ animationDelay: '80ms' }}>
          {t('app_name')}
          <br />
          <span className="gradient-text">{t('tagline')}</span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-white/60 text-base md:text-lg leading-relaxed animate-slide-in-up"
          style={{ animationDelay: '140ms' }}>
          {t('hero_subtitle')}
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-up"
          style={{ animationDelay: '200ms' }}>
          <button
            onClick={() => handleCategoryClick('all')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600
              hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl glow-purple
              transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {t('check_eligibility')} →
          </button>
          <a
            href="#categories"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl glass border border-white/15 hover:border-white/30 text-white/80 hover:text-white font-semibold text-base transition-all duration-300 hover:scale-105"
          >
            {t('explore_schemes')}
          </a>
        </div>

        {/* Stats bar */}
        <div className="mt-14 flex items-center justify-center gap-8 md:gap-16 animate-slide-in-up"
          style={{ animationDelay: '260ms' }}>
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-black gradient-text">{value}</div>
              <div className="text-white/40 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section id="categories" className="px-5 md:px-10 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white">{t('categories_heading')}</h2>
            <p className="text-white/50 mt-2 text-sm">{t('categories_subheading')}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, i) => (
              <CategoryCard
                key={cat.id}
                {...cat}
                onClick={handleCategoryClick}
                delay={i * 80}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 px-5 py-8 text-center">
        <p className="text-white/25 text-xs">
          Sahayak © 2025 · Built for persons with disabilities · Data sourced from Ministry of Social Justice & Empowerment, India
        </p>
      </footer>
    </div>
  )
}
