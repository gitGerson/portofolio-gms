import {
  Skeleton,
  SkeletonShell,
  ProductGridSkeleton,
} from "@/app/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <SkeletonShell>
      <div className="px-4 pt-4 md:px-10 md:pt-6">
        <div className="md:flex md:gap-8">
          <div className="hidden w-[236px] flex-none md:block">
            <Skeleton className="mb-3 h-4 w-24" />
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="mb-1.5 h-8 w-full" />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-4 hidden h-7 w-40 md:block" />
            <ProductGridSkeleton
              count={6}
              className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4"
            />
          </div>
        </div>
      </div>
    </SkeletonShell>
  );
}
