import { NextResponse } from "next/server";
import type { UserProfile } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/supabase-browser";
import { getDashboardInsights } from "@/server/dashboard/dashboard-service";
import { createSupabaseServerClient } from "@/server/supabase/client";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "Dashboard data is unavailable until Supabase is configured." },
      { status: 503 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const insights = await getDashboardInsights({
    supabase,
    userId: user.id,
    profile: profile as UserProfile,
  });

  return NextResponse.json(insights, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
