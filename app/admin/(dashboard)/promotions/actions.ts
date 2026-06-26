"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";

export type PromotionActionState = { error: string } | null;

function toIntOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** A `datetime-local` value (local time) → ISO timestamptz, or null when empty. */
function toTimestampOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type ParsedFields = {
  fields: {
    title: string;
    discount_pct: number | null;
    discount_amount: number | null;
    starts_at: string | null;
    ends_at: string | null;
    active: boolean;
  };
  productIds: string[];
  error?: string;
};

function parseFields(formData: FormData): ParsedFields {
  const title = String(formData.get("title") ?? "").trim();
  const discountType = String(formData.get("discountType") ?? "pct");
  const value = toIntOrNull(formData.get("discountValue"));
  const productIds = formData
    .getAll("productIds")
    .map((v) => String(v))
    .filter(Boolean);

  const base = {
    title,
    discount_pct: null as number | null,
    discount_amount: null as number | null,
    starts_at: toTimestampOrNull(formData.get("startsAt")),
    ends_at: toTimestampOrNull(formData.get("endsAt")),
    active: formData.get("active") != null,
  };

  if (!title) return { fields: base, productIds, error: "Judul promo wajib diisi." };
  if (value == null || value <= 0)
    return { fields: base, productIds, error: "Nilai diskon harus lebih dari 0." };

  if (discountType === "amount") {
    base.discount_amount = value;
  } else {
    if (value > 100)
      return { fields: base, productIds, error: "Diskon persen maksimal 100." };
    base.discount_pct = value;
  }

  return { fields: base, productIds };
}

/** Replace the product links for a promotion with the given set. */
async function syncProducts(
  supabase: Awaited<ReturnType<typeof createClient>>,
  promoId: string,
  productIds: string[],
): Promise<void> {
  await supabase.from("product_promotions").delete().eq("promo_id", promoId);
  if (productIds.length > 0) {
    await supabase
      .from("product_promotions")
      .insert(productIds.map((product_id) => ({ product_id, promo_id: promoId })));
  }
}

/** Revalidate every storefront surface a promo can affect. */
async function revalidatePromoSurfaces(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productIds: string[],
): Promise<void> {
  revalidatePath("/");
  revalidatePath("/promo");
  revalidatePath("/category");
  revalidatePath("/admin/promotions");
  if (productIds.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("slug")
      .in("id", productIds);
    for (const row of data ?? []) {
      revalidatePath(`/product/${(row as { slug: string }).slug}`);
    }
  }
}

export async function createPromotionAction(
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const { fields, productIds, error } = parseFields(formData);
  if (error) return { error };

  const supabase = await createClient();
  const { data, error: insErr } = await supabase
    .from("promotions")
    .insert(fields)
    .select("id")
    .single();
  if (insErr) return { error: insErr.message };

  await syncProducts(supabase, (data as { id: string }).id, productIds);
  await revalidatePromoSurfaces(supabase, productIds);
  redirect("/admin/promotions?saved=created");
}

export async function updatePromotionAction(
  id: string,
  _prev: PromotionActionState,
  formData: FormData,
): Promise<PromotionActionState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const { fields, productIds, error } = parseFields(formData);
  if (error) return { error };

  const supabase = await createClient();
  const { error: updErr } = await supabase
    .from("promotions")
    .update(fields)
    .eq("id", id);
  if (updErr) return { error: updErr.message };

  await syncProducts(supabase, id, productIds);
  await revalidatePromoSurfaces(supabase, productIds);
  redirect("/admin/promotions?saved=updated");
}

export async function togglePromotionActive(
  id: string,
  active: boolean,
): Promise<{ error?: string }> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("promotions")
    .update({ active })
    .eq("id", id);
  if (error) return { error: error.message };

  const { data } = await supabase
    .from("product_promotions")
    .select("product_id")
    .eq("promo_id", id);
  const productIds = (data ?? []).map((r) => (r as { product_id: string }).product_id);
  await revalidatePromoSurfaces(supabase, productIds);
  return {};
}

export async function deletePromotionAction(id: string): Promise<void> {
  if (!(await getAdminUser())) return;
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_promotions")
    .select("product_id")
    .eq("promo_id", id);
  const productIds = (data ?? []).map((r) => (r as { product_id: string }).product_id);

  await supabase.from("promotions").delete().eq("id", id);
  await revalidatePromoSurfaces(supabase, productIds);
}
