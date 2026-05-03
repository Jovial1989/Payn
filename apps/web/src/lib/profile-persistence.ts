import type { UserProfile } from "@/lib/types";
import type { UserProfileMarketScope } from "@/lib/residence-countries";

type PersistedProfileDraft = {
  first_name: string | null;
  last_name: string | null;
  preferred_locale: UserProfile["preferred_locale"];
  selected_categories: string[];
  goals: string[];
  home_country: string | null;
  user_type: UserProfile["user_type"];
  market_scope: UserProfileMarketScope;
  updated_at: string;
};

const profileStorageKeyPrefix = "payn:profile:draft:";

function getProfileStorageKey(userId: string) {
  return `${profileStorageKeyPrefix}${userId}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readPersistedProfileDraft(userId?: string | null): PersistedProfileDraft | null {
  if (!userId || !canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getProfileStorageKey(userId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedProfileDraft>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return {
      first_name: parsed.first_name ?? null,
      last_name: parsed.last_name ?? null,
      preferred_locale: parsed.preferred_locale ?? null,
      selected_categories: Array.isArray(parsed.selected_categories) ? parsed.selected_categories : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      home_country: parsed.home_country ?? null,
      user_type: parsed.user_type ?? "personal",
      market_scope: parsed.market_scope ?? "eu_fallback",
      updated_at: parsed.updated_at ?? new Date(0).toISOString(),
    };
  } catch {
    return null;
  }
}

export function writePersistedProfileDraft(
  userId: string | null | undefined,
  draft: Partial<PersistedProfileDraft>,
) {
  if (!userId || !canUseStorage()) {
    return;
  }

  const current = readPersistedProfileDraft(userId);
  const next: PersistedProfileDraft = {
    first_name: draft.first_name ?? current?.first_name ?? null,
    last_name: draft.last_name ?? current?.last_name ?? null,
    preferred_locale: draft.preferred_locale ?? current?.preferred_locale ?? null,
    selected_categories: draft.selected_categories ?? current?.selected_categories ?? [],
    goals: draft.goals ?? current?.goals ?? [],
    home_country: draft.home_country ?? current?.home_country ?? null,
    user_type: draft.user_type ?? current?.user_type ?? "personal",
    market_scope: draft.market_scope ?? current?.market_scope ?? "eu_fallback",
    updated_at: draft.updated_at ?? new Date().toISOString(),
  };

  window.localStorage.setItem(getProfileStorageKey(userId), JSON.stringify(next));
}

export function clearPersistedProfileDraft(userId?: string | null) {
  if (!userId || !canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(getProfileStorageKey(userId));
}

export function mergeProfileWithPersistedDraft(
  userId: string,
  profile: UserProfile | null | undefined,
): UserProfile {
  const draft = readPersistedProfileDraft(userId);
  const baseUpdatedAt = profile?.updated_at ? new Date(profile.updated_at).getTime() : 0;
  const draftUpdatedAt = draft?.updated_at ? new Date(draft.updated_at).getTime() : 0;
  const useDraft = draft && draftUpdatedAt >= baseUpdatedAt;

  return {
    user_id: userId,
    first_name: useDraft ? draft.first_name : (profile?.first_name ?? draft?.first_name ?? null),
    last_name: useDraft ? draft.last_name : (profile?.last_name ?? draft?.last_name ?? null),
    preferred_locale: useDraft
      ? draft.preferred_locale
      : (profile?.preferred_locale ?? draft?.preferred_locale ?? null),
    selected_categories: useDraft
      ? draft.selected_categories
      : (profile?.selected_categories ?? draft?.selected_categories ?? []),
    home_country: useDraft ? draft.home_country : (profile?.home_country ?? draft?.home_country ?? null),
    target_countries: profile?.target_countries ?? [],
    goals: useDraft ? draft.goals : (profile?.goals ?? draft?.goals ?? []),
    user_type: useDraft ? draft.user_type : (profile?.user_type ?? draft?.user_type ?? "personal"),
    spending_range: profile?.spending_range ?? null,
    transfer_range: profile?.transfer_range ?? null,
    loan_range: profile?.loan_range ?? null,
    onboarding_completed: profile?.onboarding_completed ?? false,
    created_at: profile?.created_at ?? new Date().toISOString(),
    updated_at: useDraft ? draft.updated_at : (profile?.updated_at ?? draft?.updated_at ?? new Date().toISOString()),
    market_scope: useDraft
      ? draft.market_scope
      : (profile?.market_scope ?? draft?.market_scope ?? "eu_fallback"),
  };
}
