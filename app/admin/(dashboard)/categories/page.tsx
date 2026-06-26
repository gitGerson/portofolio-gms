import { getCategories } from "@/lib/data/categories";
import { CategoriesTable } from "./categories-table";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-ink">Kategori</h1>
        <p className="mt-1 text-sm text-muted">{categories.length} kategori</p>
      </div>
      <CategoriesTable categories={categories} />
    </div>
  );
}
