import Link from "next/link";
import { STORE } from "@/lib/products";
import { UserIcon } from "./icons";
import { CartCount } from "./cart-count";
import { SearchBox } from "./search-box";
import { DesktopNav } from "./desktop-nav";

/**
 * Responsive store header.
 * Mobile: forest banner with logo + search.
 * Desktop (md+): white top-nav with links, search, cart, account.
 */
export function Header() {
  return (
    <header>
      {/* Mobile header */}
      <div className="bg-forest px-[18px] pb-[18px] pt-2.5 text-white md:hidden">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-gold text-[20px] font-extrabold text-ink">
              G
            </span>
            <span className="min-w-0">
              <span className="block text-[17px] font-extrabold leading-tight tracking-tight">
                {STORE.name.toUpperCase()}
              </span>
              <span className="block text-[11px] font-medium tracking-wider text-[#a8cdba]">
                {STORE.tagline.toUpperCase()}
              </span>
            </span>
          </Link>
          <div className="ml-auto">
            <CartCount variant="light" />
          </div>
        </div>
        <div className="mt-4">
          <SearchBox placeholder="Cari kabel, charger, NAS…" variant="light" />
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden h-[70px] items-center gap-7 border-b border-line bg-white px-10 md:flex">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-forest text-[19px] font-extrabold text-gold">
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
        <DesktopNav />
        <div className="ml-auto max-w-[520px] flex-1 xl:max-w-[680px]">
          <SearchBox placeholder="Cari produk…" variant="dark" />
        </div>
        <div className="flex gap-3">
          <CartCount variant="dark" />
          <Link
            href="/"
            aria-label="Akun"
            className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-line text-ink"
          >
            <UserIcon size={19} />
          </Link>
        </div>
      </div>
    </header>
  );
}
