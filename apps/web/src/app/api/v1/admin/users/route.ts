import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

export async function GET(request: NextRequest) {
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const perPage = 50;

  const { data: authData } = await admin.auth.admin.listUsers({
    page,
    perPage,
  });

  const users = authData?.users ?? [];
  const userIds = users.map((u) => u.id);

  const { data: profiles } = userIds.length
    ? await admin.from("user_profiles").select("user_id, first_name, last_name, home_country, user_type, onboarding_completed, created_at, updated_at").in("user_id", userIds) // SEC-FIX PAYN-A22: explicit fields only
    : { data: [] };

  const profileMap = Object.fromEntries(
    (profiles ?? []).map((p) => [p.user_id, p]),
  );

  const rows = users.map((u) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    profile: profileMap[u.id] ?? null,
  }));

  return NextResponse.json({
    users: rows,
    page,
    perPage,
    total: (authData as { total?: number } | null)?.total ?? rows.length,
  });
}
