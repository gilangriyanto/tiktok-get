import type {
  BrandStatus,
  ClaimLimitPeriod,
  ClaimLimitScope,
  FaqCategory,
  Retailer,
  RetailerMode,
  Source,
} from "@tiktok-get/shared";

export const RETAILER_LABELS: Record<Retailer, string> = { indomaret: "Indomaret", alfamart: "Alfamart" };

export const RETAILER_MODE_LABELS: Record<RetailerMode, string> = {
  indomaret: "Indomaret saja",
  alfamart: "Alfamart saja",
  both: "Indomaret & Alfamart",
};

export const CLAIM_PERIOD_LABELS: Record<ClaimLimitPeriod, string> = { day: "Per hari", campaign: "Per campaign" };

export const CLAIM_SCOPE_LABELS: Record<ClaimLimitScope, string> = {
  campaign: "Seluruh campaign",
  brand: "Per brand",
  product: "Per produk",
};

export const BRAND_STATUS_LABELS: Record<BrandStatus, string> = {
  active: "Aktif",
  coming_soon: "Coming soon",
  inactive: "Nonaktif",
};

export const FAQ_CATEGORY_LABELS: Record<FaqCategory, string> = {
  umum: "Umum",
  indomaret: "Indomaret",
  alfamart: "Alfamart",
};

export const SOURCE_LABELS: Record<Source, string> = { tiktok: "TikTok", reguler: "Reguler" };

/** Record label → opsi Select. */
export function toOptions<K extends string>(labels: Record<K, string>): { value: K; label: string }[] {
  return (Object.keys(labels) as K[]).map((value) => ({ value, label: labels[value] }));
}
