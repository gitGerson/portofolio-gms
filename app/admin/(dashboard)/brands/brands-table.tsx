"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CellComponent, ColumnDefinition } from "tabulator-tables";
import type { Brand } from "@/lib/data/types";
import { productImageUrl } from "@/lib/images";
import { useToast } from "@/app/components/ui/toast";
import { useConfirm } from "@/app/components/ui/confirm-dialog";
import { DataTable } from "../_table/data-table";
import {
  deleteBrandAction,
  updateBrandField,
  updateBrandImage,
} from "./actions";

type Row = {
  id: string;
  name: string;
  slug: string;
  logoImage: string | null;
};

export function BrandsTable({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();

  const data = useMemo<Row[]>(
    () =>
      brands.map((b) => ({
        id: b.id,
        name: b.name,
        slug: b.slug,
        logoImage: b.logoImage,
      })),
    [brands],
  );

  const columns = useMemo<ColumnDefinition[]>(() => {
    async function onNameEdited(cell: CellComponent) {
      const id = cell.getRow().getData().id as string;
      const res = await updateBrandField(id, { name: cell.getValue() });
      if (res.error) {
        cell.restoreOldValue();
        toast(res.error, "error");
      } else {
        toast("Tersimpan");
      }
    }

    function logoCell(cell: CellComponent): HTMLElement {
      const d = cell.getRow().getData() as Row;
      const wrap = document.createElement("div");
      wrap.className = "gms-img-cell";

      const url = productImageUrl(d.logoImage);
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
        fd.append("logo", file);
        toast("Mengunggah…", "info");
        const res = await updateBrandImage(d.id, d.slug, fd);
        if (res.error) {
          toast(res.error, "error");
          return;
        }
        await cell.getRow().update({ logoImage: res.path });
        toast("Logo diperbarui");
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
      edit.href = `/admin/brands/${d.id}`;
      edit.addEventListener("click", (e) => {
        e.preventDefault();
        router.push(`/admin/brands/${d.id}`);
      });

      const del = document.createElement("span");
      del.className = "gms-danger-link";
      del.textContent = "Hapus";
      del.addEventListener("click", async () => {
        const ok = await confirm({
          title: "Hapus brand?",
          message: `"${d.name}" akan dihapus.`,
          confirmLabel: "Hapus",
          danger: true,
        });
        if (!ok) return;
        await deleteBrandAction(d.id);
        cell.getRow().delete();
        toast(`"${d.name}" dihapus`);
      });

      wrap.append(edit, del);
      return wrap;
    }

    return [
      {
        title: "Logo",
        field: "logoImage",
        formatter: logoCell,
        headerSort: false,
        width: 110,
      },
      {
        title: "Nama",
        field: "name",
        editor: "input",
        cellEdited: onNameEdited,
        minWidth: 200,
      },
      {
        title: "Slug",
        field: "slug",
        formatter: (cell) => `/${cell.getValue()}`,
        minWidth: 160,
      },
      {
        title: "",
        field: "id",
        formatter: actionsCell,
        headerSort: false,
        width: 130,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DataTable
      data={data}
      columns={columns}
      searchFields={["name", "slug"]}
      searchPlaceholder="Cari brand…"
      initialSort={[{ column: "name", dir: "asc" }]}
    />
  );
}
