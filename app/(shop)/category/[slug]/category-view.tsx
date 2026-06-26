"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ProductCard } from "@/app/components/product-card";
import { ChevronDown, CheckIcon } from "@/app/components/icons";
import type { Product, Category, Brand } from "@/lib/data/types";

type Sort = "popular" | "price-asc" | "price-desc" | "newest";

const SORT_LABEL: Record<Sort, string> = {
  popular: "Terlaris",
  "price-asc": "Harga ↑",
  "price-desc": "Harga ↓",
  newest: "Terbaru",
};

export function CategoryView({
  categories,
  brands,
  products,
  rootLabel = "Semua Produk",
}: {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  /** Label for the "all" state — e.g. "Promo" on the promo page. */
  rootLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const categorySlug = params.get("cat") || "__all__";
  const categoryName =
    categorySlug === "__all__"
      ? rootLabel
      : (categories.find((c) => c.slug === categorySlug)?.name ?? rootLabel);

  const selectedBrandsParam = params.get("brands") ?? "";
  const selectedBrands = useMemo(
    () =>
      selectedBrandsParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [selectedBrandsParam],
  );
  const min = params.get("min") ? Number(params.get("min")) : undefined;
  const max = params.get("max") ? Number(params.get("max")) : undefined;
  const sort = (params.get("sort") as Sort) || "popular";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value && value.length > 0) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function toggleBrand(name: string) {
    const set = new Set(selectedBrands);
    if (set.has(name)) set.delete(name);
    else set.add(name);
    setParam("brands", Array.from(set).join(","));
  }

  const filtered = useMemo(() => {
    let items = [...products];
    if (categorySlug !== "__all__") {
      items = items.filter((p) => p.categorySlug === categorySlug);
    }
    if (selectedBrands.length > 0) {
      const set = new Set(selectedBrands);
      items = items.filter((p) => p.brandName && set.has(p.brandName));
    }
    if (min !== undefined) items = items.filter((p) => p.price >= min);
    if (max !== undefined) items = items.filter((p) => p.price <= max);
    switch (sort) {
      case "price-asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        break; // server already returns created order; keep
      default:
        items.sort((a, b) => b.sold - a.sold);
    }
    return items;
  }, [products, categorySlug, selectedBrands, min, max, sort]);

  return (
    <>
      {/* Mobile filter bar */}
      <div className="flex flex-col gap-2.5 border-b border-line bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
        <select
          value={categorySlug === "__all__" ? "" : categorySlug}
          onChange={(e) => setParam("cat", e.target.value || null)}
          className="rounded-[9px] border border-line-strong bg-paper px-[11px] py-[7px] text-xs font-semibold text-ink"
        >
          <option value="">{rootLabel}</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="rounded-[9px] border border-line-strong bg-paper px-[11px] py-[7px] text-xs font-semibold text-ink"
        >
          {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
            <option key={s} value={s}>
              {SORT_LABEL[s]}
            </option>
          ))}
        </select>
        <span className="ml-auto text-[11px] text-faint">
          {filtered.length} produk
        </span>
        </div>

        {brands.length > 0 ? (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5">
            <button
              type="button"
              onClick={() => setParam("brands", null)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                selectedBrands.length === 0
                  ? "border-forest bg-forest text-white"
                  : "border-line-strong bg-paper text-muted"
              }`}
            >
              Semua Brand
            </button>
            {brands.map((b) => {
              const on = selectedBrands.includes(b.name);
              return (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => toggleBrand(b.name)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                    on
                      ? "border-forest bg-forest text-white"
                      : "border-line-strong bg-paper text-muted"
                  }`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="px-4 pt-3.5 md:px-10 md:pt-6">
        <div className="mb-4 hidden text-[12.5px] text-faint md:block">
          <Link href="/" className="hover:text-forest">
            Beranda
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-muted">{categoryName}</span>
        </div>

        <div className="md:flex md:gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden w-[236px] flex-none md:block">
            <h3 className="mb-3 text-sm font-extrabold text-ink">Kategori</h3>
            <div className="mb-6 flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => setParam("cat", null)}
                className={`rounded-[9px] px-[11px] py-[7px] text-left text-[13.5px] ${
                  categorySlug === "__all__"
                    ? "bg-[#eaf2ee] font-bold text-forest"
                    : "text-muted hover:text-forest"
                }`}
              >
                {rootLabel}
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setParam("cat", c.slug)}
                  className={`rounded-[9px] px-[11px] py-[7px] text-left text-[13.5px] ${
                    c.slug === categorySlug
                      ? "bg-[#eaf2ee] font-bold text-forest"
                      : "text-muted hover:text-forest"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {brands.length > 0 ? (
              <>
                <h3 className="mb-3 text-sm font-extrabold text-ink">Brand</h3>
                <div className="mb-6 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setParam("brands", null)}
                    className="flex items-center gap-2.5 text-left text-[13px] text-muted"
                  >
                    <span
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] ${
                        selectedBrands.length === 0
                          ? "border-forest bg-forest text-white"
                          : "border-[#d6d2c6]"
                      }`}
                    >
                      {selectedBrands.length === 0 ? (
                        <CheckIcon size={11} strokeWidth={3.5} />
                      ) : null}
                    </span>
                    Semua Brand
                  </button>
                  {brands.map((b) => {
                    const on = selectedBrands.includes(b.name);
                    return (
                      <button
                        key={b.slug}
                        type="button"
                        onClick={() => toggleBrand(b.name)}
                        className="flex items-center gap-2.5 text-left text-[13px] text-muted"
                      >
                        <span
                          className={`flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border-[1.5px] ${
                            on
                              ? "border-forest bg-forest text-white"
                              : "border-[#d6d2c6]"
                          }`}
                        >
                          {on ? <CheckIcon size={11} strokeWidth={3.5} /> : null}
                        </span>
                        {b.name}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            <h3 className="mb-3 text-sm font-extrabold text-ink">
              Rentang Harga
            </h3>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Rp Min"
                defaultValue={min ?? ""}
                onBlur={(e) => setParam("min", e.target.value || null)}
                className="w-full rounded-[9px] border border-line-strong bg-white p-2.5 text-xs text-ink outline-none focus:border-forest"
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Rp Max"
                defaultValue={max ?? ""}
                onBlur={(e) => setParam("max", e.target.value || null)}
                className="w-full rounded-[9px] border border-line-strong bg-white p-2.5 text-xs text-ink outline-none focus:border-forest"
              />
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1">
            <div className="mb-4 hidden items-center justify-between md:flex">
              <div>
                <span className="text-[22px] font-extrabold text-ink">
                  {categoryName}
                </span>
                <span className="ml-2.5 text-[13px] text-faint">
                  {filtered.length} produk
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-[10px] border border-line-strong bg-white px-3 py-2 text-[13px] font-semibold text-ink">
                Urutkan:
                <select
                  value={sort}
                  onChange={(e) => setParam("sort", e.target.value)}
                  className="bg-transparent font-semibold outline-none"
                >
                  {(Object.keys(SORT_LABEL) as Sort[]).map((s) => (
                    <option key={s} value={s}>
                      {SORT_LABEL[s]}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} className="text-muted" />
              </div>
            </div>

            {filtered.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted">
                Tidak ada produk yang cocok dengan filter.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-8 md:grid-cols-3 md:gap-4">
                {filtered.map((p, i) => (
                  <ProductCard key={p.slug} product={p} priority={i < 4} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
