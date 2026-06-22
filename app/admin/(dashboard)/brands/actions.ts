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

export async function createBrandAction(
  _prev: SimpleState,
  formData: FormData,
): Promise<SimpleState> {
  if (!(await getAdminUser())) return { error: "Tidak punya akses." };
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nama brand wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .insert({ name, slug: slugify(name) });
  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Brand sudah ada."
        : error.message,
    };
  }
  revalidatePath("/");
  revalidatePath("/admin/brands");
  return { ok: true };
}

export async function deleteBrandAction(id: string): Promise<void> {
  if (!(await getAdminUser())) return;
  const supabase = await createClient();
  await supabase.from("brands").delete().eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/brands");
}
