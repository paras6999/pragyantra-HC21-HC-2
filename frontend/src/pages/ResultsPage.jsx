import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import SchemeCard             from '../components/Results/SchemeCard'
import EligibilityScore       from '../components/Results/EligibilityScore'
import DocumentGuidancePanel  from '../components/Guidance/DocumentGuidancePanel'
import GreyZoneMapPanel       from '../components/Map/GreyZoneMapPanel'
import LanguageSwitcher       from '../components/shared/LanguageSwitcher'

const TABS = [
  { key: 'all',          label: 'All',          icon: '🌐' },
  { key: 'eligible',     label: 'Eligible',     icon: '✅' },
  { key: 'grey_zone',    label: 'Grey Zone',    icon: '🟡' },
  { key: 'not_eligible', label: 'Not Eligible', icon: '❌' },
]

export default function ResultsPage() {
  const navigate = useNavigate()
  const { results, formData, resetWizard, t } = useApp()
  const [activeTab,  setActiveTab]  = useState('all')
  const [guidanceDoc, setGuidanceDoc] = useState(null)

  // Redirect if no results
  if (!results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: '#0a0a1a' }}>
        <p className="text-white/50 text-lg mb-6">No results yet. Please complete the eligibility wizard first.</p>
        <button onClick={() => navigate('/wizard')}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all">
          Go to Wizard →
        </button>
      </div>
    )
  }

  const { eligible, grey_zone, not_eligible, total } = results

  const allSchemes = [...eligible, ...grey_zone, ...not_eligible]

  const FILTERED = {
    all:          allSchemes,
    eligible:     eligible,
    grey_zone:    grey_zone,
    not_eligible: not_eligible,
  }

  const displayed = FILTERED[activeTab] || allSchemes

  const displayedDocsMissing = Array.from(new Set(displayed.flatMap(s => s.missing_docs || [])))

  const tabCount = (key) => ({
    all: total, eligible: eligible.length, grey_zone: grey_zone.length, not_eligible: not_eligible.length,
  }[key])

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at bottom left, #1e1b4b 0%, #0a0a1a 55%)' }}>

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-5 md:px-10 py-4 glass border-b border-white/5">
        <button
          onClick={() => { resetWizard(); navigate('/wizard') }}
          className="text-white/60 hover:text-white text-sm font-medium transition-colors"
          aria-label="Check again"
        >
          {t('check_again')}
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-sm font-black">
            स
          </div>
          <span className="text-white font-bold text-sm hidden sm:block">{t('app_name')}</span>
        </div>

        <LanguageSwitcher />
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="animate-slide-in-up">
          <h1 className="text-2xl md:text-3xl font-black text-white">
            {formData.firstName ? `${formData.firstName}'s ` : ''}{t('results_title')}
          </h1>
          <p className="text-white/50 mt-1 text-sm">{t('results_subtitle')}</p>
        </div>

        {/* ── Score card ── */}
        <div className="animate-slide-in-up" style={{ animationDelay: '80ms' }}>
          <EligibilityScore results={results} />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 animate-slide-in-up" style={{ animationDelay: '120ms' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              aria-pressed={activeTab === tab.key}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                ${activeTab === tab.key
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg'
                  : 'glass border-white/10 text-white/60 hover:text-white hover:border-white/20'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-xs
                ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-white/10 text-white/40'}`}>
                {tabCount(tab.key)}
              </span>
            </button>
          ))}
        </div>

        {/* ── Scheme cards ── */}
        <div className="space-y-3">
          {displayed.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <p className="text-white/30 text-lg">No schemes in this category</p>
            </div>
          ) : (
            displayed.map((scheme, i) => (
              <SchemeCard
                key={scheme.scheme_id}
                scheme={scheme}
                index={i}
                onGetGuidance={setGuidanceDoc}
              />
            ))
          )}
        </div>

        {/* ── Gray Zone Map Panel ── */}
        {displayedDocsMissing.length > 0 && (
          <div className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <GreyZoneMapPanel missingDocs={displayedDocsMissing} />
          </div>
        )}

        {/* ── Recommendation footer ── */}
        <div className="glass rounded-2xl p-5 flex items-start gap-4 animate-slide-in-up">
          <span className="text-3xl">💡</span>
          <div>
            <p className="text-white font-semibold text-sm">Recommendation Engine</p>
            <p className="text-white/50 text-xs mt-1">
              Based on your profile, persons like you have also benefited from{' '}
              <span className="text-purple-300 font-medium">ADIP Scheme</span> and{' '}
              <span className="text-purple-300 font-medium">State Disability Pension</span>.
              Make sure to explore the Grey Zone schemes — many can be unlocked quickly.
            </p>
          </div>
        </div>

        {/* ── Home button ── */}
        <div className="text-center pb-4">
          <button onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl glass border border-white/10 hover:border-white/25 text-white/60 hover:text-white text-sm font-medium transition-all">
            ← Back to Home
          </button>
        </div>
      </div>

      {/* ── Document Guidance Panel ── */}
      {guidanceDoc && (
        <DocumentGuidancePanel
          docKey={guidanceDoc}
          onClose={() => setGuidanceDoc(null)}
        />
      )}
    </div>
  )
}
