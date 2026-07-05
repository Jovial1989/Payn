import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: string };

  const allowed = ["failed"] as const;
  if (!body.status || !allowed.includes(body.status as "failed")) {
    return NextResponse.json({ error: "Only 'failed' status override is allowed" }, { status: 400 });
  }

  const { error } = await admin.from("email_messages").update({ status: body.status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
