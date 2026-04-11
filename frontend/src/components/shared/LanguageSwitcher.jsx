import { useApp } from '../../context/AppContext'

const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'हि', full: 'हिन्दी' },
  { code: 'mr', label: 'म',  full: 'मराठी'  },
]

export default function LanguageSwitcher() {
  const { language, setLanguage } = useApp()

  return (
    <div className="flex items-center gap-1 glass rounded-xl p-1" role="group" aria-label="Language switcher">
      {LANGS.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          aria-label={`Switch to ${lang.full}`}
          aria-pressed={language === lang.code}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${language === lang.code
              ? 'bg-purple-600 text-white shadow-lg'
              : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}
