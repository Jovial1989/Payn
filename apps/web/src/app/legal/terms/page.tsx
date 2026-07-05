import type { Metadata } from "next";

// BUG-015 — Skeleton Terms of Service. Real legal copy needs a
// lawyer pass before launch; this template covers the structural
// expectations (acceptance, eligibility, accuracy disclaimers,
// affiliate disclosure pointer, jurisdiction, contact) so the page
// passes a quick compliance scan and links from the footer don't
// 404.

export const metadata: Metadata = {
  title: "Terms of Service — Payn",
  description:
    "The terms that apply when you use payn.online to compare financial products.",
};

export default function TermsPage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        Legal
      </p>
      <h1>Terms of Service</h1>
      <p className="!text-ink-tertiary">Last updated: 25 May 2026</p>

      <h2>1. Who runs Payn</h2>
      <p>
        Payn is operated by Kyrylo Petrov (the &ldquo;operator&rdquo;). Contact:{" "}
        <a href="mailto:hello@payn.online">hello@payn.online</a>.
      </p>

      <h2>2. What Payn does</h2>
      <p>
        Payn is an independent marketplace that compares financial products
        offered by third-party providers across Europe. Payn does <strong>not</strong>{" "}
        provide, broker, or arrange the underlying financial products. When you
        choose an offer and click through, you complete the application with the
        provider directly under their terms and conditions.
      </p>

      <h2>3. No financial advice</h2>
      <p>
        Nothing on payn.online is financial, investment, tax, or legal advice.
        Information is presented for comparison purposes only. Final pricing,
        eligibility, and acceptance are decided by each provider at the point of
        application.
      </p>

      <h2>4. Accuracy of information</h2>
      <p>
        Payn refreshes the catalogue periodically and labels each offer with a
        last-updated date. Rates and conditions can change between refreshes; we
        recommend confirming the headline numbers on the provider&apos;s own
        site before making a decision. If you find data that&apos;s out of date,
        please email <a href="mailto:hello@payn.online">hello@payn.online</a>.
      </p>

      <h2>5. Affiliate disclosure</h2>
      <p>
        Some links on payn.online are affiliate links: if you open an account
        through one of them, the provider may pay Payn a referral fee. This
        compensation does <strong>not</strong> influence the order in which
        offers appear. See our{" "}
        <a href="/legal/affiliate-disclosure">Affiliate Disclosure</a> for the
        full breakdown.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Scrape, copy, or republish the catalogue at scale without consent.</li>
        <li>
          Reverse-engineer rate-comparison logic to misrepresent it on a third-
          party site.
        </li>
        <li>Submit false information through any form on the site.</li>
      </ul>

      <h2>7. Liability</h2>
      <p>
        Payn is provided &ldquo;as is&rdquo;. To the extent permitted by law,
        the operator is not liable for losses arising from decisions made on
        the basis of information shown on payn.online.
      </p>

      <h2>8. Changes to these terms</h2>
      <p>
        These terms can change. Material changes are posted with a new
        &ldquo;last updated&rdquo; date at the top of this page; continuing to
        use the site after that date means you accept the revised terms.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of the operator&apos;s country of
        residence and disputes are subject to the exclusive jurisdiction of
        local courts there.
      </p>
    </>
  );
}
