import { createElement } from "react";
import { NextRequest, NextResponse } from "next/server";
import type { MarketplaceOffer } from "@payn/types";
import RateAlertEmail from "@/emails/rate-alert";
import { sendEmail } from "@/lib/email/resend";
import { renderEmail } from "@/lib/email/render";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { listMarketplaceOffers } from "@/server/catalog/catalog-service";

export const dynamic = "force-dynamic";

interface RateAlert {
  id: string;
  user_id: string;
  category: string;
  country: string;
  metric: string;
  operator: "above" | "below";
  threshold: number;
  label: string;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

function extractMetricValue(offer: MarketplaceOffer, metric: string): number | null {
  if (metric === "fx_fee") return offer.attributes?.fxFeePercent ?? null;
  if (metric === "annual_fee") return offer.attributes?.annualFeeAmount ?? null;

  const target =
    metric === "rate"
      ? ["AER", "APY", "interest", "rate"]
      : ["APR", "interest rate"];

  for (const m of offer.metrics) {
    if (target.some((t) => m.label.toLowerCase().includes(t.toLowerCase()))) {
      const match = m.value.match(/(\d+(?:\.\d+)?)/);
      if (match) return parseFloat(match[1]);
    }
  }
  return null;
}

function getMatchingOffers(alert: RateAlert, offers: MarketplaceOffer[]): MarketplaceOffer[] {
  return offers.filter((offer) => {
    if (offer.category !== alert.category) return false;
    if (
      !(
        (offer.countryCodes as string[]).includes(alert.country) ||
        (offer.countryCodes as string[]).includes("EU") ||
        (offer.countryCodes as string[]).includes("ALL")
      )
    ) {
      return false;
    }
    const value = extractMetricValue(offer, alert.metric);
    if (value === null) return false;
    return alert.operator === "above"
      ? value > alert.threshold
      : value < alert.threshold;
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${env.adminApiToken}`;

  if (!env.adminApiToken || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { data: alerts, error: alertsError } = await admin
    .from("rate_alerts")
    .select("*")
    .eq("is_active", true);

  if (alertsError) {
    return NextResponse.json({ error: alertsError.message }, { status: 500 });
  }

  const activeAlerts = (alerts ?? []) as RateAlert[];
  if (activeAlerts.length === 0) {
    return NextResponse.json({ processed: 0, triggered: 0 });
  }

  const allOffers = await listMarketplaceOffers();

  let processed = 0;
  let triggered = 0;
  const twentyThreeHoursAgo = new Date(Date.now() - 23 * 60 * 60 * 1000);

  for (const alert of activeAlerts) {
    processed++;

    // Skip if triggered within the last 23 hours
    if (
      alert.last_triggered_at &&
      new Date(alert.last_triggered_at) > twentyThreeHoursAgo
    ) {
      continue;
    }

    const matchingOffers = getMatchingOffers(alert, allOffers);
    if (matchingOffers.length === 0) continue;

    const bestMatch = matchingOffers[0];
    const extractedValue = extractMetricValue(bestMatch, alert.metric);

    // Get user email from admin auth
    const { data: userData, error: userError } =
      await admin.auth.admin.getUserById(alert.user_id);

    if (userError || !userData.user?.email) continue;

    const userEmail = userData.user.email;

    try {
      const { html, text } = await renderEmail(
        createElement(RateAlertEmail, {
          firstName: undefined,
          providerName: bestMatch.providerName,
          productName: bestMatch.title,
          oldRate: `${alert.threshold}%`,
          newRate: extractedValue !== null ? `${extractedValue}%` : "—",
          productUrl: `${env.appUrl}/en/offers/${bestMatch.slug}`,
          unsubscribeUrl: `${env.appUrl}/api/email/unsubscribe`,
        }),
      );

      await sendEmail({
        to: userEmail,
        subject: `Rate alert: ${alert.label}`,
        html,
        text,
        tags: [{ name: "type", value: "rate-alert" }],
      });

      await admin
        .from("rate_alerts")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", alert.id);

      triggered++;
    } catch (err) {
      console.error(`[check-alerts] Failed to send alert ${alert.id}:`, err);
    }
  }

  return NextResponse.json({ processed, triggered });
}
