import { SiteShell } from "@/components/site-shell";

// Suspense fallback for /explore/[bucket]. Without this the router shows the
// previous page until the new page finishes rendering server-side, which makes
// sidebar clicks feel laggy. The skeleton mirrors the real page layout so the
// content swap doesn't shift.
export default function BucketLoading() {
  return (
    <SiteShell hideHero>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Back link + header */}
        <div className="mb-10">
          <div className="skeleton-block mb-6 h-4 w-32 rounded-full" />
          <div className="flex items-center gap-3">
            <div className="skeleton-block h-10 w-10 rounded-xl" />
            <div className="space-y-2">
              <div className="skeleton-block h-7 w-64 rounded-full" />
              <div className="skeleton-block h-4 w-80 rounded-full" />
            </div>
          </div>
          <div className="skeleton-block mt-3 h-4 w-48 rounded-full" />
        </div>

        {/* Offer grid skeleton — 3-col on lg, matching the real grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <OfferCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}

// Local skeleton matching OfferCardAtlas shape; the existing
// components/offer-card-skeleton.tsx is shaped for the wider legacy compare-row
// layout, not the vertical Atlas card.
function OfferCardSkeleton() {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="skeleton-block h-12 w-12 rounded-[12px]" />
        <div className="flex-1 space-y-1.5">
          <div className="skeleton-block h-3 w-24 rounded-full" />
          <div className="skeleton-block h-4 w-32 rounded-full" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton-block h-5 w-3/4 rounded-full" />
        <div className="skeleton-block h-4 w-2/3 rounded-full" />
      </div>
      <div className="mt-4 inline-block">
        <div className="skeleton-block h-6 w-28 rounded-full" />
      </div>
      <ul className="mt-3 grid gap-1">
        <li className="skeleton-block h-3 w-full rounded-full" />
        <li className="skeleton-block h-3 w-5/6 rounded-full" />
        <li className="skeleton-block h-3 w-4/6 rounded-full" />
      </ul>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <div className="skeleton-block h-2.5 w-16 rounded-full" />
          <div className="skeleton-block mt-1.5 h-4 w-20 rounded-full" />
        </div>
        <div>
          <div className="skeleton-block h-2.5 w-16 rounded-full" />
          <div className="skeleton-block mt-1.5 h-4 w-20 rounded-full" />
        </div>
      </div>
      <div className="skeleton-block mt-5 h-10 w-full rounded-xl" />
    </div>
  );
}
