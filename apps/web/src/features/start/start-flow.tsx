"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { localePath } from "@/lib/locale";

// UX.2 — Onboarding flow. Two screens:
//   Step 0 ("hello") — checkbox list of goals
//   Step 1 ("country") — single-tap country picker (optional)
// Then we either route to the single matching /explore/<bucket>
// situational page, or, if multiple boxes were ticked, to a
// /start/pack summary that stacks the situation cards.
//
// Design intent: NO signup wall, NO email collection, NO multi-step
// form. The point of this page is to give a first-time visitor a
// single "I get it now" moment in under 30 seconds. Anything more is
// friction.
//
// TASK-310 (PR-V3-06). The single-goal branch used to push at
// `/i-want-to/<slug>` — those pages are retired in favour of the
// canonical `/explore/<bucket>?context=...` URLs. Mirror of the same
// table in `features/home/what-do-you-want-to-do.tsx` (kept inline
// rather than extracted because the copy + ordering lives with each
// surface — only the destination is shared).

interface Goal {
  id: string;
  label: string;
  // Goal slug — used as the key into GOAL_HREFS and as the wire-format
  // identifier in the `/start/pack?goals=` query string.
  slug: string;
}

const GOALS: Goal[] = [
  { id: "travel", label: "I'm travelling soon", slug: "travel" },
  { id: "send-money", label: "I want to send money abroad", slug: "send-money" },
  {
    id: "grow-money",
    label: "I want to save and earn interest",
    slug: "grow-money",
  },
  {
    id: "switch-bank",
    label: "I want a better bank than the one I have",
    slug: "switch-bank",
  },
  { id: "big-purchase", label: "I need a loan", slug: "big-purchase" },
  { id: "get-protected", label: "I want insurance", slug: "get-protected" },
  {
    id: "run-business",
    label: "I'm running a small business",
    slug: "run-business",
  },
  {
    id: "family",
    label: "I have kids and want family money tools",
    slug: "family",
  },
];

// goal slug → canonical flat /<category>?context=... URL (PASS A retired
// the `/explore/<bucket>` vocabulary). Keep this in sync with SITUATIONS
// in features/home/what-do-you-want-to-do.tsx and the redirect table in
// next.config.ts.
const GOAL_HREFS: Record<string, string> = {
  travel: "/cards?type=travel&context=travel",
  "send-money": "/transfers?context=send-abroad",
  "grow-money": "/savings?context=grow-savings",
  "switch-bank": "/banking?type=app-only&context=switch",
  "big-purchase": "/loans?type=personal&context=big-purchase",
  "get-protected": "/insurance?context=worth-the-money",
  "run-business": "/business?context=self-employed",
  family: "/kids?context=family",
};

export function StartFlow() {
  const router = useRouter();
  const { locale } = useMarketplacePreferences();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const goals = GOALS.filter((g) => selected.has(g.id));
    if (goals.length === 0) {
      // Treat "nothing ticked" as "show me everything" — route to
      // discover so the visitor still sees something useful.
      router.push(localePath(locale, "/discover"));
      return;
    }
    setSubmitting(true);
    if (goals.length === 1) {
      // Single goal → go straight to the matching bucket with the
      // situational `?context=` so the destination renders the banner
      // + quick-check calculator.
      const href = GOAL_HREFS[goals[0].slug] ?? "/discover";
      router.push(localePath(locale, href));
      return;
    }
    // Multiple goals → starter-pack summary. Encode picks in the
    // query so the destination can render the right cards without
    // requiring server-side state.
    const slugs = goals.map((g) => g.slug).join(",");
    router.push(localePath(locale, `/start/pack?goals=${slugs}`));
  };

  return (
    <section className="mx-auto w-full max-w-[640px]">
      <div className="rounded-[24px] border border-line bg-white p-6 shadow-card sm:rounded-[32px] sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-emerald-strong">
          Welcome to Payn
        </p>
        <h1 className="mt-3 text-[1.75rem] font-bold tracking-[-0.025em] text-ink sm:text-[2rem]">
          Hi. Let&apos;s see what your money options actually are.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
          Pick what&apos;s true for you — you can pick more than one. No sign-up
          needed, no email, no spam. We&apos;ll show you the best option for each thing.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-2.5">
          {GOALS.map((goal) => {
            const isSelected = selected.has(goal.id);
            return (
              <label
                key={goal.id}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all",
                  isSelected
                    ? "border-accent-emerald/40 bg-accent-emerald-soft/50 shadow-subtle"
                    : "border-line bg-white hover:border-accent-emerald/25 hover:bg-bg-surface",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggle(goal.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={[
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                    isSelected
                      ? "border-accent-emerald bg-accent-emerald text-white"
                      : "border-line bg-white",
                  ].join(" ")}
                >
                  {isSelected && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <span
                  className={[
                    "text-[15px] font-medium",
                    isSelected ? "text-ink" : "text-ink-secondary",
                  ].join(" ")}
                >
                  {goal.label}
                </span>
              </label>
            );
          })}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent-emerald px-5 text-sm font-semibold text-white shadow-card transition-all hover:bg-accent-emerald-strong disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Loading…" : "Continue"}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </form>

        <p className="mt-4 text-center text-[12px] text-ink-tertiary">
          Or just{" "}
          <Link
            href={localePath(locale, "/discover")}
            className="font-semibold text-accent-emerald-strong"
          >
            browse everything
          </Link>{" "}
          — no quiz needed.
        </p>
      </div>
    </section>
  );
}
