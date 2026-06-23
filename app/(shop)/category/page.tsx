import { Suspense } from "react";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { CategoryView } from "./[slug]/category-view";

export const revalidate = 60;

export default async function AllCategoriesPage() {
  const [categories, brands, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts(),
  ]);

  return (
    <Suspense fallback={null}>
      <CategoryView categories={categories} brands={brands} products={products} />
    </Suspense>
  );
}
