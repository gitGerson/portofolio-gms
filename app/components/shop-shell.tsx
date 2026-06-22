import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";
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
    <div className="flex min-h-dvh w-full flex-col bg-paper">
      <Header active={active} categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <BottomNav categories={categories} />
      {showFab ? <WaFab /> : null}
    </div>
  );
}
