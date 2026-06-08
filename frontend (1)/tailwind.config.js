/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f20d0d',
        'primary-dark': '#94272C',
        'primary-darker': '#6e0404',
        'primary-gradient': '#750616',
        'background-light': '#f8f6f6',
        'background-dark': '#211111',
      },
      fontFamily: {
        display: ['Montserrat', 'Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
