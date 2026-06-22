import { getCategories } from "@/lib/data/categories";
import { SimpleCrud } from "../simple-crud";
import { createCategoryAction, deleteCategoryAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <SimpleCrud
      title="Kategori"
      labelSingular="Kategori"
      withSortOrder
      createAction={createCategoryAction}
      deleteAction={deleteCategoryAction}
      items={categories.map((c) => ({
        id: c.id,
        name: c.name,
        meta: `/${c.slug}`,
      }))}
    />
  );
}
