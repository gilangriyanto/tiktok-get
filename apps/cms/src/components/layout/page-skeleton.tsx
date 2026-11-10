import { Skeleton } from "@/components/ui/skeleton";

/** Fallback Suspense untuk halaman tabel/form. */
export function PageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="Memuat">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-9 w-full max-w-xl" />
      <div className="flex flex-col gap-2 rounded-lg border p-3">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}
