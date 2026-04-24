import { useState } from 'react'
import EligibilityBadge from './EligibilityBadge'
import { useApp } from '../../context/AppContext'
import TTSButton from '../Voice/TTSButton'

const STATUS_STYLE = {
  eligible:     { border: 'border-green-200',  bg: 'bg-green-50',  strip: 'bg-[#138808]' },
  grey_zone:    { border: 'border-amber-200',  bg: 'bg-amber-50',  strip: 'bg-amber-500' },
  not_eligible: { border: 'border-red-200',    bg: 'bg-red-50',    strip: 'bg-red-500'   },
}

const CATEGORY_ICON = {
  education: '🎓', health: '🏥', housing: '🏠',
  financial: '💰', employment: '💼', other: '📋',
}

export default function SchemeCard({ scheme, onGetGuidance, index = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useApp()

  const style = STATUS_STYLE[scheme.status] || STATUS_STYLE.not_eligible

  return (
    <div
      className={`bg-white rounded-lg border ${style.border} overflow-hidden card-hover shadow-gov animate-slide-in-up`}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      {/* Colored status strip at top */}
      <div className={`${style.strip} h-1.5`} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-3">
          <div className="text-2xl mt-0.5 flex-shrink-0">
            {CATEGORY_ICON[scheme.category] || '📋'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[#1a3569] font-bold text-base leading-snug pr-2">
              {scheme.scheme_name}
            </h3>
            <div className="mt-1.5">
              <EligibilityBadge status={scheme.status} />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2">
            {scheme.status === 'eligible' && scheme.apply_url && (
              <a
                href={scheme.apply_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Apply for ${scheme.scheme_name}`}
                className="px-4 py-2 rounded-md bg-[#138808] hover:bg-[#0f6a06] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm"
              >
                {t('apply_now')}
              </a>
            )}
            <TTSButton text={scheme.description} className="scale-75 origin-right" />
          </div>
        </div>

        {/* Not eligible reason */}
        {scheme.status === 'not_eligible' && scheme.reason && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
            <span className="text-red-500 text-sm flex-shrink-0 font-bold">✕</span>
            <p className="text-red-700 text-xs leading-relaxed">{scheme.reason}</p>
          </div>
        )}

        {/* Missing docs */}
        {scheme.missing_docs?.length > 0 && (
          <div className="mt-3">
            <p className="text-amber-700 text-xs font-semibold mb-2">📂 {t('missing_docs')}:</p>
            <div className="flex flex-wrap gap-1.5">
              {scheme.missing_docs.map(doc => (
                <button
                  key={doc}
                  onClick={() => onGetGuidance(doc)}
                  aria-label={`Get guidance for ${doc.replace(/_/g, ' ')}`}
                  className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-800 rounded-full text-xs
                    hover:bg-amber-100 hover:border-amber-400 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
                >
                  📄 {doc.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <p className="text-[#5C6B7A] text-xs mt-2">
              👆 Tap a document to see how to get it
            </p>
          </div>
        )}

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-[#1a3569] hover:text-[#FF6600] text-xs transition-colors flex items-center gap-1 font-medium"
          aria-expanded={expanded}
        >
          {expanded ? '▲ Hide details' : '▼ Show benefits'}
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-3 space-y-2 animate-slide-in-up p-4 rounded-lg bg-[#F5F7FA] border border-gov-border">
            <p className="text-[#5C6B7A] text-xs leading-relaxed">{scheme.description}</p>
            {scheme.benefits?.length > 0 && (
              <ul className="space-y-1 mt-2">
                {scheme.benefits.slice(0, 4).map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#1A2332] text-xs">
                    <span className="text-[#138808] font-bold mt-0.5 flex-shrink-0">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            )}
            {scheme.apply_url && scheme.status !== 'eligible' && (
              <a href={scheme.apply_url} target="_blank" rel="noreferrer"
                className="inline-block mt-2 text-[#1a3569] hover:text-[#FF6600] text-xs font-semibold underline">
                Official scheme page →
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
