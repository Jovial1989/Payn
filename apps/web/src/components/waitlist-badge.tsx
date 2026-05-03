export function WaitlistBadge({ badge }: { badge: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
      <span className="h-2 w-2 rounded-full bg-cyan-300" />
      {badge}
    </span>
  );
}
