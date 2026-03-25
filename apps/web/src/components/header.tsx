"use client";

import type { Route } from "next";
import clsx from "clsx";
import Link from "next/link";
import { useCallback, useState } from "react";
import { AuthModal } from "@/components/auth-modal";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { useAuth } from "@/hooks/use-auth";

const categories = [
  { href: "/loans" as Route, label: "Loans" },
  { href: "/cards" as Route, label: "Cards" },
  { href: "/transfers" as Route, label: "Transfers" },
  { href: "/exchange" as Route, label: "Exchange" },
  { href: "/about" as Route, label: "About" },
  { href: "/contact" as Route, label: "Contact" },
];

export function Header({ activeHref }: { activeHref?: Route }) {
  const { user, profile } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = useCallback(() => {
    setMobileMenuOpen(false);
    if (user) {
      if (!profile?.onboarding_completed) {
        setOnboardingOpen(true);
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      setOnboardingOpen(true);
    }
  }, [user, profile]);

  const handleSignIn = useCallback(() => {
    setMobileMenuOpen(false);
    if (user) {
      window.location.href = "/dashboard";
    } else {
      setAuthOpen(true);
    }
  }, [user]);

  const handleAuthSuccess = useCallback(() => {
    // After sign in, the profile will be fetched by the auth hook
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingOpen(false);
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  return (
    <>
      <header className="glass sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-8 px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileMenuOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {categories.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  activeHref === item.href
                    ? "bg-bg-surface text-ink"
                    : "text-ink-secondary hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSignIn}
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:text-ink sm:block"
            >
              {user ? "Dashboard" : "Sign in"}
            </button>
            <button
              type="button"
              onClick={handleGetStarted}
              className="hidden rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:block"
            >
              {user && profile?.onboarding_completed ? "My offers" : "Find my best offers"}
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-bg-surface md:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M3 6h14M3 10h14M3 14h14" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-line bg-white px-5 pb-5 pt-3 md:hidden">
            <nav className="grid gap-1">
              {categories.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    activeHref === item.href
                      ? "bg-bg-surface text-ink"
                      : "text-ink-secondary hover:bg-bg-surface hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-3 grid gap-2 border-t border-line pt-3">
              <button
                type="button"
                onClick={handleSignIn}
                className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:bg-bg-surface"
              >
                {user ? "Dashboard" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={handleGetStarted}
                className="rounded-full bg-black px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                {user && profile?.onboarding_completed ? "My offers" : "Find my best offers"}
              </button>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <OnboardingFlow
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </>
  );
}
