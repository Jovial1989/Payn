"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";

// ─── CategoryPill ──────────────────────────────────────────────────────────────
//
// Shared tab/pill primitive used by:
//   • BucketWorkspace (All / Credit / Debit / Travel / Cashback)
//   • DashboardCardsWorkspace (cardType filter)
//   • DashboardCategoryWorkspace (insurance type, etc.)
//
// Premium tab pattern (Linear / Apple Music): all pills in a group share a
// `layoutId` so that when the user picks a different pill, the emerald
// gradient "slides" from old → new via Framer Motion's FLIP. The pill
// itself is rendered as a backdrop layer, the label text sits above
// (z-index isolation) so the slide never clips the text.
//
// `groupId` is the FLIP key — all pills in the same tab row must pass the
// same `groupId` so they participate in a single shared animation. If
// omitted (legacy callers, single-button uses), the pill falls back to
// the original CSS-class swap and no FLIP runs.

interface CategoryPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  /** Optional badge — a count like "12" rendered as a chip after the label. */
  badge?: number | string;
  /** Shared layoutId namespace for the sliding-pill animation. All pills in
   *  the same tab row should pass the same value. Omit to skip FLIP. */
  groupId?: string;
}

export function CategoryPill({
  label,
  active,
  onClick,
  badge,
  groupId,
}: CategoryPillProps) {
  const shouldReduce = useReducedMotion();
  const useFlip = Boolean(groupId) && !shouldReduce;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "relative inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors duration-150 active:scale-[0.97]",
        // When FLIP is on, the pill itself never carries a background or
        // border — those live on the motion backdrop layer beneath. When
        // FLIP is off, we keep the legacy direct styling so the pill still
        // looks correct in reduced-motion / no-groupId callers.
        useFlip
          ? "border-0 bg-transparent text-ink-secondary hover:text-ink"
          : active
            ? "border border-transparent bg-gradient-to-b from-accent-emerald to-accent-emerald-strong text-white shadow-[0_4px_10px_rgba(15,138,75,0.22)]"
            : "border border-line bg-white text-ink-secondary hover:-translate-y-px hover:border-accent-emerald/30 hover:text-ink hover:shadow-subtle",
        // Active-state text colour when FLIP is on (the backdrop carries
        // emerald, text stays white).
        useFlip && active && "text-white",
      )}
    >
      {/* Sliding emerald backdrop — only rendered for the active pill, but
          shares its layoutId across the tab row so motion handles the
          FLIP from prev-pill rectangle to next-pill rectangle. Spring
          380/32 = tight Linear-app feel. */}
      {useFlip && active && (
        <motion.span
          layoutId={`pill-${groupId}`}
          className="absolute inset-0 rounded-full bg-gradient-to-b from-accent-emerald to-accent-emerald-strong shadow-[0_4px_10px_rgba(15,138,75,0.22)]"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}

      {/* Content sits above the motion backdrop. relative + z-10 isolates
          it so the slide animation never clips the label. */}
      {active && (
        <span
          aria-hidden="true"
          className="relative z-10 inline-block h-1.5 w-1.5 rounded-full bg-white/80"
        />
      )}
      <span className="relative z-10">{label}</span>
      {badge !== undefined && badge !== null && (
        <span
          className={clsx(
            "relative z-10 rounded-full px-1.5 text-[10px] font-bold tabular-nums",
            active ? "bg-white/20 text-white" : "bg-bg-surface text-ink-tertiary",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
