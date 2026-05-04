import clsx from "clsx";
import type { HTMLAttributes } from "react";

type TagTone = "neutral" | "accent" | "muted" | "success" | "blue" | "purple" | "orange";

export function tagStyles({ tone = "neutral" }: { tone?: TagTone } = {}) {
  return clsx(
    "inline-flex min-h-8 items-center whitespace-nowrap rounded-full px-3 py-1.5 text-center text-xs font-semibold leading-none",
    tone === "neutral" && "bg-bg-surface text-ink-secondary",
    tone === "accent" && "bg-accent-emerald-soft text-accent-emerald-strong",
    tone === "muted" && "bg-[#F2F3F4] text-ink-tertiary",
    tone === "success" && "bg-accent-emerald-soft text-accent-emerald-strong",
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
