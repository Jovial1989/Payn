import type { MarketplaceOffer } from "@payn/types";

export function OfferCard({ offer }: { offer: MarketplaceOffer }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-panel p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-sm text-accent">{offer.providerName}</p>
          <h3 className="mt-2 text-xl font-semibold text-ink">{offer.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{offer.subtitle}</p>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
          {offer.linkType}
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {offer.bestFor.map((item) => (
          <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}

