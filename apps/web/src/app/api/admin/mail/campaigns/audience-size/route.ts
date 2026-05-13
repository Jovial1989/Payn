import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

type AudienceFilter = {
  countries?: string[];
  languages?: string[];
  marketing_opt_in?: boolean;
  last_active_days?: number | null;
};

export async function POST(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as AudienceFilter;

  let q = admin
    .from("email_preferences")
    .select("*", { count: "exact", head: true })
    .eq("transactional_opt_in", true);

  if (body.marketing_opt_in) q = q.eq("marketing_opt_in", true);
  if (body.countries?.length) q = q.in("country", body.countries);
  if (body.languages?.length) q = q.in("language", body.languages);

  const { count, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ count: count ?? 0 });
}
