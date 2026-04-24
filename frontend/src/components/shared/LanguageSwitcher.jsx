import { useApp } from '../../context/AppContext'

const LANGS = [
  { code: 'en', label: 'EN',  full: 'English' },
  { code: 'hi', label: 'हि', full: 'हिन्दी'  },
  { code: 'mr', label: 'म',  full: 'मराठी'   },
]

/**
 * Can be used in two contexts:
 *  - dark header (default): white text on dark bg
 *  - light header (variant="light"): dark text on light bg
 */
export default function LanguageSwitcher({ variant = 'dark' }) {
  const { language, setLanguage } = useApp()

  const isLight = variant === 'light'

  return (
    <div
      className={`flex items-center gap-1 rounded-lg p-1 border ${
        isLight
          ? 'bg-white border-gov-border'
          : 'bg-white/10 border-white/20'
      }`}
      role="group"
      aria-label="Language switcher"
    >
      {LANGS.map(lang => {
        const isActive = language === lang.code
        return (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            aria-label={`Switch to ${lang.full}`}
            aria-pressed={isActive}
            title={lang.full}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all duration-200 ${
              isActive
                ? 'bg-[#1a3569] text-white shadow'
                : isLight
                  ? 'text-[#5C6B7A] hover:bg-[#EEF2FF] hover:text-[#1a3569]'
                  : 'text-white/70 hover:text-white hover:bg-white/15'
            }`}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
