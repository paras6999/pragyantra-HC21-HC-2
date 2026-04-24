const STATUS_CONFIG = {
  eligible: {
    label: 'Eligible',
    icon:  '✅',
    badge: 'bg-green-50 border-green-300 text-green-800',
  },
  grey_zone: {
    label: 'Grey Zone',
    icon:  '🟡',
    badge: 'bg-amber-50 border-amber-300 text-amber-800',
  },
  not_eligible: {
    label: 'Not Eligible',
    icon:  '❌',
    badge: 'bg-red-50 border-red-300 text-red-700',
  },
}

export default function EligibilityBadge({ status, large = false }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.not_eligible

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-semibold
      ${cfg.badge} ${large ? 'text-sm px-4 py-1.5' : 'text-xs'}`}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}
