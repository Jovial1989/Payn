"use client";

import type { MarketplaceLocale } from "@payn/types";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { localePath } from "@/lib/locale";

type DecisionPreview = {
  category: string;
  prompt: string;
  amount: string;
  speed: string;
  provider: string;
  offer: string;
  apr: string;
  reason: string;
  label: string;
  href: string;
  accent: string;
  providerSurface: string;
};

const previewsByLocale: Record<MarketplaceLocale, DecisionPreview[]> = {
  en: [
    {
      category: "Personal loan",
      prompt: "Need funds for home upgrades",
      amount: "EUR 18,000",
      speed: "Minutes",
      provider: "Klarna",
      offer: "Flexible Loan",
      apr: "3.9% - 11.9%",
      reason: "Best option for you",
      label: "Fast approval",
      href: "/offers/klarna-flexible-loan",
      accent: "from-[#0F8A4B]/15 via-[#0F8A4B]/6 to-transparent",
      providerSurface: "bg-[#FFB3C7] text-[#5A1830]",
    },
    {
      category: "Credit card",
      prompt: "Looking for travel rewards",
      amount: "0 FX fees",
      speed: "Instant",
      provider: "Revolut",
      offer: "Metal Card",
      apr: "1% cashback",
      reason: "Strongest value balance",
      label: "Travel pick",
      href: "/offers/revolut-metal-card",
      accent: "from-[#111827]/10 via-[#111827]/5 to-transparent",
      providerSurface: "bg-[#111827] text-white",
    },
    {
      category: "Transfer",
      prompt: "Sending money across Europe",
      amount: "EUR 2,500",
      speed: "Same day",
      provider: "Wise",
      offer: "International Transfer",
      apr: "0.41% FX spread",
      reason: "Lowest transfer friction",
      label: "Best value",
      href: "/offers/wise-international-transfer",
      accent: "from-[#0B7A43]/14 via-[#0B7A43]/6 to-transparent",
      providerSurface: "bg-[#9FE870] text-[#163300]",
    },
  ],
  de: [
    {
      category: "Privatkredit",
      prompt: "Finanzierung fuer Modernisierung",
      amount: "EUR 18.000",
      speed: "Minuten",
      provider: "Klarna",
      offer: "Flexible Loan",
      apr: "3,9% - 11,9%",
      reason: "Beste Option fuer Sie",
      label: "Schnelle Pruefung",
      href: "/offers/klarna-flexible-loan",
      accent: "from-[#0F8A4B]/15 via-[#0F8A4B]/6 to-transparent",
      providerSurface: "bg-[#FFB3C7] text-[#5A1830]",
    },
    {
      category: "Kreditkarte",
      prompt: "Suche nach Reisevorteilen",
      amount: "0 Fremdwaehrungsgebuehren",
      speed: "Sofort",
      provider: "Revolut",
      offer: "Metal Card",
      apr: "1% Cashback",
      reason: "Staerkste Gesamtbalance",
      label: "Reise-Favorit",
      href: "/offers/revolut-metal-card",
      accent: "from-[#111827]/10 via-[#111827]/5 to-transparent",
      providerSurface: "bg-[#111827] text-white",
    },
    {
      category: "Transfer",
      prompt: "Geld innerhalb Europas senden",
      amount: "EUR 2.500",
      speed: "Am selben Tag",
      provider: "Wise",
      offer: "International Transfer",
      apr: "0,41% FX-Spanne",
      reason: "Wenigste Reibung",
      label: "Bester Wert",
      href: "/offers/wise-international-transfer",
      accent: "from-[#0B7A43]/14 via-[#0B7A43]/6 to-transparent",
      providerSurface: "bg-[#9FE870] text-[#163300]",
    },
  ],
  es: [
    {
      category: "Prestamo personal",
      prompt: "Fondos para mejorar tu hogar",
      amount: "EUR 18.000",
      speed: "Minutos",
      provider: "Klarna",
      offer: "Flexible Loan",
      apr: "3,9% - 11,9%",
      reason: "Mejor opcion para ti",
      label: "Aprobacion rapida",
      href: "/offers/klarna-flexible-loan",
      accent: "from-[#0F8A4B]/15 via-[#0F8A4B]/6 to-transparent",
      providerSurface: "bg-[#FFB3C7] text-[#5A1830]",
    },
    {
      category: "Tarjeta",
      prompt: "Buscando recompensas de viaje",
      amount: "0 comisiones FX",
      speed: "Instantaneo",
      provider: "Revolut",
      offer: "Metal Card",
      apr: "1% cashback",
      reason: "Mejor equilibrio general",
      label: "Favorita para viajar",
      href: "/offers/revolut-metal-card",
      accent: "from-[#111827]/10 via-[#111827]/5 to-transparent",
      providerSurface: "bg-[#111827] text-white",
    },
    {
      category: "Transferencia",
      prompt: "Enviar dinero por Europa",
      amount: "EUR 2.500",
      speed: "Mismo dia",
      provider: "Wise",
      offer: "International Transfer",
      apr: "0,41% spread FX",
      reason: "Menos friccion",
      label: "Mejor valor",
      href: "/offers/wise-international-transfer",
      accent: "from-[#0B7A43]/14 via-[#0B7A43]/6 to-transparent",
      providerSurface: "bg-[#9FE870] text-[#163300]",
    },
  ],
  fr: [
    {
      category: "Pret personnel",
      prompt: "Financer des travaux a la maison",
      amount: "EUR 18 000",
      speed: "Minutes",
      provider: "Klarna",
      offer: "Flexible Loan",
      apr: "3,9% - 11,9%",
      reason: "Meilleure option pour vous",
      label: "Decision rapide",
      href: "/offers/klarna-flexible-loan",
      accent: "from-[#0F8A4B]/15 via-[#0F8A4B]/6 to-transparent",
      providerSurface: "bg-[#FFB3C7] text-[#5A1830]",
    },
    {
      category: "Carte",
      prompt: "Des avantages pour voyager",
      amount: "0 frais FX",
      speed: "Instantane",
      provider: "Revolut",
      offer: "Metal Card",
      apr: "1% cashback",
      reason: "Meilleur equilibre global",
      label: "Choix voyage",
      href: "/offers/revolut-metal-card",
      accent: "from-[#111827]/10 via-[#111827]/5 to-transparent",
      providerSurface: "bg-[#111827] text-white",
    },
    {
      category: "Transfert",
      prompt: "Envoyer de l'argent en Europe",
      amount: "EUR 2 500",
      speed: "Dans la journee",
      provider: "Wise",
      offer: "International Transfer",
      apr: "0,41% spread FX",
      reason: "Moins de friction",
      label: "Meilleure valeur",
      href: "/offers/wise-international-transfer",
      accent: "from-[#0B7A43]/14 via-[#0B7A43]/6 to-transparent",
      providerSurface: "bg-[#9FE870] text-[#163300]",
    },
  ],
  it: [
    {
      category: "Prestito personale",
      prompt: "Fondi per migliorare casa",
      amount: "EUR 18.000",
      speed: "Minuti",
      provider: "Klarna",
      offer: "Flexible Loan",
      apr: "3,9% - 11,9%",
      reason: "Migliore opzione per te",
      label: "Risposta rapida",
      href: "/offers/klarna-flexible-loan",
      accent: "from-[#0F8A4B]/15 via-[#0F8A4B]/6 to-transparent",
      providerSurface: "bg-[#FFB3C7] text-[#5A1830]",
    },
    {
      category: "Carta",
      prompt: "Cerchi vantaggi di viaggio",
      amount: "0 commissioni FX",
      speed: "Istantaneo",
      provider: "Revolut",
      offer: "Metal Card",
      apr: "1% cashback",
      reason: "Miglior equilibrio complessivo",
      label: "Scelta viaggio",
      href: "/offers/revolut-metal-card",
      accent: "from-[#111827]/10 via-[#111827]/5 to-transparent",
      providerSurface: "bg-[#111827] text-white",
    },
    {
      category: "Trasferimento",
      prompt: "Inviare denaro in Europa",
      amount: "EUR 2.500",
      speed: "In giornata",
      provider: "Wise",
      offer: "International Transfer",
      apr: "0,41% spread FX",
      reason: "Meno attrito",
      label: "Valore migliore",
      href: "/offers/wise-international-transfer",
      accent: "from-[#0B7A43]/14 via-[#0B7A43]/6 to-transparent",
      providerSurface: "bg-[#9FE870] text-[#163300]",
    },
  ],
  pt: [
    {
      category: "Emprestimo pessoal",
      prompt: "Financiar melhorias na casa",
      amount: "EUR 18.000",
      speed: "Minutos",
      provider: "Klarna",
      offer: "Flexible Loan",
      apr: "3,9% - 11,9%",
      reason: "Melhor opcao para si",
      label: "Resposta imediata",
      href: "/offers/klarna-flexible-loan",
      accent: "from-[#0F8A4B]/15 via-[#0F8A4B]/6 to-transparent",
      providerSurface: "bg-[#FFB3C7] text-[#5A1830]",
    },
    {
      category: "Cartao",
      prompt: "Procura vantagens de viagem",
      amount: "0 comissoes FX",
      speed: "Instantaneo",
      provider: "Revolut",
      offer: "Metal Card",
      apr: "1% cashback",
      reason: "Melhor equilibrio global",
      label: "Escolha viagem",
      href: "/offers/revolut-metal-card",
      accent: "from-[#111827]/10 via-[#111827]/5 to-transparent",
      providerSurface: "bg-[#111827] text-white",
    },
    {
      category: "Transferencia",
      prompt: "Enviar dinheiro na Europa",
      amount: "EUR 2.500",
      speed: "No mesmo dia",
      provider: "Wise",
      offer: "International Transfer",
      apr: "0,41% spread FX",
      reason: "Menor friccao",
      label: "Melhor valor",
      href: "/offers/wise-international-transfer",
      accent: "from-[#0B7A43]/14 via-[#0B7A43]/6 to-transparent",
      providerSurface: "bg-[#9FE870] text-[#163300]",
    },
  ],
};

export function HeroProductShowcase({
  locale,
  countryName,
}: {
  locale: MarketplaceLocale;
  countryName: string;
}) {
  const reduceMotion = useReducedMotion();
  const previews = previewsByLocale[locale] ?? previewsByLocale.en;
  const [activeIndex, setActiveIndex] = useState(0);
  const activePreview = previews[activeIndex];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % previews.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, [previews.length]);

  const stack = useMemo(
    () =>
      previews.map((_, index) => previews[(activeIndex + index) % previews.length]),
    [activeIndex, previews],
  );

  return (
    <div className="relative flex min-h-[540px] items-center justify-center lg:min-h-[620px]">
      <motion.div
        className="hero-orb hero-orb-emerald left-[10%] top-[8%] h-[180px] w-[180px]"
        initial={{ opacity: 0, y: 22 }}
        animate={{
          opacity: 0.72,
          y: reduceMotion ? 0 : [0, -10, 0],
        }}
        transition={{
          opacity: { duration: 0.45 },
          y: reduceMotion
            ? { duration: 0.45 }
            : { duration: 7.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="hero-orb hero-orb-dark right-[6%] top-[16%] h-[160px] w-[160px]"
        initial={{ opacity: 0, y: 18 }}
        animate={{
          opacity: 0.7,
          y: reduceMotion ? 0 : [0, -8, 0],
        }}
        transition={{
          opacity: { duration: 0.55, delay: 0.08 },
          y: reduceMotion
            ? { duration: 0.55, delay: 0.08 }
            : { duration: 8.8, delay: 0.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
        }}
      />

      <div className="relative w-full max-w-[520px]">
        <motion.div
          className="hero-floating-card absolute left-0 top-6 z-20 w-[200px] rounded-[28px] px-5 py-4"
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          animate={{
            opacity: 1,
            y: reduceMotion ? 0 : [0, -6, 0],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 0.45, delay: 0.08 },
            scale: { duration: 0.45, delay: 0.08 },
            y: reduceMotion
              ? { duration: 0.45, delay: 0.08 }
              : { duration: 7, delay: 0.3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary">
            Your need
          </p>
          <p className="mt-3 text-sm font-semibold leading-6 text-ink">
            {activePreview.prompt}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-ink-secondary">
            <span>{countryName}</span>
            <span>{activePreview.amount}</span>
          </div>
        </motion.div>

        <div className="hero-connector absolute left-[98px] top-[132px] z-10 hidden h-[124px] w-px bg-[linear-gradient(180deg,rgba(15,138,75,0.3),rgba(15,138,75,0))] lg:block" />

        <motion.div
          className="hero-floating-card absolute bottom-10 right-0 z-10 w-[220px] rounded-[30px] px-5 py-4"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{
            opacity: 1,
            y: reduceMotion ? 0 : [0, -7, 0],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 0.5, delay: 0.18 },
            scale: { duration: 0.5, delay: 0.18 },
            y: reduceMotion
              ? { duration: 0.5, delay: 0.18 }
              : { duration: 7.6, delay: 0.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-tertiary">
            Decision speed
          </p>
          <p className="mt-2 text-[1.95rem] font-extrabold leading-none tracking-[-0.06em] text-ink">
            {activePreview.speed}
          </p>
          <p className="mt-2 text-sm text-ink-secondary">
            Ranked for clarity, rates, and approval flow.
          </p>
        </motion.div>

        <div className="relative mx-auto flex w-full justify-center px-8 pt-24 lg:px-10 lg:pt-20">
          <LayoutGroup>
          <div className="relative h-[420px] w-full max-w-[360px]">
            <AnimatePresence mode="sync" initial={false}>
              {stack.slice(0, 3).reverse().map((preview, layerIndex) => {
              const visualIndex = 2 - layerIndex;
              const isActive = visualIndex === 0;
              const href = localePath(locale, preview.href);

              return (
                <motion.div
                  key={`${preview.provider}-${preview.offer}`}
                  className={`absolute inset-x-0 mx-auto ${
                    isActive ? "z-30" : visualIndex === 1 ? "z-20" : "z-10"
                  }`}
                  initial={{
                    opacity: 0,
                    y: 34,
                    scale: 0.95,
                  }}
                  animate={{
                    top: visualIndex * 32,
                    y: visualIndex * 12,
                    scale: 1 - visualIndex * 0.04,
                    rotate: visualIndex === 2 ? -4 : visualIndex === 1 ? -2 : 0,
                    opacity: 1 - visualIndex * 0.16,
                  }}
                  exit={{
                    opacity: 0,
                    y: -18,
                    scale: 0.97,
                  }}
                  layout
                  transition={
                    reduceMotion
                      ? { duration: 0.18 }
                      : {
                          type: "spring",
                          stiffness: 320,
                          damping: 32,
                          delay: visualIndex * 0.06,
                        }
                  }
                >
                  <Link
                    href={href}
                    className="hero-recommendation-card block overflow-hidden rounded-[34px] border border-black/6 bg-white p-6"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${preview.accent}`} />
                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-[16px] text-[13px] font-bold ${preview.providerSurface}`}>
                            {preview.provider.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">{preview.provider}</p>
                            <p className="text-[12px] text-ink-secondary">{preview.offer}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-[#F2F7F4] px-3 py-1 text-[11px] font-semibold text-accent-emerald">
                          {preview.label}
                        </span>
                      </div>

                      <motion.div
                        className="mt-8"
                        initial={false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduceMotion ? 0.12 : 0.32, delay: 0.04 }}
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink-tertiary">
                          Recommendation
                        </p>
                        <p className="tabular-nums mt-3 text-[3rem] font-extrabold leading-none tracking-[-0.08em] text-ink">
                          {preview.apr}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-accent-emerald">
                          {preview.reason}
                        </p>
                      </motion.div>

                      <div className="mt-8 grid grid-cols-2 gap-3">
                        <div className="rounded-[22px] bg-white/80 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,32,0.05)]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
                            Category
                          </p>
                          <p className="mt-2 text-sm font-semibold text-ink">{preview.category}</p>
                        </div>
                        <div className="rounded-[22px] bg-white/80 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,32,0.05)]">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-tertiary">
                            Amount
                          </p>
                          <p className="mt-2 text-sm font-semibold text-ink">{preview.amount}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
              })}
            </AnimatePresence>
          </div>
          </LayoutGroup>
        </div>

        <motion.div
          className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full border border-black/6 bg-white/84 px-3 py-2 shadow-[0_14px_28px_rgba(15,23,32,0.06)] backdrop-blur"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {previews.map((preview, index) => (
            <button
              key={preview.provider}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show ${preview.provider}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activeIndex ? "w-7 bg-ink" : "w-2.5 bg-ink/20 hover:bg-ink/40"
              }`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
