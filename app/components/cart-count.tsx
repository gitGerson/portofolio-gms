"use client";

import { useCart } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui-context";
import { BagIcon } from "./icons";
import { MotionBadge } from "./motion/motion-badge";

export function CartCount({
  variant = "dark",
}: {
  /** "light" = on forest header (light icon); "dark" = on white header. */
  variant?: "light" | "dark";
}) {
  const { count } = useCart();
  const { openCart } = useCartUI();
  const light = variant === "light";

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Buka keranjang, ${count} item`}
      className={`relative flex h-[42px] w-[42px] items-center justify-center rounded-xl transition-transform active:scale-90 motion-reduce:transform-none ${
        light ? "bg-white/12 text-white" : "border border-line text-ink"
      }`}
    >
      <BagIcon size={19} />
      {count > 0 ? (
        <MotionBadge
          key={count}
          className={`absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 px-1 text-[10px] font-extrabold text-ink ${
            light ? "border-forest bg-gold" : "border-white bg-gold"
          }`}
        >
          {count}
        </MotionBadge>
      ) : null}
    </button>
  );
}
