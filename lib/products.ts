/**
 * Static store configuration. Product/category/brand DATA now lives in Supabase
 * (see lib/data/*). This module only holds non-DB constants.
 */
export const STORE = {
  name: process.env.NEXT_PUBLIC_STORE_NAME ?? "Goldstar",
  tagline: process.env.NEXT_PUBLIC_STORE_TAGLINE ?? "Official Store",
  /** WhatsApp number for order confirmation (international format, no +). */
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "6281234567890",
} as const;
