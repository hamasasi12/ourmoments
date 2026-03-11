import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FAF3E0",
          dark: "#F0E6CC",
        },
        rose: {
          dusty: "#E8A598",
          light: "#F2C4BB",
          dark: "#C97E70",
        },
        wine: {
          DEFAULT: "#6B2737",
          light: "#8B3A4D",
          dark: "#4A1A26",
        },
        gold: {
          DEFAULT: "#C9A84C",
          light: "#DFC07A",
          dark: "#A8862E",
        },
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "film-flicker": "filmFlicker 0.1s infinite alternate",
        "float": "float 3s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        filmFlicker: {
          "0%": { opacity: "0.85" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201, 168, 76, 0.4)" },
          "50%": { boxShadow: "0 0 0 8px rgba(201, 168, 76, 0)" },
        },
      },
      backgroundImage: {
        "gradient-romantic": "linear-gradient(135deg, #FAF3E0 0%, #F2C4BB 50%, #E8A598 100%)",
        "gradient-dark-romance": "linear-gradient(135deg, #1a0a0f 0%, #4A1A26 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
