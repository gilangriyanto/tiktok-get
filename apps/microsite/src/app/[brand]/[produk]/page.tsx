import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BrandPageSkeleton } from "@/components/BrandPageSkeleton";
import { BrandPageView } from "@/components/BrandPageView";
import { activeBrandSlugs, loadActiveBrand } from "@/lib/brand-page";
import { getCachedCampaign } from "@/lib/queries";

export async function generateStaticParams() {
  const slugs = await activeBrandSlugs();
  const brands = await Promise.all(slugs.map(loadActiveBrand));
  return brands.flatMap((b) => b.products.map((p) => ({ brand: b.slug, produk: p.slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[brand]/[produk]">): Promise<Metadata> {
  const { brand: slug, produk } = await params;
  const brand = await loadActiveBrand(slug);
  const product = brand.products.find((p) => p.slug === produk);
  return { title: `#TikTokGet${brand.name}${product ? ` — ${product.variant}` : ""}` };
}

/** Halaman brand yang sama, dengan kartu produk di-scroll & di-highlight. */
export default function BrandProductPage({ params }: PageProps<"/[brand]/[produk]">) {
  return (
    <Suspense fallback={<BrandPageSkeleton />}>
      <BrandProductContent params={params} />
    </Suspense>
  );
}

async function BrandProductContent({ params }: Pick<PageProps<"/[brand]/[produk]">, "params">) {
  const { brand: slug, produk } = await params;
  const [brand, campaign] = await Promise.all([loadActiveBrand(slug), getCachedCampaign()]);
  if (!brand.products.some((p) => p.slug === produk)) notFound();
  return <BrandPageView brand={brand} campaign={campaign} highlightSlug={produk} />;
}
