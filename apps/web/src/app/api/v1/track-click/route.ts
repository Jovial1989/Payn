import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { createSupabaseServerClient } from "@/server/supabase/client";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const {
    offer_id,
    provider_name,
    category,
    country,
    language,
    outbound_url,
    source_page,
  } = body as {
    offer_id?: string;
    provider_name?: string;
    category?: string;
    country?: string;
    language?: string;
    outbound_url?: string;
    source_page?: string;
  };

  if (!offer_id || !provider_name) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ ok: true });

  // SEC-FIX PAYN-008-CLICK: look up is_monetised server-side — never trust
  // client-supplied value as it would allow arbitrary revenue metric corruption.
  let isMonetised = false;
  try {
    const { data: offerRow } = await admin
      .from("product_offers")
      .select("is_monetised")
      .eq("id", offer_id)
      .maybeSingle<{ is_monetised: boolean }>();
    // SEC-FIX PAYN-A19: reject clicks for non-existent offers to prevent analytics pollution
    if (!offerRow) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }
    isMonetised = offerRow.is_monetised ?? false;
  } catch {
    // non-fatal — default to false
  }

  const ua = request.headers.get("user-agent") ?? "";
  const deviceType = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";

  let userId: string | null = null;
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // anonymous click — fine
  }

  const sessionId = crypto.randomUUID();

  await admin.from("offer_click_events").insert({
    offer_id,
    provider_id: provider_name,
    user_id: userId,
    session_id: sessionId,
    country: country ?? "",
    category: category ?? "",
    language: language ?? "en",
    device_type: deviceType,
    source_page: source_page ?? "",
    is_monetised: isMonetised,
    outbound_url: outbound_url ?? "",
  });

  return NextResponse.json({ ok: true });
}
