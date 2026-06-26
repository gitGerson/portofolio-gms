"use client";

import { useEffect, useRef } from "react";
import {
  TabulatorFull as Tabulator,
  type ColumnDefinition,
  type Options,
} from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator.min.css";
import "./tabulator-theme.css";

type Row = Record<string, unknown> & { id: string };

export type DataTableProps<T extends Row> = {
  columns: ColumnDefinition[];
  data: T[];
  /** Fields the global search box matches against (case-insensitive substring). */
  searchFields?: string[];
  searchPlaceholder?: string;
  initialSort?: { column: string; dir: "asc" | "desc" }[];
  /** Receives the table instance once built (for row deletion etc.). */
  onReady?: (table: Tabulator) => void;
  options?: Partial<Options>;
};

export function DataTable<T extends Row>({
  columns,
  data,
  searchFields,
  searchPlaceholder = "Cari…",
  initialSort,
  onReady,
  options,
}: DataTableProps<T>) {
  const elRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<Tabulator | null>(null);
  const builtRef = useRef(false);

  // Snapshot of the first-render props; the table is built once from these,
  // and later data changes are pushed via replaceData below.
  const latest = useRef({ columns, data, initialSort, onReady, options });

  // Build the table exactly once (guarded for strict-mode double effects).
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const {
      columns: cols,
      data: rows,
      initialSort: sort,
      onReady: ready,
      options: opts,
    } = latest.current;

    const table = new Tabulator(el, {
      data: rows,
      columns: cols,
      index: "id",
      layout: "fitColumns",
      columnDefaults: { vertAlign: "middle" },
      movableColumns: true,
      pagination: true,
      paginationSize: 25,
      paginationSizeSelector: [25, 50, 100],
      paginationCounter: "rows",
      initialSort: sort,
      placeholder: "Tidak ada data.",
      ...opts,
    });
    tableRef.current = table;

    table.on("tableBuilt", () => {
      builtRef.current = true;
      ready?.(table);
    });

    return () => {
      builtRef.current = false;
      tableRef.current = null;
      table.destroy();
    };
  }, []);

  // Push new data into the existing table when the prop changes.
  useEffect(() => {
    if (builtRef.current && tableRef.current) {
      tableRef.current.replaceData(data);
    }
  }, [data]);

  function onSearch(value: string) {
    const table = tableRef.current;
    if (!table || !searchFields || searchFields.length === 0) return;
    const q = value.trim().toLowerCase();
    if (!q) {
      table.clearFilter(true);
      return;
    }
    table.setFilter((row: Record<string, unknown>) =>
      searchFields.some((f) =>
        String(row[f] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }

  return (
    <div className="gms-table">
      {searchFields && searchFields.length > 0 ? (
        <div className="gms-table-toolbar">
          <input
            type="search"
            className="gms-search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      ) : null}
      <div ref={elRef} />
    </div>
  );
}
