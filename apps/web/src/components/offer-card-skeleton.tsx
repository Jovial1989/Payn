export function OfferCardSkeleton() {
  return (
    <div className="premium-card rounded-[28px] p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="skeleton-block h-12 w-12 rounded-[14px]" />
          <div className="space-y-2">
            <div className="skeleton-block h-3 w-28 rounded-full" />
            <div className="skeleton-block h-5 w-48 rounded-full" />
            <div className="skeleton-block h-4 w-40 rounded-full" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="skeleton-block h-8 w-24 rounded-full" />
          <div className="skeleton-block h-4 w-20 rounded-full" />
        </div>
      </div>
      <div className="mt-5 skeleton-block h-36 rounded-[24px]" />
      <div className="mt-5 flex gap-2">
        <div className="skeleton-block h-9 w-28 rounded-full" />
        <div className="skeleton-block h-9 w-24 rounded-full" />
        <div className="skeleton-block h-9 w-32 rounded-full" />
      </div>
    </div>
  );
}
