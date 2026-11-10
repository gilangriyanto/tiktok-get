import "server-only";
import {
  AdminBrandSchema,
  AdminErrorSchema,
  AdminFaqSchema,
  AdminOptionsSchema,
  AdminProductSchema,
  AdminUserSchema,
  AdminVoucherSchema,
  BlocklistEntrySchema,
  CampaignSettingsSchema,
  ClaimRecordSchema,
  DashboardSummarySchema,
  LoginResponseSchema,
  MediaUploadResponseSchema,
  SmsTemplateSchema,
  VoucherDetailSchema,
  VoucherUploadResultSchema,
  paginatedSchema,
  type AdminBrand,
  type AdminFaq,
  type AdminOptions,
  type AdminProduct,
  type AdminUser,
  type AdminVoucher,
  type BlocklistEntry,
  type BlocklistInput,
  type BlocklistQuery,
  type BrandInput,
  type BrandListQuery,
  type CampaignSettings,
  type ClaimListQuery,
  type ClaimRecord,
  type DashboardSummary,
  type FaqInput,
  type FaqListQuery,
  type LoginRequest,
  type LoginResponse,
  type Paginated,
  type ProductInput,
  type ProductListQuery,
  type SmsTemplate,
  type SmsTemplateInput,
  type SmsTemplateType,
  type VoidVoucherRequest,
  type VoucherDetail,
  type VoucherListQuery,
  type VoucherUploadRequest,
  type VoucherUploadResult,
} from "@tiktok-get/shared";
import { z } from "zod";
import { ApiError, apiError } from "./api-error";
import * as mock from "./mock/server";

/**
 * Lapisan API CMS — satu fungsi per endpoint (lihat docs/api-contract.md).
 * Server-only: token sesi tidak pernah sampai ke browser.
 * Mock dipakai jika NEXT_PUBLIC_USE_MOCK=true atau NEXT_PUBLIC_API_URL kosong.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true" || API_URL === "";

type Query = Record<string, string | number | undefined>;

function qs(query: Query): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function request<S extends z.ZodType>(
  token: string | null,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  schema: S,
  body?: unknown,
): Promise<z.output<S>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/admin${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw apiError("RATE_LIMITED", "API tidak dapat dihubungi");
  }
  const json: unknown = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = AdminErrorSchema.safeParse(json);
    throw new ApiError(res.status, err.success ? err.data : { code: res.status === 401 ? "UNAUTHORIZED" : "VALIDATION", message: `HTTP ${res.status}` });
  }
  return schema.parse(json);
}

const NoContent = z.null();

/** Mock: jalankan fungsi server mock dengan user dari token (meniru middleware auth API). */
function asUser<T>(token: string, fn: (user: AdminUser) => T): T {
  return fn(mock.me(token));
}

/* ───────────── auth ───────────── */

/** POST /admin/auth/login */
export async function login(req: LoginRequest): Promise<LoginResponse> {
  if (USE_MOCK) return mock.login(req);
  return request(null, "POST", "/auth/login", LoginResponseSchema, req);
}

/** GET /admin/auth/me */
export async function getMe(token: string): Promise<AdminUser> {
  if (USE_MOCK) return mock.me(token);
  return request(token, "GET", "/auth/me", AdminUserSchema);
}

/** POST /admin/auth/logout */
export async function logout(token: string): Promise<void> {
  if (USE_MOCK) return;
  await request(token, "POST", "/auth/logout", NoContent);
}

/** GET /admin/admins (super_admin) */
export async function listAdmins(token: string): Promise<AdminUser[]> {
  if (USE_MOCK) return asUser(token, mock.listAdmins);
  return request(token, "GET", "/admins", z.array(AdminUserSchema));
}

/* ───────────── dashboard & opsi ───────────── */

/** GET /admin/dashboard */
export async function getDashboard(token: string): Promise<DashboardSummary> {
  if (USE_MOCK) return asUser(token, () => mock.getDashboard());
  return request(token, "GET", "/dashboard", DashboardSummarySchema);
}

/** GET /admin/options */
export async function getOptions(token: string): Promise<AdminOptions> {
  if (USE_MOCK) return asUser(token, () => mock.getOptions());
  return request(token, "GET", "/options", AdminOptionsSchema);
}

/* ───────────── campaign ───────────── */

/** GET /admin/campaign */
export async function getCampaignSettings(token: string): Promise<CampaignSettings> {
  if (USE_MOCK) return asUser(token, () => mock.getCampaignSettings());
  return request(token, "GET", "/campaign", CampaignSettingsSchema);
}

/** PUT /admin/campaign */
export async function updateCampaignSettings(token: string, input: CampaignSettings): Promise<CampaignSettings> {
  if (USE_MOCK) return asUser(token, (u) => mock.updateCampaignSettings(u, input));
  return request(token, "PUT", "/campaign", CampaignSettingsSchema, input);
}

/* ───────────── brand ───────────── */

/** GET /admin/brands */
export async function listBrands(token: string, q: BrandListQuery): Promise<Paginated<AdminBrand>> {
  if (USE_MOCK) return asUser(token, () => mock.listBrands(q));
  return request(token, "GET", `/brands${qs(q)}`, paginatedSchema(AdminBrandSchema));
}

/** GET /admin/brands/:id */
export async function getBrand(token: string, id: string): Promise<AdminBrand> {
  if (USE_MOCK) return asUser(token, () => mock.getBrand(id));
  return request(token, "GET", `/brands/${encodeURIComponent(id)}`, AdminBrandSchema);
}

/** POST /admin/brands */
export async function createBrand(token: string, input: BrandInput): Promise<AdminBrand> {
  if (USE_MOCK) return asUser(token, (u) => mock.createBrand(u, input));
  return request(token, "POST", "/brands", AdminBrandSchema, input);
}

/** PUT /admin/brands/:id */
export async function updateBrand(token: string, id: string, input: BrandInput): Promise<AdminBrand> {
  if (USE_MOCK) return asUser(token, (u) => mock.updateBrand(u, id, input));
  return request(token, "PUT", `/brands/${encodeURIComponent(id)}`, AdminBrandSchema, input);
}

/** DELETE /admin/brands/:id */
export async function deleteBrand(token: string, id: string): Promise<void> {
  if (USE_MOCK) return asUser(token, (u) => mock.deleteBrand(u, id));
  await request(token, "DELETE", `/brands/${encodeURIComponent(id)}`, NoContent);
}

/* ───────────── produk ───────────── */

/** GET /admin/products */
export async function listProducts(token: string, q: ProductListQuery): Promise<Paginated<AdminProduct>> {
  if (USE_MOCK) return asUser(token, () => mock.listProducts(q));
  return request(token, "GET", `/products${qs(q)}`, paginatedSchema(AdminProductSchema));
}

/** GET /admin/products/:id */
export async function getProduct(token: string, id: string): Promise<AdminProduct> {
  if (USE_MOCK) return asUser(token, () => mock.getProduct(id));
  return request(token, "GET", `/products/${encodeURIComponent(id)}`, AdminProductSchema);
}

/** POST /admin/products */
export async function createProduct(token: string, input: ProductInput): Promise<AdminProduct> {
  if (USE_MOCK) return asUser(token, (u) => mock.createProduct(u, input));
  return request(token, "POST", "/products", AdminProductSchema, input);
}

/** PUT /admin/products/:id */
export async function updateProduct(token: string, id: string, input: ProductInput): Promise<AdminProduct> {
  if (USE_MOCK) return asUser(token, (u) => mock.updateProduct(u, id, input));
  return request(token, "PUT", `/products/${encodeURIComponent(id)}`, AdminProductSchema, input);
}

/* ───────────── voucher ───────────── */

/** GET /admin/vouchers */
export async function listVouchers(token: string, q: VoucherListQuery): Promise<Paginated<AdminVoucher>> {
  if (USE_MOCK) return asUser(token, (u) => mock.listVouchers(u, q));
  return request(token, "GET", `/vouchers${qs(q)}`, paginatedSchema(AdminVoucherSchema));
}

/** GET /admin/vouchers/:id */
export async function getVoucher(token: string, id: string): Promise<VoucherDetail> {
  if (USE_MOCK) return asUser(token, (u) => mock.getVoucher(u, id));
  return request(token, "GET", `/vouchers/${encodeURIComponent(id)}`, VoucherDetailSchema);
}

/** POST /admin/vouchers/:id/void (super_admin) */
export async function voidVoucher(token: string, id: string, input: VoidVoucherRequest): Promise<VoucherDetail> {
  if (USE_MOCK) return asUser(token, (u) => mock.voidVoucher(u, id, input));
  return request(token, "POST", `/vouchers/${encodeURIComponent(id)}/void`, VoucherDetailSchema, input);
}

/** POST /admin/vouchers/upload/preview */
export async function previewVoucherUpload(token: string, input: VoucherUploadRequest): Promise<VoucherUploadResult> {
  if (USE_MOCK) return asUser(token, (u) => mock.previewVoucherUpload(u, input));
  return request(token, "POST", "/vouchers/upload/preview", VoucherUploadResultSchema, input);
}

/** POST /admin/vouchers/upload */
export async function commitVoucherUpload(token: string, input: VoucherUploadRequest): Promise<VoucherUploadResult> {
  if (USE_MOCK) return asUser(token, (u) => mock.commitVoucherUpload(u, input));
  return request(token, "POST", "/vouchers/upload", VoucherUploadResultSchema, input);
}

/* ───────────── peserta & klaim ───────────── */

/** GET /admin/claims */
export async function listClaims(token: string, q: ClaimListQuery): Promise<Paginated<ClaimRecord>> {
  if (USE_MOCK) return asUser(token, (u) => mock.listClaims(u, q));
  return request(token, "GET", `/claims${qs(q)}`, paginatedSchema(ClaimRecordSchema));
}

/** GET /admin/claims/export (text/csv; admin & super_admin) */
export async function exportClaims(token: string, q: ClaimListQuery): Promise<string> {
  if (USE_MOCK) return asUser(token, (u) => mock.exportClaims(u, q));
  const { page: _p, pageSize: _s, ...filters } = q;
  void _p;
  void _s;
  const res = await fetch(`${API_URL}/admin/claims/export${qs(filters)}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "text/csv" },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = AdminErrorSchema.safeParse(await res.json().catch(() => null));
    throw new ApiError(res.status, err.success ? err.data : { code: "FORBIDDEN" });
  }
  return res.text();
}

/* ───────────── FAQ ───────────── */

/** GET /admin/faqs */
export async function listFaqs(token: string, q: FaqListQuery): Promise<Paginated<AdminFaq>> {
  if (USE_MOCK) return asUser(token, () => mock.listFaqs(q));
  return request(token, "GET", `/faqs${qs(q)}`, paginatedSchema(AdminFaqSchema));
}

/** POST /admin/faqs */
export async function createFaq(token: string, input: FaqInput): Promise<AdminFaq> {
  if (USE_MOCK) return asUser(token, (u) => mock.createFaq(u, input));
  return request(token, "POST", "/faqs", AdminFaqSchema, input);
}

/** PUT /admin/faqs/:id */
export async function updateFaq(token: string, id: string, input: FaqInput): Promise<AdminFaq> {
  if (USE_MOCK) return asUser(token, (u) => mock.updateFaq(u, id, input));
  return request(token, "PUT", `/faqs/${encodeURIComponent(id)}`, AdminFaqSchema, input);
}

/** DELETE /admin/faqs/:id */
export async function deleteFaq(token: string, id: string): Promise<void> {
  if (USE_MOCK) return asUser(token, (u) => mock.deleteFaq(u, id));
  await request(token, "DELETE", `/faqs/${encodeURIComponent(id)}`, NoContent);
}

/* ───────────── template SMS ───────────── */

/** GET /admin/sms-templates */
export async function listSmsTemplates(token: string): Promise<SmsTemplate[]> {
  if (USE_MOCK) return asUser(token, () => mock.listSmsTemplates());
  return request(token, "GET", "/sms-templates", z.array(SmsTemplateSchema));
}

/** PUT /admin/sms-templates/:type */
export async function updateSmsTemplate(token: string, type: SmsTemplateType, input: SmsTemplateInput): Promise<SmsTemplate> {
  if (USE_MOCK) return asUser(token, (u) => mock.updateSmsTemplate(u, type, input));
  return request(token, "PUT", `/sms-templates/${type}`, SmsTemplateSchema, input);
}

/* ───────────── blokir ───────────── */

/** GET /admin/blocklist */
export async function listBlocklist(token: string, q: BlocklistQuery): Promise<Paginated<BlocklistEntry>> {
  if (USE_MOCK) return asUser(token, (u) => mock.listBlocklist(u, q));
  return request(token, "GET", `/blocklist${qs(q)}`, paginatedSchema(BlocklistEntrySchema));
}

/** POST /admin/blocklist */
export async function createBlock(token: string, input: BlocklistInput): Promise<BlocklistEntry> {
  if (USE_MOCK) return asUser(token, (u) => mock.createBlock(u, input));
  return request(token, "POST", "/blocklist", BlocklistEntrySchema, input);
}

/** DELETE /admin/blocklist/:id */
export async function deleteBlock(token: string, id: string): Promise<void> {
  if (USE_MOCK) return asUser(token, (u) => mock.deleteBlock(u, id));
  await request(token, "DELETE", `/blocklist/${encodeURIComponent(id)}`, NoContent);
}

/* ───────────── media ───────────── */

/** POST /admin/media (multipart/form-data, field "file") */
export async function uploadMedia(token: string, file: File): Promise<{ url: string }> {
  if (USE_MOCK) return mock.uploadMedia(mock.me(token), file);
  const form = new FormData();
  form.set("file", file);
  const res = await fetch(`${API_URL}/admin/media`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = AdminErrorSchema.safeParse(json);
    throw new ApiError(res.status, err.success ? err.data : { code: "VALIDATION" });
  }
  return MediaUploadResponseSchema.parse(json);
}
