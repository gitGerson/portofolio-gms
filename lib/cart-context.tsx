"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/** A self-contained snapshot of a product captured when it was added to cart. */
export type CartLine = {
  slug: string;
  name: string;
  price: number;
  oldPrice: number | null;
  imagePath: string | null;
  imageTag: string | null;
  qty: number;
};

export type CartItem = CartLine & {
  lineTotal: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  ready: boolean;
  add: (snapshot: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "goldstar-cart";

/* ----------------------------------------------------------------------------
 * Module-level store backed by localStorage, read through useSyncExternalStore.
 * Cart lines carry their own product snapshot, so the cart never needs the DB.
 * -------------------------------------------------------------------------- */

const EMPTY: CartLine[] = [];
let lines: CartLine[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function readStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CartLine[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore malformed / unavailable storage
  }
  return EMPTY;
}

function ensureInit() {
  if (!initialized && typeof window !== "undefined") {
    lines = readStorage();
    initialized = true;
  }
}

function emit() {
  for (const l of listeners) l();
}

function write(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / unavailable storage
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartLine[] {
  ensureInit();
  return lines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

const store = {
  add(snapshot: Omit<CartLine, "qty">, qty = 1) {
    const existing = lines.find((l) => l.slug === snapshot.slug);
    write(
      existing
        ? lines.map((l) =>
            l.slug === snapshot.slug
              ? { ...l, ...snapshot, qty: l.qty + qty }
              : l,
          )
        : [...lines, { ...snapshot, qty }],
    );
  },
  setQty(slug: string, qty: number) {
    write(
      qty <= 0
        ? lines.filter((l) => l.slug !== slug)
        : lines.map((l) => (l.slug === slug ? { ...l, qty } : l)),
    );
  },
  remove(slug: string) {
    write(lines.filter((l) => l.slug !== slug));
  },
  clear() {
    write(EMPTY);
  },
};

/** Returns false during SSR and the first hydration render, true afterwards. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const currentLines = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const ready = useHydrated();

  const value = useMemo<CartContextValue>(() => {
    const items: CartItem[] = currentLines.map((line) => ({
      ...line,
      lineTotal: line.price * line.qty,
    }));

    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce(
      (sum, i) => sum + (i.oldPrice ?? i.price) * i.qty,
      0,
    );
    const total = items.reduce((sum, i) => sum + i.lineTotal, 0);

    return {
      items,
      count,
      subtotal,
      discount: subtotal - total,
      total,
      ready,
      add: store.add,
      setQty: store.setQty,
      remove: store.remove,
      clear: store.clear,
    };
  }, [currentLines, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
