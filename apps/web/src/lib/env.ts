export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  adminUsername: process.env.ADMIN_USERNAME ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  // SEC-FIX PAYN-A24: adminSessionSecret removed — use getSecret() in admin-auth-edge.ts directly
adminApiToken: process.env.ADMIN_API_TOKEN ?? "",
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS ?? "Payn <noreply@payn.online>",
  emailReplyTo: process.env.EMAIL_REPLY_TO ?? "support@payn.online",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://www.payn.online",
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET ?? "",
};
