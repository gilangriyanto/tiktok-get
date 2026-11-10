# TikTok Get

Monorepo: microsite (3000), CMS (3001), API NestJS (4000), packages/shared.

## Menjalankan di lokal

    docker compose up -d
    pnpm install
    pnpm dev

## Aturan
- Package manager: pnpm 10.18.2 (jangan pakai npm/yarn)
- Tambah library: pnpm add <nama> --filter <app>
- Perubahan di packages/shared = perubahan kontrak API, wajib dikabari di PR
- Branch: feat/* -> PR ke develop -> rilis ke main