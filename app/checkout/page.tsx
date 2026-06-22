import { ShopShell } from "@/app/components/shop-shell";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <ShopShell active="Keranjang" showFab={false}>
      <CheckoutForm />
    </ShopShell>
  );
}
