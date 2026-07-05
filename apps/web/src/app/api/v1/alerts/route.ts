import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/server/supabase/client";

export interface RateAlert {
  id: string;
  user_id: string;
  category: string;
  country: string;
  metric: string;
  operator: "above" | "below";
  threshold: number;
  label: string;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("rate_alerts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alerts: (data ?? []) as RateAlert[] });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as {
    category?: string;
    country?: string;
    metric?: string;
    operator?: string;
    threshold?: number;
    label?: string;
  } | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { category, country, metric, operator, threshold, label } = body;

  if (!category || !country || !metric || !operator || threshold === undefined || !label) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (operator !== "above" && operator !== "below") {
    return NextResponse.json({ error: "operator must be 'above' or 'below'" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("rate_alerts")
    .insert({
      user_id: user.id,
      category,
      country,
      metric,
      operator,
      threshold,
      label,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ alert: data as RateAlert }, { status: 201 });
}
