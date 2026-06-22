/**
 * Public URL for a product image stored in the `product-images` bucket.
 * Returns null when there is no image, so callers fall back to the placeholder.
 */
export function productImageUrl(imagePath: string | null): string | null {
  if (!imagePath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/product-images/${imagePath}`;
}
