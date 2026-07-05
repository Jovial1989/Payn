import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

type AudienceFilter = {
  audience_countries?: string[];
  audience_languages?: string[];
  audience_last_active_days?: number | null;
};

export async function POST(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as AudienceFilter;

  // Count real, active device tokens that match the campaign filters.
  // device_tokens columns: country, locale, is_active, last_seen_at.
  let q = admin
    .from("device_tokens")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  if (body.audience_countries?.length) q = q.in("country", body.audience_countries);
  if (body.audience_languages?.length) q = q.in("locale", body.audience_languages);
  if (body.audience_last_active_days && body.audience_last_active_days > 0) {
    const since = new Date(
      Date.now() - body.audience_last_active_days * 24 * 60 * 60 * 1000,
    ).toISOString();
    q = q.gte("last_seen_at", since);
  }

  const { count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ size: count ?? 0 });
}
