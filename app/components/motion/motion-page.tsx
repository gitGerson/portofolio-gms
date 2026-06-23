"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { curtainSweep, curtainTransition } from "./presets";

export function MotionPage({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}
      {/* Clipping overlay scoped to the content box; its own overflow-hidden
          clips the panel as it sweeps up, so it never covers the chrome and
          never becomes an overflow ancestor of `children` (keeps sticky working). */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
        <motion.div
          aria-hidden
          className="h-full w-full bg-forest"
          variants={curtainSweep}
          initial="hidden"
          animate="show"
          transition={curtainTransition}
        />
      </div>
    </div>
  );
}
