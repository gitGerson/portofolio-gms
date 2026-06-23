import { ShopShell } from "@/app/components/shop-shell";
import { ProductCard } from "@/app/components/product-card";
import { searchProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();
  const results = term ? await searchProducts(term) : [];

  return (
    <ShopShell>
      <div className="px-4 pt-5 md:px-10 md:pt-7">
        <h1 className="text-lg font-extrabold text-ink md:text-2xl">
          {term ? (
            <>
              Hasil pencarian{" "}
              <span className="text-forest">&ldquo;{term}&rdquo;</span>
            </>
          ) : (
            "Pencarian"
          )}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {term ? `${results.length} produk ditemukan` : "Ketik kata kunci di kolom pencarian."}
        </p>

        {term && results.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted">
            Tidak ada produk yang cocok. Coba kata kunci lain.
          </p>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 pb-10 md:grid-cols-4 md:gap-4">
            {results.map((p, i) => (
              <ProductCard key={p.slug} product={p} priority={i < 4} />
            ))}
          </div>
        )}
      </div>
    </ShopShell>
  );
}
