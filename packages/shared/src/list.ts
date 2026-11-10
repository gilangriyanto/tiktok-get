import { z } from "zod";

export const SortOrderSchema = z.enum(["asc", "desc"]);
export type SortOrder = z.infer<typeof SortOrderSchema>;

/**
 * Query standar untuk semua tabel CMS (pagination server-side).
 * Dikirim sebagai query string: ?page=1&pageSize=20&q=...&sort=createdAt&order=desc
 */
export const ListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).optional(),
  sort: z.string().max(50).optional(),
  order: SortOrderSchema.default("asc"),
});
export type ListQuery = z.output<typeof ListQuerySchema>;

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

/** Skema respons daftar ber-pagination untuk item tertentu. */
export function paginatedSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  });
}

/** Error standar API admin. */
export const AdminErrorCodeSchema = z.enum([
  "VALIDATION",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "RATE_LIMITED",
]);
export type AdminErrorCode = z.infer<typeof AdminErrorCodeSchema>;

export const AdminErrorSchema = z.object({
  code: AdminErrorCodeSchema,
  message: z.string().optional(),
  /** Pesan error per field (key = nama field di skema request). */
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});
export type AdminError = z.infer<typeof AdminErrorSchema>;
