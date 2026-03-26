import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const allowedPlatforms = new Set(["ios", "android", "both"]);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    email?: string;
    platform?: string;
    source?: string;
  } | null;

  const email = normalizeEmail(payload?.email ?? "");
  const platform = allowedPlatforms.has(payload?.platform ?? "") ? payload?.platform ?? "both" : "both";
  const source = typeof payload?.source === "string" && payload.source.trim() ? payload.source.trim() : "website";

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return NextResponse.json(
      { error: "Waitlist is being configured. Please email us directly for early access." },
      { status: 503 },
    );
  }

  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { error } = await supabase.from("app_waitlist").insert({
    email,
    platform,
    source,
  });

  if (error?.code === "23505") {
    return NextResponse.json({ message: "You are already on the waitlist for that platform." });
  }

  if (error) {
    return NextResponse.json(
      { error: "Could not save your waitlist request right now. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "You are on the waitlist. We will email you when mobile access opens." });
}
