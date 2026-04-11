import { useState } from 'react'
import EligibilityBadge from './EligibilityBadge'
import { useApp } from '../../context/AppContext'
import TTSButton from '../Voice/TTSButton'

const BORDER = {
  eligible:    'border-green-500/30 bg-green-500/[0.04]',
  grey_zone:   'border-amber-500/30 bg-amber-500/[0.04]',
  not_eligible:'border-red-500/20  bg-red-500/[0.03]',
}

export default function SchemeCard({ scheme, onGetGuidance, index = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useApp()

  const CATEGORY_ICON = {
    education: '🎓', health: '🏥', housing: '🏠',
    financial: '💰', employment: '💼', other: '📋',
  }

  return (
    <div
      className={`rounded-2xl border p-5 transition-all duration-300 animate-slide-in-up
        card-hover ${BORDER[scheme.status]}`}
      style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        <div className="text-2xl mt-0.5 flex-shrink-0">
          {CATEGORY_ICON[scheme.category] || '📋'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base leading-snug pr-2">
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
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition-colors glow-green whitespace-nowrap"
            >
              {t('apply_now')}
            </a>
          )}
          <TTSButton text={scheme.description} className="scale-75 origin-right" />
        </div>
      </div>

      {/* Not eligible reason */}
      {scheme.status === 'not_eligible' && scheme.reason && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <span className="text-red-400 text-sm flex-shrink-0">⊘</span>
          <p className="text-red-300/90 text-xs leading-relaxed">{scheme.reason}</p>
        </div>
      )}

      {/* Missing docs */}
      {scheme.missing_docs?.length > 0 && (
        <div className="mt-3">
          <p className="text-amber-400 text-xs font-semibold mb-2">📂 {t('missing_docs')}:</p>
          <div className="flex flex-wrap gap-1.5">
            {scheme.missing_docs.map(doc => (
              <button
                key={doc}
                onClick={() => onGetGuidance(doc)}
                aria-label={`Get guidance for ${doc.replace(/_/g, ' ')}`}
                className="px-3 py-1 bg-amber-500/15 border border-amber-500/35 text-amber-300 rounded-full text-xs
                  hover:bg-amber-500/25 hover:border-amber-400/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                📄 {doc.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-2">
            👆 Tap a document to see how to get it
          </p>
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-white/35 hover:text-white/60 text-xs transition-colors flex items-center gap-1"
        aria-expanded={expanded}
      >
        {expanded ? '▲ Hide details' : '▼ Show benefits'}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 space-y-2 animate-slide-in-up">
          <p className="text-white/55 text-xs leading-relaxed">{scheme.description}</p>
          {scheme.benefits?.length > 0 && (
            <ul className="space-y-1 mt-2">
              {scheme.benefits.slice(0, 4).map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-white/60 text-xs">
                  <span className="text-purple-400 mt-0.5">•</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
          {scheme.apply_url && scheme.status !== 'eligible' && (
            <a href={scheme.apply_url} target="_blank" rel="noreferrer"
              className="inline-block mt-2 text-purple-400 hover:text-purple-300 text-xs underline">
              Official scheme page →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
