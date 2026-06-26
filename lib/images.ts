/**
 * Public URL for a product image stored in the `product-images` bucket.
 * Returns null when there is no image, so callers fall back to the placeholder.
 *
 * Absolute URLs (e.g. open-source seed images) are passed through as-is;
 * anything else is treated as a path within the bucket.
 */
export function productImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  if (/^https?:\/\//.test(imagePath)) return imagePath;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/product-images/${imagePath}`;
}
