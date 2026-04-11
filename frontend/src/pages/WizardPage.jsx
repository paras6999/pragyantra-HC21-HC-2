import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProgressBar     from '../components/shared/ProgressBar'
import LanguageSwitcher from '../components/shared/LanguageSwitcher'
import Step1_BasicInfo  from '../components/Wizard/Step1_BasicInfo'
import Step2_GlobalDocs from '../components/Wizard/Step2_GlobalDocs'
import Step3_Disability from '../components/Wizard/Step3_Disability'
import Step4_CategoryDocs from '../components/Wizard/Step4_CategoryDocs'

const TOTAL_STEPS = 4

export default function WizardPage() {
  const navigate = useNavigate()
  const {
    currentStep, setCurrentStep,
    formData, setResults, setIsLoading, isLoading,
    t,
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
      age:                Number(formData.age),
      income:             Number(formData.income),
      disability_percent: formData.has_disability_cert ? Number(formData.disability_percent) : 0,
      documents: {
        passport_photo:         formData.passport_photo,
        bank_account:           formData.bank_account,
        disability_certificate: formData.has_disability_cert,
        aadhaar_card:           formData.aadhaar_card,
        income_certificate:     formData.income_certificate,
        residence_proof:        formData.residence_proof,
        bonafide_certificate:   formData.bonafide_certificate,
        student_id:             formData.student_id,
        previous_marksheet:     formData.previous_marksheet,
        resume:                 formData.resume,
        educational_certificates: formData.educational_certificates,
        employment_exchange_reg:  formData.employment_exchange_reg,
        health_card:            formData.health_card,
        medical_reports:        formData.medical_reports,
        bpl_card:               formData.bpl_card,
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
      alert('Could not connect to server. Please make sure Flask backend is running on port 5000.')
    } finally {
      setIsLoading(false)
    }
  }

  const stepComponents = [
    <Step1_BasicInfo  key={1} onNext={goNext}         onBack={goBack} />,
    <Step2_GlobalDocs key={2} onNext={goNext}         onBack={goBack} />,
    <Step3_Disability key={3} onNext={goNext}         onBack={goBack} />,
    <Step4_CategoryDocs key={4} onNext={handleSubmit} onBack={goBack} />,
  ]

  const stepTitles = ['Tell Us About You', 'Basic Documents', 'Disability Details', 'Document Checklist']

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'radial-gradient(ellipse at top right, #1e1b4b 0%, #0a0a1a 60%)' }}
    >
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-5 md:px-8 py-4 glass border-b border-white/5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
          aria-label="Back to home"
        >
          ← Home
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-sm font-black">
            स
          </div>
          <span className="text-white font-bold text-sm hidden sm:block">{t('app_name')}</span>
        </div>

        <LanguageSwitcher />
      </nav>

      {/* ── Content ── */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">

          {/* Progress */}
          <ProgressBar current={currentStep} total={TOTAL_STEPS} />

          {/* Step label */}
          <div className="mt-4 mb-6 flex items-center justify-between">
            <p className="text-white/35 text-xs font-medium uppercase tracking-wider">
              {t('step')} {currentStep} {t('of')} {TOTAL_STEPS}
            </p>
            <p className="text-white/35 text-xs">{stepTitles[currentStep - 1]}</p>
          </div>

          {/* Step card */}
          <div className="glass rounded-2xl p-6 md:p-8 shadow-2xl">
            {stepComponents[currentStep - 1]}
          </div>

          {/* Accessibility hint */}
          <p className="mt-4 text-center text-white/20 text-xs">
            Use the 🎤 button to answer by voice · All questions are optional unless marked *
          </p>
        </div>
      </div>
    </div>
  )
}
