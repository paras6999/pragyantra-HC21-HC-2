/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gov: {
          navy:    '#1a3569',
          'navy-dark': '#0d1f3c',
          'navy-light': '#2a4a8a',
          saffron: '#FF6600',
          'saffron-light': '#FF8533',
          green:   '#138808',
          'green-light': '#1aad0a',
          white:   '#FFFFFF',
          'off-white': '#F5F7FA',
          'light-blue': '#EEF2FF',
          border:  '#D0D7E0',
          text:    '#1A2332',
          muted:   '#5C6B7A',
        },
        eligible: '#138808',
        grey:     '#b45309',
        danger:   '#dc2626',
      },
      fontFamily: {
        sans: ['Noto Sans', 'Inter', 'system-ui', 'sans-serif'],
        deva: ['Noto Sans Devanagari', 'sans-serif'],
      },
      backgroundImage: {
        'tricolor': 'linear-gradient(to right, #FF6600 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%)',
        'card-blue':   'linear-gradient(135deg, #1a3569 0%, #2a4a8a 100%)',
        'card-green':  'linear-gradient(135deg, #138808 0%, #059669 100%)',
        'card-purple': 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
        'card-yellow': 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
        'card-orange': 'linear-gradient(135deg, #c2410c 0%, #FF6600 100%)',
        'card-pink':   'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
        'card-indigo': 'linear-gradient(135deg, #1a3569 0%, #4f46e5 100%)',
      },
      animation: {
        'slide-up':   'slideUp 0.4s ease forwards',
        'fade-in':    'fadeIn 0.35s ease forwards',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        float:   { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      boxShadow: {
        'gov': '0 2px 16px rgba(26,53,105,0.12)',
        'gov-md': '0 4px 32px rgba(26,53,105,0.18)',
        'gov-lg': '0 8px 48px rgba(26,53,105,0.22)',
      },
    },
  },
  plugins: [],
}
