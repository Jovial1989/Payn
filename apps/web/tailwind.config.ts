import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Background layers (light)
        bg: {
          deep: "#F8F9FA",
          DEFAULT: "#FFFFFF",
          elevated: "#FFFFFF",
          surface: "#F4F5F7",
          overlay: "#F0F1F3",
        },
        // Primary – pure black for CTAs
        primary: {
          DEFAULT: "#000000",
          soft: "rgba(0, 0, 0, 0.04)",
          glow: "rgba(0, 0, 0, 0.06)",
        },
        // Accent – subtle blue for badges
        accent: {
          blue: "#E8F0FE",
          "blue-text": "#1A73E8",
          green: "#E6F4EA",
          "green-text": "#137333",
          purple: "#F3E8FD",
          "purple-text": "#7B2FF2",
          orange: "#FEF3E2",
          "orange-text": "#E37400",
        },
        // Text
        ink: {
          DEFAULT: "#000000",
          secondary: "#6B7280",
          tertiary: "#9CA3AF",
        },
        // Borders
        line: {
          DEFAULT: "rgba(0, 0, 0, 0.06)",
          strong: "rgba(0, 0, 0, 0.10)",
          active: "rgba(0, 0, 0, 0.20)",
        },
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(0, 0, 0, 0.04)",
        card: "0 4px 20px rgba(0, 0, 0, 0.04)",
        elevated: "0 8px 30px rgba(0, 0, 0, 0.06)",
        "card-hover": "0 12px 40px rgba(0, 0, 0, 0.08)",
        glow: "0 0 0 rgba(0, 0, 0, 0)",
        "glow-strong": "0 0 0 rgba(0, 0, 0, 0)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
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
