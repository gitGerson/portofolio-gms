"use client";

import { useTransition } from "react";
import { useConfirm } from "@/app/components/ui/confirm-dialog";
import { useToast } from "@/app/components/ui/toast";
import { deleteProductAction } from "./actions";

export function DeleteProductButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const { toast } = useToast();

  async function onClick() {
    const ok = await confirm({
      title: "Hapus produk?",
      message: `"${name}" akan dihapus permanen dari katalog.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      await deleteProductAction(id);
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
