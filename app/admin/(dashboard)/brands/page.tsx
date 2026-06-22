import { getBrands } from "@/lib/data/brands";
import { SimpleCrud } from "../simple-crud";
import { createBrandAction, deleteBrandAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminBrandsPage() {
  const brands = await getBrands();

  return (
    <SimpleCrud
      title="Brand"
      labelSingular="Brand"
      createAction={createBrandAction}
      deleteAction={deleteBrandAction}
      items={brands.map((b) => ({ id: b.id, name: b.name, meta: `/${b.slug}` }))}
    />
  );
}
