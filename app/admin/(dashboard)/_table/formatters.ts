import { formatRupiah } from "@/lib/format";
import type { CellComponent } from "tabulator-tables";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Rp formatter; blank for null/empty. */
export function rupiahFormatter(cell: CellComponent): string {
  const v = cell.getValue();
  if (v == null || v === "") return "—";
  return formatRupiah(Number(v));
}

/** Stock badge mirroring the old products list pill colors. */
export function stockFormatter(cell: CellComponent): string {
  const n = Number(cell.getValue() ?? 0);
  const style =
    n === 0
      ? "background:var(--color-danger-bg);color:var(--color-danger)"
      : n <= 5
        ? "background:#fbf4e3;color:#8a6e2c"
        : "background:var(--color-ready-bg);color:var(--color-ready)";
  return `<span class="gms-pill" style="${style}">Stok ${n}</span>`;
}

/** Plain text with em-dash fallback. */
export function dashFormatter(cell: CellComponent): string {
  const v = cell.getValue();
  if (v == null || v === "") return "—";
  return esc(String(v));
}
