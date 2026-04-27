/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cocoa: {
          50: "#f6f1ee",
          100: "#ead9cf",
          300: "#be9b86",
          500: "#8d634f",
          700: "#5d3d2f",
          800: "#452b21",
          900: "#2f1b14",
        },
        sand: {
          100: "#f4efe8",
          300: "#ddcfbe",
          500: "#b8a089",
        },
        ivory: {
          50: "#fffdfa",
          100: "#f8f3ed",
        },
      },
      fontFamily: {
        display: ["'Sonar Hubermann'", "serif"],
        sans: ["'Manrope'", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 14px 30px rgba(60, 34, 22, 0.08)",
      },
    },
  },
  plugins: [],
}

