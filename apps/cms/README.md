# cms — CMS admin #TikTokGet

Next.js 16 (App Router, Cache Components) + Tailwind v4 + shadcn/ui (radix-nova) + TanStack Table v9 +
react-hook-form + Zod (skema dari `@tiktok-get/shared`). Port 3001.

```powershell
pnpm --filter @tiktok-get/shared build
Copy-Item apps/cms/.env.example apps/cms/.env.local
pnpm --filter cms dev   # http://localhost:3001
```

Kontrak endpoint: [`docs/api-contract.md`](../../docs/api-contract.md).

## Struktur

- `src/app/(admin)/<modul>` — halaman per modul (`page.tsx` server, tabel/form client, `actions.ts` server action)
- `src/lib/api.ts` — satu fungsi per endpoint `/admin/*`; server-only (token tidak pernah ke browser)
- `src/lib/mock/` — mock in-memory yang meniru API (izin role, masking, konflik). **Reset saat server restart.**
- `src/lib/session.ts` — cookie `cms_session` (httpOnly, 60 menit); `src/proxy.ts` mengalihkan ke `/login`
- `src/components/data-table` — tabel bersama: cari/filter/sort/pagination via URL (server-side)
- `src/components/form` — field react-hook-form bersama, ImageField, FormShell (mode lihat untuk Viewer)

## Env

| Variabel | Fungsi |
|---|---|
| `NEXT_PUBLIC_USE_MOCK` | `true` = mock. Mock juga dipakai jika `NEXT_PUBLIC_API_URL` kosong |
| `NEXT_PUBLIC_API_URL` | base URL apps/api; CMS memanggil `{url}/admin/...` |
| `NEXT_PUBLIC_SITE_URL` | domain microsite untuk link TikTok |

## Mencoba (mock)

Akun demo (password `demo1234`) — tombol isi otomatis ada di halaman login:

| Akun | Role | Bisa |
|---|---|---|
| superadmin@tiktokget.test | Super Admin | semua, termasuk void voucher & halaman Admin |
| admin@tiktokget.test | Admin Campaign | kelola konten, upload voucher, export, blokir |
| viewer@tiktokget.test | Viewer | lihat saja; No. HP selalu `0812****3456`; tanpa export |

| Modul | Yang bisa dicoba |
|---|---|
| Campaign | ubah periode (WIB), kuota, anti-abuse; tambah/urutkan langkah Cara Redeem; tanggal selesai < mulai → error |
| Brand | slug `berakhir` (reserved) / `nescafe` (sudah dipakai) ditolak; tambah ≤ 3 video + pratinjau; hapus Nescafe ditolak (masih punya produk) |
| Produk | Ice Black stok habis; salin link TikTok (+ utm_campaign); harga setelah voucher > normal ditolak |
| Voucher | filter "Perlu rekonsiliasi"; upload `public/templates/kode-voucher.csv` (unduh dari halaman upload) — coba duplikat & kode `1239830342493020` (sudah ada); void (Super Admin) |
| Peserta & klaim | filter sumber/tanggal/SMS gagal; cari No. HP format 08 atau 628; export CSV |
| FAQ | tambah/ubah/hapus, kategori umum/indomaret/alfamart |
| Template SMS | sisip placeholder, emoji → UCS-2, > 160 karakter → 2 segmen |
| Blokir | tambah nomor (`+62 812-0000-0000` = duplikat setelah normalisasi) / IP |
