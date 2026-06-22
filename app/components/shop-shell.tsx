import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { WaFab } from "./wa-fab";
import { getCategories } from "@/lib/data/categories";
import type { Category } from "@/lib/data/types";

/** Shared chrome for storefront pages (header + content + mobile bottom nav + WA fab). */
export async function ShopShell({
  children,
  active,
  showFab = true,
}: {
  children: React.ReactNode;
  active?: string;
  showFab?: boolean;
}) {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    // DB not reachable / not seeded yet — render with an empty nav.
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-[1280px] flex-col bg-paper">
      <Header active={active} categories={categories} />
      <main className="flex-1">{children}</main>
      <BottomNav categories={categories} />
      {showFab ? <WaFab /> : null}
    </div>
  );
}
