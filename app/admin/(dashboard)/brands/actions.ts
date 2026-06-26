"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";

export type BrandActionState = { error: string } | null;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Brand logos live in the public product-images bucket under brands/<slug>/. */
async function uploadLogo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slug: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `brands/${slug}/${Date.now()}.${ext}`;
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
  return message.includes("duplicate") ? "Brand sudah ada." : message;
}

export async function createBrandAction(
  _prev: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama brand wajib diisi." };
  const slug = slugify(name);

  const supabase = await createClient();

  let logoImage: string | null = null;
  const file = formData.get("logo");
  try {
    if (file instanceof File && file.size > 0) {
      logoImage = await uploadLogo(supabase, slug, file);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal upload logo." };
  }

  const { error } = await supabase
    .from("brands")
    .insert({ name, slug, logo_image: logoImage });
  if (error) return { error: dupMessage(error.message) };

  revalidatePath("/");
  revalidatePath("/category");
  revalidatePath("/admin/brands");
  redirect("/admin/brands?saved=created");
}

export async function updateBrandAction(
  id: string,
  _prev: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama brand wajib diisi." };
  const slug = slugify(name);

  const supabase = await createClient();

  const update: Record<string, unknown> = { name, slug };
  const file = formData.get("logo");
  try {
    if (file instanceof File && file.size > 0) {
      update.logo_image = await uploadLogo(supabase, slug, file);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal upload logo." };
  }

  const { error } = await supabase.from("brands").update(update).eq("id", id);
  if (error) return { error: dupMessage(error.message) };

  revalidatePath("/");
  revalidatePath("/category");
  revalidatePath("/admin/brands");
  redirect("/admin/brands?saved=updated");
}

export async function deleteBrandAction(id: string): Promise<void> {
  if (!(await getAdminUser())) return;
  const supabase = await createClient();
  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/category");
  revalidatePath("/admin/brands");
}

export type InlineResult = { error?: string };

/** Inline single-field update from the brands table (name → also reslugs). */
export async function updateBrandField(
  id: string,
  patch: Record<string, unknown>,
): Promise<InlineResult> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };

  const update: Record<string, unknown> = {};
  if ("name" in patch) {
    const name = String(patch.name ?? "").trim();
    if (!name) return { error: "Nama brand wajib diisi." };
    update.name = name;
    update.slug = slugify(name);
  }
  // Only `name` is inline-editable; reject anything else.
  for (const key of Object.keys(patch)) {
    if (key !== "name") return { error: `Field tidak diizinkan: ${key}` };
  }
  if (Object.keys(update).length === 0) return { error: "Tidak ada perubahan." };

  const supabase = await createClient();
  const { error } = await supabase.from("brands").update(update).eq("id", id);
  if (error) return { error: dupMessage(error.message) };

  revalidatePath("/");
  revalidatePath("/category");
  revalidatePath("/admin/brands");
  return {};
}

/** Inline logo replacement from the brands table. Returns the new path. */
export async function updateBrandImage(
  id: string,
  slug: string,
  formData: FormData,
): Promise<{ path?: string; error?: string }> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Tidak ada gambar." };
  }

  const supabase = await createClient();
  let path: string;
  try {
    path = await uploadLogo(supabase, slug || "brand", file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Gagal upload logo." };
  }

  const { error } = await supabase
    .from("brands")
    .update({ logo_image: path })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/category");
  revalidatePath("/admin/brands");
  return { path };
}
