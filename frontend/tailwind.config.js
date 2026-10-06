/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core Brand Palette derived from the 3D Navy & Gold Veedu Vadagaiku Logo
        brand: {
          navy: '#0B2545',
          'navy-dark': '#060D1E',
          'navy-deep': '#040A17',
          'navy-light': '#163B6B',
          blue: '#1E3A8A',
          gold: '#C59B27',
          'gold-light': '#F59E0B',
          'gold-dark': '#9A7818',
          'gold-metallic': '#D4AF37',
        },
        // Primary Brand Color: Royal Navy Blue
        primary: {
          50: '#f0f6fe',
          100: '#e0edfd',
          200: '#bddbfb',
          300: '#8ec0f8',
          400: '#579df3',
          500: '#2667c9',
          600: '#0B2545', // Signature Royal Navy
          700: '#081c36', // Deep Royal Navy Hover
          800: '#061529',
          900: '#040d1a',
        },
        // Map 'emerald' to the Signature Royal Navy Blue
        emerald: {
          50: '#f0f6fe',
          100: '#e0edfd',
          200: '#bddbfb',
          300: '#8ec0f8',
          400: '#579df3',
          500: '#1d54a5',
          600: '#0B2545', // Signature Royal Navy
          700: '#081c36', // Deep Navy Hover
          800: '#061529',
          900: '#040d1a',
          950: '#02070e',
        },
        // Map 'orange' to the Polished Metallic Gold
        orange: {
          50: '#fdfbf2',
          100: '#fbf4dc',
          200: '#f6e5b3',
          300: '#efcf81',
          400: '#e5b84f',
          500: '#d4af37', // Polished Metallic Gold
          600: '#c59b27', // Signature Logo Gold
          700: '#a17a14', // Deep Burnished Gold Hover
          800: '#7d5c0b',
          900: '#5c4105',
          950: '#060D1E',
        },
        // Accent Gold / Amber
        gold: {
          50: '#fdfbf2',
          100: '#fbf4dc',
          200: '#f6e5b3',
          300: '#efcf81',
          400: '#e5b84f',
          500: '#d4af37',
          600: '#c59b27',
          700: '#a17a14',
          800: '#7d5c0b',
          900: '#5c4105',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Noto Sans Tamil', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Noto Sans Tamil', 'sans-serif'],
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
