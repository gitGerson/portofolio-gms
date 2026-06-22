"use client";

import { useEffect, useState } from "react";
import { ProductImage } from "@/app/components/product-image";
import { productImageUrl } from "@/lib/images";

/**
 * Product image with tap-to-zoom lightbox. Built around a single image_path
 * today; pass more entries once multi-image is added.
 */
export function Gallery({
  imagePath,
  imageTag,
  name,
  discountPct,
}: {
  imagePath: string | null;
  imageTag: string | null;
  name: string;
  discountPct: number | null;
}) {
  const [zoom, setZoom] = useState(false);
  const fullUrl = productImageUrl(imagePath);
  const canZoom = Boolean(fullUrl);

  useEffect(() => {
    if (!zoom) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoom]);

  return (
    <div className="bg-white md:flex-1">
      <div className="hero-rise relative mx-4 mt-4 h-60 overflow-hidden rounded-[18px] md:mx-0 md:h-[420px]">
        <button
          type="button"
          onClick={() => canZoom && setZoom(true)}
          aria-label={canZoom ? "Perbesar gambar" : undefined}
          className={`block h-full w-full ${canZoom ? "cursor-zoom-in" : "cursor-default"}`}
        >
          <ProductImage
            imagePath={imagePath}
            tag={`foto produk · ${imageTag ?? name}`}
            alt={name}
            className="h-full"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </button>
        {discountPct ? (
          <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-gold px-2.5 py-[3px] text-[11px] font-extrabold text-ink">
            PROMO −{discountPct}%
          </span>
        ) : null}
        {canZoom ? (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-ink/70 px-2 py-1 text-[10px] font-semibold text-white">
            Ketuk untuk perbesar
          </span>
        ) : null}
      </div>

      {/* Thumbnail strip (single image for now) */}
      {fullUrl ? (
        <div className="flex gap-2.5 px-4 pb-1 pt-3 md:px-0">
          <div className="h-[54px] w-[54px] overflow-hidden rounded-[11px] border-2 border-forest">
            <ProductImage
              imagePath={imagePath}
              tag={imageTag}
              alt={name}
              className="h-full w-full"
              sizes="54px"
            />
          </div>
        </div>
      ) : null}

      {/* Lightbox */}
      {zoom && fullUrl ? (
        <div
          className="fixed inset-0 z-[75] flex items-center justify-center bg-ink/85 p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullUrl}
            alt={name}
            className="dialog-in max-h-full max-w-full rounded-xl object-contain"
          />
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label="Tutup"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg text-white"
          >
            ✕
          </button>
        </div>
      ) : null}
    </div>
  );
}
