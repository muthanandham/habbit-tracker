/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          app: '#0b1326',
          surface: '#16213e',
          elevated: '#16213e',
          lowered: '#050a14',
        },
        accent: {
          gold: '#e9c176',
          habit: '#3B82F6',
          task: '#8B5CF6',
          wellness: '#10B981',
          assistant: '#e9c176',
          foreground: '#0b1326',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        border: {
          subtle: 'rgba(233, 193, 118, 0.1)',
          bright: 'rgba(233, 193, 118, 0.3)',
        }
      },
      fontFamily: {
        editorial: ['Noto Serif', 'serif'],
        precision: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      animation: {
        'success-glow': 'successGlow 400ms ease-out',
        'type-in': 'typeIn 50ms steps(1)',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        successGlow: {
          '0%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(16, 185, 129, 0.4)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
        },
        typeIn: {
          'from': { borderRightColor: 'transparent' },
          'to': { borderRightColor: '#FAFAFA' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
