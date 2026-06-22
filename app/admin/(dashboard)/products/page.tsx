import { Suspense } from "react";
import Link from "next/link";
import { getProducts } from "@/lib/data/products";
import { formatRupiah } from "@/lib/format";
import { productImageUrl } from "@/lib/images";
import { DeleteProductButton } from "./delete-button";
import { SavedFlash } from "./saved-flash";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();

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

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {products.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            Belum ada produk. Tambahkan produk pertama.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {products.map((p) => {
              const img = productImageUrl(p.imagePath);
              return (
                <li
                  key={p.id}
                  className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
                >
                  <div className="ph-texture h-12 w-12 flex-none overflow-hidden rounded-lg">
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={img}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-ink">
                      {p.name}
                    </div>
                    <div className="mt-0.5 text-[12px] text-faint">
                      {p.categoryName ?? "—"}
                      {p.brandName ? ` · ${p.brandName}` : ""}
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-bold text-forest">
                      {formatRupiah(p.price)}
                    </div>
                  </div>
                  <span
                    className={`flex-none rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      p.stock === 0
                        ? "bg-danger-bg text-danger"
                        : p.stock <= 5
                          ? "bg-[#fbf4e3] text-[#8a6e2c]"
                          : "bg-ready-bg text-ready"
                    }`}
                  >
                    Stok {p.stock}
                  </span>
                  <div className="flex flex-none items-center gap-3 pl-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[12.5px] font-semibold text-forest hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={p.id} name={p.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
