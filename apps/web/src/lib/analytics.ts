"use client";

import amplitude from "@/amplitude";

export const AnalyticsEvent = {
  LandingViewed: "Landing Viewed",
  DiscoverViewed: "Discover Viewed",
  CategoryViewed: "Category Viewed",
  OfferDetailsViewed: "Offer Details Viewed",
  ProviderClicked: "Provider Clicked",
  OfferSaved: "Offer Saved",
  CompareStarted: "Compare Started",
  CompareViewed: "Compare Viewed",
  SignInClicked: "Sign In Clicked",
  DashboardViewed: "Dashboard Viewed",
  SettingsViewed: "Settings Viewed",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];
export type AnalyticsProperties = Record<string, unknown>;

declare global {
  interface Window {
    __paynAnalyticsTrackedAt?: Record<string, number>;
  }
}

type WebAnalyticsOptions = {
  asset?: string | null;
  category?: string | null;
  country?: string | null;
  language?: string | null;
  loggedIn?: boolean;
  offerId?: string | null;
  provider?: string | null;
};

export function buildWebAnalyticsProperties({
  asset,
  category,
  country,
  language,
  loggedIn,
  offerId,
  provider,
}: WebAnalyticsOptions = {}): AnalyticsProperties {
  return sanitizeAnalyticsProperties({
    country,
    language,
    category,
    offer_id: offerId,
    provider,
    asset,
    logged_in: loggedIn,
    platform: "web",
  });
}

export function sanitizeAnalyticsProperties(
  properties: AnalyticsProperties = {},
): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined),
  );
}

export function serializeAnalyticsProperties(
  properties: AnalyticsProperties = {},
): string {
  return JSON.stringify(sanitizeAnalyticsProperties(properties));
}

export function trackAnalyticsEvent(
  eventName: AnalyticsEventName,
  properties: AnalyticsProperties = {},
) {
  if (typeof window === "undefined") {
    return;
  }

  amplitude.track(eventName, sanitizeAnalyticsProperties(properties));
}

export function trackAnalyticsOnce({
  dedupeKey,
  eventName,
  properties = {},
  ttlMs = 1000,
}: {
  dedupeKey: string;
  eventName: AnalyticsEventName;
  properties?: AnalyticsProperties;
  ttlMs?: number;
}) {
  if (typeof window === "undefined") {
    return;
  }

  const now = Date.now();
  const trackedAt = (window.__paynAnalyticsTrackedAt ??= {});
  const lastTrackedAt = trackedAt[dedupeKey];

  if (lastTrackedAt && now - lastTrackedAt < ttlMs) {
    return;
  }

  trackedAt[dedupeKey] = now;
  trackAnalyticsEvent(eventName, properties);
}

export function trackSignInClicked(options: WebAnalyticsOptions = {}) {
  trackAnalyticsEvent(
    AnalyticsEvent.SignInClicked,
    buildWebAnalyticsProperties(options),
  );
}
