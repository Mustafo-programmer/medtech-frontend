/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0f1117',
        bg2: '#1a1d27',
        bg3: '#222534',
        border: '#2e3248',
        primary: '#4f7cff',
      }
    },
  },
  plugins: [],
}