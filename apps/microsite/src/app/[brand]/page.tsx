import type { Metadata } from "next";
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

export default async function BrandPage({ params }: PageProps<"/[brand]">) {
  const { brand: slug } = await params;
  const [brand, campaign] = await Promise.all([loadActiveBrand(slug), getCachedCampaign()]);
  return <BrandPageView brand={brand} campaign={campaign} />;
}
