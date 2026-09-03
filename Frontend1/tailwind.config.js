/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      '2xs': '280px',
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        dinora: {
          bg: '#FAF6F0',
          card: '#FFFFFF',
          surface: '#FFFFFF',
          chocolate: '#2B1810',
          'chocolate-light': '#3D2419',
          'chocolate-hover': '#1F100A',
          mocha: '#2B1810',
          gold: '#CBB279',
          'gold-hover': '#BA9F62',
          'gold-light': '#F6EEDC',
          'gold-bright': '#D4AF37',
          pink: '#D65B78',
          'pink-hover': '#C04663',
          'pink-light': '#FCE8EC',
          berry: '#D65B78',
          'berry-light': '#F8E7EA',
          taupe: '#6B5B52',
          gray: '#6B7280',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        handwriting: ['Caveat', 'cursive'],
      },
      boxShadow: {
        'dinora': '0 4px 20px -2px rgba(43, 24, 16, 0.06), 0 2px 6px -1px rgba(43, 24, 16, 0.04)',
        'dinora-hover': '0 10px 25px -3px rgba(43, 24, 16, 0.1), 0 4px 10px -2px rgba(43, 24, 16, 0.06)',
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
