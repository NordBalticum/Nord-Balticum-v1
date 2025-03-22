/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "600px",
        md: "728px",
        lg: "984px",
        xl: "1240px",
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        primary: "#0A1F44", // NordBaltic tamsiai mėlyna
        gold: "#FFD700", // Auksas UI akcentams
        dark: "#0a0a0a", // Ultimate dark UI
        white: "#ffffff",
        "deep-blue": "#1B2370",
        "nb-gradient-start": "rgba(43, 55, 255, 0.95)",
        "nb-gradient-mid": "rgba(27, 35, 112, 0.98)",
        "nb-gradient-end": "rgba(10, 18, 42, 1)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      fontWeight: {
        heavy: "800",
        extra: "900",
      },
      borderRadius: {
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        gold: "0 0 20px 4px rgba(255, 215, 0, 0.6)",
        "glass-sm": "0 2px 20px rgba(255, 255, 255, 0.06)",
        "glass-md": "0 4px 30px rgba(255, 255, 255, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "6px",
        lg: "12px",
        xl: "20px",
      },
      scale: {
        102: "1.02",
        105: "1.05",
        110: "1.10",
      },
      animation: {
        glow: "glow 3s ease-in-out infinite",
        fadeIn: "fadeIn 0.7s ease-in forwards",
      },
      keyframes: {
        glow: {
          "0%, 100%": { boxShadow: "0 0 10px #FFD700" },
          "50%": { boxShadow: "0 0 20px #FFD700" },
        },
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
  darkMode: "class", // Fiksuotas dark mode
};
