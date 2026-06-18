import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const [dbRes, overrideRes, clicksRes] = await Promise.all([
    admin.from("product_offers").select("*").eq("id", id).maybeSingle(),
    admin.from("admin_offer_overrides").select("*").eq("offer_id", id).maybeSingle(),
    admin
      .from("offer_click_events")
      .select("id, country, language, device_type, source_page, is_monetised, created_at")
      .eq("offer_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const recentClicks = clicksRes.data ?? [];

  if (dbRes.data) {
    return NextResponse.json({ offer: dbRes.data, override: overrideRes.data, recentClicks, source: "db" });
  }

  const staticOffer = marketplaceOffers.find((o) => o.id === id || o.slug === id);
  if (!staticOffer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ offer: staticOffer, override: overrideRes.data, recentClicks, source: "static" });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const { affiliate_url, status, notes } = body as {
    affiliate_url?: string;
    status?: string;
    notes?: string;
  };

  const { error } = await admin.from("admin_offer_overrides").upsert(
    {
      offer_id: id,
      ...(affiliate_url !== undefined && { affiliate_url }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "offer_id" },
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { data: existing } = await admin
    .from("product_offers")
    .select("id, data_source")
    .eq("id", id)
    .maybeSingle();

  if (existing) {
    const allowed = [
      "provider_name","provider_mark","provider_website_url","title","subtitle",
      "category","country_codes","affiliate_link","link_type","affiliate_priority_score",
      "is_monetised","status","is_featured","best_for","metrics","attributes","tags","notes",
    ];
    const update: Record<string, unknown> = {};
    // SEC-FIX PAYN-A11: enforce types to prevent corrupt data (CWE-20)
    // Must match the product_offers.status CHECK constraint exactly — "ok" is NOT valid.
    const VALID_STATUSES = new Set(["active", "inactive", "needs_review", "archived"]);
    for (const key of allowed) {
      if (!(key in body)) continue;
      if (key === "affiliate_priority_score") {
        const n = Number(body[key]);
        if (!isFinite(n)) continue;
        update[key] = n;
      } else if (key === "is_monetised" || key === "is_featured") {
        update[key] = Boolean(body[key]);
      } else if (key === "status") {
        if (!VALID_STATUSES.has(String(body[key]))) continue;
        update[key] = body[key];
      } else {
        update[key] = body[key];
      }
    }

    const { data, error } = await admin
      .from("product_offers")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.from("admin_audit_log").insert({
      action: "update_offer", target_id: id, target_type: "offer",
      metadata: { fields: Object.keys(update) },
    });

    revalidateTag("catalog", {});
    return NextResponse.json({ ok: true, offer: data });
  }

  // Static offer — promote to DB with edits
  const staticOffer = marketplaceOffers.find((o) => o.id === id);
  if (!staticOffer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const row = {
    id,
    slug:                   body.slug                    ?? staticOffer.slug,
    provider_name:          body.provider_name           ?? staticOffer.providerName,
    provider_mark:          body.provider_mark           ?? staticOffer.providerMark ?? "",
    provider_website_url:   body.provider_website_url    ?? staticOffer.providerWebsiteUrl ?? "",
    title:                  body.title                   ?? staticOffer.title,
    subtitle:               body.subtitle                ?? staticOffer.subtitle ?? "",
    category:               body.category                ?? staticOffer.category,
    country_codes:          body.country_codes           ?? staticOffer.countryCodes ?? [],
    affiliate_link:         body.affiliate_link          ?? staticOffer.affiliateLink ?? "",
    link_type:              body.link_type               ?? staticOffer.linkType ?? "affiliate_redirect",
    affiliate_priority_score: Number(body.affiliate_priority_score ?? staticOffer.affiliatePriorityScore ?? 0.5),
    is_monetised:           body.is_monetised            ?? Boolean(staticOffer.affiliateLink),
    status:                 body.status                  ?? "active",
    is_featured:            body.is_featured             ?? false,
    best_for:               body.best_for                ?? staticOffer.bestFor ?? [],
    metrics:                body.metrics                 ?? staticOffer.metrics ?? [],
    attributes:             body.attributes              ?? staticOffer.attributes ?? {},
    tags:                   body.tags                    ?? [],
    notes:                  body.notes                   ?? null,
    data_source:            "admin",
  };

  const { data, error } = await admin
    .from("product_offers")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin.from("admin_audit_log").insert({
    action: "update_offer", target_id: id, target_type: "offer",
    metadata: { promoted_from_static: true },
  });

  revalidateTag("catalog", {});
  return NextResponse.json({ ok: true, offer: data });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data: existing } = await admin
    .from("product_offers")
    .select("id, data_source, provider_name, title")
    .eq("id", id)
    .maybeSingle();

  if (existing && existing.data_source !== "static") {
    const { error } = await admin.from("product_offers").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await admin.from("admin_audit_log").insert({
      action: "delete_offer", target_id: id, target_type: "offer",
      metadata: { provider_name: existing.provider_name, title: existing.title },
    });

    revalidateTag("catalog", {});
    return NextResponse.json({ ok: true, deleted: true });
  }

  // Static offer — archive via override
  await admin.from("admin_offer_overrides").upsert(
    { offer_id: id, status: "archived", updated_at: new Date().toISOString() },
    { onConflict: "offer_id" },
  );

  await admin.from("admin_audit_log").insert({
    action: "delete_offer", target_id: id, target_type: "offer_override",
    metadata: { archived_static: true },
  });

  revalidateTag("catalog", {});
  return NextResponse.json({ ok: true, archived: true });
}
