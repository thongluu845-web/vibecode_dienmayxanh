import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0066CC",
          50: "#EBF3FF",
          100: "#D6E8FF",
          200: "#ADD0FF",
          300: "#85B9FF",
          400: "#5CA1FF",
          500: "#3389FF",
          600: "#0066CC",
          700: "#0052A3",
          800: "#003D7A",
          900: "#002952",
        },
        secondary: {
          DEFAULT: "#FF6600",
          50: "#FFF3EB",
          100: "#FFE7D6",
          200: "#FFCFAD",
          300: "#FFB785",
          400: "#FF9F5C",
          500: "#FF8733",
          600: "#FF6600",
          700: "#CC5200",
          800: "#993D00",
          900: "#662900",
        },
        success: "#16A34A",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-down": "slideDown 0.3s ease-in-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
