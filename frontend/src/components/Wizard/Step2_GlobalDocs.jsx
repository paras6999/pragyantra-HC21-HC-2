import { useApp } from '../../context/AppContext'
import ToggleSwitch from '../shared/ToggleSwitch'
import VoiceButton  from '../Voice/VoiceButton'

const DOCS = [
  { key: 'passport_photo', labelKey: 'passport_photo_label', descKey: 'passport_photo_desc' },
  { key: 'bank_account',   labelKey: 'bank_account_label',   descKey: 'bank_account_desc'   },
]

export default function Step2_GlobalDocs({ onNext, onBack }) {
  const { formData, updateFormData, t } = useApp()

  const handleVoice = (transcript) => {
    const isYes = /yes|haan|ho|हाँ|होय/.test(transcript)
    const isNo  = /no|nahi|nahin|नहीं|नाही/.test(transcript)
    if (isYes && !formData.passport_photo) updateFormData({ passport_photo: true })
    if (isNo)                              updateFormData({ passport_photo: false })
  }

  return (
    <div className="step-enter space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-gov-border">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1a3569]">{t('step2_title')}</h2>
          <p className="text-[#5C6B7A] mt-0.5 text-sm">{t('step2_subtitle')}</p>
        </div>
        <VoiceButton onResult={handleVoice} compact />
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#EEF2FF] border border-blue-200">
        <span className="text-xl">💡</span>
        <p className="text-[#1a3569] text-sm leading-relaxed">
          These two documents are needed by <strong>almost every scheme</strong>. If you don't have them yet, we'll show you how to get them after the results.
        </p>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {DOCS.map(doc => (
          <ToggleSwitch
            key={doc.key}
            id={doc.key}
            label={t(doc.labelKey)}
            desc={t(doc.descKey)}
            checked={formData[doc.key]}
            onChange={val => updateFormData({ [doc.key]: val })}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4 border-t border-gov-border">
        <button onClick={onBack} className="gov-btn-secondary flex-1 py-3 rounded-md text-sm">
          {t('back')}
        </button>
        <button onClick={onNext} className="gov-btn-primary flex-[2] py-3 rounded-md text-sm">
          {t('next')}
        </button>
      </div>
    </div>
  )
}
