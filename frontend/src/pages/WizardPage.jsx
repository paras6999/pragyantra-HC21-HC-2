import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProgressBar       from '../components/shared/ProgressBar'
import LanguageSwitcher  from '../components/shared/LanguageSwitcher'
import Step1_BasicInfo   from '../components/Wizard/Step1_BasicInfo'
import Step2_GlobalDocs  from '../components/Wizard/Step2_GlobalDocs'
import Step3_Disability  from '../components/Wizard/Step3_Disability'
import Step4_CategoryDocs from '../components/Wizard/Step4_CategoryDocs'

const TOTAL_STEPS = 4

export default function WizardPage() {
  const navigate = useNavigate()
  const {
    currentStep, setCurrentStep,
    formData, setResults, setIsLoading, isLoading,
    selectedCategory,
    t, screenReader, setScreenReader
  } = useApp()

  const goNext = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(s => s + 1)
  }

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1)
    else navigate('/')
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const payload = {
      selected_category:  selectedCategory,
      age:                Number(formData.age),
      income:             Number(formData.income),
      disability_percent: formData.has_disability_cert ? Number(formData.disability_percent) : 0,
      documents: {
        passport_photo:           formData.passport_photo,
        bank_account:             formData.bank_account,
        disability_certificate:   formData.has_disability_cert,
        aadhaar_card:             formData.aadhaar_card,
        income_certificate:       formData.income_certificate,
        residence_proof:          formData.residence_proof,
        bonafide_certificate:     formData.bonafide_certificate,
        student_id:               formData.student_id,
        previous_marksheet:       formData.previous_marksheet,
        resume:                   formData.resume,
        educational_certificates: formData.educational_certificates,
        employment_exchange_reg:  formData.employment_exchange_reg,
        health_card:              formData.health_card,
        medical_reports:          formData.medical_reports,
        bpl_card:                 formData.bpl_card,
      },
    }

    try {
      const response = await fetch('/api/check_eligibility', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      const data = await response.json()
      setResults(data)
      navigate('/results')
    } catch (err) {
      console.error('Eligibility check failed:', err)
      alert('Could not connect to server. Make sure Flask backend is running on port 5000.')
    } finally {
      setIsLoading(false)
    }
  }

  const stepComponents = [
    <Step1_BasicInfo   key={1} onNext={goNext}        onBack={goBack} />,
    <Step2_GlobalDocs  key={2} onNext={goNext}        onBack={goBack} />,
    <Step3_Disability  key={3} onNext={goNext}        onBack={goBack} />,
    <Step4_CategoryDocs key={4} onNext={handleSubmit} onBack={goBack} />,
  ]

  const stepTitles = ['Basic Information', 'Basic Documents', 'Disability Details', 'Document Checklist']

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex flex-col">

      {/* Tricolor */}
      <div className="tricolor-bar" />

      {/* Accessibility bar */}
      <div className="bg-[#1a2332] text-white text-xs py-1.5 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => setScreenReader(!screenReader)} className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-colors ${screenReader ? 'bg-[#FF6600] text-white font-bold' : 'hover:bg-white/10'}`}>
            <span>♿</span> <span>{screenReader ? 'Screen Reader ON' : 'Accessible Portal'}</span>
          </button>
          <span className="hidden sm:inline text-white/70">&nbsp;·&nbsp; 🔊 Voice Enabled</span>
        </div>
      </div>

      {/* Government Header */}
      <header className="bg-[#1a3569] shadow-gov">
        <nav className="max-w-4xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          {/* Back */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors border border-white/20 rounded px-3 py-1.5"
          >
            ← Home
          </button>

          {/* Title */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-lg">
              ♿
            </div>
            <span className="text-white font-bold text-sm hidden sm:block">
              {t('app_name')} — Eligibility Wizard
            </span>
          </button>

          {/* Language switcher — dark variant for navy header */}
          <LanguageSwitcher variant="dark" />
        </nav>
      </header>

      {/* Saffron breadcrumb strip */}
      <div className="bg-[#FF6600] text-white text-xs py-1.5 px-4 md:px-8">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button onClick={() => navigate('/')} className="hover:underline opacity-90">Home</button>
          <span>›</span>
          <span className="font-semibold">Eligibility Check — Step {currentStep} of {TOTAL_STEPS}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Official notice box */}
          <div className="bg-[#DCFCE7] border border-[#86efac] rounded-lg px-4 py-3 mb-5 flex items-start gap-3">
            <span className="text-[#138808] text-xl mt-0.5">ℹ️</span>
            <div>
              <p className="text-[#15803d] text-xs font-semibold">Government Eligibility Assessment</p>
              <p className="text-[#166534] text-xs mt-0.5">
                Under the Rights of Persons with Disabilities Act, 2016 · Ministry of Social Justice &amp; Empowerment
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white border border-gov-border rounded-lg px-5 py-4 mb-5 shadow-gov">
            <ProgressBar current={currentStep} total={TOTAL_STEPS} />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[#5C6B7A] text-xs font-medium uppercase tracking-wide">
                {t('step')} {currentStep} {t('of')} {TOTAL_STEPS}
              </p>
              <p className="text-[#1a3569] text-xs font-semibold">{stepTitles[currentStep - 1]}</p>
            </div>
          </div>

          {/* Step card — white background, fully visible */}
          <div className="bg-white border border-gov-border rounded-lg shadow-gov overflow-hidden step-enter">
            {/* Colored top strip */}
            <div className="h-1.5 bg-gradient-to-r from-[#1a3569] to-[#FF6600]" />
            <div className="p-6 md:p-8">
              {stepComponents[currentStep - 1]}
            </div>
          </div>

          {/* Accessibility hint */}
          <p className="mt-4 text-center text-[#5C6B7A] text-xs">
            🎤 Use the microphone button to answer by voice &nbsp;·&nbsp; All questions are optional unless marked *
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0d1f3c] text-white/40 py-3 px-4 text-center text-xs">
        © 2025 Sahayak · Government of India · Ministry of Social Justice &amp; Empowerment
      </footer>
    </div>
  )
}
