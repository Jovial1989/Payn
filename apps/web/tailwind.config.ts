import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050B09",
        surface: "#0B1A14",
        panel: "#0B1A14",
        "panel-strong": "#0F241B",
        primary: "#2FA36B",
        "primary-dark": "#1F7A4F",
        accent: "#43C37F",
        "primary-soft": "rgba(47, 163, 107, 0.12)",
        ink: "#E6F4EE",
        muted: "#A8C5B8",
        line: "rgba(47, 163, 107, 0.2)",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0, 0, 0, 0.18)",
        soft: "0 4px 18px rgba(0, 0, 0, 0.14)",
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', "sans-serif"],
        display: ['"Avenir Next"', '"Segoe UI"', '"Helvetica Neue"', "sans-serif"],
        mono: ['"IBM Plex Mono"', '"SFMono-Regular"', "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
