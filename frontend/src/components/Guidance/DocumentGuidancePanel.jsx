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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md glass-dark z-50
          animate-slide-in-left overflow-y-auto no-scrollbar"
        role="dialog"
        aria-label="Document guidance"
        style={{ animation: 'slideInRight .35s cubic-bezier(.4,0,.2,1) both' }}
      >
        {/* Header */}
        <div className="sticky top-0 glass-dark px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-bold text-base">{t('guidance_title')}</h2>
          <button
            onClick={onClose}
            aria-label="Close guidance panel"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 rounded-xl shimmer" />
              ))}
            </div>
          ) : guidance && !guidance.error ? (
            <>
              {/* Doc name */}
              <div className="flex items-center gap-3">
                <span className="text-4xl">{guidance.icon || '📄'}</span>
                <div>
                  <h3 className="text-white font-bold text-lg">{guidance.name}</h3>
                  <p className="text-white/40 text-xs capitalize">{docKey.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-white/40 text-xs">⏱ Time</p>
                  <p className="text-white font-semibold text-sm mt-1">{guidance.estimated_days}</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-white/40 text-xs">💰 Cost</p>
                  <p className="text-white font-semibold text-sm mt-1">{guidance.cost}</p>
                </div>
              </div>

              {/* Where to get */}
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                  📍 {t('where_to_get')}
                </p>
                <div className="px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <p className="text-purple-200 text-sm">{guidance.where_to_get}</p>
                </div>
              </div>

              {/* Steps */}
              {guidance.steps?.length > 0 && (
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">
                    🗺 {t('steps_label')}
                  </p>
                  <div className="space-y-3">
                    {guidance.steps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed flex-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents to bring */}
              {guidance.documents_to_bring?.length > 0 && (
                <div>
                  <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                    🎒 Bring These
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {guidance.documents_to_bring.map((d, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unlocks */}
              {guidance.unlock_schemes?.length > 0 && (
                <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-green-400 text-xs font-semibold mb-1">🔓 {t('unlocks')}:</p>
                  <p className="text-green-200/70 text-xs">{guidance.unlock_schemes[0]}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-white/40 text-sm text-center py-8">
              No guidance available for this document yet.
            </p>
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
