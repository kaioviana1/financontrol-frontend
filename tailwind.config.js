/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        /* ── Brand ─────────────────────────────────── */
        primary: {
          DEFAULT: '#7CF73F',
          50:  '#F0FEE8',
          100: '#DCFCC7',
          200: '#BAFC94',
          300: '#93F75A',
          400: '#7CF73F',
          500: '#5CE020',
          600: '#45B518',
          700: '#348A13',
          800: '#296D12',
          900: '#1F5410',
          950: '#0A2A05',
        },
        /* ── Sidebar ───────────────────────────────── */
        sidebar: {
          DEFAULT: '#080E1F',
          surface: '#0D1530',
          hover:   '#111D3C',
          border:  '#1A274A',
          muted:   '#3D4F72',
        },
        /* ── Surface / Canvas ──────────────────────── */
        canvas:  '#F2F5FA',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        /* Cards */
        card:         '0 1px 3px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.04)',
        'card-hover': '0 4px 8px rgba(15,23,42,0.04), 0 16px 32px rgba(15,23,42,0.08)',
        /* Navbar */
        nav:          '0 1px 0 rgba(15,23,42,0.06)',
        /* Primary glow */
        'glow-primary': '0 4px 16px rgba(124,247,63,0.35)',
        'glow-primary-lg': '0 8px 32px rgba(124,247,63,0.4)',
        /* Modals */
        modal:        '0 24px 64px rgba(15,23,42,0.20)',
        /* Input focus */
        'input-focus': '0 0 0 3px rgba(124,247,63,0.20)',
      },
      screens: {
        xs: '480px',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer:  'shimmer 1.6s linear infinite',
        'fade-up': 'fade-up 0.25s ease-out forwards',
      },
    },
  },
  plugins: [],
};
