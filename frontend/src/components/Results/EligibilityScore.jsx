import { useApp } from '../../context/AppContext'

export default function EligibilityScore({ results }) {
  const { t } = useApp()
  const { eligible_count, grey_zone_count, total, eligible, grey_zone } = results

  const eligiblePct  = total ? Math.round((eligible_count / total) * 100) : 0
  const greyPct      = total ? Math.round((grey_zone_count / total) * 100) : 0

  // Compute "unlock potential" - how many grey-zone schemes could be unlocked
  const missingDocsMap = {}
  ;[...eligible, ...grey_zone].forEach(s =>
    s.missing_docs?.forEach(d => {
      missingDocsMap[d] = (missingDocsMap[d] || 0) + 1
    })
  )
  const topUnlocker = Object.entries(missingDocsMap).sort((a, b) => b[1] - a[1])[0]

  return (
    <div className="glass rounded-2xl p-6 space-y-5">
      {/* Score header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black gradient-text">{eligible_count}</span>
            <span className="text-white/50 text-xl font-medium mb-1">/ {total}</span>
          </div>
          <p className="text-white/70 text-sm">{t('score_label')}</p>
        </div>

        {/* Circular progress */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke="url(#scoreGrad)" strokeWidth="3"
              strokeDasharray={`${eligiblePct} ${100 - eligiblePct}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#7c6eff" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm">{eligiblePct}%</span>
          </div>
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/15 border border-green-500/30">
          <span className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-300 text-sm font-medium">{eligible_count} Eligible</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-amber-300 text-sm font-medium">{grey_zone_count} Grey Zone</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/15 border border-red-500/30">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-white/50 text-sm font-medium">{total - eligible_count - grey_zone_count} Not Eligible</span>
        </div>
      </div>

      {/* Document Unlock Engine */}
      {topUnlocker && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <span className="text-2xl">🔓</span>
          <div>
            <p className="text-purple-300 font-semibold text-sm">Document Unlock Engine</p>
            <p className="text-white/60 text-xs mt-0.5">
              Get your <span className="text-white font-medium">{topUnlocker[0].replace(/_/g, ' ')}</span> 
              {' '}→ unlock <span className="text-purple-300 font-bold">{topUnlocker[1]} more scheme{topUnlocker[1] > 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
