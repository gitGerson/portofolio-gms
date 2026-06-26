"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CellComponent, ColumnDefinition } from "tabulator-tables";
import type { Order, OrderStatus } from "@/lib/data/types";
import { useToast } from "@/app/components/ui/toast";
import { DataTable } from "../_table/data-table";
import { rupiahFormatter } from "../_table/formatters";
import { updateStatusAction } from "./actions";
import { STATUS_CLASS, STATUS_LABEL } from "./status-meta";

type Row = {
  id: string;
  orderNo: string;
  customerName: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
};

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function OrdersTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const data = useMemo<Row[]>(
    () =>
      orders.map((o) => ({
        id: o.id,
        orderNo: o.orderNo,
        customerName: o.customerName,
        itemCount: o.items.length,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt,
      })),
    [orders],
  );

  const columns = useMemo<ColumnDefinition[]>(() => {
    const statusValues = STATUS_LABEL as Record<string, string>;

    async function onStatusEdited(cell: CellComponent) {
      const id = cell.getRow().getData().id as string;
      const status = cell.getValue() as OrderStatus;
      try {
        await updateStatusAction(id, status);
        toast("Status diperbarui");
      } catch {
        cell.restoreOldValue();
        toast("Gagal memperbarui status", "error");
      }
    }

    function openCell(cell: CellComponent): HTMLElement {
      const id = cell.getRow().getData().id as string;
      const a = document.createElement("a");
      a.className = "gms-link";
      a.textContent = "Buka";
      a.href = `/admin/orders/${id}`;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        router.push(`/admin/orders/${id}`);
      });
      return a;
    }

    return [
      {
        title: "No. Pesanan",
        field: "orderNo",
        formatter: (cell) =>
          `<span style="font-family:var(--font-space-mono),monospace;font-weight:700">${cell.getValue()}</span>`,
        minWidth: 150,
      },
      {
        title: "Pelanggan",
        field: "customerName",
        minWidth: 160,
      },
      {
        title: "Item",
        field: "itemCount",
        hozAlign: "center",
        width: 80,
      },
      {
        title: "Total",
        field: "total",
        formatter: rupiahFormatter,
        hozAlign: "right",
        minWidth: 120,
      },
      {
        title: "Status",
        field: "status",
        editor: "list",
        editorParams: { values: statusValues },
        cellEdited: onStatusEdited,
        formatter: (cell) => {
          const s = cell.getValue() as OrderStatus;
          return `<span class="gms-pill ${STATUS_CLASS[s]}">${STATUS_LABEL[s]}</span>`;
        },
        minWidth: 150,
      },
      {
        title: "Tanggal",
        field: "createdAt",
        formatter: (cell) => {
          const v = cell.getValue();
          return v ? dateFmt.format(new Date(v as string)) : "—";
        },
        minWidth: 120,
      },
      {
        title: "",
        field: "id",
        formatter: openCell,
        headerSort: false,
        width: 90,
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DataTable
      data={data}
      columns={columns}
      searchFields={["orderNo", "customerName"]}
      searchPlaceholder="Cari pesanan…"
    />
  );
}
