/**
 * Striped placeholder standing in for a real product photo.
 * Swap for next/image once real assets exist.
 */
export function Placeholder({
  tag,
  className = "",
}: {
  tag?: string;
  className?: string;
}) {
  return (
    <div
      className={`ph-texture flex items-center justify-center ${className}`}
    >
      {tag ? (
        <span className="font-mono text-[10px] text-[#a7afa6]">[ {tag} ]</span>
      ) : null}
    </div>
  );
}
