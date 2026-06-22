"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ClockIcon, UploadIcon } from "@/app/components/icons";
import { STORE } from "@/lib/products";
import { formatRupiah } from "@/lib/format";
import { useOrderNo } from "@/lib/order";
import { getOrderAction } from "@/app/actions/orders";
import type { Order } from "@/lib/data/types";

function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <span>
      {mm}:{ss}
    </span>
  );
}

/** Decorative QRIS code — purely visual, no real payload. */
function FauxQr() {
  return (
    <div
      className="relative mx-auto h-[196px] w-[196px] overflow-hidden rounded-[10px] border border-line bg-white"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-85"
        style={{
          background: "repeating-conic-gradient(#13231b 0% 25%, #fff 0% 50%)",
          backgroundSize: "14px 14px",
        }}
      />
      <div className="absolute left-3 top-3 h-11 w-11 rounded-md border-[7px] border-ink bg-white" />
      <div className="absolute right-3 top-3 h-11 w-11 rounded-md border-[7px] border-ink bg-white" />
      <div className="absolute bottom-3 left-3 h-11 w-11 rounded-md border-[7px] border-ink bg-white" />
      <div className="absolute left-1/2 top-1/2 flex h-[38px] w-[38px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-white">
        <div className="h-[22px] w-[22px] rounded-md bg-gold" />
      </div>
    </div>
  );
}

export function PaymentView() {
  const router = useRouter();
  const { orderNo, loaded } = useOrderNo();
  const [order, setOrder] = useState<Order | null>(null);
  const [resolved, setResolved] = useState(false);

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

  // No order to pay for: either nothing was handed off, or the lookup came back empty.
  const noOrder = loaded && (!orderNo || (resolved && !order));

  if (noOrder) {
    return (
      <div className="px-6 py-24 text-center">
        <p className="text-base font-bold text-ink">
          Belum ada pesanan untuk dibayar
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-xl bg-forest px-5 py-3 text-sm font-bold text-white"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 bg-forest px-4 py-3 text-white">
        <Link
          href="/checkout"
          aria-label="Kembali"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-white/12 text-white"
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </Link>
        <span className="flex-1 text-[17px] font-extrabold">Pembayaran</span>
      </div>

      <div className="mx-auto w-full max-w-md px-[18px] pt-[18px]">
        {/* Order + total */}
        <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-4 py-3.5">
          <div>
            <div className="font-mono text-[11px] text-faint">NO. PESANAN</div>
            <div className="mt-0.5 font-mono text-[13.5px] font-bold text-ink">
              {order?.orderNo ?? "…"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-faint">Total Bayar</div>
            <div className="mt-0.5 text-lg font-extrabold text-forest">
              {order ? formatRupiah(order.total) : "—"}
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="mt-3.5 flex items-center justify-center gap-2 text-[12.5px] font-semibold text-danger">
          <ClockIcon size={15} />
          Selesaikan dalam <Countdown seconds={23 * 60 + 45} />
        </div>

        {/* QRIS card */}
        <div className="mt-3.5 rounded-[18px] border border-line bg-white p-[18px] text-center">
          <div className="mb-3.5 flex items-center justify-center gap-2">
            <div className="text-[15px] font-extrabold tracking-tight text-ink">
              QRIS
            </div>
            <div className="border-l border-line-strong pl-2 text-[10px] text-faint">
              {STORE.name.toUpperCase()} {STORE.tagline.toUpperCase()}
            </div>
          </div>
          <FauxQr />
          <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
            Scan dengan aplikasi e-wallet / m-banking
            <br />
            apa pun yang mendukung QRIS
          </p>
        </div>

        {/* Instructions */}
        <ol className="mt-4 flex flex-col gap-2.5">
          {[
            "Buka aplikasi pembayaran, pilih scan QRIS",
            `Bayar sesuai total ${order ? formatRupiah(order.total) : ""}`,
            "Screenshot bukti, lalu upload di halaman berikut",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="flex h-[19px] w-[19px] flex-none items-center justify-center rounded-full bg-forest text-[10px] font-extrabold text-white">
                {i + 1}
              </span>
              <span className="text-[12.5px] leading-snug text-muted">
                {step}
              </span>
            </li>
          ))}
        </ol>

        <div className="sticky bottom-16 mt-5 flex gap-2.5 md:bottom-4">
          <button
            type="button"
            onClick={() => router.push("/payment/upload")}
            className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-forest text-[14.5px] font-bold text-white transition-colors hover:bg-forest-dark"
          >
            <UploadIcon size={18} /> Upload Bukti Pembayaran
          </button>
        </div>
      </div>
    </>
  );
}
