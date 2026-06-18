"use client";

import { createElement, useMemo } from "react";
import type { ElementType, ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

export function MotionReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const visible = useInView(ref, { once: true, margin: "-8% 0px -8% 0px" });
  const reduceMotion = useReducedMotion();
  // Memoize motion(Tag) so it returns a stable component type across re-renders.
  // Without this, motion(Tag) creates a new constructor every render → React
  // unmounts + remounts the entire subtree → child ScrambleNumber restarts.
  const MotionTag = useMemo(() => motion(Tag), [Tag]);
  const tagProps = {
    ref,
    className,
    initial: reduceMotion
      ? { opacity: 1 }
      : { opacity: 0, y: 24 },
    animate:
      visible || reduceMotion
        ? {
            opacity: 1,
            y: 0,
            transition: reduceMotion
              ? { duration: 0.1 }
              : {
                  delay: delay / 1000,
                  type: "spring" as const,
                  stiffness: 55,
                  damping: 18,
                },
          }
        : undefined,
  } as const;

  return createElement(MotionTag, tagProps, children);
}
