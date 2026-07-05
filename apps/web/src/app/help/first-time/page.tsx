import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "First time here? Start here — Payn",
  description:
    "A 5-minute read for anyone who's just starting to think about money seriously.",
};

// UX.4 — First-time visitor guide. Intentionally short, plain
// language, no jargon (anything technical links into the glossary).
// Goal: give a complete beginner the vocabulary to navigate the
// rest of the site within 5 minutes.

export default function FirstTimePage() {
  return (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
        First time here?
      </p>
      <h1 className="mt-2 text-[2rem] font-bold tracking-[-0.025em] text-ink sm:text-[2.5rem]">
        Start here. 5 minutes, no jargon.
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-ink-secondary">
        If you&apos;ve never really thought about banks, savings, or money
        apps — and the whole topic feels like a different language — this
        page is for you.
      </p>

      <h2 className="mt-10 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">
        The big idea
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        Banks make money by quietly charging you for things you don&apos;t
        notice — sending money abroad, paying with your card in another
        currency, keeping savings in a regular account that pays 0%
        interest. Most people lose €200-€500 a year this way without
        realising.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        There are apps and online banks that charge nothing for the same
        services, with the same legal protection for your money. Payn
        finds the cheapest one for whatever you&apos;re trying to do, and
        shows you what you&apos;d save.
      </p>

      <h2 className="mt-10 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">
        Four things worth knowing
      </h2>

      <h3 className="mt-6 text-[1.1rem] font-bold text-ink">
        1. Your money is protected up to €100,000 at any EU bank
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
        Every bank in the EU has a deposit guarantee: if the bank fails,
        the government refunds you up to €100,000 per account-holder. That
        applies to your high-street bank, and it applies to apps like N26,
        Revolut, and bunq the exact same way.
      </p>

      <h3 className="mt-6 text-[1.1rem] font-bold text-ink">
        2. &quot;Free&quot; from your bank usually isn&apos;t free
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
        A &quot;free current account&quot; from a big bank often charges:
      </p>
      <ul className="mt-3 grid gap-2 pl-4 text-[14px] text-ink-secondary">
        <li className="list-disc">2-3% when you pay in another currency abroad</li>
        <li className="list-disc">€10-25 per international transfer</li>
        <li className="list-disc">€2-5 per month for paper statements you didn&apos;t ask for</li>
        <li className="list-disc">Up to €25 if you accidentally go €1 overdrawn</li>
      </ul>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        It all adds up to €100-300 a year for a typical person.
      </p>

      <h3 className="mt-6 text-[1.1rem] font-bold text-ink">
        3. Savings accounts can pay you 3-4% a year (and most don&apos;t)
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
        Your high-street bank likely pays 0.1% on the money you keep with
        them. Apps like Trade Republic, Revolut Savings, or Lightyear pay
        3-4% on the same money. On €10,000, that&apos;s the difference
        between €10 and €400 of interest a year.
      </p>

      <h3 className="mt-6 text-[1.1rem] font-bold text-ink">
        4. You can compare without committing
      </h3>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
        For loans, every site on Payn does a &quot;soft check&quot; first —
        that shows you the rate you&apos;d get without leaving a mark on
        your credit record. You can shop around freely.
      </p>

      <h2 className="mt-10 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">
        Words you&apos;ll see, in plain English
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        Whenever you hit a term you don&apos;t recognise, click it — it
        links to the{" "}
        <Link
          href="/help/glossary"
          className="font-semibold text-accent-emerald-strong underline"
        >
          glossary
        </Link>{" "}
        where every word has a one-line explanation.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
        The four you&apos;ll see most often:
      </p>
      <ul className="mt-3 grid gap-2 pl-4 text-[14px] text-ink-secondary">
        <li className="list-disc">
          <strong className="text-ink">APR</strong> — what % a loan really
          costs per year, including fees.
        </li>
        <li className="list-disc">
          <strong className="text-ink">AER</strong> — like APR but for
          savings: what % your money grows in a year.
        </li>
        <li className="list-disc">
          <strong className="text-ink">FX fee</strong> — what your card
          charges when you pay in another currency abroad.
        </li>
        <li className="list-disc">
          <strong className="text-ink">SEPA</strong> — standard European
          money transfer; usually free between EU banks.
        </li>
      </ul>

      <h2 className="mt-10 text-[1.5rem] font-bold tracking-[-0.02em] text-ink">
        Where to go next
      </h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          href="/start"
          className="rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-px hover:border-accent-emerald/40 hover:shadow-card"
        >
          <p className="text-[15px] font-bold text-ink">
            Take the quiz →
          </p>
          <p className="mt-1 text-[13px] text-ink-secondary">
            Tick what applies, get personalised picks. 30 seconds.
          </p>
        </Link>
        <Link
          href="/discover"
          className="rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-px hover:border-accent-emerald/40 hover:shadow-card"
        >
          <p className="text-[15px] font-bold text-ink">
            Browse everything →
          </p>
          <p className="mt-1 text-[13px] text-ink-secondary">
            Full catalogue, all 9 product types. For if you already know
            what you want.
          </p>
        </Link>
      </div>
    </>
  );
}
