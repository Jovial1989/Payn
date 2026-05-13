import { createSupabaseAdminClient } from "@/server/supabase/admin";

export type Highlight = {
  id: string;
  title: string;
  body: string;
  kind: "rate_change" | "new_launch" | "new_provider" | "feature_update";
  country: string | null;
  offer_id: string | null;
  cta_text: string;
  cta_url: string | null;
  is_active: boolean;
  published_at: string;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
};

export async function getActiveHighlights(country: string, limit = 6): Promise<Highlight[]> {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const now = new Date().toISOString();
  const upper = country.toUpperCase();

  const { data } = await admin
    .from("home_highlights")
    .select("*")
    .eq("is_active", true)
    .or(`country.is.null,country.eq.${upper}`)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .lte("published_at", now)
    .order("published_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Highlight[];
}
