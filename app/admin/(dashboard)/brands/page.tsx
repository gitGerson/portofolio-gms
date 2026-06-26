import { Suspense } from "react";
import Link from "next/link";
import { getBrands } from "@/lib/data/brands";
import { productImageUrl } from "@/lib/images";
import { DeleteBrandButton } from "./delete-button";
import { SavedFlash } from "./saved-flash";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <div>
      <Suspense fallback={null}>
        <SavedFlash />
      </Suspense>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Brand</h1>
          <p className="mt-1 text-sm text-muted">{brands.length} brand</p>
        </div>
        <Link
          href="/admin/brands/new"
          className="h-10 rounded-[11px] bg-forest px-4 text-sm font-bold leading-10 text-white hover:bg-forest-dark"
        >
          + Brand Baru
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {brands.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            Belum ada brand. Tambahkan brand pertama.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {brands.map((b) => {
              const logo = productImageUrl(b.logoImage);
              return (
                <li
                  key={b.id}
                  className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
                >
                  <div className="ph-texture h-12 w-12 flex-none overflow-hidden rounded-lg border border-line">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt={b.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-bold text-ink">
                      {b.name}
                    </div>
                    <div className="mt-0.5 text-[12px] text-faint">/{b.slug}</div>
                  </div>
                  <div className="flex flex-none items-center gap-3 pl-2">
                    <Link
                      href={`/admin/brands/${b.id}`}
                      className="text-[12.5px] font-semibold text-forest hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteBrandButton id={b.id} name={b.name} />
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
