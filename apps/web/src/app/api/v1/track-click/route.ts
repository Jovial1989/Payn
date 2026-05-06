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
    is_monetised,
    outbound_url,
    source_page,
  } = body as {
    offer_id?: string;
    provider_name?: string;
    category?: string;
    country?: string;
    language?: string;
    is_monetised?: boolean;
    outbound_url?: string;
    source_page?: string;
  };

  if (!offer_id || !provider_name) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ ok: true });

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
    is_monetised: is_monetised ?? false,
    outbound_url: outbound_url ?? "",
  });

  return NextResponse.json({ ok: true });
}
