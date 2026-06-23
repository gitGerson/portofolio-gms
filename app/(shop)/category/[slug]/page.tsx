import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug } from "@/lib/data/categories";
import { getBrands } from "@/lib/data/brands";
import { getCategoryProducts } from "@/lib/data/products";
import { CategoryView } from "./category-view";

export const revalidate = 60;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [category, categories, brands, products] = await Promise.all([
    getCategoryBySlug(slug),
    getCategories(),
    getBrands(),
    getCategoryProducts(slug),
  ]);
  if (!category) notFound();

  return (
    <Suspense fallback={null}>
      <CategoryView
        categorySlug={slug}
        categoryName={category.name}
        categories={categories}
        brands={brands}
        products={products}
      />
    </Suspense>
  );
}
