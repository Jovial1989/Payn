import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { ProviderLogo } from "@/components/provider-logo";
import { getDictionary } from "@/lib/i18n";
import { normalizeDisplayText } from "@/lib/marketplace";

export type HeroMarketOffer = {
  offer: MarketplaceOffer;
  rank: number;
  provider: string;
  tag: string;
  metric: string;
  badgeTone: "bestValue" | "flexible" | "noFees";
};

function badgeClass(tone: HeroMarketOffer["badgeTone"]) {
  if (tone === "flexible") {
    return "bg-[#FFF1F7] text-[#9F1D53]";
  }

  if (tone === "noFees") {
    return "bg-[#EEF4FF] text-[#2059D1]";
  }

  return "bg-accent-green text-accent-green-text";
}

export function HeroMarketPanel({
  locale,
  marketLabel,
  offers,
}: {
  locale: MarketplaceLocale;
  marketLabel: string;
  offers: HeroMarketOffer[];
}) {
  const dictionary = getDictionary(locale);

  return (
    <div className="rounded-[28px] border border-line bg-[#F5F6F7] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
            {marketLabel}
          </p>
          <h2 className="mt-2 text-[1.35rem] font-bold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[1.55rem]">
            {dictionary.home.heroPanelTitle}
          </h2>
        </div>
        <span className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-[10px] font-semibold text-ink-tertiary">
          {dictionary.offerCard.updated}
        </span>
      </div>

      <div className="mt-4 rounded-[22px] border border-black/5 bg-white">
        {offers.map((item, index) => (
          <div
            key={item.offer.id}
            className="grid min-h-[92px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-5"
            style={index > 0 ? { borderTop: "1px solid rgba(15, 23, 42, 0.06)" } : undefined}
          >
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold tabular-nums text-ink-tertiary">
                #{item.rank}
              </span>
              <ProviderLogo
                providerName={item.provider}
                websiteUrl={item.offer.providerWebsiteUrl}
                size="sm"
                muted={false}
              />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{item.provider}</p>
              <p className="mt-1 truncate text-[14px] font-medium text-ink-secondary">
                {normalizeDisplayText(item.offer.title)}
              </p>
            </div>

            <div className="min-w-[96px] text-right">
              <p className="text-base font-bold tracking-[-0.02em] text-ink">{item.metric}</p>
              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${badgeClass(item.badgeTone)}`}
              >
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
