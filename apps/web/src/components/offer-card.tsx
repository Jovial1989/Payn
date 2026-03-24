import type { MarketplaceOffer } from "@payn/types";
import { buttonStyles } from "@/components/button";
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
    <article
      className="group relative overflow-hidden rounded-2xl border border-line bg-bg-elevated shadow-card transition-all duration-300 hover:border-line-active hover:shadow-elevated"
      aria-label={`${offer.providerName} ${offer.title}`}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="p-6">
        {/* Provider row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-bg-surface text-sm font-bold text-ink">
              {offer.providerMark}
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{offer.providerName}</p>
              <p className="mt-0.5 text-xs text-ink-tertiary">Updated {formatDate(offer.updatedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-bg-surface px-2.5 py-1 text-xs font-semibold tabular-nums text-ink-secondary">
              #{rank}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-5">
          <h3 className="text-h3 text-ink">{offer.title}</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-secondary">{offer.subtitle}</p>
        </div>

        {/* Metrics */}
        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          {offer.metrics.map((metric) => (
            <div key={metric.label} className="metric-highlight rounded-xl px-4 py-3.5">
              <dt className="text-caption uppercase text-ink-tertiary">{metric.label}</dt>
              <dd className="mt-1.5 text-base font-bold tabular-nums text-ink">{metric.value}</dd>
            </div>
          ))}
        </dl>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-2">
          {offer.bestFor.map((item) => (
            <Tag key={item} tone="accent">
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
      </div>
    </article>
  );
}
