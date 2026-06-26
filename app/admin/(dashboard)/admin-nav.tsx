"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Produk", href: "/admin/products" },
  { label: "Kategori", href: "/admin/categories" },
  { label: "Brand", href: "/admin/brands" },
  { label: "Pesanan", href: "/admin/orders" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="-mx-1 flex flex-row gap-1 overflow-x-auto px-1 md:mx-0 md:flex-col md:overflow-visible md:px-0">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 whitespace-nowrap rounded-[10px] px-3 py-2.5 text-sm font-semibold ${
              active
                ? "bg-forest text-white"
                : "text-muted hover:bg-paper hover:text-forest"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
