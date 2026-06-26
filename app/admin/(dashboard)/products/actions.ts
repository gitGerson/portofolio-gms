"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";

export type ProductActionState = { error: string } | null;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toIntOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function toFloatOrNull(v: FormDataEntryValue | null): number | null {
  const s = String(v ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

async function uploadImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${slug}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
  if (error) throw new Error(error.message);
  return path;
}

/** Shared field parsing for create/update. */
function parseFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug =
    slugify(String(formData.get("slug") ?? "")) || slugify(name);
  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return {
    name,
    slug,
    price: toIntOrNull(formData.get("price")) ?? 0,
    old_price: toIntOrNull(formData.get("oldPrice")),
    stock: toIntOrNull(formData.get("stock")) ?? 0,
    category_id: (String(formData.get("categoryId") ?? "") || null) as
      | string
      | null,
    brand_id: (String(formData.get("brandId") ?? "") || null) as string | null,
    rating: toFloatOrNull(formData.get("rating")),
    sold: toIntOrNull(formData.get("sold")) ?? 0,
    description: String(formData.get("description") ?? "").trim() || null,
    highlights,
    image_tag: String(formData.get("imageTag") ?? "").trim() || null,
  };
}

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const supabase = await createClient();
  const fields = parseFields(formData);
  if (!fields.name || !fields.slug) {
    return { error: "Nama produk wajib diisi." };
  }

  let imagePath: string | null = null;
  const file = formData.get("image");
  try {
    if (file instanceof File && file.size > 0) {
      imagePath = await uploadImage(supabase, fields.slug, file);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal upload gambar." };
  }

  const { error } = await supabase
    .from("products")
    .insert({ ...fields, image_path: imagePath });
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Slug sudah dipakai produk lain."
        : error.message,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=created");
}

export async function updateProductAction(
  id: string,
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const supabase = await createClient();
  const fields = parseFields(formData);
  if (!fields.name || !fields.slug) {
    return { error: "Nama produk wajib diisi." };
  }

  const update: Record<string, unknown> = { ...fields };
  const file = formData.get("image");
  try {
    if (file instanceof File && file.size > 0) {
      update.image_path = await uploadImage(supabase, fields.slug, file);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal upload gambar." };
  }

  const { error } = await supabase.from("products").update(update).eq("id", id);
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Slug sudah dipakai produk lain."
        : error.message,
    };
  }

  revalidatePath("/");
  revalidatePath(`/product/${fields.slug}`);
  revalidatePath("/admin/products");
  redirect("/admin/products?saved=updated");
}

export async function deleteProductAction(id: string): Promise<void> {
  if (!(await getAdminUser())) return;
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/products");
}

/**
 * Allowlist of inline-editable product fields. Maps the camelCase key sent by
 * the table to its DB column + a coercer. Anything not listed is rejected, so
 * the table can never write arbitrary columns.
 */
const PRODUCT_FIELDS: Record<
  string,
  { column: string; coerce: (v: unknown) => unknown }
> = {
  name: { column: "name", coerce: (v) => String(v ?? "").trim() },
  slug: { column: "slug", coerce: (v) => slugify(String(v ?? "")) },
  price: { column: "price", coerce: (v) => toIntOrNull(v as string) ?? 0 },
  oldPrice: { column: "old_price", coerce: (v) => toIntOrNull(v as string) },
  stock: { column: "stock", coerce: (v) => toIntOrNull(v as string) ?? 0 },
  categoryId: {
    column: "category_id",
    coerce: (v) => (String(v ?? "") || null) as string | null,
  },
  brandId: {
    column: "brand_id",
    coerce: (v) => (String(v ?? "") || null) as string | null,
  },
  rating: { column: "rating", coerce: (v) => toFloatOrNull(v as string) },
  sold: { column: "sold", coerce: (v) => toIntOrNull(v as string) ?? 0 },
  imageTag: {
    column: "image_tag",
    coerce: (v) => String(v ?? "").trim() || null,
  },
};

export type InlineResult = { error?: string };

/** Inline single-field update from the products table. */
export async function updateProductField(
  id: string,
  patch: Record<string, unknown>,
): Promise<InlineResult> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };

  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    const field = PRODUCT_FIELDS[key];
    if (!field) return { error: `Field tidak diizinkan: ${key}` };
    update[field.column] = field.coerce(value);
  }
  if (Object.keys(update).length === 0) return { error: "Tidak ada perubahan." };
  if ("name" in update && !update.name) {
    return { error: "Nama produk wajib diisi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").update(update).eq("id", id);
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Slug sudah dipakai produk lain."
        : error.message,
    };
  }

  revalidatePath("/");
  revalidatePath("/admin/products");
  return {};
}

/** Inline image replacement from the products table. Returns the new path. */
export async function updateProductImage(
  id: string,
  slug: string,
  formData: FormData,
): Promise<{ path?: string; error?: string }> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Tidak ada gambar." };
  }

  const supabase = await createClient();
  let path: string;
  try {
    path = await uploadImage(supabase, slug || "produk", file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal upload gambar." };
  }

  const { error } = await supabase
    .from("products")
    .update({ image_path: path })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/products");
  return { path };
}
