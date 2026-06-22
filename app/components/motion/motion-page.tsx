"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { pageEnter, pageTransition } from "./presets";

export function MotionPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageEnter}
      initial="hidden"
      animate="show"
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
