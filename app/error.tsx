"use client";

import Link from "next/link";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-board px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-2xl font-extrabold text-gold">
        G
      </span>
      <h1 className="mt-5 text-xl font-extrabold text-ink">
        Ada yang tidak beres
      </h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
        Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-[12px] bg-forest px-5 text-sm font-bold text-white transition-transform active:scale-[0.97] motion-reduce:transform-none hover:bg-forest-dark"
        >
          Coba lagi
        </button>
        <Link
          href="/"
          className="flex h-11 items-center rounded-[12px] border border-line bg-white px-5 text-sm font-semibold text-muted hover:text-ink"
        >
          Ke Beranda
        </Link>
      </div>
    </div>
  );
}
