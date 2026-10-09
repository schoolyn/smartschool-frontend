/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // brand accent, now a neutral black/white/gray scale to match the logo.
        // 600 is the solid button/CTA color (near-black); 700 is its hover (a touch lighter).
        // Dark-mode inversions (light buttons, light link text) live in src/index.css.
        primary: {
          yankees: "#201F37",
          50: "#f5f5f5",
          100: "#ebebeb",
          200: "#d4d4d4",
          300: "#a3a3a3",
          400: "#737373",
          500: "#525252",
          600: "#171717",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
        base: {
          900: "#9D9CAF",
          600: "#6C6B80",
          400: "#201F37",
        },
        // neutral (true gray, no blue undertone) instead of Tailwind's default gray
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
