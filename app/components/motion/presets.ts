import type { Variants } from "motion/react";

export const shopEase = [0.22, 1, 0.36, 1] as const;

export const pageTransition = {
  duration: 0.26,
  ease: shopEase,
};

export const quickTransition = {
  duration: 0.2,
  ease: shopEase,
};

export const dialogTransition = {
  duration: 0.18,
  ease: shopEase,
};

export const pageEnter: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export const toastEnter: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.98 },
};

export const dialogEnter: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.97 },
};

export const heroEnter: Variants = {
  hidden: { opacity: 0, scale: 1.04 },
  show: { opacity: 1, scale: 1 },
};
