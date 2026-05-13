import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function GET(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const filtered = (data?.users ?? [])
    .filter((u) => u.email?.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 50)
    .map((u) => ({ id: u.id, email: u.email ?? "" }));

  return NextResponse.json(filtered);
}
