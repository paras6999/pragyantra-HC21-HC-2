const COLOR_MAP = {
  blue:   { bg: 'bg-card-blue',   glow: 'hover:shadow-blue-500/30'   },
  green:  { bg: 'bg-card-green',  glow: 'hover:shadow-green-500/30'  },
  purple: { bg: 'bg-card-purple', glow: 'hover:shadow-purple-500/30' },
  yellow: { bg: 'bg-card-yellow', glow: 'hover:shadow-yellow-500/30' },
  orange: { bg: 'bg-card-orange', glow: 'hover:shadow-orange-500/30' },
  pink:   { bg: 'bg-card-pink',   glow: 'hover:shadow-pink-500/30'   },
  indigo: { bg: 'bg-card-indigo', glow: 'hover:shadow-indigo-500/30' },
}

export default function CategoryCard({ id, name, icon, color, description, onClick, delay = 0 }) {
  const { bg, glow } = COLOR_MAP[color] || COLOR_MAP.indigo

  return (
    <button
      onClick={() => onClick(id)}
      aria-label={`Browse ${name} schemes`}
      className={`
        ${bg} ${glow}
        relative w-full text-left rounded-2xl p-5 md:p-6
        card-hover cursor-pointer overflow-hidden
        shadow-lg hover:shadow-2xl
        focus:outline-none focus:ring-2 focus:ring-white/40
        animate-slide-in-up
      `}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Background shimmer decoration */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />

      {/* Icon */}
      <div className="text-4xl md:text-5xl mb-3 leading-none">{icon}</div>

      {/* Name */}
      <h3 className="text-white font-bold text-base md:text-lg leading-tight mb-1">
        {name}
      </h3>

      {/* Description */}
      <p className="text-white/70 text-xs md:text-sm leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Arrow */}
      <div className="mt-4 flex items-center gap-1 text-white/60 text-xs font-medium">
        <span>Explore</span>
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </div>
    </button>
  )
}
