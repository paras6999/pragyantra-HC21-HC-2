import { useApp } from '../../context/AppContext'
import ToggleSwitch from '../shared/ToggleSwitch'
import VoiceButton  from '../Voice/VoiceButton'

export default function Step3_Disability({ onNext, onBack }) {
  const { formData, updateFormData, t } = useApp()

  const pct = Number(formData.disability_percent) || 0

  const handleVoice = (transcript) => {
    const isYes = /yes|haan|ho|हाँ|होय/.test(transcript)
    const isNo  = /no|nahi|nahin|नहीं|नाही/.test(transcript)
    const numMatch = transcript.match(/(\d+)/)
    if (isYes) updateFormData({ has_disability_cert: true })
    if (isNo)  updateFormData({ has_disability_cert: false })
    if (numMatch && formData.has_disability_cert) updateFormData({ disability_percent: numMatch[1] })
  }

  return (
    <div className="step-enter space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('step3_title')}</h2>
          <p className="text-white/50 mt-1 text-sm">{t('step3_subtitle')}</p>
        </div>
        <VoiceButton onResult={handleVoice} compact />
      </div>

      {/* Has disability cert toggle */}
      <ToggleSwitch
        id="has_disability_cert"
        label={t('has_disability_cert_label')}
        desc={t('has_disability_cert_desc')}
        checked={formData.has_disability_cert}
        onChange={val => updateFormData({ has_disability_cert: val, disability_percent: val ? formData.disability_percent : 0 })}
      />

      {/* Conditional: disability % */}
      {formData.has_disability_cert && (
        <div className="animate-slide-in-up space-y-3">
          <label className="block text-white/70 text-sm font-medium">
            {t('disability_percent_label')} <span className="text-purple-400">*</span>
          </label>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range" min="1" max="100"
              value={pct}
              onChange={e => updateFormData({ disability_percent: e.target.value })}
              className="w-full accent-purple-500 cursor-pointer"
              aria-label={t('disability_percent_label')}
            />
            <div className="flex justify-between text-xs text-white/30">
              <span>1%</span>
              <span className={`font-bold text-base ${pct >= 40 ? 'text-green-400' : 'text-amber-400'}`}>
                {pct}%
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Or type directly */}
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs">Or type:</span>
            <input
              type="number" min="1" max="100"
              value={pct}
              onChange={e => updateFormData({ disability_percent: Math.min(100, Math.max(0, Number(e.target.value))) })}
              className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-white/40 text-sm">%</span>
          </div>

          {/* Warnings */}
          {pct > 0 && pct < 35 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <span>⚠️</span>
              <p className="text-red-300 text-sm">Disability below 35% makes all schemes ineligible. Please recheck your certificate.</p>
            </div>
          )}
          {pct >= 35 && pct < 40 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span>⚠️</span>
              <p className="text-amber-300 text-sm">{t('below_40_warning')}</p>
            </div>
          )}
          {pct >= 40 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <span>✅</span>
              <p className="text-green-300 text-sm">Great! At {pct}% you qualify for the majority of PwD schemes.</p>
            </div>
          )}
        </div>
      )}

      {/* No cert info */}
      {!formData.has_disability_cert && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 animate-slide-in-up">
          <span className="text-xl">📋</span>
          <div>
            <p className="text-amber-300 text-sm font-medium">Disability Certificate not available</p>
            <p className="text-amber-200/60 text-xs mt-1">{t('no_cert_info')}</p>
          </div>
        </div>
      )}

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
