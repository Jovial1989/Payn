import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

const CATEGORIES = [
  "loans","cards","banking","transfers","exchange",
  "insurance","investments","crypto","business","budgeting","kids",
] as const;

export async function GET(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  const { searchParams } = request.nextUrl;

  const category  = searchParams.get("category") ?? "";
  const search    = searchParams.get("search") ?? "";
  const monetised = searchParams.get("monetised");
  const status    = searchParams.get("status") ?? "";
  const source    = searchParams.get("source") ?? ""; // "db" | "static" | ""
  const page      = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage   = 100;

  // ── DB path ────────────────────────────────────────────────────────────────
  if (admin && source !== "static") {
    let query = admin.from("product_offers").select("*", { count: "exact" });
    if (category)              query = query.eq("category", category);
    if (status)                query = query.eq("status", status);
    if (monetised === "true")  query = query.eq("is_monetised", true);
    if (monetised === "false") query = query.eq("is_monetised", false);
    if (search) {
      // SEC-FIX PAYN-A08: strip PostgREST metacharacters before interpolation
      const safeSearch = search.replace(/[(),%]/g, "");
      query = query.or(
        `provider_name.ilike.%${safeSearch}%,title.ilike.%${safeSearch}%`,
      );
    }

    const { data, count, error } = await query
      .order("affiliate_priority_score", { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);

    if (!error) {
      // Merge click counts
      let clickCounts: Record<string, number> = {};
      const { data: clickRows } = await admin
        .from("offer_click_events")
        .select("offer_id");
      for (const r of clickRows ?? []) {
        clickCounts[r.offer_id] = (clickCounts[r.offer_id] ?? 0) + 1;
      }

      const offers = (data ?? []).map((o) => ({
        ...o,
        clicks: clickCounts[o.id] ?? 0,
        source: "db",
      }));

      return NextResponse.json({ offers, total: count ?? 0, page, perPage, source: "db" });
    }
  }

  // ── Static fallback ────────────────────────────────────────────────────────
  let overrides: Record<string, { affiliate_url: string | null; status: string }> = {};
  let clickCounts: Record<string, number> = {};
  if (admin) {
    const [ov, clicks] = await Promise.all([
      admin.from("admin_offer_overrides").select("offer_id, affiliate_url, status"),
      admin.from("offer_click_events").select("offer_id"),
    ]);
    overrides = Object.fromEntries((ov.data ?? []).map((r) => [r.offer_id, r]));
    for (const r of clicks.data ?? []) {
      clickCounts[r.offer_id] = (clickCounts[r.offer_id] ?? 0) + 1;
    }
  }

  let offers = marketplaceOffers.map((o) => ({
    id: o.id,
    slug: o.slug,
    provider_name: o.providerName,
    title: o.title,
    category: o.category,
    country_codes: o.countryCodes ?? [],
    affiliate_link: o.affiliateLink ?? "",
    link_type: o.linkType,
    affiliate_priority_score: o.affiliatePriorityScore,
    is_monetised: Boolean(o.affiliateLink && o.linkType === "affiliate_redirect"),
    status: overrides[o.id]?.status ?? "active",
    is_featured: false,
    clicks: clickCounts[o.id] ?? 0,
    source: "static",
  }));

  if (category)              offers = offers.filter((o) => o.category === category);
  if (search) {
    const q = search.toLowerCase();
    offers = offers.filter(
      (o) => o.provider_name.toLowerCase().includes(q) || o.title.toLowerCase().includes(q),
    );
  }
  if (monetised === "true")  offers = offers.filter((o) => o.is_monetised);
  if (monetised === "false") offers = offers.filter((o) => !o.is_monetised);
  if (status)                offers = offers.filter((o) => o.status === status);

  return NextResponse.json({ offers, total: offers.length, page: 1, perPage: offers.length, source: "static" });
}

export async function POST(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { id, slug, provider_name, title, category } = body;
  if (!id || !slug || !provider_name || !title || !category) {
    return NextResponse.json({ error: "Missing required fields: id, slug, provider_name, title, category" }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
  }

  const row = {
    id,
    slug,
    provider_name,
    provider_mark:          body.provider_mark ?? "",
    provider_website_url:   body.provider_website_url ?? "",
    title,
    subtitle:               body.subtitle ?? "",
    category,
    country_codes:          body.country_codes ?? [],
    affiliate_link:         body.affiliate_link ?? "",
    link_type:              body.link_type ?? "affiliate_redirect",
    affiliate_priority_score: Number(body.affiliate_priority_score ?? 0.5),
    is_monetised:           Boolean(body.is_monetised ?? false),
    status:                 body.status ?? "active",
    is_featured:            Boolean(body.is_featured ?? false),
    best_for:               body.best_for ?? [],
    metrics:                body.metrics ?? [],
    attributes:             body.attributes ?? {},
    tags:                   body.tags ?? [],
    notes:                  body.notes ?? null,
    data_source:            "admin",
  };

  const { data, error } = await admin
    .from("product_offers")
    .insert(row)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin.from("admin_audit_log").insert({
    action: "create_offer",
    target_id: id,
    target_type: "offer",
    metadata: { provider_name, title, category },
  });

  revalidateTag("catalog", {});
  return NextResponse.json({ ok: true, offer: data }, { status: 201 });
}
