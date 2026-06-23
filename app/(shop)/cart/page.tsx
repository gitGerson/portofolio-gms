import { ShopShell } from "@/app/components/shop-shell";
import { CartView } from "./cart-view";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <ShopShell active="Keranjang" showFab={false}>
      <CartView />
    </ShopShell>
  );
}
