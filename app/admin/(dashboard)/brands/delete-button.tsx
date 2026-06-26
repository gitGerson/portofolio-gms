"use client";

import { useTransition } from "react";
import { useConfirm } from "@/app/components/ui/confirm-dialog";
import { useToast } from "@/app/components/ui/toast";
import { deleteBrandAction } from "./actions";

export function DeleteBrandButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const { toast } = useToast();

  async function onClick() {
    const ok = await confirm({
      title: "Hapus brand?",
      message: `"${name}" akan dihapus.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      await deleteBrandAction(id);
      toast(`"${name}" dihapus`);
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="text-[12.5px] font-semibold text-danger hover:underline disabled:opacity-50"
    >
      {pending ? "Menghapus…" : "Hapus"}
    </button>
  );
}
