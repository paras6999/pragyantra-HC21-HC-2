import { useApp } from '../../context/AppContext'
import ToggleSwitch from '../shared/ToggleSwitch'
import VoiceButton  from '../Voice/VoiceButton'

const SECTIONS = [
  {
    titleKey: 'financial_docs',
    icon: '💳',
    docs: [
      { key: 'aadhaar_card',       labelKey: 'aadhaar_card_label'      },
      { key: 'income_certificate', labelKey: 'income_certificate_label' },
      { key: 'residence_proof',    labelKey: 'residence_proof_label'    },
    ],
  },
  {
    titleKey: 'education_docs',
    icon: '🎓',
    docs: [
      { key: 'bonafide_certificate', labelKey: 'bonafide_label'       },
      { key: 'student_id',           labelKey: 'student_id_label'     },
      { key: 'previous_marksheet',   labelKey: 'prev_marksheet_label' },
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
      { key: 'health_card',     labelKey: 'health_card_label'     },
      { key: 'medical_reports', labelKey: 'medical_reports_label' },
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

  const allKeys = SECTIONS.flatMap(s => s.docs.map(d => d.key))
  const selectedCount = allKeys.filter(k => formData[k]).length

  const handleVoice = (transcript) => {
    if (/all|sab|सब/.test(transcript)) {
      const allTrue = {}
      allKeys.forEach(k => { allTrue[k] = true })
      updateFormData(allTrue)
    }
  }

  return (
    <div className="step-enter space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-gov-border">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1a3569]">{t('step4_title')}</h2>
          <p className="text-[#5C6B7A] mt-0.5 text-sm">{t('step4_subtitle')}</p>
        </div>
        <VoiceButton onResult={handleVoice} compact />
      </div>

      {/* Progress pill */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EEF2FF] border border-[#1a3569]/20">
        <span className="text-[#1a3569] text-sm font-bold">{selectedCount}/{allKeys.length}</span>
        <span className="text-[#5C6B7A] text-xs">documents selected</span>
        {selectedCount === allKeys.length && <span>✅</span>}
      </div>

      {/* Sections */}
      <div className="space-y-5 max-h-[48vh] overflow-y-auto no-scrollbar pr-1">
        {SECTIONS.map(section => (
          <div key={section.titleKey} className="space-y-2">
            {/* Section header */}
            <div className="flex items-center gap-2 pb-1 border-b border-gov-border">
              <span className="text-base">{section.icon}</span>
              <h3 className="text-[#1a3569] font-bold text-xs uppercase tracking-wider">
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
      <div className="flex gap-3 pt-4 border-t border-gov-border">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="gov-btn-secondary flex-1 py-3 rounded-md text-sm disabled:opacity-50"
        >
          {t('back')}
        </button>
        <button
          onClick={onNext}
          disabled={isLoading}
          className="gov-btn-saffron flex-[2] py-3 rounded-md text-sm disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {t('loading')}
            </>
          ) : (
            `✅ ${t('submit')}`
          )}
        </button>
      </div>
    </div>
  )
}
