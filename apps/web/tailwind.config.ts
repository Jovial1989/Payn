import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#F3F5F2",
          DEFAULT: "#FFFFFF",
          elevated: "#FFFFFF",
          surface: "#F5F7F4",
          overlay: "#EEF2EE",
        },
        primary: {
          DEFAULT: "#0F1720",
          soft: "rgba(15, 23, 32, 0.04)",
          glow: "rgba(15, 23, 32, 0.08)",
        },
        accent: {
          blue: "#E8F3FF",
          "blue-text": "#1F6FEB",
          green: "#E7F7EF",
          "green-text": "#0F8A4B",
          emerald: "#0F8A4B",
          "emerald-soft": "#DDF4E7",
          "emerald-strong": "#0B6D3B",
          orange: "#FFF1E5",
          "orange-text": "#C46B1A",
        },
        ink: {
          DEFAULT: "#111827",
          secondary: "#4B5563",
          tertiary: "#8A94A6",
        },
        line: {
          DEFAULT: "rgba(17, 24, 39, 0.08)",
          strong: "rgba(17, 24, 39, 0.14)",
          active: "rgba(15, 138, 75, 0.35)",
        },
      },
      boxShadow: {
        subtle: "0 8px 20px rgba(15, 23, 32, 0.04)",
        card: "0 10px 30px rgba(15, 23, 32, 0.05)",
        elevated: "0 18px 48px rgba(15, 23, 32, 0.08)",
        "card-hover": "0 22px 56px rgba(15, 23, 32, 0.1)",
        glow: "0 0 0 rgba(0, 0, 0, 0)",
        "glow-strong": "0 0 0 rgba(0, 0, 0, 0)",
      },
      fontFamily: {
        sans: ["Manrope", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
      },
      fontSize: {
        display: ["4rem", { lineHeight: "1.05", fontWeight: "800", letterSpacing: "-0.04em" }],
        h1: ["2.75rem", { lineHeight: "1.08", fontWeight: "800", letterSpacing: "-0.035em" }],
        h2: ["2rem", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.025em" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "700", letterSpacing: "-0.015em" }],
        caption: ["0.75rem", { lineHeight: "1.5", fontWeight: "600", letterSpacing: "0.04em" }],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "float": "float 6s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
