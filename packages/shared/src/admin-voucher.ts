import { z } from "zod";
import { IsoDateTimeSchema, RetailerSchema } from "./campaign";
import { GenderSchema, SourceSchema } from "./claim";
import { ListQuerySchema } from "./list";

/* ───────────────────────── Voucher ───────────────────────── */

/** Status di database (PRD Bab 8 / Bab 15). */
export const VoucherStatusSchema = z.enum(["available", "redeemed", "used", "void"]);
export type VoucherStatus = z.infer<typeof VoucherStatusSchema>;

/** Label status sesuai istilah klien (redeem = klaim, used = dipakai di kasir). */
export const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  available: "Available",
  redeemed: "Redeem",
  used: "Redeem & Used",
  void: "Void",
};

export const AdminVoucherSchema = z.object({
  /** Voucher ID internal, mis. "VCH-000123". */
  id: z.string(),
  code: z.string(),
  brandSlug: z.string(),
  brandName: z.string(),
  productSlug: z.string(),
  productName: z.string(),
  retailer: RetailerSchema,
  status: VoucherStatusSchema,
  batch: z.string().nullable(),
  /** Penanda turunan: status redeemed & sudah lewat expiresAt. */
  needsReconciliation: z.boolean(),
  redeemedAt: IsoDateTimeSchema.nullable(),
  expiresAt: IsoDateTimeSchema.nullable(),
  /** Nomor HP pemegang klaim aktif; selalu termasking untuk role tanpa izin. */
  phone: z.string().nullable(),
  releaseCount: z.number().int().min(0),
  uploadedAt: IsoDateTimeSchema,
});
export type AdminVoucher = z.infer<typeof AdminVoucherSchema>;

export const VoucherListQuerySchema = ListQuerySchema.extend({
  brandSlug: z.string().optional(),
  productSlug: z.string().optional(),
  retailer: RetailerSchema.optional(),
  status: VoucherStatusSchema.optional(),
  /** "true" = hanya yang perlu rekonsiliasi. */
  needsReconciliation: z.enum(["true", "false"]).optional(),
});
export type VoucherListQuery = z.output<typeof VoucherListQuerySchema>;

export const VoucherEventCauseSchema = z.enum(["upload", "claim", "reconciliation", "admin"]);
export type VoucherEventCause = z.infer<typeof VoucherEventCauseSchema>;

export const VoucherEventSchema = z.object({
  id: z.string(),
  fromStatus: VoucherStatusSchema.nullable(),
  toStatus: VoucherStatusSchema,
  cause: VoucherEventCauseSchema,
  /** ID klaim / batch rekonsiliasi / upload terkait. */
  refId: z.string().nullable(),
  actor: z.string().nullable(),
  note: z.string().nullable(),
  at: IsoDateTimeSchema,
});
export type VoucherEvent = z.infer<typeof VoucherEventSchema>;

/* ───────────────────────── Klaim / peserta ───────────────────────── */

export const SmsStatusSchema = z.enum(["queued", "sent", "delivered", "failed"]);
export type SmsStatus = z.infer<typeof SmsStatusSchema>;

export const SMS_STATUS_LABELS: Record<SmsStatus, string> = {
  queued: "Antre",
  sent: "Terkirim",
  delivered: "Diterima",
  failed: "Gagal",
};

export const ClaimOutcomeSchema = z.enum(["active", "used", "released"]);
export type ClaimOutcome = z.infer<typeof ClaimOutcomeSchema>;

export const ClaimRecordSchema = z.object({
  id: z.string(),
  voucherId: z.string(),
  name: z.string(),
  /** Format lokal; termasking (0812****3456) untuk role tanpa izin participant:viewPhone. */
  phone: z.string(),
  gender: GenderSchema,
  age: z.number().int(),
  brandSlug: z.string(),
  brandName: z.string(),
  productSlug: z.string(),
  productName: z.string(),
  code: z.string(),
  retailer: RetailerSchema,
  source: SourceSchema,
  redeemedAt: IsoDateTimeSchema,
  expiresAt: IsoDateTimeSchema,
  outcome: ClaimOutcomeSchema,
  smsStatus: SmsStatusSchema,
});
export type ClaimRecord = z.infer<typeof ClaimRecordSchema>;

export const ClaimListQuerySchema = ListQuerySchema.extend({
  brandSlug: z.string().optional(),
  productSlug: z.string().optional(),
  retailer: RetailerSchema.optional(),
  source: SourceSchema.optional(),
  smsStatus: SmsStatusSchema.optional(),
  /** Rentang tanggal redeem (YYYY-MM-DD, WIB). */
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});
export type ClaimListQuery = z.output<typeof ClaimListQuerySchema>;

export const VoucherDetailSchema = AdminVoucherSchema.extend({
  events: z.array(VoucherEventSchema),
  claims: z.array(ClaimRecordSchema),
});
export type VoucherDetail = z.infer<typeof VoucherDetailSchema>;

export const VoidVoucherRequestSchema = z.object({
  reason: z.string().trim().min(5, "Alasan minimal 5 karakter").max(500),
});
export type VoidVoucherRequest = z.infer<typeof VoidVoucherRequestSchema>;

/* ───────────────────────── Upload kode voucher ───────────────────────── */

/** Satu baris file upload (kolom: kode_voucher wajib, batch opsional). */
export const VoucherUploadRowSchema = z.object({
  /** Nomor baris di file (baris 1 = header). */
  line: z.number().int().min(2),
  code: z.string().trim().min(1, "kode_voucher kosong").max(64, "kode_voucher > 64 karakter"),
  batch: z.string().trim().max(64).optional(),
});
export type VoucherUploadRow = z.infer<typeof VoucherUploadRowSchema>;

export const VoucherUploadRequestSchema = z.object({
  productSlug: z.string().min(1, "Pilih produk"),
  retailer: RetailerSchema,
  rows: z.array(VoucherUploadRowSchema).min(1, "File tidak berisi baris data").max(50_000),
});
export type VoucherUploadRequest = z.infer<typeof VoucherUploadRequestSchema>;

export const UploadRowStatusSchema = z.enum([
  "ok",
  "invalid",
  "duplicate_in_file",
  "duplicate_existing",
]);
export type UploadRowStatus = z.infer<typeof UploadRowStatusSchema>;

/** Respons preview (POST /admin/vouchers/upload/preview) dan commit (POST /admin/vouchers/upload). */
export const VoucherUploadResultSchema = z.object({
  total: z.number().int(),
  okCount: z.number().int(),
  failedCount: z.number().int(),
  /** Hanya pada commit: jumlah kode yang benar-benar disimpan. */
  inserted: z.number().int().optional(),
  rows: z.array(
    z.object({
      line: z.number().int(),
      code: z.string(),
      batch: z.string().nullable(),
      status: UploadRowStatusSchema,
      message: z.string().nullable(),
    }),
  ),
});
export type VoucherUploadResult = z.infer<typeof VoucherUploadResultSchema>;

/* ───────────────────────── Dashboard ───────────────────────── */

export const DashboardSummarySchema = z.object({
  stock: z.object({
    total: z.number().int(),
    available: z.number().int(),
    redeemed: z.number().int(),
    needsReconciliation: z.number().int(),
    used: z.number().int(),
  }),
  claimsToday: z.number().int(),
  uniqueParticipants: z.number().int(),
  sourceSplit: z.object({ tiktok: z.number().int(), reguler: z.number().int() }),
  smsFailed: z.number().int(),
  lowStockProducts: z.array(
    z.object({ productSlug: z.string(), productName: z.string(), available: z.number().int() }),
  ),
});
export type DashboardSummary = z.infer<typeof DashboardSummarySchema>;
