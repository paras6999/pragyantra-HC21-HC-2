/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#7c6eff', light: '#a78bfa', dark: '#5b4fd4' },
        accent:   '#00d2ff',
        eligible: '#22c55e',
        grey:     '#f59e0b',
        danger:   '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up':    'slideUp 0.4s ease forwards',
        'fade-in':     'fadeIn 0.3s ease forwards',
        'float':       'float 3s ease-in-out infinite',
        'pulse-slow':  'pulse 3s ease-in-out infinite',
        'glow':        'glow 2s ease-in-out infinite',
      },
      keyframes: {
        slideUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        float:    { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        glow:     { '0%,100%': { boxShadow: '0 0 20px rgba(124,110,255,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(124,110,255,0.6)' } },
      },
      backgroundImage: {
        'app-bg':      'radial-gradient(ellipse at top left, #1e1b4b 0%, #0a0a1a 60%)',
        'card-purple': 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
        'card-green':  'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
        'card-blue':   'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 100%)',
        'card-orange': 'linear-gradient(135deg, #c2410c 0%, #f59e0b 100%)',
        'card-pink':   'linear-gradient(135deg, #be185d 0%, #9333ea 100%)',
        'card-yellow': 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
        'card-indigo': 'linear-gradient(135deg, #3730a3 0%, #7c3aed 100%)',
      },
    },
  },
  plugins: [],
}
