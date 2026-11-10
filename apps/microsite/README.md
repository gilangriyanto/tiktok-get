# microsite — #TikTokGet

Next.js 16 (App Router, Cache Components) + Tailwind v4. Port 3000.

```powershell
pnpm --filter @tiktok-get/shared build   # sekali, atau setelah skema shared berubah
Copy-Item apps/microsite/.env.example apps/microsite/.env.local
pnpm --filter microsite dev
```

## Struktur

- `src/app` — route: `/`, `/[brand]`, `/[brand]/[produk]`, `/v/[token]`, `/belum-mulai`, `/berakhir`,
  `/voucher-kedaluwarsa`, `/syarat-ketentuan`, `/kebijakan-privasi`, 404
- `src/components` — satu komponen per file
- `src/lib/api.ts` — satu fungsi per endpoint; mock ↔ API asli lewat env
- `src/lib/queries.ts` — pembungkus `"use cache"` untuk Server Components
- `src/proxy.ts` — alihkan ke `/belum-mulai` / `/berakhir` sesuai periode campaign
- `src/mocks` — data mock
- Design tokens (warna, radius, glow, `--font-display`, `--font-body`): `src/app/globals.css` (`@theme`)

Kontrak data: [`packages/shared/CONTRACT.md`](../../packages/shared/CONTRACT.md).

## Env

| Variabel | Fungsi |
|---|---|
| `NEXT_PUBLIC_USE_MOCK` | `true` = data mock. Mock juga dipakai jika `NEXT_PUBLIC_API_URL` kosong |
| `NEXT_PUBLIC_API_URL` | base URL apps/api |
| `NEXT_PUBLIC_MOCK_CAMPAIGN_STATE` | mock saja: kosong = `active`; `upcoming` / `ended` / `active` = paksa; `dates` = pakai tanggal mock |

Variabel `NEXT_PUBLIC_*` di-inline saat build/dev → restart `dev` (atau build ulang) setelah mengubahnya.

## Mencoba semua state (mock)

| State | Caranya |
|---|---|
| Brand coming soon | Home → 2 kartu "Coming Soon" (tidak bisa diklik) |
| Produk sold out | `/nescafe` → kartu Ice Black 220ML |
| Highlight produk | `/nescafe/ice-roast-220ml` |
| Validasi form | Klaim → isi nama 1 huruf / HP `0812` / umur `9` |
| Loading | Klaim dengan data valid (mock delay 0,8 detik) |
| Kuota habis | No. HP berakhiran `000`, mis. `081234567000` |
| Stok habis | No. HP berakhiran `111` (kartu ikut jadi "Habis Terjual") |
| Rate limit / error umum | No. HP berakhiran `222` |
| Sukses → voucher | No. HP lain, mis. `081234567890` → `/v/demo-token` |
| Voucher kedaluwarsa | `/v/expired-token` |
| Token tidak ada / 404 | `/v/apa-saja`, `/halaman-asal` |
| Campaign belum mulai / berakhir | `NEXT_PUBLIC_MOCK_CAMPAIGN_STATE=upcoming` / `ended` lalu buka `/` |
| Sumber traffic | Buka `/?src=tiktok` → `sessionStorage["tiktokget:src"] = "tiktok"`, dikirim saat klaim |
