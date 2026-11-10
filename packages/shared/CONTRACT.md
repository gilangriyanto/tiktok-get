# Kontrak API microsite ↔ apps/api

Sumber kebenaran: skema Zod di `packages/shared/src` (`@tiktok-get/shared`).
Pakai skema yang sama di API (`XxxSchema.parse(body)`) supaya validasi client dan server identik.
Setelah mengubah `src/`, jalankan `pnpm --filter @tiktok-get/shared build`.

## ⚠️ Breaking change

`ClaimRequestSchema` lama **diganti**:

| Lama | Baru |
|---|---|
| `productId` | `productSlug` |
| `email` (opsional) | dihapus |
| `city` | dihapus |
| `retailer` (`INDOMARET`/`ALFAMART`) | dihapus dari request (retailer ditentukan campaign) |
| — | `gender`: `"male" \| "female"` |
| — | `age`: integer 10–99 |
| — | `source`: `"tiktok" \| "reguler"` |
| `phone` regex | `phone` dinormalisasi lalu divalidasi (lihat di bawah) |

Enum retailer sekarang huruf kecil: `"indomaret" | "alfamart"`.

## Endpoint yang dipanggil microsite

Path ini masih usulan (`apps/microsite/src/lib/api.ts`). Kalau API memakai path lain, cukup ubah file itu.

| Method & path | Response 2xx | Catatan |
|---|---|---|
| `GET /campaign` | `Campaign` | 1 campaign aktif |
| `GET /brands` | `Brand[]` | tanpa brand `inactive`, urut sesuai tampilan |
| `GET /brands/:slug` | `BrandDetail` (Brand + `products: Product[]`) | 404 jika tidak ada |
| `POST /claims` | `ClaimResponse` `{ viewToken }` | body `ClaimRequest`, error → `ClaimError` |
| `GET /vouchers/:token` | `VoucherView` | 404 jika token tidak ada |
| `GET /vouchers/:token/image` | `image/png` | **usulan**, untuk tombol Download Voucher |

Semua tanggal: ISO 8601 **dengan offset**, mis. `2027-01-04T23:59:59+07:00`.
Harga: integer rupiah (`8000`, bukan `"8.000"`).

## Skema

- **Campaign**: `title`, `description`, `startAt`, `endAt`, `retailerMode` (`indomaret|alfamart|all`),
  `howtoSteps[] {title, description}`, `faqs[] {question, answer}`
- **Brand**: `slug`, `name`, `status` (`active|coming_soon|inactive`), `cardLabel` ("Voucher 10RB"),
  `cardSubLabel` ("Kuota Terbatas"), `cardImage?`, `logo?`, `heroDesktop?`, `heroMobile?`,
  `videos[] {provider: youtube|tiktok, videoId, title, thumbnail?}` (maks. 3)
- **Product**: `slug`, `name`, `variant`, `image?`, `priceNormal`, `priceAfterVoucher`,
  `stockStatus` (`available|sold_out`)
- **ClaimRequest**: `productSlug`, `fullName` (2–100 karakter, di-trim), `phone`, `gender`, `age`,
  `source`, `turnstileToken`
- **ClaimResponse**: `{ viewToken }` — token acak, tidak bisa ditebak; dipakai di URL `/v/{viewToken}`
- **ClaimError**: `{ code, message?, fieldErrors? }`
- **VoucherView**: `brand {slug, name, logo?, heroMobile?}`, `product {slug, name, variant}`, `code`,
  `retailer`, `expiresAt`

### No. HP

Client boleh mengirim `08…`, `628…`, atau `+628…` (spasi/titik/tanda hubung diabaikan).
`PhoneSchema` menormalisasi ke format `08…` lalu mewajibkan total **10–13 digit**.
`ClaimRequestSchema.parse()` di API langsung menghasilkan nomor ternormalisasi, jadi
nomor yang sama dari format berbeda dihitung sebagai satu user untuk kuota.
Helper: `normalizePhone(raw)`.

### Kode error klaim

| `code` | HTTP (usulan) | Ditampilkan microsite |
|---|---|---|
| `QUOTA_EXCEEDED` | 409 | "Maaf, kuota habis! Anda sudah mencapai batas maksimum penukaran voucher." |
| `OUT_OF_STOCK` | 409 | "Maaf, voucher produk ini baru saja habis" (kartu produk ditandai habis) |
| `RATE_LIMITED` | 429 | "Terlalu banyak percobaan" |
| `CAMPAIGN_INACTIVE` | 403 | "Campaign sedang tidak aktif" |
| `VALIDATION` | 400 | "Data belum valid" (+ `fieldErrors` per field, opsional) |

Response non-2xx yang body-nya bukan `ClaimError` dianggap error umum oleh microsite
(429 tanpa body tetap dianggap `RATE_LIMITED`).

Turnstile: microsite akan mengirim `turnstileToken` dari Cloudflare Turnstile; API wajib
memverifikasinya ke Cloudflare. Selama widget belum terpasang, nilainya `"turnstile-placeholder"`.

## Slug reserved

`RESERVED_SLUGS` + `isReservedSlug(slug)` + `SlugSchema`: slug brand/produk **tidak boleh** memakai
`v, belum-mulai, berakhir, voucher-kedaluwarsa, syarat-ketentuan, kebijakan-privasi, api, _next,
_not-found, placeholders, favicon.ico, robots.txt, sitemap.xml` karena bentrok dengan route
microsite. `SlugSchema` juga mewajibkan kebab-case huruf kecil, 2–60 karakter. Pakai di CMS dan API
saat membuat/mengubah brand atau produk.
