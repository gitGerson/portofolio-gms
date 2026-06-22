"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui-context";
import { formatRupiah } from "@/lib/format";
import { ProductImage } from "./product-image";
import { PlusIcon, MinusIcon, TrashIcon, BagIcon } from "./icons";
import { pageTransition, quickTransition } from "./motion/presets";

/** Slide-over cart panel, opened on add-to-cart and via the cart icons. */
export function CartDrawer() {
  const { open, closeCart } = useCartUI();
  const { items, count, total, setQty, remove } = useCart();

  // Lock body scroll while open + close on Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeCart]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[55]">
          {/* Overlay */}
          <motion.div
            onClick={closeCart}
            className="absolute inset-0 bg-ink/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={quickTransition}
          />
          {/* Panel */}
          <motion.aside
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
            role="dialog"
            aria-label="Keranjang"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={pageTransition}
          >
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h2 className="text-base font-extrabold text-ink">
            Keranjang{count > 0 ? ` · ${count}` : ""}
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Tutup"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-paper hover:text-ink"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-faint">
              <BagIcon size={24} />
            </span>
            <p className="text-sm font-semibold text-ink">
              Keranjang masih kosong
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="text-[13px] font-bold text-forest"
            >
              Lanjut belanja
            </button>
          </div>
        ) : (
          <>
            <div className="scrollarea flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div
                    key={item.slug}
                    className="flex gap-3 rounded-2xl border border-line bg-white p-3"
                  >
                    <Link
                      href={`/product/${item.slug}`}
                      onClick={closeCart}
                      className="flex-none"
                    >
                      <ProductImage
                        imagePath={item.imagePath}
                        tag={item.imageTag}
                        alt={item.name}
                        className="h-[68px] w-[68px] rounded-xl"
                        sizes="68px"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="text-[13px] font-bold leading-tight text-ink"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          aria-label="Hapus"
                          onClick={() => remove(item.slug)}
                          className="flex-none text-[#c0a8a8] hover:text-danger"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[14px] font-extrabold text-forest">
                          {formatRupiah(item.lineTotal)}
                        </span>
                        <div className="flex items-center overflow-hidden rounded-[9px] border border-line-strong">
                          <button
                            type="button"
                            aria-label="Kurangi"
                            onClick={() => setQty(item.slug, item.qty - 1)}
                            className="flex h-7 w-7 items-center justify-center bg-paper text-ink"
                          >
                            <MinusIcon size={13} strokeWidth={2.4} />
                          </button>
                          <span className="w-7 text-center text-[12px] font-extrabold">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Tambah"
                            onClick={() => setQty(item.slug, item.qty + 1)}
                            className="flex h-7 w-7 items-center justify-center bg-paper text-ink"
                          >
                            <PlusIcon size={13} strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-line bg-white p-4">
              <div className="mb-3 flex justify-between text-sm font-extrabold text-ink">
                <span>Total</span>
                <span className="text-forest">{formatRupiah(total)}</span>
              </div>
              <div className="flex gap-2.5">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="flex h-11 flex-1 items-center justify-center rounded-[12px] border border-line text-sm font-bold text-ink"
                >
                  Keranjang
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex h-11 flex-1 items-center justify-center rounded-[12px] bg-forest text-sm font-bold text-white transition-transform active:scale-[0.98] motion-reduce:transform-none"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
