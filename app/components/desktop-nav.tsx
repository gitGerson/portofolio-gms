"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { label: "Beranda", href: "/" },
  { label: "Kategori", href: "/category" },
  { label: "Promo", href: "/" },
  { label: "Tentang", href: "/" },
];

/** Desktop header nav; highlights the active item based on the current path. */
export function DesktopNav() {
  const pathname = usePathname();

  const isActive = (label: string) => {
    if (label === "Beranda") return pathname === "/";
    if (label === "Kategori")
      return pathname.startsWith("/category") || pathname.startsWith("/product");
    return false;
  };

  return (
    <nav className="ml-3.5 flex gap-6">
      {NAV.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`text-sm ${
            isActive(item.label)
              ? "font-bold text-forest"
              : "font-medium text-muted hover:text-forest"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
