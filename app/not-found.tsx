import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-board px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-2xl font-extrabold text-gold">
        G
      </span>
      <div className="mt-5 font-mono text-[12px] tracking-widest text-faint">
        404
      </div>
      <h1 className="mt-1 text-xl font-extrabold text-ink">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
        Halaman atau produk yang kamu cari mungkin sudah dipindahkan atau tidak
        tersedia.
      </p>
      <Link
        href="/"
        className="mt-6 h-11 rounded-[12px] bg-forest px-6 text-sm font-bold leading-[44px] text-white transition-transform active:scale-[0.97] motion-reduce:transform-none hover:bg-forest-dark"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
