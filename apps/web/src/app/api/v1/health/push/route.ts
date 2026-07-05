import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

// Health check for the push notification stack — parallel to the mail
// one. Surfaces (without leaking secrets):
//   • whether FIREBASE_SERVICE_ACCOUNT_JSON parses + which project_id it
//     belongs to (so it's obvious you picked the right Firebase project),
//   • whether Firebase Admin SDK can boot (lazy require — failure here
//     means the service account is invalid),
//   • whether the device_tokens / push_campaigns tables exist,
//   • 24h send tally so failed pushes surface,
//   • count of active device tokens by platform.
//
// Public scope: we only echo booleans and non-secret metadata. The
// project_id is in every Firebase config file the mobile app ships, so
// it's effectively public anyway.

export const dynamic = "force-dynamic";

type TokenTally = { ios: number; android: number; web: number; total: number };

export async function GET() {
  const result: {
    status: "ok" | "degraded" | "down";
    env: {
      firebaseServiceAccount: boolean;
      projectId: string | null;
      serviceAccountPresent: boolean; // SEC-FIX PAYN-A20: never expose SA email in API response
    };
    firebase: { reachable: boolean; error: string | null };
    db: {
      reachable: boolean;
      tokens: TokenTally | null;
      campaignsLast24h: number | null;
      error: string | null;
    };
    recommendation: string[];
  } = {
    status: "ok",
    env: {
      firebaseServiceAccount: false,
      projectId: null,
      serviceAccountPresent: false, // SEC-FIX PAYN-A20: never expose SA email in API response
    },
    firebase: { reachable: false, error: null },
    db: { reachable: false, tokens: null, campaignsLast24h: null, error: null },
    recommendation: [],
  };

  // ── Service account env ──────────────────────────────────────────────────
  if (!env.firebaseServiceAccount) {
    result.env.firebaseServiceAccount = false;
    result.firebase.error = "FIREBASE_SERVICE_ACCOUNT_JSON not configured";
    result.recommendation.push(
      "Set FIREBASE_SERVICE_ACCOUNT_JSON in Vercel env (Production + Preview).",
    );
  } else {
    result.env.firebaseServiceAccount = true;
    try {
      const parsed = JSON.parse(env.firebaseServiceAccount) as {
        project_id?: string;
        client_email?: string;
      };
      result.env.projectId = parsed.project_id ?? null;
      result.env.serviceAccountPresent = Boolean(parsed.client_email); // SEC-FIX PAYN-A20: never expose SA email in API response

      // Lazy require firebase-admin so this endpoint stays cheap when the
      // service account isn't configured yet.
      try {
        const { getFirebaseApp } = (await import(
          "@/lib/push/firebase"
        )) as typeof import("@/lib/push/firebase");
        const app = getFirebaseApp();
        result.firebase.reachable = Boolean(app);
      } catch (e) {
        result.firebase.error =
          e instanceof Error ? e.message : String(e);
        result.recommendation.push(
          "firebase-admin failed to init — verify the service account JSON is valid and matches the project.",
        );
      }
    } catch (e) {
      result.firebase.error = `Service account JSON parse failed: ${e instanceof Error ? e.message : String(e)}`;
      result.recommendation.push(
        "Re-paste FIREBASE_SERVICE_ACCOUNT_JSON in Vercel — current value isn't valid JSON.",
      );
    }
  }

  // ── DB sweep ────────────────────────────────────────────────────────────
  const admin = createSupabaseAdminClient();
  if (!admin) {
    result.db.error = "Supabase admin client unavailable";
  } else {
    try {
      const { data: tokens, error: tokensError } = await admin
        .from("device_tokens")
        .select("platform")
        .eq("is_active", true);
      if (tokensError) {
        result.db.error = tokensError.message;
        if (/relation .* does not exist/i.test(tokensError.message)) {
          result.recommendation.push(
            "Apply the push migration: supabase/migrations/20260513000000_device_tokens_push_campaigns.sql",
          );
        }
      } else {
        result.db.reachable = true;
        const tally: TokenTally = { ios: 0, android: 0, web: 0, total: 0 };
        for (const row of tokens ?? []) {
          const platform = (row as { platform: string }).platform;
          if (platform === "ios") tally.ios += 1;
          else if (platform === "android") tally.android += 1;
          else if (platform === "web") tally.web += 1;
          tally.total += 1;
        }
        result.db.tokens = tally;
        if (tally.total === 0) {
          result.recommendation.push(
            "No active device tokens yet — install the app on a real iOS or Android device and grant push permission.",
          );
        }
      }
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("push_campaigns")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since);
      result.db.campaignsLast24h = count ?? 0;
    } catch (e) {
      result.db.error = e instanceof Error ? e.message : String(e);
    }
  }

  // ── Overall status ──────────────────────────────────────────────────────
  if (!result.env.firebaseServiceAccount || !result.firebase.reachable) {
    result.status = "down";
  } else if (result.recommendation.length > 0) {
    result.status = "degraded";
  }

  return NextResponse.json(result, {
    headers: { "cache-control": "no-store" },
  });
}
