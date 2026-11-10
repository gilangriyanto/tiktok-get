import { z } from "zod";
import { SlugSchema } from "./slug";

/** ISO 8601 dengan offset, mis. 2027-01-04T23:59:59+07:00. */
export const IsoDateTimeSchema = z.iso.datetime({ offset: true });

export const RetailerSchema = z.enum(["indomaret", "alfamart"]);
export type Retailer = z.infer<typeof RetailerSchema>;

/** Retailer tempat voucher campaign bisa ditukar. */
export const RetailerModeSchema = z.enum(["indomaret", "alfamart", "both"]);
export type RetailerMode = z.infer<typeof RetailerModeSchema>;

export const HowtoStepSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
});
export type HowtoStep = z.infer<typeof HowtoStepSchema>;

export const FaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
});
export type Faq = z.infer<typeof FaqSchema>;

export const CampaignSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  startAt: IsoDateTimeSchema,
  endAt: IsoDateTimeSchema,
  retailerMode: RetailerModeSchema,
  howtoSteps: z.array(HowtoStepSchema),
  faqs: z.array(FaqSchema),
});
export type Campaign = z.infer<typeof CampaignSchema>;

export const BrandStatusSchema = z.enum(["active", "coming_soon", "inactive"]);
export type BrandStatus = z.infer<typeof BrandStatusSchema>;

export const VideoSchema = z.object({
  provider: z.enum(["youtube", "tiktok"]),
  /** ID video di provider (YouTube video id / TikTok video id). */
  videoId: z.string().min(1),
  title: z.string(),
  thumbnail: z.string().min(1).optional(),
});
export type Video = z.infer<typeof VideoSchema>;

export const BrandSchema = z.object({
  slug: SlugSchema,
  name: z.string().min(1),
  status: BrandStatusSchema,
  /** Label utama di kartu brand, mis. "Voucher 10RB". */
  cardLabel: z.string(),
  /** Label kecil di kartu brand, mis. "Kuota Terbatas". */
  cardSubLabel: z.string(),
  /** Gambar kartu brand di home. */
  cardImage: z.string().min(1).optional(),
  logo: z.string().min(1).optional(),
  heroDesktop: z.string().min(1).optional(),
  heroMobile: z.string().min(1).optional(),
  videos: z.array(VideoSchema).max(3),
});
export type Brand = z.infer<typeof BrandSchema>;

export const StockStatusSchema = z.enum(["available", "sold_out"]);
export type StockStatus = z.infer<typeof StockStatusSchema>;

export const ProductSchema = z.object({
  slug: SlugSchema,
  name: z.string().min(1),
  variant: z.string(),
  image: z.string().min(1).optional(),
  /** Harga dalam rupiah (integer). */
  priceNormal: z.number().int().nonnegative(),
  priceAfterVoucher: z.number().int().nonnegative(),
  stockStatus: StockStatusSchema,
});
export type Product = z.infer<typeof ProductSchema>;

/** Respons GET brand detail: brand + daftar produknya. */
export const BrandDetailSchema = BrandSchema.extend({
  products: z.array(ProductSchema),
});
export type BrandDetail = z.infer<typeof BrandDetailSchema>;
