"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Category, Brand, Product } from "@/lib/data/types";
import { productImageUrl } from "@/lib/images";
import type { ProductActionState } from "./actions";

const FIELD =
  "w-full rounded-[10px] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-forest";
const LABEL = "mb-1.5 block text-[12px] font-semibold text-muted";

type Action = (
  state: ProductActionState,
  formData: FormData,
) => Promise<ProductActionState>;

export function ProductForm({
  action,
  categories,
  brands,
  product,
}: {
  action: Action;
  categories: Category[];
  brands: Brand[];
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState<
    ProductActionState,
    FormData
  >(action, null);

  const currentImage = product ? productImageUrl(product.imagePath) : null;

  return (
    <form action={formAction} className="max-w-5xl">
      <div className="grid gap-4 rounded-2xl border border-line bg-white p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL}>Nama Produk *</label>
          <input
            name="name"
            required
            defaultValue={product?.name}
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL}>Slug (URL)</label>
          <input
            name="slug"
            defaultValue={product?.slug}
            placeholder="otomatis dari nama"
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL}>Tag Placeholder</label>
          <input
            name="imageTag"
            defaultValue={product?.imageTag ?? ""}
            placeholder="mis. adaptor"
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL}>Kategori</label>
          <select
            name="categoryId"
            defaultValue={
              categories.find((c) => c.slug === product?.categorySlug)?.id ?? ""
            }
            className={FIELD}
          >
            <option value="">— Tidak ada —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Brand</label>
          <select
            name="brandId"
            defaultValue={
              brands.find((b) => b.name === product?.brandName)?.id ?? ""
            }
            className={FIELD}
          >
            <option value="">— Tidak ada —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL}>Harga (Rp) *</label>
          <input
            name="price"
            type="number"
            min={0}
            required
            defaultValue={product?.price}
            className={FIELD}
          />
        </div>
        <div>
          <label className={LABEL}>Harga Coret (Rp)</label>
          <input
            name="oldPrice"
            type="number"
            min={0}
            defaultValue={product?.oldPrice ?? ""}
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL}>Stok</label>
          <input
            name="stock"
            type="number"
            min={0}
            defaultValue={product?.stock ?? 0}
            className={FIELD}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Rating</label>
            <input
              name="rating"
              type="number"
              step="0.1"
              min={0}
              max={5}
              defaultValue={product?.rating ?? ""}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL}>Terjual</label>
            <input
              name="sold"
              type="number"
              min={0}
              defaultValue={product?.sold ?? 0}
              className={FIELD}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL}>Deskripsi</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={product?.description ?? ""}
            className={`${FIELD} resize-none`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL}>
            Highlight <span className="font-normal">(satu per baris)</span>
          </label>
          <textarea
            name="highlights"
            rows={3}
            defaultValue={product?.highlights.join("\n") ?? ""}
            className={`${FIELD} resize-none`}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL}>Foto Produk</label>
          {currentImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentImage}
              alt={product?.name ?? ""}
              className="mb-2 h-24 w-24 rounded-lg object-cover"
            />
          ) : null}
          <input
            name="image"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-forest file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {product ? (
            <p className="mt-1 text-[11px] text-faint">
              Kosongkan jika tidak ingin mengganti foto.
            </p>
          ) : null}
        </div>
      </div>

      {state?.error ? (
        <p className="mt-3 rounded-lg bg-danger-bg px-3 py-2 text-[12.5px] font-semibold text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-[12px] bg-forest px-6 text-sm font-bold text-white transition-transform hover:bg-forest-dark active:scale-[0.98] motion-reduce:transform-none disabled:opacity-70"
        >
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
        <Link
          href="/admin/products"
          className="flex h-11 items-center rounded-[12px] border border-line px-6 text-sm font-semibold text-muted hover:text-ink"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
