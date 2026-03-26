"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase-browser";
import { UserTypeOnboardingCard } from "@/components/user-type-onboarding-card";

type AuthMode = "login" | "signup";

function mapAuthError(message: string) {
  if (message.includes("Invalid login credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (message.includes("already registered") || message.includes("already been registered")) {
    return "This email is already registered. Try signing in instead.";
  }
  if (message.includes("Password should be")) {
    return "Password must be at least 6 characters.";
  }
  if (message.includes("Email not confirmed")) {
    return "Confirm your email first, then sign in.";
  }
  if (message.includes("Failed to fetch")) {
    return "Payn could not reach the authentication service. Please try again in a moment.";
  }
  return message;
}

export function AuthRouteCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const nextHref = searchParams.get("next") || "/dashboard";
  const callbackAuthError = searchParams.get("auth_error");

  useEffect(() => {
    if (callbackAuthError) {
      setError("Payn could not complete sign-in from the email link. Please try signing in again.");
    }
  }, [callbackAuthError]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    if (mode === "login") {
      router.replace(nextHref);
      return;
    }

    if (profile?.onboarding_completed) {
      router.replace("/dashboard");
    }
  }, [authLoading, mode, nextHref, profile?.onboarding_completed, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError("Authentication is not configured for this environment yet.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        const result = await signInWithEmail(email, password);

        if (result.error) {
          setError(mapAuthError(result.error));
          setSubmitting(false);
          return;
        }

        router.push(nextHref);
        router.refresh();
        return;
      }

      const result = await signUpWithEmail(email, password);

      if (result.error) {
        setError(mapAuthError(result.error));
        setSubmitting(false);
        return;
      }

      if (result.requiresEmailConfirmation) {
        setVerificationPending(true);
        setSubmitting(false);
        return;
      }

      router.refresh();
    } catch {
      setError("Payn could not complete the request. Please try again.");
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  if (authLoading) {
    return (
      <section className="rounded-[32px] border border-line bg-white p-10 shadow-card">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-tertiary border-t-black" />
        </div>
      </section>
    );
  }

  if (mode === "signup" && user && !profile?.onboarding_completed) {
    return (
      <UserTypeOnboardingCard
        title="How will you use Payn?"
        description="This helps Payn rank the most relevant products for your account from the start."
        completeLabel="Finish setup"
      />
    );
  }

  if (verificationPending) {
    return (
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">Account created</p>
        <h1 className="mt-3 text-h2 text-ink">Confirm your email to continue</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          We created your Payn account for {email}. Open the confirmation email, then sign in to continue to your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Go to sign in
          </Link>
          <Link
            href="/explore"
            className="inline-flex h-11 items-center justify-center rounded-full border border-line px-6 text-sm font-semibold text-ink transition-colors hover:bg-bg-surface"
          >
            Explore offers
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
      <div>
        <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
          {mode === "login" ? "Sign in" : "Get started"}
        </p>
        <h1 className="mt-3 text-h2 text-ink">
          {mode === "login" ? "Welcome back" : "Create your Payn account"}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
          {mode === "login"
            ? "Access your dashboard, saved offers, and personalized recommendations."
            : "Set up your account to save offers, build your shortlist, and continue into your personal dashboard."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-ink-secondary">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={submitting}
              className="h-12 rounded-2xl border border-line bg-bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-black disabled:opacity-60"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold text-ink-secondary">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signup" ? "Minimum 6 characters" : "Your password"}
              disabled={submitting}
              className="h-12 rounded-2xl border border-line bg-bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-black disabled:opacity-60"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 h-12 rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting
              ? mode === "login"
                ? "Signing in..."
                : "Creating account..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </div>

      <div className="rounded-[28px] bg-bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          {mode === "login" ? "Your Payn account" : "What you unlock"}
        </p>
        <div className="mt-4 grid gap-3">
          {[
            "Saved offers across categories and countries",
            "A real dashboard with recommendations and trends",
            "Provider handoff tracking that improves your Payn score",
            "A clean path from signup into onboarding and dashboard",
          ].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-green text-accent-green-text">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">{item}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-sm text-ink-secondary">
          {mode === "login" ? "New to Payn?" : "Already have an account?"}{" "}
          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className="font-semibold text-ink underline underline-offset-4"
          >
            {mode === "login" ? "Get started" : "Sign in"}
          </Link>
        </p>
      </div>
    </section>
  );
}
