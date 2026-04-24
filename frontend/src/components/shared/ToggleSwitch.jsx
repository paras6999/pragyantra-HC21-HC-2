export default function ToggleSwitch({ label, desc, checked, onChange, id }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-3.5 rounded-lg border transition-all duration-200 cursor-pointer
        ${checked
          ? 'border-[#1a3569] bg-[#EEF2FF]'
          : 'border-gov-border bg-white hover:border-[#1a3569]/50 hover:bg-[#F5F7FA]'
        }`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange(!checked)}
    >
      <div className="flex-1">
        <p className={`font-semibold text-sm transition-colors ${checked ? 'text-[#1a3569]' : 'text-[#1A2332]'}`}>
          {label}
        </p>
        {desc && (
          <p className="text-[#5C6B7A] text-xs mt-0.5">{desc}</p>
        )}
      </div>

      {/* Toggle track */}
      <div
        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 ${
          checked ? 'bg-[#1a3569]' : 'bg-gray-300'
        }`}
      >
        <span
          className={`toggle-thumb absolute top-0.5 w-5 h-5 rounded-full shadow bg-white ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </div>
    </div>
  )
}
