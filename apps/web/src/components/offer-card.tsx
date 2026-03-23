import type { MarketplaceOffer } from "@payn/types";
import { buttonStyles } from "@/components/button";
import { SectionContainer } from "@/components/section-container";
import { Tag } from "@/components/tag";

const ctaLabels: Record<MarketplaceOffer["linkType"], string> = {
  affiliate_redirect: "Apply on provider site",
  lead_capture: "View offer",
  embedded_partner: "View offer",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export function OfferCard({ offer, rank }: { offer: MarketplaceOffer; rank: number }) {
  return (
    <SectionContainer
      as="article"
      className="transition-colors hover:bg-panel-strong"
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-line bg-bg text-sm font-semibold text-ink">
            {offer.providerMark}
          </div>
          <div>
            <p className="text-sm font-medium text-ink">{offer.providerName}</p>
            <p className="mt-1 text-xs text-muted">Updated {formatDate(offer.updatedAt)}</p>
          </div>
        </div>
        <div className="rounded-full border border-line bg-bg px-3 py-1.5 text-xs font-medium text-muted">
          Rank #{rank}
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-xl font-semibold tracking-[-0.02em] text-ink">{offer.title}</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{offer.subtitle}</p>
      </div>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {offer.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-line bg-bg px-4 py-4">
            <dt className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{metric.label}</dt>
            <dd className="mt-2 text-base font-semibold tabular-nums text-ink">{metric.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        {offer.bestFor.map((item) => (
          <Tag key={item} tone="accent">
            {item}
          </Tag>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6 text-muted">
          We show the most relevant options first based on product fit, cost, and provider quality.
        </p>
        <a
          href={offer.affiliateLink}
          target="_blank"
          rel="noreferrer"
          className={buttonStyles({ variant: "primary" })}
        >
          {ctaLabels[offer.linkType]}
        </a>
      </div>
    </SectionContainer>
  );
}
