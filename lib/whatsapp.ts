import { STORE } from "./products";
import { formatRupiah } from "./format";

/** Build a wa.me link to the store with an optional prefilled message. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${STORE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

type MessageItem = { name: string; qty: number; lineTotal: number };

/** Compose an order-confirmation message for WhatsApp. */
export function orderMessage(opts: {
  orderNo: string;
  items: MessageItem[];
  total: number;
  name?: string;
}): string {
  const lines = opts.items.map(
    (i) => `• ${i.name} ×${i.qty} — ${formatRupiah(i.lineTotal)}`,
  );
  return [
    `Halo ${STORE.name} ${STORE.tagline}, saya mau konfirmasi pesanan:`,
    ``,
    `No. Pesanan: ${opts.orderNo}`,
    opts.name ? `Nama: ${opts.name}` : null,
    ``,
    ...lines,
    ``,
    `Total: ${formatRupiah(opts.total)}`,
    ``,
    `Bukti pembayaran QRIS sudah saya upload. Mohon dikonfirmasi, terima kasih 🙏`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
}
