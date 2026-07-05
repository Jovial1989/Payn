import { Suspense } from "react";
import { SiteShell } from "@/components/site-shell";
import { HomePage } from "@/features/home/home-page";
import { getActiveHighlights } from "@/features/highlights/get-active-highlights";
import { pickTopOffers } from "@/features/home/pick-top-offers";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";
import { matchesOfferCountrySelection } from "@/lib/countries";
import { getRequestPreferences } from "@/lib/request-preferences";
import type { MarketplaceOffer } from "@payn/types";

// ── Skeleton shown while catalog data streams in ──────────────────────────────
// Keeps the layout stable — same grid gap as the real HomePage content.
function HomePageSkeleton() {
  return (
    <div className="grid min-w-0 gap-8 lg:gap-10">
      {/* Hero */}
      <div className="h-[480px] animate-pulse rounded-[28px] bg-bg-surface sm:rounded-[40px] lg:h-[520px]" />
      {/* Provider strip */}
      <div className="h-20 animate-pulse rounded-2xl bg-bg-surface" />
      {/* Waitlist pill */}
      <div className="h-14 animate-pulse rounded-2xl bg-bg-surface" />
      {/* Section */}
      <div className="h-72 animate-pulse rounded-[24px] bg-bg-surface" />
      {/* Atlas grid */}
      <div className="h-80 animate-pulse rounded-[24px] bg-bg-surface" />
    </div>
  );
}

// ── Async server component — owns the slow Supabase fetches ──────────────────
// Rendered inside a Suspense boundary so the SiteShell shell and nav reach
// the browser immediately; this component streams in once data is ready.
// With unstable_cache on both queries the warm path is <50ms total.
async function HomePageData({
  country,
}: {
  country: string;
}) {
  const [highlights, allOffers] = await Promise.all([
    getActiveHighlights(country),
    listMarketplaceOffers(),
  ]);
  const countryMarket: MarketplaceOffer[] = allOffers.filter((candidate) =>
    matchesOfferCountrySelection(candidate, country),
  );
  const topPicks = pickTopOffers(countryMarket, 3);

  return (
    <HomePage
      highlights={highlights}
      topPicks={topPicks}
      countryMarket={countryMarket}
    />
  );
}

// ── Page entry ────────────────────────────────────────────────────────────────
// getRequestPreferences() reads cookies — fast (~1ms). The shell renders
// immediately; HomePageData streams in as data resolves.
export default async function Page() {
  const prefs = await getRequestPreferences();

  return (
    <SiteShell hideHero>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageData country={prefs.country} />
      </Suspense>
    </SiteShell>
  );
}
