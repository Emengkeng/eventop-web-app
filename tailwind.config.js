/** @type {import('tailwindcss').Config} */
import { withUt } from "uploadthing/tw";

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
        "abc-favorit": ["var(--font-abc-favorit)", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
  plugins: [],
};