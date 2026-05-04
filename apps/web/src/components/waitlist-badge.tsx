export function WaitlistBadge({ badge }: { badge: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-emerald/20 bg-accent-emerald-soft px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-emerald-strong">
      <span className="h-2 w-2 rounded-full bg-accent-emerald" />
      {badge}
    </span>
  );
}
