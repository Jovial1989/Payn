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
      // Two-layer shadow ladder. Each token combines a tight close-cast
      // shadow (for the "physical edge" of the surface) with a diffuse
      // spread shadow (for the ambient lift). Apple/Stripe/Linear all use
      // this technique — produces a much more premium feel than a single
      // big blur.
      //
      // The previous values (single 30px / 48px / 56px blur) read as
      // "floating in Photoshop" — the new ladder grounds each surface.
      boxShadow: {
        subtle:       "0 1px 2px rgba(15, 23, 32, 0.04), 0 2px 4px rgba(15, 23, 32, 0.02)",
        card:         "0 1px 3px rgba(15, 23, 32, 0.04), 0 8px 16px rgba(15, 23, 32, 0.05)",
        elevated:     "0 2px 4px rgba(15, 23, 32, 0.05), 0 14px 28px rgba(15, 23, 32, 0.07)",
        "card-hover": "0 4px 8px rgba(15, 23, 32, 0.06), 0 20px 36px rgba(15, 23, 32, 0.09)",
        // Floating: dark high-emphasis panels (Manifesto, modals).
        floating:     "0 8px 16px rgba(15, 23, 32, 0.08), 0 24px 48px rgba(15, 23, 32, 0.12)",
        // Lift: hover-only delta — adds the diffuse layer without doubling
        // the tight one, so the surface "rises" not "puffs".
        lift:         "0 12px 24px rgba(15, 23, 32, 0.08)",
        glow: "0 0 0 rgba(0, 0, 0, 0)",
        "glow-strong": "0 0 0 rgba(0, 0, 0, 0)",
      },
      // Tightening ladder for headlines. Replaces the 6 ad-hoc values
      // (-0.025, -0.03, -0.04, -0.05, -0.06, -0.07) scattered across the
      // codebase with 3 canonical steps. Use `tracking-tight-1` for body
      // headings, `-2` for section heads, `-3` for hero displays only.
      letterSpacing: {
        "tight-1": "-0.02em",
        "tight-2": "-0.035em",
        "tight-3": "-0.055em",
      },
      // Reading-width caps. Long-form copy past ~72 characters degrades
      // measure (saccade fatigue). Apply `max-w-prose-narrow` on body
      // paragraphs that sit alone, `-base` on dual-column blocks, and
      // `-wide` only when you want a headline-like statement, not paragraph.
      maxWidth: {
        "prose-narrow": "56ch",
        "prose-base":   "64ch",
        "prose-wide":   "72ch",
      },
      fontFamily: {
        // WEB.6 — Resolve `font-sans` to the next/font CSS variable so
        // Tailwind's default body-font utility actually points at the
        // self-hosted Manrope, not the un-loaded family name.
        sans: ["var(--font-manrope)", "Manrope", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "sans-serif"],
      },
      // RESP — Display/h1/h2/h3 use clamp() so they auto-shrink at
      // narrow viewports. At 375px the values resolve to the lower
      // bound (the explicit "rem" minimum); from ~768px they ramp
      // toward the maximum which matches the original desktop sizes.
      // This is the single highest-leverage mobile-responsive change
      // — every page that uses `text-h1/h2/display` benefits without
      // per-page mobile overrides.
      fontSize: {
        display: ["clamp(2.4rem, 6vw, 4rem)", { lineHeight: "1.05", fontWeight: "800", letterSpacing: "-0.04em" }],
        h1: ["clamp(2rem, 4.5vw, 2.75rem)", { lineHeight: "1.08", fontWeight: "800", letterSpacing: "-0.035em" }],
        h2: ["clamp(1.5rem, 3.5vw, 2rem)", { lineHeight: "1.15", fontWeight: "700", letterSpacing: "-0.025em" }],
        h3: ["1.25rem", { lineHeight: "1.3", fontWeight: "700", letterSpacing: "-0.015em" }],
        caption: ["0.75rem", { lineHeight: "1.5", fontWeight: "600", letterSpacing: "0.04em" }],
      },
      // Radius ladder is 8 → 12 → 16 → 20 → 24 → 32. Ad-hoc 22/28 are
      // banned — every rounded value comes from this scale so border
      // curvatures stay in rhythm across the page.
      borderRadius: {
        xl: "20px",   // upgraded from default 12px so `rounded-xl` = the 20px tier
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
        "5xl": "40px", // hero shells only
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
        "float": "float 6s ease-in-out infinite",
        // 1.6s + symmetric easing — the premium-feel spec. Was 1.8s linear
        // which read as "loading", not "preparing".
        shimmer: "shimmer 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
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
