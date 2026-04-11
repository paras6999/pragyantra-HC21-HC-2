export default function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)

  const labels = ['Basic Info', 'Documents', 'Disability', 'All Docs']

  return (
    <div className="w-full">
      {/* Step dots */}
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1
          const done    = step < current
          const active  = step === current
          return (
            <div key={step} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                  ${done   ? 'bg-purple-600 border-purple-600 text-white'       : ''}
                  ${active ? 'bg-transparent border-purple-400 text-purple-400 animate-pulse-ring' : ''}
                  ${!done && !active ? 'bg-transparent border-white/20 text-white/30' : ''}`}
              >
                {done ? '✓' : step}
              </div>
              <span className={`text-xs hidden sm:block transition-colors ${active ? 'text-purple-300' : done ? 'text-white/50' : 'text-white/20'}`}>
                {labels[i]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-sky-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
