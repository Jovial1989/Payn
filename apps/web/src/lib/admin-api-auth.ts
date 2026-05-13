import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export function checkAdminToken(request: Request): NextResponse | null {
  const token = request.headers.get("x-admin-token");
  if (!env.adminApiToken || token !== env.adminApiToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
