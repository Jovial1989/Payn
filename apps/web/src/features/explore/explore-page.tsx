import type { MarketplaceCategory, MarketplaceLocale, MarketplaceMarket, MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { buttonStyles } from "@/components/button";
import { ProviderStrip } from "@/components/provider-strip";
import { localePath } from "@/lib/locale";
import { getUiCopy } from "@/lib/ui-copy";
import { categoryGroups, categoryMeta } from "@/lib/marketplace";

const featuredProviders = [
  "Revolut", "Wise", "N26", "Trade Republic", "Klarna",
  "Trading 212", "Starling Bank", "bunq", "Pleo", "Deel",
  "Kraken", "GoHenry", "Raisin", "DEGIRO", "Monzo",
];

function getCategoryOfferCount(
  category: MarketplaceCategory,
  offers: MarketplaceOffer[],
): number {
  return offers.filter((o) => o.category === category).length;
}

function CategoryCard({
  category,
  offerCount,
  market,
  locale,
}: {
  category: MarketplaceCategory;
  offerCount: number;
  market: MarketplaceMarket;
  locale: MarketplaceLocale;
}) {
  const meta = categoryMeta[category];
  const href = localePath(locale, `/${market}/${category}`);

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-[20px] border border-line bg-white p-4 shadow-card transition-all hover:border-accent-emerald/30 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-bg-surface text-xl">
          {meta.icon}
        </div>
        {offerCount > 0 && (
          <span className="rounded-full bg-accent-emerald-soft px-2 py-0.5 text-[10px] font-semibold text-accent-emerald-strong">
            {offerCount}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-ink transition-colors group-hover:text-accent-emerald">
          {meta.label}
        </p>
      </div>
    </Link>
  );
}

export function ExplorePageContent({
  offers,
  locale,
  market,
}: {
  offers: MarketplaceOffer[];
  locale: MarketplaceLocale;
  market: MarketplaceMarket;
}) {
  const copy = getUiCopy(locale);
  const totalOffers = offers.length;
  const totalProviders = new Set(offers.map((o) => o.providerName)).size;

  return (
    <div className="grid gap-12">

      {/* ── Hero stats bar ── */}
      <div className="flex flex-wrap items-center gap-6 rounded-[24px] border border-line bg-white px-6 py-5 shadow-card">
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold tabular-nums text-ink">{totalOffers}+</span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Financial offers</span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold tabular-nums text-ink">{totalProviders}+</span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Providers</span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold tabular-nums text-ink">{categoryGroups.reduce((n, g) => n + g.categories.length, 0)}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">Categories</span>
        </div>
        <div className="h-8 w-px bg-line" />
        <div className="flex flex-col gap-0.5">
          <span className="text-2xl font-bold text-ink">9</span>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">EU markets</span>
        </div>
        <div className="ml-auto hidden sm:block">
          <span className="rounded-full bg-accent-emerald-soft px-3 py-1 text-xs font-semibold text-accent-emerald-strong">
            Updated daily
          </span>
        </div>
      </div>

      {/* ── Category groups ── */}
      <section>
        <div className="mb-3 flex items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            Browse by category
          </p>
          <div className="h-px flex-1 bg-line" />
        </div>

        <div className="grid gap-8">
          {categoryGroups.map((group) => (
            <div key={group.label}>
              <h2 className="mb-3 text-sm font-bold text-ink">{group.label}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {group.categories.map((cat) => (
                  <CategoryCard
                    key={cat}
                    category={cat}
                    offerCount={getCategoryOfferCount(cat, offers)}
                    market={market}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured providers ── */}
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
              {copy.explorePromo.providerCoverageEyebrow}
            </p>
            <h2 className="mt-3 text-h2 text-ink">{copy.explorePromo.providerCoverageTitle}</h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
            {copy.explorePromo.providerCoverageDescription}
          </p>
        </div>
        <div className="mt-6">
          <ProviderStrip providers={featuredProviders} />
        </div>
      </section>

      {/* ── Trending sections ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Best for travel",
            description: "Cards and accounts with zero FX fees and global acceptance.",
            href: localePath(locale, `/${market}/travel`),
            icon: "✈️",
          },
          {
            title: "Highest savings rates",
            description: "Earn up to 4.5% on your cash with European deposit protection.",
            href: localePath(locale, `/${market}/savings`),
            icon: "🏛️",
          },
          {
            title: "Zero-commission trading",
            description: "Buy stocks and ETFs with no trading fees.",
            href: localePath(locale, `/${market}/trading`),
            icon: "📊",
          },
          {
            title: "Top neobanks",
            description: "Digital-first accounts with instant setup and multi-currency support.",
            href: localePath(locale, `/${market}/neobanks`),
            icon: "📱",
          },
          {
            title: "Best crypto exchanges",
            description: "Regulated platforms with low fees and strong security.",
            href: localePath(locale, `/${market}/crypto`),
            icon: "₿",
          },
          {
            title: "Business banking",
            description: "Multi-currency accounts, invoicing, and team expense tools.",
            href: localePath(locale, `/${market}/business`),
            icon: "🏢",
          },
        ].map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group flex gap-4 rounded-[20px] border border-line bg-white p-5 shadow-card transition-all hover:border-accent-emerald/30 hover:shadow-card-hover"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-bg-surface text-xl">
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink transition-colors group-hover:text-accent-emerald">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Mobile app CTA ── */}
      <section className="rounded-[32px] border border-line bg-white p-6 text-ink shadow-card sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="rounded-[28px] border border-line bg-bg-surface p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {copy.explorePromo.mobileEyebrow}
            </p>
            <h2 className="mt-3 text-h2 text-ink">{copy.explorePromo.mobileTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {copy.explorePromo.mobileDescription}
            </p>
          </div>
          <div>
            <div className="grid gap-3">
              {copy.explorePromo.mobileBullets.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-subtle"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-emerald-soft">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      className="text-accent-emerald"
                    >
                      <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-secondary">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={localePath(locale, "/waitlist")}
                className={buttonStyles({ variant: "secondary", size: "lg" })}
              >
                {copy.explorePromo.mobileCta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
