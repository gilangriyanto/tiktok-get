import { notFound } from "next/navigation";
import type { BrandDetail } from "@tiktok-get/shared";
import { getCachedBrand, getCachedBrands } from "./queries";

/** Brand yang bisa dibuka halamannya (status active); selain itu 404. */
export async function loadActiveBrand(slug: string): Promise<BrandDetail> {
  const brand = await getCachedBrand(slug);
  if (!brand || brand.status !== "active") notFound();
  return brand;
}

export async function activeBrandSlugs(): Promise<string[]> {
  const brands = await getCachedBrands();
  return brands.filter((b) => b.status === "active").map((b) => b.slug);
}
