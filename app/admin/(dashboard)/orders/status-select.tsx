"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@/lib/data/types";
import { updateStatusAction } from "./actions";
import { ORDER_STATUSES, STATUS_LABEL } from "./status-meta";

export function StatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={current}
        disabled={pending}
        onChange={(e) =>
          startTransition(() =>
            updateStatusAction(orderId, e.target.value as OrderStatus),
          )
        }
        className="rounded-[10px] border border-line-strong bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-forest disabled:opacity-60"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {pending ? (
        <span className="text-[12px] text-faint">Menyimpan…</span>
      ) : null}
    </div>
  );
}
