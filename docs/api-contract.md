# Kontrak API — TikTok Get (microsite + CMS)

Untuk: developer backend `apps/api` (NestJS). Acuan kebutuhan: PRD v1.2 (Bab 5, 8, 9, 11, 12, 15).

- **Skema = sumber kebenaran.** Semua nama skema di bawah ada di `@tiktok-get/shared`
  (`packages/shared/src`). Validasi request di API dengan skema yang sama (`XxxSchema.parse(body)`),
  supaya pesan & aturan identik dengan form CMS/microsite. Ringkasan perubahan skema: `packages/shared/CONTRACT.md`.
- **Implementasi acuan:** frontend sudah memanggil endpoint ini lewat `apps/microsite/src/lib/api.ts` dan
  `apps/cms/src/lib/api.ts`. Perilaku mock CMS (`apps/cms/src/lib/mock/server.ts`) meniru API yang
  diharapkan — termasuk izin per role, masking, dan konflik — dan boleh dibaca sebagai spesifikasi hidup.
- Path endpoint masih **usulan**; kalau diubah, cukup sesuaikan dua file `api.ts` di atas.

## 1. Konvensi umum

| Hal | Aturan |
|---|---|
| Base URL | `NEXT_PUBLIC_API_URL`. Publik: `/{path}`. Admin: **`/admin/{path}`**. |
| Format | JSON (`Content-Type: application/json`), kecuali export CSV, gambar PNG, dan upload media (multipart). |
| Tanggal | ISO 8601 **dengan offset** (`2027-01-04T23:59:59+07:00`). Simpan UTC, tampil WIB (BR-14). Filter tanggal `from`/`to` = `YYYY-MM-DD` (WIB). |
| Uang | Integer rupiah (`8000`). |
| No. HP | Disimpan **`628…`** (`normalizePhone`). Respons ke UI selalu **format lokal `08…`** (`formatPhoneLocal`), atau **termasking `0812****3456`** (`maskPhone`) untuk role tanpa izin `participant:viewPhone`. |
| Slug | `SlugSchema`: kebab-case 2–60 karakter, **bukan** `RESERVED_SLUGS` (`isReservedSlug`). Brand unik global, produk unik per brand. |
| ID | String opak. Voucher ID tampil ke admin/merchant, mis. `VCH-000123`. |
| 204 | Endpoint `DELETE` & `POST /admin/auth/logout` membalas **204 tanpa body**. |

### Error

| Area | Body | Skema |
|---|---|---|
| Publik — klaim | `{ code, message?, fieldErrors? }` | `ClaimErrorSchema` (`QUOTA_EXCEEDED`, `OUT_OF_STOCK`, `RATE_LIMITED`, `CAMPAIGN_INACTIVE`, `VALIDATION`) |
| Admin | `{ code, message?, fieldErrors? }` | `AdminErrorSchema` |

Kode admin → HTTP: `VALIDATION` 400 · `UNAUTHORIZED` 401 · `FORBIDDEN` 403 · `NOT_FOUND` 404 · `CONFLICT` 409 · `RATE_LIMITED` 429.

`fieldErrors` = `{ "<path>": ["pesan", …] }` dengan path **notasi titik sesuai field request**
(`slug`, `videos.0.url`, `howtoSteps.2.title`). CMS langsung memasang pesan ini di field form, jadi
untuk konflik keunikan kirim mis. `409 { code: "CONFLICT", message, fieldErrors: { slug: ["Slug sudah dipakai brand lain"] } }`.

### Auth admin

- `POST /admin/auth/login` → `{ token, user }`. CMS menyimpan `token` di **cookie httpOnly** miliknya
  sendiri (60 menit, FR-CMS-01) dan mengirimnya ke API sebagai **`Authorization: Bearer <token>`** dari server CMS.
  Token tidak pernah sampai ke browser. API cukup memvalidasi JWT (tidak perlu set cookie).
- Token kedaluwarsa/invalid → **401** → CMS mengarahkan ke `/login?expired=1`.
- Izin per role = fungsi `can(role, permission)` di `auth.ts`. **API wajib menegakkan aturan yang sama** —
  UI hanya menyembunyikan tombol.

| Permission | super_admin | admin | viewer |
|---|:-:|:-:|:-:|
| baca semua data (masking berlaku) | ✓ | ✓ | ✓ |
| `content:write` (campaign, brand, produk, FAQ, media) | ✓ | ✓ | – |
| `voucher:upload` | ✓ | ✓ | – |
| `voucher:void` | ✓ | – | – |
| `participant:viewPhone` (No. HP lengkap) | ✓ | ✓ | – |
| `participant:export` | ✓ | ✓ | – |
| `blocklist:write` | ✓ | ✓ | – |
| `sms:write` | ✓ | ✓ | – |
| `admin:manage` | ✓ | – | – |

Viewer bisa dibatasi per brand (`AdminUser.allowedBrandSlugs`, kosong = semua) — API memfilter data brand lain (FR-RPT-07).

### Daftar ber-pagination (semua tabel CMS)

Query `ListQuerySchema`: `page` (≥1, default 1), `pageSize` (1–100, default 20), `q` (cari), `sort`, `order` (`asc|desc`),
plus filter khusus per endpoint. Respons `Paginated<T>` = `{ items, page, pageSize, total }`
(skema: `paginatedSchema(ItemSchema)`). Nilai `sort` yang tidak dikenal diabaikan (pakai default).

## 2. Endpoint publik (microsite)

| Method & path | Auth | Request | Respons 2xx | Error |
|---|---|---|---|---|
| `GET /campaign` | – | – | `CampaignSchema` (FAQ sudah difilter sesuai `retailerMode`, BR-12) | – |
| `GET /brands` | – | – | `BrandSchema[]` (tanpa `inactive`, urut `sortOrder`) | – |
| `GET /brands/:slug` | – | – | `BrandDetailSchema` (Brand + `products: ProductSchema[]`, hanya produk aktif; `stockStatus` dari stok Available) | 404 |
| `POST /claims` | Turnstile | `ClaimRequestSchema` | `ClaimResponseSchema` `{ viewToken }` (≥ 32 karakter acak, FR-MS-07) | `ClaimErrorSchema`: 400 `VALIDATION`, 409 `QUOTA_EXCEEDED` / `OUT_OF_STOCK`, 403 `CAMPAIGN_INACTIVE`, 429 `RATE_LIMITED` |
| `GET /vouchers/:token` | token di URL | – | `VoucherViewSchema` | 404 |
| `GET /vouchers/:token/image` | token di URL | – | `image/png` 1080×1920, `Content-Disposition: attachment; filename="voucher-{brand}-{kode}.png"` (FR-MS-08, **usulan**) | 404 |

`POST /claims` — urutan cek (PRD 7.2): Turnstile (server-side) → format & normalisasi nomor → blocklist nomor/IP →
rate limit IP/perangkat (`ipLimitPerHour`, `deviceLimitPerDay`) → kuota nomor (`claimLimit`/`Period`/`Scope`, BR-06/08) →
alokasi atomik `SELECT … FOR UPDATE SKIP LOCKED` (BR-02) → `expiresAt` = akhir hari WIB (redeem + `validityDays`) →
simpan `source`, `consent_at` → respons → SMS via antrean. Target < 800 ms p95.

## 3. Endpoint admin (CMS) — prefix `/admin`, semua butuh Bearer kecuali login

### Auth & admin

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `POST /admin/auth/login` | publik | `LoginRequestSchema` | `LoginResponseSchema` | 401 `UNAUTHORIZED` ("Email atau password salah"), 429 |
| `GET /admin/auth/me` | semua | – | `AdminUserSchema` | 401 |
| `POST /admin/auth/logout` | semua | – | 204 | 401 |
| `GET /admin/admins` | `admin:manage` | – | `AdminUserSchema[]` | 403 |

### Dashboard & opsi

| Method & path | Role | Request | Respons |
|---|---|---|---|
| `GET /admin/dashboard` | semua | – | `DashboardSummarySchema` (stok, klaim hari ini, peserta unik, sumber, SMS gagal, stok rendah < 50) |
| `GET /admin/options` | semua | – | `AdminOptionsSchema` (brand & produk ringkas untuk dropdown) |

### Campaign

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `GET /admin/campaign` | semua | – | `CampaignSettingsSchema` | – |
| `PUT /admin/campaign` | `content:write` | `CampaignSettingsSchema` | `CampaignSettingsSchema` | 400 (mis. `endAt` ≤ `startAt` → `fieldErrors.endAt`), 403 |

### Brand

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `GET /admin/brands` | semua | `BrandListQuerySchema` (+ `status`) · sort: `name`, `sortOrder`, `status`, `productCount`, `updatedAt` · cari: nama/slug | `Paginated<AdminBrand>` | – |
| `GET /admin/brands/:id` | semua | – | `AdminBrandSchema` | 404 |
| `POST /admin/brands` | `content:write` | `BrandInputSchema` | `AdminBrandSchema` | 400, 403, 409 slug (`fieldErrors.slug`) |
| `PUT /admin/brands/:id` | `content:write` | `BrandInputSchema` | `AdminBrandSchema` | 400, 403, 404, 409 slug |
| `DELETE /admin/brands/:id` | `content:write` | – | 204 | 403, 404, **409 jika brand masih punya produk** |

Video: request berisi `url` (+ `provider`, `title`, `sortOrder`); server mengisi `videoId` dengan `parseVideoUrl()`. Maks. 3.

### Produk

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `GET /admin/products` | semua | `ProductListQuerySchema` (+ `brandSlug`, `isActive`) · sort: `name`, `brandName`, `priceAfterVoucher`, `available`, `sortOrder` | `Paginated<AdminProduct>` (dengan `stock: StockSummary`, `stockStatus`) | – |
| `GET /admin/products/:id` | semua | – | `AdminProductSchema` | 404 |
| `POST /admin/products` | `content:write` | `ProductInputSchema` | `AdminProductSchema` | 400 (`brandSlug` tak dikenal, harga), 403, 409 slug per brand |
| `PUT /admin/products/:id` | `content:write` | `ProductInputSchema` | `AdminProductSchema` | 400, 403, 404, 409 |

Produk tidak dihapus — nonaktifkan (`isActive: false`). Link TikTok dibuat di CMS (`buildTikTokLink`), tidak perlu endpoint.

### Voucher

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `GET /admin/vouchers` | semua | `VoucherListQuerySchema` (+ `brandSlug`, `productSlug`, `retailer`, `status`, `needsReconciliation`) · sort: `id`, `code`, `status`, `redeemedAt`, `expiresAt`, `releaseCount` · cari: Voucher ID/kode/No. HP | `Paginated<AdminVoucher>` (`phone` termasking sesuai role) | – |
| `GET /admin/vouchers/:id` | semua | – | `VoucherDetailSchema` (+ `events: VoucherEvent[]` urut waktu, `claims: ClaimRecord[]`) | 404 |
| `POST /admin/vouchers/:id/void` | `voucher:void` | `VoidVoucherRequestSchema` `{ reason }` | `VoucherDetailSchema` | 403, 404, 409 jika status bukan `available` |
| `POST /admin/vouchers/upload/preview` | `voucher:upload` | `VoucherUploadRequestSchema` `{ productSlug, retailer, rows: [{ line, code, batch? }] }` | `VoucherUploadResultSchema` (tanpa `inserted`) | 400 (produk tak ada / retailer tidak tersedia untuk produk), 403 |
| `POST /admin/vouchers/upload` | `voucher:upload` | `VoucherUploadRequestSchema` | `VoucherUploadResultSchema` (`inserted` = jumlah disimpan) | 400, 403 |

Upload: CMS mem-parse CSV/XLSX (kolom `kode_voucher` wajib, `batch` opsional) dan mengirim baris JSON (maks. 50.000).
Server menandai tiap baris: `ok` · `invalid` · `duplicate_in_file` · `duplicate_existing` (unik **per retailer**, PRD 15.1).
Commit hanya menyimpan baris `ok` (status `available`) + event `upload`. Penanda `needsReconciliation` = status
`redeemed` dan sudah lewat `expiresAt` (dihitung server, PRD Bab 8).

### Peserta & klaim

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `GET /admin/claims` | semua | `ClaimListQuerySchema` (+ `brandSlug`, `productSlug`, `retailer`, `source`, `smsStatus`, `from`, `to`) · sort: `redeemedAt` (default desc disarankan), `name`, `age`, `brandName` · cari: nama/kode/No. HP (format 08/628, hanya untuk role yang boleh lihat nomor) | `Paginated<ClaimRecord>` (`phone` termasking sesuai role) | – |
| `GET /admin/claims/export` | `participant:export` | filter yang sama, tanpa pagination | `text/csv; charset=utf-8` | 403 |

Kolom CSV: `claim_id, voucher_id, nama, no_hp, jenis_kelamin, umur, brand, produk, kode_voucher, retailer, sumber, tgl_redeem, tgl_kedaluwarsa, status_sms`.
Export wajib dicatat di audit log (FR-CMS-16).

### FAQ

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `GET /admin/faqs` | semua | `FaqListQuerySchema` (+ `category`) · sort: `category`, `sortOrder`, `question` | `Paginated<AdminFaq>` | – |
| `POST /admin/faqs` | `content:write` | `FaqInputSchema` | `AdminFaqSchema` | 400, 403 |
| `PUT /admin/faqs/:id` | `content:write` | `FaqInputSchema` | `AdminFaqSchema` | 400, 403, 404 |
| `DELETE /admin/faqs/:id` | `content:write` | – | 204 | 403, 404 |

### Template SMS

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `GET /admin/sms-templates` | semua | – | `SmsTemplateSchema[]` (`notification`, `reminder`) | – |
| `PUT /admin/sms-templates/:type` | `sms:write` | `SmsTemplateInputSchema` `{ body }` (placeholder hanya `SMS_PLACEHOLDERS`) | `SmsTemplateSchema` | 400, 403, 404 |

Render & hitung segmen di server pakai helper yang sama: `renderSmsTemplate()`, `smsSegments()`.

### Blokir

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `GET /admin/blocklist` | semua | `BlocklistQuerySchema` (+ `type`) · sort: `createdAt`, `type`, `expiresAt` | `Paginated<BlocklistEntry>` | – |
| `POST /admin/blocklist` | `blocklist:write` | `BlocklistInputSchema` `{ type, value, reason, expiresAt }` | `BlocklistEntrySchema` | 400, 403, 409 sudah ada (`fieldErrors.value`) |
| `DELETE /admin/blocklist/:id` | `blocklist:write` | – | 204 | 403, 404 |

Nomor dinormalisasi `628…` sebelum disimpan/dibandingkan. IP disimpan sebagai **hash** (PRD 15); karena itu respons
`value` untuk IP berupa tampilan sebagian (mis. `103.25.*.*`) yang disimpan saat dibuat.

### Media

| Method & path | Role | Request | Respons | Error |
|---|---|---|---|---|
| `POST /admin/media` | `content:write` | `multipart/form-data`, field `file` (gambar ≤ 2 MB) | `MediaUploadResponseSchema` `{ url }` (R2, dikonversi WebP, FR-CMS-17) | 400, 403 |

## 4. Belum di kontrak ini (menyusul)

| Modul | Catatan |
|---|---|
| Rekonsiliasi (Bab 13) | export batch, import hasil merchant, preview, commit → **target 10 Des 2026** |
| Reporting (Bab 14) | KPI, tabel per produk/brand, tren, export → 14 Des 2026 |
| Audit log (FR-CMS-16) | `GET /admin/audit-log` |
| Manajemen admin (FR-CMS-15) | `POST/PUT/DELETE /admin/admins` (saat ini hanya daftar) |
| Konten S&K & privasi untuk microsite | usulan `GET /pages/terms` & `GET /pages/privacy` (dari `termsHtml`/`privacyHtml`) |
| Kirim ulang SMS (FR-SMS-05) | usulan `POST /admin/claims/:id/resend-sms` |
