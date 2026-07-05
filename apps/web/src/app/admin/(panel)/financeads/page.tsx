import { env } from "@/lib/env";
import { financeadsConfigured } from "@/lib/financeads/client";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { AdminFinanceadsControls } from "@/components/admin-financeads-controls";
import { AdminEnrichmentControls } from "@/components/admin-enrichment-controls";
import { AdminOfferMaintenance } from "@/components/admin-offer-maintenance";

// Affiliate Engine — the single hub for offer quality + monetisation + growth
// (absorbs the old "Offer Health" page):
//   • Catalog review — audits every offer for relevance/links/freshness and
//     heals what it safely can (this replaces the old standalone Reconcile).
//   • FinanceAds sync — pull partner programs + tracking links, mark monetised.
//   • Gemini discovery — research + verify new offers (publish or queue).
//   • Enrichment — fill missing fields with AI.
//   • Maintenance — bulk flag resets.
export default async function AdminFinanceadsPage() {
  const admin = createSupabaseAdminClient();
  const configured = financeadsConfigured();

  let monetised = 0;
  let needsReview = 0;
  let synced = 0;
  let missingLinks = 0;

  if (admin) {
    const [monRes, reviewRes, syncRes, missingRes] = await Promise.all([
      admin.from("product_offers").select("*", { count: "exact", head: true }).eq("is_monetised", true),
      admin.from("product_offers").select("*", { count: "exact", head: true }).eq("status", "needs_review"),
      admin
        .from("product_offers")
        .select("*", { count: "exact", head: true })
        .not("attributes->financeads", "is", null),
      admin
        .from("product_offers")
        .select("*", { count: "exact", head: true })
        .or("affiliate_link.is.null,affiliate_link.eq."),
    ]);
    monetised = monRes.count ?? 0;
    needsReview = reviewRes.count ?? 0;
    synced = syncRes.count ?? 0;
    missingLinks = missingRes.count ?? 0;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Affiliate Engine</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
          Keep the catalog relevant + monetised: audit & heal offer health, sync FinanceAds
          partnerships, and discover new offers with AI. Always preview before applying.
          {!configured && (
            <span className="ml-2 font-semibold text-red-500">
              — FINANCEADS_API_KEY / FINANCEADS_ADSPACE not set
            </span>
          )}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 rounded-[20px] border border-line bg-white px-5 py-4 shadow-card">
        <Stat label="Ad space" value={configured ? env.financeadsAdspace : "—"} />
        <Stat label="Monetised offers" value={String(monetised)} />
        <Stat label="Live-synced" value={String(synced)} />
        <Stat label="Needs review" value={String(needsReview)} warn={needsReview > 0} />
        <Stat label="Missing links" value={String(missingLinks)} warn={missingLinks > 0} />
      </div>

      {/* Engines: Catalog review (audit/heal — replaces Reconcile) + FinanceAds sync + Gemini discovery */}
      <AdminFinanceadsControls />

      {/* Offer Health utilities (merged in): fill gaps with AI + bulk maintenance */}
      <AdminEnrichmentControls />
      <AdminOfferMaintenance />
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="min-w-[110px]">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">{label}</p>
      <p className={`mt-0.5 text-xl font-bold tabular-nums ${warn ? "text-orange-600" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
