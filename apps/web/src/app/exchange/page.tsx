import { FilterPanel } from "@/components/filter-panel";
import { SiteShell } from "@/components/site-shell";

export default function ExchangePage() {
  return (
    <SiteShell
      eyebrow="Currency exchange marketplace"
      title="Support FX discovery without burying spreads and fees."
      description="The exchange section is prepared for pair-aware routing, compliance notes, and backend-owned ranking logic that balances trust, freshness, and commercial signals."
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <FilterPanel category="FX offers" />
        <section className="rounded-3xl border border-white/10 bg-panel p-6 text-sm leading-6 text-muted">
          Exchange product cards and educational content modules will be introduced as shared
          marketplace contracts are implemented.
        </section>
      </div>
    </SiteShell>
  );
}

