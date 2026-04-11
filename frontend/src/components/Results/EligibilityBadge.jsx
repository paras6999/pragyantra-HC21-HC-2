const STATUS_CONFIG = {
  eligible: {
    label: 'Eligible',
    icon: '✅',
    badge: 'bg-green-500/20 border-green-500/40 text-green-300',
  },
  grey_zone: {
    label: 'Grey Zone',
    icon: '🟡',
    badge: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
  },
  not_eligible: {
    label: 'Not Eligible',
    icon: '❌',
    badge: 'bg-red-500/20 border-red-500/40 text-red-300',
  },
}

export default function EligibilityBadge({ status, large = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_eligible

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold
      ${cfg.badge} ${large ? 'text-sm px-4 py-1.5' : ''}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}
