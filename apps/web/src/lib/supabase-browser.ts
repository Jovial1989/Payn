import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const url = env.supabaseUrl || "https://placeholder.supabase.co";
  const key = env.supabaseAnonKey || "placeholder-key";
  return createBrowserClient(url, key);
}

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
