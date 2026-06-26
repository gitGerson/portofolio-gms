import { Suspense } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/data/products";
import { getCategories } from "@/lib/data/categories";
import { getBrands } from "@/lib/data/brands";
import { SavedFlash } from "./saved-flash";
import { ProductsTable } from "./products-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories, brands] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div>
      <Suspense fallback={null}>
        <SavedFlash />
      </Suspense>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Produk</h1>
          <p className="mt-1 text-sm text-muted">{products.length} produk</p>
        </div>
        <Link
          href="/admin/products/new"
          className="h-10 rounded-[11px] bg-forest px-4 text-sm font-bold leading-10 text-white hover:bg-forest-dark"
        >
          + Produk Baru
        </Link>
      </div>

      <ProductsTable
        products={products}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
