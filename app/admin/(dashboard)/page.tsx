import Link from "next/link";
import { listOrders } from "@/lib/data/orders";
import { getProducts } from "@/lib/data/products";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [orders, products] = await Promise.all([listOrders(), getProducts()]);

  const revenue = orders
    .filter((o) => ["paid", "confirmed", "done"].includes(o.status))
    .reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const awaitingCheck = orders.filter((o) => o.status === "paid").length;
  const lowStock = products
    .filter((p) => p.stock <= 5)
    .sort((a, b) => a.stock - b.stock);

  const stats = [
    { label: "Total Pesanan", value: String(orders.length) },
    { label: "Pendapatan", value: formatRupiah(revenue) },
    { label: "Perlu Dicek", value: String(awaitingCheck), accent: true },
    { label: "Menunggu Bayar", value: String(pending) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Ringkasan toko Goldstar.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line bg-white p-4"
          >
            <div className="text-[12px] font-semibold text-faint">
              {s.label}
            </div>
            <div
              className={`mt-1.5 text-xl font-extrabold ${
                s.accent ? "text-gold" : "text-ink"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-extrabold text-ink">
              Pesanan Terbaru
            </h2>
            <Link
              href="/admin/orders"
              className="text-[12px] font-semibold text-forest"
            >
              Lihat semua
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">Belum ada pesanan.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="font-mono text-[12.5px] text-ink">
                      {o.orderNo}
                    </span>
                    <span className="text-[12.5px] text-muted">
                      {o.customerName}
                    </span>
                    <span className="text-[12.5px] font-bold text-forest">
                      {formatRupiah(o.total)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Low stock */}
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 text-base font-extrabold text-ink">
            Stok Menipis
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">Semua stok aman.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-line">
              {lowStock.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex items-center justify-between py-2.5"
                  >
                    <span className="truncate text-[13px] text-ink">
                      {p.name}
                    </span>
                    <span
                      className={`ml-3 flex-none rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        p.stock === 0
                          ? "bg-danger-bg text-danger"
                          : "bg-[#fbf4e3] text-[#8a6e2c]"
                      }`}
                    >
                      {p.stock === 0 ? "Habis" : `Sisa ${p.stock}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
