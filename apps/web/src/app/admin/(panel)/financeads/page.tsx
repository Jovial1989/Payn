import { env } from "@/lib/env";
import { financeadsConfigured } from "@/lib/financeads/client";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { AdminFinanceadsControls } from "@/components/admin-financeads-controls";

// Affiliate Engine — the two offer engines:
//   1. FinanceAds sync: pull partner programs + tracking links, mark catalog
//      offers monetised with the live affiliate link.
//   2. Gemini discovery: research new offers from partnered programs + the
//      open market, validate, and publish (verified) or queue (for review).
export default async function AdminFinanceadsPage() {
  const admin = createSupabaseAdminClient();
  const configured = financeadsConfigured();

  let monetised = 0;
  let needsReview = 0;
  let synced = 0;

  if (admin) {
    const [monRes, reviewRes, syncRes] = await Promise.all([
      admin.from("product_offers").select("*", { count: "exact", head: true }).eq("is_monetised", true),
      admin.from("product_offers").select("*", { count: "exact", head: true }).eq("status", "needs_review"),
      admin
        .from("product_offers")
        .select("*", { count: "exact", head: true })
        .not("attributes->financeads", "is", null),
    ]);
    monetised = monRes.count ?? 0;
    needsReview = reviewRes.count ?? 0;
    synced = syncRes.count ?? 0;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.03em] text-ink">Affiliate Engine</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-secondary">
          Pull live FinanceAds partnerships into the catalog and discover new offers with AI.
          Always preview before applying.
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
      </div>

      <AdminFinanceadsControls />
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
