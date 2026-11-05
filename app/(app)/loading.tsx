import { Skeleton } from "@/components/ui/skeleton";

/** Shared fallback while a page's data loads; nav stays interactive. */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-4">
      <div className="mb-1 flex flex-col gap-2 lg:mb-4">
        <Skeleton className="h-8 w-40 lg:h-9" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-56 rounded-2xl lg:col-span-2 lg:h-72" />
        <Skeleton className="h-36 rounded-2xl lg:h-72" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-18" />
        <Skeleton className="h-18" />
        <Skeleton className="h-18" />
      </div>
    </div>
  );
}
