import { waLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";

/** Floating WhatsApp button (mobile). */
export function WaFab() {
  return (
    <a
      href={waLink("Halo Goldstar, saya mau tanya produk.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="fixed bottom-20 right-[18px] z-30 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-wa text-white shadow-[0_8px_20px_-4px_rgba(31,138,91,0.6)] md:bottom-6"
    >
      <WhatsAppIcon size={26} />
    </a>
  );
}
