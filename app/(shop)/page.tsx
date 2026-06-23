import Link from "next/link";
import { ProductCard } from "@/app/components/product-card";
import { Placeholder } from "@/app/components/placeholder";
import { getCategories } from "@/lib/data/categories";
import { getPromos, getFeatured } from "@/lib/data/products";
import type { Category } from "@/lib/data/types";

// Catalog is admin-editable; ISR keeps navigation fast and revalidates on edits
// (admin write actions call revalidatePath). Reads use the cookie-less public client.
export const revalidate = 60;

export default async function HomePage() {
  const [categories, promos, featured] = await Promise.all([
    getCategories().catch((): Category[] => []),
    getPromos().catch(() => []),
    getFeatured().catch(() => []),
  ]);

  const shopHref = categories[2]
    ? `/category/${categories[2].slug}`
    : categories[0]
      ? `/category/${categories[0].slug}`
      : "/";

  return (
    <div className="px-[18px] pt-[18px] md:px-10 md:pt-7">
        {/* Hero banner */}
        <section className="relative flex h-[142px] flex-col justify-center overflow-hidden rounded-[20px] bg-forest-dark px-5 text-white md:h-[208px] md:px-11">
          <div className="absolute -right-8 -top-8 h-[130px] w-[130px] rounded-full bg-gold/20 md:h-[260px] md:w-[260px]" />
          <Placeholder
            tag="product shot"
            className="absolute right-3.5 bottom-3.5 hidden h-16 w-16 rounded-[14px] md:right-12 md:top-1/2 md:bottom-auto md:flex md:h-[150px] md:w-[150px] md:-translate-y-1/2 md:rounded-[18px]"
          />
          <div className="relative max-w-[200px] md:max-w-[560px]">
            <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-gold md:text-xs md:tracking-[0.16em]">
              PROMO MINGGU INI
            </div>
            <h1 className="mt-1.5 text-[22px] font-extrabold leading-tight md:mt-2.5 md:text-4xl">
              Diskon s/d 30% charger &amp; kabel
            </h1>
            <div className="mt-1.5 text-xs text-[#a8cdba] md:hidden">
              Berlaku terbatas
            </div>
            <Link
              href={shopHref}
              className="mt-4 hidden h-11 items-center rounded-xl bg-gold px-[22px] text-sm font-bold text-ink md:inline-flex"
            >
              Belanja Sekarang
            </Link>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 ? (
          <section className="mt-[22px] md:mt-[26px]">
            <div className="mb-3.5 flex items-center justify-between px-0.5">
              <h2 className="text-base font-bold text-ink md:text-lg">
                Kategori
              </h2>
              <Link
                href="/category"
                className="text-xs font-semibold text-forest"
              >
                Lihat semua
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
              {categories.map((cat, i) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className={`rounded-[15px] border p-3 text-center md:flex md:items-center md:gap-3 md:p-4 md:text-left ${
                    i === 2
                      ? "border-forest bg-forest text-white"
                      : "border-line bg-white text-ink"
                  }`}
                >
                  <Placeholder className="mb-2 h-12 rounded-[10px] md:mb-0 md:h-[46px] md:w-[46px] md:flex-none md:rounded-[11px]" />
                  <span className="text-[11.5px] font-semibold leading-tight md:text-sm md:font-bold">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Promo products (mobile) / Featured (desktop) */}
        <section className="mb-8 mt-6 md:mb-10 md:mt-[30px]">
          <div className="mb-3.5 flex items-center justify-between px-0.5">
            <h2 className="text-base font-bold text-ink md:text-lg">
              Promo Hari Ini
            </h2>
          </div>
          {promos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:hidden">
              {promos.map((p, i) => (
                <ProductCard key={p.slug} product={p} priority={i < 2} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted md:hidden">
              Belum ada produk promo.
            </p>
          )}
          <div className="hidden grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-[18px] md:grid">
            {featured.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
        </section>
    </div>
  );
}
