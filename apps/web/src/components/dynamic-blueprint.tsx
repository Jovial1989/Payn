"use client";

import type { MarketplaceLocale } from "@payn/types";
import clsx from "clsx";
import { motion } from "framer-motion";

type DynamicBlueprintProps = {
  locale?: MarketplaceLocale;
  contentLocale?: MarketplaceLocale;
  className?: string;
  compact?: boolean;
};

const blueprintCopy: Record<
  MarketplaceLocale,
  {
    panel: string;
    status: string;
    stream: string;
    nodes: string[];
    diagnostics: string[];
  }
> = {
  en: {
    panel: "Decision Graph",
    status: "Live sync",
    stream: "Market telemetry",
    nodes: ["Signal routing", "Risk envelope", "Provider fit", "Cost matrix"],
    diagnostics: ["Latency 18ms", "Confidence 97.4%", "Locale-safe payload", "Auth hydrated"],
  },
  de: {
    panel: "Entscheidungsgraph",
    status: "Live-Sync",
    stream: "Markttelemetrie",
    nodes: ["Signalrouting", "Risikorahmen", "Anbieter-Fit", "Kostenmatrix"],
    diagnostics: ["Latenz 18ms", "Konfidenz 97,4%", "Locale-sicheres Payload", "Auth aktiv"],
  },
  es: {
    panel: "Grafo de decisión",
    status: "Sincronización activa",
    stream: "Telemetría de mercado",
    nodes: ["Ruta de señales", "Marco de riesgo", "Ajuste proveedor", "Matriz de coste"],
    diagnostics: ["Latencia 18ms", "Confianza 97,4%", "Payload estable", "Auth activa"],
  },
  fr: {
    panel: "Graphe de décision",
    status: "Sync en direct",
    stream: "Télémétrie marché",
    nodes: ["Routage signal", "Cadre de risque", "Fit plateforme", "Matrice de coût"],
    diagnostics: ["Latence 18ms", "Confiance 97,4%", "Payload stable", "Auth active"],
  },
  it: {
    panel: "Grafo decisionale",
    status: "Sync live",
    stream: "Telemetria mercato",
    nodes: ["Instradamento segnali", "Profilo rischio", "Fit provider", "Matrice costi"],
    diagnostics: ["Latenza 18ms", "Confidenza 97,4%", "Payload stabile", "Auth attiva"],
  },
  pt: {
    panel: "Grafo de decisão",
    status: "Sync ao vivo",
    stream: "Telemetria mercado",
    nodes: ["Roteamento sinal", "Envelope risco", "Fit provedor", "Matriz custo"],
    diagnostics: ["Latência 18ms", "Confiança 97,4%", "Payload estável", "Auth ativa"],
  },
};

const nodePositions = [
  "left-[8%] top-[16%]",
  "right-[10%] top-[22%]",
  "left-[16%] bottom-[20%]",
  "right-[14%] bottom-[16%]",
];

export function DynamicBlueprint({
  locale = "en",
  contentLocale,
  className,
  compact = false,
}: DynamicBlueprintProps) {
  const copy = blueprintCopy[contentLocale ?? locale] ?? blueprintCopy.en;

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[32px] border border-cyan-400/20 bg-zinc-950 text-slate-200 shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
        compact ? "min-h-[320px]" : "min-h-[540px]",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.14),transparent_28%),linear-gradient(180deg,rgba(9,9,11,0.98),rgba(9,9,11,0.92))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.09),transparent_46%)]" />

      <motion.div
        className="absolute inset-x-0 top-[18%] h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
        animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.35, 0.8, 0.35] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute inset-y-[24%] right-[34%] w-px bg-gradient-to-b from-transparent via-cyan-300/60 to-transparent"
        animate={{ y: ["-8%", "10%", "-8%"], opacity: [0.25, 0.75, 0.25] }}
        transition={{ duration: 6.6, repeat: Infinity, ease: "linear" }}
      />

      <div className="absolute left-6 top-6 right-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-cyan-300/80 [font-family:var(--font-mono)]">
            {copy.panel}
          </p>
          <h3 className="mt-3 max-w-[18ch] text-3xl font-semibold tracking-[-0.06em] text-white">
            Premium routing for every decision surface.
          </h3>
        </div>
        <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 font-mono text-[10px] uppercase leading-none tracking-[0.24em] text-cyan-200 [font-family:var(--font-mono)]">
          {copy.status}
        </div>
      </div>

      <div className="absolute inset-x-6 bottom-6 top-32">
        <div className="absolute inset-x-[10%] top-[8%] h-[44%] rounded-[28px] border border-white/10 bg-white/[0.03] backdrop-blur-md" />
        <div className="absolute inset-y-[22%] left-[24%] w-[28%] rounded-[28px] border border-cyan-300/18 bg-cyan-400/[0.05] backdrop-blur-md" />
        <div className="absolute right-[12%] top-[32%] h-[34%] w-[22%] rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-md" />

        {nodePositions.map((position, index) => (
          <motion.div
            key={copy.nodes[index]}
            className={clsx(
              "absolute flex min-w-[112px] flex-col rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md",
              position,
            )}
            animate={{ y: [0, -6, 0], borderColor: ["rgba(255,255,255,0.10)", "rgba(103,232,249,0.35)", "rgba(255,255,255,0.10)"] }}
            transition={{ duration: 3 + index * 0.45, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="font-mono text-[10px] uppercase leading-none tracking-[0.24em] text-cyan-200/85 [font-family:var(--font-mono)]">
              N0{index + 1}
            </span>
            <span className="mt-2 whitespace-nowrap text-sm font-medium leading-none text-slate-100">
              {copy.nodes[index]}
            </span>
          </motion.div>
        ))}

        <motion.div
          className="absolute left-[18%] top-[38%] h-px w-[54%] bg-gradient-to-r from-cyan-400/0 via-cyan-300/80 to-cyan-400/0"
          animate={{ scaleX: [0.9, 1.04, 0.9], opacity: [0.4, 0.95, 0.4] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[24%] top-[38%] h-px w-20 bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,0.85)]"
          animate={{ x: ["0%", "260%", "0%"] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-[28%] top-[56%] h-px w-[40%] bg-gradient-to-r from-cyan-400/0 via-cyan-300/75 to-cyan-400/0"
          animate={{ scaleX: [0.86, 1.08, 0.86], opacity: [0.35, 0.8, 0.35] }}
          transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[38%] top-[54%] h-16 w-px bg-gradient-to-b from-cyan-400/0 via-cyan-300/70 to-cyan-400/0"
          animate={{ scaleY: [0.85, 1.1, 0.85], opacity: [0.3, 0.85, 0.3] }}
          transition={{ duration: 4.9, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="absolute left-4 bottom-4 grid gap-2">
          {copy.diagnostics.map((item) => (
            <div
              key={item}
              className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-[10px] uppercase leading-none tracking-[0.18em] text-slate-300 whitespace-nowrap [font-family:var(--font-mono)]"
            >
              {item}
            </div>
          ))}
        </div>

        <div className="absolute right-4 bottom-4 w-[220px] rounded-[24px] border border-cyan-300/18 bg-cyan-400/[0.06] p-4 backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/80 [font-family:var(--font-mono)]">
            {copy.stream}
          </p>
          <div className="mt-4 grid gap-3">
            {[72, 58, 84, 66].map((value, index) => (
              <div key={value} className="grid gap-1">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="truncate">{copy.nodes[index]}</span>
                  <span className="font-mono text-cyan-200 [font-family:var(--font-mono)]">{value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/8">
                  <motion.div
                    className="h-1.5 rounded-full bg-gradient-to-r from-cyan-300 to-sky-500"
                    animate={{ width: [`${Math.max(30, value - 18)}%`, `${value}%`, `${Math.max(30, value - 18)}%`] }}
                    transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
