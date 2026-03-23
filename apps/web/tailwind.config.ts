import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#07130f",
        panel: "#0e1f19",
        "panel-strong": "#132921",
        accent: "#19c37d",
        "accent-soft": "rgba(25, 195, 125, 0.16)",
        ink: "#ecf8f2",
        muted: "#96b5a7",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(25,195,125,0.14), 0 20px 80px rgba(0,0,0,0.32)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};

export default config;
