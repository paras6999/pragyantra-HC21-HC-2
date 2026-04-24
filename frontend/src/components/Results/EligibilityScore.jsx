import { useApp } from '../../context/AppContext'

export default function EligibilityScore({ results }) {
  const { t } = useApp()
  const { eligible_count, grey_zone_count, total, eligible, grey_zone } = results

  const eligiblePct = total ? Math.round((eligible_count / total) * 100) : 0
  const notEligible = total - eligible_count - grey_zone_count

  // Top document to unlock most schemes
  const missingDocsMap = {}
  ;[...eligible, ...grey_zone].forEach(s =>
    s.missing_docs?.forEach(d => { missingDocsMap[d] = (missingDocsMap[d] || 0) + 1 })
  )
  const topUnlocker = Object.entries(missingDocsMap).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="gov-card p-6 space-y-5">

      {/* Score header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black text-[#1a3569]">{eligible_count}</span>
            <span className="text-[#5C6B7A] text-2xl font-medium mb-2">/ {total}</span>
          </div>
          <p className="text-[#5C6B7A] text-sm mt-1">{t('score_label')}</p>
        </div>

        {/* Circular progress — navy/saffron colors */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke="url(#govScoreGrad)" strokeWidth="3"
              strokeDasharray={`${eligiblePct} ${100 - eligiblePct}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            <defs>
              <linearGradient id="govScoreGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#1a3569" />
                <stop offset="100%" stopColor="#FF6600" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[#1a3569] font-black text-base">{eligiblePct}%</span>
          </div>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#138808]" />
          <span className="text-[#138808] text-sm font-semibold">{eligible_count} {t('eligible_label')}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-amber-700 text-sm font-semibold">{grey_zone_count} {t('grey_zone_label')}</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-red-700 text-sm font-semibold">{notEligible} {t('not_eligible_label')}</span>
        </div>
      </div>

      {/* Document Unlock Engine */}
      {topUnlocker && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#EEF2FF] border border-[#1a3569]/20">
          <span className="text-2xl">🔓</span>
          <div>
            <p className="text-[#1a3569] font-bold text-sm">{t('unlock_engine_title')}</p>
            <p className="text-[#5C6B7A] text-xs mt-0.5">
              Get your <span className="text-[#1a3569] font-semibold">{topUnlocker[0].replace(/_/g, ' ')}</span>{' '}
              → unlock <span className="text-[#FF6600] font-bold">{topUnlocker[1]} more scheme{topUnlocker[1] > 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
