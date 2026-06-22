/** Shimmering placeholder block. Compose into route-shaped skeletons. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <Skeleton className="h-40 rounded-none" />
      <div className="p-3.5">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="mt-2 h-3 w-1/3" />
        <div className="mt-3 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded-[9px]" />
        </div>
      </div>
    </div>
  );
}

/** Approximate storefront chrome (header) wrapping a skeleton body. */
export function SkeletonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full bg-paper">
      {/* Mobile header */}
      <div className="bg-forest px-[18px] pb-[18px] pt-2.5 md:hidden">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-[11px] bg-white/20" />
          <Skeleton className="h-4 w-28 bg-white/20" />
          <Skeleton className="ml-auto h-[42px] w-[42px] rounded-xl bg-white/20" />
        </div>
        <Skeleton className="mt-4 h-10 w-full rounded-[13px] bg-white/30" />
      </div>
      {/* Desktop header */}
      <div className="hidden h-[70px] items-center gap-6 border-b border-line bg-white px-10 md:flex">
        <Skeleton className="h-[38px] w-[38px] rounded-[10px]" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="ml-auto h-[42px] w-[360px] rounded-xl" />
        <Skeleton className="h-[42px] w-[42px] rounded-xl" />
      </div>
      {children}
    </div>
  );
}

export function ProductGridSkeleton({
  count = 6,
  className = "grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
