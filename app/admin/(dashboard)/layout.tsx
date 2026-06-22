import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/auth";
import { signOutAction } from "../auth-actions";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-dvh bg-board">
      <div className="mx-auto flex max-w-[1280px] flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="flex flex-col gap-5 border-b border-line bg-white p-5 md:min-h-dvh md:w-60 md:flex-none md:border-b-0 md:border-r">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-forest text-base font-extrabold text-gold">
              G
            </span>
            <span>
              <span className="block text-sm font-extrabold leading-none text-ink">
                GOLDSTAR
              </span>
              <span className="font-mono text-[10px] tracking-wider text-faint">
                ADMIN
              </span>
            </span>
          </Link>

          <AdminNav />

          <div className="mt-auto hidden md:block">
            <div className="mb-2 truncate text-[11px] text-faint">
              {user.email}
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full rounded-[10px] border border-line px-3 py-2 text-[13px] font-semibold text-muted hover:border-danger hover:text-danger"
              >
                Keluar
              </button>
            </form>
          </div>

          {/* Mobile sign out */}
          <form action={signOutAction} className="md:hidden">
            <button
              type="submit"
              className="rounded-[10px] border border-line px-3 py-2 text-[13px] font-semibold text-muted"
            >
              Keluar
            </button>
          </form>
        </aside>

        {/* Content */}
        <main className="flex-1 p-5 md:p-8">
          <Link
            href="/"
            target="_blank"
            className="mb-4 inline-block text-[12px] font-semibold text-forest"
          >
            ↗ Lihat storefront
          </Link>
          {children}
        </main>
      </div>
    </div>
  );
}
