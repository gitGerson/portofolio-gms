import { Header } from "@/app/components/header";
import { BottomNav } from "@/app/components/bottom-nav";
import { Footer } from "@/app/components/footer";
import { WaFab } from "@/app/components/wa-fab";
import { getCategories } from "@/lib/data/categories";
import type { Category } from "@/lib/data/types";

/**
 * Persistent storefront chrome (header + content + mobile bottom nav + WA fab).
 * Lives in a layout so it stays mounted across navigations — only the page
 * content inside `app/(shop)/template.tsx` re-mounts and animates.
 */
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: Category[] = [];
  try {
    categories = await getCategories();
  } catch {
    // DB not reachable / not seeded yet — render with an empty nav.
  }

  return (
    <div className="flex min-h-dvh w-full flex-col bg-paper">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
      <BottomNav />
      <WaFab />
    </div>
  );
}
