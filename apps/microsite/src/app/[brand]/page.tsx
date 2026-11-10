import type { Metadata } from "next";
import { Suspense } from "react";
import { BrandPageSkeleton } from "@/components/BrandPageSkeleton";
import { BrandPageView } from "@/components/BrandPageView";
import { activeBrandSlugs, loadActiveBrand } from "@/lib/brand-page";
import { getCachedCampaign } from "@/lib/queries";

export async function generateStaticParams() {
  return (await activeBrandSlugs()).map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: PageProps<"/[brand]">): Promise<Metadata> {
  const brand = await loadActiveBrand((await params).brand);
  return { title: `#TikTokGet${brand.name}` };
}

/** params dibaca di dalam <Suspense> agar shell bisa dikirim tanpa menunggu URL data. */
export default function BrandPage({ params }: PageProps<"/[brand]">) {
  return (
    <Suspense fallback={<BrandPageSkeleton />}>
      <BrandContent params={params} />
    </Suspense>
  );
}

async function BrandContent({ params }: Pick<PageProps<"/[brand]">, "params">) {
  const { brand: slug } = await params;
  const [brand, campaign] = await Promise.all([loadActiveBrand(slug), getCachedCampaign()]);
  return <BrandPageView brand={brand} campaign={campaign} />;
}
