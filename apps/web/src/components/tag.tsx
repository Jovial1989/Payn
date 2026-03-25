import clsx from "clsx";
import type { HTMLAttributes } from "react";

type TagTone = "neutral" | "accent" | "muted" | "success" | "blue" | "purple" | "orange";

export function tagStyles({ tone = "neutral" }: { tone?: TagTone } = {}) {
  return clsx(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
    tone === "neutral" && "bg-bg-surface text-ink",
    tone === "accent" && "bg-accent-green text-accent-green-text",
    tone === "muted" && "bg-bg-surface text-ink-secondary",
    tone === "success" && "bg-accent-green text-accent-green-text",
    tone === "blue" && "bg-accent-blue text-accent-blue-text",
    tone === "purple" && "bg-accent-purple text-accent-purple-text",
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
