"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

// ─── BottomSheet ───────────────────────────────────────────────────────────────
//
// iOS-grade bottom sheet primitive. Used for mobile filters, currency
// pickers, country pickers — anywhere a native `<select>` would look
// out of place on a premium financial product.
//
// Behaviour:
//   • Slides up from off-screen with spring physics.
//   • Drag-to-dismiss: when the user drags the sheet down past 80px the
//     close handler fires.
//   • Backdrop blur + dark overlay, click to close.
//   • Sticky footer slot for "Reset" + "Apply (N)" buttons.
//   • Locks body scroll while open.
//   • Sentinels a 16px drag-handle bar at the top for tactile affordance.
//
// Renders nothing on desktop — the parent component should branch on
// viewport width before deciding whether to mount this. We keep that
// branching at the caller because some surfaces (filter dialogs) want
// a sheet on mobile AND a popover on desktop, which is the caller's
// responsibility, not ours.

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Optional sticky footer slot — usually two buttons (Reset + Apply). */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function BottomSheet({
  open,
  onClose,
  title,
  footer,
  children,
}: BottomSheetProps) {
  const shouldReduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  // Locked body scroll while open. Reset cleanly even if the sheet is
  // unmounted with `open=true` (caller swaps routes etc.).
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // SSR-safe — only render the portal-style overlay on the client.
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={shouldReduce ? { opacity: 0 } : { y: "100%" }}
            animate={shouldReduce ? { opacity: 1 } : { y: 0 }}
            exit={shouldReduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag={shouldReduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.15}
            onDragEnd={(_e, info) => {
              // 80px drag down OR fast downward velocity → close.
              if (info.offset.y > 80 || info.velocity.y > 600) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl border border-line bg-white shadow-floating"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="h-1 w-10 rounded-full bg-line-strong" />
            </div>

            {title && (
              <div className="border-b border-line px-5 pb-3 pt-1">
                <p className="text-[15px] font-bold tracking-tight-1 text-ink">
                  {title}
                </p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

            {footer && (
              <div className="sticky bottom-0 border-t border-line bg-white/95 px-5 py-3 backdrop-blur-md">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
