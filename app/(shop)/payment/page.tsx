import { ShopShell } from "@/app/components/shop-shell";
import { PaymentView } from "./payment-view";

export const dynamic = "force-dynamic";

export default function PaymentPage() {
  return (
    <ShopShell showFab={false}>
      <PaymentView />
    </ShopShell>
  );
}
