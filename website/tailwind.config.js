/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#16221E",
        paper: "#F5F6F2",
        line: "#DCDFD8",
        teal: {
          50: "#E6F3EF",
          100: "#C7E5DB",
          400: "#1C8A6D",
          500: "#0F6E56",
          600: "#0B4F3E",
          700: "#083A2E",
        },
        clay: {
          50: "#F5EBE2",
          400: "#C17A3E",
          500: "#B5652E",
          600: "#8F4E22",
        },
        amber: {
          50: "#FBF1DE",
          500: "#A6740A",
        },
        rose: {
          50: "#FBEAE8",
          500: "#A6392E",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
