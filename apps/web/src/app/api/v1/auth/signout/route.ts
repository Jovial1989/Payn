import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/server/supabase/client";

export async function POST() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return NextResponse.json({ ok: true }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}

