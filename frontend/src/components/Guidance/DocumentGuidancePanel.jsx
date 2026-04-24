import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

export default function DocumentGuidancePanel({ docKey, onClose }) {
  const [guidance, setGuidance] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const { t } = useApp()

  useEffect(() => {
    if (!docKey) return
    setLoading(true)
    fetch(`/api/document_guidance/${docKey}`)
      .then(r => r.json())
      .then(data => { setGuidance(data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [docKey])

  if (!docKey) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0d1f3c]/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50
          animate-slide-in-left overflow-y-auto no-scrollbar shadow-gov-lg border-l border-gov-border"
        role="dialog"
        aria-label="Document guidance"
        style={{ animation: 'slideInRight .35s cubic-bezier(.4,0,.2,1) both' }}
      >
        {/* Header - Government Blue */}
        <div className="sticky top-0 bg-[#1a3569] shadow-md px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <span className="text-xl">📄</span> {t('guidance_title')}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close guidance panel"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all shadow-sm"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 border border-gray-200" />
              ))}
            </div>
          ) : guidance && !guidance.error ? (
            <>
              {/* Doc name */}
              <div className="flex items-center gap-4 p-4 rounded-xl border border-gov-border bg-[#F5F7FA]">
                <span className="text-4xl drop-shadow-sm">{guidance.icon || '📄'}</span>
                <div>
                  <h3 className="text-[#1A2332] font-black text-lg">{guidance.name}</h3>
                  <p className="text-[#5C6B7A] font-semibold text-xs capitalize uppercase tracking-widest mt-1">{docKey.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#EEF2FF] border border-[#1a3569]/20 rounded-xl p-4 text-center">
                  <p className="text-[#5C6B7A] text-xs font-bold uppercase tracking-wide">⏱ Time</p>
                  <p className="text-[#1a3569] font-black text-sm mt-1">{guidance.estimated_days}</p>
                </div>
                <div className="bg-[#FFFBEB] border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-[#92400e] text-xs font-bold uppercase tracking-wide">💰 Cost</p>
                  <p className="text-[#b45309] font-black text-sm mt-1">{guidance.cost}</p>
                </div>
              </div>

              {/* Where to get */}
              <div>
                <p className="text-[#1A2332] text-xs font-bold uppercase tracking-wider mb-2">
                  📍 {t('where_to_get')}
                </p>
                <div className="px-4 py-3.5 rounded-xl bg-blue-50 border border-blue-200 shadow-sm">
                  <p className="text-[#1e3a8a] text-sm font-semibold">{guidance.where_to_get}</p>
                </div>
              </div>

              {/* Steps */}
              {guidance.steps?.length > 0 && (
                <div>
                  <p className="text-[#1A2332] text-xs font-bold uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                    🗺 {t('steps_label')}
                  </p>
                  <div className="space-y-4">
                    {guidance.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1a3569] text-white text-sm font-bold flex items-center justify-center shadow-md">
                          {i + 1}
                        </div>
                        <p className="text-[#5C6B7A] text-sm leading-relaxed flex-1 mt-1 font-medium">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents to bring */}
              {guidance.documents_to_bring?.length > 0 && (
                <div>
                  <p className="text-[#1A2332] text-xs font-bold uppercase tracking-wider mb-3">
                    🎒 Bring These
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {guidance.documents_to_bring.map((d, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-md bg-white border border-gray-300 shadow-sm text-[#1A2332] text-xs font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unlocks */}
              {guidance.unlock_schemes?.length > 0 && (
                <div className="px-4 py-4 rounded-xl bg-[#DCFCE7] border border-[#86efac] shadow-sm mt-4">
                  <p className="text-[#166534] text-xs font-bold mb-1.5 uppercase tracking-wide">🔓 {t('unlocks')}:</p>
                  <p className="text-[#15803d] font-semibold text-sm">{guidance.unlock_schemes[0]}</p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center mt-6">
              <span className="text-3xl mb-2 block">🤷</span>
              <p className="text-[#5C6B7A] text-sm font-semibold">
                No guidance available for this document yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  )
}
