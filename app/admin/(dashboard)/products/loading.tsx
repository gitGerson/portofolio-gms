import { Skeleton } from "@/app/components/ui/skeleton";

export default function AdminProductsLoading() {
  return (
    <div>
      <Skeleton className="mb-5 h-7 w-40" />
      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line p-4 last:border-0">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="mt-1.5 h-3 w-1/4" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
