/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        sans: ['"Inter Tight"', "ui-sans-serif", "system-ui"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular"],
      },
      colors: {
        ink: {
          DEFAULT: "#161311",
          soft: "#2a2520",
        },
        bone: {
          DEFAULT: "#f5f1e8",
          warm: "#ebe4d3",
          deep: "#e0d6bf",
        },
        sauce: {
          DEFAULT: "#d83a1f", // signature saffron-red
          deep: "#a82712",
          glow: "#f56a48",
        },
        olive: "#5a5a3a",
        cream: "#fdfbf6",
      },
      boxShadow: {
        card: "0 1px 0 rgba(22,19,17,0.04), 0 12px 30px -12px rgba(22,19,17,0.12)",
        deep: "0 24px 60px -20px rgba(22,19,17,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
