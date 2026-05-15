import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// POST /api/v1/admin/offers/reset-monetised
// Sets is_monetised=false on every row. Run after seeding to clear the
// compliance-incorrect default. Re-enable individual offers via the admin UI.
export async function POST() {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { error } = await admin
    .from("product_offers")
    .update({ is_monetised: false })
    .neq("id", "");

  const { count } = await admin
    .from("product_offers")
    .select("*", { count: "exact", head: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await admin.from("admin_audit_log").insert({
    action: "reset_monetised",
    metadata: { affected: count ?? 0 },
  });

  return NextResponse.json({ ok: true, reset: count ?? 0 });
}
