"use client";

import { useCallback, useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured } from "@/lib/supabase-browser";
import { formatUiCopy, getUiCopy } from "@/lib/ui-copy";

type Mode = "sign-in" | "sign-up";

export function AuthModal({
  open,
  onClose,
  initialMode = "sign-in",
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  initialMode?: Mode;
  onSuccess?: () => void;
}) {
  const { locale } = useMarketplacePreferences();
  const uiCopy = getUiCopy(locale);
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!isSupabaseConfigured()) {
        setError(uiCopy.auth.notConfigured);
        return;
      }

      setLoading(true);

      try {
        const result =
          mode === "sign-in"
            ? await signInWithEmail(email, password)
            : await signUpWithEmail(email, password);

        setLoading(false);

        if (result.error) {
          const msg = result.error;
          if (msg.includes("Invalid login credentials")) {
            setError(uiCopy.auth.invalidCredentials);
          } else if (msg.includes("already registered") || msg.includes("already been registered")) {
            setError(uiCopy.auth.alreadyRegistered);
          } else if (msg.includes("Password should be")) {
            setError(uiCopy.auth.weakPassword);
          } else if (msg.includes("rate limit") || msg.includes("too many")) {
            setError(uiCopy.auth.genericError);
          } else if (msg.includes("not authorized") || msg.includes("Email not confirmed")) {
            setError(uiCopy.auth.emailNotConfirmed);
          } else {
            setError(msg);
          }
          return;
        }

        if (mode === "sign-up") {
          setSuccess(true);
          return;
        }

        onSuccess?.();
        onClose();
      } catch {
        setLoading(false);
        setError(uiCopy.auth.failedToFetch);
      }
    },
    [mode, email, onClose, onSuccess, password, signInWithEmail, signUpWithEmail, uiCopy],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[440px] rounded-3xl bg-white p-8 shadow-elevated">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-tertiary transition-colors hover:bg-bg-surface hover:text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>

        {success ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-green-text" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <h2 className="mt-5 text-h3 text-ink">{uiCopy.auth.accountCreatedEyebrow}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              {formatUiCopy(uiCopy.auth.confirmEmailDescription, { email })}
            </p>

            <div className="mt-6 rounded-2xl border border-line bg-bg-surface p-5 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">{uiCopy.auth.panelSignupTitle}</p>
              <div className="mt-3 grid gap-2.5">
                {uiCopy.auth.benefits.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-accent-green-text">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-medium text-ink">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setSuccess(false);
                setError(null);
              }}
              className="mt-6 h-11 w-full rounded-full bg-black text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              {uiCopy.auth.goToSignIn}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
            </div>

            <h2 className="mt-6 text-h3 text-ink">
              {mode === "sign-in" ? uiCopy.auth.loginTitle : uiCopy.auth.signupTitle}
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {mode === "sign-in"
                ? uiCopy.auth.loginDescription
                : uiCopy.auth.signupDescription}
            </p>

            {mode === "sign-up" && (
              <div className="mt-4 grid gap-2">
                {uiCopy.auth.benefits.map((point) => (
                  <div key={point} className="flex items-center gap-2.5">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-accent-green-text">
                      <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-medium text-ink-secondary">{point}</span>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div>
                <label htmlFor="auth-email" className="text-xs font-semibold text-ink-secondary">
                  {uiCopy.auth.emailLabel}
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={uiCopy.auth.emailPlaceholder}
                  disabled={loading}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-bg-surface px-4 text-sm text-ink placeholder:text-ink-tertiary focus:border-line-active focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="text-xs font-semibold text-ink-secondary">
                  {uiCopy.auth.passwordLabel}
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "sign-up" ? uiCopy.auth.signupPasswordPlaceholder : uiCopy.auth.loginPasswordPlaceholder}
                  disabled={loading}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-bg-surface px-4 text-sm text-ink placeholder:text-ink-tertiary focus:border-line-active focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-full bg-black text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-spin">
                      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                      <path d="M14 8a6 6 0 00-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    {mode === "sign-in" ? uiCopy.auth.signingIn : uiCopy.auth.creatingAccount}
                  </span>
                ) : mode === "sign-in" ? (
                  uiCopy.auth.signIn
                ) : (
                  uiCopy.auth.createAccount
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-tertiary">
              {mode === "sign-in" ? (
                <>
                  {uiCopy.auth.loginPrompt}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("sign-up");
                      setError(null);
                    }}
                    className="font-semibold text-ink underline underline-offset-2"
                  >
                    {uiCopy.auth.createAccount}
                  </button>
                </>
              ) : (
                <>
                  {uiCopy.auth.signupPrompt}{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("sign-in");
                      setError(null);
                    }}
                    className="font-semibold text-ink underline underline-offset-2"
                  >
                    {uiCopy.auth.signIn}
                  </button>
                </>
              )}
            </p>

            {mode === "sign-up" && (
              <p className="mt-3 text-center text-[10px] text-ink-tertiary">
                {uiCopy.auth.signupDescription}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
