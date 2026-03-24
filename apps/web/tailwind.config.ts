import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background layers
        bg: {
          deep: "#040907",
          DEFAULT: "#070E0B",
          elevated: "#0C1A15",
          surface: "#111F1A",
          overlay: "#162A23",
        },
        // Primary emerald
        primary: {
          400: "#34D399",
          DEFAULT: "#10B981",
          600: "#059669",
          700: "#047857",
          soft: "rgba(16, 185, 129, 0.10)",
          glow: "rgba(16, 185, 129, 0.15)",
        },
        // Secondary teal
        secondary: {
          400: "#2DD4BF",
          DEFAULT: "#14B8A6",
          600: "#0D9488",
        },
        // Text
        ink: {
          DEFAULT: "#F0FDF4",
          secondary: "#94A3B8",
          tertiary: "#64748B",
        },
        // Borders
        line: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",
          strong: "rgba(255, 255, 255, 0.12)",
          active: "rgba(16, 185, 129, 0.4)",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.3)",
        card: "0 4px 12px rgba(0, 0, 0, 0.4)",
        elevated: "0 8px 24px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(16, 185, 129, 0.15)",
        "glow-strong": "0 0 30px rgba(16, 185, 129, 0.25)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
        mono: ['"JetBrains Mono"', '"SF Mono"', "monospace"],
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.1", fontWeight: "700", letterSpacing: "-0.03em" }],
        h1: ["2.5rem", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.025em" }],
        h2: ["1.75rem", { lineHeight: "1.25", fontWeight: "600", letterSpacing: "-0.02em" }],
        h3: ["1.25rem", { lineHeight: "1.35", fontWeight: "600", letterSpacing: "-0.015em" }],
        caption: ["0.75rem", { lineHeight: "1.5", fontWeight: "500", letterSpacing: "0.05em" }],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
        "4xl": "24px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
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
      },
    },
  },
  plugins: [],
};

export default config;
