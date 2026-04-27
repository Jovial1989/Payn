"use client";

import { createElement } from "react";
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
  const tagProps = {
    ref,
    className,
    initial: reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, filter: "blur(12px)" },
    animate:
      visible || reduceMotion
        ? {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
              delay: reduceMotion ? 0 : delay / 1000,
              duration: reduceMotion ? 0.1 : 0.52,
              ease: [0.22, 1, 0.36, 1],
            },
          }
        : undefined,
  } as const;

  return createElement(motion(Tag), tagProps, children);
}
