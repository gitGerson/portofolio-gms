import { getProducts } from "@/lib/data/products";
import { PromotionForm } from "../promotion-form";
import { createPromotionAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  const products = await getProducts();

  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold text-ink">Promo Baru</h1>
      <PromotionForm action={createPromotionAction} products={products} />
    </div>
  );
}
