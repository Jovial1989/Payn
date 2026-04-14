"use client";

import * as amplitude from "@amplitude/unified";

declare global {
  interface Window {
    __paynAmplitudeInitialized?: boolean;
  }
}

function initAmplitude() {
  if (typeof window !== "undefined" && !window.__paynAmplitudeInitialized) {
    window.__paynAmplitudeInitialized = true;
    void amplitude.initAll("84cb1925d4b2677d8d13d29ae4f9fb46", {
      serverZone: "EU",
      analytics: { autocapture: true },
      sessionReplay: { sampleRate: 1 },
    });
  }
}

initAmplitude();

export const Amplitude = () => null;
export default amplitude;
