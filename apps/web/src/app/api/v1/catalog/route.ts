import { NextResponse } from "next/server";
import { buildCanonicalCatalogManifest } from "@/lib/canonical-catalog";

export async function GET() {
  return NextResponse.json(buildCanonicalCatalogManifest(), {
    headers: {
      "cache-control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
