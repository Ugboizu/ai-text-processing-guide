/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'viola-dark': '#20002e', // User message background (from previous styles)
        'viola-purple': '#331440', // Scrollbar thumb
        'viola-pink': '#c69ac6', // Scrollbar track
        'amber-950': '#3B2415', // Original user message background
        'amber-900': '#451a03', // Hover color for buttons
        'beige': '#dccdb7', // Original background
        'beige-light': '#f7e9d5', // Original text/button color
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        underdog : ['Underdog', 'sans-serif'],
        piedra : ['Piedra', 'sans-serif'],
      },
      height: {
        'screen-dynamic': 'calc(var(--vh) * 100)', // Custom dynamic height
      },
    },
  },
  plugins: [],
};