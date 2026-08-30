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
        background: 'var(--background)',
        surface: 'var(--surface)',
        'surface-elevated': 'var(--surface-elevated)',
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        beige: {
          50: '#FBF8F3',
          100: '#F7F1E8',
          200: '#EADCC8',
          300: '#DCC8AE',
          400: '#CDB494',
        },
        brown: {
          500: '#A67C52',
          600: '#7A5A42',
          700: '#5A3E2B',
          800: '#422D1F',
          900: '#2F261F',
        },
        accent: 'var(--accent)',
        'text-main': 'var(--text)',
        'text-muted': 'var(--muted)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(90, 62, 43, 0.06), 0 1px 2px 0 rgba(90, 62, 43, 0.04)',
        'warm': '0 4px 12px 0 rgba(90, 62, 43, 0.08), 0 2px 4px 0 rgba(90, 62, 43, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(90, 62, 43, 0.12), 0 4px 6px -2px rgba(90, 62, 43, 0.05)',
        'warm-xl': '0 20px 30px -4px rgba(90, 62, 43, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
