export default function ProgressBar({ current, total }) {
  const pct    = Math.round((current / total) * 100)
  const labels = ['Basic Info', 'Documents', 'Disability', 'All Docs']

  return (
    <div className="w-full">
      {/* Step dots */}
      <div className="flex items-center justify-between mb-3">
        {Array.from({ length: total }, (_, i) => {
          const step   = i + 1
          const done   = step < current
          const active = step === current
          return (
            <div key={step} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  done   ? 'bg-[#138808] border-[#138808] text-white'
                  : active ? 'bg-[#1a3569] border-[#1a3569] text-white shadow-lg'
                  :          'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {done ? '✓' : step}
              </div>
              <span className={`text-xs font-medium hidden sm:block transition-colors ${
                active ? 'text-[#1a3569] font-bold'
                : done  ? 'text-[#138808]'
                :          'text-gray-400'
              }`}>
                {labels[i]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(to right, #1a3569, #FF6600)',
          }}
        />
      </div>
    </div>
  )
}
