"use client";

import { useRef, useState, useEffect } from "react";
import { useInView, useReducedMotion } from "motion/react";

// Module-level cache — same pattern as ScrambleNumber.
// Prevents re-firing on client navigations within the same session.
const PLAYED = new Set<string>();

interface SectionNumProps {
  /** Two-digit label, e.g. "01", "02", "03" */
  value: string;
  className?: string;
}

/**
 * Displays a section counter that briefly scrambles through random digits
 * before locking in on the correct value when scrolled into view.
 * Identical behaviour to ScrambleNumber but:
 *   • trigger is scroll-based (useInView), not mount-based
 *   • operates on string digit pairs, not floats
 *   • honours prefers-reduced-motion
 */
export function SectionNum({ value, className = "" }: SectionNumProps) {
  const shouldReduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5% 0px" });
  const cacheKey = `section-num-${value}`;

  const [display, setDisplay] = useState<string>(() =>
    shouldReduce || PLAYED.has(cacheKey) ? value : "00"
  );

  useEffect(() => {
    if (!isInView) return;
    if (shouldReduce) { setDisplay(value); return; }
    if (PLAYED.has(cacheKey)) { setDisplay(value); return; }
    PLAYED.add(cacheKey);

    const FRAME_COUNT = 9;   // scramble frames before locking
    const FRAME_MS   = 45;   // ms per frame → ~400ms total
    let count = 0;

    const timer = setInterval(() => {
      count += 1;
      if (count >= FRAME_COUNT) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        // Random two-digit number in the same digit-count as value
        const rand = Math.floor(Math.random() * 99)
          .toString()
          .padStart(value.length, "0");
        setDisplay(rand);
      }
    }, FRAME_MS);

    return () => clearInterval(timer);
  }, [isInView, value, shouldReduce, cacheKey]);

  return (
    <span ref={ref} className={`font-mono tabular-nums ${className}`}>
      {display}
    </span>
  );
}
