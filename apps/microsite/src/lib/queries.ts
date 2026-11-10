import { cacheLife } from "next/cache";
import { getBrand, getBrands, getCampaign } from "./api";

/*
 * Pembungkus ber-cache untuk Server Components (Cache Components).
 * Data publik campaign/brand boleh di-cache; data voucher per-token TIDAK di-cache.
 */

export async function getCachedCampaign() {
  "use cache";
  cacheLife("minutes");
  return getCampaign();
}

export async function getCachedBrands() {
  "use cache";
  cacheLife("minutes");
  return getBrands();
}

export async function getCachedBrand(slug: string) {
  "use cache";
  cacheLife("minutes");
  return getBrand(slug);
}
