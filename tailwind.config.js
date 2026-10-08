/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f3eee3',
        beige: {
          50: '#FAF7F0',
          100: '#f3eee3',
          200: '#f3eee3', // beige protagonista pedido por el usuario
          300: '#E2DAC9', // variante media
          400: '#CFC4AE', // variante oscura
          500: '#B8AB91',
          600: '#8E826B',
          DEFAULT: '#f3eee3',
        },
        navy: {
          50: '#F2F5FB',
          100: '#E2E9F6',
          200: '#C2D1ED',
          300: '#92B0DE',
          400: '#5A86C9',
          500: '#2A3A5E', // hover
          600: '#1F2A44', // azul oscuro principal pedido por el usuario
          700: '#192237',
          800: '#131A2A',
          900: '#0C111C',
          DEFAULT: '#1F2A44',
        },
        accent: {
          blue: '#1F2A44',
          hover: '#2A3A5E',
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
