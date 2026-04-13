"use client";

import type { MarketplaceLocale } from "@payn/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getDictionary } from "@/lib/i18n";

type ShowcaseCard = {
  category: string;
  provider: string;
  providerInitials: string;
  tagline: string;
  badge: string;
  badgeTone: "green" | "blue" | "purple";
  metrics: { label: string; value: string }[];
  href: string;
};

function getCards(locale: MarketplaceLocale): ShowcaseCard[] {
  const eur = (n: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(n);
  const pct = (n: number) =>
    new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n / 100);

  return [
    {
      category: "Money transfers",
      provider: "Wise",
      providerInitials: "WI",
      tagline: "International Transfer",
      badge: "#1 Best value",
      badgeTone: "green",
      metrics: [
        { label: "Fee", value: eur(2.1) },
        { label: "FX rate", value: pct(0.41) },
        { label: "Speed", value: "Same day" },
      ],
      href: "/offers/wise-international-transfer",
    },
    {
      category: "Credit cards",
      provider: "Revolut",
      providerInitials: "RE",
      tagline: "Metal Card",
      badge: "#1 Best card",
      badgeTone: "blue",
      metrics: [
        { label: "Cashback", value: pct(1) },
        { label: "FX fee", value: pct(0) },
        { label: "Monthly", value: eur(13.99) },
      ],
      href: "/offers/revolut-metal-card",
    },
    {
      category: "Personal loans",
      provider: "Klarna",
      providerInitials: "KL",
      tagline: "Flexible Loan",
      badge: "#1 Best rate",
      badgeTone: "purple",
      metrics: [
        { label: "APR from", value: pct(3.9) },
        { label: "Up to", value: eur(50000) },
        { label: "Term", value: "6–72 mo" },
      ],
      href: "/offers/klarna-flexible-loan",
    },
  ];
}

const badgeStyles: Record<ShowcaseCard["badgeTone"], string> = {
  green: "bg-[#EDFBF1] text-[#1A7340]",
  blue: "bg-[#EEF4FF] text-[#2059D1]",
  purple: "bg-[#F3F0FF] text-[#5B21B6]",
};

const providerColors: Record<string, string> = {
  Wise: "bg-[#9EE0C2] text-[#164E3A]",
  Revolut: "bg-[#111827] text-white",
  Klarna: "bg-[#FFB3C7] text-[#7B2242]",
};

const countryLabel: Record<MarketplaceLocale, string> = {
  en: "Your market",
  de: "Ihr Markt",
  es: "Tu mercado",
  fr: "Votre marché",
  it: "Il tuo mercato",
  pt: "O seu mercado",
};

const ofLabel: Record<MarketplaceLocale, string> = {
  en: "of 40+ ranked products",
  de: "von 40+ bewerteten Produkten",
  es: "de más de 40 productos clasificados",
  fr: "sur 40+ produits classés",
  it: "di oltre 40 prodotti classificati",
  pt: "de mais de 40 produtos classificados",
};

export function HeroProductShowcase({
  locale,
  countryName,
}: {
  locale: MarketplaceLocale;
  countryName: string;
}) {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dictionary = getDictionary(locale);
  const cards = getCards(locale);

  // Pause when scrolled out of viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-cycle — pauses on hover or when out of viewport
  useEffect(() => {
    if (hovered || !visible) return;
    const id = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % cards.length);
        setTransitioning(false);
      }, 350);
    }, 4000);
    return () => clearInterval(id);
  }, [hovered, visible]);

  function goTo(index: number) {
    if (index === active || transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(index);
      setTransitioning(false);
    }, 300);
  }

  const card = cards[active];

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center">
      {/* Card wrapper with hover pause */}
      <div
        className="relative w-full max-w-[400px]"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Glow halo */}
        <div className="absolute -inset-6 rounded-[40px] bg-gradient-to-br from-black/[0.04] via-transparent to-black/[0.02] blur-2xl" />

        {/* Card — fully clickable Link */}
        <Link
          href={card.href}
          className="group relative block cursor-pointer rounded-[24px] border border-black/[0.07] bg-white"
          style={{
            boxShadow: [
              "0 2px 4px rgba(0,0,0,0.04)",
              "0 8px 24px rgba(0,0,0,0.07)",
              "0 24px 48px rgba(0,0,0,0.06)",
            ].join(", "),
            opacity: transitioning ? 0 : 1,
            transition: "opacity 350ms ease, transform 200ms ease, box-shadow 200ms ease",
            // Desktop: subtle 3D tilt. Mobile: remove tilt via JS media check below.
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = [
              "0 4px 6px -1px rgba(0,0,0,0.05)",
              "0 20px 40px -8px rgba(0,0,0,0.12)",
            ].join(", ");
            (e.currentTarget as HTMLElement).style.transform = "perspective(900px) rotateY(-4deg) rotateX(1.5deg) translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = [
              "0 2px 4px rgba(0,0,0,0.04)",
              "0 8px 24px rgba(0,0,0,0.07)",
              "0 24px 48px rgba(0,0,0,0.06)",
            ].join(", ");
            (e.currentTarget as HTMLElement).style.transform = window.innerWidth >= 768 ? "perspective(900px) rotateY(-4deg) rotateX(1.5deg)" : "none";
          }}
          ref={(el) => {
            if (el) {
              el.style.transform = window.innerWidth >= 768
                ? "perspective(900px) rotateY(-4deg) rotateX(1.5deg)"
                : "none";
            }
          }}
        >
          {/* Card header */}
          <div className="flex items-start justify-between px-5 pt-5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-tertiary">
              {countryLabel[locale]} · {countryName}
            </span>
            <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[10px] font-semibold text-ink-tertiary">
              {dictionary.offerCard.updated}
            </span>
          </div>

          {/* Category label */}
          <div className="mt-3 px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-tertiary">
              {card.category}
            </p>
          </div>

          {/* Provider row */}
          <div className="mt-3 flex items-center gap-3 px-5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] text-[13px] font-bold ${providerColors[card.provider] ?? "bg-[#F3F4F6] text-ink"}`}
            >
              {card.providerInitials}
            </div>
            <div className="min-w-0">
              <p className="text-[16px] font-bold tracking-[-0.02em] text-ink">
                {card.provider}
              </p>
              <p className="text-[12px] text-ink-tertiary">{card.tagline}</p>
            </div>
            <span
              className={`ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeStyles[card.badgeTone]}`}
            >
              {card.badge}
            </span>
          </div>

          {/* Divider */}
          <div className="mx-5 mt-4 border-t border-black/[0.05]" />

          {/* Metrics */}
          <div className="mx-5 mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-[14px] bg-black/[0.05]">
            {card.metrics.map((m) => (
              <div
                key={m.label}
                className="flex flex-col items-center bg-[#F8F8FA] px-2 py-3"
              >
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-tertiary">
                  {m.label}
                </span>
                <span className="mt-1 text-[15px] font-bold tabular-nums tracking-[-0.02em] text-ink">
                  {m.value}
                </span>
              </div>
            ))}
          </div>

          {/* CTA row — real link, interactive */}
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-[12px] text-ink-tertiary">
              Ranked by transparency & fees
            </span>
            <span className="flex items-center gap-1 text-[12px] font-semibold text-ink transition-colors group-hover:text-black">
              View offer
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path
                  d="M2.5 6h7m0 0L6 3M9.5 6L6 9"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </Link>

        {/* Stack depth hint */}
        <div
          className="absolute -bottom-2 left-3 right-3 -z-10 h-full rounded-[24px] border border-black/[0.04] bg-white/60"
          style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}
        />
      </div>

      {/* Pagination */}
      <div className="mt-5 flex flex-col items-center gap-2">
        <p className="text-[12px] text-ink-tertiary">
          {active + 1} {ofLabel[locale]}
        </p>
        <div className="flex items-center gap-2">
          {cards.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Show product ${index + 1}`}
              className={`rounded-full transition-all duration-200 ${
                index === active
                  ? "h-2.5 w-6 bg-black"
                  : "h-2.5 w-2.5 bg-black/20 hover:bg-black/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
