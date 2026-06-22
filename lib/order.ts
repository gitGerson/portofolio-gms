"use client";

import { useSyncExternalStore } from "react";

/**
 * Minimal client-side handoff of the active order number between checkout →
 * payment → upload. The full order lives in Supabase; this is just the pointer.
 */
const ORDER_NO_KEY = "goldstar-order-no";

let cached: string | null | undefined = undefined;
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function saveOrderNo(orderNo: string): void {
  cached = orderNo;
  initialized = true;
  try {
    sessionStorage.setItem(ORDER_NO_KEY, orderNo);
  } catch {
    // ignore
  }
  emit();
}

export function clearOrderNo(): void {
  cached = null;
  initialized = true;
  try {
    sessionStorage.removeItem(ORDER_NO_KEY);
  } catch {
    // ignore
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): string | null {
  if (!initialized && typeof window !== "undefined") {
    try {
      cached = sessionStorage.getItem(ORDER_NO_KEY);
    } catch {
      cached = null;
    }
    initialized = true;
  }
  return cached ?? null;
}

function getServerSnapshot(): string | null {
  return null;
}

/** Reactive read of the active order number. `loaded` is false until hydration. */
export function useOrderNo(): { orderNo: string | null; loaded: boolean } {
  const orderNo = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const loaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  return { orderNo, loaded };
}
