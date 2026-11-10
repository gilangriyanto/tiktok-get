import type { AdminBrand, BrandInput } from "@tiktok-get/shared";

/** Nilai awal form brand baru. Modul biasa (bukan "use client") agar bisa dipakai server component. */
export const EMPTY_BRAND: BrandInput = {
  slug: "",
  name: "",
  status: "coming_soon",
  cardLabel: "Voucher 10RB",
  cardSubLabel: "Kuota Terbatas",
  description: "",
  accentColor: "#FE2C55",
  sortOrder: 10,
  seoTitle: "",
  seoDesc: "",
  videos: [],
};

/** Respons AdminBrand → nilai form BrandInput. */
export function brandToInput(b: AdminBrand): BrandInput {
  return {
    slug: b.slug,
    name: b.name,
    status: b.status,
    cardLabel: b.cardLabel,
    cardSubLabel: b.cardSubLabel,
    cardImage: b.cardImage,
    logo: b.logo,
    heroDesktop: b.heroDesktop,
    heroMobile: b.heroMobile,
    description: b.description,
    accentColor: b.accentColor,
    sortOrder: b.sortOrder,
    seoTitle: b.seoTitle,
    seoDesc: b.seoDesc,
    videos: b.videos.map(({ provider, url, title, sortOrder }) => ({ provider, url, title, sortOrder })),
  };
}
