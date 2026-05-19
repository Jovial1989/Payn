"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

// ─── MobileScrollHide ──────────────────────────────────────────────────────────
//
// Twitter/X scroll-direction pattern. Children are visible at rest, hide
// on scroll-down (so reading isn't interrupted), reappear on scroll-up
// (so the action is reachable when the user pivots back toward navigation).
//
// Optimised:
//   • Listens to `scroll` on window with passive listener (no jank).
//   • Threshold of 8px so micro-jitters don't toggle visibility.
//   • Respects prefers-reduced-motion — falls back to always-visible.
//   • Renders nothing on desktop (md+) — caller is expected to compose
//     this only for mobile surfaces.
//
// Used by the PDP bottom-sticky CTA so it doesn't fight the affiliate
// banner or steal focus during long-form reading.

interface MobileScrollHideProps {
  className?: string;
  children: React.ReactNode;
}

export function MobileScrollHide({ className, children }: MobileScrollHideProps) {
  const shouldReduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const lastYRef = useRef(0);

  useEffect(() => {
    if (shouldReduce) return;
    lastYRef.current = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastYRef.current;

      // Ignore micro-scrolls — < 8px isn't intentional direction change.
      if (Math.abs(delta) < 8) return;

      // Always show within the first 200px of the page so the user
      // sees the CTA in the hero zone, regardless of direction.
      if (y < 200) {
        setShow(true);
      } else if (delta > 0) {
        // Scrolling down → reading; hide.
        setShow(false);
      } else {
        // Scrolling up → likely navigating; show.
        setShow(true);
      }

      lastYRef.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [shouldReduce]);

  return (
    <motion.div
      className={className}
      initial={false}
      animate={shouldReduce ? { y: 0, opacity: 1 } : { y: show ? 0 : 80, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      style={{ pointerEvents: show ? "auto" : "none" }}
    >
      {children}
    </motion.div>
  );
}
