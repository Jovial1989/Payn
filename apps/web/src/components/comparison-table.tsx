"use client";

import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { ProviderLogo } from "@/components/provider-logo";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { getDictionary, getMetricLabel, translateTradeoff, translateUiToken } from "@/lib/i18n";
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
  const copy =
    locale === "de"
      ? {
          eyebrow: "Direktvergleich",
          title: "Angebote vergleichen",
          bestFor: "Am besten für",
          tradeoff: "Abwägung",
          clear: "Leeren",
        }
      : {
          eyebrow: "Side-by-side",
          title: "Compare offers",
          bestFor: "Best for",
          tradeoff: "Tradeoff",
          clear: "Clear",
        };

  const allMetricLabels = Array.from(
    new Set(offers.flatMap((offer) => offer.metrics.map((m) => m.label))),
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-h-[85vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-4 shadow-elevated sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {copy.eyebrow}
            </p>
            <h2 className="mt-1 text-h3 text-ink">{copy.title}</h2>
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

        <div className="grid gap-3 md:hidden">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="rounded-[22px] border border-line bg-[#FCFCFD] px-4 py-4 shadow-[0_8px_22px_rgba(17,24,39,0.04)]"
            >
              <div className="flex items-start gap-3">
                <ProviderLogo
                  providerName={offer.providerName}
                  websiteUrl={offer.providerWebsiteUrl}
                  size="sm"
                  muted={false}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink">{offer.providerName}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">
                    {normalizeDisplayText(offer.title)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(offer.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {allMetricLabels.map((label) => {
                  const metric = offer.metrics.find((m) => m.label === label);
                  return (
                    <div key={`${offer.id}-${label}`}>
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                        {normalizeDisplayText(getMetricLabel(locale, label))}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-ink">
                        {metric ? normalizeDisplayText(metric.value) : "-"}
                      </dd>
                    </div>
                  );
                })}
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                    {copy.bestFor}
                  </dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {offer.bestFor.slice(0, 3).map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-bg-surface px-2 py-0.5 text-xs font-medium text-ink-secondary"
                      >
                        {normalizeDisplayText(translateUiToken(locale, item))}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                    {copy.tradeoff}
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-ink-secondary">
                    {translateTradeoff(locale, getOfferTradeoff(offer))}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <ProviderLinkButton
                  offer={offer}
                  label={dictionary.offerCard.providerSite}
                  fullWidth
                />
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
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
                <td className="p-3 text-xs font-semibold text-ink-secondary">{copy.bestFor}</td>
                {offers.map((offer) => (
                  <td key={offer.id} className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {offer.bestFor.slice(0, 3).map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-bg-surface px-2 py-0.5 text-xs font-medium text-ink-secondary"
                        >
                          {normalizeDisplayText(translateUiToken(locale, item))}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr className="border-t border-line">
                <td className="p-3 text-xs font-semibold text-ink-secondary">{copy.tradeoff}</td>
                {offers.map((offer) => (
                  <td key={offer.id} className="p-3 text-xs leading-relaxed text-ink-secondary">
                    {translateTradeoff(locale, getOfferTradeoff(offer))}
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
  locale = "en",
  onOpen,
  onClear,
}: {
  count: number;
  locale?: MarketplaceLocale;
  onOpen: () => void;
  onClear: () => void;
}) {
  if (count < 2) return null;
  const copy = locale === "de" ? { clear: "Leeren" } : { clear: "Clear" };

  return (
    <div className="fixed inset-x-4 bottom-20 z-[80] md:inset-x-auto md:bottom-6 md:left-1/2 md:-translate-x-1/2">
      <div className="flex w-full flex-wrap items-center justify-center gap-2 rounded-[24px] border border-line bg-white px-4 py-3 shadow-elevated md:w-auto md:rounded-full md:px-5">
        <span className="text-sm font-semibold text-ink">
          {locale === "de" ? `${count} Angebote ausgewählt` : `${count} offers selected`}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="rounded-full bg-accent-emerald px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong"
        >
          {translateUiToken(locale, "Compare")}
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-full px-3 py-2 text-sm font-medium text-ink-tertiary transition-colors hover:text-ink"
        >
          {copy.clear}
        </button>
      </div>
    </div>
  );
}
