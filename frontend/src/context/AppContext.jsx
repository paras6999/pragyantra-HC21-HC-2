import { createContext, useContext, useState } from 'react'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import mr from '../i18n/mr.json'

const translations = { en, hi, mr }
const AppContext = createContext(null)

const initialForm = {
  /* Step 1 */
  firstName: '', middleName: '', lastName: '',
  age: '', income: '',
  /* Step 2 – global docs */
  passport_photo: false,
  bank_account: false,
  /* Step 3 – disability */
  has_disability_cert: false,
  disability_percent: 0,
  /* Step 4 – category docs */
  aadhaar_card: false,
  income_certificate: false,
  residence_proof: false,
  bonafide_certificate: false,
  student_id: false,
  previous_marksheet: false,
  resume: false,
  educational_certificates: false,
  employment_exchange_reg: false,
  health_card: false,
  medical_reports: false,
  bpl_card: false,
}

export function AppProvider({ children }) {
  const [language, setLanguage]               = useState('en')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentStep, setCurrentStep]         = useState(1)
  const [formData, setFormData]               = useState(initialForm)
  const [results, setResults]                 = useState(null)
  const [isLoading, setIsLoading]             = useState(false)

  const t = (key) => translations[language]?.[key] ?? key

  const updateFormData = (updates) =>
    setFormData(prev => ({ ...prev, ...updates }))

  const resetWizard = () => {
    setFormData(initialForm)
    setCurrentStep(1)
    setResults(null)
  }

  return (
    <AppContext.Provider value={{
      language, setLanguage,
      selectedCategory, setSelectedCategory,
      currentStep, setCurrentStep,
      formData, updateFormData,
      results, setResults,
      isLoading, setIsLoading,
      resetWizard,
      t,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
