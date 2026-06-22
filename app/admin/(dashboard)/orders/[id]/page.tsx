import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, proofSignedUrl } from "@/lib/data/orders";
import { formatRupiah } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";
import { ChevronLeft, WhatsAppIcon } from "@/app/components/icons";
import { StatusSelect } from "../status-select";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const proofUrl = order.proofPath
    ? await proofSignedUrl(order.proofPath)
    : null;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-[13px] font-semibold text-muted hover:text-ink"
      >
        <ChevronLeft size={16} /> Semua pesanan
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-xl font-extrabold text-ink">
            {order.orderNo}
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {new Date(order.createdAt).toLocaleString("id-ID")}
          </p>
        </div>
        <StatusSelect orderId={order.id} current={order.status} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Buyer */}
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 text-base font-extrabold text-ink">
            Data Pembeli
          </h2>
          <dl className="flex flex-col gap-2 text-[13px]">
            <div className="flex justify-between gap-3">
              <dt className="text-faint">Nama</dt>
              <dd className="text-right font-semibold text-ink">
                {order.customerName}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-faint">WhatsApp</dt>
              <dd className="text-right font-semibold text-ink">
                {order.whatsapp}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-faint">Alamat</dt>
              <dd className="text-right text-ink">{order.address}</dd>
            </div>
            {order.note ? (
              <div className="flex justify-between gap-3">
                <dt className="text-faint">Catatan</dt>
                <dd className="text-right text-ink">{order.note}</dd>
              </div>
            ) : null}
          </dl>
          <a
            href={waLink(
              `Halo ${order.customerName}, terima kasih atas pesanan ${order.orderNo} di Goldstar.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-wa px-4 py-2.5 text-[13px] font-bold text-white"
          >
            <WhatsAppIcon size={16} /> Chat pembeli
          </a>
        </section>

        {/* Payment proof */}
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="mb-3 text-base font-extrabold text-ink">
            Bukti Pembayaran
          </h2>
          {proofUrl ? (
            <a href={proofUrl} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proofUrl}
                alt="Bukti pembayaran"
                className="max-h-80 w-full rounded-xl border border-line object-contain"
              />
              <span className="mt-2 block text-[12px] font-semibold text-forest">
                Buka ukuran penuh ↗
              </span>
            </a>
          ) : (
            <p className="text-sm text-muted">
              Pembeli belum mengunggah bukti pembayaran.
            </p>
          )}
        </section>
      </div>

      {/* Items + totals */}
      <section className="mt-6 rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-3 text-base font-extrabold text-ink">
          Item Pesanan
        </h2>
        <ul className="divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2.5 text-[13px]">
              <span className="text-ink">
                {i.productName}{" "}
                <span className="text-faint">
                  × {i.qty} @ {formatRupiah(i.unitPrice)}
                </span>
              </span>
              <span className="font-semibold text-ink">
                {formatRupiah(i.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 border-t border-dashed border-line pt-3 text-[13px]">
          <div className="mb-1 flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount > 0 ? (
            <div className="mb-1 flex justify-between text-ready">
              <span>Diskon</span>
              <span>− {formatRupiah(order.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-base font-extrabold text-ink">
            <span>Total</span>
            <span className="text-forest">{formatRupiah(order.total)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
