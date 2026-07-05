import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";

export const metadata: Metadata = {
  title: "Your starter pack — Payn",
  description: "The cheapest tool for each of the things you said you want to do.",
};

// UX.2 — /start/pack — landing page for users who ticked more than
// one goal in the /start quiz. We read the comma-separated goal slugs
// from the `?goals=` query and stack the matching situation cards so
// the visitor sees their personalised "starter pack" in one screen.
// Each card links into the canonical flat /<category>?context=...
// route (PASS A retired the /explore/<bucket> vocabulary).

interface PackEntry {
  slug: string;
  title: string;
  blurb: string;
  // Where the card click takes the user. Canonical bucket URL with
  // a `?context=` query so the destination renders the situational
  // banner + quick-check calculator. Mirror of GOAL_HREFS in
  // features/start/start-flow.tsx — keep in sync.
  href: string;
  // The headline pick we want to surface for this goal. Plain text —
  // no live API call needed; tweak as catalogue evolves.
  topPick: string;
}

const PACK: Record<string, PackEntry> = {
  travel: {
    slug: "travel",
    title: "Travelling soon",
    blurb: "Pay anywhere without 2-3% extra fees on top of your bill.",
    href: "/cards?type=travel&context=travel",
    topPick: "Revolut Standard (free card, 0% FX up to €1,000/week)",
  },
  "send-money": {
    slug: "send-money",
    title: "Sending money abroad",
    blurb: "Find the route that loses the least to fees on each transfer.",
    href: "/transfers?context=send-abroad",
    topPick: "Wise (around 0.41% fee, no hidden FX markup)",
  },
  "grow-money": {
    slug: "grow-money",
    title: "Growing your savings",
    blurb: "Move idle euros somewhere that actually pays you 3-4% a year.",
    href: "/savings?context=grow-savings",
    topPick: "Trade Republic (4.00% on cash, no lock-in)",
  },
  "switch-bank": {
    slug: "switch-bank",
    title: "A better account",
    blurb: "App-based accounts with no monthly fee — same deposit protection.",
    href: "/banking?type=app-only&context=switch",
    topPick: "N26 / Revolut Standard (€0/mo, EU deposit guarantee)",
  },
  "big-purchase": {
    slug: "big-purchase",
    title: "Loan for a big purchase",
    blurb: "Compare loans — see the total cost upfront before you sign.",
    href: "/loans?type=personal&context=big-purchase",
    topPick: "Smava / Younited (from 3.9% APR for strong credit profiles)",
  },
  "get-protected": {
    slug: "get-protected",
    title: "Insurance",
    blurb: "Travel, health, car — side by side, with real coverage limits.",
    href: "/insurance?context=worth-the-money",
    topPick: "World Nomads / AXA Travel (€22-41 per trip)",
  },
  "run-business": {
    slug: "run-business",
    title: "Running a small business",
    blurb: "Lower fees on cards, payroll, and currency conversion.",
    href: "/business?context=self-employed",
    topPick: "Wise Business (no monthly fee, FX from 0.35%)",
  },
  family: {
    slug: "family",
    title: "Family money tools",
    blurb: "Pocket-money apps for kids, joint accounts, and family plans.",
    href: "/kids?context=family",
    topPick: "Revolut <18 (free with parent plan, ages 6-17)",
  },
};

export default async function StarterPackPage({
  searchParams,
}: {
  searchParams: Promise<{ goals?: string }>;
}) {
  const { goals } = await searchParams;
  const slugs = (goals ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const entries = slugs
    .map((slug) => PACK[slug])
    .filter((entry): entry is PackEntry => Boolean(entry));

  return (
    <SiteShell hideHero>
      <section className="mx-auto w-full max-w-[760px]">
        <div className="rounded-[24px] border border-line bg-white p-6 shadow-card sm:rounded-[32px] sm:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-emerald-strong">
            Your starter pack
          </p>
          <h1 className="mt-3 text-[1.75rem] font-bold tracking-[-0.025em] text-ink sm:text-[2rem]">
            Here&apos;s what we picked for you.
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
            One screen, one pick per thing. Tap any card for the full breakdown
            and a side-by-side comparison.
          </p>

          {entries.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-line bg-bg-surface p-6 text-center">
              <p className="text-sm text-ink-secondary">
                Nothing selected — head back and tick the things you want help
                with.
              </p>
              <Link
                href="/start"
                className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-accent-emerald px-4 text-sm font-semibold text-white"
              >
                Back to picker
              </Link>
            </div>
          ) : (
            <ul className="mt-6 grid gap-3">
              {entries.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={entry.href}
                    className="group flex flex-col gap-2 rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-px hover:border-accent-emerald/40 hover:shadow-card sm:flex-row sm:items-center sm:gap-5"
                  >
                    <div className="flex-1">
                      <p className="text-[15px] font-bold text-ink">
                        {entry.title}
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-ink-secondary">
                        {entry.blurb}
                      </p>
                      <p className="mt-2 text-[12px] font-semibold text-accent-emerald-strong">
                        Top pick: {entry.topPick}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-full bg-accent-emerald-soft text-accent-emerald-strong transition-transform group-hover:translate-x-0.5 sm:self-center"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-6 text-center text-[12px] text-ink-tertiary">
            None of this is financial advice — see our{" "}
            <Link
              href="/legal/terms"
              className="font-semibold text-accent-emerald-strong"
            >
              Terms
            </Link>{" "}
            for the boring details.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
