import { SiteShell } from "@/components/site-shell";

export default function AdminIndexPage() {
  return (
    <SiteShell
      activePage="marketplace"
      eyebrow="Admin foundation"
      title="Operational tools will live behind a dedicated admin surface."
      description="Offer management, ranking controls, editorial workflows, and ingestion observability should remain isolated from the public marketplace experience."
    >
      <section className="rounded-3xl border border-white/10 bg-panel p-6 text-sm leading-6 text-muted">
        This route group is reserved for authenticated internal tooling.
      </section>
    </SiteShell>
  );
}
