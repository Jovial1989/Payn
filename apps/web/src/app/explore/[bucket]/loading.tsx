import { SiteShell } from "@/components/site-shell";

// Suspense fallback for /explore/[bucket]. Without this the router shows the
// previous page until the new page finishes rendering server-side, which makes
// sidebar clicks feel laggy. Skeleton mirrors the OfferRowAtlas grid (single
// column, full-width horizontal rows) the real page renders, to keep the swap
// from shifting the layout.
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

        {/* Row list skeleton — matches OfferRowAtlas single-column layout */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <OfferRowSkeleton key={i} />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}

function OfferRowSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="skeleton-block h-12 w-12 shrink-0 rounded-[12px]" />

        {/* Title + subtitle + bestFor pill */}
        <div className="min-w-0 flex-1 space-y-2 sm:flex-[0_0_260px]">
          <div className="skeleton-block h-4 w-40 rounded-full" />
          <div className="skeleton-block h-3 w-28 rounded-full" />
          <div className="skeleton-block mt-1 h-5 w-32 rounded-full" />
        </div>

        {/* Center column: metrics + bullets — desktop only */}
        <div className="hidden min-w-0 flex-1 md:flex md:flex-col md:gap-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="skeleton-block h-2.5 w-16 rounded-full" />
              <div className="skeleton-block h-3.5 w-20 rounded-full" />
            </div>
            <div className="space-y-1">
              <div className="skeleton-block h-2.5 w-16 rounded-full" />
              <div className="skeleton-block h-3.5 w-20 rounded-full" />
            </div>
          </div>
          <ul className="grid gap-1.5">
            <li className="skeleton-block h-3 w-full rounded-full" />
            <li className="skeleton-block h-3 w-5/6 rounded-full" />
            <li className="skeleton-block h-3 w-4/6 rounded-full" />
          </ul>
        </div>

        {/* CTA */}
        <div className="skeleton-block h-10 w-28 shrink-0 rounded-xl sm:h-11 sm:w-36" />
      </div>
    </div>
  );
}
