import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { STORE } from "@/lib/products";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  // Already an admin? Skip the form.
  const user = await getAdminUser();
  if (user) redirect("/admin");

  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-board px-4">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-xl font-extrabold text-gold">
            {STORE.name.charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="text-lg font-extrabold leading-none text-ink">
              {STORE.name.toUpperCase()}
            </div>
            <div className="font-mono text-[11px] tracking-wider text-faint">
              ADMIN PANEL
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h1 className="text-xl font-extrabold text-ink">Masuk Admin</h1>
          <p className="mt-1 text-[13px] text-muted">
            Gunakan akun admin yang terdaftar.
          </p>
          <LoginForm redirectTo={redirectTo ?? "/admin"} />
        </div>
      </div>
    </div>
  );
}
