import { createPublicClient } from "@/lib/supabase/public";
import type { Brand } from "./types";

type BrandRow = { id: string; slug: string; name: string };

export async function getBrands(): Promise<Brand[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, slug, name")
    .order("name", { ascending: true });
  if (error) throw error;
  return data as BrandRow[];
}
