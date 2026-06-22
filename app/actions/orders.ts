"use server";

import {
  createOrder,
  getOrderByNo,
  attachProof,
  type NewOrderInput,
} from "@/lib/data/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/data/types";

export type CreateOrderResult =
  | { ok: true; orderNo: string }
  | { ok: false; error: string };

/** Create an order from the cart. Totals are recomputed server-side from the DB. */
export async function createOrderAction(
  input: NewOrderInput,
): Promise<CreateOrderResult> {
  try {
    if (!input.customerName?.trim() || !input.whatsapp?.trim() || !input.address?.trim()) {
      return { ok: false, error: "Data pembeli belum lengkap." };
    }
    if (!input.items || input.items.length === 0) {
      return { ok: false, error: "Keranjang kosong." };
    }
    const order = await createOrder({
      customerName: input.customerName.trim(),
      whatsapp: input.whatsapp.trim(),
      address: input.address.trim(),
      note: input.note?.trim() || undefined,
      items: input.items,
    });
    return { ok: true, orderNo: order.orderNo };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal membuat pesanan.",
    };
  }
}

/** Fetch an order by its number (for the payment + upload pages). */
export async function getOrderAction(orderNo: string): Promise<Order | null> {
  if (!orderNo) return null;
  return getOrderByNo(orderNo);
}

export type SubmitProofResult =
  | { ok: true }
  | { ok: false; error: string };

/** Upload a payment proof image and mark the order as paid. */
export async function submitProofAction(
  orderNo: string,
  formData: FormData,
): Promise<SubmitProofResult> {
  try {
    const file = formData.get("proof");
    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, error: "Pilih file bukti terlebih dahulu." };
    }
    const order = await getOrderByNo(orderNo);
    if (!order) return { ok: false, error: "Pesanan tidak ditemukan." };

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${order.id}/${Date.now()}.${ext}`;

    const admin = createAdminClient();
    const { error: uploadErr } = await admin.storage
      .from("payment-proofs")
      .upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: true,
      });
    if (uploadErr) return { ok: false, error: uploadErr.message };

    await attachProof(orderNo, path);
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Gagal mengunggah bukti.",
    };
  }
}
