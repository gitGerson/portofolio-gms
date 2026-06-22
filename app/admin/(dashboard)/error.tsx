"use client";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-8 text-center">
      <h1 className="text-lg font-extrabold text-ink">Gagal memuat data</h1>
      <p className="mt-1.5 text-sm text-muted">
        Terjadi kesalahan saat mengambil data dari server.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 h-10 rounded-[11px] bg-forest px-5 text-sm font-bold text-white transition-transform active:scale-[0.97] motion-reduce:transform-none hover:bg-forest-dark"
      >
        Coba lagi
      </button>
    </div>
  );
}
