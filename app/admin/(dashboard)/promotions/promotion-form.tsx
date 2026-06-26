"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import type { Product, Promotion } from "@/lib/data/types";
import { formatRupiah } from "@/lib/format";
import type { PromotionActionState } from "./actions";

const FIELD =
  "w-full rounded-[10px] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-forest";
const LABEL = "mb-1.5 block text-[12px] font-semibold text-muted";

type Action = (
  state: PromotionActionState,
  formData: FormData,
) => Promise<PromotionActionState>;

/** ISO timestamp → value for a <input type="datetime-local"> (local time). */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function PromotionForm({
  action,
  promotion,
  products,
}: {
  action: Action;
  promotion?: Promotion;
  products: Product[];
}) {
  const [state, formAction, pending] = useActionState<
    PromotionActionState,
    FormData
  >(action, null);

  const [discountType, setDiscountType] = useState<"pct" | "amount">(
    promotion?.discountAmount != null ? "amount" : "pct",
  );
  const [query, setQuery] = useState("");

  const selectedIds = useMemo(
    () => new Set(promotion?.productIds ?? []),
    [promotion],
  );

  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const defaultValue =
    promotion?.discountPct ?? promotion?.discountAmount ?? "";

  return (
    <form action={formAction} className="max-w-2xl">
      <div className="grid gap-4 rounded-2xl border border-line bg-white p-5">
        <div>
          <label className={LABEL}>Judul Promo *</label>
          <input
            name="title"
            required
            defaultValue={promotion?.title}
            placeholder="mis. Promo Mingguan"
            className={FIELD}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Jenis Diskon</label>
            <select
              name="discountType"
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as "pct" | "amount")
              }
              className={FIELD}
            >
              <option value="pct">Persen (%)</option>
              <option value="amount">Nominal (Rp)</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>
              {discountType === "pct" ? "Diskon (%) *" : "Diskon (Rp) *"}
            </label>
            <input
              name="discountValue"
              type="number"
              min={1}
              max={discountType === "pct" ? 100 : undefined}
              required
              defaultValue={defaultValue}
              className={FIELD}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Mulai</label>
            <input
              name="startsAt"
              type="datetime-local"
              defaultValue={toLocalInput(promotion?.startsAt ?? null)}
              className={FIELD}
            />
          </div>
          <div>
            <label className={LABEL}>Berakhir</label>
            <input
              name="endsAt"
              type="datetime-local"
              defaultValue={toLocalInput(promotion?.endsAt ?? null)}
              className={FIELD}
            />
          </div>
        </div>
        <p className="-mt-2 text-[11px] text-faint">
          Kosongkan tanggal untuk tanpa batas. Promo hanya aktif dalam rentang
          ini dan saat status Aktif dicentang.
        </p>

        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <input
            type="checkbox"
            name="active"
            defaultChecked={promotion ? promotion.active : true}
            className="h-4 w-4 accent-forest"
          />
          Aktif
        </label>

        <div>
          <label className={LABEL}>
            Produk ({selectedIds.size > 0 ? `${selectedIds.size} dipilih` : "pilih produk"})
          </label>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari produk…"
            className={`${FIELD} mb-2`}
          />
          <div className="max-h-72 overflow-y-auto rounded-[10px] border border-line-strong">
            {visibleProducts.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted">Tidak ada produk.</p>
            ) : (
              visibleProducts.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 border-b border-line px-3 py-2 text-sm text-ink last:border-b-0 hover:bg-paper"
                >
                  <input
                    type="checkbox"
                    name="productIds"
                    value={p.id}
                    defaultChecked={selectedIds.has(p.id)}
                    className="h-4 w-4 accent-forest"
                  />
                  <span className="flex-1">{p.name}</span>
                  <span className="text-[11px] text-faint">
                    {formatRupiah(p.price)}
                  </span>
                </label>
              ))
            )}
          </div>
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
          href="/admin/promotions"
          className="flex h-11 items-center rounded-[12px] border border-line px-6 text-sm font-semibold text-muted hover:text-ink"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
