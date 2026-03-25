import type { MarketplaceOffer } from "@payn/types";
import { buttonStyles } from "@/components/button";
import { Tag } from "@/components/tag";

const ctaLabels: Record<MarketplaceOffer["linkType"], string> = {
  affiliate_redirect: "Apply now",
  lead_capture: "View offer",
  embedded_partner: "View offer",
};

const tagTones = ["blue", "accent", "purple", "orange", "muted"] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

export function OfferCard({ offer, rank }: { offer: MarketplaceOffer; rank: number }) {
  return (
    <article
      className="group rounded-3xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:p-8"
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      {/* Provider row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-surface text-sm font-bold text-ink">
            {offer.providerMark}
          </div>
          <div>
            <p className="text-sm font-bold text-ink">{offer.providerName}</p>
            <p className="mt-0.5 text-xs text-ink-tertiary">Updated {formatDate(offer.updatedAt)}</p>
          </div>
        </div>
        <Tag tone="blue">#{rank}</Tag>
      </div>

      {/* Title */}
      <div className="mt-5">
        <h3 className="text-h3 text-ink">{offer.title}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">{offer.subtitle}</p>
      </div>

      {/* Metrics */}
      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        {offer.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl bg-bg-surface px-5 py-4">
            <dt className="text-xs font-medium text-ink-tertiary">{metric.label}</dt>
            <dd className="mt-1.5 text-lg font-bold tabular-nums tracking-tight text-ink">{metric.value}</dd>
          </div>
        ))}
      </dl>

      {/* Tags */}
      <div className="mt-5 flex flex-wrap gap-2">
        {offer.bestFor.map((item, i) => (
          <Tag key={item} tone={tagTones[i % tagTones.length]}>
            {item}
          </Tag>
        ))}
      </div>

      {/* CTA row */}
      <div className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span>Ranked by product fit, cost, and provider quality</span>
        </div>
        <a
          href={offer.affiliateLink}
          target="_blank"
          rel="noreferrer"
          className={buttonStyles({ variant: "primary", size: "md" })}
        >
          {ctaLabels[offer.linkType]}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-1.5">
            <path d="M3 7h8m0 0L8 4m3 3L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </article>
  );
}
