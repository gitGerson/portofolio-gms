import { MotionPage } from "@/app/components/motion/motion-page";

/**
 * Storefront route template — unlike the layout above it, this re-mounts on every
 * navigation, so the enter animation replays for the page content only. The chrome
 * in `layout.tsx` stays mounted and does not re-animate.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <MotionPage>{children}</MotionPage>;
}
