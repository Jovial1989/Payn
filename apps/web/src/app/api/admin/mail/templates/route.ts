import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

const ALLOWED_CATEGORIES = ["transactional", "marketing", "custom"] as const;
type Category = (typeof ALLOWED_CATEGORIES)[number];

// Detects the "relation does not exist" condition across the various shapes
// Supabase / PostgREST report it (raw Postgres 42P01, PostgREST schema-cache
// PGRST205, or a generic message). Mirrors the Featured page graceful-degrade.
function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /does not exist/i.test(error.message ?? "")
  );
}

export async function GET(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data, error } = await admin
    .from("email_custom_templates")
    .select("id, name, description, subject, category, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json({ templates: [], tableMissing: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ templates: data ?? [] });
}

export async function POST(request: Request) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    description?: string;
    subject?: string;
    html?: string;
    category?: string;
  };

  const name = body.name?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const html = body.html ?? "";
  const description = body.description?.trim() ?? "";
  const category = (body.category?.trim() || "custom") as Category;

  if (!name || !subject || !html.trim()) {
    return NextResponse.json(
      { error: "Name, subject and HTML are required." },
      { status: 400 },
    );
  }
  if (!(ALLOWED_CATEGORIES as readonly string[]).includes(category)) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("email_custom_templates")
    .insert({ name, description, subject, html, category })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "Custom templates table not created yet.", tableMissing: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
