"use client";

import { useEffect, useRef } from "react";
import {
  type AnalyticsEventName,
  type AnalyticsProperties,
  serializeAnalyticsProperties,
  trackAnalyticsOnce,
} from "@/lib/analytics";

export function AnalyticsPageView({
  eventName,
  dedupeKey,
  properties,
  ready = true,
}: {
  eventName: AnalyticsEventName;
  dedupeKey: string;
  properties?: AnalyticsProperties;
  ready?: boolean;
}) {
  const lastTrackedKeyRef = useRef<string | null>(null);
  const propertiesKey = serializeAnalyticsProperties(properties);

  useEffect(() => {
    if (!ready || lastTrackedKeyRef.current === dedupeKey) {
      return;
    }

    lastTrackedKeyRef.current = dedupeKey;

    trackAnalyticsOnce({
      dedupeKey: `page:${dedupeKey}`,
      eventName,
      properties,
    });
  }, [dedupeKey, eventName, properties, propertiesKey, ready]);

  return null;
}
