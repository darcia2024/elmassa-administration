import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-manrope)", "Arial", "sans-serif"],
      },
      colors: {
        brand: {
          pink: "#d83b7d",
          pinkHover: "#c22c6c",
          pinkLight: "#f472b6",
          pinkSoft: "#fdf2f8",
          rose: "#f9dbe8",
          brown: "#765039",
          brownLight: "#9a684c",
          brownSoft: "#f7f1ed",
          cocoa: "#3c2920",
          cocoaDark: "#271912",
          cream: "#fff8f5",
          amber: "#d97706",
        },
      },
      boxShadow: {
        soft: "0 20px 70px rgba(60, 41, 32, 0.08)",
        glow: "0 10px 30px rgba(216, 59, 125, 0.15)",
        card: "0 10px 30px -5px rgba(60, 41, 32, 0.05), 0 0 0 1px rgba(216, 59, 125, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
