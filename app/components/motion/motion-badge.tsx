"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function MotionBadge({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <motion.span
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.35, 1] }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.span>
  );
}
