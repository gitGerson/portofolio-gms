"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Brand } from "@/lib/data/types";
import { productImageUrl } from "@/lib/images";
import type { BrandActionState } from "./actions";

const FIELD =
  "w-full rounded-[10px] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-forest";
const LABEL = "mb-1.5 block text-[12px] font-semibold text-muted";

type Action = (
  state: BrandActionState,
  formData: FormData,
) => Promise<BrandActionState>;

export function BrandForm({
  action,
  brand,
}: {
  action: Action;
  brand?: Brand;
}) {
  const [state, formAction, pending] = useActionState<BrandActionState, FormData>(
    action,
    null,
  );

  const currentLogo = brand ? productImageUrl(brand.logoImage) : null;

  return (
    <form action={formAction} className="max-w-xl">
      <div className="grid gap-4 rounded-2xl border border-line bg-white p-5">
        <div>
          <label className={LABEL}>Nama Brand *</label>
          <input
            name="name"
            required
            defaultValue={brand?.name}
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL}>Logo Brand</label>
          {currentLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentLogo}
              alt={brand?.name ?? ""}
              className="mb-2 h-20 w-20 rounded-lg border border-line object-cover"
            />
          ) : null}
          <input
            name="logo"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-forest file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {brand ? (
            <p className="mt-1 text-[11px] text-faint">
              Kosongkan jika tidak ingin mengganti logo.
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
          href="/admin/brands"
          className="flex h-11 items-center rounded-[12px] border border-line px-6 text-sm font-semibold text-muted hover:text-ink"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
