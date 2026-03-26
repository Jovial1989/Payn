"use client";

import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase-browser";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; hasSession: boolean }>;
  signUpWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; hasSession: boolean; requiresEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
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
        selected_categories: [],
        home_country: null,
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
        setProfile(data as UserProfile | null);
        return;
      }

      if (!error || error.code === "PGRST116") {
        const fallbackProfile = await createDefaultProfile(userId);
        setProfile(fallbackProfile as UserProfile);
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
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch {
        // Supabase not available
      }
      setLoading(false);
    };
    init();

    if (!isSupabaseConfigured()) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) return;
      await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      await fetchProfile(user.id);
    },
    [supabase, user, fetchProfile],
  );

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signOut,
      refreshProfile,
      updateProfile,
    }),
    [user, profile, loading, signInWithEmail, signUpWithEmail, signOut, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
