"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: 20, filter: "blur(14px)", scale: 0.992 }
        }
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
        exit={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: 0, y: -14, filter: "blur(10px)", scale: 0.996 }
        }
        transition={{
          duration: reduceMotion ? 0.12 : 0.44,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
