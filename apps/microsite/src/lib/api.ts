import {
  BrandDetailSchema,
  BrandSchema,
  CampaignSchema,
  ClaimErrorSchema,
  ClaimResponseSchema,
  VoucherViewSchema,
  type Brand,
  type BrandDetail,
  type Campaign,
  type ClaimErrorCode,
  type ClaimRequestInput,
  type ClaimResponse,
  type VoucherView,
} from "@tiktok-get/shared";
import type { z } from "zod";

/**
 * Lapisan akses API microsite — satu fungsi per endpoint.
 * Mock dipakai jika NEXT_PUBLIC_USE_MOCK=true atau NEXT_PUBLIC_API_URL kosong.
 * Modul mock di-import dinamis agar tidak ikut bundle saat memakai API asli.
 *
 * TODO(api): samakan path endpoint dengan implementasi apps/api.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true" || API_URL === "";

/** Kode error dari API + "UNKNOWN" untuk kegagalan jaringan/respons tak terduga. */
export type ClaimFailureCode = ClaimErrorCode | "UNKNOWN";
export type ClaimResult =
  | { ok: true; data: ClaimResponse }
  | { ok: false; error: { code: ClaimFailureCode; message?: string } };

class ApiError extends Error {
  constructor(
    readonly status: number,
    path: string,
  ) {
    super(`API ${path} gagal (${status})`);
  }
}

async function getJson<S extends z.ZodType>(path: string, schema: S): Promise<z.output<S> | null> {
  const res = await fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(res.status, path);
  return schema.parse(await res.json());
}

/** GET /campaign */
export async function getCampaign(): Promise<Campaign> {
  if (USE_MOCK) return (await import("@/mocks/campaign")).mockCampaign;
  const campaign = await getJson("/campaign", CampaignSchema);
  if (!campaign) throw new ApiError(404, "/campaign");
  return campaign;
}

/** GET /brands — daftar brand untuk home (tanpa produk, tanpa yang inactive). */
export async function getBrands(): Promise<Brand[]> {
  if (USE_MOCK) {
    const { mockBrands } = await import("@/mocks/brands");
    return mockBrands
      .filter((b) => b.status !== "inactive")
      .map((b) => BrandSchema.parse(b));
  }
  return (await getJson("/brands", BrandSchema.array())) ?? [];
}

/** GET /brands/:slug — brand + produk. null jika tidak ada. */
export async function getBrand(slug: string): Promise<BrandDetail | null> {
  if (USE_MOCK) {
    const { mockBrands } = await import("@/mocks/brands");
    return mockBrands.find((b) => b.slug === slug) ?? null;
  }
  return getJson(`/brands/${encodeURIComponent(slug)}`, BrandDetailSchema);
}

/** POST /claims — klaim voucher. Error bisnis dikembalikan sebagai nilai, bukan throw. */
export async function claimVoucher(input: ClaimRequestInput): Promise<ClaimResult> {
  if (USE_MOCK) return (await import("@/mocks/claim")).mockClaim(input);
  try {
    const res = await fetch(`${API_URL}/claims`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });
    const body: unknown = await res.json().catch(() => null);
    if (res.ok) {
      const data = ClaimResponseSchema.safeParse(body);
      if (data.success) return { ok: true, data: data.data };
    } else {
      const error = ClaimErrorSchema.safeParse(body);
      if (error.success) return { ok: false, error: error.data };
      if (res.status === 429) return { ok: false, error: { code: "RATE_LIMITED" } };
    }
  } catch {
    // jaringan gagal → UNKNOWN di bawah
  }
  return { ok: false, error: { code: "UNKNOWN" } };
}

/** GET /vouchers/:token — null jika token tidak ditemukan. */
export async function getVoucher(token: string): Promise<VoucherView | null> {
  if (USE_MOCK) return (await import("@/mocks/claim")).mockGetVoucher(token);
  return getJson(`/vouchers/${encodeURIComponent(token)}`, VoucherViewSchema);
}
