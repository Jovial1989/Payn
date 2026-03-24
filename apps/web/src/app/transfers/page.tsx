import { FilterPanel } from "@/components/filter-panel";
import { SiteShell } from "@/components/site-shell";

export default function TransfersPage() {
  return (
    <SiteShell
      activeHref="/transfers"
      eyebrow="Money Transfers Marketplace"
      title="Route users into corridor-aware transfer discovery."
      description="Transfer comparison uses the same trust-first layout once corridor, payout method, and speed data are connected."
      heroTags={["Fee transparency", "Corridor-aware", "Payout options"]}
    >
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <FilterPanel category="transfers" />
        <section className="grid gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-bg-elevated p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-[200px] w-[200px] rounded-full bg-secondary opacity-[0.04] blur-[60px]" />
            <div className="relative">
              <p className="text-caption uppercase tracking-widest text-secondary">Coming soon</p>
              <h2 className="mt-3 text-h2 text-ink">
                Transfer results and corridor comparison.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
                The shell is ready for ranking cards, compare tables, and trust blocks that explain
                pricing and payout trade-offs transparently.
              </p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-bg-elevated p-6">
              <p className="text-caption uppercase tracking-widest text-ink-tertiary">Planned</p>
              <p className="mt-3 text-sm font-semibold text-ink">
                Ranking cards, compare rails, and corridor trust notes.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-bg-elevated p-6">
              <p className="text-caption uppercase tracking-widest text-ink-tertiary">Why it matters</p>
              <p className="mt-3 text-sm font-semibold text-ink">
                Speed, cost, and payout clarity should be visible before the click-out.
              </p>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
