import Link from "next/link";
import type { Product } from "@/lib/data/types";
import { formatRupiah } from "@/lib/format";
import { ProductImage } from "./product-image";
import { StatusBadge, DiscountBadge } from "./status-badge";
import { AddIconButton, type ProductSnapshot } from "./add-to-cart-button";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  /** Set for above-the-fold cards so the LCP image loads eagerly. */
  priority?: boolean;
}) {
  const { slug, name, imagePath, imageTag, price, oldPrice, inStock } = product;

  const snapshot: ProductSnapshot = {
    slug,
    name,
    price,
    oldPrice,
    imagePath,
    imageTag,
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_10px_28px_-12px_rgba(20,40,30,0.28)] motion-reduce:transform-none ${
        inStock ? "" : "opacity-80"
      }`}
    >
      <Link href={`/product/${slug}`} className="block">
        <div className="relative">
          <ProductImage
            imagePath={imagePath}
            tag={imageTag}
            alt={name}
            className="h-40"
            priority={priority}
          />
          {oldPrice ? (
            <span className="absolute left-2.5 top-2.5">
              <DiscountBadge oldPrice={oldPrice} price={price} />
            </span>
          ) : null}
          {!inStock ? (
            <span className="absolute left-2.5 top-2.5">
              <StatusBadge inStock={false} />
            </span>
          ) : null}
        </div>
      </Link>
      <div className="p-3.5">
        <Link href={`/product/${slug}`}>
          <h3 className="text-[13.5px] font-bold leading-tight text-ink">
            {name}
          </h3>
        </Link>
        <div className="mt-1.5">
          <StatusBadge inStock={inStock} />
        </div>
        <div className="mt-2 h-4 text-[11px]">
          {oldPrice ? (
            <span className="text-[#a7afa6] line-through">
              {formatRupiah(oldPrice)}
            </span>
          ) : null}
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <span
            className={`text-[17px] font-extrabold ${
              inStock ? "text-forest" : "text-ink"
            }`}
          >
            {formatRupiah(price)}
          </span>
          <AddIconButton product={snapshot} disabled={!inStock} />
        </div>
      </div>
    </div>
  );
}
