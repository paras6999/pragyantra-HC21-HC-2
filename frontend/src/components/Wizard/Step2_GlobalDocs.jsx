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
    <div className="step-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('step2_title')}</h2>
          <p className="text-white/50 mt-1 text-sm">{t('step2_subtitle')}</p>
        </div>
        <VoiceButton onResult={handleVoice} compact />
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
        <span className="text-xl">💡</span>
        <p className="text-sky-300 text-sm">
          These two documents are needed by almost every scheme. If you don't have them yet, we'll show you how to get them.
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
      <div className="flex gap-3 pt-2">
        <button onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-medium transition-all">
          {t('back')}
        </button>
        <button onClick={onNext}
          className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all glow-purple">
          {t('next')}
        </button>
      </div>
    </div>
  )
}
