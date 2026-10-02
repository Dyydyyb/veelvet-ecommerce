/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        beige: {
          50: '#FAF8F5',
          100: '#F5F2EB',
          200: '#F0EDE3', // beige protagonista del logo
          300: '#E8E2D0', // variante media
          400: '#D9CFB4', // variante oscura
          500: '#C7B995',
          600: '#9E8E6A',
          DEFAULT: '#F0EDE3',
        },
        navy: {
          50: '#F2F5FB',
          100: '#E2E9F6',
          200: '#C2D1ED',
          300: '#92B0DE',
          400: '#5A86C9',
          500: '#2F4A8A', // hover
          600: '#1B2A4A', // azul principal (navy)
          700: '#15213B',
          800: '#10192D',
          900: '#0B101E',
          DEFAULT: '#1B2A4A',
        },
        accent: {
          blue: '#1B2A4A',
          hover: '#2F4A8A',
        }
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.05em',
        wider: '0.1em',
        widest: '0.2em',
        mega: '0.28em',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee-reverse': 'marquee-reverse 25s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
