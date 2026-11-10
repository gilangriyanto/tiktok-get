import {
  ClaimRequestSchema,
  type ClaimRequestInput,
  type VoucherView,
} from "@tiktok-get/shared";
import type { ClaimResult } from "@/lib/api";
import { mockBrands } from "./brands";

const DEMO_TOKEN = "demo-token";
const EXPIRED_TOKEN = "expired-token";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Aturan mock (berdasarkan No. HP setelah dinormalisasi):
 * - berakhiran "000" → QUOTA_EXCEEDED
 * - berakhiran "111" → OUT_OF_STOCK
 * - berakhiran "222" → RATE_LIMITED
 * - selain itu → sukses dengan token "demo-token"
 */
export async function mockClaim(input: ClaimRequestInput): Promise<ClaimResult> {
  await delay(800);
  const parsed = ClaimRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: { code: "VALIDATION", message: parsed.error.issues[0]?.message },
    };
  }

  const { phone, productSlug } = parsed.data;
  const product = mockBrands.flatMap((b) => b.products).find((p) => p.slug === productSlug);
  if (!product || product.stockStatus === "sold_out") {
    return { ok: false, error: { code: "OUT_OF_STOCK" } };
  }
  if (phone.endsWith("000")) return { ok: false, error: { code: "QUOTA_EXCEEDED" } };
  if (phone.endsWith("111")) return { ok: false, error: { code: "OUT_OF_STOCK" } };
  if (phone.endsWith("222")) return { ok: false, error: { code: "RATE_LIMITED" } };
  return { ok: true, data: { viewToken: DEMO_TOKEN } };
}

const nescafe = mockBrands[0];

const baseVoucher: Omit<VoucherView, "expiresAt"> = {
  brand: {
    slug: nescafe.slug,
    name: nescafe.name,
    logo: nescafe.logo,
    heroMobile: nescafe.heroMobile,
  },
  product: { slug: "ice-roast-220ml", name: "Nescafe", variant: "Ice Roast 220ML" },
  code: "1239830342493020",
  retailer: "indomaret",
};

/** "demo-token" → voucher aktif, "expired-token" → kedaluwarsa, lainnya → tidak ditemukan. */
export async function mockGetVoucher(token: string): Promise<VoucherView | null> {
  if (token === DEMO_TOKEN) return { ...baseVoucher, expiresAt: "2027-01-04T23:59:59+07:00" };
  if (token === EXPIRED_TOKEN) return { ...baseVoucher, expiresAt: "2026-01-04T23:59:59+07:00" };
  return null;
}
