import { createContext, useContext, useState, useEffect } from 'react'
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
  const [screenReader, setScreenReader]       = useState(false)

  const t = (key) => translations[language]?.[key] ?? key

  // --- Screen Reader Logic ---
  useEffect(() => {
    if (!screenReader || !window.speechSynthesis) {
      window.speechSynthesis?.cancel()
      return
    }

    let lastText = ''

    const handleMouseOver = (e) => {
      // Find closest element with text (headings, paras, buttons, spans with content)
      const target = e.target.closest('h1, h2, h3, h4, p, button, label, li, a')
      if (!target) return
      
      const text = target.innerText?.trim()
      if (text && text !== lastText) {
        lastText = text
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN'
        utterance.rate = 0.9 // slightly slower for accessibility
        window.speechSynthesis.speak(utterance)
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    
    // Announce enablement
    const u = new SpeechSynthesisUtterance('Screen reader enabled. Hover over text to read.')
    window.speechSynthesis.speak(u)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      window.speechSynthesis.cancel()
    }
  }, [screenReader, language])
  // ---------------------------


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
      screenReader, setScreenReader,
      resetWizard,
      t,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
