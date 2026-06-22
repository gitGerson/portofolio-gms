import { notFound } from "next/navigation";
import { getProductById } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { getBrands } from "@/lib/data/brands";
import { ProductForm } from "../product-form";
import { updateProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getProductById(id),
    getCategories(),
    getBrands(),
  ]);
  if (!product) notFound();

  const action = updateProductAction.bind(null, id);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold text-ink">Edit Produk</h1>
      <ProductForm
        action={action}
        categories={categories}
        brands={brands}
        product={product}
      />
    </div>
  );
}
