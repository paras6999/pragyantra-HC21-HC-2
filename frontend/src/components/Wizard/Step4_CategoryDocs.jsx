import { useApp } from '../../context/AppContext'
import ToggleSwitch from '../shared/ToggleSwitch'
import VoiceButton  from '../Voice/VoiceButton'

const SECTIONS = [
  {
    titleKey: 'financial_docs',
    icon: '💳',
    docs: [
      { key: 'aadhaar_card',        labelKey: 'aadhaar_card_label'     },
      { key: 'income_certificate',  labelKey: 'income_certificate_label'},
      { key: 'residence_proof',     labelKey: 'residence_proof_label'  },
    ],
  },
  {
    titleKey: 'education_docs',
    icon: '🎓',
    docs: [
      { key: 'bonafide_certificate',  labelKey: 'bonafide_label'       },
      { key: 'student_id',            labelKey: 'student_id_label'     },
      { key: 'previous_marksheet',    labelKey: 'prev_marksheet_label' },
    ],
  },
  {
    titleKey: 'employment_docs',
    icon: '💼',
    docs: [
      { key: 'resume',                   labelKey: 'resume_label'              },
      { key: 'educational_certificates', labelKey: 'edu_certs_label'           },
      { key: 'employment_exchange_reg',  labelKey: 'employment_exchange_label' },
    ],
  },
  {
    titleKey: 'health_docs',
    icon: '🏥',
    docs: [
      { key: 'health_card',     labelKey: 'health_card_label'    },
      { key: 'medical_reports', labelKey: 'medical_reports_label'},
    ],
  },
  {
    titleKey: 'housing_docs',
    icon: '🏠',
    docs: [
      { key: 'bpl_card', labelKey: 'bpl_card_label' },
    ],
  },
]

export default function Step4_CategoryDocs({ onNext, onBack }) {
  const { formData, updateFormData, isLoading, t } = useApp()

  // Count total docs selected
  const allKeys = SECTIONS.flatMap(s => s.docs.map(d => d.key))
  const selectedCount = allKeys.filter(k => formData[k]).length

  const handleVoice = (transcript) => {
    const isYes = /yes|haan|ho|हाँ|होय/.test(transcript)
    // Auto-fill all if "all" is said
    if (/all|sab|सब/.test(transcript)) {
      const allTrue = {}
      allKeys.forEach(k => { allTrue[k] = true })
      updateFormData(allTrue)
    }
  }

  return (
    <div className="step-enter space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('step4_title')}</h2>
          <p className="text-white/50 mt-1 text-sm">{t('step4_subtitle')}</p>
        </div>
        <VoiceButton onResult={handleVoice} compact />
      </div>

      {/* Progress pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/20 border border-purple-500/30">
        <span className="text-purple-300 text-sm font-semibold">{selectedCount}/{allKeys.length}</span>
        <span className="text-white/50 text-xs">documents selected</span>
      </div>

      {/* Sections */}
      <div className="space-y-5 max-h-[55vh] overflow-y-auto no-scrollbar pr-1">
        {SECTIONS.map((section, si) => (
          <div key={section.titleKey} className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{section.icon}</span>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wide">
                {t(section.titleKey)}
              </h3>
            </div>
            {section.docs.map(doc => (
              <ToggleSwitch
                key={doc.key}
                id={doc.key}
                label={t(doc.labelKey)}
                checked={formData[doc.key]}
                onChange={val => updateFormData({ [doc.key]: val })}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button onClick={onBack}
          className="flex-1 py-3.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-medium transition-all"
          disabled={isLoading}>
          {t('back')}
        </button>
        <button onClick={onNext}
          disabled={isLoading}
          className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all glow-purple disabled:opacity-60 flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('loading')}
            </>
          ) : (
            t('submit')
          )}
        </button>
      </div>
    </div>
  )
}
