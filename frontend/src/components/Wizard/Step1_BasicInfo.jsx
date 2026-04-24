import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import VoiceButton from '../Voice/VoiceButton'

// Reusable styled input for government theme
function GovInput({ label, required, error, children, hint }) {
  return (
    <div>
      <label className="block text-[#1a3569] text-xs font-semibold mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-[#FF6600]">*</span>}
      </label>
      {children}
      {hint  && <p className="text-[#5C6B7A] text-xs mt-1">{hint}</p>}
      {error && <p className="text-red-600 text-xs mt-1 flex items-center gap-1">⚠ {error}</p>}
    </div>
  )
}

const inputClass = (error) =>
  `gov-input ${error ? 'border-red-400 focus:border-red-500' : ''}`

export default function Step1_BasicInfo({ onNext, onBack }) {
  const { formData, updateFormData, t } = useApp()
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!formData.firstName?.trim())                          e.firstName = 'First name is required'
    if (!formData.age || formData.age < 1 || formData.age > 120) e.age = 'Enter a valid age (1–120)'
    if (formData.income === '' || formData.income === undefined) e.income  = 'Enter annual income (0 if none)'
    return e
  }

  const handleNext = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onNext()
  }

  const handleVoice = (transcript) => {
    const ageMatch = transcript.match(/(\d+)\s*(year|sal|saal|वर्ष|years)?/)
    if (ageMatch) updateFormData({ age: ageMatch[1] })
  }

  return (
    <div className="step-enter space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-gov-border">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1a3569]">{t('step1_title')}</h2>
          <p className="text-[#5C6B7A] mt-0.5 text-sm">{t('step1_subtitle')}</p>
        </div>
        <VoiceButton onResult={handleVoice} compact />
      </div>

      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { key: 'firstName',  label: t('first_name'),  required: true  },
          { key: 'middleName', label: t('middle_name'), required: false },
          { key: 'lastName',   label: t('last_name'),   required: false },
        ].map(({ key, label, required }) => (
          <GovInput key={key} label={label} required={required} error={errors[key]}>
            <input
              type="text"
              value={formData[key] || ''}
              onChange={e => { updateFormData({ [key]: e.target.value }); setErrors(p => ({ ...p, [key]: '' })) }}
              placeholder={label}
              aria-label={label}
              className={inputClass(errors[key])}
            />
          </GovInput>
        ))}
      </div>

      {/* Age + Income */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GovInput label={t('age')} required error={errors.age}>
          <input
            type="number" min="1" max="120"
            value={formData.age || ''}
            onChange={e => { updateFormData({ age: e.target.value }); setErrors(p => ({ ...p, age: '' })) }}
            placeholder="e.g. 24"
            aria-label={t('age')}
            className={inputClass(errors.age)}
          />
        </GovInput>

        <GovInput label={t('annual_income')} required error={errors.income} hint="Enter 0 if unemployed or no income">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6B7A] font-bold text-sm pointer-events-none">₹</span>
            <input
              type="number" min="0"
              value={formData.income || ''}
              onChange={e => { updateFormData({ income: e.target.value }); setErrors(p => ({ ...p, income: '' })) }}
              placeholder="e.g. 150000"
              aria-label={t('annual_income')}
              className={`${inputClass(errors.income)} pl-7`}
            />
          </div>
        </GovInput>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t border-gov-border">
        <button onClick={onBack} className="gov-btn-secondary flex-1 py-3 rounded-md text-sm">
          {t('back')}
        </button>
        <button onClick={handleNext} className="gov-btn-primary flex-[2] py-3 rounded-md text-sm">
          {t('next')}
        </button>
      </div>
    </div>
  )
}
