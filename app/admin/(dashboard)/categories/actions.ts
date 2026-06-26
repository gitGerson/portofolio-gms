"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";

export type SimpleState = { error?: string; ok?: boolean } | null;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Category icons live in the public product-images bucket under categories/<slug>/. */
async function uploadIcon(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `categories/${slug}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: true,
    });
  if (error) throw new Error(error.message);
  return path;
}

function dupMessage(message: string): string {
  return message.includes("duplicate") ? "Kategori sudah ada." : message;
}

export async function createCategoryAction(
  _prev: SimpleState,
  formData: FormData,
): Promise<SimpleState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  if (!name) return { error: "Nama kategori wajib diisi." };
  const slug = slugify(name);

  const supabase = await createClient();

  let imagePath: string | null = null;
  const file = formData.get("image");
  try {
    if (file instanceof File && file.size > 0) {
      imagePath = await uploadIcon(supabase, slug, file);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal upload ikon." };
  }

  const { error } = await supabase
    .from("categories")
    .insert({ name, slug, sort_order: sortOrder, image_path: imagePath });
  if (error) return { error: dupMessage(error.message) };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  if (!(await getAdminUser())) return;
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/categories");
}

export type InlineResult = { error?: string };

/** Inline single-field update from the categories table. */
export async function updateCategoryField(
  id: string,
  patch: Record<string, unknown>,
): Promise<InlineResult> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };

  const update: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === "name") {
      const name = String(value ?? "").trim();
      if (!name) return { error: "Nama kategori wajib diisi." };
      update.name = name;
      update.slug = slugify(name);
    } else if (key === "sortOrder") {
      update.sort_order = Number(value ?? 0) || 0;
    } else {
      return { error: `Field tidak diizinkan: ${key}` };
    }
  }
  if (Object.keys(update).length === 0) return { error: "Tidak ada perubahan." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(update)
    .eq("id", id);
  if (error) return { error: dupMessage(error.message) };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return {};
}

/** Inline icon replacement from the categories table. Returns the new path. */
export async function updateCategoryImage(
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
    path = await uploadIcon(supabase, slug || "kategori", file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal upload ikon." };
  }

  const { error } = await supabase
    .from("categories")
    .update({ image_path: path })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/categories");
  return { path };
}
