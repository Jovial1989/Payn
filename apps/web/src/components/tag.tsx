import clsx from "clsx";
import type { HTMLAttributes } from "react";

type TagTone = "neutral" | "accent" | "muted" | "success" | "blue" | "purple" | "orange";

export function tagStyles({ tone = "neutral" }: { tone?: TagTone } = {}) {
  return clsx(
    "inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-center text-xs font-semibold leading-none",
    tone === "neutral" && "bg-white/[0.06] text-slate-200",
    tone === "accent" && "bg-cyan-400/12 text-cyan-200",
    tone === "muted" && "bg-white/[0.05] text-slate-300",
    tone === "success" && "bg-emerald-400/12 text-emerald-300",
    tone === "blue" && "bg-accent-blue text-accent-blue-text",
    tone === "purple" && "bg-[#F3F0FF] text-[#5B21B6]",
    tone === "orange" && "bg-accent-orange text-accent-orange-text",
  );
}

export function Tag({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: TagTone }) {
  return <span className={clsx(tagStyles({ tone }), className)} {...props} />;
}
