import Link from "next/link";
import { STORE } from "@/lib/products";
import { waLink } from "@/lib/whatsapp";
import type { Category } from "@/lib/data/types";
import { BagIcon, WhatsAppIcon } from "./icons";

export function Footer({ categories }: { categories: Category[] }) {
  const primaryCategories = categories.slice(0, 6);

  return (
    <footer className="border-t border-line bg-white">
      <div className="grid gap-8 px-[18px] py-8 md:grid-cols-[1.15fr_1fr_1fr] md:px-10 md:py-10 xl:grid-cols-[1.35fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-forest text-[20px] font-extrabold text-gold">
              G
            </span>
            <span>
              <span className="block text-base font-extrabold leading-none text-ink">
                {STORE.name.toUpperCase()}
              </span>
              <span className="block text-[10px] tracking-wider text-faint">
                {STORE.tagline.toUpperCase()}
              </span>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-muted">
            Belanja charger, kabel data, adaptor, dan NAS storage dengan
            konfirmasi pesanan cepat via WhatsApp.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-ink">Kategori</h2>
          <div className="mt-3 flex flex-col gap-2">
            {primaryCategories.length > 0 ? (
              primaryCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category?cat=${category.slug}`}
                  className="text-[13.5px] font-medium text-muted hover:text-forest"
                >
                  {category.name}
                </Link>
              ))
            ) : (
              <span className="text-[13.5px] text-faint">
                Kategori belum tersedia
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-ink">Toko</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              href="/"
              className="text-[13.5px] font-medium text-muted hover:text-forest"
            >
              Beranda
            </Link>
            <Link
              href="/cart"
              className="text-[13.5px] font-medium text-muted hover:text-forest"
            >
              Keranjang
            </Link>
            <Link
              href="/checkout"
              className="text-[13.5px] font-medium text-muted hover:text-forest"
            >
              Checkout
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-extrabold text-ink">Bantuan</h2>
          <div className="mt-3 flex flex-col gap-3">
            <a
              href={waLink("Halo Goldstar, saya mau tanya produk.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-fit items-center gap-2 rounded-[11px] bg-forest px-4 text-sm font-bold text-white hover:bg-forest-dark"
            >
              <WhatsAppIcon size={17} />
              Chat WhatsApp
            </a>
            <span className="inline-flex items-center gap-2 text-[13.5px] text-muted">
              <BagIcon size={16} />
              QRIS dan konfirmasi via WhatsApp
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-paper px-[18px] py-4 text-[12.5px] text-muted md:px-10">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <span>
            Copyright {new Date().getFullYear()} {STORE.name}. All rights
            reserved.
          </span>
          <span>{STORE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
