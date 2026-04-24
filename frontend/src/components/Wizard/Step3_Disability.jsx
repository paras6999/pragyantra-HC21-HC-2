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
    <div className="step-enter space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-gov-border">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1a3569]">{t('step3_title')}</h2>
          <p className="text-[#5C6B7A] mt-0.5 text-sm">{t('step3_subtitle')}</p>
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
        <div className="animate-slide-in-up space-y-4 p-4 rounded-lg bg-[#F5F7FA] border border-gov-border">
          <label className="block text-[#1a3569] text-xs font-semibold uppercase tracking-wide">
            {t('disability_percent_label')} <span className="text-[#FF6600]">*</span>
          </label>
          <p className="text-[#5C6B7A] text-xs -mt-2">{t('disability_percent_desc')}</p>

          {/* Slider */}
          <div className="space-y-2">
            <input
              type="range" min="1" max="100"
              value={pct}
              onChange={e => updateFormData({ disability_percent: e.target.value })}
              className="w-full cursor-pointer"
              style={{ accentColor: pct >= 40 ? '#138808' : pct >= 35 ? '#FF6600' : '#dc2626' }}
              aria-label={t('disability_percent_label')}
            />
            <div className="flex justify-between text-xs text-[#5C6B7A]">
              <span>1%</span>
              <span className={`font-black text-lg ${pct >= 40 ? 'text-[#138808]' : pct >= 35 ? 'text-[#FF6600]' : 'text-red-600'}`}>
                {pct}%
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Or type directly */}
          <div className="flex items-center gap-3">
            <span className="text-[#5C6B7A] text-xs">Or type:</span>
            <input
              type="number" min="1" max="100"
              value={pct}
              onChange={e => updateFormData({ disability_percent: Math.min(100, Math.max(0, Number(e.target.value))) })}
              className="w-24 gov-input py-2 text-center font-bold text-[#1a3569]"
            />
            <span className="text-[#5C6B7A] text-sm font-bold">%</span>
          </div>

          {/* Warnings */}
          {pct > 0 && pct < 35 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
              <span>⚠️</span>
              <p className="text-red-700 text-sm">Disability below 35% makes all schemes ineligible. Please recheck your certificate.</p>
            </div>
          )}
          {pct >= 35 && pct < 40 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-orange-50 border border-orange-200">
              <span>⚠️</span>
              <p className="text-orange-700 text-sm">{t('below_40_warning')}</p>
            </div>
          )}
          {pct >= 40 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-green-50 border border-green-200">
              <span>✅</span>
              <p className="text-green-800 text-sm">At <strong>{pct}%</strong> you qualify for the majority of PwD government schemes.</p>
            </div>
          )}
        </div>
      )}

      {/* No cert info */}
      {!formData.has_disability_cert && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-orange-50 border border-orange-200 animate-slide-in-up">
          <span className="text-xl">📋</span>
          <div>
            <p className="text-orange-800 text-sm font-semibold">Disability Certificate not available</p>
            <p className="text-orange-700 text-xs mt-1">{t('no_cert_info')}</p>
          </div>
        </div>
      )}

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
