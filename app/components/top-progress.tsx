"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight top loading bar. Starts when an internal link is clicked (or on
 * back/forward), and completes once the pathname commits. No dependencies.
 */
export function TopProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Begin the bar on internal navigations.
  useEffect(() => {
    function clearTimers() {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    }

    function start() {
      clearTimers();
      setVisible(true);
      setProgress(8);
      // Creep toward ~80% so it feels responsive without finishing early.
      timers.current.push(setTimeout(() => setProgress(45), 90));
      timers.current.push(setTimeout(() => setProgress(70), 280));
      timers.current.push(setTimeout(() => setProgress(85), 700));
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey)
        return;
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        !href.startsWith("/") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      // Same URL → no navigation.
      if (href === pathname) return;
      start();
    }

    document.addEventListener("click", onClick);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("popstate", start);
      clearTimers();
    };
  }, [pathname]);

  // Complete the bar whenever the path commits.
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const raf = requestAnimationFrame(() => setProgress(100));
    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 240);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[80] h-[3px]"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="h-full bg-gold shadow-[0_0_8px_rgba(199,148,52,0.7)] transition-[width] duration-200 ease-out motion-reduce:transition-none"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
