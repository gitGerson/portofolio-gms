import { createPublicClient } from "@/lib/supabase/public";
import type { Brand } from "./types";

type BrandRow = {
  id: string;
  slug: string;
  name: string;
  logo_image: string | null;
};

function mapBrand(row: BrandRow): Brand {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logoImage: row.logo_image,
  };
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, slug, name, logo_image")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as BrandRow[]).map(mapBrand);
}

export async function getBrandById(id: string): Promise<Brand | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("brands")
    .select("id, slug, name, logo_image")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapBrand(data as BrandRow) : null;
}
