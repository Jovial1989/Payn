"use client";

import type { MarketplaceLocale, MarketplaceOffer } from "@payn/types";
import { ProviderLogo } from "@/components/provider-logo";
import { ProviderLinkButton } from "@/components/provider-link-button";

function getProductCompareCopy(locale: MarketplaceLocale) {
  if (locale === "de") {
    return {
      eyebrow: "Auswahl vergleichen",
      title: "Ausgewählte Anbieter vergleichen",
      description:
        "Vergleiche die shortlisteten Anbieter, ohne Filter oder Eingaben zu verlieren.",
      feature: "Merkmal",
      provider: "Anbieter",
      fees: "Gebühren",
      speed: "Tempo",
      rateOrApr: "Kurs / APR",
      keyBenefits: "Wichtige Vorteile",
      bestFor: "Am besten für",
      action: "Aktion",
      checkDetails: "Details ansehen",
      goToProvider: "Zum Anbieter",
      removeLabel: "Aus dem Vergleich entfernen",
    };
  }

  return {
    eyebrow: "Compare selected",
    title: "Compare selected",
    description: "Compare the shortlisted providers without losing your filters or input context.",
    feature: "Feature",
    provider: "Provider",
    fees: "Fees",
    speed: "Speed",
    rateOrApr: "Rate / APR",
    keyBenefits: "Key benefits",
    bestFor: "Best for",
    action: "Action",
    checkDetails: "Check details",
    goToProvider: "Go to provider",
    removeLabel: "Remove from comparison",
  };
}

export type ProductCompareEntry = {
  offer: MarketplaceOffer;
  primaryMetricValue?: string;
  fees: string;
  speed: string;
  rateOrApr: string;
  keyBenefits: string;
  bestFor: string;
};

export function ProductCompareTable({
  locale,
  entries,
  primaryMetricLabel,
  title,
  description,
  onRemove,
}: {
  locale: MarketplaceLocale;
  entries: ProductCompareEntry[];
  primaryMetricLabel?: string;
  title?: string;
  description?: string;
  onRemove?: (offerId: string) => void;
}) {
  const copy = getProductCompareCopy(locale);
  const resolvedTitle = title ?? copy.title;
  const resolvedDescription = description ?? copy.description;

  return (
    <section className="rounded-[24px] border border-line bg-white p-5 shadow-card sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          {copy.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">{resolvedTitle}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">{resolvedDescription}</p>
      </div>

      <div className="mt-6 grid gap-3 lg:hidden">
        {entries.map((entry) => (
          <article
            key={entry.offer.id}
            className="rounded-[22px] border border-line bg-bg-surface px-4 py-4 shadow-card"
          >
            <div className="flex items-start gap-3">
              <ProviderLogo providerName={entry.offer.providerName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{entry.offer.providerName}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink-tertiary">{entry.offer.title}</p>
              </div>
              {onRemove ? (
                <button
                  type="button"
                  onClick={() => onRemove(entry.offer.id)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
                  aria-label={`${entry.offer.providerName} ${copy.removeLabel}`}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              ) : null}
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {primaryMetricLabel ? (
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                    {primaryMetricLabel}
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">
                    {entry.primaryMetricValue ?? copy.checkDetails}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {copy.fees}
                </dt>
                <dd className="mt-1 text-sm text-ink">{entry.fees}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {copy.speed}
                </dt>
                <dd className="mt-1 text-sm text-ink">{entry.speed}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {copy.rateOrApr}
                </dt>
                <dd className="mt-1 text-sm text-ink">{entry.rateOrApr}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {copy.keyBenefits}
                </dt>
                <dd className="mt-1 text-sm text-ink-secondary">{entry.keyBenefits}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {copy.bestFor}
                </dt>
                <dd className="mt-1 text-sm text-ink-secondary">{entry.bestFor}</dd>
              </div>
            </dl>

            <div className="mt-4">
              <ProviderLinkButton offer={entry.offer} label={copy.goToProvider} fullWidth />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 hidden overflow-x-auto lg:block">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-[220px] border-b border-line px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {copy.feature}
              </th>
              {entries.map((entry) => (
                <th
                  key={entry.offer.id}
                  className="min-w-[220px] border-b border-line px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <ProviderLogo providerName={entry.offer.providerName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{entry.offer.providerName}</p>
                      <p className="mt-1 truncate text-xs text-ink-tertiary">{entry.offer.title}</p>
                    </div>
                    {onRemove ? (
                      <button
                        type="button"
                        onClick={() => onRemove(entry.offer.id)}
                        className="ml-auto rounded-full p-1 text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
                        aria-label={`${entry.offer.providerName} ${copy.removeLabel}`}
                      >
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <path d="M4 4l8 8M12 4l-8 8" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                {copy.provider}
              </td>
              {entries.map((entry) => (
                <td key={`${entry.offer.id}-provider`} className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">
                  {entry.offer.providerName}
                </td>
              ))}
            </tr>
            {primaryMetricLabel ? (
              <tr>
                <td className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                  {primaryMetricLabel}
                </td>
                {entries.map((entry) => (
                  <td key={`${entry.offer.id}-primary`} className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">
                    {entry.primaryMetricValue ?? copy.checkDetails}
                  </td>
                ))}
              </tr>
            ) : null}
            <tr>
              <td className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                {copy.fees}
              </td>
              {entries.map((entry) => (
                <td key={`${entry.offer.id}-fees`} className="border-b border-line px-4 py-3 text-sm text-ink">
                  {entry.fees}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                {copy.speed}
              </td>
              {entries.map((entry) => (
                <td key={`${entry.offer.id}-speed`} className="border-b border-line px-4 py-3 text-sm text-ink">
                  {entry.speed}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                {copy.rateOrApr}
              </td>
              {entries.map((entry) => (
                <td key={`${entry.offer.id}-rate`} className="border-b border-line px-4 py-3 text-sm text-ink">
                  {entry.rateOrApr}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                {copy.keyBenefits}
              </td>
              {entries.map((entry) => (
                <td key={`${entry.offer.id}-benefits`} className="border-b border-line px-4 py-3 text-sm text-ink-secondary">
                  {entry.keyBenefits}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border-b border-line px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                {copy.bestFor}
              </td>
              {entries.map((entry) => (
                <td key={`${entry.offer.id}-best-for`} className="border-b border-line px-4 py-3 text-sm text-ink-secondary">
                  {entry.bestFor}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                {copy.action}
              </td>
              {entries.map((entry) => (
                <td key={`${entry.offer.id}-action`} className="px-4 py-4">
                  <ProviderLinkButton offer={entry.offer} label={copy.goToProvider} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
