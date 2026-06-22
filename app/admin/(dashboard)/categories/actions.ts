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

export async function createCategoryAction(
  _prev: SimpleState,
  formData: FormData,
): Promise<SimpleState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0) || 0;
  if (!name) return { error: "Nama kategori wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug: slugify(name), sort_order: sortOrder });
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Kategori sudah ada."
        : error.message,
    };
  }
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
