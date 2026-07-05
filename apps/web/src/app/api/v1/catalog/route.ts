import { NextResponse } from "next/server";
import { buildCanonicalCatalogManifest } from "@/lib/canonical-catalog";

export async function GET() {
  try {
    return NextResponse.json(await buildCanonicalCatalogManifest(), {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[catalog] error:", message, stack);
    return NextResponse.json({ error: "catalog_unavailable" }, { status: 500 });
  }
}
