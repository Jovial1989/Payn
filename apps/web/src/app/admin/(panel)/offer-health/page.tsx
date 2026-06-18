import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { AdminEnrichmentControls } from "@/components/admin-enrichment-controls";
import { AdminReconcileControls } from "@/components/admin-reconcile-controls";
import { AdminOfferMaintenance } from "@/components/admin-offer-maintenance";

// Offer Health — keep the live catalog correct and complete.
//   • Reconciliation: verify each offer's link is alive + matches the stored data
//   • Enrichment: fill missing fields via AI
//   • Maintenance: bulk flag resets
// (Bulk INGESTION — CSV import, static re-sync, dedupe — lives on the Import page.)
export default async function AdminOfferHealthPage() {
  const admin = createSupabaseAdminClient();

  let dbOfferCount = 0;
  let needsReview = 0;
  let missingLinks = 0;
  let notConfigured = false;

  if (admin) {
    const [countRes, reviewRes, missingRes] = await Promise.all([
      admin.from("product_offers").select("*", { count: "exact", head: true }),
      admin
        .from("product_offers")
        .select("*", { count: "exact", head: true })
        .eq("status", "needs_review"),
      admin
        .from("product_offers")
        .select("*", { count: "exact", head: true })
        .or("affiliate_link.is.null,affiliate_link.eq."),
    ]);
    dbOfferCount = countRes.count ?? 0;
    needsReview = reviewRes.count ?? 0;
    missingLinks = missingRes.count ?? 0;
  } else {
    notConfigured = true;
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Offer Health</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Verify links, match live conditions, and fill gaps in the catalog.
          {notConfigured && (
            <span className="ml-2 font-semibold text-red-500">
              — SUPABASE_SERVICE_ROLE_KEY not set
            </span>
          )}
        </p>
      </div>

      {/* Health snapshot */}
      <div className="flex flex-wrap gap-4 rounded-[20px] border border-line bg-white px-5 py-4 shadow-card">
        <HealthStat label="Offers in DB" value={dbOfferCount} />
        <HealthStat label="Needs review" value={needsReview} warn={needsReview > 0} />
        <HealthStat label="Missing links" value={missingLinks} warn={missingLinks > 0} />
      </div>

      {/* Reconciliation — the primary tool */}
      <AdminReconcileControls />

      {/* Enrichment */}
      <AdminEnrichmentControls />

      {/* Bulk maintenance */}
      <AdminOfferMaintenance />
    </div>
  );
}

function HealthStat({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <div className="min-w-[120px]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
        {label}
      </p>
      <p className={`mt-0.5 text-xl font-bold tabular-nums ${warn ? "text-orange-600" : "text-ink"}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );
}
