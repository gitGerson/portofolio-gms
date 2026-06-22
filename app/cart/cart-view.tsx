"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductImage } from "@/app/components/product-image";
import {
  ChevronLeft,
  ChevronRight,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  TicketIcon,
  BagIcon,
} from "@/app/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/format";

export function CartView() {
  const { items, count, subtotal, discount, total, setQty, remove, ready } =
    useCart();
  const router = useRouter();

  return (
    <>
      {/* Header row */}
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <Link
          href="/"
          aria-label="Kembali"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-line bg-paper text-ink"
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </Link>
        <span className="flex-1 text-[17px] font-extrabold text-ink">
          Keranjang
        </span>
        <span className="text-xs text-faint">{count} item</span>
      </div>

      {ready && items.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-faint">
            <BagIcon size={28} />
          </span>
          <p className="mt-4 text-base font-bold text-ink">
            Keranjang masih kosong
          </p>
          <p className="mt-1 text-sm text-muted">
            Yuk, cari produk favoritmu dulu.
          </p>
          <Link
            href="/"
            className="mt-5 rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-2xl px-4 pt-4">
          <div className="flex flex-col gap-3.5">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex gap-3 rounded-2xl border border-line bg-white p-3"
              >
                <Link href={`/product/${item.slug}`} className="flex-none">
                  <ProductImage
                    imagePath={item.imagePath}
                    tag={item.imageTag}
                    alt={item.name}
                    className="h-[78px] w-[78px] rounded-xl"
                    sizes="78px"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-[13.5px] font-bold leading-tight text-ink"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      aria-label="Hapus item"
                      onClick={() => remove(item.slug)}
                      className="flex-none text-[#c0a8a8] hover:text-danger"
                    >
                      <TrashIcon size={17} />
                    </button>
                  </div>
                  {item.oldPrice ? (
                    <div className="mt-1 text-[11px] text-faint line-through">
                      {formatRupiah(item.oldPrice * item.qty)}
                    </div>
                  ) : (
                    <div className="mt-1 h-[14px]" />
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[15px] font-extrabold text-forest">
                      {formatRupiah(item.lineTotal)}
                    </div>
                    <div className="flex items-center overflow-hidden rounded-[9px] border border-line-strong">
                      <button
                        type="button"
                        aria-label="Kurangi"
                        onClick={() => setQty(item.slug, item.qty - 1)}
                        className="flex h-[30px] w-[30px] items-center justify-center bg-paper text-ink"
                      >
                        <MinusIcon size={14} strokeWidth={2.4} />
                      </button>
                      <span className="w-[30px] text-center text-[13px] font-extrabold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        aria-label="Tambah"
                        onClick={() => setQty(item.slug, item.qty + 1)}
                        className="flex h-[30px] w-[30px] items-center justify-center bg-paper text-ink"
                      >
                        <PlusIcon size={14} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Voucher */}
            <button
              type="button"
              className="flex items-center gap-2.5 rounded-2xl border border-dashed border-[#d8d3c6] bg-white px-3.5 py-3 text-left"
            >
              <TicketIcon size={18} className="text-gold" />
              <span className="flex-1 text-[12.5px] font-semibold text-ink">
                Pakai voucher / kode promo
              </span>
              <ChevronRight size={16} className="text-faint" />
            </button>
          </div>

          {/* Summary */}
          <div className="sticky bottom-16 mt-4 rounded-2xl border border-line bg-white p-4 md:bottom-4">
            <div className="mb-2 flex justify-between text-[13px] text-muted">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="mb-2 flex justify-between text-[13px] text-ready">
                <span>Diskon promo</span>
                <span>− {formatRupiah(discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-dashed border-line pt-2.5 text-base font-extrabold text-ink">
              <span>Total</span>
              <span className="text-forest">{formatRupiah(total)}</span>
            </div>
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="mt-3.5 flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-forest text-[15px] font-bold text-white transition-colors hover:bg-forest-dark"
            >
              Lanjut ke Checkout
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
