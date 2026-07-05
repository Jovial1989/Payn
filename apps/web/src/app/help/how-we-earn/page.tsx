import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How we make money — Payn",
  description:
    "Some banks pay us a fee when you sign up through us. They don't pay for ranking — they pay for the click. We tell you which is which.",
};

// UX.5 — Plain-language rewrite of /how-we-make-money. Explicit
// partner / non-partner lists for max trust signal.

const PARTNERS = [
  "ActivTrades",
  "Airwallex",
  "Coinhouse",
  "Currensea (the issuer behind Hilton Honors Debit Card)",
  "Deblock",
  "Enky Invest",
  "GoHenry",
  "Krak Card (by Lunar)",
  "SumUp",
  "Wallester",
  "Waltio",
  "Wirex",
  "YouHodler",
];

const NON_PARTNERS = [
  "Revolut",
  "Wise",
  "N26",
  "Klarna",
  "Trade Republic",
  "Lightyear",
  "Trading 212",
  "XTB",
  "Interactive Brokers",
  "Scalable Capital",
  "bunq",
  "PayPal",
  "Atlantic Money",
  "WorldRemit",
  "Western Union",
  "AXA",
  "Allianz",
  "Bupa Global",
];

export default function HowWeEarnPage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
        How we earn
      </p>
      <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.025em] text-ink sm:text-[2.5rem]">
        How Payn makes money.
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-ink-secondary">
        Some banks pay us a referral fee when you click their link on Payn and
        open an account. That fee is the same regardless of where the offer
        ranks. We don&apos;t accept &quot;pay for placement&quot;.
      </p>

      <h2 className="mt-10 text-[1.25rem] font-bold text-ink">
        Three things we promise
      </h2>
      <ul className="mt-3 grid gap-3 pl-4 text-[14px] text-ink-secondary">
        <li className="list-disc">
          The rank is set by the numbers (see{" "}
          <Link
            href="/help/how-we-pick"
            className="font-semibold text-accent-emerald-strong underline"
          >
            How we pick
          </Link>
          ), not by who pays us.
        </li>
        <li className="list-disc">
          We label monetised offers explicitly — small &quot;partner&quot; tag,
          plus the full list on this page.
        </li>
        <li className="list-disc">
          We publish non-partner offers when they beat the partners on price.
          The catalogue contains more non-partners than partners.
        </li>
      </ul>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-bg-surface p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            Pays us a referral fee
          </p>
          <h3 className="mt-2 text-[1.1rem] font-bold text-ink">Partners</h3>
          <ul className="mt-3 grid gap-1.5 text-[14px] text-ink-secondary">
            {PARTNERS.map((p) => (
              <li key={p}>· {p}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-bg-surface p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            Doesn&apos;t pay us
          </p>
          <h3 className="mt-2 text-[1.1rem] font-bold text-ink">
            Independent listings
          </h3>
          <p className="mt-2 text-[13px] text-ink-secondary">
            Listed here because they win on price in their category. We earn
            €0 if you click these.
          </p>
          <ul className="mt-3 grid gap-1.5 text-[14px] text-ink-secondary">
            {NON_PARTNERS.map((p) => (
              <li key={p}>· {p}</li>
            ))}
          </ul>
        </section>
      </div>

      <h2 className="mt-10 text-[1.25rem] font-bold text-ink">
        What this looks like in practice
      </h2>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-secondary">
        On the loans page, Wise doesn&apos;t pay us — they&apos;re #2 anyway
        because their rate beats most of the partners. On the cards page,
        Hilton Honors Debit (Currensea, a partner) holds top spot in UK travel
        rewards because the points-per-spend math wins; it&apos;s clearly
        labelled as a partner. We can&apos;t hide the fee structure on either
        of them.
      </p>

      <p className="mt-3 text-[14px] leading-relaxed text-ink-secondary">
        If you ever spot a ranking that looks like it&apos;s rewarding the
        partner over the better-priced alternative, email{" "}
        <a
          href="mailto:hello@payn.online"
          className="font-semibold text-accent-emerald-strong"
        >
          hello@payn.online
        </a>{" "}
        and we&apos;ll either explain the maths or fix the bug.
      </p>
    </>
  );
}
