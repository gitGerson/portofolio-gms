import Link from "next/link";
import { listOrders } from "@/lib/data/orders";
import type { OrderStatus } from "@/lib/data/types";
import { ORDER_STATUSES, STATUS_LABEL } from "./status-meta";
import { OrdersTable } from "./orders-table";

export const dynamic = "force-dynamic";

function isStatus(v: string | undefined): v is OrderStatus {
  return !!v && (ORDER_STATUSES as string[]).includes(v);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = isStatus(status) ? status : undefined;
  const orders = await listOrders(filter);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">Pesanan</h1>

      {/* Status filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
            !filter ? "bg-forest text-white" : "bg-white text-muted border border-line"
          }`}
        >
          Semua
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full px-3 py-1.5 text-[12.5px] font-semibold ${
              filter === s
                ? "bg-forest text-white"
                : "border border-line bg-white text-muted"
            }`}
          >
            {STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <p className="p-8 text-center text-sm text-muted">
            Tidak ada pesanan
            {filter ? ` dengan status "${STATUS_LABEL[filter]}"` : ""}.
          </p>
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </div>
  );
}
