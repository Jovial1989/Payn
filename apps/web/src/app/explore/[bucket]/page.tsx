import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { OUTCOME_BUCKETS } from "@/features/catalog/outcomes";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";
import { getRequestPreferences } from "@/lib/request-preferences";
import { getDictionary } from "@/lib/i18n";
import type { MarketplaceLocale } from "@payn/types";

interface PageProps {
  params: Promise<{ bucket: string }>;
  searchParams: Promise<{ country?: string }>;
}

export default async function OutcomeBucketPage({ params, searchParams }: PageProps) {
  const { bucket: bucketSlug } = await params;
  const { country: countryParam } = await searchParams;

  const bucket = OUTCOME_BUCKETS.find((b) => b.slug === bucketSlug);
  if (!bucket) notFound();

  const prefs = await getRequestPreferences();
  const country = countryParam?.toUpperCase() ?? prefs.country.toUpperCase();
  const locale = prefs.locale as MarketplaceLocale;
  const dictionary = getDictionary(locale);
  const atlas = dictionary.homeAtlas;

  const offers = marketplaceOffers.filter(
    (o) =>
      bucket.categories.includes(o.category) &&
      (
        (o.countryCodes as string[])?.includes(country) ||
        (o.countryCodes as string[])?.includes("EU") ||
        (o.countryCodes as string[])?.includes("ALL")
      ),
  );

  const countryName = atlas.countryNames[country] ?? country;
  const title = atlas[bucket.bucketKey].title;
  const description = atlas[bucket.bucketKey].description;
  const Icon = bucket.Icon;

  return (
    <SiteShell hideHero>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href={`/${locale}/explore`}
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-tertiary hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M11.5 7h-9M6 3.5L2.5 7 6 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All categories
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-emerald-soft text-accent-emerald">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-[1.75rem] font-bold tracking-[-0.025em] text-ink">{title}</h1>
              <p className="text-[14px] text-ink-secondary">{description}</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-ink-tertiary">
            {offers.length} options available in {countryName}
          </p>
        </div>

        {/* Offer cards */}
        {offers.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white px-8 py-16 text-center">
            <p className="text-[15px] text-ink-secondary">
              No options currently available in {countryName} for this category.
            </p>
            <Link
              href={`/${locale}/explore`}
              className="mt-4 inline-block text-[14px] font-medium text-accent-emerald hover:underline"
            >
              Browse all categories →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-subtle"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-emerald-soft text-[11px] font-extrabold text-accent-emerald-strong">
                    {(offer.providerMark ?? offer.providerName.slice(0, 2)).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-medium text-ink-tertiary">
                      {dictionary.categories[offer.category as keyof typeof dictionary.categories] ?? offer.category}
                    </p>
                    <p className="truncate text-[14px] font-semibold text-ink">{offer.providerName}</p>
                  </div>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">{offer.title}</p>
                {offer.metrics && offer.metrics.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {offer.metrics.slice(0, 2).map((m) => (
                      <div key={m.label}>
                        <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">{m.label}</span>
                        <span className="text-[15px] font-bold tabular-nums text-ink">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-4">
                  <a
                    href={offer.affiliateLink ?? offer.providerWebsiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent-emerald hover:text-accent-emerald-strong"
                  >
                    Go to provider
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
