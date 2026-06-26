"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/data/types";
import { productImageUrl } from "@/lib/images";
import { Placeholder } from "./placeholder";

const HERO_SHELL =
  "relative flex h-[142px] flex-col justify-center overflow-hidden rounded-[20px] bg-forest-dark px-5 text-white md:h-[208px] md:px-11";

const AUTOPLAY_MS = 5000;

function discountPct(price: number, oldPrice: number | null): number | null {
  if (!oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/**
 * Homepage hero. Rotates through the latest promo products; falls back to the
 * static hero copy when there are none. setState only happens inside the
 * autoplay timer / event callbacks (never synchronously in an effect body).
 */
export function PromoHeroSlider({ promos }: { promos: Product[] }) {
  const count = promos.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  // No promos → keep the original static hero so the homepage never looks empty.
  if (count === 0) {
    return (
      <section className={HERO_SHELL}>
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
            Diskon spesial charger &amp; kabel
          </h1>
          <div className="mt-1.5 text-xs text-[#a8cdba] md:hidden">
            Berlaku terbatas
          </div>
          <Link
            href="/promo"
            className="mt-4 hidden h-11 items-center rounded-xl bg-gold px-[22px] text-sm font-bold text-ink md:inline-flex"
          >
            Belanja Sekarang
          </Link>
        </div>
      </section>
    );
  }

  const current = promos[index];
  const imageUrl = productImageUrl(current.imagePath);
  const pct = discountPct(current.price, current.oldPrice);

  return (
    <section
      className={HERO_SHELL}
      aria-roledescription="carousel"
      aria-label="Produk promo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="absolute -right-8 -top-8 h-[130px] w-[130px] rounded-full bg-gold/20 md:h-[260px] md:w-[260px]" />

      <AnimatePresence mode="wait">
        <motion.div
          key={current.slug}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -18 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="contents"
        >
          {imageUrl ? (
            <Link
              href={`/product/${current.slug}`}
              className="absolute right-3.5 bottom-3.5 hidden h-16 w-16 overflow-hidden rounded-[14px] md:right-12 md:top-1/2 md:bottom-auto md:flex md:h-[150px] md:w-[150px] md:-translate-y-1/2 md:rounded-[18px]"
            >
              <Image
                src={imageUrl}
                alt={current.name}
                fill
                sizes="150px"
                className="object-cover"
                priority
              />
            </Link>
          ) : (
            <Placeholder
              tag="product shot"
              className="absolute right-3.5 bottom-3.5 hidden h-16 w-16 rounded-[14px] md:right-12 md:top-1/2 md:bottom-auto md:flex md:h-[150px] md:w-[150px] md:-translate-y-1/2 md:rounded-[18px]"
            />
          )}

          <div className="relative max-w-[210px] md:max-w-[560px]">
            <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-gold md:text-xs md:tracking-[0.16em]">
              {current.promoTitle ?? "PROMO"}
              {pct !== null ? ` · DISKON ${pct}%` : ""}
            </div>
            <h1 className="mt-1.5 line-clamp-2 text-[22px] font-extrabold leading-tight md:mt-2.5 md:text-4xl">
              {current.name}
            </h1>
            <Link
              href={`/product/${current.slug}`}
              className="mt-4 hidden h-11 items-center rounded-xl bg-gold px-[22px] text-sm font-bold text-ink md:inline-flex"
            >
              Belanja Sekarang
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="Promo sebelumnya"
            onClick={() => go(index - 1)}
            className="absolute left-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 md:flex"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Promo berikutnya"
            onClick={() => go(index + 1)}
            className="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm hover:bg-white/25 md:flex"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-5 z-10 flex gap-1.5 md:left-11">
            {promos.map((p, i) => (
              <button
                key={p.slug}
                type="button"
                aria-label={`Ke promo ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-gold" : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
