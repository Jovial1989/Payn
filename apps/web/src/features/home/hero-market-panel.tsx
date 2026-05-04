import type { MarketplaceCategory, MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderLogo } from "@/components/provider-logo";
import { getDictionary } from "@/lib/i18n";
import { localePath } from "@/lib/locale";
import { getOfferHref, normalizeDisplayText } from "@/lib/marketplace";

export type HeroMarketOffer = {
  offer: MarketplaceOffer;
  rank: number;
  provider: string;
  tag: string;
  metric: string;
  badgeTone: "bestValue" | "flexible" | "noFees";
};

const categoryRoutes: Record<MarketplaceCategory, string> = {
  loans: "/loans",
  cards: "/cards",
  transfers: "/transfers",
  exchange: "/exchange",
  insurance: "/insurance",
  investments: "/investments",
};

function badgeClass(tone: HeroMarketOffer["badgeTone"]) {
  if (tone === "flexible") return "bg-[#FFF1F7] text-[#9F1D53]";
  if (tone === "noFees") return "bg-[#EEF4FF] text-[#2059D1]";
  return "bg-[#EDFBF1] text-[#1A7340]";
}

function IntentChipIcon({ category }: { category: MarketplaceCategory }) {
  const base = "shrink-0 transition-colors";

  if (category === "loans") {
    return (
      <svg className={base} width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="14" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M1 7h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M5 10.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === "cards") {
    return (
      <svg className={base} width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="3.5" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M1 6.5h14" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 10h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === "transfers") {
    return (
      <svg className={base} width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M11 2l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M5 14l-3-3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 11H2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === "exchange") {
    return (
      <svg className={base} width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5.5 8h5M8 5.5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (category === "insurance") {
    return (
      <svg className={base} width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5L2 4v4c0 3.5 2.5 6 6 7 3.5-1 6-3.5 6-7V4L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  // investments
  return (
    <svg className={base} width="14" height="14" viewBox="0 0 16 16" fill="none">
      <polyline points="1 10 4.5 6.5 7 9 11 4 15 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 4h3v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeroMarketPanel({
  locale,
  marketLabel,
  offers,
  discoverHref,
}: {
  locale: MarketplaceLocale;
  marketLabel: string;
  offers: HeroMarketOffer[];
  discoverHref: string;
}) {
  const dictionary = getDictionary(locale);
  const categories: MarketplaceCategory[] = [
    "loans",
    "cards",
    "transfers",
    "exchange",
    "insurance",
    "investments",
  ];

  return (
    <div className="rounded-[28px] border border-line bg-[#F5F6F7] p-4 sm:p-5">
      {/* ── Panel header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            {marketLabel}
          </p>
          <h2 className="mt-1.5 text-[1.2rem] font-bold leading-tight tracking-[-0.03em] text-ink sm:text-[1.35rem]">
            {dictionary.home.heroPanelTitle}
          </h2>
        </div>
        <span className="shrink-0 rounded-full border border-black/5 bg-white px-3 py-1.5 text-[10px] font-semibold text-ink-tertiary">
          {dictionary.offerCard.updated}
        </span>
      </div>

      {/* ── Discovery launcher ── replaces the fake search input ── */}
      <div className="mt-4 rounded-[22px] border border-black/5 bg-white p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          What are you trying to do?
        </p>

        {/* 2×3 intent chip grid — each chip is a real navigation target */}
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={localePath(locale, categoryRoutes[cat])}
              className="group flex items-center gap-2 rounded-[12px] border border-[#E8E8EA] bg-[#F7F7F9] px-3 py-2.5 text-ink transition-all duration-150 hover:border-accent-emerald/25 hover:bg-accent-emerald-soft hover:text-accent-emerald-strong"
            >
              <IntentChipIcon category={cat} />
              <span className="truncate text-[12px] font-semibold leading-none">
                {dictionary.categories[cat]}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href={discoverHref}
          className={`${buttonStyles({ variant: "primary", size: "md", fullWidth: true })} mt-3`}
        >
          Start comparing
        </Link>
      </div>

      {/* ── Top picks ── offer rows, now interactive ── */}
      {offers.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            Top picks
          </p>
          <div className="overflow-hidden rounded-[22px] border border-black/5 bg-white">
            {offers.map((item, index) => (
              <Link
                key={item.offer.id}
                href={localePath(locale, getOfferHref(item.offer))}
                className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[#F8F8F9] sm:px-5"
                style={index > 0 ? { borderTop: "1px solid rgba(15, 23, 42, 0.06)" } : undefined}
              >
                {/* Rank */}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F2F2F4] text-[11px] font-bold tabular-nums text-ink-tertiary">
                  {item.rank}
                </span>

                {/* Logo */}
                <ProviderLogo
                  providerName={item.provider}
                  websiteUrl={item.offer.providerWebsiteUrl}
                  size="sm"
                  muted={false}
                />

                {/* Name block */}
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold leading-none text-ink">
                    {item.provider}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-ink-tertiary">
                    {normalizeDisplayText(item.offer.title)}
                  </p>
                </div>

                {/* Metric + tag */}
                <div className="shrink-0 text-right">
                  <p className="text-[14px] font-bold tabular-nums tracking-[-0.02em] text-ink">
                    {item.metric}
                  </p>
                  <span
                    className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass(item.badgeTone)}`}
                  >
                    {item.tag}
                  </span>
                </div>

                {/* Chevron affordance */}
                <svg
                  className="shrink-0 text-ink-tertiary opacity-0 transition-opacity group-hover:opacity-100"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M5 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
