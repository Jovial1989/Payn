"use client";

import type {
  MarketplaceInsuranceType,
  MarketplaceLocale,
  MarketplaceOffer,
} from "@payn/types";
import { ProviderLogo } from "@/components/provider-logo";
import { ProviderLinkButton } from "@/components/provider-link-button";
import { getDictionary, getMetricLabel } from "@/lib/i18n";
import { getMetricValue, normalizeDisplayText } from "@/lib/marketplace";

const metricLabels: Record<MarketplaceInsuranceType, string[]> = {
  travel: ["Price", "Medical cover", "Trip length", "Region coverage", "Baggage / delay"],
  health: ["Monthly premium", "Outpatient", "Inpatient", "Digital claims"],
  life: ["Monthly premium", "Insured amount", "Term", "Family cover"],
  auto: ["Monthly premium", "Liability", "Collision / theft", "Roadside support", "Deductible"],
  nomad: ["Price", "Rolling monthly", "Countries covered", "Medical emergencies", "Remote work suitability"],
  device: ["Monthly premium", "Device cover", "Theft / liquid", "Worldwide protection", "Deductible"],
};

export function InsuranceCompareTable({
  locale,
  type,
  offers,
}: {
  locale: MarketplaceLocale;
  type: MarketplaceInsuranceType;
  offers: MarketplaceOffer[];
}) {
  const dictionary = getDictionary(locale);
  const labels = metricLabels[type] ?? [];
  const copy =
    locale === "de"
      ? {
          eyebrow: "Auswahl vergleichen",
          title: "Anbieter direkt nebeneinander",
          description:
            "Bleibe innerhalb einer Schutzart, damit Preis, Deckung, Flexibilität und Ausschlüsse leichter beurteilbar bleiben.",
          bestFor: "Am besten für",
          feature: "Merkmal",
          action: "Aktion",
        }
      : {
          eyebrow: "Compare selected",
          title: "Side-by-side provider view",
          description:
            "Keep the comparison inside one protection type so price, cover, flexibility, and exclusions are easier to judge.",
          bestFor: "Best for",
          feature: "Feature",
          action: "Action",
        };

  return (
    <section className="rounded-[24px] border border-[#EAEAEA] bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] sm:p-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">{copy.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-ink">
          {copy.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink-secondary">
          {copy.description}
        </p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="grid gap-3 lg:hidden">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="rounded-[22px] border border-[#EAEAEA] bg-[#FCFCFD] px-4 py-4 shadow-[0_8px_22px_rgba(17,24,39,0.04)]"
            >
              <div className="flex items-start gap-3">
                <ProviderLogo providerName={offer.providerName} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{offer.providerName}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-tertiary">{offer.title}</p>
                </div>
              </div>

              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {labels.map((label) => (
                  <div key={`${offer.id}-${label}`}>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                      {getMetricLabel(locale, label)}
                    </dt>
                    <dd className="mt-1 text-sm text-ink-secondary">
                      {normalizeDisplayText(getMetricValue(offer, [label]) ?? "—")}
                    </dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-tertiary">
                    {copy.bestFor}
                  </dt>
                  <dd className="mt-1 text-sm text-ink-secondary">
                    {normalizeDisplayText(offer.bestFor.join(" · "))}
                  </dd>
                </div>
              </dl>

              <div className="mt-4">
                <ProviderLinkButton offer={offer} label={dictionary.offerCard.providerSite} fullWidth />
              </div>
            </article>
          ))}
        </div>

        <table className="hidden min-w-full border-separate border-spacing-0 lg:table">
          <thead>
            <tr>
              <th className="w-[220px] border-b border-[#ECEDEF] px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
                {copy.feature}
              </th>
              {offers.map((offer) => (
                <th
                  key={offer.id}
                  className="border-b border-[#ECEDEF] px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <ProviderLogo providerName={offer.providerName} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-ink">{offer.providerName}</p>
                      <p className="mt-1 text-xs text-ink-tertiary">{offer.title}</p>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label) => (
              <tr key={label}>
                <td className="border-b border-[#F0F1F3] px-4 py-4 text-sm font-semibold text-ink">
                  {getMetricLabel(locale, label)}
                </td>
                {offers.map((offer) => (
                  <td
                    key={`${offer.id}-${label}`}
                    className="border-b border-[#F0F1F3] px-4 py-4 text-sm text-ink-secondary"
                  >
                    {normalizeDisplayText(getMetricValue(offer, [label]) ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-4 text-sm font-semibold text-ink">{copy.bestFor}</td>
              {offers.map((offer) => (
                <td key={`${offer.id}-bestfor`} className="px-4 py-4 text-sm text-ink-secondary">
                  {normalizeDisplayText(offer.bestFor.join(" · "))}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-4 py-4 text-sm font-semibold text-ink">{copy.action}</td>
              {offers.map((offer) => (
                <td key={`${offer.id}-action`} className="px-4 py-4">
                  <ProviderLinkButton offer={offer} label={dictionary.offerCard.providerSite} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
