import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#d83b7d",
          rose: "#f9dbe8",
          brown: "#765039",
          cocoa: "#3c2920",
          cream: "#fff8f5",
        },
      },
      boxShadow: {
        soft: "0 20px 70px rgba(60, 41, 32, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
