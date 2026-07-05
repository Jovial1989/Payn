import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How we pick who's #1 — Payn",
  description:
    "The simple version: we filter, do the math, double-check, and sort by what you'll actually pay.",
};

// UX.5 — Plain-language rewrite of the existing /how-we-rank page.
// The existing page is fine but uses the word "multifactor scoring"
// twice. This rewrite drops the jargon and trades on transparency
// over precision.

export default function HowWePickPage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
        How we pick
      </p>
      <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.025em] text-ink sm:text-[2.5rem]">
        How we decide who&apos;s #1.
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-ink-secondary">
        Same job for every category, every day. No marketing budget changes a
        rank. Here&apos;s the whole process in four steps.
      </p>

      <ol className="mt-8 grid gap-6">
        <li className="rounded-2xl border border-line bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-emerald-strong">
            Step 1
          </p>
          <h2 className="mt-2 text-[1.25rem] font-bold text-ink">
            Filter by where you live
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
            Most products only work in certain countries. We drop everything
            you can&apos;t actually use. If you&apos;re in Spain, we hide UK-only
            offers from the list — even if they&apos;d score better.
          </p>
        </li>

        <li className="rounded-2xl border border-line bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-emerald-strong">
            Step 2
          </p>
          <h2 className="mt-2 text-[1.25rem] font-bold text-ink">
            Do the math on the actual cost
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
            For each offer we compute what it&apos;d cost <em>you</em> based on
            your situation: how much you&apos;d borrow / send / save, over how
            long, with which currency. We include the fees the provider tries
            to hide in the small print — the exchange-rate spread, the
            cross-border markup, the annual card fee.
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
            Two offers at the same headline rate (say, &quot;3.9% APR&quot;)
            often have €100-€300 of different total cost once the fees are in.
            Ranking by headline rate alone would be lying.
          </p>
        </li>

        <li className="rounded-2xl border border-line bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-emerald-strong">
            Step 3
          </p>
          <h2 className="mt-2 text-[1.25rem] font-bold text-ink">
            Double-check against the provider&apos;s own site
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
            Each offer carries a &quot;last checked&quot; date. When something
            changes — a rate drops, a fee gets added, a country gets dropped —
            we update the entry and that date moves. If you spot a stale
            number, email{" "}
            <a
              href="mailto:hello@payn.online"
              className="font-semibold text-accent-emerald-strong"
            >
              hello@payn.online
            </a>
            .
          </p>
        </li>

        <li className="rounded-2xl border border-line bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-emerald-strong">
            Step 4
          </p>
          <h2 className="mt-2 text-[1.25rem] font-bold text-ink">
            Sort from cheapest to most expensive
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-secondary">
            That&apos;s the rank. No bidding, no preferred-partner boost. If a
            provider that pays Payn a commission shows up at #1, it&apos;s
            because the numbers put them there. If a provider that doesn&apos;t
            pay us a cent shows up at #1, same answer: the numbers put them
            there.
          </p>
        </li>
      </ol>

      <h2 className="mt-10 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">
        What we don&apos;t consider
      </h2>
      <ul className="mt-3 grid gap-2 pl-4 text-[14px] text-ink-secondary">
        <li className="list-disc">
          App-store ratings — they&apos;re gamed; we score the product, not the
          marketing.
        </li>
        <li className="list-disc">
          Brand prestige — a 200-year-old bank with bad fees beats a 5-year-old
          fintech with good fees on most rankings here.
        </li>
        <li className="list-disc">
          Customer-support response time — important but separate; we publish
          a service-quality note on each card&apos;s detail page.
        </li>
      </ul>

      <p className="mt-8 text-[13px] text-ink-tertiary">
        Read also: <Link href="/help/how-we-earn" className="underline">how we earn</Link>.
      </p>
    </>
  );
}
