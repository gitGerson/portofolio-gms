import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { CartUIProvider } from "@/lib/cart-ui-context";
import { ToastProvider } from "./components/ui/toast";
import { ConfirmProvider } from "./components/ui/confirm-dialog";
import { CartDrawer } from "./components/cart-drawer";
import { TopProgress } from "./components/top-progress";
import { MotionProvider } from "./components/motion/motion-provider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Goldstar Official Store",
  description:
    "Belanja charger, kabel data, adaptor, dan NAS storage. Pembayaran QRIS, konfirmasi pesanan via WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${spaceMono.variable} h-full`}
    >
      <body className="min-h-full bg-paper text-ink antialiased">
        <MotionProvider>
          <ToastProvider>
            <ConfirmProvider>
              <CartProvider>
                <CartUIProvider>
                  <TopProgress />
                  {children}
                  <CartDrawer />
                </CartUIProvider>
              </CartProvider>
            </ConfirmProvider>
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
