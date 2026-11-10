import type { Retailer, RetailerMode } from "@tiktok-get/shared";
import { PLACEHOLDER } from "./placeholders";

export const RETAILER_LABELS: Record<Retailer, string> = {
  indomaret: "Indomaret",
  alfamart: "Alfamart",
};

export function retailerModeLabel(mode: RetailerMode): string {
  return mode === "all" ? "Indomaret & Alfamart" : RETAILER_LABELS[mode];
}

export function retailersOf(mode: RetailerMode): Retailer[] {
  return mode === "all" ? ["indomaret", "alfamart"] : [mode];
}

/** TODO(aset): logo retailer asli. */
export const RETAILER_LOGOS: Record<Retailer, string> = {
  indomaret: PLACEHOLDER.retailerLogo,
  alfamart: PLACEHOLDER.retailerLogo,
};
