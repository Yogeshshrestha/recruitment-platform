import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5',
          600: '#4F46E5',
        },
        surface: {
          base: '#F9FAFB',
          card: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '7xl': '80rem',
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgb(15 23 42 / 0.06)',
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
} satisfies Config
