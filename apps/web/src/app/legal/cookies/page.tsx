import type { Metadata } from "next";

// BUG-015 — Cookie Policy stub. Required under the ePrivacy
// Directive across the EU. Real implementation also needs a
// consent banner UI; this page documents what each cookie does.

export const metadata: Metadata = {
  title: "Cookie Policy — Payn",
  description:
    "The cookies payn.online sets, what they store, and how to opt out.",
};

export default function CookiesPage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        Legal
      </p>
      <h1>Cookie Policy</h1>
      <p className="!text-ink-tertiary">Last updated: 25 May 2026</p>

      <p>
        Payn uses cookies and similar local-storage mechanisms to remember your
        preferences, keep you signed in, and measure how the site is used. This
        page lists every category we use and how to manage your consent.
      </p>

      <h2>Essential</h2>
      <p>
        These cookies are required for the site to work and don&apos;t need
        consent under GDPR / ePrivacy.
      </p>
      <ul>
        <li>
          <code>payn-locale</code> — remembers the language you chose.
        </li>
        <li>
          <code>payn-country</code> — remembers the country you selected.
        </li>
        <li>
          <code>sb-*</code> — Supabase session cookies when you&apos;re signed in.
        </li>
        <li>
          <code>payn-admin-session</code> — admin-panel session token.
        </li>
      </ul>

      <h2>Analytics</h2>
      <p>Only set after you accept the cookie banner.</p>
      <ul>
        <li>
          <code>amplitude_*</code> — Amplitude product analytics. Anonymous
          device ID, no raw IP stored beyond 24 hours.
        </li>
      </ul>

      <h2>Marketing</h2>
      <p>
        We don&apos;t currently run third-party marketing pixels (no Meta,
        Google Ads, LinkedIn, TikTok). If that changes, this section will list
        them and the banner will gate them behind explicit opt-in.
      </p>

      <h2>How to manage cookies</h2>
      <p>
        You can change your choice any time by clicking &ldquo;Cookie
        preferences&rdquo; in the footer, or by clearing site data in your
        browser&apos;s privacy settings.
      </p>
    </>
  );
}
