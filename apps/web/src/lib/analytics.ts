"use client";

import amplitude from "@/amplitude";

// ─── gtag type shim ──────────────────────────────────────────────────────────
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
    __paynAnalyticsTrackedAt?: Record<string, number>;
  }
}

function gtagEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined" || !window.gtag) return;
  // GA4 event names must be snake_case ≤ 40 chars
  const gaName = eventName
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .slice(0, 40);
  window.gtag("event", gaName, properties);
}

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
  SignUpStarted: "Sign Up Started",
  SignUpCompleted: "Sign Up Completed",
  SignInCompleted: "Sign In Completed",
  OAuthStarted: "OAuth Started",
  SearchUsed: "Search Used",
  FilterApplied: "Filter Applied",
  CountryChanged: "Country Changed",
  OfferSavedRemoved: "Offer Saved Removed",
  CompareAdded: "Compare Added",
  CompareRemoved: "Compare Removed",
  ChatOpened: "Chat Opened",
  ChatMessageSent: "Chat Message Sent",
  WaitlistJoined: "Waitlist Joined",
  OnboardingCompleted: "Onboarding Completed",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];
export type AnalyticsProperties = Record<string, unknown>;

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
    logged_in: loggedIn ? "true" : "false",
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
  if (typeof window === "undefined") return;
  const clean = sanitizeAnalyticsProperties(properties);
  amplitude.track(eventName, clean);
  gtagEvent(eventName, clean);
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
