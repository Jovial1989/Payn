"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";

type GoalId = "transfers" | "loans" | "cards" | "exchange" | "insurance" | "investments";

type StripItem = {
  id: string;
  icon: string;
  category: MarketplaceCategory;
  description: string;
  headline: string;
  offerCount: number;
  href: string;
};

// Curated cache — feels live without requiring real-time analytics
const STRIP_ITEMS: StripItem[] = [
  {
    id: "loan-de",
    icon: "🏧",
    category: "loans",
    description: "€10,000 loan · 36 months · Germany",
    headline: "from 3.9% APR",
    offerCount: 8,
    href: "/loans",
  },
  {
    id: "transfer-eur-gbp",
    icon: "↔️",
    category: "transfers",
    description: "Send €500 EUR → GBP",
    headline: "from 0.41% fee",
    offerCount: 12,
    href: "/transfers",
  },
  {
    id: "savings-nl",
    icon: "🏛️",
    category: "savings",
    description: "Easy-access savings · Netherlands",
    headline: "up to 3.80% p.a.",
    offerCount: 6,
    href: "/savings",
  },
  {
    id: "travel-card",
    icon: "✈️",
    category: "travel",
    description: "Travel card · All Europe",
    headline: "0% FX worldwide",
    offerCount: 15,
    href: "/travel",
  },
  {
    id: "crypto-eu",
    icon: "₿",
    category: "crypto",
    description: "Crypto exchange · EU",
    headline: "from 0.10% fee",
    offerCount: 8,
    href: "/crypto",
  },
  {
    id: "card-uk",
    icon: "💳",
    category: "cards",
    description: "Cashback credit card · UK",
    headline: "up to 1.25% back",
    offerCount: 9,
    href: "/cards",
  },
];

export function TodayStrip({
  getHref,
}: {
  getHref: (category: MarketplaceCategory) => string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          What people are checking today
        </p>
        <div className="h-px flex-1 bg-line" />
      </div>

      {/* Horizontal scroll strip. The right-edge mask + scroll-snap make the
          overflow obvious — without the mask the last card looks cut off and
          users don't realize they can scroll. */}
      <div
        className="-mr-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-4 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)] sm:-mr-6 sm:pr-6 sm:[mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)]"
      >
        {STRIP_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={getHref(item.category)}
            className="group flex w-[200px] shrink-0 snap-start flex-col gap-3 rounded-xl border border-line bg-white p-4 shadow-subtle transition-all hover:-translate-y-px hover:border-accent-emerald/30 hover:shadow-card"
          >
            <div className="flex items-center justify-between">
              {/* Emoji + glyph chars have inconsistent optical baselines
                  (₿ sits low, ✈ sits high). Putting each in a fixed-size
                  square tile with flex centering levels the row — no more
                  icons that look "off" against each other. */}
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-emerald-soft/60 text-[18px] leading-none">
                <span className="translate-y-[-1px]">{item.icon}</span>
              </span>
              <span className="rounded-full bg-accent-emerald-soft px-2 py-0.5 text-[10px] font-semibold text-accent-emerald-strong">
                {item.offerCount} offers
              </span>
            </div>
            <div>
              <p className="text-xs leading-snug text-ink-secondary">{item.description}</p>
              <p className="mt-1 text-sm font-bold text-accent-emerald-strong">
                {item.headline}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
