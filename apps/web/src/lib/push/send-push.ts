import { getFirebaseApp } from "@/lib/push/firebase";

export type PushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
};

export type SendPushResult = {
  successCount: number;
  failureCount: number;
  invalidTokens: string[];
  responses: Array<{ token: string; messageId?: string; error?: string }>;
};

const FCM_INVALID_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
]);

export async function sendPush(tokens: string[], payload: PushPayload): Promise<SendPushResult> {
  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokens: [], responses: [] };
  }

  const app = getFirebaseApp();
  const { getMessaging } = require("firebase-admin/messaging") as typeof import("firebase-admin/messaging");
  const messaging = getMessaging(app);

  const message = {
    notification: { title: payload.title, body: payload.body, ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}) },
    data: payload.data,
  };

  const result = await messaging.sendEachForMulticast({ tokens, ...message });

  const responses: SendPushResult["responses"] = [];
  const invalidTokens: string[] = [];

  result.responses.forEach((r, i) => {
    const token = tokens[i]!;
    if (r.success) {
      responses.push({ token, messageId: r.messageId });
    } else {
      const code = r.error?.code ?? "";
      responses.push({ token, error: code });
      if (FCM_INVALID_CODES.has(code)) invalidTokens.push(token);
    }
  });

  return {
    successCount: result.successCount,
    failureCount: result.failureCount,
    invalidTokens,
    responses,
  };
}
