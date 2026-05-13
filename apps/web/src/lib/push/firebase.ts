import { env } from "@/lib/env";

// Lazy-initialised Firebase Admin app. Safe to call multiple times.
let _app: import("firebase-admin/app").App | null = null;

export function getFirebaseApp(): import("firebase-admin/app").App {
  if (_app) return _app;

  const raw = env.firebaseServiceAccount;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");

  const credential = JSON.parse(raw) as import("firebase-admin").ServiceAccount;

  const { initializeApp, getApps, cert } = require("firebase-admin/app") as typeof import("firebase-admin/app");

  if (getApps().length > 0) {
    _app = getApps()[0]!;
    return _app;
  }

  _app = initializeApp({ credential: cert(credential) });
  return _app;
}
