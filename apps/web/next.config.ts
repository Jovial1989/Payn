import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "motion", "lightweight-charts"],
  },
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
  async headers() {
    const securityHeaders = [
      // SEC-FIX SEC-001-HEADERS: add browser-side hardening absent from the app.
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.resend.com https://fcm.googleapis.com",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "report-uri /api/v1/csp-report",
        ].join("; "),
      },
      // SEC-FIX PAYN-A17: prevent cross-origin opener/resource attacks
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
    ];
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
  // PASS A (routing). The `/explore/<bucket>` vocabulary is retired in
  // favour of the canonical flat `/en/<category>` surface (locale is a
  // middleware rewrite, so `/cards` resolves to `/en/cards`). These 301s
  // map every legacy entry point — V1-era `/i-want-to/<slug>` situation
  // pages, the bucket slugs, and the older bucket-jargon slugs — onto the
  // flat category routes. The `?type=`/`?context=` hints are preserved so
  // shared links keep their situational query. `/discover` stays the
  // category hub and is NOT redirected.
  //
  // next.config redirects run BEFORE middleware, so each rule needs a
  // `/:locale/...` variant (already-prefixed) AND a bare `/...` variant
  // that targets `/en/...` (no locale prefix yet). Slugs stay English
  // regardless of locale.
  async redirects() {
    return [
      // ── /i-want-to/* → flat /<category>?type=&context=
      { source: "/:locale/i-want-to/travel",        destination: "/:locale/cards?type=travel&context=travel",             permanent: true },
      { source: "/:locale/i-want-to/send-money",    destination: "/:locale/transfers?context=send-abroad",                permanent: true },
      { source: "/:locale/i-want-to/grow-money",    destination: "/:locale/savings?context=grow-savings",                 permanent: true },
      { source: "/:locale/i-want-to/big-purchase",  destination: "/:locale/loans?type=personal&context=big-purchase",     permanent: true },
      { source: "/:locale/i-want-to/run-business",  destination: "/:locale/business?context=self-employed",               permanent: true },
      { source: "/:locale/i-want-to/get-protected", destination: "/:locale/insurance?context=worth-the-money",            permanent: true },
      { source: "/:locale/i-want-to/switch-bank",   destination: "/:locale/banking?type=app-only&context=switch",         permanent: true },
      { source: "/:locale/i-want-to/family",        destination: "/:locale/kids?context=family",                          permanent: true },
      // Bare (no locale prefix yet) → /en/<category>
      { source: "/i-want-to/travel",        destination: "/en/cards?type=travel&context=travel",         permanent: true },
      { source: "/i-want-to/send-money",    destination: "/en/transfers?context=send-abroad",            permanent: true },
      { source: "/i-want-to/grow-money",    destination: "/en/savings?context=grow-savings",             permanent: true },
      { source: "/i-want-to/big-purchase",  destination: "/en/loans?type=personal&context=big-purchase", permanent: true },
      { source: "/i-want-to/run-business",  destination: "/en/business?context=self-employed",           permanent: true },
      { source: "/i-want-to/get-protected", destination: "/en/insurance?context=worth-the-money",        permanent: true },
      { source: "/i-want-to/switch-bank",   destination: "/en/banking?type=app-only&context=switch",     permanent: true },
      { source: "/i-want-to/family",        destination: "/en/kids?context=family",                      permanent: true },

      // ── /explore/<bucket> → flat /<category>
      { source: "/:locale/explore/cards",         destination: "/:locale/cards",       permanent: true },
      { source: "/:locale/explore/saving",        destination: "/:locale/savings",     permanent: true },
      { source: "/:locale/explore/sending-money", destination: "/:locale/transfers",   permanent: true },
      { source: "/:locale/explore/bank-accounts", destination: "/:locale/banking",     permanent: true },
      { source: "/:locale/explore/investing",     destination: "/:locale/investments", permanent: true },
      { source: "/:locale/explore/borrowing",     destination: "/:locale/loans",       permanent: true },
      { source: "/:locale/explore/for-business",  destination: "/:locale/business",    permanent: true },
      { source: "/:locale/explore/family",        destination: "/:locale/kids",        permanent: true },
      { source: "/:locale/explore/insurance",     destination: "/:locale/insurance",   permanent: true },
      { source: "/explore/cards",         destination: "/en/cards",       permanent: true },
      { source: "/explore/saving",        destination: "/en/savings",     permanent: true },
      { source: "/explore/sending-money", destination: "/en/transfers",   permanent: true },
      { source: "/explore/bank-accounts", destination: "/en/banking",     permanent: true },
      { source: "/explore/investing",     destination: "/en/investments", permanent: true },
      { source: "/explore/borrowing",     destination: "/en/loans",       permanent: true },
      { source: "/explore/for-business",  destination: "/en/business",    permanent: true },
      { source: "/explore/family",        destination: "/en/kids",        permanent: true },
      { source: "/explore/insurance",     destination: "/en/insurance",   permanent: true },

      // ── Old bucket-jargon slugs → flat /<category>
      { source: "/:locale/explore/spend-smarter",     destination: "/:locale/cards",       permanent: true },
      { source: "/:locale/explore/earn-on-cash",      destination: "/:locale/savings",     permanent: true },
      { source: "/:locale/explore/travel-and-abroad", destination: "/:locale/transfers",   permanent: true },
      { source: "/:locale/explore/daily-banking",     destination: "/:locale/banking",     permanent: true },
      { source: "/:locale/explore/invest-and-grow",   destination: "/:locale/investments", permanent: true },
      { source: "/:locale/explore/big-purchases",     destination: "/:locale/loans",       permanent: true },
      { source: "/:locale/explore/family-and-kids",   destination: "/:locale/kids",        permanent: true },
      { source: "/:locale/explore/protect",           destination: "/:locale/insurance",   permanent: true },
      { source: "/explore/spend-smarter",     destination: "/en/cards",       permanent: true },
      { source: "/explore/earn-on-cash",      destination: "/en/savings",     permanent: true },
      { source: "/explore/travel-and-abroad", destination: "/en/transfers",   permanent: true },
      { source: "/explore/daily-banking",     destination: "/en/banking",     permanent: true },
      { source: "/explore/invest-and-grow",   destination: "/en/investments", permanent: true },
      { source: "/explore/big-purchases",     destination: "/en/loans",       permanent: true },
      { source: "/explore/family-and-kids",   destination: "/en/kids",        permanent: true },
      { source: "/explore/protect",           destination: "/en/insurance",   permanent: true },

      // ── Retire the rest of the /explore/* system → /discover (the hub
      // we keep). The bare `/explore` and `/:locale/explore` index plus
      // any unmatched `/explore/<rest>` collapse to /discover.
      { source: "/:locale/explore",         destination: "/:locale/discover", permanent: true },
      { source: "/explore",                 destination: "/en/discover",      permanent: true },
      { source: "/:locale/explore/:rest*",  destination: "/:locale/discover", permanent: true },
      { source: "/explore/:rest*",          destination: "/en/discover",      permanent: true },
    ];
  },
};

export default nextConfig;
