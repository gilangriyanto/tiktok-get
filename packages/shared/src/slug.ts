import { z } from "zod";

/**
 * Segmen path yang dipakai route statis microsite (atau oleh Next.js/aset publik).
 * Slug brand/produk tidak boleh memakai nilai ini karena route statis menang atas `/[brand]`.
 */
export const RESERVED_SLUGS = [
  // route microsite
  "v",
  "belum-mulai",
  "berakhir",
  "voucher-kedaluwarsa",
  "syarat-ketentuan",
  "kebijakan-privasi",
  // infrastruktur / file statis
  "api",
  "_next",
  "_not-found",
  "placeholders",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
] as const;

export type ReservedSlug = (typeof RESERVED_SLUGS)[number];

const reservedSet: ReadonlySet<string> = new Set(RESERVED_SLUGS);

export function isReservedSlug(slug: string): boolean {
  return reservedSet.has(slug.trim().toLowerCase());
}

/** Slug kebab-case huruf kecil, 2–60 karakter, bukan slug reserved. */
export const SlugSchema = z
  .string()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung")
  .refine((s) => !isReservedSlug(s), "Slug ini dipakai sistem, gunakan slug lain");
