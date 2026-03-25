"use client";

import type { MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/button";
import { OfferCard } from "@/components/offer-card";
import { SiteShell } from "@/components/site-shell";
import { Tag } from "@/components/tag";
import { useAuth } from "@/hooks/use-auth";

const CATEGORY_LABELS: Record<string, string> = {
  loans: "Loans",
  cards: "Credit Cards",
  transfers: "Transfers",
  exchange: "Exchange",
};

const GOAL_LABELS: Record<string, string> = {
  lowest_fees: "Lowest fees",
  best_rates: "Best rates",
  fast_approval: "Fast approval",
  premium: "Premium experience",
  cashback: "Cashback / rewards",
  business: "Business use",
  no_hidden_fees: "No hidden fees",
};

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);

  // Fetch mock offers for recommendations
  useEffect(() => {
    const loadOffers = async () => {
      try {
        const mod = await import("@/features/catalog/mock-data");
        const allOffers = mod.featuredOffers;
        if (profile?.selected_categories?.length) {
          setOffers(
            allOffers
              .filter((o) => profile.selected_categories.includes(o.category))
              .slice(0, 5),
          );
        } else {
          setOffers(allOffers.slice(0, 5));
        }
      } catch {
        setOffers([]);
      }
    };
    loadOffers();
  }, [profile]);

  if (loading) {
    return (
      <SiteShell eyebrow="" title="" description="" hideHero>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-tertiary border-t-black" />
        </div>
      </SiteShell>
    );
  }

  if (!user) {
    return (
      <SiteShell eyebrow="" title="" description="" hideHero>
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-tertiary" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="mt-5 text-h2 text-ink">Sign in to view your dashboard</h1>
          <p className="mt-3 text-sm text-ink-secondary">
            Save offers, track preferences, and get personalized recommendations.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/" className={buttonStyles({ variant: "primary", size: "lg" })}>
              Go to homepage
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell eyebrow="" title="" description="" hideHero activeHref="/dashboard">
      <div className="grid gap-8">
        {/* Welcome header */}
        <section className="rounded-3xl bg-white p-8 shadow-card lg:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary">Dashboard</p>
              <h1 className="mt-2 text-h2 text-ink">
                Welcome back{user.email ? `, ${user.email.split("@")[0]}` : ""}
              </h1>
              <p className="mt-2 text-sm text-ink-secondary">
                Your personalized marketplace view
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-line px-5 py-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-bg-surface hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </section>

        {/* Profile summary */}
        {profile?.onboarding_completed && (
          <section className="rounded-3xl bg-white p-8 shadow-card">
            <h2 className="text-h3 text-ink">Your profile</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.selected_categories.map((cat) => (
                <Tag key={cat} tone="blue">{CATEGORY_LABELS[cat] ?? cat}</Tag>
              ))}
              {profile.goals.map((goal) => (
                <Tag key={goal} tone="muted">{GOAL_LABELS[goal] ?? goal}</Tag>
              ))}
              {profile.home_country && (
                <Tag tone="success">{profile.home_country}</Tag>
              )}
              <Tag tone="muted">
                {profile.user_type === "personal"
                  ? "Personal"
                  : profile.user_type === "freelancer"
                    ? "Freelancer"
                    : "Business"}
              </Tag>
            </div>
          </section>
        )}

        {/* Recommended offers */}
        {offers.length > 0 && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-h3 text-ink">Recommended for you</h2>
                <p className="mt-1 text-sm text-ink-secondary">Based on your profile and preferences</p>
              </div>
              <Tag tone="blue">Personalized</Tag>
            </div>
            <div className="grid gap-4">
              {offers.map((offer, i) => (
                <OfferCard key={offer.id} offer={offer} rank={i + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/loans", label: "Browse loans", count: "17 offers" },
            { href: "/cards", label: "Browse cards", count: "14 offers" },
            { href: "/transfers", label: "Browse transfers", count: "13 offers" },
            { href: "/exchange", label: "Browse exchange", count: "12 offers" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <p className="text-sm font-bold text-ink group-hover:text-black">{item.label}</p>
              <p className="mt-1 text-xs text-ink-tertiary">{item.count}</p>
            </Link>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
