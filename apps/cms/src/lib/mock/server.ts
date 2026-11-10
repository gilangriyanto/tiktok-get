import "server-only";
import {
  BlocklistInputSchema,
  BrandInputSchema,
  CampaignSettingsSchema,
  FaqInputSchema,
  GENDER_LABELS,
  ProductInputSchema,
  SMS_STATUS_LABELS,
  SmsTemplateInputSchema,
  VoidVoucherRequestSchema,
  VoucherUploadRequestSchema,
  can,
  formatPhoneLocal,
  maskPhone,
  normalizePhone,
  parseVideoUrl,
  type AdminBrand,
  type AdminFaq,
  type AdminOptions,
  type AdminProduct,
  type AdminUser,
  type AdminVoucher,
  type BlocklistEntry,
  type BlocklistQuery,
  type BrandListQuery,
  type CampaignSettings,
  type ClaimListQuery,
  type ClaimRecord,
  type DashboardSummary,
  type FaqListQuery,
  type ListQuery,
  type LoginRequest,
  type LoginResponse,
  type Paginated,
  type Permission,
  type ProductListQuery,
  type SmsTemplate,
  type SmsTemplateType,
  type StockSummary,
  type VoucherDetail,
  type VoucherListQuery,
  type VoucherUploadResult,
} from "@tiktok-get/shared";
import type { z } from "zod";
import { apiError, validationError } from "../api-error";
import { createSeed, toWibIso, type MockBlock, type MockClaim, type MockDb, type MockVoucher } from "./seed";

/*
 * "Server" mock yang meniru perilaku apps/api: autentikasi token, izin per role,
 * masking nomor HP, validasi skema shared, konflik slug, dsb.
 * Data disimpan di memori (globalThis agar bertahan saat HMR) dan hilang saat server restart.
 */

const globalStore = globalThis as typeof globalThis & { __cmsMockDb?: MockDb };
function db(): MockDb {
  return (globalStore.__cmsMockDb ??= createSeed());
}

const TOKEN_PREFIX = "mock-token:";

function nextId(prefix: string): string {
  const d = db();
  d.seq += 1;
  return `${prefix}-${String(d.seq).padStart(6, "0")}`;
}

function nowIso(): string {
  return toWibIso(Date.now());
}

function parse<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const r = schema.safeParse(input);
  if (!r.success) throw validationError(r.error);
  return r.data;
}

/* ───────────── auth ───────────── */

export function login(req: LoginRequest): LoginResponse {
  const u = db().users.find((x) => x.email === req.email.toLowerCase() && x.password === req.password);
  if (!u) throw apiError("UNAUTHORIZED", "Email atau password salah");
  const { password: _pw, ...user } = u;
  void _pw;
  return { token: `${TOKEN_PREFIX}${u.id}`, user };
}

export function me(token: string): AdminUser {
  const id = token.startsWith(TOKEN_PREFIX) ? token.slice(TOKEN_PREFIX.length) : "";
  const u = db().users.find((x) => x.id === id);
  if (!u) throw apiError("UNAUTHORIZED", "Sesi tidak valid");
  const { password: _pw, ...user } = u;
  void _pw;
  return user;
}

function requirePermission(user: AdminUser, permission: Permission) {
  if (!can(user.role, permission)) throw apiError("FORBIDDEN", "Anda tidak punya akses untuk aksi ini");
}

function displayPhone(user: AdminUser, phone: string): string {
  return can(user.role, "participant:viewPhone") ? formatPhoneLocal(phone) : maskPhone(phone);
}

/* ───────────── list helper (search, sort, paginate) ───────────── */

type Sorters<T> = Record<string, (t: T) => string | number | null>;

function paginate<T>(items: T[], q: ListQuery, search: (t: T) => string, sorters: Sorters<T>, defaultSort?: string): Paginated<T> {
  const needle = q.q?.toLowerCase();
  let rows = needle ? items.filter((t) => search(t).toLowerCase().includes(needle)) : [...items];
  const key = q.sort && sorters[q.sort] ? q.sort : defaultSort;
  if (key) {
    const get = sorters[key];
    const dir = q.order === "desc" ? -1 : 1;
    rows = rows.sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va === vb) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      return (va < vb ? -1 : 1) * dir;
    });
  }
  const start = (q.page - 1) * q.pageSize;
  return { items: rows.slice(start, start + q.pageSize), page: q.page, pageSize: q.pageSize, total: rows.length };
}

/* ───────────── derived ───────────── */

function isExpired(c: MockClaim | undefined): boolean {
  return Boolean(c && Date.parse(c.expiresAt) < Date.now());
}

function claimOf(v: MockVoucher): MockClaim | undefined {
  return v.currentClaimId ? db().claims.find((c) => c.id === v.currentClaimId) : undefined;
}

function stockOf(productId: string): StockSummary {
  const s: StockSummary = { total: 0, available: 0, redeemed: 0, needsReconciliation: 0, used: 0, void: 0 };
  for (const v of db().vouchers) {
    if (v.productId !== productId) continue;
    s[v.status] += 1;
    if (v.status !== "void") s.total += 1;
    if (v.status === "redeemed" && isExpired(claimOf(v))) s.needsReconciliation += 1;
  }
  return s;
}

function brandById(id: string) {
  const b = db().brands.find((x) => x.id === id);
  if (!b) throw apiError("NOT_FOUND", "Brand tidak ditemukan");
  return b;
}

function productById(id: string) {
  const p = db().products.find((x) => x.id === id);
  if (!p) throw apiError("NOT_FOUND", "Produk tidak ditemukan");
  return p;
}

function toAdminBrand(b: MockDb["brands"][number]): AdminBrand {
  return { ...b, productCount: db().products.filter((p) => p.brandId === b.id).length };
}

function toAdminProduct(p: MockDb["products"][number]): AdminProduct {
  const brand = brandById(p.brandId);
  const stock = stockOf(p.id);
  const { brandId: _b, ...rest } = p;
  void _b;
  return { ...rest, brandSlug: brand.slug, brandName: brand.name, stock, stockStatus: stock.available > 0 ? "available" : "sold_out" };
}

function toAdminVoucher(user: AdminUser, v: MockVoucher): AdminVoucher {
  const p = productById(v.productId);
  const b = brandById(p.brandId);
  const c = claimOf(v);
  return {
    id: v.id,
    code: v.code,
    brandSlug: b.slug,
    brandName: b.name,
    productSlug: p.slug,
    productName: `${p.name} ${p.variant}`,
    retailer: v.retailer,
    status: v.status,
    batch: v.batch,
    needsReconciliation: v.status === "redeemed" && isExpired(c),
    redeemedAt: c?.redeemedAt ?? null,
    expiresAt: c?.expiresAt ?? null,
    phone: c ? displayPhone(user, c.phone) : null,
    releaseCount: v.releaseCount,
    uploadedAt: v.uploadedAt,
  };
}

function toClaimRecord(user: AdminUser, c: MockClaim): ClaimRecord {
  const p = productById(c.productId);
  const b = brandById(p.brandId);
  const v = db().vouchers.find((x) => x.id === c.voucherId);
  return {
    id: c.id,
    voucherId: c.voucherId,
    name: c.name,
    phone: displayPhone(user, c.phone),
    gender: c.gender,
    age: c.age,
    brandSlug: b.slug,
    brandName: b.name,
    productSlug: p.slug,
    productName: `${p.name} ${p.variant}`,
    code: v?.code ?? "-",
    retailer: c.retailer,
    source: c.source,
    redeemedAt: c.redeemedAt,
    expiresAt: c.expiresAt,
    outcome: c.outcome,
    smsStatus: c.smsStatus,
  };
}

/* ───────────── dashboard & options ───────────── */

export function getDashboard(): DashboardSummary {
  const d = db();
  const stock = { total: 0, available: 0, redeemed: 0, needsReconciliation: 0, used: 0 };
  for (const p of d.products) {
    const s = stockOf(p.id);
    stock.total += s.total;
    stock.available += s.available;
    stock.redeemed += s.redeemed;
    stock.needsReconciliation += s.needsReconciliation;
    stock.used += s.used;
  }
  const todayWib = toWibIso(Date.now()).slice(0, 10);
  return {
    stock,
    claimsToday: d.claims.filter((c) => c.redeemedAt.startsWith(todayWib)).length,
    uniqueParticipants: new Set(d.claims.map((c) => c.phone)).size,
    sourceSplit: {
      tiktok: d.claims.filter((c) => c.source === "tiktok").length,
      reguler: d.claims.filter((c) => c.source === "reguler").length,
    },
    smsFailed: d.claims.filter((c) => c.smsStatus === "failed").length,
    lowStockProducts: d.products
      .map((p) => ({ productSlug: p.slug, productName: `${p.name} ${p.variant}`, available: stockOf(p.id).available }))
      .filter((p) => p.available < 50),
  };
}

export function getOptions(): AdminOptions {
  const d = db();
  return {
    brands: [...d.brands].sort((a, b) => a.sortOrder - b.sortOrder).map((b) => ({ slug: b.slug, name: b.name, status: b.status })),
    products: d.products.map((p) => ({ slug: p.slug, name: p.name, variant: p.variant, brandSlug: brandById(p.brandId).slug, retailers: p.retailers })),
  };
}

export function listAdmins(user: AdminUser): AdminUser[] {
  requirePermission(user, "admin:manage");
  return db().users.map(({ password: _pw, ...u }) => {
    void _pw;
    return u;
  });
}

/* ───────────── campaign ───────────── */

export function getCampaignSettings(): CampaignSettings {
  return db().campaign;
}

export function updateCampaignSettings(user: AdminUser, input: unknown): CampaignSettings {
  requirePermission(user, "content:write");
  db().campaign = parse(CampaignSettingsSchema, input);
  return db().campaign;
}

/* ───────────── brand ───────────── */

export function listBrands(q: BrandListQuery): Paginated<AdminBrand> {
  const rows = db().brands.filter((b) => !q.status || b.status === q.status).map(toAdminBrand);
  return paginate(rows, q, (b) => `${b.name} ${b.slug}`, {
    name: (b) => b.name.toLowerCase(),
    sortOrder: (b) => b.sortOrder,
    status: (b) => b.status,
    productCount: (b) => b.productCount,
    updatedAt: (b) => b.updatedAt,
  }, "sortOrder");
}

export function getBrand(id: string): AdminBrand {
  return toAdminBrand(brandById(id));
}

function saveBrand(user: AdminUser, input: unknown, id?: string): AdminBrand {
  requirePermission(user, "content:write");
  const data = parse(BrandInputSchema, input);
  const d = db();
  if (d.brands.some((b) => b.slug === data.slug && b.id !== id)) {
    throw apiError("CONFLICT", "Slug sudah dipakai brand lain", { slug: ["Slug sudah dipakai brand lain"] });
  }
  const videos = data.videos.map((v) => ({ ...v, videoId: parseVideoUrl(v.url)?.videoId ?? "" }));
  const record = { ...data, videos, updatedAt: nowIso() };
  if (id) {
    const i = d.brands.findIndex((b) => b.id === id);
    if (i < 0) throw apiError("NOT_FOUND", "Brand tidak ditemukan");
    d.brands[i] = { ...record, id };
    return toAdminBrand(d.brands[i]);
  }
  const created = { ...record, id: nextId("b") };
  d.brands.push(created);
  return toAdminBrand(created);
}

export const createBrand = (user: AdminUser, input: unknown) => saveBrand(user, input);
export const updateBrand = (user: AdminUser, id: string, input: unknown) => saveBrand(user, input, id);

export function deleteBrand(user: AdminUser, id: string): void {
  requirePermission(user, "content:write");
  const d = db();
  brandById(id);
  if (d.products.some((p) => p.brandId === id)) {
    throw apiError("CONFLICT", "Brand masih punya produk. Nonaktifkan brand, atau pindahkan/hapus produknya dulu.");
  }
  d.brands = d.brands.filter((b) => b.id !== id);
}

/* ───────────── produk ───────────── */

export function listProducts(q: ProductListQuery): Paginated<AdminProduct> {
  const rows = db()
    .products.map(toAdminProduct)
    .filter((p) => (!q.brandSlug || p.brandSlug === q.brandSlug) && (!q.isActive || String(p.isActive) === q.isActive));
  return paginate(rows, q, (p) => `${p.name} ${p.variant} ${p.slug} ${p.brandName}`, {
    name: (p) => `${p.name} ${p.variant}`.toLowerCase(),
    brandName: (p) => p.brandName.toLowerCase(),
    priceAfterVoucher: (p) => p.priceAfterVoucher,
    available: (p) => p.stock.available,
    sortOrder: (p) => p.sortOrder,
  }, "sortOrder");
}

export function getProduct(id: string): AdminProduct {
  return toAdminProduct(productById(id));
}

function saveProduct(user: AdminUser, input: unknown, id?: string): AdminProduct {
  requirePermission(user, "content:write");
  const data = parse(ProductInputSchema, input);
  const d = db();
  const brand = d.brands.find((b) => b.slug === data.brandSlug);
  if (!brand) throw apiError("VALIDATION", "Brand tidak ditemukan", { brandSlug: ["Brand tidak ditemukan"] });
  if (d.products.some((p) => p.brandId === brand.id && p.slug === data.slug && p.id !== id)) {
    throw apiError("CONFLICT", "Slug sudah dipakai produk lain di brand ini", { slug: ["Slug sudah dipakai produk lain di brand ini"] });
  }
  const { brandSlug: _bs, ...rest } = data;
  void _bs;
  const record = { ...rest, brandId: brand.id, updatedAt: nowIso() };
  if (id) {
    const i = d.products.findIndex((p) => p.id === id);
    if (i < 0) throw apiError("NOT_FOUND", "Produk tidak ditemukan");
    d.products[i] = { ...record, id };
    return toAdminProduct(d.products[i]);
  }
  const created = { ...record, id: nextId("p") };
  d.products.push(created);
  return toAdminProduct(created);
}

export const createProduct = (user: AdminUser, input: unknown) => saveProduct(user, input);
export const updateProduct = (user: AdminUser, id: string, input: unknown) => saveProduct(user, input, id);

/* ───────────── voucher ───────────── */

export function listVouchers(user: AdminUser, q: VoucherListQuery): Paginated<AdminVoucher> {
  const rows = db()
    .vouchers.map((v) => toAdminVoucher(user, v))
    .filter(
      (v) =>
        (!q.brandSlug || v.brandSlug === q.brandSlug) &&
        (!q.productSlug || v.productSlug === q.productSlug) &&
        (!q.retailer || v.retailer === q.retailer) &&
        (!q.status || v.status === q.status) &&
        (!q.needsReconciliation || String(v.needsReconciliation) === q.needsReconciliation),
    );
  return paginate(rows, q, (v) => `${v.id} ${v.code} ${v.productName} ${v.phone ?? ""}`, {
    id: (v) => v.id,
    code: (v) => v.code,
    status: (v) => v.status,
    redeemedAt: (v) => v.redeemedAt,
    expiresAt: (v) => v.expiresAt,
    releaseCount: (v) => v.releaseCount,
  }, "id");
}

export function getVoucher(user: AdminUser, id: string): VoucherDetail {
  const d = db();
  const v = d.vouchers.find((x) => x.id === id);
  if (!v) throw apiError("NOT_FOUND", "Voucher tidak ditemukan");
  return {
    ...toAdminVoucher(user, v),
    events: d.events.filter((e) => e.voucherId === id).map(({ voucherId: _v, ...e }) => {
      void _v;
      return e;
    }).sort((a, b) => a.at.localeCompare(b.at)),
    claims: d.claims.filter((c) => c.voucherId === id).map((c) => toClaimRecord(user, c)),
  };
}

export function voidVoucher(user: AdminUser, id: string, input: unknown): VoucherDetail {
  requirePermission(user, "voucher:void");
  const { reason } = parse(VoidVoucherRequestSchema, input);
  const d = db();
  const v = d.vouchers.find((x) => x.id === id);
  if (!v) throw apiError("NOT_FOUND", "Voucher tidak ditemukan");
  if (v.status !== "available") throw apiError("CONFLICT", "Hanya voucher berstatus Available yang bisa di-void");
  d.events.push({ id: nextId("EV"), voucherId: id, fromStatus: v.status, toStatus: "void", cause: "admin", refId: null, actor: user.name, note: reason, at: nowIso() });
  v.status = "void";
  return getVoucher(user, id);
}

function checkUpload(user: AdminUser, input: unknown) {
  requirePermission(user, "voucher:upload");
  const req = parse(VoucherUploadRequestSchema, input);
  const d = db();
  const product = d.products.find((p) => p.slug === req.productSlug);
  if (!product) throw apiError("VALIDATION", "Produk tidak ditemukan", { productSlug: ["Produk tidak ditemukan"] });
  if (!product.retailers.includes(req.retailer)) {
    throw apiError("VALIDATION", "Retailer tidak tersedia untuk produk ini", { retailer: ["Retailer tidak tersedia untuk produk ini"] });
  }
  // Kode unik per retailer (PRD 15.1).
  const existing = new Set(d.vouchers.filter((v) => v.retailer === req.retailer).map((v) => v.code));
  const seen = new Set<string>();
  const rows: VoucherUploadResult["rows"] = req.rows.map((r) => {
    let status: VoucherUploadResult["rows"][number]["status"] = "ok";
    let message: string | null = null;
    if (!/^[A-Za-z0-9-]+$/.test(r.code)) {
      status = "invalid";
      message = "Hanya huruf, angka, dan tanda hubung";
    } else if (seen.has(r.code)) {
      status = "duplicate_in_file";
      message = "Duplikat di dalam file";
    } else if (existing.has(r.code)) {
      status = "duplicate_existing";
      message = "Kode sudah ada di sistem";
    }
    seen.add(r.code);
    return { line: r.line, code: r.code, batch: r.batch ?? null, status, message };
  });
  const okCount = rows.filter((r) => r.status === "ok").length;
  return { req, product, rows, okCount };
}

export function previewVoucherUpload(user: AdminUser, input: unknown): VoucherUploadResult {
  const { rows, okCount } = checkUpload(user, input);
  return { total: rows.length, okCount, failedCount: rows.length - okCount, rows };
}

export function commitVoucherUpload(user: AdminUser, input: unknown): VoucherUploadResult {
  const { req, product, rows, okCount } = checkUpload(user, input);
  const d = db();
  const at = nowIso();
  for (const r of rows) {
    if (r.status !== "ok") continue;
    const v: MockVoucher = { id: nextId("VCH"), code: r.code, productId: product.id, retailer: req.retailer, status: "available", batch: r.batch, uploadedAt: at, releaseCount: 0, currentClaimId: null };
    d.vouchers.push(v);
    d.events.push({ id: nextId("EV"), voucherId: v.id, fromStatus: null, toStatus: "available", cause: "upload", refId: r.batch, actor: user.name, note: null, at });
  }
  return { total: rows.length, okCount, failedCount: rows.length - okCount, inserted: okCount, rows };
}

/* ───────────── klaim / peserta ───────────── */

function filterClaims(q: ClaimListQuery): MockClaim[] {
  return db().claims.filter((c) => {
    const p = productById(c.productId);
    const day = c.redeemedAt.slice(0, 10);
    return (
      (!q.brandSlug || brandById(p.brandId).slug === q.brandSlug) &&
      (!q.productSlug || p.slug === q.productSlug) &&
      (!q.retailer || c.retailer === q.retailer) &&
      (!q.source || c.source === q.source) &&
      (!q.smsStatus || c.smsStatus === q.smsStatus) &&
      (!q.from || day >= q.from) &&
      (!q.to || day <= q.to)
    );
  });
}

export function listClaims(user: AdminUser, q: ClaimListQuery): Paginated<ClaimRecord> {
  const needle = q.q?.trim().toLowerCase() ?? "";
  // Nomor HP bisa dicari dalam format apa pun (08/628/+628), hanya oleh role yang boleh melihatnya.
  const digits = /^\+?\d{4,}$/.test(needle) ? normalizePhone(needle).replace(/^62/, "") : "";
  const canSeePhone = can(user.role, "participant:viewPhone");
  const rows = filterClaims(q)
    .filter((c) => {
      if (!needle) return true;
      if (digits && canSeePhone && c.phone.includes(digits)) return true;
      const v = db().vouchers.find((x) => x.id === c.voucherId);
      return `${c.name} ${v?.code ?? ""} ${c.id}`.toLowerCase().includes(needle);
    })
    .map((c) => toClaimRecord(user, c));
  return paginate(rows, { ...q, q: undefined }, () => "", {
    redeemedAt: (c) => c.redeemedAt,
    name: (c) => c.name.toLowerCase(),
    age: (c) => c.age,
    brandName: (c) => c.brandName.toLowerCase(),
  }, "redeemedAt");
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Export CSV sesuai filter aktif (tanpa pagination). */
export function exportClaims(user: AdminUser, q: ClaimListQuery): string {
  requirePermission(user, "participant:export");
  const header = ["claim_id", "voucher_id", "nama", "no_hp", "jenis_kelamin", "umur", "brand", "produk", "kode_voucher", "retailer", "sumber", "tgl_redeem", "tgl_kedaluwarsa", "status_sms"];
  const lines = filterClaims(q).map((c) => {
    const r = toClaimRecord(user, c);
    return [r.id, r.voucherId, r.name, r.phone, GENDER_LABELS[r.gender], r.age, r.brandName, r.productName, r.code, r.retailer, r.source, r.redeemedAt, r.expiresAt, SMS_STATUS_LABELS[r.smsStatus]].map(csvCell).join(",");
  });
  return [header.join(","), ...lines].join("\n");
}

/* ───────────── FAQ ───────────── */

export function listFaqs(q: FaqListQuery): Paginated<AdminFaq> {
  const rows = db().faqs.filter((f) => !q.category || f.category === q.category);
  return paginate(rows, q, (f) => `${f.question} ${f.answer}`, {
    category: (f) => f.category,
    sortOrder: (f) => f.sortOrder,
    question: (f) => f.question.toLowerCase(),
  }, "sortOrder");
}

export function createFaq(user: AdminUser, input: unknown): AdminFaq {
  requirePermission(user, "content:write");
  const faq = { ...parse(FaqInputSchema, input), id: nextId("faq") };
  db().faqs.push(faq);
  return faq;
}

export function updateFaq(user: AdminUser, id: string, input: unknown): AdminFaq {
  requirePermission(user, "content:write");
  const d = db();
  const i = d.faqs.findIndex((f) => f.id === id);
  if (i < 0) throw apiError("NOT_FOUND", "FAQ tidak ditemukan");
  d.faqs[i] = { ...parse(FaqInputSchema, input), id };
  return d.faqs[i];
}

export function deleteFaq(user: AdminUser, id: string): void {
  requirePermission(user, "content:write");
  const d = db();
  if (!d.faqs.some((f) => f.id === id)) throw apiError("NOT_FOUND", "FAQ tidak ditemukan");
  d.faqs = d.faqs.filter((f) => f.id !== id);
}

/* ───────────── template SMS ───────────── */

export function listSmsTemplates(): SmsTemplate[] {
  return db().smsTemplates;
}

export function updateSmsTemplate(user: AdminUser, type: SmsTemplateType, input: unknown): SmsTemplate {
  requirePermission(user, "sms:write");
  const { body } = parse(SmsTemplateInputSchema, input);
  const d = db();
  const i = d.smsTemplates.findIndex((t) => t.type === type);
  if (i < 0) throw apiError("NOT_FOUND", "Template tidak ditemukan");
  d.smsTemplates[i] = { type, body, updatedAt: nowIso(), updatedBy: user.name };
  return d.smsTemplates[i];
}

/* ───────────── blokir ───────────── */

function maskIp(ip: string): string {
  return ip.includes(":") ? `${ip.split(":").slice(0, 2).join(":")}:****` : ip.replace(/\.\d+\.\d+$/, ".*.*");
}

function toBlockEntry(user: AdminUser, b: MockBlock): BlocklistEntry {
  return {
    id: b.id,
    type: b.type,
    // API asli hanya menyimpan hash IP + tampilan sebagian, jadi IP selalu termasking.
    value: b.type === "phone" ? displayPhone(user, b.value) : maskIp(b.value),
    reason: b.reason,
    createdBy: b.createdBy,
    createdAt: b.createdAt,
    expiresAt: b.expiresAt,
  };
}

export function listBlocklist(user: AdminUser, q: BlocklistQuery): Paginated<BlocklistEntry> {
  const rows = db().blocklist.filter((b) => !q.type || b.type === q.type).map((b) => toBlockEntry(user, b));
  return paginate(rows, q, (b) => `${b.value} ${b.reason} ${b.createdBy}`, {
    createdAt: (b) => b.createdAt,
    type: (b) => b.type,
    expiresAt: (b) => b.expiresAt,
  }, "createdAt");
}

export function createBlock(user: AdminUser, input: unknown): BlocklistEntry {
  requirePermission(user, "blocklist:write");
  const data = parse(BlocklistInputSchema, input);
  const value = data.type === "phone" ? normalizePhone(data.value) : data.value.trim();
  const d = db();
  if (d.blocklist.some((b) => b.type === data.type && b.value === value)) {
    throw apiError("CONFLICT", "Sudah ada di daftar blokir", { value: ["Sudah ada di daftar blokir"] });
  }
  const entry: MockBlock = { id: nextId("blk"), type: data.type, value, reason: data.reason, createdBy: user.name, createdAt: nowIso(), expiresAt: data.expiresAt };
  d.blocklist.push(entry);
  return toBlockEntry(user, entry);
}

export function deleteBlock(user: AdminUser, id: string): void {
  requirePermission(user, "blocklist:write");
  const d = db();
  if (!d.blocklist.some((b) => b.id === id)) throw apiError("NOT_FOUND", "Data blokir tidak ditemukan");
  d.blocklist = d.blocklist.filter((b) => b.id !== id);
}

/* ───────────── media ───────────── */

const MAX_MEDIA_BYTES = 2 * 1024 * 1024;

/** Mock: simpan sebagai data URL di memori. API asli mengunggah ke R2 + konversi WebP. */
export async function uploadMedia(user: AdminUser, file: File): Promise<{ url: string }> {
  requirePermission(user, "content:write");
  if (!file.type.startsWith("image/")) throw apiError("VALIDATION", "File harus berupa gambar", { file: ["File harus berupa gambar"] });
  if (file.size > MAX_MEDIA_BYTES) throw apiError("VALIDATION", "Ukuran maksimal 2 MB", { file: ["Ukuran maksimal 2 MB"] });
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { url: `data:${file.type};base64,${base64}` };
}
