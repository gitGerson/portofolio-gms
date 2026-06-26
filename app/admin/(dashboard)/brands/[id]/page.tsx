import { notFound } from "next/navigation";
import { getBrandById } from "@/lib/data/brands";
import { BrandForm } from "../brand-form";
import { updateBrandAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditBrandPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const brand = await getBrandById(id);
  if (!brand) notFound();

  const action = updateBrandAction.bind(null, id);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold text-ink">Edit Brand</h1>
      <BrandForm action={action} brand={brand} />
    </div>
  );
}
