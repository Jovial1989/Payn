import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// DELETE /api/admin/users/:id
// GDPR right-to-erasure: deletes all personal data for a user.
// Cascades: user_profiles, saved_offers, offer_click_events, device_tokens.
// Auth user record is deleted last via Supabase admin API.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id: userId } = await params;
  if (!userId) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  // Delete application data (FK cascades handle most, but be explicit)
  const tables = ["saved_offers", "offer_click_events", "device_tokens", "user_profiles"] as const;
  for (const table of tables) {
    const { error } = await admin.from(table).delete().eq("user_id", userId);
    if (error && !error.message.includes("does not exist")) {
      return NextResponse.json({ error: `Failed deleting ${table}: ${error.message}` }, { status: 500 });
    }
  }

  // Delete the Supabase auth user
  const { error: authError } = await admin.auth.admin.deleteUser(userId);
  if (authError) {
    return NextResponse.json({ error: `Auth delete failed: ${authError.message}` }, { status: 500 });
  }

  await admin.from("admin_audit_log").insert({
    action: "gdpr_delete_user",
    target_id: userId,
    target_type: "user",
    metadata: { tables_cleared: tables },
  });

  return NextResponse.json({ ok: true, deleted_user_id: userId });
}
