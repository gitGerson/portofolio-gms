import type { OrderStatus } from "@/lib/data/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "confirmed",
  "done",
  "cancelled",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Menunggu Bayar",
  paid: "Sudah Bayar",
  confirmed: "Dikonfirmasi",
  done: "Selesai",
  cancelled: "Dibatalkan",
};

/** Tailwind classes for a status pill. */
export const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-[#fbf4e3] text-[#8a6e2c]",
  paid: "bg-[#e7eef9] text-[#3a5a99]",
  confirmed: "bg-ready-bg text-ready",
  done: "bg-[#e9e6dd] text-muted",
  cancelled: "bg-danger-bg text-danger",
};
