import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const offer = marketplaceOffers.find((o) => o.id === id || o.slug === id);
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let override = null;
  let recentClicks: unknown[] = [];

  if (admin) {
    const { data: ov } = await admin
      .from("admin_offer_overrides")
      .select("*")
      .eq("offer_id", id)
      .maybeSingle();
    override = ov;

    const { data: clicks } = await admin
      .from("offer_click_events")
      .select("id, country, category, language, device_type, source_page, is_monetised, created_at")
      .eq("offer_id", id)
      .order("created_at", { ascending: false })
      .limit(50);
    recentClicks = clicks ?? [];
  }

  return NextResponse.json({ offer, override, recentClicks });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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
