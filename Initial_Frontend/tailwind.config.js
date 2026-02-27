/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#f27f0d",
        "primary-hover": "#d96d0b",
        "india-green": "#138808",
        "background-light": "#fcfaf8",
        "background-dark": "#221910",
        "neutral-warm": "#f4ede7",
        "neutral-accent": "#f4ede7",
        "accent-warm": "#e8dbce",
      },
      fontFamily: {
        "display": ["Lexend", "sans-serif"],
        "heading": ["Baloo 2", "cursive"],
        "baloo": ["Baloo 2", "cursive"],
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}
