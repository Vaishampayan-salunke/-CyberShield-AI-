/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          950: '#040711',
          900: '#080B16',
          850: '#0D1322',
          800: '#111827',
          750: '#151F32',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        brand: {
          blue: '#2563EB',
          'blue-light': '#3B82F6',
          purple: '#7C3AED',
          'purple-light': '#8B5CF6',
          cyan: '#06B6D4',
          emerald: '#10B981',
          danger: '#EF4444',
          warning: '#F59E0B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.3)',
        'glow-purple': '0 0 25px -5px rgba(124, 58, 237, 0.3)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.3)',
        'glow-success': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'radar-sweep': 'radar 4s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
