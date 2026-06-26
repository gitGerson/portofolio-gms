import { Suspense } from "react";
import Link from "next/link";
import { getBrands } from "@/lib/data/brands";
import { SavedFlash } from "./saved-flash";
import { BrandsTable } from "./brands-table";

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

      <BrandsTable brands={brands} />
    </div>
  );
}
