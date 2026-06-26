"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Promotion } from "@/lib/data/types";
import { formatRupiah } from "@/lib/format";
import { useToast } from "@/app/components/ui/toast";
import { useConfirm } from "@/app/components/ui/confirm-dialog";
import { deletePromotionAction, togglePromotionActive } from "./actions";

function discountLabel(p: Promotion): string {
  if (p.discountPct != null) return `${p.discountPct}%`;
  if (p.discountAmount != null) return formatRupiah(p.discountAmount);
  return "—";
}

function windowLabel(p: Promotion): string {
  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("id-ID") : "∞";
  return `${fmt(p.startsAt)} – ${fmt(p.endsAt)}`;
}

type Status = { label: string; cls: string };

function runtimeStatus(p: Promotion): Status {
  if (!p.active) return { label: "Nonaktif", cls: "bg-paper text-faint" };
  const now = Date.now();
  if (p.startsAt && new Date(p.startsAt).getTime() > now)
    return { label: "Terjadwal", cls: "bg-gold/20 text-ink" };
  if (p.endsAt && new Date(p.endsAt).getTime() < now)
    return { label: "Berakhir", cls: "bg-paper text-faint" };
  return { label: "Berjalan", cls: "bg-[#eaf2ee] text-forest" };
}

export function PromotionsTable({ promotions }: { promotions: Promotion[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [rows, setRows] = useState(promotions);
  const [busy, setBusy] = useState<string | null>(null);

  async function onToggle(p: Promotion) {
    setBusy(p.id);
    const res = await togglePromotionActive(p.id, !p.active);
    setBusy(null);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    setRows((rs) =>
      rs.map((r) => (r.id === p.id ? { ...r, active: !p.active } : r)),
    );
    toast(p.active ? "Promo dinonaktifkan" : "Promo diaktifkan");
  }

  async function onDelete(p: Promotion) {
    const ok = await confirm({
      title: "Hapus promo?",
      message: `"${p.title}" akan dihapus.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    await deletePromotionAction(p.id);
    setRows((rs) => rs.filter((r) => r.id !== p.id));
    toast(`"${p.title}" dihapus`);
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-white px-5 py-10 text-center text-sm text-muted">
        Belum ada promo. Buat promo baru untuk mulai menjadwalkan diskon.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[12px] font-semibold text-muted">
            <th className="px-4 py-3">Judul</th>
            <th className="px-4 py-3">Diskon</th>
            <th className="px-4 py-3">Periode</th>
            <th className="px-4 py-3">Produk</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const status = runtimeStatus(p);
            return (
              <tr key={p.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3 font-semibold text-ink">{p.title}</td>
                <td className="px-4 py-3 text-ink">{discountLabel(p)}</td>
                <td className="px-4 py-3 text-muted">{windowLabel(p)}</td>
                <td className="px-4 py-3 text-muted">{p.productIds.length}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.cls}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3 text-[13px] font-semibold">
                    <button
                      type="button"
                      onClick={() => onToggle(p)}
                      disabled={busy === p.id}
                      className="text-muted hover:text-forest disabled:opacity-50"
                    >
                      {p.active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                    <Link
                      href={`/admin/promotions/${p.id}`}
                      className="text-forest hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(`/admin/promotions/${p.id}`);
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => onDelete(p)}
                      className="text-danger hover:underline"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
