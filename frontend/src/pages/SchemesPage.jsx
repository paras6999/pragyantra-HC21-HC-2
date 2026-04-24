import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import LanguageSwitcher from '../components/shared/LanguageSwitcher'

const CATEGORY_META = {
  education:  { icon: '🎓', label: 'Education / Scholarship',  color: '#1a3569', bg: 'bg-card-blue'   },
  health:     { icon: '🏥', label: 'Health Insurance',          color: '#138808', bg: 'bg-card-green'  },
  housing:    { icon: '🏠', label: 'Housing / Hostel',          color: '#5b21b6', bg: 'bg-card-purple' },
  financial:  { icon: '💰', label: 'Pension / Financial',       color: '#b45309', bg: 'bg-card-yellow' },
  employment: { icon: '💼', label: 'Employment / Skills',       color: '#c2410c', bg: 'bg-card-orange' },
  other:      { icon: '📋', label: 'Other Schemes',             color: '#be185d', bg: 'bg-card-pink'   },
  all:        { icon: '🌐', label: 'All Schemes',               color: '#1a3569', bg: 'bg-card-indigo' },
}

const SORT_OPTIONS = [
  { value: 'default',      label: 'Default'         },
  { value: 'name_asc',     label: 'Name A–Z'        },
  { value: 'name_desc',    label: 'Name Z–A'        },
  { value: 'income_asc',   label: 'Income Limit ↑'  },
  { value: 'income_desc',  label: 'Income Limit ↓'  },
]

function sortSchemes(schemes, sortBy) {
  const arr = [...schemes]
  switch (sortBy) {
    case 'name_asc':    return arr.sort((a, b) => a.name.localeCompare(b.name))
    case 'name_desc':   return arr.sort((a, b) => b.name.localeCompare(a.name))
    case 'income_asc':  return arr.sort((a, b) => (a.eligibility_rules?.max_income ?? Infinity) - (b.eligibility_rules?.max_income ?? Infinity))
    case 'income_desc': return arr.sort((a, b) => (b.eligibility_rules?.max_income ?? 0) - (a.eligibility_rules?.max_income ?? 0))
    default:            return arr
  }
}

export default function SchemesPage() {
  const navigate      = useNavigate()
  const { categoryId } = useParams()
  const { setSelectedCategory, resetWizard } = useApp()

  const [schemes, setSchemes]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [sortBy, setSortBy]           = useState('default')
  const [expanded, setExpanded]       = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  const meta = CATEGORY_META[categoryId] || CATEGORY_META.all

  useEffect(() => {
    setLoading(true)
    const url = categoryId === 'all' ? '/api/schemes' : `/api/schemes?category=${categoryId}`
    fetch(url)
      .then(r => r.json())
      .then(data => { setSchemes(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [categoryId])

  const handleCheckEligibility = () => {
    resetWizard()
    setSelectedCategory(categoryId)
    navigate('/wizard')
  }

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const filtered = searchQuery.trim()
    ? schemes.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : schemes

  const displayed = sortSchemes(filtered, sortBy)

  return (
    <div className="min-h-screen bg-[#F0F4F8]">

      {/* Tricolor */}
      <div className="tricolor-bar" />

      {/* Accessibility bar */}
      <div className="bg-[#1a2332] text-white text-xs py-1.5 px-4 md:px-10 flex items-center justify-between">
        <span className="flex items-center gap-2">♿ Accessible Portal &nbsp;·&nbsp; 🔊 Voice Enabled</span>
        <LanguageSwitcher />
      </div>

      {/* Government Header */}
      <header className="bg-[#1a3569] shadow-gov-md">
        <div className="max-w-7xl mx-auto px-4 md:px-10 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl shadow flex-shrink-0">
              🇮🇳
            </button>
            <div>
              <p className="text-white/60 text-xs">Ministry of Social Justice &amp; Empowerment</p>
              <h1 className="text-white text-lg font-bold">Sahayak — Disability Scheme Navigator</h1>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-white/80 hover:text-white text-sm border border-white/20 rounded px-3 py-1.5 transition-colors">
            ← Home
          </button>
        </div>
      </header>

      {/* Saffron nav strip */}
      <div className="bg-[#FF6600] text-white text-xs py-1.5 px-4 md:px-10 flex items-center gap-2">
        <button onClick={() => navigate('/')} className="hover:underline opacity-90">Home</button>
        <span>›</span>
        <span className="font-semibold">{meta.label}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

        {/* Category Header Card */}
        <div className={`${meta.bg} rounded-lg p-6 mb-6 text-white shadow-gov-md animate-slide-in-up`}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{meta.icon}</span>
            <div>
              <h2 className="text-2xl font-black">{meta.label}</h2>
              <p className="text-white/80 text-sm mt-1">
                {loading ? 'Loading...' : `${displayed.length} scheme${displayed.length !== 1 ? 's' : ''} found`}
              </p>
            </div>
          </div>
          <button
            onClick={handleCheckEligibility}
            className="bg-white text-[#1a3569] font-bold px-6 py-3 rounded-md text-sm hover:shadow-lg hover:scale-105 transition-all"
          >
            ✅ Check My Eligibility for {meta.label}
          </button>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-slide-in-up" style={{ animationDelay: '80ms' }}>
          <input
            type="text"
            placeholder="🔍 Search schemes by name or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="gov-input flex-1"
          />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="gov-input sm:w-48 cursor-pointer"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>Sort: {opt.label}</option>
            ))}
          </select>
        </div>

        {/* Schemes List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="gov-card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="gov-card p-12 text-center">
            <div className="text-5xl mb-4">🔎</div>
            <p className="text-gov-muted text-lg font-medium">No schemes found</p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-4 text-[#1a3569] hover:underline text-sm">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayed.map((scheme, i) => {
              const isOpen       = expanded[scheme.id]
              const maxIncome    = scheme.eligibility_rules?.max_income
              const minDisab     = scheme.eligibility_rules?.min_disability_percent
              const ageRange     = scheme.eligibility_rules?.age_range

              return (
                <div
                  key={scheme.id}
                  className="gov-card overflow-hidden animate-slide-in-up"
                  style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
                >
                  {/* Top colored strip */}
                  <div className={`${meta.bg} h-1.5`} />

                  <div className="p-5 md:p-6">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="text-[#1a3569] font-bold text-base md:text-lg leading-snug flex-1">
                        {scheme.name}
                      </h3>
                      {scheme.apply_url && (
                        <a
                          href={scheme.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs px-3 py-1.5 rounded border border-[#1a3569] text-[#1a3569] hover:bg-[#EEF2FF] transition-colors font-medium"
                        >
                          🔗 Apply
                        </a>
                      )}
                    </div>

                    {/* Eligibility tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {minDisab != null && (
                        <span className="info-tag">♿ {minDisab}%+ disability</span>
                      )}
                      {maxIncome != null ? (
                        <span className="info-tag">💰 Income ≤ ₹{maxIncome.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="info-tag">💰 No income limit</span>
                      )}
                      {ageRange && (
                        <span className="info-tag">👤 Age {ageRange[0]}–{ageRange[1]}</span>
                      )}
                    </div>

                    {/* Description */}
                    <p className={`text-gov-muted text-sm leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                      {scheme.description}
                    </p>

                    {/* Expanded: Benefits */}
                    {isOpen && scheme.benefits && (
                      <div className="mt-4 p-4 rounded-lg bg-[#F0F4F8] border border-gov-border">
                        <p className="text-[#1a3569] font-semibold text-xs uppercase tracking-wide mb-2">✨ Key Benefits</p>
                        <ul className="space-y-1.5">
                          {scheme.benefits.map((b, bi) => (
                            <li key={bi} className="flex items-start gap-2 text-sm text-gov-text">
                              <span className="text-[#138808] font-bold mt-0.5 flex-shrink-0">✓</span>
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Expanded: Documents */}
                    {isOpen && scheme.required_documents && (
                      <div className="mt-3 p-4 rounded-lg bg-[#FFFBEB] border border-[#fcd34d]">
                        <p className="text-[#92400e] font-semibold text-xs uppercase tracking-wide mb-2">📄 Documents Required</p>
                        <div className="flex flex-wrap gap-1.5">
                          {scheme.required_documents.map((doc, di) => (
                            <span key={di} className="px-2.5 py-1 rounded text-xs bg-white border border-[#fcd34d] text-[#92400e]">
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center gap-3 flex-wrap pt-3 border-t border-gov-border">
                      <button
                        onClick={() => toggleExpand(scheme.id)}
                        className="text-[#1a3569] hover:underline text-sm font-medium"
                      >
                        {isOpen ? '▲ Show less' : '▼ View details & benefits'}
                      </button>

                      <button
                        onClick={handleCheckEligibility}
                        className="ml-auto gov-btn-primary px-5 py-2 text-sm rounded-md"
                      >
                        Check Eligibility →
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && displayed.length > 0 && (
          <div className="mt-8 bg-[#1a3569] rounded-lg p-6 text-white text-center animate-slide-in-up">
            <p className="text-white/80 text-sm mb-4">
              Want to know which of these {displayed.length} schemes you qualify for?
            </p>
            <button
              onClick={handleCheckEligibility}
              className="gov-btn-saffron px-8 py-3 text-sm rounded-md"
            >
              ✅ Check My Eligibility Now →
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0d1f3c] text-white/50 py-4 px-4 text-center text-xs mt-8">
        © 2025 Sahayak · Government of India · Ministry of Social Justice &amp; Empowerment
      </footer>
    </div>
  )
}
