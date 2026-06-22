"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui-context";
import { useToast } from "@/app/components/ui/toast";
import type { ProductSnapshot } from "@/app/components/add-to-cart-button";
import { BagIcon, PlusIcon, MinusIcon, CheckIcon } from "@/app/components/icons";

/** Sticky quantity stepper + add-to-cart bar for the product detail page. */
export function ProductActions({
  product,
  inStock,
}: {
  product: ProductSnapshot;
  inStock: boolean;
}) {
  const { add } = useCart();
  const { openCart } = useCartUI();
  const { toast } = useToast();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="flex items-center gap-3 border-t border-line bg-white px-4 py-3.5">
      <div className="flex items-center overflow-hidden rounded-[11px] border border-line-strong">
        <button
          type="button"
          aria-label="Kurangi"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="flex h-[42px] w-[38px] items-center justify-center bg-paper text-ink disabled:opacity-40"
          disabled={!inStock}
        >
          <MinusIcon size={16} strokeWidth={2.4} />
        </button>
        <span className="w-9 text-center text-[15px] font-extrabold text-ink">
          {qty}
        </span>
        <button
          type="button"
          aria-label="Tambah"
          onClick={() => setQty((q) => q + 1)}
          className="flex h-[42px] w-[38px] items-center justify-center bg-paper text-ink disabled:opacity-40"
          disabled={!inStock}
        >
          <PlusIcon size={16} strokeWidth={2.4} />
        </button>
      </div>

      {inStock ? (
        <button
          type="button"
          onClick={() => {
            add(product, qty);
            toast(`${product.name} ditambahkan`);
            openCart();
            setAdded(true);
            setTimeout(() => setAdded(false), 1200);
          }}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[13px] bg-forest text-[14.5px] font-bold text-white transition-transform hover:bg-forest-dark active:scale-[0.98] motion-reduce:transform-none"
        >
          {added ? (
            <>
              <CheckIcon size={19} /> Ditambahkan
            </>
          ) : (
            <>
              <BagIcon size={19} /> Tambah ke Keranjang
            </>
          )}
        </button>
      ) : (
        <div className="flex h-12 flex-1 items-center justify-center rounded-[13px] bg-[#e7e3d9] text-[14.5px] font-bold text-[#9aa39c]">
          Stok Habis
        </div>
      )}

      {added ? (
        <button
          type="button"
          onClick={() => router.push("/cart")}
          className="hidden h-12 items-center justify-center rounded-[13px] border border-forest px-4 text-sm font-bold text-forest md:flex"
        >
          Lihat Keranjang
        </button>
      ) : null}
    </div>
  );
}
