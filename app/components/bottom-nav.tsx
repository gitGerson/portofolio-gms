"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useCartUI } from "@/lib/cart-ui-context";
import type { Category } from "@/lib/data/types";
import { HomeIcon, GridIcon, BagIcon, UserIcon } from "./icons";
import { MotionBadge } from "./motion/motion-badge";

/** Mobile-only bottom tab bar. */
export function BottomNav({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { count } = useCart();
  const { openCart } = useCartUI();
  const categoryHref = categories[0] ? `/category/${categories[0].slug}` : "/";

  const navClass = (active: boolean) =>
    `relative flex flex-col items-center gap-[3px] ${
      active ? "text-forest" : "text-faint"
    }`;
  const labelClass = (active: boolean) =>
    `text-[10px] ${active ? "font-bold" : "font-medium"}`;

  return (
    <nav className="sticky bottom-0 z-20 flex h-16 items-center justify-around border-t border-line bg-white pb-1 md:hidden">
      <Link href="/" className={navClass(pathname === "/")}>
        <HomeIcon size={20} />
        <span className={labelClass(pathname === "/")}>Beranda</span>
      </Link>

      <Link
        href={categoryHref}
        className={navClass(pathname.startsWith("/category"))}
      >
        <GridIcon size={20} />
        <span className={labelClass(pathname.startsWith("/category"))}>
          Kategori
        </span>
      </Link>

      <button type="button" onClick={openCart} className={navClass(false)}>
        <BagIcon size={20} />
        {count > 0 ? (
          <MotionBadge
            key={count}
            className="absolute -right-2 -top-1 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-ink"
          >
            {count}
          </MotionBadge>
        ) : null}
        <span className={labelClass(false)}>Keranjang</span>
      </button>

      <Link href="/" className={navClass(false)}>
        <UserIcon size={20} />
        <span className={labelClass(false)}>Akun</span>
      </Link>
    </nav>
  );
}
