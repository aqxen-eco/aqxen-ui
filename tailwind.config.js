/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        mobile: {
          max: '767px',
        },
        desktop: '768px',
      },
      maxWidth: {
        'container-lg': '80rem', // 1280px
        'container-md': '53.375rem', // 854px
      },
      backgroundImage: {
        gradient: 'linear-gradient(90deg, #A36AB7 0%, #D17650 25%, #8CA3DA 50%, #B6C190 75%, #E6C97E 100%)'
      },
      colors: {
        gray: {
          1: '#111111',
          2: '#333333',
          3: '#B6B4B4'
        },
        badge: {
          red: '#D17650',
          yellow: '#E6C97E',
          green: '#B6C190',
          blue: '#8CA3DA',
          purple: '#A36AB7',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['4rem', '4rem'],
        'display-2': ['2.5rem', '3rem'],
        'title-1': ['1.75rem', '2.25rem'],
        'title-2': ['1.25rem', '1.75rem'],
        'body-1': ['1.125rem', '1.75rem'],
        'body-2': ['1rem', '1.5rem'],
        'body-3': ['0.875rem', '1.375rem']
      }
    },
  },
  plugins: [],
}

