"use client";

import { useCart, type CartLine } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui-context";
import { useToast } from "./ui/toast";
import { PlusIcon, CheckIcon } from "./icons";
import { useState } from "react";

export type ProductSnapshot = Omit<CartLine, "qty">;

/** Compact "+" button used on product cards. */
export function AddIconButton({
  product,
  disabled = false,
  qty = 1,
}: {
  product: ProductSnapshot;
  disabled?: boolean;
  qty?: number;
}) {
  const { add } = useCart();
  const { openCart } = useCartUI();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  if (disabled) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#e7e3d9] text-[#b6bdb4]">
        <PlusIcon size={17} strokeWidth={2.4} />
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label="Tambah ke keranjang"
      onClick={() => {
        add(product, qty);
        toast(`${product.name} ditambahkan`);
        openCart();
        setAdded(true);
        setTimeout(() => setAdded(false), 900);
      }}
      className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-forest text-white transition-transform hover:bg-forest-dark active:scale-90 motion-reduce:transform-none"
    >
      {added ? (
        <CheckIcon size={17} strokeWidth={2.4} />
      ) : (
        <PlusIcon size={17} strokeWidth={2.4} />
      )}
    </button>
  );
}
