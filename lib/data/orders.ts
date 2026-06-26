import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { mapProduct, PRODUCTS_VIEW, SELECT as PRODUCT_SELECT } from "./products";
import type { Order, OrderItem, OrderStatus } from "./types";

type OrderItemRow = {
  id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  qty: number;
  line_total: number;
};

type OrderRow = {
  id: string;
  order_no: string;
  customer_name: string;
  whatsapp: string;
  address: string;
  note: string | null;
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  proof_path: string | null;
  created_at: string;
  order_items?: OrderItemRow[];
};

const ORDER_SELECT =
  "id, order_no, customer_name, whatsapp, address, note, subtotal, discount, total, status, proof_path, created_at, order_items(id, product_id, product_name, unit_price, qty, line_total)";

function mapItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    unitPrice: row.unit_price,
    qty: row.qty,
    lineTotal: row.line_total,
  };
}

function mapOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNo: row.order_no,
    customerName: row.customer_name,
    whatsapp: row.whatsapp,
    address: row.address,
    note: row.note,
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    status: row.status,
    proofPath: row.proof_path,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map(mapItem),
  };
}

function generateOrderNo(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `#GS-${yy}${mm}${dd}-${seq}`;
}

export type NewOrderInput = {
  customerName: string;
  whatsapp: string;
  address: string;
  note?: string;
  items: { slug: string; qty: number }[];
};

/**
 * Create an order. Totals are recomputed from the DB (authoritative pricing),
 * never trusted from the client. Uses the service-role client so the order can
 * be inserted and read back regardless of RLS.
 */
export async function createOrder(input: NewOrderInput): Promise<Order> {
  const admin = createAdminClient();

  const slugs = input.items.map((i) => i.slug);
  const { data: productRows, error: prodErr } = await admin
    .from(PRODUCTS_VIEW)
    .select(PRODUCT_SELECT)
    .in("slug", slugs);
  if (prodErr) throw prodErr;

  const products = (productRows ?? []).map((r) =>
    mapProduct(r as never),
  );
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const items = input.items
    .map((line) => {
      const p = bySlug.get(line.slug);
      if (!p || !p.inStock) return null;
      const qty = Math.max(1, Math.floor(line.qty));
      return {
        product_id: p.id,
        product_name: p.name,
        unit_price: p.price,
        qty,
        line_total: p.price * qty,
        _old: (p.oldPrice ?? p.price) * qty,
      };
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  if (items.length === 0) {
    throw new Error("Tidak ada produk yang valid untuk dipesan.");
  }

  const subtotal = items.reduce((s, i) => s + i._old, 0);
  const total = items.reduce((s, i) => s + i.line_total, 0);
  const discount = subtotal - total;
  const orderNo = generateOrderNo();

  const { data: orderRow, error: orderErr } = await admin
    .from("orders")
    .insert({
      order_no: orderNo,
      customer_name: input.customerName,
      whatsapp: input.whatsapp,
      address: input.address,
      note: input.note ?? null,
      subtotal,
      discount,
      total,
      status: "pending",
    })
    .select("id")
    .single();
  if (orderErr) throw orderErr;

  const orderId = (orderRow as { id: string }).id;

  const { error: itemsErr } = await admin.from("order_items").insert(
    items.map((i) => ({
      order_id: orderId,
      product_id: i.product_id,
      product_name: i.product_name,
      unit_price: i.unit_price,
      qty: i.qty,
      line_total: i.line_total,
    })),
  );
  if (itemsErr) throw itemsErr;

  const created = await getOrderByNo(orderNo);
  if (!created) throw new Error("Gagal membaca pesanan yang baru dibuat.");
  return created;
}

/** Read a single order by its number (service-role; order_no is the token). */
export async function getOrderByNo(orderNo: string): Promise<Order | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(ORDER_SELECT)
    .eq("order_no", orderNo)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data as OrderRow) : null;
}

/** Attach an uploaded proof path and flip status to "paid". */
export async function attachProof(
  orderNo: string,
  proofPath: string,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ proof_path: proofPath, status: "paid" })
    .eq("order_no", orderNo);
  if (error) throw error;
}

/* ---- Admin-panel reads/writes (RLS-bound to the signed-in admin) ---------- */

export async function listOrders(status?: OrderStatus): Promise<Order[]> {
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return (data as OrderRow[]).map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrder(data as OrderRow) : null;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

/** Signed URL for an admin to view a private payment proof. */
export async function proofSignedUrl(
  proofPath: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from("payment-proofs")
    .createSignedUrl(proofPath, 60 * 10);
  if (error) return null;
  return data.signedUrl;
}
