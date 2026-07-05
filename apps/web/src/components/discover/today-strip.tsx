"use client";

import type { MarketplaceCategory } from "@payn/types";
import Link from "next/link";

type GoalId = "transfers" | "loans" | "cards" | "exchange" | "insurance" | "investments";

// BUG-043 — Inline SVG icons (Feather/Lucide-derived geometry).
// Inline rather than `lucide-react` because the package isn't a
// project dependency and pulling in 4 MB of tree-shaken icons for
// six glyphs isn't worth it. Each icon is a 24×24 viewport with the
// same stroke weight (1.8) so the row reads as a single family.
type IconComponent = (props: { className?: string }) => React.JSX.Element;

const TransfersIcon: IconComponent = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 9h13l-3-3M21 15H8l3 3" />
  </svg>
);

const SavingsIcon: IconComponent = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 21h18M5 21V10M19 21V10M9 21V13M15 21V13M2 10l10-6 10 6" />
  </svg>
);

const TravelIcon: IconComponent = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

const CryptoIcon: IconComponent = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M11.5 11.5h2.75a2.5 2.5 0 0 0 0-5H8v10h6.5a2.5 2.5 0 0 0 0-5H8" />
    <path d="M10 4.5v2M10 16.5v2M13 4.5v2M13 16.5v2" />
  </svg>
);

const CardIcon: IconComponent = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M6 15h4" />
  </svg>
);

const ShoppingIcon: IconComponent = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.5 12h13l2.5-9H6" />
  </svg>
);

type StripItem = {
  id: string;
  Icon: IconComponent;
  category: MarketplaceCategory;
  description: string;
  headline: string;
  offerCount: number;
  href: string;
};

// CAT.6 — Pre-audit this list claimed 8 loan offers (catalog had 1
// BNPL), 6 savings offers (catalog had 2), 15 travel cards (catalog
// had 3), 9 cashback cards (catalog had 2), and "up to 1.25%
// cashback" which no offer in the catalog actually pays. Each card
// now reflects what's genuinely live in the catalogue. Counts kept
// honest and conservative — easier to grow them than to defend
// numbers a user can disprove in one click.
const STRIP_ITEMS: StripItem[] = [
  {
    id: "transfer-eur-gbp",
    Icon: TransfersIcon,
    category: "transfers",
    description: "Send €500 EUR → GBP",
    headline: "from 0.41% fee (Wise)",
    offerCount: 12,
    href: "/transfers",
  },
  {
    id: "savings-eur",
    Icon: SavingsIcon,
    category: "savings",
    description: "Cash interest · EU/UK",
    headline: "up to 3.64% (Revolut Metal GBP)",
    offerCount: 2,
    href: "/savings",
  },
  {
    id: "travel-card",
    Icon: TravelIcon,
    category: "travel",
    description: "Travel card · EU",
    headline: "0% FX up to limits (Revolut/Wise/Curve)",
    offerCount: 3,
    href: "/travel",
  },
  {
    id: "crypto-eu",
    Icon: CryptoIcon,
    category: "crypto",
    description: "Crypto exchange · EU",
    headline: "from 0.10% fee (Binance)",
    offerCount: 8,
    href: "/crypto",
  },
  {
    id: "card-uk",
    Icon: CardIcon,
    category: "cards",
    description: "Cashback card · UK",
    headline: "up to 1% back (Curve Pro+ / Revolut Ultra)",
    offerCount: 2,
    href: "/cards",
  },
  {
    id: "bnpl-eu",
    Icon: ShoppingIcon,
    category: "bnpl",
    description: "Buy now, pay later · EU",
    headline: "3 × 0% (Klarna / PayPal Pay in 3)",
    offerCount: 4,
    href: "/bnpl",
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
              {/* BUG-043 — Stroke-based Lucide icon (1.8px) in the
                  emerald tile renders identically across all OSes,
                  scales crisply at 1×/2×/3× DPR, and inherits the
                  brand colour. No more iOS-vs-Android emoji parity
                  surprises in the conversion strip. */}
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-emerald-soft/60 text-accent-emerald-strong">
                <item.Icon />
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
