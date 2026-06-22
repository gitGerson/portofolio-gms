import { MotionPage } from "./components/motion/motion-page";

/**
 * Route template — unlike layout.tsx, this re-mounts on every navigation, so
 * the CSS enter animation replays each time the user moves between pages.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <MotionPage>{children}</MotionPage>;
}
