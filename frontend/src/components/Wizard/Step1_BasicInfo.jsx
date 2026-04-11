import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import VoiceButton from '../Voice/VoiceButton'

export default function Step1_BasicInfo({ onNext, onBack }) {
  const { formData, updateFormData, t } = useApp()
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!formData.firstName.trim()) e.firstName = 'First name is required'
    if (!formData.age || formData.age < 1 || formData.age > 120) e.age = 'Enter a valid age (1–120)'
    if (!formData.income && formData.income !== 0) e.income = 'Enter annual income (0 if none)'
    return e
  }

  const handleNext = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onNext()
  }

  const handleVoice = (transcript) => {
    // Try to parse name and age from voice
    const ageMatch = transcript.match(/(\d+)\s*(year|sal|saal|वर्ष|years)?/)
    if (ageMatch) updateFormData({ age: ageMatch[1] })
  }

  return (
    <div className="step-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('step1_title')}</h2>
          <p className="text-white/50 mt-1 text-sm">{t('step1_subtitle')}</p>
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
          <div key={key}>
            <label className="block text-white/70 text-xs font-medium mb-1.5">
              {label} {required && <span className="text-purple-400">*</span>}
            </label>
            <input
              type="text"
              value={formData[key]}
              onChange={e => { updateFormData({ [key]: e.target.value }); setErrors(prev => ({ ...prev, [key]: '' })) }}
              placeholder={label}
              aria-label={label}
              className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/25 text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                ${errors[key] ? 'border-red-500' : 'border-white/10 hover:border-white/20'}`}
            />
            {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>

      {/* Age + Income */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-white/70 text-xs font-medium mb-1.5">
            {t('age')} <span className="text-purple-400">*</span>
          </label>
          <input
            type="number" min="1" max="120"
            value={formData.age}
            onChange={e => { updateFormData({ age: e.target.value }); setErrors(p => ({ ...p, age: '' })) }}
            placeholder="e.g. 24"
            aria-label={t('age')}
            className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/25 text-sm
              focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
              ${errors.age ? 'border-red-500' : 'border-white/10 hover:border-white/20'}`}
          />
          {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
        </div>

        <div>
          <label className="block text-white/70 text-xs font-medium mb-1.5">
            {t('annual_income')} <span className="text-purple-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">₹</span>
            <input
              type="number" min="0"
              value={formData.income}
              onChange={e => { updateFormData({ income: e.target.value }); setErrors(p => ({ ...p, income: '' })) }}
              placeholder="e.g. 150000"
              aria-label={t('annual_income')}
              className={`w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/25 text-sm
                focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                ${errors.income ? 'border-red-500' : 'border-white/10 hover:border-white/20'}`}
            />
          </div>
          {errors.income && <p className="text-red-400 text-xs mt-1">{errors.income}</p>}
          <p className="text-white/30 text-xs mt-1">Enter 0 if unemployed or no income</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-medium transition-all">
          {t('back')}
        </button>
        <button onClick={handleNext}
          className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all glow-purple">
          {t('next')}
        </button>
      </div>
    </div>
  )
}
