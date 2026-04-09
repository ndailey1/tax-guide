import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tax: {
          bg: "#0C1018",
          surface: "#141B27",
          "surface-alt": "#1A2332",
          border: "#273040",
          "border-light": "#3A4660",
          accent: "#4C9AFF",
          "accent-dim": "#1A2F4F",
          green: "#36B37E",
          "green-dim": "#132E22",
          orange: "#FFAB00",
          "orange-dim": "#3D2E0A",
          red: "#FF5630",
          text: "#E3E8F0",
          muted: "#8899AA",
          dim: "#4A5568",
        },
      },
      fontFamily: {
        serif: ["Literata", "Georgia", "serif"],
        sans: ["IBM Plex Sans", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
