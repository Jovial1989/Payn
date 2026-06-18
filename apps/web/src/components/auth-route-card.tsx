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
import { trackAnalyticsEvent, AnalyticsEvent } from "@/lib/analytics";

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

/* ── Brand panel (left, desktop-only) ─────────────────────────── */
function BrandPanel() {
  const proofLines = [
    "200+ financial products",
    "30 European markets",
    "Commission always disclosed",
  ];

  return (
    <div className="hidden lg:flex lg:w-[44%] flex-col bg-gradient-to-br from-[#0D1812] to-[#13181A] p-12 xl:p-16">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5 group w-fit">
        <span className="text-white/30 text-lg font-bold leading-none select-none">^</span>
        <span className="text-white text-base font-extrabold tracking-[-0.02em] leading-none">Payn</span>
      </Link>

      {/* Headline */}
      <div className="flex-1 flex flex-col justify-center mt-12">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.18em] mb-5">
          European finance comparison
        </p>
        <h1 className="text-[2.75rem] xl:text-[3.25rem] font-extrabold leading-[1.04] tracking-[-0.035em] text-white">
          Your money,<br />ranked fairly.
        </h1>
        <p className="mt-6 text-white/55 text-[1rem] leading-relaxed max-w-[340px]">
          Every product ranked by what it actually costs you — not who pays us the most.
        </p>
      </div>

      {/* Proof */}
      <div className="grid gap-3">
        {proofLines.map((line) => (
          <div key={line} className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0f8a4b] shrink-0" />
            <span className="text-white/45 text-sm">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export function AuthRouteCard({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useMarketplacePreferences();
  const uiCopy = getUiCopy(locale);
  const { user, profile, loading: authLoading, signInWithEmail, signUpWithEmail, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);
  const nextHref = searchParams.get("next") || localePath(locale, "/dashboard");
  const callbackAuthError = searchParams.get("auth_error");

  useEffect(() => {
    if (callbackAuthError) {
      setError(uiCopy.auth.callbackError);
    }
  }, [callbackAuthError, uiCopy.auth.callbackError]);

  useEffect(() => {
    if (authLoading || !user) return;
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
        trackAnalyticsEvent(AnalyticsEvent.SignInCompleted);
        router.push(result.redirectTo ?? nextHref);
        router.refresh();
        return;
      }

      trackAnalyticsEvent(AnalyticsEvent.SignUpStarted);
      const result = await signUpWithEmail(email, password);
      if (result.error) {
        setError(mapAuthError(result.error, uiCopy));
        setSubmitting(false);
        return;
      }
      if (result.requiresEmailConfirmation) {
        trackAnalyticsEvent(AnalyticsEvent.SignUpCompleted);
        setVerificationPending(true);
        setSubmitting(false);
        return;
      }
      trackAnalyticsEvent(AnalyticsEvent.SignUpCompleted);
      router.refresh();
    } catch {
      setError(uiCopy.auth.genericError);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  };

  const handleOAuth = async (provider: "google") => {
    setError(null);
    if (!isSupabaseConfigured()) {
      setError(uiCopy.auth.notConfigured);
      return;
    }
    setOauthLoading(provider);
    trackAnalyticsEvent(AnalyticsEvent.OAuthStarted, { provider });
    const result = await signInWithOAuth(provider);
    if (result.error) {
      setError(result.error);
      setOauthLoading(null);
    }
  };

  /* ── Full-viewport shell ── */
  return (
    <div className="flex min-h-screen">
      <BrandPanel />

      {/* Right: form panel */}
      <div className="flex flex-1 flex-col">
        {/* Mobile-only logo */}
        <div className="flex items-center gap-1.5 p-6 lg:hidden">
          <span className="text-ink-tertiary text-lg font-bold leading-none select-none">^</span>
          <Link href="/" className="text-ink text-base font-extrabold tracking-[-0.02em] leading-none">Payn</Link>
        </div>

        {/* Centered form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-[400px]">

            {/* ── Loading state ── */}
            {authLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-tertiary border-t-ink" />
              </div>

            /* ── Onboarding after signup ── */
            ) : mode === "signup" && user && !profile?.onboarding_completed ? (
              <UserTypeOnboardingCard
                title={uiCopy.auth.onboardingTitle}
                description={uiCopy.auth.onboardingDescription}
                completeLabel={uiCopy.auth.onboardingCompleteLabel}
              />

            /* ── Email verification pending ── */
            ) : verificationPending ? (
              <div>
                <p className="text-caption uppercase tracking-[0.28em] text-ink-tertiary">
                  {uiCopy.auth.accountCreatedEyebrow}
                </p>
                <h2 className="mt-3 text-h2 text-ink">{uiCopy.auth.confirmEmailTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                  {formatUiCopy(uiCopy.auth.confirmEmailDescription, { email })}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={localePath(locale, "/login")}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-accent-emerald px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong"
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
              </div>

            /* ── Main form ── */
            ) : (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
                  {mode === "login" ? uiCopy.auth.loginEyebrow : uiCopy.auth.signupEyebrow}
                </p>
                <h2 className="mt-2 text-[1.75rem] font-extrabold tracking-[-0.025em] text-ink">
                  {mode === "login" ? uiCopy.auth.loginTitle : uiCopy.auth.signupTitle}
                </h2>

                {/* Google OAuth */}
                <div className="mt-6">
                  <button
                    type="button"
                    disabled={oauthLoading !== null || submitting}
                    onClick={() => handleOAuth("google")}
                    className="flex h-11 w-full items-center justify-center gap-2.5 rounded-2xl border border-line bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-bg-surface disabled:opacity-50"
                  >
                    {oauthLoading === "google" ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-tertiary border-t-ink" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                        <path d="M17.64 9.2a10.34 10.34 0 0 0-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908C16.658 14.251 17.64 11.945 17.64 9.2z" fill="#4285F4"/>
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                        <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                      </svg>
                    )}
                    Continue with Google
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mt-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-line" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-tertiary">or</span>
                  <div className="h-px flex-1 bg-line" />
                </div>

                {/* Email + password form */}
                <form onSubmit={handleSubmit} className="mt-4 grid gap-3">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-ink-secondary">{uiCopy.auth.emailLabel}</span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={uiCopy.auth.emailPlaceholder}
                      disabled={submitting}
                      className="h-11 rounded-2xl border border-line bg-bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent-emerald disabled:opacity-60"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold text-ink-secondary">{uiCopy.auth.passwordLabel}</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete={mode === "signup" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signup" ? uiCopy.auth.signupPasswordPlaceholder : uiCopy.auth.loginPasswordPlaceholder}
                      disabled={submitting}
                      className="h-11 rounded-2xl border border-line bg-bg-surface px-4 text-sm text-ink outline-none transition-colors focus:border-accent-emerald disabled:opacity-60"
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
                    className="mt-1 h-11 rounded-full bg-accent-emerald px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong disabled:opacity-50"
                  >
                    {submitting
                      ? mode === "login" ? uiCopy.auth.signingIn : uiCopy.auth.creatingAccount
                      : mode === "login" ? uiCopy.auth.signIn : uiCopy.auth.createAccount}
                  </button>
                </form>

                {/* Switch mode */}
                <p className="mt-6 text-sm text-ink-secondary">
                  {mode === "login" ? uiCopy.auth.loginPrompt : uiCopy.auth.signupPrompt}{" "}
                  <Link
                    href={localePath(locale, mode === "login" ? "/signup" : "/login")}
                    className="font-semibold text-ink underline underline-offset-4"
                  >
                    {mode === "login" ? uiCopy.auth.createAccount : uiCopy.auth.signIn}
                  </Link>
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Footer line */}
        <div className="px-6 py-4 lg:px-10">
          <p className="text-xs text-ink-tertiary">
            © Payn ·{" "}
            <Link href="/legal/terms" className="hover:text-ink transition-colors">Terms</Link>
            {" · "}
            <Link href="/legal/privacy" className="hover:text-ink transition-colors">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
