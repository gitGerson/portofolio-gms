import { getCategories } from "@/lib/data/categories";
import { getBrands } from "@/lib/data/brands";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold text-ink">Produk Baru</h1>
      <ProductForm
        action={createProductAction}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
