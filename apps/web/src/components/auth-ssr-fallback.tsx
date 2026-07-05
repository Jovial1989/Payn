import Link from "next/link";

// BUG-001 / BUG-002 — Server-rendered fallback form for /login and
// /signup. Wrapped in `<noscript>` from the page route so it only
// shows when the rich `AuthRouteCard` Client Component can't run
// (JS disabled, crawler, social-preview bot, slow connection that
// hasn't finished hydration). The form posts to the same auth route
// the client flow eventually calls — so a no-JS visitor can still
// sign in / sign up end-to-end.
//
// Kept deliberately styled-light: a single white card on the
// SiteShell background, brand mark, the canonical form fields, GDPR
// T&C checkbox for signup. No third-party SSO buttons here because
// those require JS to complete the OAuth round-trip anyway.

export function AuthSSRFallback({ mode }: { mode: "login" | "signup" }) {
  const isSignup = mode === "signup";
  return (
    <section className="mx-auto mt-6 max-w-md rounded-[24px] border border-line bg-white p-6 shadow-card sm:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
        Payn
      </p>
      <h1 className="mt-3 text-[1.6rem] font-bold tracking-[-0.02em] text-ink">
        {isSignup ? "Create an account" : "Sign in to Payn"}
      </h1>
      <p className="mt-2 text-sm text-ink-secondary">
        {isSignup
          ? "JavaScript is disabled, so we're showing the simple form. Tap submit to create your account — it'll work the same as the live version."
          : "JavaScript is disabled, so we're showing the simple sign-in form."}
      </p>

      <form
        method="post"
        action={isSignup ? "/api/v1/auth/signup" : "/api/v1/auth/login"}
        className="mt-6 grid gap-4"
      >
        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="h-11 rounded-xl border border-line bg-white px-4 text-sm text-ink"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
            Password
          </span>
          <input
            type="password"
            name="password"
            required
            minLength={isSignup ? 8 : undefined}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="h-11 rounded-xl border border-line bg-white px-4 text-sm text-ink"
          />
          {isSignup && (
            <span className="text-[11px] text-ink-tertiary">
              At least 8 characters with a letter and a number.
            </span>
          )}
        </label>

        {isSignup && (
          <label className="flex items-start gap-2 text-[13px] text-ink-secondary">
            <input
              type="checkbox"
              name="terms"
              required
              className="mt-1 h-4 w-4 accent-accent-emerald"
            />
            <span>
              I agree to the{" "}
              <Link href="/legal/terms" className="text-accent-emerald-strong underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="text-accent-emerald-strong underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        )}

        <button
          type="submit"
          className="h-11 rounded-xl bg-accent-emerald px-4 text-sm font-semibold text-white transition-colors hover:bg-accent-emerald-strong"
        >
          {isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-[13px] text-ink-secondary">
        {isSignup ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent-emerald-strong">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Payn?{" "}
            <Link href="/signup" className="font-semibold text-accent-emerald-strong">
              Create an account
            </Link>
          </>
        )}
      </p>

      <p className="mt-3 text-center text-[12px] text-ink-tertiary">
        <Link href="/" className="underline">
          Continue as guest
        </Link>
      </p>
    </section>
  );
}
