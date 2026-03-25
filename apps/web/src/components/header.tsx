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

  const handleGetStarted = useCallback(() => {
    if (user) {
      // Signed in but not onboarded - show onboarding
      if (!profile?.onboarding_completed) {
        setOnboardingOpen(true);
      } else {
        // Already onboarded - go to dashboard
        window.location.href = "/dashboard";
      }
    } else {
      // Not signed in - show onboarding (works for guests too)
      setOnboardingOpen(true);
    }
  }, [user, profile]);

  const handleSignIn = useCallback(() => {
    if (user) {
      window.location.href = "/dashboard";
    } else {
      setAuthOpen(true);
    }
  }, [user]);

  const handleAuthSuccess = useCallback(() => {
    // After sign in, check if onboarding is needed
    // The profile will be fetched by the auth hook
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
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 12L8 4L12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-ink">Payn</span>
          </Link>

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
              className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              {user && profile?.onboarding_completed ? "My offers" : "Find my best offers"}
            </button>
          </div>
        </div>
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
