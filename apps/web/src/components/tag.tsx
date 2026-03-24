import clsx from "clsx";
import type { HTMLAttributes } from "react";

type TagTone = "neutral" | "accent" | "muted" | "success";

export function tagStyles({ tone = "neutral" }: { tone?: TagTone } = {}) {
  return clsx(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
    tone === "neutral" && "border border-line bg-bg-elevated text-ink",
    tone === "accent" && "bg-primary-soft text-primary-400",
    tone === "muted" && "bg-bg-elevated text-ink-secondary",
    tone === "success" && "bg-primary-soft text-primary",
  );
}

export function Tag({
  tone = "neutral",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: TagTone }) {
  return <span className={clsx(tagStyles({ tone }), className)} {...props} />;
}
