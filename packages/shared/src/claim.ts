import { z } from "zod";
import { RetailerSchema } from "./campaign";

/**
 * Normalisasi No. HP Indonesia ke format simpan "628…" (PRD BR-03).
 * Menerima awalan 08, 628, atau +628; spasi, titik, tanda hubung, dan kurung diabaikan.
 */
export function normalizePhone(raw: string): string {
  const compact = raw.replace(/[\s.\-()]/g, "");
  if (compact.startsWith("+62")) return compact.slice(1);
  if (compact.startsWith("0")) return `62${compact.slice(1)}`;
  return compact;
}

/**
 * Format simpan "628…" dengan 10–13 digit dalam format lokal "08…"
 * (= 11–14 digit dalam format 628…).
 */
const NORMALIZED_PHONE = /^628\d{8,11}$/;

/** "6281234567890" → "081234567890" (untuk tampilan). Nilai lain dikembalikan apa adanya. */
export function formatPhoneLocal(phone: string): string {
  const normalized = normalizePhone(phone);
  return normalized.startsWith("62") ? `0${normalized.slice(2)}` : normalized;
}

/** "6281234563456" → "0812****3456" (4 digit awal + 4 digit akhir format lokal). */
export function maskPhone(phone: string): string {
  const local = formatPhoneLocal(phone);
  if (local.length <= 8) return local.replace(/\d(?=\d{2})/g, "*");
  return `${local.slice(0, 4)}${"*".repeat(local.length - 8)}${local.slice(-4)}`;
}

export const FullNameSchema = z
  .string()
  .trim()
  .min(2, "Nama minimal 2 karakter")
  .max(100, "Nama maksimal 100 karakter");

/** Input bebas (08/628/+628), output sudah dinormalisasi ke "628…". */
export const PhoneSchema = z
  .string()
  .trim()
  .min(1, "No. HP wajib diisi")
  .transform(normalizePhone)
  .refine((v) => NORMALIZED_PHONE.test(v), "No. HP tidak valid (contoh: 081234567890)");

export const GenderSchema = z.enum(["male", "female"], { error: "Pilih jenis kelamin" });
export type Gender = z.infer<typeof GenderSchema>;
export const GENDER_LABELS: Record<Gender, string> = {
  male: "Laki-laki",
  female: "Perempuan",
};

export const AgeSchema = z
  .number({ error: "Umur wajib diisi" })
  .int("Umur harus bilangan bulat")
  .min(10, "Umur minimal 10 tahun")
  .max(99, "Umur maksimal 99 tahun");

/** Asal traffic, dari query `?src=`. Nilai selain "tiktok" dianggap "reguler". */
export const SourceSchema = z.enum(["tiktok", "reguler"]);
export type Source = z.infer<typeof SourceSchema>;

export const ClaimRequestSchema = z.object({
  productSlug: z.string().min(1),
  fullName: FullNameSchema,
  phone: PhoneSchema,
  gender: GenderSchema,
  age: AgeSchema,
  source: SourceSchema,
  turnstileToken: z.string().min(1),
});
/** Payload yang dikirim client (phone belum dinormalisasi). */
export type ClaimRequestInput = z.input<typeof ClaimRequestSchema>;
/** Payload setelah parse (phone sudah "628…"). */
export type ClaimRequest = z.output<typeof ClaimRequestSchema>;

/**
 * Skema form klaim di microsite: field yang diisi user saja.
 * `age` datang dari input teks sehingga dikonversi dari string.
 */
export const ClaimFormSchema = z.object({
  fullName: FullNameSchema,
  phone: PhoneSchema,
  gender: GenderSchema,
  age: z
    .string()
    .trim()
    .min(1, "Umur wajib diisi")
    .regex(/^\d+$/, "Umur harus berupa angka")
    .transform(Number)
    .pipe(AgeSchema),
});
export type ClaimFormInput = z.input<typeof ClaimFormSchema>;
export type ClaimFormValues = z.output<typeof ClaimFormSchema>;

export const ClaimResponseSchema = z.object({
  viewToken: z.string().min(1),
});
export type ClaimResponse = z.infer<typeof ClaimResponseSchema>;

export const ClaimErrorCodeSchema = z.enum([
  "QUOTA_EXCEEDED",
  "OUT_OF_STOCK",
  "RATE_LIMITED",
  "CAMPAIGN_INACTIVE",
  "VALIDATION",
]);
export type ClaimErrorCode = z.infer<typeof ClaimErrorCodeSchema>;

export const ClaimErrorSchema = z.object({
  code: ClaimErrorCodeSchema,
  message: z.string().optional(),
  /** Hanya untuk VALIDATION: pesan error per field. */
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});
export type ClaimError = z.infer<typeof ClaimErrorSchema>;

export const VoucherViewSchema = z.object({
  brand: z.object({
    slug: z.string(),
    name: z.string(),
    logo: z.string().optional(),
    heroMobile: z.string().optional(),
  }),
  product: z.object({
    slug: z.string(),
    name: z.string(),
    variant: z.string(),
  }),
  code: z.string().min(1),
  retailer: RetailerSchema,
  expiresAt: z.iso.datetime({ offset: true }),
});
export type VoucherView = z.infer<typeof VoucherViewSchema>;
