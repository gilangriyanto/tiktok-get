import { z } from "zod";
import { IsoDateTimeSchema } from "./campaign";
import { normalizePhone } from "./claim";
import { ListQuerySchema } from "./list";

/* ───────────────────────── Template SMS ───────────────────────── */

export const SmsTemplateTypeSchema = z.enum(["notification", "reminder"]);
export type SmsTemplateType = z.infer<typeof SmsTemplateTypeSchema>;

export const SMS_TEMPLATE_LABELS: Record<SmsTemplateType, string> = {
  notification: "Notifikasi voucher",
  reminder: "Reminder hari terakhir",
};

export const SMS_PLACEHOLDERS = [
  "nama",
  "brand",
  "produk",
  "kode_voucher",
  "retailer",
  "tgl_exp",
  "link_voucher",
] as const;
export type SmsPlaceholder = (typeof SMS_PLACEHOLDERS)[number];

const PLACEHOLDER_RE = /\{([a-z_]+)\}/g;

export const SmsTemplateInputSchema = z
  .object({
    body: z.string().trim().min(10, "Isi template minimal 10 karakter").max(612),
  })
  .refine(
    (t) =>
      [...t.body.matchAll(PLACEHOLDER_RE)].every((m) =>
        (SMS_PLACEHOLDERS as readonly string[]).includes(m[1]),
      ),
    { message: "Ada placeholder yang tidak dikenal", path: ["body"] },
  );
export type SmsTemplateInput = z.infer<typeof SmsTemplateInputSchema>;

export const SmsTemplateSchema = z.object({
  type: SmsTemplateTypeSchema,
  body: z.string(),
  updatedAt: IsoDateTimeSchema,
  updatedBy: z.string().nullable(),
});
export type SmsTemplate = z.infer<typeof SmsTemplateSchema>;

export function renderSmsTemplate(
  body: string,
  values: Partial<Record<SmsPlaceholder, string>>,
): string {
  return body.replace(PLACEHOLDER_RE, (match, key: string) =>
    key in values ? (values[key as SmsPlaceholder] ?? match) : match,
  );
}

// GSM 03.38 basic + extension (extension dihitung 2 karakter).
const GSM_BASIC =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
const GSM_EXT = "^{}\\[~]|€\f";

export type SmsSegmentInfo = {
  encoding: "GSM-7" | "UCS-2";
  /** Jumlah unit karakter (karakter ekstensi GSM dihitung 2). */
  length: number;
  segments: number;
  /** Batas per segmen untuk jumlah segmen saat ini (160/153 atau 70/67). */
  perSegment: number;
};

/** Hitung karakter & segmen SMS: GSM-7 160 (153 jika multi-part), UCS-2 70 (67). */
export function smsSegments(text: string): SmsSegmentInfo {
  let length = 0;
  let gsm = true;
  for (const ch of text) {
    if (GSM_BASIC.includes(ch)) length += 1;
    else if (GSM_EXT.includes(ch)) length += 2;
    else {
      gsm = false;
      break;
    }
  }
  if (!gsm) {
    length = [...text].length;
    const perSegment = length <= 70 ? 70 : 67;
    return { encoding: "UCS-2", length, segments: Math.max(1, Math.ceil(length / perSegment)), perSegment };
  }
  const perSegment = length <= 160 ? 160 : 153;
  return { encoding: "GSM-7", length, segments: Math.max(1, Math.ceil(length / perSegment)), perSegment };
}

/* ───────────────────────── Blocklist ───────────────────────── */

export const BlocklistTypeSchema = z.enum(["phone", "ip"]);
export type BlocklistType = z.infer<typeof BlocklistTypeSchema>;

const IpSchema = z.union([z.ipv4(), z.ipv6()]);

/** Nomor dinormalisasi ke 628… oleh server; IP disimpan sebagai hash oleh server. */
export const BlocklistInputSchema = z
  .object({
    type: BlocklistTypeSchema,
    value: z.string().trim().min(1, "Nilai wajib diisi"),
    reason: z.string().trim().min(3, "Alasan minimal 3 karakter").max(300),
    expiresAt: IsoDateTimeSchema.nullable(),
  })
  .refine(
    (b) =>
      b.type === "phone"
        ? /^628\d{8,11}$/.test(normalizePhone(b.value))
        : IpSchema.safeParse(b.value).success,
    { message: "Format nomor HP / IP tidak valid", path: ["value"] },
  );
export type BlocklistInput = z.infer<typeof BlocklistInputSchema>;

export const BlocklistEntrySchema = z.object({
  id: z.string(),
  type: BlocklistTypeSchema,
  /** Nomor: format lokal (termasking sesuai role). IP: ditampilkan sebagian. */
  value: z.string(),
  reason: z.string(),
  createdBy: z.string(),
  createdAt: IsoDateTimeSchema,
  expiresAt: IsoDateTimeSchema.nullable(),
});
export type BlocklistEntry = z.infer<typeof BlocklistEntrySchema>;

export const BlocklistQuerySchema = ListQuerySchema.extend({
  type: BlocklistTypeSchema.optional(),
});
export type BlocklistQuery = z.output<typeof BlocklistQuerySchema>;
