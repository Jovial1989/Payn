import { Resend } from "resend";
import { env } from "@/lib/env";

let client: Resend | null = null;

export function getResendClient(): Resend {
  if (client) return client;
  if (!env.resendApiKey) throw new Error("RESEND_API_KEY is not set in environment");
  client = new Resend(env.resendApiKey);
  return client;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
  headers?: Record<string, string>;
  campaignId?: string;
  templateId?: string;
}

export async function sendEmail(params: SendEmailParams) {
  const resend = getResendClient();

  const headers: Record<string, string> = { ...(params.headers ?? {}) };
  if (params.campaignId) headers["X-Campaign-ID"] = params.campaignId;
  if (params.templateId) headers["X-Template-ID"] = params.templateId;

  return resend.emails.send({
    from: params.from ?? env.emailFromAddress,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
    replyTo: params.replyTo ?? env.emailReplyTo,
    tags: params.tags,
    headers: Object.keys(headers).length ? headers : undefined,
  });
}
