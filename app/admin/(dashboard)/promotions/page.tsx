import { Suspense } from "react";
import Link from "next/link";
import { getPromotions } from "@/lib/data/promotions";
import { SavedFlash } from "./saved-flash";
import { PromotionsTable } from "./promotions-table";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  const promotions = await getPromotions();

  return (
    <div>
      <Suspense fallback={null}>
        <SavedFlash />
      </Suspense>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Promo</h1>
          <p className="mt-1 text-sm text-muted">{promotions.length} promo</p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="h-10 rounded-[11px] bg-forest px-4 text-sm font-bold leading-10 text-white hover:bg-forest-dark"
        >
          + Promo Baru
        </Link>
      </div>

      <PromotionsTable promotions={promotions} />
    </div>
  );
}
