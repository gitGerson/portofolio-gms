import { Suspense } from "react";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { getPromos } from "@/lib/data/products";
import { CategoryView } from "../category/[slug]/category-view";

export const revalidate = 60;

export default async function PromoPage() {
  const [categories, brands, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getPromos(),
  ]);

  return (
    <Suspense fallback={null}>
      <CategoryView
        categories={categories}
        brands={brands}
        products={products}
        rootLabel="Promo"
      />
    </Suspense>
  );
}
