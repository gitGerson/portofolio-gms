"use client";

import { useActionState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CellComponent, ColumnDefinition } from "tabulator-tables";
import type { Category } from "@/lib/data/types";
import { productImageUrl } from "@/lib/images";
import { useToast } from "@/app/components/ui/toast";
import { useConfirm } from "@/app/components/ui/confirm-dialog";
import { DataTable } from "../_table/data-table";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateCategoryField,
  updateCategoryImage,
  type SimpleState,
} from "./actions";

type Row = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  imagePath: string | null;
};

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();

  const [state, formAction, pending] = useActionState<SimpleState, FormData>(
    createCategoryAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Reset + refresh the list after a successful add.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      toast("Kategori ditambahkan");
      router.refresh();
    }
  }, [state, toast, router]);

  const data = useMemo<Row[]>(
    () =>
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        sortOrder: c.sortOrder,
        imagePath: c.imagePath,
      })),
    [categories],
  );

  const columns = useMemo<ColumnDefinition[]>(() => {
    async function onEdited(cell: CellComponent) {
      const field = cell.getField();
      const id = cell.getRow().getData().id as string;
      const res = await updateCategoryField(id, { [field]: cell.getValue() });
      if (res.error) {
        cell.restoreOldValue();
        toast(res.error, "error");
      } else {
        toast("Tersimpan");
      }
    }

    function iconCell(cell: CellComponent): HTMLElement {
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
        const res = await updateCategoryImage(d.id, d.slug, fd);
        if (res.error) {
          toast(res.error, "error");
          return;
        }
        await cell.getRow().update({ imagePath: res.path });
        toast("Ikon diperbarui");
      });

      wrap.append(thumb, btn, input);
      return wrap;
    }

    function actionsCell(cell: CellComponent): HTMLElement {
      const d = cell.getRow().getData() as Row;
      const del = document.createElement("span");
      del.className = "gms-danger-link";
      del.textContent = "Hapus";
      del.addEventListener("click", async () => {
        const ok = await confirm({
          title: "Hapus kategori?",
          message: `"${d.name}" akan dihapus.`,
          confirmLabel: "Hapus",
          danger: true,
        });
        if (!ok) return;
        await deleteCategoryAction(d.id);
        cell.getRow().delete();
        toast(`"${d.name}" dihapus`);
      });
      return del;
    }

    return [
      {
        title: "Ikon",
        field: "imagePath",
        formatter: iconCell,
        headerSort: false,
        width: 110,
      },
      {
        title: "Nama",
        field: "name",
        editor: "input",
        cellEdited: onEdited,
        minWidth: 200,
      },
      {
        title: "Slug",
        field: "slug",
        formatter: (cell) => `/${cell.getValue()}`,
        minWidth: 160,
      },
      {
        title: "Urutan",
        field: "sortOrder",
        editor: "number",
        cellEdited: onEdited,
        hozAlign: "center",
        width: 110,
      },
      {
        title: "",
        field: "id",
        formatter: actionsCell,
        headerSort: false,
        width: 100,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <form
        ref={formRef}
        action={formAction}
        className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4"
      >
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            Nama Kategori
          </label>
          <input
            name="name"
            required
            className="w-full rounded-[10px] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-forest"
            placeholder="Nama kategori"
          />
        </div>
        <div className="w-28">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            Urutan
          </label>
          <input
            name="sortOrder"
            type="number"
            defaultValue={categories.length + 1}
            className="w-full rounded-[10px] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-forest"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            Ikon <span className="font-normal">(opsional)</span>
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-forest file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="h-[42px] rounded-[11px] bg-forest px-5 text-sm font-bold text-white hover:bg-forest-dark disabled:opacity-70"
        >
          {pending ? "Menyimpan…" : "Tambah"}
        </button>
        {state?.error ? (
          <p className="w-full text-[12.5px] font-semibold text-danger">
            {state.error}
          </p>
        ) : null}
      </form>

      <DataTable
        data={data}
        columns={columns}
        searchFields={["name", "slug"]}
        searchPlaceholder="Cari kategori…"
        initialSort={[{ column: "sortOrder", dir: "asc" }]}
      />
    </div>
  );
}
