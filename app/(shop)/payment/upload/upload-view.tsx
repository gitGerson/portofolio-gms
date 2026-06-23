"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CheckIcon,
  ClockIcon,
  WhatsAppIcon,
} from "@/app/components/icons";
import { Placeholder } from "@/app/components/placeholder";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/format";
import { useOrderNo, clearOrderNo } from "@/lib/order";
import { waLink, orderMessage } from "@/lib/whatsapp";
import { getOrderAction, submitProofAction } from "@/app/actions/orders";
import type { Order } from "@/lib/data/types";

export function UploadView() {
  const { clear } = useCart();
  const { orderNo, loaded } = useOrderNo();
  const [order, setOrder] = useState<Order | null>(null);
  const [resolved, setResolved] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loaded || !orderNo) return;
    let active = true;
    getOrderAction(orderNo).then((o) => {
      if (active) {
        setOrder(o);
        setResolved(true);
      }
    });
    return () => {
      active = false;
    };
  }, [orderNo, loaded]);

  const noOrder = loaded && (!orderNo || (resolved && !order));

  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  }

  function sendConfirmation() {
    if (!order || !file) return;
    setError("");
    startTransition(async () => {
      const fd = new FormData();
      fd.append("proof", file);
      const result = await submitProofAction(order.orderNo, fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const msg = orderMessage({
        orderNo: order.orderNo,
        items: order.items.map((i) => ({
          name: i.productName,
          qty: i.qty,
          lineTotal: i.lineTotal,
        })),
        total: order.total,
        name: order.customerName,
      });
      window.open(waLink(msg), "_blank", "noopener,noreferrer");
      setSent(true);
      clear();
      clearOrderNo();
    });
  }

  if (noOrder && !sent) {
    return (
      <div className="px-6 py-24 text-center">
        <p className="text-base font-bold text-ink">Belum ada pesanan</p>
        <p className="mt-1 text-sm text-muted">
          Mulai belanja untuk membuat pesanan baru.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const fileSizeKb = file ? Math.max(1, Math.round(file.size / 1024)) : null;

  return (
    <>
      <div className="flex items-center gap-3 border-b border-line bg-white px-4 py-3">
        <Link
          href="/payment"
          aria-label="Kembali"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-line bg-paper text-ink"
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </Link>
        <span className="flex-1 text-base font-extrabold text-ink">
          Upload Bukti Bayar
        </span>
      </div>

      <div className="mx-auto w-full max-w-md px-4 pt-4">
        {/* Order summary strip */}
        <div className="mb-4 flex items-center justify-between rounded-[14px] border border-line bg-white px-3.5 py-3">
          <div className="text-[12.5px] text-muted">
            Pesanan{" "}
            <b className="font-mono text-ink">{order?.orderNo ?? "—"}</b>
          </div>
          <div className="text-sm font-extrabold text-forest">
            {order ? formatRupiah(order.total) : "—"}
          </div>
        </div>

        <h2 className="mb-2 text-[12.5px] font-bold text-ink">Bukti Transfer</h2>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={pickFile}
        />

        {file ? (
          <div className="overflow-hidden rounded-2xl border border-line-strong bg-white">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Pratinjau bukti transfer"
                className="h-[188px] w-full object-cover"
              />
            ) : (
              <Placeholder tag="bukti transfer" className="h-[188px]" />
            )}
            <div className="flex items-center gap-2.5 border-t border-line px-3.5 py-3">
              <CheckIcon size={17} className="text-ready" />
              <div className="flex-1 truncate text-xs font-semibold text-[#2a3830]">
                {file.name}{" "}
                <span className="font-medium text-faint">· {fileSizeKb} KB</span>
              </div>
              {!sent ? (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs font-bold text-forest"
                >
                  Ganti
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-[188px] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-white text-faint"
          >
            <span className="text-sm font-semibold text-forest">
              Pilih gambar bukti transfer
            </span>
            <span className="text-[11px] text-faint">JPG / PNG</span>
          </button>
        )}

        {/* Status */}
        <div className="mt-4 flex items-start gap-3 rounded-[14px] border border-[#f0e2bf] bg-[#fbf4e3] p-3.5">
          <ClockIcon size={22} className="flex-none text-[#b08423]" />
          <div>
            <div className="text-[13.5px] font-extrabold text-[#7a5c14]">
              {sent ? "Bukti Terkirim — Menunggu Konfirmasi" : "Menunggu Pembayaran"}
            </div>
            <div className="mt-0.5 text-xs leading-relaxed text-[#8a6e2c]">
              {sent
                ? "Admin akan mengecek bukti pembayaranmu & mengonfirmasi pesanan via WhatsApp."
                : "Upload bukti pembayaranmu, lalu kirim untuk dikonfirmasi admin via WhatsApp."}
            </div>
          </div>
        </div>

        {/* WA help */}
        <a
          href={waLink("Halo Goldstar, saya butuh bantuan untuk pesanan saya.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center gap-3 rounded-[14px] border border-line bg-white p-3.5"
        >
          <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] bg-[#e7f5ee] text-wa">
            <WhatsAppIcon size={20} />
          </span>
          <span className="flex-1">
            <span className="block text-[12.5px] font-bold text-ink">
              Butuh bantuan?
            </span>
            <span className="block text-[11.5px] text-faint">
              Chat admin lewat WhatsApp
            </span>
          </span>
          <ChevronRight size={16} className="text-faint" />
        </a>

        {error ? (
          <p className="mt-3 rounded-lg bg-danger-bg px-3 py-2 text-[12.5px] font-semibold text-danger">
            {error}
          </p>
        ) : null}

        <div className="sticky bottom-16 mt-4 md:bottom-4">
          {sent ? (
            <div className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] border border-[#cfe3d8] bg-[#e7f1ec] text-[14.5px] font-bold text-ready">
              <CheckIcon size={18} strokeWidth={2.4} /> Bukti Pembayaran Terkirim
            </div>
          ) : (
            <button
              type="button"
              disabled={!file || pending}
              onClick={sendConfirmation}
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-forest text-[14.5px] font-bold text-white transition-colors hover:bg-forest-dark disabled:cursor-not-allowed disabled:bg-[#e7e3d9] disabled:text-[#9aa39c]"
            >
              <WhatsAppIcon size={18} />{" "}
              {pending ? "Mengirim…" : "Kirim & Konfirmasi via WhatsApp"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
