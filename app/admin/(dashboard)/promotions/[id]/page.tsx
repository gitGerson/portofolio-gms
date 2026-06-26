import { notFound } from "next/navigation";
import { getProducts } from "@/lib/data/products";
import { getPromotionById } from "@/lib/data/promotions";
import { PromotionForm } from "../promotion-form";
import { updatePromotionAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [promotion, products] = await Promise.all([
    getPromotionById(id),
    getProducts(),
  ]);
  if (!promotion) notFound();

  const action = updatePromotionAction.bind(null, id);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold text-ink">Edit Promo</h1>
      <PromotionForm
        action={action}
        promotion={promotion}
        products={products}
      />
    </div>
  );
}
