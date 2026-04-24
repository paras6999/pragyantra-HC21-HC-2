import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import SchemeCard            from '../components/Results/SchemeCard'
import EligibilityScore      from '../components/Results/EligibilityScore'
import DocumentGuidancePanel from '../components/Guidance/DocumentGuidancePanel'
import GreyZoneMapPanel      from '../components/Map/GreyZoneMapPanel'
import LanguageSwitcher      from '../components/shared/LanguageSwitcher'

const TABS = [
  { key: 'all',          label: 'All Schemes',  icon: '🌐', color: '#1a3569' },
  { key: 'eligible',     label: 'Eligible',      icon: '✅', color: '#138808' },
  { key: 'grey_zone',    label: 'Grey Zone',     icon: '🟡', color: '#b45309' },
  { key: 'not_eligible', label: 'Not Eligible',  icon: '❌', color: '#dc2626' },
]

export default function ResultsPage() {
  const navigate = useNavigate()
  const { results, formData, resetWizard, t, screenReader, setScreenReader } = useApp()
  const [activeTab,   setActiveTab]   = useState('all')
  const [guidanceDoc, setGuidanceDoc] = useState(null)

  if (!results) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0F4F8]">
        <div className="gov-card p-10 text-center max-w-md mx-auto">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-[#1a3569] text-lg font-bold mb-2">No Results Yet</p>
          <p className="text-[#5C6B7A] text-sm mb-6">Please complete the eligibility wizard first.</p>
          <button onClick={() => navigate('/wizard')} className="gov-btn-primary px-8 py-3 rounded-md text-sm">
            Go to Wizard →
          </button>
        </div>
      </div>
    )
  }

  const { eligible, grey_zone, not_eligible, total } = results

  const FILTERED = {
    all:          [...eligible, ...grey_zone, ...not_eligible],
    eligible,
    grey_zone,
    not_eligible,
  }
  const displayed = FILTERED[activeTab] || FILTERED.all
  const displayedDocsMissing = Array.from(new Set(displayed.flatMap(s => s.missing_docs || [])))
  const tabCount = (key) => ({ all: total, eligible: eligible.length, grey_zone: grey_zone.length, not_eligible: not_eligible.length }[key])

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">

      {/* Tricolor */}
      <div className="tricolor-bar" />

      {/* Accessibility bar */}
      <div className="bg-[#1a2332] text-white text-xs py-1.5 px-4 md:px-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreenReader(!screenReader)} className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${screenReader ? 'bg-[#FF6600] text-white font-bold' : 'hover:bg-white/10'}`}>
            <span>♿</span> <span>{screenReader ? 'Screen Reader ON' : 'Accessible Portal'}</span>
          </button>
          <span className="hidden sm:inline text-white/70">&nbsp;·&nbsp; 🔊 Voice Enabled</span>
        </div>
        <LanguageSwitcher variant="dark" />
      </div>

      {/* Government Header */}
      <header className="bg-[#1a3569] shadow-gov sticky top-0 z-30">
        <nav className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <button
            onClick={() => { resetWizard(); navigate('/wizard') }}
            className="text-white/80 hover:text-white text-sm font-medium transition-colors border border-white/20 rounded px-3 py-1.5"
          >
            {t('check_again')}
          </button>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-lg">♿</div>
            <span className="text-white font-bold text-sm hidden sm:block">{t('app_name')} — Eligibility Report</span>
          </button>
          <button onClick={() => navigate('/')} className="text-white/80 hover:text-white text-sm border border-white/20 rounded px-3 py-1.5 transition-colors">
            🏠 Home
          </button>
        </nav>
      </header>

      {/* Saffron breadcrumb */}
      <div className="bg-[#FF6600] text-white text-xs py-1.5 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button onClick={() => navigate('/')} className="hover:underline opacity-90">Home</button>
          <span>›</span>
          <button onClick={() => { resetWizard(); navigate('/wizard') }} className="hover:underline opacity-90">Wizard</button>
          <span>›</span>
          <span className="font-semibold">Your Eligibility Report</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6 flex-1">

        {/* Page title */}
        <div className="animate-slide-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-1.5 rounded-full bg-[#FF6600]" />
            <h1 className="text-2xl md:text-3xl font-black text-[#1a3569]">
              {formData.firstName ? `${formData.firstName}'s ` : ''}{t('results_title')}
            </h1>
          </div>
          <p className="text-[#5C6B7A] text-sm ml-5">{t('results_subtitle')}</p>
        </div>

        {/* Score card */}
        <div className="animate-slide-in-up" style={{ animationDelay: '80ms' }}>
          <EligibilityScore results={results} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 animate-slide-in-up" style={{ animationDelay: '120ms' }}>
          {TABS.map(tab => {
            const count = tabCount(tab.key)
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-pressed={isActive}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  isActive
                    ? 'bg-[#1a3569] border-[#1a3569] text-white shadow-gov'
                    : 'bg-white border-gov-border text-[#5C6B7A] hover:border-[#1a3569] hover:text-[#1a3569]'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#F0F4F8] text-[#5C6B7A]'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Scheme cards */}
        <div className="space-y-3">
          {displayed.length === 0 ? (
            <div className="gov-card p-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-[#5C6B7A] text-base">No schemes in this category</p>
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

        {/* Grey Zone Map Panel */}
        {displayedDocsMissing.length > 0 && (
          <div className="animate-slide-in-up" style={{ animationDelay: '200ms' }}>
            <GreyZoneMapPanel missingDocs={displayedDocsMissing} />
          </div>
        )}

        {/* Recommendation tip */}
        <div className="bg-[#EEF2FF] border border-blue-200 rounded-lg p-5 flex items-start gap-4 animate-slide-in-up">
          <span className="text-3xl">💡</span>
          <div>
            <p className="text-[#1a3569] font-bold text-sm">Official Scheme Recommendation</p>
            <p className="text-[#5C6B7A] text-xs mt-1 leading-relaxed">
              Based on your profile, people like you also benefit from{' '}
              <span className="text-[#1a3569] font-semibold">ADIP Scheme</span> and{' '}
              <span className="text-[#1a3569] font-semibold">State Disability Pension</span>.
              Grey Zone schemes can often be unlocked by obtaining just one or two documents.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button
            onClick={() => { resetWizard(); navigate('/wizard') }}
            className="gov-btn-secondary flex-1 py-3 rounded-md text-sm"
          >
            ← Check Eligibility Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="gov-btn-primary flex-1 py-3 rounded-md text-sm"
          >
            🏠 Back to Home
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0d1f3c] text-white/40 py-3 px-4 text-center text-xs">
        © 2025 Sahayak · Government of India · Ministry of Social Justice &amp; Empowerment
      </footer>

      {/* Document Guidance Panel */}
      {guidanceDoc && (
        <DocumentGuidancePanel
          docKey={guidanceDoc}
          onClose={() => setGuidanceDoc(null)}
        />
      )}
    </div>
  )
}
