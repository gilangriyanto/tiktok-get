import type { AdminProduct, ProductInput } from "@tiktok-get/shared";

export function emptyProduct(brandSlug = ""): ProductInput {
  return {
    brandSlug,
    slug: "",
    name: "",
    variant: "",
    priceNormal: 0,
    priceAfterVoucher: 0,
    voucherTerms: "",
    retailers: ["indomaret"],
    sortOrder: 10,
    isActive: true,
  };
}

/** Respons AdminProduct → nilai form ProductInput. */
export function productToInput(p: AdminProduct): ProductInput {
  return {
    brandSlug: p.brandSlug,
    slug: p.slug,
    name: p.name,
    variant: p.variant,
    image: p.image,
    priceNormal: p.priceNormal,
    priceAfterVoucher: p.priceAfterVoucher,
    voucherTerms: p.voucherTerms,
    retailers: p.retailers,
    sortOrder: p.sortOrder,
    isActive: p.isActive,
  };
}
