import { NextResponse } from "next/server";
import { checkAdminToken } from "@/lib/admin-api-auth";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { marketplaceOffers } from "@/features/catalog/marketplace-offers";

type LinkResult = {
  id: string;
  provider: string;
  url: string;
  status: number | "timeout" | "error";
  ok: boolean;
  redirected_to?: string;
};

async function probeUrl(url: string): Promise<{ status: number | "timeout" | "error"; redirected_to?: string }> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "Payn-LinkChecker/1.0" },
    });
    clearTimeout(t);
    const redirected_to = res.url !== url ? res.url : undefined;
    return { status: res.status, redirected_to };
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") return { status: "timeout" };
    return { status: "error" };
  }
}

export async function POST(request: Request) {
  const denied = checkAdminToken(request);
  if (denied) return denied;

  // Pull affiliate links from DB if available, fall back to static catalog
  const admin = createSupabaseAdminClient();
  let links: Array<{ id: string; provider_name: string; affiliate_link: string }> = [];

  if (admin) {
    const { data } = await admin
      .from("product_offers")
      .select("id, provider_name, affiliate_link")
      .eq("status", "active")
      .neq("affiliate_link", "");
    links = data ?? [];
  }

  if (links.length === 0) {
    links = marketplaceOffers
      .filter((o) => o.affiliateLink)
      .map((o) => ({ id: o.id, provider_name: o.providerName, affiliate_link: o.affiliateLink! }));
  }

  // Probe in batches of 10 to avoid overwhelming the server
  const results: LinkResult[] = [];
  const batchSize = 10;

  for (let i = 0; i < links.length; i += batchSize) {
    const batch = links.slice(i, i + batchSize);
    const settled = await Promise.all(
      batch.map(async (l) => {
        const probe = await probeUrl(l.affiliate_link);
        return {
          id: l.id,
          provider: l.provider_name,
          url: l.affiliate_link,
          status: probe.status,
          ok: typeof probe.status === "number" && probe.status < 400,
          redirected_to: probe.redirected_to,
        } satisfies LinkResult;
      }),
    );
    results.push(...settled);
  }

  const dead = results.filter((r) => !r.ok);
  const summary = {
    checked: results.length,
    ok: results.filter((r) => r.ok).length,
    dead: dead.length,
    timeout: results.filter((r) => r.status === "timeout").length,
    redirected: results.filter((r) => r.redirected_to).length,
  };

  if (admin) {
    await admin.from("admin_audit_log").insert({
      action: "check_links",
      metadata: summary,
    });
  }

  return NextResponse.json({ ...summary, dead_links: dead });
}
