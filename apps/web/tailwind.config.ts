import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-outfit)', 'var(--font-geist)', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      colors: {
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          muted: 'rgb(var(--surface-muted) / <alpha-value>)',
          elevated: 'rgb(var(--surface-elevated) / <alpha-value>)',
        },
        sidebar: 'rgb(var(--sidebar) / <alpha-value>)',
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          foreground: 'rgb(var(--accent-fg) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        bubble: {
          in: 'rgb(var(--bubble-in) / <alpha-value>)',
          out: 'rgb(var(--bubble-out) / <alpha-value>)',
          'out-ink': 'rgb(var(--bubble-out-ink) / <alpha-value>)',
        },
      },
      boxShadow: {
        soft: '0 8px 30px rgb(0 0 0 / 0.08)',
        lift: '0 12px 40px rgb(0 0 0 / 0.12)',
        bubble: '0 1px 2px rgb(0 0 0 / 0.06)',
        'bubble-dark': '0 1px 3px rgb(0 0 0 / 0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config;
