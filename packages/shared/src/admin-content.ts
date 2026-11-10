import { z } from "zod";
import {
  BrandSchema,
  CampaignSchema,
  HowtoStepSchema,
  IsoDateTimeSchema,
  ProductSchema,
  RetailerSchema,
  VideoSchema,
} from "./campaign";
import { SlugSchema } from "./slug";

/* ───────────────────────── Campaign ───────────────────────── */

export const ClaimLimitPeriodSchema = z.enum(["day", "campaign"]);
export type ClaimLimitPeriod = z.infer<typeof ClaimLimitPeriodSchema>;

export const ClaimLimitScopeSchema = z.enum(["campaign", "brand", "product"]);
export type ClaimLimitScope = z.infer<typeof ClaimLimitScopeSchema>;

/** "08:00" (WIB) */
const TimeOfDaySchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam HH:MM");

/**
 * Pengaturan campaign (CMS). Memperluas Campaign publik (tanpa FAQ, yang punya modul sendiri).
 * `title` & `description` = judul & deskripsi hero.
 */
export const CampaignSettingsSchema = CampaignSchema.omit({ faqs: true })
  .extend({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya huruf kecil, angka, dan tanda hubung"),
    title: z.string().trim().min(2, "Judul hero wajib diisi").max(120),
    description: z.string().trim().max(300),
    howtoSteps: z.array(HowtoStepSchema).min(1, "Minimal 1 langkah").max(8, "Maksimal 8 langkah"),
    /** Masa berlaku voucher (hari) sejak redeem — BR-04. */
    validityDays: z.number().int().min(1).max(30),
    /** Jam kirim reminder SMS (WIB) — BR-05. */
    reminderTime: TimeOfDaySchema,
    /** Batas klaim per nomor HP — BR-06. */
    claimLimit: z.number().int().min(1).max(3),
    claimLimitPeriod: ClaimLimitPeriodSchema,
    claimLimitScope: ClaimLimitScopeSchema,
    /** Anti-abuse — BR-15. */
    ipLimitPerHour: z.number().int().min(1).max(1000),
    deviceLimitPerDay: z.number().int().min(1).max(100),
    termsHtml: z.string().max(50_000),
    privacyHtml: z.string().max(50_000),
    heroDesktop: z.string().min(1).optional(),
    heroMobile: z.string().min(1).optional(),
    isActive: z.boolean(),
  })
  .refine((c) => Date.parse(c.endAt) > Date.parse(c.startAt), {
    message: "Tanggal selesai harus setelah tanggal mulai",
    path: ["endAt"],
  });
export type CampaignSettings = z.infer<typeof CampaignSettingsSchema>;

/* ───────────────────────── Video ───────────────────────── */

/** Ambil provider & ID dari URL YouTube / TikTok. null jika tidak dikenali. */
export function parseVideoUrl(
  url: string,
): { provider: "youtube" | "tiktok"; videoId: string } | null {
  let u: URL;
  try {
    u = new URL(url.trim());
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^(www\.|m\.)/, "");
  if (host === "youtu.be") {
    const id = u.pathname.slice(1).split("/")[0];
    return id ? { provider: "youtube", videoId: id } : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const v = u.searchParams.get("v");
    if (v) return { provider: "youtube", videoId: v };
    const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]+)/);
    return m ? { provider: "youtube", videoId: m[1] } : null;
  }
  if (host === "tiktok.com") {
    const m = u.pathname.match(/\/video\/(\d+)/);
    return m ? { provider: "tiktok", videoId: m[1] } : null;
  }
  return null;
}

/** Input video di form brand: admin cukup menempel URL. */
export const BrandVideoInputSchema = z
  .object({
    provider: VideoSchema.shape.provider,
    url: z.url("URL tidak valid"),
    title: z.string().trim().max(120),
    sortOrder: z.number().int().min(0),
  })
  .refine((v) => parseVideoUrl(v.url)?.provider === v.provider, {
    message: "URL tidak cocok dengan tipe video",
    path: ["url"],
  });
export type BrandVideoInput = z.infer<typeof BrandVideoInputSchema>;

export const AdminBrandVideoSchema = VideoSchema.extend({
  url: z.url(),
  sortOrder: z.number().int().min(0),
});
export type AdminBrandVideo = z.infer<typeof AdminBrandVideoSchema>;

/* ───────────────────────── Brand ───────────────────────── */

const HexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna hex, mis. #FE2C55");

/**
 * Request create/update brand. Memperluas Brand publik.
 * Keunikan slug dicek di server (409 CONFLICT, fieldErrors.slug).
 */
export const BrandInputSchema = BrandSchema.omit({ videos: true }).extend({
  slug: SlugSchema,
  name: z.string().trim().min(1, "Nama wajib diisi").max(60),
  cardLabel: z.string().trim().max(30),
  cardSubLabel: z.string().trim().max(40),
  description: z.string().trim().max(500),
  accentColor: HexColorSchema,
  sortOrder: z.number().int().min(0),
  seoTitle: z.string().trim().max(70),
  seoDesc: z.string().trim().max(160),
  videos: z.array(BrandVideoInputSchema).max(3, "Maksimal 3 video"),
});
export type BrandInput = z.infer<typeof BrandInputSchema>;

export const AdminBrandSchema = BrandInputSchema.extend({
  id: z.string(),
  videos: z.array(AdminBrandVideoSchema).max(3),
  productCount: z.number().int().min(0),
  updatedAt: IsoDateTimeSchema,
});
export type AdminBrand = z.infer<typeof AdminBrandSchema>;

/* ───────────────────────── Produk ───────────────────────── */

export const StockSummarySchema = z.object({
  total: z.number().int().min(0),
  available: z.number().int().min(0),
  redeemed: z.number().int().min(0),
  /** Redeemed yang sudah lewat expiresAt (penanda turunan). */
  needsReconciliation: z.number().int().min(0),
  used: z.number().int().min(0),
  void: z.number().int().min(0),
});
export type StockSummary = z.infer<typeof StockSummarySchema>;

/**
 * Request create/update produk. Memperluas Product publik (stockStatus dihitung server).
 * Slug unik per brand.
 */
export const ProductInputSchema = ProductSchema.omit({ stockStatus: true })
  .extend({
    brandSlug: z.string().min(1, "Pilih brand"),
    name: z.string().trim().min(1, "Nama wajib diisi").max(60),
    variant: z.string().trim().max(60),
    priceNormal: z.number().int().min(0, "Harga tidak boleh negatif"),
    priceAfterVoucher: z.number().int().min(0, "Harga tidak boleh negatif"),
    voucherTerms: z.string().trim().max(2000),
    retailers: z.array(RetailerSchema).min(1, "Pilih minimal 1 retailer"),
    sortOrder: z.number().int().min(0),
    isActive: z.boolean(),
  })
  .refine((p) => p.priceAfterVoucher <= p.priceNormal, {
    message: "Harga setelah voucher tidak boleh lebih besar dari harga normal",
    path: ["priceAfterVoucher"],
  });
export type ProductInput = z.infer<typeof ProductInputSchema>;

export const AdminProductSchema = ProductSchema.extend({
  id: z.string(),
  brandSlug: z.string(),
  brandName: z.string(),
  voucherTerms: z.string(),
  retailers: z.array(RetailerSchema),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  stock: StockSummarySchema,
  updatedAt: IsoDateTimeSchema,
});
export type AdminProduct = z.infer<typeof AdminProductSchema>;

/** Link landing TikTok per produk (FR-CMS-06). */
export function buildTikTokLink(
  siteUrl: string,
  brandSlug: string,
  productSlug: string,
  utmCampaign?: string,
): string {
  const url = new URL(`/${brandSlug}/${productSlug}`, siteUrl);
  url.searchParams.set("src", "tiktok");
  if (utmCampaign?.trim()) url.searchParams.set("utm_campaign", utmCampaign.trim());
  return url.toString();
}

/* ───────────────────────── FAQ ───────────────────────── */

export const FaqCategorySchema = z.enum(["umum", "indomaret", "alfamart"]);
export type FaqCategory = z.infer<typeof FaqCategorySchema>;

export const FaqInputSchema = z.object({
  category: FaqCategorySchema,
  question: z.string().trim().min(5, "Pertanyaan minimal 5 karakter").max(200),
  answer: z.string().trim().min(5, "Jawaban minimal 5 karakter").max(2000),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});
export type FaqInput = z.infer<typeof FaqInputSchema>;

export const AdminFaqSchema = FaqInputSchema.extend({ id: z.string() });
export type AdminFaq = z.infer<typeof AdminFaqSchema>;
