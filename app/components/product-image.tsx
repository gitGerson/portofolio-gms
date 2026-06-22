import Image from "next/image";
import { productImageUrl } from "@/lib/images";

/**
 * Product image with placeholder fallback. The wrapper controls size via
 * `className` (must establish a positioning context + dimensions); the image
 * fills it. When there's no photo, shows the striped placeholder + tag.
 */
export function ProductImage({
  imagePath,
  tag,
  alt,
  className = "",
  sizes = "(max-width: 768px) 50vw, 25vw",
  priority = false,
}: {
  imagePath: string | null;
  tag?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const url = productImageUrl(imagePath);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {url ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <div className="ph-texture flex h-full w-full items-center justify-center">
          {tag ? (
            <span className="font-mono text-[10px] text-[#a7afa6]">
              [ {tag} ]
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
