import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

export async function POST() {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  // Dedupe by id AND slug — static catalog spreads several arrays and a few
  // entries collide (mock-data vs newer expansion files). Both `id` (PK) and
  // `slug` (unique) constraints must be satisfied for the batch upsert, so we
  // walk from the end keeping later occurrences (the newer expansion-file
  // versions come after mock-data in the spread order).
  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();
  const duplicateIds: string[] = [];
  const duplicateSlugs: string[] = [];
  const deduped: typeof marketplaceOffers = [];
  for (let i = marketplaceOffers.length - 1; i >= 0; i--) {
    const o = marketplaceOffers[i];
    if (seenIds.has(o.id)) { duplicateIds.push(o.id); continue; }
    if (seenSlugs.has(o.slug)) { duplicateSlugs.push(o.slug); continue; }
    seenIds.add(o.id);
    seenSlugs.add(o.slug);
    deduped.push(o);
  }
  deduped.reverse();

  const rows = deduped.map((o) => ({
    id: o.id,
    slug: o.slug,
    provider_name: o.providerName,
    provider_mark: o.providerMark ?? "",
    provider_website_url: o.providerWebsiteUrl ?? "",
    title: o.title,
    subtitle: o.subtitle ?? "",
    category: o.category,
    country_codes: o.countryCodes ?? [],
    affiliate_link: o.affiliateLink ?? "",
    link_type: o.linkType ?? "affiliate_redirect",
    affiliate_priority_score: o.affiliatePriorityScore ?? 0.5,
    is_monetised: Boolean(
      o.affiliateLink &&
        o.linkType === "affiliate_redirect" &&
        o.attributes?.monetized === true,
    ),
    status: "active",
    is_featured: false,
    best_for: o.bestFor ?? [],
    metrics: o.metrics ?? [],
    attributes: o.attributes ?? {},
    tags: [],
    data_source: "static",
    updated_at: o.updatedAt ?? new Date().toISOString(),
  }));

  const { error } = await admin
    .from("product_offers")
    .upsert(rows, { onConflict: "id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("admin_audit_log").insert({
    action: "seed_offers",
    metadata: { count: rows.length, duplicateIds, duplicateSlugs },
  });

  return NextResponse.json({
    ok: true,
    seeded: rows.length,
    static_total: marketplaceOffers.length,
    duplicate_ids: duplicateIds,
    duplicate_slugs: duplicateSlugs,
  });
}

export async function GET() {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { count } = await admin
    .from("product_offers")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ db_count: count ?? 0, static_count: marketplaceOffers.length });
}
