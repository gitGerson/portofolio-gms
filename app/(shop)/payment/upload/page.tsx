import { ShopShell } from "@/app/components/shop-shell";
import { UploadView } from "./upload-view";

export const dynamic = "force-dynamic";

export default function UploadProofPage() {
  return (
    <ShopShell showFab={false}>
      <UploadView />
    </ShopShell>
  );
}
