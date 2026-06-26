import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/app/components/product-card";
import { PromoHeroSlider } from "@/app/components/promo-hero-slider";
import { Placeholder } from "@/app/components/placeholder";
import { productImageUrl } from "@/lib/images";
import { getCategories } from "@/lib/data/categories";
import { getPromos, getLatestPromos, getFeatured } from "@/lib/data/products";
import type { Category } from "@/lib/data/types";

// Catalog is admin-editable; ISR keeps navigation fast and revalidates on edits
// (admin write actions call revalidatePath). Reads use the cookie-less public client.
export const revalidate = 60;

export default async function HomePage() {
  const [categories, promos, latestPromos, featured] = await Promise.all([
    getCategories().catch((): Category[] => []),
    getPromos().catch(() => []),
    getLatestPromos(5).catch(() => []),
    getFeatured().catch(() => []),
  ]);

  return (
    <div className="px-[18px] pt-[18px] md:px-10 md:pt-7">
        {/* Hero — promo slider (falls back to static hero when no promos) */}
        <PromoHeroSlider promos={latestPromos} />

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
              {categories.map((cat) => {
                const iconUrl = productImageUrl(cat.imagePath);
                return (
                  <Link
                    key={cat.slug}
                    href={`/category?cat=${cat.slug}`}
                    className="rounded-[15px] border border-line bg-white p-3 text-center text-ink md:flex md:items-center md:gap-3 md:p-4 md:text-left"
                  >
                    {iconUrl ? (
                      <div className="relative mb-2 h-12 overflow-hidden rounded-[10px] md:mb-0 md:h-[46px] md:w-[46px] md:flex-none md:rounded-[11px]">
                        <Image
                          src={iconUrl}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 768px) 33vw, 46px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Placeholder className="mb-2 h-12 rounded-[10px] md:mb-0 md:h-[46px] md:w-[46px] md:flex-none md:rounded-[11px]" />
                    )}
                    <span className="text-[11.5px] font-semibold leading-tight md:text-sm md:font-bold">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
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
