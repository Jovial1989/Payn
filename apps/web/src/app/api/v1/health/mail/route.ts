import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { getResendClient } from "@/lib/email/resend";

// Health check for the mail stack. Surfaces (without leaking secrets):
//   • which env vars are set / missing,
//   • whether the Resend API key actually authenticates (live ping
//     against domains.list — read-only, no email is sent),
//   • the list of sending domains and their verification status,
//   • a 24h tally of email_messages by status so failed sends surface.
//
// Public scope deliberately — the response only echoes booleans and
// non-sensitive metadata (domain names + verification statuses + counts).
// No tokens, no email addresses, no message contents.
//
// Use this endpoint to confirm Resend config WITHOUT spamming yourself
// with test emails: hit GET /api/v1/health/mail after each Vercel env
// change and read the JSON.

export const dynamic = "force-dynamic";

type DomainSummary = {
  name: string;
  status: string;
  region?: string;
};

type StatusTally = Record<string, number>;

export async function GET() {
  const envState = {
    resendApiKey: Boolean(env.resendApiKey),
    emailFromAddress: env.emailFromAddress,
    emailReplyTo: env.emailReplyTo,
    resendWebhookSecret: Boolean(env.resendWebhookSecret),
  };

  const result: {
    status: "ok" | "degraded" | "down";
    env: typeof envState;
    resend: {
      reachable: boolean;
      error: string | null;
      domains: DomainSummary[];
    };
    db: {
      reachable: boolean;
      last24h: StatusTally | null;
      error: string | null;
    };
    recommendation: string[];
  } = {
    status: "ok",
    env: envState,
    resend: { reachable: false, error: null, domains: [] },
    db: { reachable: false, last24h: null, error: null },
    recommendation: [],
  };

  // ── Resend API ping ────────────────────────────────────────────────────────
  if (!env.resendApiKey) {
    result.resend.error = "RESEND_API_KEY not configured";
    result.recommendation.push(
      "Set RESEND_API_KEY in Vercel env (Production + Preview).",
    );
  } else {
    try {
      const resend = getResendClient();
      const { data, error } = await resend.domains.list();
      if (error) {
        result.resend.error = error.message ?? "Resend API rejected the key";
        result.recommendation.push(
          "Re-issue RESEND_API_KEY from resend.com and update the Vercel env var.",
        );
      } else {
        result.resend.reachable = true;
        result.resend.domains = (data?.data ?? []).map((d) => ({
          name: d.name,
          status: d.status,
          region: d.region,
        }));
        const verified = result.resend.domains.filter(
          (d) => d.status === "verified",
        );
        if (verified.length === 0) {
          result.recommendation.push(
            "No sending domain is verified yet. Add + verify a domain in resend.com so emails can leave.",
          );
        }
        const fromHost = (envState.emailFromAddress.match(/@([^>\s]+)/) ?? [])[1];
        if (
          fromHost &&
          verified.length > 0 &&
          !verified.some((d) => fromHost === d.name || fromHost.endsWith(`.${d.name}`))
        ) {
          result.recommendation.push(
            `EMAIL_FROM_ADDRESS host "${fromHost}" doesn't match any verified domain (${verified.map((v) => v.name).join(", ")}).`,
          );
        }
      }
    } catch (e) {
      result.resend.error = e instanceof Error ? e.message : String(e);
    }
  }

  if (!envState.resendWebhookSecret) {
    result.recommendation.push(
      "Set RESEND_WEBHOOK_SECRET so the /api/webhooks/resend handler can verify delivery / open / click events.",
    );
  }

  // ── DB tally — last 24h of email_messages by status ───────────────────────
  const admin = createSupabaseAdminClient();
  if (!admin) {
    result.db.error = "Supabase admin client unavailable";
  } else {
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await admin
        .from("email_messages")
        .select("status")
        .gte("created_at", since);
      if (error) {
        result.db.error = error.message;
      } else {
        result.db.reachable = true;
        const tally: StatusTally = {};
        for (const row of data ?? []) {
          const s = (row as { status: string }).status;
          tally[s] = (tally[s] ?? 0) + 1;
        }
        result.db.last24h = tally;
        if ((tally.failed ?? 0) > 0) {
          result.recommendation.push(
            `${tally.failed} email_messages rows have status=failed in the last 24h — inspect /admin/mail for the error column.`,
          );
        }
      }
    } catch (e) {
      result.db.error = e instanceof Error ? e.message : String(e);
    }
  }

  // ── Overall status ────────────────────────────────────────────────────────
  if (!envState.resendApiKey || !result.resend.reachable) {
    result.status = "down";
  } else if (result.recommendation.length > 0) {
    result.status = "degraded";
  }

  return NextResponse.json(result, {
    headers: { "cache-control": "no-store" },
  });
}
