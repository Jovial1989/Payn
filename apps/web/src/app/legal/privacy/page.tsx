import type { Metadata } from "next";

// BUG-015 — Skeleton Privacy Policy. Covers the GDPR essentials
// (controller identity, lawful basis, retention, rights, contact)
// so the signup-time T&C checkbox links to a real page.

export const metadata: Metadata = {
  title: "Privacy Policy — Payn",
  description:
    "How Payn handles personal data — what we collect, why, how long, and your GDPR rights.",
};

export default function PrivacyPage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        Legal
      </p>
      <h1>Privacy Policy</h1>
      <p className="!text-ink-tertiary">Last updated: 25 May 2026</p>

      <h2>1. Who&apos;s the data controller</h2>
      <p>
        The controller for the data described below is Kyrylo Petrov, operator
        of payn.online. Contact:{" "}
        <a href="mailto:hello@payn.online">hello@payn.online</a>.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Account data</strong> when you create an account: email,
          hashed password, locale, country preference.
        </li>
        <li>
          <strong>Saved offers and comparison state</strong> if you sign in
          (otherwise stored locally in your browser).
        </li>
        <li>
          <strong>Click events</strong> when you visit a provider via Payn — we
          record the offer slug and timestamp to bill referral commissions.
        </li>
        <li>
          <strong>Anonymised analytics</strong> (page views, search terms) via
          Amplitude. No raw IP is stored beyond 24 hours.
        </li>
      </ul>

      <h2>3. Why we process it (lawful basis)</h2>
      <ul>
        <li>
          <strong>Contract (Art. 6(1)(b) GDPR)</strong> — to operate your
          account, save your shortlist, and run the comparison engine.
        </li>
        <li>
          <strong>Legitimate interest (Art. 6(1)(f))</strong> — to attribute
          referral commissions, prevent fraud, and improve the product.
        </li>
        <li>
          <strong>Consent (Art. 6(1)(a))</strong> — for marketing emails and
          non-essential cookies. You can withdraw consent any time.
        </li>
      </ul>

      <h2>4. Sharing with providers</h2>
      <p>
        When you click an offer, you leave payn.online and continue on the
        provider&apos;s site. From that point onward, the provider&apos;s
        privacy policy applies. Payn does not pass your personal data to
        providers as part of the click.
      </p>

      <h2>5. Retention</h2>
      <ul>
        <li>Account data: until you delete the account, plus 30 days.</li>
        <li>Click events: 24 months (for commission reconciliation).</li>
        <li>Marketing email list: until you unsubscribe.</li>
      </ul>

      <h2>6. Your rights</h2>
      <p>
        Under GDPR you can request access, rectification, erasure, restriction,
        portability, and object to processing. Email{" "}
        <a href="mailto:hello@payn.online">hello@payn.online</a> from the
        address on file and we&apos;ll respond within 30 days.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Essential cookies (session, locale, country, T&C consent) are set
        without prompting. Non-essential cookies (analytics, marketing) are
        only set after explicit consent. See{" "}
        <a href="/legal/cookies">Cookie Policy</a>.
      </p>

      <h2>8. Complaints</h2>
      <p>
        If you think we&apos;ve mishandled your data, you can complain to your
        local data-protection authority, or contact us first at{" "}
        <a href="mailto:hello@payn.online">hello@payn.online</a>.
      </p>
    </>
  );
}
