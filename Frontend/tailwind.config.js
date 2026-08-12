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
          card: '#FFFFFF',
          chocolate: '#2B1810',
          'chocolate-light': '#3D2419',
          'chocolate-hover': '#1F100A',
          gold: '#CBB279',
          'gold-hover': '#BA9F62',
          'gold-light': '#F6EEDC',
          pink: '#D65B78',
          'pink-hover': '#C04663',
          'pink-light': '#FCE8EC',
          gray: '#6B7280',
          border: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'dinora': '0 4px 20px -2px rgba(43, 24, 16, 0.06), 0 2px 6px -1px rgba(43, 24, 16, 0.04)',
        'dinora-hover': '0 10px 25px -3px rgba(43, 24, 16, 0.1), 0 4px 10px -2px rgba(43, 24, 16, 0.06)',
      }
    },
  },
  plugins: [],
}
