import { Skeleton, SkeletonShell } from "@/app/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <SkeletonShell>
      <div className="md:flex md:gap-10 md:px-10 md:py-8">
        <div className="bg-white md:flex-1">
          <Skeleton className="mx-4 mt-4 h-60 rounded-[18px] md:mx-0 md:h-[420px]" />
          <div className="flex gap-2.5 px-4 pb-1 pt-3 md:px-0">
            <Skeleton className="h-[54px] w-[54px] rounded-[11px]" />
          </div>
        </div>
        <div className="px-[18px] pb-5 pt-3 md:w-[420px] md:flex-none md:px-0">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-6 w-3/4" />
          <Skeleton className="mt-4 h-7 w-40" />
          <Skeleton className="mt-3 h-6 w-24" />
          <div className="my-5 h-px bg-line" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-5/6" />
          <Skeleton className="mt-1.5 h-3 w-4/6" />
        </div>
      </div>
    </SkeletonShell>
  );
}
