/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core Brand Palette derived from the Veedu Vadagaiku Emblem
        brand: {
          navy: '#0B1B3D',
          'navy-dark': '#060D1E',
          'navy-light': '#152C5B',
          emerald: '#065F46',
          'emerald-light': '#059669',
          'emerald-dark': '#023828',
          gold: '#C59B27',
          'gold-light': '#E8C862',
          'gold-dark': '#9A7818',
        },
        // Primary Brand Color: Luxury Emerald Green
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#047857', // Main Brand Emerald
          700: '#065f46',
          800: '#064e3b',
          900: '#022c22',
        },
        // Seamlessly map 'orange' utility classes to the rich Emerald & Gold theme
        orange: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669', // Vibrant Emerald Primary
          700: '#047857', // Deep Emerald Hover
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        // Accent Gold / Amber
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
