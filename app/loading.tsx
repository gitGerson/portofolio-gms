import {
  Skeleton,
  SkeletonShell,
  ProductGridSkeleton,
} from "./components/ui/skeleton";

export default function HomeLoading() {
  return (
    <SkeletonShell>
      <div className="px-[18px] pt-[18px] md:px-10 md:pt-7">
        <Skeleton className="h-[142px] w-full rounded-[20px] md:h-[208px]" />
        <Skeleton className="mt-6 h-5 w-32" />
        <div className="mt-3.5 grid grid-cols-3 gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-[15px]" />
          ))}
        </div>
        <Skeleton className="mt-6 h-5 w-36" />
        <div className="mt-3.5">
          <ProductGridSkeleton count={4} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4" />
        </div>
      </div>
    </SkeletonShell>
  );
}
