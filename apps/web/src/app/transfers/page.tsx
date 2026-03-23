import { FilterPanel } from "@/components/filter-panel";
import { SiteShell } from "@/components/site-shell";

export default function TransfersPage() {
  return (
    <SiteShell
      eyebrow="Money transfers marketplace"
      title="Route users into corridor-aware transfer discovery."
      description="This foundation reserves space for transfer speed, FX margin, payout method, and corridor coverage filters powered by backend contracts."
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FilterPanel category="transfer offers" />
        <section className="rounded-3xl border border-white/10 bg-panel p-6 text-sm leading-6 text-muted">
          Transfer provider results, compare support, and trust content modules will land here as
          the catalog and ranking services are implemented.
        </section>
      </div>
    </SiteShell>
  );
}

