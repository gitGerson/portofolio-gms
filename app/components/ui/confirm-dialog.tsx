"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  dialogEnter,
  dialogTransition,
  quickTransition,
} from "../motion/presets";

type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmContextValue = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    setOpts(options);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolver.current?.(result);
    resolver.current = null;
    setOpts(null);
  }, []);

  useEffect(() => {
    if (!opts) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(false);
      if (e.key === "Enter") close(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [opts, close]);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {opts ? (
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              className="absolute inset-0 bg-ink/40 backdrop-blur-[1px]"
              onClick={() => close(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={quickTransition}
            />
            <motion.div
              variants={dialogEnter}
              initial="hidden"
              animate="show"
              exit="exit"
              transition={dialogTransition}
              className="relative w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-xl"
            >
              <h2 className="text-base font-extrabold text-ink">
                {opts.title}
              </h2>
              {opts.message ? (
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">
                  {opts.message}
                </p>
              ) : null}
              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="h-10 rounded-[11px] border border-line px-4 text-sm font-semibold text-muted transition-colors hover:text-ink"
                >
                  {opts.cancelLabel ?? "Batal"}
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => close(true)}
                  className={`h-10 rounded-[11px] px-4 text-sm font-bold text-white transition-transform active:scale-[0.97] motion-reduce:transform-none ${
                    opts.danger
                      ? "bg-danger hover:opacity-90"
                      : "bg-forest hover:bg-forest-dark"
                  }`}
                >
                  {opts.confirmLabel ?? "Konfirmasi"}
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextValue {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}
