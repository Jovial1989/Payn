"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { localePath } from "@/lib/locale";
import { isSupabaseConfigured } from "@/lib/supabase-browser";
import { formatUiCopy, getUiCopy } from "@/lib/ui-copy";
import { UserTypeOnboardingCard } from "@/components/user-type-onboarding-card";

type AuthMode = "login" | "signup";

function mapAuthError(message: string, locale: ReturnType<typeof getUiCopy>) {
  if (message.includes("Invalid login credentials")) {
    return locale.auth.invalidCredentials;
  }
  if (message.includes("already registered") || message.includes("already been registered")) {
    return locale.auth.alreadyRegistered;
  }
  if (message.includes("Password should be")) {
    return locale.auth.weakPassword;
  }
  if (message.includes("Email not confirmed")) {
    return locale.auth.emailNotConfirmed;
  }
  if (message.includes("Failed to fetch")) {
    return locale.auth.failedToFetch;
  }
  return message;
}

export function AuthRouteCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useMarketplacePreferences();
  const uiCopy = getUiCopy(locale);
  const { user, profile, loading: authLoading, signInWithEmail, signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const nextHref = searchParams.get("next") || localePath(locale, "/dashboard");
  const callbackAuthError = searchParams.get("auth_error");

  useEffect(() => {
    if (callbackAuthError) {
      setError(uiCopy.auth.callbackError);
    }
  }, [callbackAuthError, uiCopy.auth.callbackError]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    if (mode === "login") {
      router.replace(nextHref);
      return;
    }

    if (profile?.onboarding_completed) {
      router.replace(localePath(locale, "/dashboard"));
    }
  }, [authLoading, locale, mode, nextHref, profile?.onboarding_completed, router, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isSupabaseConfigured()) {
      setError(uiCopy.auth.notConfigured);
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        const result = await signInWithEmail(email, password);

        if (result.error) {
          setError(mapAuthError(result.error, uiCopy));
          setSubmitting(false);
          return;
        }

        router.push(nextHref);
        router.refresh();
        return;
      }

      const result = await signUpWithEmail(email, password);

      if (result.error) {
        setError(mapAuthError(result.error, uiCopy));
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
      setError(uiCopy.auth.genericError);
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
        title={uiCopy.auth.onboardingTitle}
        description={uiCopy.auth.onboardingDescription}
        completeLabel={uiCopy.auth.onboardingCompleteLabel}
      />
    );
  }

  if (verificationPending) {
    return (
      <section className="rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8">
        <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">{uiCopy.auth.accountCreatedEyebrow}</p>
        <h1 className="mt-3 text-h2 text-ink">{uiCopy.auth.confirmEmailTitle}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-secondary">
          {formatUiCopy(uiCopy.auth.confirmEmailDescription, { email })}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={localePath(locale, "/login")}
            className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            {uiCopy.auth.goToSignIn}
          </Link>
          <Link
            href={localePath(locale, "/discover")}
            className="inline-flex h-11 items-center justify-center rounded-full border border-line px-6 text-sm font-semibold text-ink transition-colors hover:bg-bg-surface"
          >
            {uiCopy.dashboard.openExplore}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6 rounded-[32px] border border-line bg-white p-6 shadow-card sm:p-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
      <div>
        <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
          {mode === "login" ? uiCopy.auth.loginEyebrow : uiCopy.auth.signupEyebrow}
        </p>
        <h1 className="mt-3 text-h2 text-ink">
          {mode === "login" ? uiCopy.auth.loginTitle : uiCopy.auth.signupTitle}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-secondary">
          {mode === "login"
            ? uiCopy.auth.loginDescription
            : uiCopy.auth.signupDescription}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-ink-secondary">{uiCopy.auth.emailLabel}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={uiCopy.auth.emailPlaceholder}
              disabled={submitting}
              className="h-12 rounded-2xl border border-line bg-bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-black disabled:opacity-60"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-semibold text-ink-secondary">{uiCopy.auth.passwordLabel}</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signup" ? uiCopy.auth.signupPasswordPlaceholder : uiCopy.auth.loginPasswordPlaceholder}
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
                ? uiCopy.auth.signingIn
                : uiCopy.auth.creatingAccount
              : mode === "login"
                ? uiCopy.auth.signIn
                : uiCopy.auth.createAccount}
          </button>
        </form>
      </div>

      <div className="rounded-[28px] bg-bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
          {mode === "login" ? uiCopy.auth.panelLoginTitle : uiCopy.auth.panelSignupTitle}
        </p>
        <div className="mt-4 grid gap-3">
          {uiCopy.auth.benefits.map((item) => (
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
          {mode === "login" ? uiCopy.auth.loginPrompt : uiCopy.auth.signupPrompt}{" "}
          <Link
            href={localePath(locale, mode === "login" ? "/signup" : "/login")}
            className="font-semibold text-ink underline underline-offset-4"
          >
            {mode === "login" ? uiCopy.auth.createAccount : uiCopy.auth.signIn}
          </Link>
        </p>
      </div>
    </section>
  );
}
