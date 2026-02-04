/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan all JS/TS files inside src
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}