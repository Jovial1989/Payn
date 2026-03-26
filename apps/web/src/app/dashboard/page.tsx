"use client";

import type { MarketplaceOffer } from "@payn/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/button";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { OfferCard } from "@/components/offer-card";
import { SiteShell } from "@/components/site-shell";
import { Tag } from "@/components/tag";
import { useAuth } from "@/hooks/use-auth";

const CATEGORY_LABELS: Record<string, string> = {
  loans: "Loans",
  cards: "Cards",
  transfers: "Transfers",
  exchange: "Exchange",
  insurance: "Insurance",
  investments: "Investments",
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

function roundCount(n: number): string {
  if (n <= 5) return `${n}`;
  if (n < 15) return `${Math.floor(n / 5) * 5}+`;
  return `${Math.floor(n / 10) * 10}+`;
}

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuth();
  const preferences = useMarketplacePreferences();
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const mod = await import("@/features/catalog/marketplace-offers");
        const allOffers = mod.marketplaceOffers;

        // Calculate category counts dynamically
        const counts: Record<string, number> = {};
        for (const o of allOffers) {
          counts[o.category] = (counts[o.category] ?? 0) + 1;
        }
        setCategoryCounts(counts);

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
    <SiteShell activePage="marketplace" hideHero>
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
                <OfferCard key={offer.id} offer={offer} rank={i + 1} locale={preferences.locale} />
              ))}
            </div>
          </section>
        )}

        {/* Quick actions */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["loans", "cards", "transfers", "exchange", "insurance", "investments"] as const).map((cat) => (
            <Link
              key={cat}
              href={`/${preferences.market}/${cat}`}
              className="group rounded-2xl border border-line bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <p className="text-sm font-bold text-ink group-hover:text-black">
                Browse {CATEGORY_LABELS[cat]?.toLowerCase() ?? cat}
              </p>
              <p className="mt-1 text-xs text-ink-tertiary">
                {categoryCounts[cat] ? `${roundCount(categoryCounts[cat])} offers` : "View offers"}
              </p>
            </Link>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}
