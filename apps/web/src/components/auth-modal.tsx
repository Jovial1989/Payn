"use client";

import { useCallback, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

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
      setLoading(true);

      const result =
        mode === "sign-in"
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password);

      setLoading(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (mode === "sign-up") {
        setSuccess(true);
        return;
      }

      onSuccess?.();
      onClose();
    },
    [mode, email, password, signInWithEmail, signUpWithEmail, onClose, onSuccess],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[420px] rounded-3xl bg-white p-8 shadow-elevated">
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
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-green-text" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <h2 className="mt-5 text-h3 text-ink">Check your email</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              We sent a confirmation link to <strong className="text-ink">{email}</strong>. Click it to activate your account.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-11 w-full rounded-full bg-black text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              Got it
            </button>
          </div>
        ) : (
          <>
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
            </div>

            <h2 className="mt-6 text-h3 text-ink">
              {mode === "sign-in" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {mode === "sign-in"
                ? "Sign in to access your saved offers and preferences."
                : "Join Payn to save offers, get recommendations, and track better rates."}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div>
                <label htmlFor="auth-email" className="text-xs font-semibold text-ink-secondary">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-bg-surface px-4 text-sm text-ink placeholder:text-ink-tertiary focus:border-line-active focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>
              <div>
                <label htmlFor="auth-password" className="text-xs font-semibold text-ink-secondary">
                  Password
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "sign-up" ? "Min 6 characters" : "Your password"}
                  className="mt-1.5 h-11 w-full rounded-xl border border-line bg-bg-surface px-4 text-sm text-ink placeholder:text-ink-tertiary focus:border-line-active focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-full bg-black text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : mode === "sign-in"
                    ? "Sign in"
                    : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-tertiary">
              {mode === "sign-in" ? (
                <>
                  New to Payn?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("sign-up");
                      setError(null);
                    }}
                    className="font-semibold text-ink underline underline-offset-2"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("sign-in");
                      setError(null);
                    }}
                    className="font-semibold text-ink underline underline-offset-2"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
