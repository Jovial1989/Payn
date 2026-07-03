"use client";

import type { SVGProps, FC } from "react";
import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useMotionValue, useTransform } from "motion/react";
import type { MarketplaceLocale } from "@payn/types";
import { localePath } from "@/lib/locale";
import { useMarketplacePreferences } from "@/components/marketplace-preferences";
import { SectionNum } from "@/features/home/section-num";
import {
  IconTravelAbroad,
  IconEarnOnCash,
  IconInvestGrow,
  IconSpendSmarter,
  IconForBusiness,
  IconProtect,
  IconDailyBanking,
  IconFamilyKids,
} from "@/features/home/bucket-icons";

// UX.1 — The new primary navigation surface on /. Replaces the bucket
// grid (which sorted by product type — Cards / Savings / etc.) with
// 8 first-person situation cards that match how a real person thinks
// about money problems. The bucket grid still lives below for users
// who already know what they want.
//
// Each card has:
//   • SVG icon + first-person framing ("I'm going abroad")
//   • One-sentence benefit ("Pay anywhere, no extra fees on top")
//   • CTA pointing at the matching /explore/<bucket>?context=... page
//     (the V1-era /i-want-to/<slug> routes were retired in TASK-310;
//     see next.config.ts for the 301 redirect table)
//
// Copy is intentionally English-only for v1: brand-statement prose
// is hard to translate well via the existing dictionary and the
// situation pages themselves are EN-only until the rewrite ships
// across locales. Non-EN visitors fall through to /discover.
//
// BUG-105 — emojis (✈️💸📈🚗💼🛡📱👶) replaced with the same SVG
// icon set used in the AtlasGrid bucket cards so the home page is
// consistent across components.

type IconComponent = FC<SVGProps<SVGSVGElement>>;

interface SituationCard {
  Icon: IconComponent;
  // Short title for the card. The first-person voice is doing the
  // heavy lifting here — "I'm going abroad" beats "Travel cards"
  // because it mirrors the user's own internal monologue.
  title: string;
  // One sentence: what the user actually gets out of clicking.
  benefit: string;
  // Where the click goes. Points at the /i-want-to/<slug> situation
  // page; falls back to the relevant category if the page isn't live.
  href: string;
  cta: string;
  audience: "personal" | "business";
}

// hrefs point at the canonical flat `/<category>?type=&context=` routes
// (PASS A retired the `/explore/<bucket>` vocabulary). The situational
// copy is intentionally preserved (V1: "the best UX-writing on the
// site"). The `?type=`/`?context=` hints ride along in the URL so a
// shared link keeps its situational query.
//
// Note on tone: the "My bank charges me too much" tile + "modern apps
// with no monthly fees and the same protection" benefit line both
// nudge anti-bank framing. They're flagged in V3 brief §6 / V1 brief
// §I. Replaced here with a neutral framing per "Safe patterns" list
// — TASK-341 will sweep the same audit on every other surface.
const SITUATIONS: SituationCard[] = [
  // ── Personal ──
  {
    Icon: IconTravelAbroad,
    title: "I'm going abroad",
    benefit: "Pay anywhere with no extra fees on top of your bill.",
    href: "/cards?type=travel&context=travel",
    cta: "See best travel cards",
    audience: "personal",
  },
  {
    Icon: IconEarnOnCash,
    title: "I send money to family or friends abroad",
    benefit: "Find the route that loses the least to fees.",
    href: "/transfers?context=send-abroad",
    cta: "Compare transfer options",
    audience: "personal",
  },
  {
    Icon: IconInvestGrow,
    title: "I have savings sitting in a regular account",
    benefit: "Move them somewhere that actually pays you (3-4% a year).",
    href: "/savings?context=grow-savings",
    cta: "See savings accounts",
    audience: "personal",
  },
  {
    Icon: IconSpendSmarter,
    title: "I want to buy something I can't pay cash for",
    benefit: "Compare loans — see the total cost upfront.",
    href: "/loans?type=personal&context=big-purchase",
    cta: "Compare loans",
    audience: "personal",
  },
  {
    Icon: IconProtect,
    title: "I want insurance that fits my situation",
    benefit: "Travel, health, car, home — side by side.",
    href: "/insurance?context=worth-the-money",
    cta: "Compare insurance",
    audience: "personal",
  },
  {
    Icon: IconDailyBanking,
    title: "I want to see if there's a better account for me",
    benefit: "App-based accounts with no monthly fee — same deposit protection.",
    href: "/banking?type=app-only&context=switch",
    cta: "See banking alternatives",
    audience: "personal",
  },
  {
    Icon: IconFamilyKids,
    title: "Money stuff for the family",
    benefit: "Pocket-money apps for kids, joint accounts, family plans.",
    href: "/kids?context=family",
    cta: "See family options",
    audience: "personal",
  },
  // ── Business ──
  {
    Icon: IconForBusiness,
    title: "I'm self-employed or running a small business",
    benefit: "Lower fees on payments, payroll, and currency conversion.",
    href: "/business?context=self-employed",
    cta: "See business tools",
    audience: "business",
  },
  {
    Icon: IconEarnOnCash,
    title: "I pay suppliers or invoices abroad",
    benefit: "Move money across borders without losing it to FX margins.",
    href: "/transfers?context=business",
    cta: "Compare business transfers",
    audience: "business",
  },
  {
    Icon: IconDailyBanking,
    title: "I need to pay my team or contractors",
    benefit: "Run payroll and contractor payments in multiple currencies.",
    href: "/payroll?context=team",
    cta: "See payroll tools",
    audience: "business",
  },
  {
    Icon: IconForBusiness,
    title: "I want a business account with low fees",
    benefit: "Multi-currency accounts built for companies, not consumers.",
    href: "/business?type=account&context=switch",
    cta: "See business accounts",
    audience: "business",
  },
  {
    Icon: IconSpendSmarter,
    title: "I need to keep on top of company spending",
    benefit: "Company cards, receipt capture, and accounting sync.",
    href: "/expense?context=spending",
    cta: "See expense tools",
    audience: "business",
  },
];

// ─── 3D magnetic tilt card ────────────────────────────────────────────────────
// Wraps each situation card with a perspective tilt that follows the cursor.
// Max ±5° on both axes; spring-damped so it feels physical, not jittery.
// On touch devices the effect is effectively absent (no mousemove).
function TiltCard({
  children,
  delay,
  shouldReduce,
}: {
  children: React.ReactNode;
  delay: number;
  shouldReduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  // Direct useTransform without useSpring wrapping — avoids React 19 / motion v12
  // subscription conflicts that can cause a hydration crash.
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top)  / r.height - 0.5);
  }

  function onMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={ref}
      initial={shouldReduce ? false : { opacity: 0, y: 22 }}
      whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ type: "spring", stiffness: 55, damping: 18, delay }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={shouldReduce ? {} : { rotateX, rotateY, transformPerspective: 900 }}
    >
      {children}
    </motion.div>
  );
}

interface WhatDoYouWantToDoProps {
  locale: MarketplaceLocale;
}

export function WhatDoYouWantToDo({ locale }: WhatDoYouWantToDoProps) {
  const shouldReduce = useReducedMotion();
  const { audience, setAudience } = useMarketplacePreferences();
  const visible = SITUATIONS.filter((s) => s.audience === audience);
  return (
    <section
      id="what-do-you-want-to-do"
      className="mx-auto w-full min-w-0"
    >
      <motion.div
        className="mb-6 sm:mb-8"
        initial={shouldReduce ? false : { opacity: 0, y: 12 }}
        whileInView={shouldReduce ? {} : { opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-emerald-strong">
          <SectionNum value="01" className="mr-2.5 text-[10px] text-ink-tertiary/50" />
          What do you want to do?
        </p>
        <h2 className="mt-2 text-[1.75rem] font-bold tracking-[-0.025em] text-ink sm:text-[2rem]">
          Pick the one that sounds like your day.
        </h2>
        <p className="mt-2 max-w-[60ch] text-[14px] leading-relaxed text-ink-secondary sm:text-[15px]">
          We&apos;ll show you the cheapest, fastest option — for that
          specific thing — in plain numbers. No jargon, no upsell.
        </p>
        {/* STRAT.6 — Personal / Business toggle. Persists via
            marketplace-preferences (cookie + localStorage) so the choice
            survives navigation; filters the situation cards below. */}
        <div
          className="mt-5 inline-flex rounded-full border border-line bg-white p-0.5"
          role="group"
          aria-label="Personal or business"
        >
          {(["personal", "business"] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAudience(a)}
              aria-pressed={audience === a}
              className={`rounded-full px-4 py-1.5 text-[13px] font-semibold capitalize transition-colors ${
                audience === a
                  ? "bg-accent-emerald text-white"
                  : "text-ink-secondary hover:text-ink"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((situation, i) => (
          <TiltCard key={situation.href} delay={i * 0.06} shouldReduce={!!shouldReduce}>
            <Link
              href={localePath(locale, situation.href)}
              className="group flex h-full min-h-[200px] flex-col rounded-[20px] border border-line bg-white p-5 shadow-subtle transition-all hover:-translate-y-px hover:border-accent-emerald/40 hover:shadow-card"
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-accent-emerald-soft text-accent-emerald"
                aria-hidden="true"
              >
                <situation.Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <h3 className="mt-3 text-[15px] font-bold leading-snug text-ink">
                {situation.title}
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-secondary">
                {situation.benefit}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-semibold text-accent-emerald-strong">
                {situation.cta}
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <path
                    d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
