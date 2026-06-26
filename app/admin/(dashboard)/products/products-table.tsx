"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CellComponent, ColumnDefinition } from "tabulator-tables";
import type { Brand, Category, Product } from "@/lib/data/types";
import { productImageUrl } from "@/lib/images";
import { useToast } from "@/app/components/ui/toast";
import { useConfirm } from "@/app/components/ui/confirm-dialog";
import { DataTable } from "../_table/data-table";
import { rupiahFormatter, stockFormatter } from "../_table/formatters";
import {
  deleteProductAction,
  updateProductField,
  updateProductImage,
} from "./actions";

type Row = {
  id: string;
  name: string;
  slug: string;
  imagePath: string | null;
  categoryId: string;
  brandId: string;
  categoryName: string;
  brandName: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  rating: number | null;
  sold: number;
};

export function ProductsTable({
  products,
  categories,
  brands,
}: {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();

  const data = useMemo<Row[]>(
    () =>
      products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        imagePath: p.imagePath,
        categoryId: p.categoryId ?? "",
        brandId: p.brandId ?? "",
        categoryName: p.categoryName ?? "",
        brandName: p.brandName ?? "",
        price: p.price,
        oldPrice: p.oldPrice,
        stock: p.stock,
        rating: p.rating,
        sold: p.sold,
      })),
    [products],
  );

  const columns = useMemo<ColumnDefinition[]>(() => {
    const catValues: Record<string, string> = { "": "— Tidak ada —" };
    categories.forEach((c) => (catValues[c.id] = c.name));
    const brandValues: Record<string, string> = { "": "— Tidak ada —" };
    brands.forEach((b) => (brandValues[b.id] = b.name));

    // Persist one edited field; revert + toast on failure.
    async function onEdited(cell: CellComponent) {
      const field = cell.getField();
      const id = cell.getRow().getData().id as string;
      const res = await updateProductField(id, { [field]: cell.getValue() });
      if (res.error) {
        cell.restoreOldValue();
        toast(res.error, "error");
      } else {
        toast("Tersimpan");
      }
    }

    function imageCell(cell: CellComponent): HTMLElement {
      const d = cell.getRow().getData() as Row;
      const wrap = document.createElement("div");
      wrap.className = "gms-img-cell";

      const url = productImageUrl(d.imagePath);
      let thumb: HTMLElement;
      if (url) {
        const img = document.createElement("img");
        img.className = "gms-thumb";
        img.alt = d.name;
        img.src = url;
        thumb = img;
      } else {
        thumb = document.createElement("div");
        thumb.className = "gms-thumb";
      }

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "gms-img-btn";
      btn.textContent = "Ganti";

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.style.display = "none";

      btn.addEventListener("click", () => input.click());
      input.addEventListener("change", async () => {
        const file = input.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("image", file);
        toast("Mengunggah…", "info");
        const res = await updateProductImage(d.id, d.slug, fd);
        if (res.error) {
          toast(res.error, "error");
          return;
        }
        await cell.getRow().update({ imagePath: res.path });
        toast("Foto diperbarui");
      });

      wrap.append(thumb, btn, input);
      return wrap;
    }

    function actionsCell(cell: CellComponent): HTMLElement {
      const d = cell.getRow().getData() as Row;
      const wrap = document.createElement("div");
      wrap.className = "gms-actions";

      const edit = document.createElement("a");
      edit.className = "gms-link";
      edit.textContent = "Edit";
      edit.href = `/admin/products/${d.id}`;
      edit.addEventListener("click", (e) => {
        e.preventDefault();
        router.push(`/admin/products/${d.id}`);
      });

      const del = document.createElement("span");
      del.className = "gms-danger-link";
      del.textContent = "Hapus";
      del.addEventListener("click", async () => {
        const ok = await confirm({
          title: "Hapus produk?",
          message: `"${d.name}" akan dihapus permanen dari katalog.`,
          confirmLabel: "Hapus",
          danger: true,
        });
        if (!ok) return;
        await deleteProductAction(d.id);
        cell.getRow().delete();
        toast(`"${d.name}" dihapus`);
      });

      wrap.append(edit, del);
      return wrap;
    }

    return [
      {
        title: "Foto",
        field: "imagePath",
        formatter: imageCell,
        headerSort: false,
        width: 110,
      },
      {
        title: "Nama",
        field: "name",
        editor: "input",
        cellEdited: onEdited,
        minWidth: 180,
      },
      {
        title: "Kategori",
        field: "categoryId",
        editor: "list",
        editorParams: { values: catValues },
        formatter: (cell) =>
          catValues[String(cell.getValue() ?? "")] ?? "—",
        cellEdited: onEdited,
        minWidth: 130,
      },
      {
        title: "Brand",
        field: "brandId",
        editor: "list",
        editorParams: { values: brandValues },
        formatter: (cell) =>
          brandValues[String(cell.getValue() ?? "")] ?? "—",
        cellEdited: onEdited,
        minWidth: 120,
      },
      {
        title: "Harga",
        field: "price",
        editor: "number",
        formatter: rupiahFormatter,
        cellEdited: onEdited,
        hozAlign: "right",
        minWidth: 110,
      },
      {
        title: "Coret",
        field: "oldPrice",
        editor: "number",
        formatter: rupiahFormatter,
        cellEdited: onEdited,
        hozAlign: "right",
        minWidth: 100,
      },
      {
        title: "Stok",
        field: "stock",
        editor: "number",
        formatter: stockFormatter,
        cellEdited: onEdited,
        hozAlign: "center",
        width: 95,
      },
      {
        title: "Rating",
        field: "rating",
        editor: "number",
        editorParams: { step: 0.1, min: 0, max: 5 },
        cellEdited: onEdited,
        hozAlign: "center",
        width: 85,
      },
      {
        title: "Terjual",
        field: "sold",
        editor: "number",
        cellEdited: onEdited,
        hozAlign: "center",
        width: 90,
      },
      {
        title: "",
        field: "id",
        formatter: actionsCell,
        headerSort: false,
        width: 130,
      },
    ];
    // toast/confirm/router are stable; columns are built once by DataTable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, brands]);

  return (
    <DataTable
      data={data}
      columns={columns}
      searchFields={["name", "categoryName", "brandName"]}
      searchPlaceholder="Cari produk…"
      initialSort={[{ column: "name", dir: "asc" }]}
    />
  );
}
