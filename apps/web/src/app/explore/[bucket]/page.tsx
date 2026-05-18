import { notFound } from "next/navigation";
import Link from "next/link";
import { OUTCOME_BUCKETS } from "@/features/catalog/outcomes";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { getRequestPreferences } from "@/lib/request-preferences";
import { getDictionary } from "@/lib/i18n";
import type { MarketplaceLocale } from "@payn/types";
import { BucketWorkspace } from "@/features/explore/bucket-workspace";

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

  const marketplaceOffers = await listMarketplaceOffers();
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
    <div className="mx-auto max-w-6xl">
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

      <BucketWorkspace
        bucketSlug={bucket.slug}
        offers={offers}
        locale={locale}
        countryName={countryName}
        marketLabel={countryName}
      />
    </div>
  );
}
