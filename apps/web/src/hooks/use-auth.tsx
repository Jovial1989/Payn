"use client";

import type { Provider, User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearPersistedProfileDraft,
  mergeProfileWithPersistedDraft,
  readPersistedProfileDraft,
  writePersistedProfileDraft,
} from "@/lib/profile-persistence";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; hasSession: boolean; redirectTo?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; hasSession: boolean; requiresEmailConfirmation: boolean }>;
  signInWithOAuth: (provider: Provider) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const createDefaultProfile = useCallback(
    async (userId: string) => {
      const nextProfile = {
        user_id: userId,
        first_name: null,
        last_name: null,
        preferred_locale: null,
        selected_categories: [],
        home_country: null,
        market_scope: "eu_fallback" as const,
        target_countries: [],
        goals: [],
        user_type: "personal" as const,
        spending_range: null,
        transfer_range: null,
        loan_range: null,
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await supabase.from("user_profiles").upsert(nextProfile, {
        onConflict: "user_id",
        ignoreDuplicates: true,
      });
      return nextProfile;
    },
    [supabase],
  );

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setProfile(mergeProfileWithPersistedDraft(userId, data as UserProfile));
        return;
      }

      if (!error || error.code === "PGRST116") {
        const fallbackProfile = await createDefaultProfile(userId);
        setProfile(mergeProfileWithPersistedDraft(userId, fallbackProfile as UserProfile));
        return;
      }

      setProfile(null);
    },
    [createDefaultProfile, supabase],
  );

  useEffect(() => {
    const init = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }
      try {
        // Use getUser() (server-validated) not getSession() (reads from cache).
        // getSession() can return a stale session even after sign-out if the
        // cookie was not fully cleared. getUser() sends the token to Supabase
        // and returns null if invalid / revoked.
        const {
          data: { user: initialUser },
        } = await supabase.auth.getUser();
        setUser(initialUser ?? null);
        if (initialUser) {
          const cachedDraft = readPersistedProfileDraft(initialUser.id);
          if (cachedDraft) {
            setProfile(
              mergeProfileWithPersistedDraft(initialUser.id, {
                user_id: initialUser.id,
                first_name: null,
                last_name: null,
                preferred_locale: cachedDraft.preferred_locale ?? null,
                selected_categories: [],
                home_country: null,
                market_scope: cachedDraft.market_scope,
                target_countries: [],
                goals: [],
                user_type: "personal",
                spending_range: null,
                transfer_range: null,
                loan_range: null,
                onboarding_completed: false,
                created_at: new Date().toISOString(),
                updated_at: cachedDraft.updated_at,
              } satisfies UserProfile),
            );
            setLoading(false);
            void fetchProfile(initialUser.id);
            return;
          }

          await fetchProfile(initialUser.id);
        }
      } catch {
        // Supabase not available
      }
      setLoading(false);
    };

    // Safety timeout: never hang on loading forever
    const safetyTimeout = setTimeout(() => setLoading(false), 5000);
    init().finally(() => clearTimeout(safetyTimeout));

    if (!isSupabaseConfigured()) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const cachedDraft = readPersistedProfileDraft(session.user.id);
        if (cachedDraft) {
          setProfile(
            mergeProfileWithPersistedDraft(session.user.id, {
              user_id: session.user.id,
              first_name: null,
              last_name: null,
              preferred_locale: cachedDraft.preferred_locale ?? null,
              selected_categories: [],
              home_country: null,
              market_scope: cachedDraft.market_scope,
              target_countries: [],
              goals: [],
              user_type: "personal",
              spending_range: null,
              transfer_range: null,
              loan_range: null,
              onboarding_completed: false,
              created_at: new Date().toISOString(),
              updated_at: cachedDraft.updated_at,
            } satisfies UserProfile),
          );
        }
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });

      if (!error && data.user) {
        await createDefaultProfile(data.user.id);
        return { error: null, hasSession: true };
      }

      // SEC-FIX PAYN-A12: never read admin identity from NEXT_PUBLIC vars or hardcoded strings
      // Fall back to HMAC-based admin auth on any Supabase sign-in failure.
      const isAdmin = user?.app_metadata?.role === "admin";
      if (isAdmin || error?.message?.toLowerCase().includes("confirm")) {
        const { adminSignIn } = await import("@/actions/admin-auth");
        const result = await adminSignIn(email, password);
        if (result.ok) {
          return { error: null, hasSession: true, redirectTo: "/admin" };
        }
      }

      return {
        error: error?.message ?? null,
        hasSession: Boolean(data.session),
      };
    },
    [createDefaultProfile, supabase],
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (!error && data.user) {
        await createDefaultProfile(data.user.id);
      }
      return {
        error: error?.message ?? null,
        hasSession: Boolean(data.session),
        requiresEmailConfirmation: Boolean(data.user && !data.session),
      };
    },
    [createDefaultProfile, supabase],
  );

  const signInWithOAuth = useCallback(
    async (provider: Provider) => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error: error?.message ?? null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    const currentUserId = user?.id ?? null;
    // Clear local state immediately so the UI reacts before the redirect.
    clearPersistedProfileDraft(currentUserId);
    setUser(null);
    setProfile(null);
    // Navigate to the server-side signout endpoint (GET). The server calls
    // supabase.auth.signOut(), writes Set-Cookie clear headers onto a 302
    // redirect response, and the browser applies them before loading the next
    // page. This is more reliable than the AJAX-fetch approach where the
    // browser might start the next navigation before applying Set-Cookie from
    // the fetch response body.
    window.location.replace("/api/v1/auth/signout");
  }, [user?.id]);

  const requestPasswordReset = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      return { error: error?.message ?? null };
    },
    [supabase],
  );

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) return;

      writePersistedProfileDraft(user.id, {
        first_name: data.first_name ?? undefined,
        last_name: data.last_name ?? undefined,
        preferred_locale: data.preferred_locale ?? undefined,
        selected_categories: data.selected_categories ?? undefined,
        goals: data.goals ?? undefined,
        home_country: data.home_country ?? undefined,
        user_type: data.user_type ?? undefined,
        market_scope: data.market_scope ?? undefined,
      });

      // Optimistic local update
      setProfile((prev) =>
        mergeProfileWithPersistedDraft(user.id, {
          user_id: user.id,
          first_name: prev?.first_name ?? null,
          last_name: prev?.last_name ?? null,
          preferred_locale: prev?.preferred_locale ?? null,
          selected_categories: prev?.selected_categories ?? [],
          home_country: prev?.home_country ?? null,
          market_scope: prev?.market_scope ?? "eu_fallback",
          target_countries: prev?.target_countries ?? [],
          goals: prev?.goals ?? [],
          user_type: prev?.user_type ?? "personal",
          spending_range: prev?.spending_range ?? null,
          transfer_range: prev?.transfer_range ?? null,
          loan_range: prev?.loan_range ?? null,
          onboarding_completed: prev?.onboarding_completed ?? false,
          created_at: prev?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        }),
      );

      const { error } = await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) {
        throw error;
      }
    },
    [supabase, user],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      signOut,
      requestPasswordReset,
      refreshProfile,
      updateProfile,
    }),
    [
      user,
      profile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithOAuth,
      signOut,
      requestPasswordReset,
      refreshProfile,
      updateProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
