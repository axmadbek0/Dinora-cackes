/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dinora: {
          bg: '#FAF6F0',
          mocha: '#2B1810',
          berry: '#D65B78',
          'berry-light': '#F8E7EA',
          gold: '#CBB279',
          'gold-bright': '#D4AF37',
          taupe: '#6B5B52',
          surface: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'dinora-subtle': '0 4px 20px -2px rgba(43, 24, 16, 0.06), 0 2px 6px -1px rgba(43, 24, 16, 0.04)',
        'dinora-glow': '0 10px 30px -5px rgba(214, 91, 120, 0.25)',
        'dinora-gold': '0 10px 30px -5px rgba(203, 178, 121, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
