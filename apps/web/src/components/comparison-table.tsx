"use client";

import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { ProviderLogo } from "@/components/provider-logo";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { getDictionary, getMetricLabel } from "@/lib/i18n";
import { normalizeDisplayText, getOfferTradeoff } from "@/lib/marketplace";

export function ComparisonTable({
  offers,
  locale = "en",
  onRemove,
  onClose,
}: {
  offers: MarketplaceOffer[];
  locale?: MarketplaceLocale;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const dictionary = getDictionary(locale);

  const allMetricLabels = Array.from(
    new Set(offers.flatMap((offer) => offer.metrics.map((m) => m.label))),
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-auto rounded-3xl bg-white p-6 shadow-elevated sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              Side-by-side
            </p>
            <h2 className="mt-1 text-h3 text-ink">Compare offers</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="w-[140px] p-3 text-left text-xs font-semibold text-ink-tertiary" />
                {offers.map((offer) => (
                  <th key={offer.id} className="p-3 text-left">
                    <div className="flex items-center gap-3">
                      <ProviderLogo
                        providerName={offer.providerName}
                        websiteUrl={offer.providerWebsiteUrl}
                        size="sm"
                        muted={false}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink">{offer.providerName}</p>
                        <p className="text-xs text-ink-secondary line-clamp-1">
                          {normalizeDisplayText(offer.title)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemove(offer.id)}
                        className="ml-auto shrink-0 rounded-full p-1 text-ink-tertiary hover:bg-bg-surface hover:text-ink"
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M4 4l8 8M12 4l-8 8" />
                        </svg>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allMetricLabels.map((label) => (
                <tr key={label} className="border-t border-line">
                  <td className="p-3 text-xs font-semibold text-ink-secondary">
                    {normalizeDisplayText(getMetricLabel(locale, label))}
                  </td>
                  {offers.map((offer) => {
                    const metric = offer.metrics.find((m) => m.label === label);
                    return (
                      <td key={offer.id} className="p-3 text-sm font-semibold text-ink">
                        {metric ? normalizeDisplayText(metric.value) : "-"}
                      </td>
                    );
                  })}
                </tr>
              ))}

              <tr className="border-t border-line">
                <td className="p-3 text-xs font-semibold text-ink-secondary">Best for</td>
                {offers.map((offer) => (
                  <td key={offer.id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {offer.bestFor.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-bg-surface px-2 py-0.5 text-xs font-medium text-ink-secondary"
                        >
                          {normalizeDisplayText(item)}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="border-t border-line">
                <td className="p-3 text-xs font-semibold text-ink-secondary">Tradeoff</td>
                {offers.map((offer) => (
                  <td key={offer.id} className="p-3 text-xs leading-relaxed text-ink-secondary">
                    {getOfferTradeoff(offer)}
                  </td>
                ))}
              </tr>

              <tr className="border-t border-line">
                <td className="p-3" />
                {offers.map((offer) => (
                  <td key={offer.id} className="p-3">
                    <ProviderLinkButton
                      offer={offer}
                      label={dictionary.offerCard.providerSite}
                      variant="primary"
                      size="sm"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ComparisonTray({
  count,
  onOpen,
  onClear,
}: {
  count: number;
  onOpen: () => void;
  onClear: () => void;
}) {
  if (count < 2) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-line bg-black px-5 py-3 shadow-elevated">
        <span className="text-sm font-semibold text-white">
          {count} offers selected
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-gray-100"
        >
          Compare
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-white/60 transition-colors hover:text-white"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
