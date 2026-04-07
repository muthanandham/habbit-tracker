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
          app: 'rgb(var(--surface) / <alpha-value>)',
          surface: 'rgb(var(--surface-elevated) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
          lowered: 'rgb(var(--surface-lowered) / <alpha-value>)',
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
          bg: 'var(--glass-bg)',
          border: 'var(--glass-border)',
        },
        text: {
          primary: 'rgb(var(--text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        border: {
          subtle: 'var(--border-dim)',
          bright: 'var(--border-bright)',
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
