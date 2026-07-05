import type { Metadata } from "next";

// BUG-015 — Dedicated Affiliate Disclosure page. The footer already
// carries a one-liner ("Payn may earn commission from some partners
// but compensation does not determine order"); this page gives the
// long-form transparency a financial marketplace owes its users.

export const metadata: Metadata = {
  title: "Affiliate Disclosure — Payn",
  description:
    "How Payn makes money: which links pay us, how we keep ranking independent, and why we publish offers that don't.",
};

export default function AffiliateDisclosurePage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        Legal
      </p>
      <h1>Affiliate Disclosure</h1>
      <p className="!text-ink-tertiary">Last updated: 25 May 2026</p>

      <h2>The short version</h2>
      <p>
        Some links on payn.online are <strong>affiliate links</strong>. If you
        open an account with a provider through one of those links, the
        provider pays Payn a referral commission. This compensation does{" "}
        <strong>not</strong> change the order in which offers appear, and it
        does <strong>not</strong> change the headline rates, fees, or APRs we
        publish.
      </p>

      <h2>How we keep ranking honest</h2>
      <ul>
        <li>
          Ranking is computed from objective product attributes (APR, fees, FX
          spread, speed, coverage). The algorithm runs the same query for
          monetised and non-monetised offers.
        </li>
        <li>
          Every monetised offer carries an <code>isPartner</code> flag in our
          catalogue; auditors can request a diff between &ldquo;monetised
          order&rdquo; and &ldquo;raw rank order&rdquo; — they&apos;re the
          same.
        </li>
        <li>
          We publish non-monetised offers too (Wise, Klarna, Revolut Standard,
          IBKR, etc.) when they win on the numbers, even though we earn nothing
          if you click them.
        </li>
      </ul>

      <h2>Which providers currently pay Payn</h2>
      <p>
        At time of writing, the following partners pay a referral commission
        via Financeads:
      </p>
      <ul>
        <li>ActivTrades</li>
        <li>Airwallex</li>
        <li>Coinhouse</li>
        <li>Currensea (issuer for the Hilton Honors Debit Card)</li>
        <li>Deblock</li>
        <li>Enky Invest</li>
        <li>GoHenry</li>
        <li>Krak Card (by Lunar)</li>
        <li>SumUp</li>
        <li>Wallester</li>
        <li>Waltio</li>
        <li>Wirex</li>
        <li>YouHodler</li>
      </ul>
      <p>
        Each of their listings carries a small &ldquo;partner&rdquo; badge so
        you can identify them at a glance. The list above is the canonical one;
        if you find a missing or stale entry, email{" "}
        <a href="mailto:hello@payn.online">hello@payn.online</a>.
      </p>

      <h2>What we never do</h2>
      <ul>
        <li>Accept payment to move an offer up in the ranking.</li>
        <li>Hide a non-paying provider from the catalogue.</li>
        <li>Inflate counts or fabricate ratings.</li>
      </ul>
    </>
  );
}
