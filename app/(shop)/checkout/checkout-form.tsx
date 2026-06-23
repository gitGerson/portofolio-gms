"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "@/app/components/icons";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/format";
import { saveOrderNo } from "@/lib/order";
import { createOrderAction } from "@/app/actions/orders";

const FIELD =
  "w-full rounded-[11px] border border-line-strong bg-white px-3.5 py-3 text-[13.5px] text-ink outline-none focus:border-forest";
const LABEL = "mb-1.5 block text-[11.5px] font-semibold text-[#6b7a72]";

export function CheckoutForm() {
  const { items, subtotal, discount, total, ready } = useCart();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const empty = ready && items.length === 0;

  function submit() {
    setError("");
    if (!name.trim() || !whatsapp.trim() || !address.trim()) {
      setError("Mohon lengkapi nama, nomor WhatsApp, dan alamat.");
      return;
    }
    startTransition(async () => {
      const result = await createOrderAction({
        customerName: name,
        whatsapp,
        address,
        note,
        items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      saveOrderNo(result.orderNo);
      router.push("/payment");
    });
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <Link
          href="/cart"
          aria-label="Kembali"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-line bg-paper text-ink"
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </Link>
        <span className="flex-1 text-[17px] font-extrabold text-ink">
          Checkout
        </span>
      </div>

      {empty ? (
        <div className="px-6 py-24 text-center">
          <p className="text-base font-bold text-ink">
            Tidak ada pesanan untuk di-checkout
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-2xl px-4 pt-4">
          <h2 className="mb-3 text-sm font-bold text-ink">Data Pembeli</h2>
          <div className="flex flex-col gap-2.5">
            <div>
              <label className={LABEL}>Nama Lengkap</label>
              <input
                className={FIELD}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama penerima"
              />
            </div>
            <div>
              <label className={LABEL}>Nomor WhatsApp</label>
              <div className="flex items-center gap-2 rounded-[11px] border border-line-strong bg-white px-3.5 focus-within:border-forest">
                <span className="text-faint">+62</span>
                <input
                  className="w-full bg-transparent py-3 text-[13.5px] text-ink outline-none"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="812-3456-7890"
                  inputMode="tel"
                />
              </div>
            </div>
            <div>
              <label className={LABEL}>Alamat Lengkap</label>
              <textarea
                className={`${FIELD} min-h-[62px] resize-none leading-relaxed`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jalan, nomor, kota, kode pos"
              />
            </div>
            <div>
              <label className={LABEL}>
                Catatan{" "}
                <span className="font-medium text-[#b6bdb4]">(opsional)</span>
              </label>
              <input
                className={FIELD}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tinggalkan ke satpam jika tidak ada…"
              />
            </div>
          </div>

          <h2 className="mb-3 mt-5 text-sm font-bold text-ink">
            Ringkasan Pesanan
          </h2>
          <div className="rounded-2xl border border-line bg-white p-3.5">
            {items.map((item) => (
              <div
                key={item.slug}
                className="mb-2 flex justify-between text-[13px] text-[#2a3830]"
              >
                <span>
                  {item.name} <span className="text-faint">×{item.qty}</span>
                </span>
                <span className="font-semibold">
                  {formatRupiah(item.lineTotal)}
                </span>
              </div>
            ))}
            <div className="my-2.5 h-px bg-line" />
            <div className="mb-1.5 flex justify-between text-[12.5px] text-muted">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            {discount > 0 ? (
              <div className="mb-1.5 flex justify-between text-[12.5px] text-ready">
                <span>Diskon promo</span>
                <span>− {formatRupiah(discount)}</span>
              </div>
            ) : null}
            <div className="mb-1.5 flex justify-between text-[12.5px] text-muted">
              <span>Ongkir</span>
              <span className="font-semibold text-gold">Dikonfirmasi admin</span>
            </div>
            <div className="flex justify-between border-t border-dashed border-line pt-2.5 text-base font-extrabold text-ink">
              <span>Total</span>
              <span className="text-forest">{formatRupiah(total)}</span>
            </div>
          </div>
          <p className="mt-2.5 px-0.5 text-[11px] leading-relaxed text-faint">
            Ongkos kirim akan dikonfirmasi admin via WhatsApp sesuai alamat &amp;
            berat paket.
          </p>

          {error ? (
            <p className="mt-3 rounded-lg bg-danger-bg px-3 py-2 text-[12.5px] font-semibold text-danger">
              {error}
            </p>
          ) : null}

          <div className="sticky bottom-16 mt-4 md:bottom-4">
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-forest text-[15px] font-bold text-white transition-transform hover:bg-forest-dark active:scale-[0.99] motion-reduce:transform-none disabled:opacity-70"
            >
              {pending ? "Memproses…" : `Buat Pesanan · ${formatRupiah(total)}`}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
