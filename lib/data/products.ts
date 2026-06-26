import { createPublicClient } from "@/lib/supabase/public";
import type { Product } from "./types";

/**
 * Canonical product read source. The `products_with_promo` view flattens
 * category/brand and resolves the effective sale price from the active
 * promotion (see supabase/schema.sql). All product reads go through it so the
 * rest of the app keeps using plain `price`/`oldPrice`.
 */
export const PRODUCTS_VIEW = "products_with_promo";

/** Shape of a products_with_promo row (flat category/brand + promo columns). */
export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  old_price: number | null;
  stock: number;
  rating: number | null;
  sold: number;
  description: string | null;
  highlights: string[] | null;
  image_path: string | null;
  image_tag: string | null;
  category_id: string | null;
  brand_id: string | null;
  category_slug: string | null;
  category_name: string | null;
  brand_name: string | null;
  promo_title: string | null;
};

export const SELECT =
  "id, slug, name, price, old_price, stock, rating, sold, description, highlights, image_path, image_tag, category_id, brand_id, category_slug, category_name, brand_name, promo_title";

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    categorySlug: row.category_slug,
    categoryName: row.category_name,
    brandId: row.brand_id,
    brandName: row.brand_name,
    price: row.price,
    oldPrice: row.old_price,
    stock: row.stock,
    inStock: row.stock > 0,
    rating: row.rating,
    sold: row.sold,
    description: row.description,
    highlights: row.highlights ?? [],
    imagePath: row.image_path,
    imageTag: row.image_tag,
    promoTitle: row.promo_title,
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from(PRODUCTS_VIEW)
    .select(SELECT)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from(PRODUCTS_VIEW)
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from(PRODUCTS_VIEW)
    .select(SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as unknown as ProductRow) : null;
}

export type ProductFilters = {
  brands?: string[]; // brand names
  min?: number;
  max?: number;
  sort?: "popular" | "price-asc" | "price-desc" | "newest";
};

/** Products in a category, with optional brand/price filters + sort. */
export async function getCategoryProducts(
  categorySlug: string,
  filters: ProductFilters = {},
): Promise<Product[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from(PRODUCTS_VIEW)
    .select(SELECT)
    .eq("category_slug", categorySlug);

  if (filters.min !== undefined) query = query.gte("price", filters.min);
  if (filters.max !== undefined) query = query.lte("price", filters.max);

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("sold", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  let items = (data as unknown as ProductRow[]).map(mapProduct);

  // Brand filter applied in JS (brand name is a flattened column).
  if (filters.brands && filters.brands.length > 0) {
    const set = new Set(filters.brands);
    items = items.filter((p) => p.brandName && set.has(p.brandName));
  }
  return items;
}

export async function productsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  return getCategoryProducts(categorySlug);
}

export async function searchProducts(q: string): Promise<Product[]> {
  const term = q.trim();
  if (!term) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from(PRODUCTS_VIEW)
    .select(SELECT)
    .ilike("name", `%${term}%`)
    .order("sold", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

/**
 * Products currently on promo — i.e. showing a strikethrough price, which the
 * view returns for both active scheduled campaigns and any legacy manual
 * old_price. Filtered at the DB so it scales with the catalogue.
 */
export async function getPromos(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from(PRODUCTS_VIEW)
    .select(SELECT)
    .not("old_price", "is", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

/** The N most recently created products that are on promo (for the hero slider). */
export async function getLatestPromos(limit = 5): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from(PRODUCTS_VIEW)
    .select(SELECT)
    .not("old_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as unknown as ProductRow[]).map(mapProduct);
}

export async function getFeatured(): Promise<Product[]> {
  const all = await getProducts();
  const order = [
    "adaptor-charger-65w-gan",
    "data-cable-type-c-100w-1m",
    "nasync-4-bay-dx4800-plus",
    "nasync-6-bay-dxp6800-pro",
  ];
  const picked = order
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined);
  // Fall back to the first few products if the seeded slugs are absent.
  return picked.length > 0 ? picked : all.slice(0, 4);
}
