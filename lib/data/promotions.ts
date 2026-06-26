import { createPublicClient } from "@/lib/supabase/public";
import type { Promotion } from "./types";

type PromotionRow = {
  id: string;
  slug: string | null;
  title: string;
  discount_pct: number | null;
  discount_amount: number | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
  created_at: string;
  product_promotions?: { product_id: string }[];
};

const SELECT =
  "id, slug, title, discount_pct, discount_amount, starts_at, ends_at, active, created_at, product_promotions(product_id)";

function mapPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    discountPct: row.discount_pct,
    discountAmount: row.discount_amount,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    active: row.active,
    createdAt: row.created_at,
    productIds: (row.product_promotions ?? []).map((p) => p.product_id),
  };
}

export async function getPromotions(): Promise<Promotion[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as PromotionRow[]).map(mapPromotion);
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("promotions")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPromotion(data as unknown as PromotionRow) : null;
}
