import type { BrandDetail } from "@tiktok-get/shared";

const PH = "/placeholders";

export const mockBrands: BrandDetail[] = [
  {
    slug: "nescafe",
    name: "Nescafe",
    status: "active",
    cardLabel: "Voucher 10RB",
    cardSubLabel: "Kuota Terbatas",
    cardImage: `${PH}/brand-card.svg`,
    logo: `${PH}/brand-logo.svg`,
    heroDesktop: `${PH}/brand-hero-desktop.svg`,
    heroMobile: `${PH}/brand-hero-mobile.svg`,
    videos: [
      { provider: "youtube", videoId: "dQw4w9WgXcQ", title: "Nescafe Ice Americano" },
      { provider: "tiktok", videoId: "7300000000000000001", title: "Nescafe Ice Roast" },
      { provider: "youtube", videoId: "aqz-KE-bpKQ", title: "Nescafe Ice Black" },
    ],
    products: [
      {
        slug: "ice-black-220ml",
        name: "Nescafe",
        variant: "Ice Black 220ML",
        image: `${PH}/product.svg`,
        priceNormal: 11108,
        priceAfterVoucher: 8000,
        stockStatus: "sold_out",
      },
      {
        slug: "ice-roast-220ml",
        name: "Nescafe",
        variant: "Ice Roast 220ML",
        image: `${PH}/product.svg`,
        priceNormal: 11108,
        priceAfterVoucher: 8000,
        stockStatus: "available",
      },
    ],
  },
  {
    slug: "brand-b",
    name: "Brand B",
    status: "coming_soon",
    cardLabel: "",
    cardSubLabel: "",
    videos: [],
    products: [],
  },
  {
    slug: "brand-c",
    name: "Brand C",
    status: "coming_soon",
    cardLabel: "",
    cardSubLabel: "",
    videos: [],
    products: [],
  },
];
