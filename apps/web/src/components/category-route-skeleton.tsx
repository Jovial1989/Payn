// Generic Suspense fallback for the 23 legacy category routes (/banking,
// /cards, /loans, etc.). Wrapped inside ProductShell by each route's layout.tsx,
// so this only fills the content area; the sidebar stays mounted by the layout.
// Matches the rough shape of DashboardCategoryWorkspace (mx-auto max-w-[980px])
// so the swap from skeleton to real content doesn't shift the layout.
export function CategoryRouteSkeleton() {
  return (
    <div className="mx-auto grid max-w-[980px] gap-6">
      {/* Eyebrow + title strip */}
      <div className="grid gap-3">
        <div className="skeleton-block h-3 w-32 rounded-full" />
        <div className="skeleton-block h-9 w-64 rounded-full" />
        <div className="skeleton-block h-4 w-80 rounded-full" />
      </div>

      {/* Refine results button placeholder */}
      <div className="skeleton-block h-5 w-32 rounded-full" />

      {/* Row list — 5 placeholder offers */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <OfferRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function OfferRowSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card sm:p-5">
      <div className="flex items-center gap-4">
        <div className="skeleton-block h-12 w-12 shrink-0 rounded-[12px]" />
        <div className="min-w-0 flex-1 space-y-2 sm:flex-[0_0_260px]">
          <div className="skeleton-block h-4 w-40 rounded-full" />
          <div className="skeleton-block h-3 w-28 rounded-full" />
          <div className="skeleton-block mt-1 h-5 w-32 rounded-full" />
        </div>
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
        <div className="skeleton-block h-10 w-28 shrink-0 rounded-xl sm:h-11 sm:w-36" />
      </div>
    </div>
  );
}
