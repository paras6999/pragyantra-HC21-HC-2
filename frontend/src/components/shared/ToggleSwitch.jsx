export default function ToggleSwitch({ label, desc, checked, onChange, id }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all duration-200 cursor-pointer
        ${checked
          ? 'border-purple-500/60 bg-purple-500/10'
          : 'border-white/10 bg-white/[0.03] hover:border-white/20'
        }`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(!checked)}
    >
      <div className="flex-1">
        <p className={`font-medium text-sm md:text-base transition-colors ${checked ? 'text-white' : 'text-white/80'}`}>
          {label}
        </p>
        {desc && (
          <p className="text-white/40 text-xs mt-0.5">{desc}</p>
        )}
      </div>

      {/* Toggle track */}
      <div className={`relative flex-shrink-0 w-14 h-7 rounded-full transition-colors duration-300
          ${checked ? 'bg-purple-600' : 'bg-white/10'}`}
      >
        {/* Thumb */}
        <span
          className={`toggle-thumb absolute top-1 w-5 h-5 rounded-full shadow-md
            ${checked ? 'translate-x-7 bg-white' : 'translate-x-1 bg-white/60'}`}
          style={{ transition: 'transform 0.28s cubic-bezier(.4,0,.2,1)' }}
        />
      </div>
    </div>
  )
}
