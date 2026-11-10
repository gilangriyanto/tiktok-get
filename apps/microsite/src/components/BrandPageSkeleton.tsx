import { SiteHeader } from "./SiteHeader";

/** Fallback halaman brand selama params & data dimuat; bentuknya mengikuti BrandPageView. */
export function BrandPageSkeleton() {
  return (
    <>
      <SiteHeader bordered />
      <main className="flex-1 pb-16" aria-busy aria-label="Memuat halaman brand">
        <div className="aspect-750/780 w-full animate-pulse bg-white/10 desktop:aspect-1680/940" />
        <div className="container-site mt-6 desktop:hidden">
          <div className="h-14 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-white/10" />
        </div>
        <div className="container-site mt-12 desktop:mt-8">
          <div className="mx-auto h-44 max-w-lg rounded-card border-2 border-pink/50 shadow-glow-pink" />
        </div>
        <div className="container-site mt-12">
          <div className="h-9 w-56 animate-pulse rounded bg-white/10 desktop:mx-auto" />
          <div className="mx-auto mt-6 grid max-w-3xl gap-5 desktop:grid-cols-2">
            <div className="ticket-notch-right h-44 animate-pulse rounded-card bg-soldout/60" />
            <div className="ticket-notch-right h-44 animate-pulse rounded-card bg-pink/40" />
          </div>
        </div>
      </main>
    </>
  );
}
