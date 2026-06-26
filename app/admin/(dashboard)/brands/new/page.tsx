import { BrandForm } from "../brand-form";
import { createBrandAction } from "../actions";

export const dynamic = "force-dynamic";

export default function NewBrandPage() {
  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold text-ink">Brand Baru</h1>
      <BrandForm action={createBrandAction} />
    </div>
  );
}
