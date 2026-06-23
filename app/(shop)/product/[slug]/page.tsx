import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, StarIcon } from "@/app/components/icons";
import type { ProductSnapshot } from "@/app/components/add-to-cart-button";
import { formatRupiah } from "@/lib/format";
import { getProductBySlug } from "@/lib/data/products";
import { ProductActions } from "./product-actions";
import { Gallery } from "./gallery";

export const revalidate = 60;

function Stars({ rating = 0 }: { rating?: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          size={14}
          filled
          className={i < full ? "" : "text-[#e3ddd0]"}
        />
      ))}
    </div>
  );
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const snapshot: ProductSnapshot = {
    slug: product.slug,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice,
    imagePath: product.imagePath,
    imageTag: product.imageTag,
  };

  const discountPct =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100,
        )
      : null;

  return (
    <div className="md:flex md:gap-10 md:px-10 md:py-8">
        {/* Back bar (mobile) */}
        <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3 md:hidden">
          <Link
            href={
              product.categorySlug ? `/category/${product.categorySlug}` : "/"
            }
            aria-label="Kembali"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-line bg-paper text-ink"
          >
            <ChevronLeft size={18} strokeWidth={2.2} />
          </Link>
          <span className="flex-1 text-[15px] font-bold text-ink">
            Detail Produk
          </span>
        </div>

        {/* Gallery */}
        <Gallery
          imagePath={product.imagePath}
          imageTag={product.imageTag}
          name={product.name}
          discountPct={discountPct}
        />

        {/* Info */}
        <div className="md:flex md:w-[420px] md:flex-none md:flex-col">
          <div className="px-[18px] pb-5 pt-2 md:px-0">
            {product.categoryName ? (
              <div className="font-mono text-[11px] tracking-wide text-[#8b9890]">
                {product.categoryName.toUpperCase()}
              </div>
            ) : null}
            <h1 className="mt-1.5 text-[21px] font-extrabold leading-tight text-ink md:text-2xl">
              {product.name}
            </h1>

            <div className="mt-2.5 flex items-center gap-2">
              <Stars rating={product.rating ?? 0} />
              {product.rating ? (
                <span className="text-xs font-semibold text-muted">
                  {product.rating.toFixed(1)}
                </span>
              ) : null}
              {product.sold ? (
                <span className="text-xs text-faint">
                  · {product.sold} terjual
                </span>
              ) : null}
            </div>

            <div className="mt-3.5 flex items-end gap-2.5">
              <div className="text-[26px] font-extrabold text-forest">
                {formatRupiah(product.price)}
              </div>
              {product.oldPrice ? (
                <div className="pb-1 text-[13px] text-[#a7afa6] line-through">
                  {formatRupiah(product.oldPrice)}
                </div>
              ) : null}
            </div>

            <div className="mt-2.5">
              {product.inStock ? (
                <span className="inline-block rounded-md bg-ready-bg px-2.5 py-1 text-[11px] font-bold text-ready">
                  ● Ready{product.stock ? ` · Stok ${product.stock}` : ""}
                </span>
              ) : (
                <span className="inline-block rounded-md bg-danger-bg px-2.5 py-1 text-[11px] font-bold text-danger">
                  ● Stok Habis
                </span>
              )}
            </div>

            <div className="my-[18px] h-px bg-line" />

            {product.description ? (
              <>
                <h2 className="mb-2 text-sm font-bold text-ink">Deskripsi</h2>
                <p className="text-[13px] leading-relaxed text-muted">
                  {product.description}
                </p>
              </>
            ) : null}

            {product.highlights.length > 0 ? (
              <ul className="mt-3.5 flex flex-col gap-[7px]">
                {product.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-[12.5px] text-muted">
                    <span className="font-bold text-forest">·</span> {h}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {/* Sticky add bar */}
          <div className="sticky bottom-16 md:bottom-0 md:mt-auto md:rounded-b-2xl">
            <ProductActions product={snapshot} inStock={product.inStock} />
          </div>
        </div>
    </div>
  );
}
