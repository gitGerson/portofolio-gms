"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { useConfirm } from "@/app/components/ui/confirm-dialog";
import { useToast } from "@/app/components/ui/toast";

type SimpleState = { error?: string; ok?: boolean } | null;
type CreateAction = (
  state: SimpleState,
  formData: FormData,
) => Promise<SimpleState>;

export type CrudItem = { id: string; name: string; meta?: string };

export function SimpleCrud({
  title,
  labelSingular,
  items,
  createAction,
  deleteAction,
  withSortOrder = false,
}: {
  title: string;
  labelSingular: string;
  items: CrudItem[];
  createAction: CreateAction;
  deleteAction: (id: string) => Promise<void>;
  withSortOrder?: boolean;
}) {
  const [state, formAction, pending] = useActionState<SimpleState, FormData>(
    createAction,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  // Clear the form + confirm after a successful add.
  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      toast(`${labelSingular} ditambahkan`);
    }
  }, [state, labelSingular, toast]);

  return (
    <div>
      <h1 className="mb-5 text-2xl font-extrabold text-ink">{title}</h1>

      <form
        ref={formRef}
        action={formAction}
        className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-line bg-white p-4"
      >
        <div className="min-w-[180px] flex-1">
          <label className="mb-1.5 block text-[12px] font-semibold text-muted">
            Nama {labelSingular}
          </label>
          <input
            name="name"
            required
            className="w-full rounded-[10px] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-forest"
            placeholder={`Nama ${labelSingular.toLowerCase()}`}
          />
        </div>
        {withSortOrder ? (
          <div className="w-28">
            <label className="mb-1.5 block text-[12px] font-semibold text-muted">
              Urutan
            </label>
            <input
              name="sortOrder"
              type="number"
              defaultValue={items.length + 1}
              className="w-full rounded-[10px] border border-line-strong bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-forest"
            />
          </div>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="h-[42px] rounded-[11px] bg-forest px-5 text-sm font-bold text-white hover:bg-forest-dark disabled:opacity-70"
        >
          {pending ? "Menyimpan…" : "Tambah"}
        </button>
        {state?.error ? (
          <p className="w-full text-[12.5px] font-semibold text-danger">
            {state.error}
          </p>
        ) : null}
      </form>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted">
            Belum ada {labelSingular.toLowerCase()}.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between p-3.5"
              >
                <div>
                  <span className="text-sm font-semibold text-ink">
                    {item.name}
                  </span>
                  {item.meta ? (
                    <span className="ml-2 text-[12px] text-faint">
                      {item.meta}
                    </span>
                  ) : null}
                </div>
                <DeleteButton
                  name={item.name}
                  onDelete={() => deleteAction(item.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DeleteButton({
  name,
  onDelete,
}: {
  name: string;
  onDelete: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();
  const { toast } = useToast();

  async function onClick() {
    const ok = await confirm({
      title: "Hapus?",
      message: `"${name}" akan dihapus.`,
      confirmLabel: "Hapus",
      danger: true,
    });
    if (!ok) return;
    startTransition(async () => {
      await onDelete();
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
