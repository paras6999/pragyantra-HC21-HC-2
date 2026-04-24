const COLOR_MAP = {
  blue:   { bg: 'bg-card-blue',   border: 'border-blue-700'   },
  green:  { bg: 'bg-card-green',  border: 'border-green-700'  },
  purple: { bg: 'bg-card-purple', border: 'border-purple-700' },
  yellow: { bg: 'bg-card-yellow', border: 'border-yellow-700' },
  orange: { bg: 'bg-card-orange', border: 'border-orange-700' },
  pink:   { bg: 'bg-card-pink',   border: 'border-pink-700'   },
  indigo: { bg: 'bg-card-indigo', border: 'border-indigo-700' },
}

export default function CategoryCard({ id, name, icon, color, description, onClick, delay = 0 }) {
  const { bg } = COLOR_MAP[color] || COLOR_MAP.indigo

  return (
    <button
      onClick={() => onClick(id)}
      aria-label={`Browse ${name} schemes`}
      className={`
        ${bg}
        relative w-full text-left rounded-lg p-5
        card-hover cursor-pointer overflow-hidden
        shadow-gov border border-white/10
        focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2
        animate-slide-in-up
      `}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Subtle pattern overlay */}
      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full bg-black/10 blur-lg pointer-events-none" />

      {/* Icon */}
      <div className="text-4xl mb-3 leading-none relative z-10">{icon}</div>

      {/* Name */}
      <h3 className="text-white font-bold text-sm md:text-base leading-tight mb-1.5 relative z-10">
        {name}
      </h3>

      {/* Description */}
      <p className="text-white/80 text-xs leading-relaxed line-clamp-2 relative z-10">
        {description}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between relative z-10">
        <span className="text-white/70 text-xs font-medium">View Schemes</span>
        <span className="bg-white/20 rounded px-2 py-0.5 text-white text-xs font-bold">→</span>
      </div>
    </button>
  )
}
