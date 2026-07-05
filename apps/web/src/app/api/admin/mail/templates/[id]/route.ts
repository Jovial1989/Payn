import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

const ALLOWED_CATEGORIES = ["transactional", "marketing", "custom"] as const;

function isMissingTable(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /does not exist/i.test(error.message ?? "")
  );
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const { data, error } = await admin
    .from("email_custom_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "Custom templates table not created yet.", tableMissing: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    description?: string;
    subject?: string;
    html?: string;
    category?: string;
  };

  const update: Record<string, string> = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    update.name = name;
  }
  if (body.description !== undefined) update.description = body.description;
  if (body.subject !== undefined) {
    const subject = body.subject.trim();
    if (!subject) return NextResponse.json({ error: "Subject cannot be empty." }, { status: 400 });
    update.subject = subject;
  }
  if (body.html !== undefined) {
    if (!body.html.trim()) return NextResponse.json({ error: "HTML cannot be empty." }, { status: 400 });
    update.html = body.html;
  }
  if (body.category !== undefined) {
    if (!(ALLOWED_CATEGORIES as readonly string[]).includes(body.category)) {
      return NextResponse.json({ error: "Invalid category." }, { status: 400 });
    }
    update.category = body.category;
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await admin.from("email_custom_templates").update(update).eq("id", id);
  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "Custom templates table not created yet.", tableMissing: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await checkAdminToken(request);
  if (denied) return denied;

  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { id } = await params;
  const { error } = await admin.from("email_custom_templates").delete().eq("id", id);
  if (error) {
    if (isMissingTable(error)) {
      return NextResponse.json(
        { error: "Custom templates table not created yet.", tableMissing: true },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
