import "server-only";
import type {
  AdminBrand,
  AdminFaq,
  AdminUser,
  BlocklistType,
  CampaignSettings,
  ClaimOutcome,
  Gender,
  Retailer,
  SmsStatus,
  SmsTemplate,
  Source,
  VoucherEvent,
  VoucherStatus,
} from "@tiktok-get/shared";

/*
 * Data mock CMS. Konsisten dengan apps/microsite/src/mocks:
 * campaign & FAQ yang sama, Nescafe (Ice Black habis, Ice Roast tersedia), 2 brand coming soon.
 * Tanggal klaim dibuat relatif terhadap waktu server start agar penanda kedaluwarsa bisa dicoba.
 */

export type MockUser = AdminUser & { password: string };

export type MockProduct = {
  id: string;
  brandId: string;
  slug: string;
  name: string;
  variant: string;
  image?: string;
  priceNormal: number;
  priceAfterVoucher: number;
  voucherTerms: string;
  retailers: Retailer[];
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

export type MockVoucher = {
  id: string;
  code: string;
  productId: string;
  retailer: Retailer;
  status: VoucherStatus;
  batch: string | null;
  uploadedAt: string;
  releaseCount: number;
  currentClaimId: string | null;
};

export type MockClaim = {
  id: string;
  voucherId: string;
  name: string;
  /** Format simpan 628… */
  phone: string;
  gender: Gender;
  age: number;
  productId: string;
  retailer: Retailer;
  source: Source;
  redeemedAt: string;
  expiresAt: string;
  outcome: ClaimOutcome;
  smsStatus: SmsStatus;
};

export type MockEvent = VoucherEvent & { voucherId: string };

export type MockBlock = {
  id: string;
  type: BlocklistType;
  /** Nomor: 628…; IP: alamat asli (API asli menyimpan hash). */
  value: string;
  reason: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string | null;
};

export type MockDb = {
  users: MockUser[];
  campaign: CampaignSettings;
  brands: Omit<AdminBrand, "productCount">[];
  products: MockProduct[];
  vouchers: MockVoucher[];
  claims: MockClaim[];
  events: MockEvent[];
  faqs: AdminFaq[];
  smsTemplates: SmsTemplate[];
  blocklist: MockBlock[];
  seq: number;
};

/** PRNG deterministik agar data mock sama di setiap restart. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const WIB_OFFSET_MS = 7 * 3600_000;

/** ISO dengan offset +07:00. */
export function toWibIso(ms: number): string {
  const d = new Date(ms + WIB_OFFSET_MS);
  return `${d.toISOString().slice(0, 19)}+07:00`;
}

/** Akhir hari (23:59:59 WIB) pada (tanggal WIB dari `ms`) + `days` — BR-04. */
export function expiryFrom(ms: number, days: number): string {
  const wib = new Date(ms + WIB_OFFSET_MS);
  wib.setUTCDate(wib.getUTCDate() + days);
  return `${wib.toISOString().slice(0, 10)}T23:59:59+07:00`;
}

const PH = "/placeholders";
const UPLOADED_AT = "2026-11-05T10:00:00+07:00";

const NAMES = [
  "Budi Santoso", "Siti Rahmawati", "Andi Pratama", "Dewi Lestari", "Rizky Maulana",
  "Putri Ayu", "Fajar Nugroho", "Nur Aini", "Agus Setiawan", "Rina Kartika",
  "Dimas Saputra", "Intan Permata", "Yoga Prasetyo", "Maya Sari", "Hendra Wijaya",
];

export function createSeed(now = Date.now()): MockDb {
  const rand = rng(20261111);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];

  const users: MockUser[] = [
    { id: "u-1", name: "Gilang Riyanto", email: "superadmin@tiktokget.test", password: "demo1234", role: "super_admin", allowedBrandSlugs: [] },
    { id: "u-2", name: "Admin Stasindo", email: "admin@tiktokget.test", password: "demo1234", role: "admin", allowedBrandSlugs: [] },
    { id: "u-3", name: "Viewer FTW", email: "viewer@tiktokget.test", password: "demo1234", role: "viewer", allowedBrandSlugs: [] },
  ];

  const campaign: CampaignSettings = {
    name: "TikTok Get — Periode 1",
    slug: "tiktok-get-2026",
    title: "Belanja lebih hemat di Indomaret",
    description: "Temukan voucher diskon untuk belanja produk favoritmu",
    startAt: "2026-11-30T00:00:00+07:00",
    endAt: "2027-01-04T23:59:59+07:00",
    retailerMode: "indomaret",
    howtoSteps: [
      { title: "Temukan Produk", description: "Temukan produk melalui konten-konten dengan hashtag [#TikTokGetBrandA]" },
      { title: "Klik Link", description: "Klik link yang tertera pada konten atau kunjungi hashtag page [#TikTokGetBrandA]" },
      { title: "Klaim Voucher", description: "Masuk ke microsite, pilih produk yang ingin dibeli, lalu isi form. 1 user bisa klaim 3 voucher dalam sehari" },
      { title: "Tukarkan Voucher di Indomaret", description: "" },
    ],
    validityDays: 3,
    reminderTime: "08:00",
    claimLimit: 3,
    claimLimitPeriod: "day",
    claimLimitScope: "campaign",
    ipLimitPerHour: 10,
    deviceLimitPerDay: 3,
    termsHtml: "<p>Syarat &amp; Ketentuan program #TikTokGet (TODO: konten final dari klien).</p>",
    privacyHtml: "<p>Kebijakan Privasi #TikTokGet (TODO: konten final dari klien).</p>",
    heroDesktop: undefined,
    heroMobile: undefined,
    isActive: true,
  };

  const brands: MockDb["brands"] = [
    {
      id: "b-1", slug: "nescafe", name: "Nescafe", status: "active",
      cardLabel: "Voucher 10RB", cardSubLabel: "Kuota Terbatas",
      cardImage: `${PH}/brand-card.svg`, logo: `${PH}/brand-logo.svg`,
      heroDesktop: `${PH}/brand-hero-desktop.svg`, heroMobile: `${PH}/brand-hero-mobile.svg`,
      description: "Ahlinya Ice Americano.", accentColor: "#FE2C55", sortOrder: 1,
      seoTitle: "#TikTokGetNescafe — Voucher Nescafe", seoDesc: "Klaim voucher Nescafe dan tukarkan di Indomaret.",
      videos: [
        { provider: "youtube", videoId: "VIDEO_ID_1", url: "https://www.youtube.com/watch?v=VIDEO_ID_1", title: "Nescafe Ice Americano", sortOrder: 1 },
        { provider: "tiktok", videoId: "7300000000000000002", url: "https://www.tiktok.com/@nescafe/video/7300000000000000002", title: "Nescafe Ice Roast", sortOrder: 2 },
        { provider: "youtube", videoId: "VIDEO_ID_3", url: "https://www.youtube.com/watch?v=VIDEO_ID_3", title: "Nescafe Ice Black", sortOrder: 3 },
      ],
      updatedAt: UPLOADED_AT,
    },
    ...(["Brand B", "Brand C"] as const).map((name, i) => ({
      id: `b-${i + 2}`, slug: `brand-${i === 0 ? "b" : "c"}`, name, status: "coming_soon" as const,
      cardLabel: "", cardSubLabel: "", description: "", accentColor: "#25C2C9", sortOrder: i + 2,
      seoTitle: "", seoDesc: "", videos: [], updatedAt: UPLOADED_AT,
    })),
  ];

  const products: MockProduct[] = [
    {
      id: "p-1", brandId: "b-1", slug: "ice-black-220ml", name: "Nescafe", variant: "Ice Black 220ML",
      image: `${PH}/product.svg`, priceNormal: 11108, priceAfterVoucher: 8000,
      voucherTerms: "Berlaku untuk 1 botol Nescafe Ice Black 220ML di Indomaret.", retailers: ["indomaret"],
      sortOrder: 1, isActive: true, updatedAt: UPLOADED_AT,
    },
    {
      id: "p-2", brandId: "b-1", slug: "ice-roast-220ml", name: "Nescafe", variant: "Ice Roast 220ML",
      image: `${PH}/product.svg`, priceNormal: 11108, priceAfterVoucher: 8000,
      voucherTerms: "Berlaku untuk 1 botol Nescafe Ice Roast 220ML di Indomaret.", retailers: ["indomaret"],
      sortOrder: 2, isActive: true, updatedAt: UPLOADED_AT,
    },
  ];

  const vouchers: MockVoucher[] = [];
  const claims: MockClaim[] = [];
  const events: MockEvent[] = [];
  let seq = 0;
  const nextId = (prefix: string) => `${prefix}-${String(++seq).padStart(6, "0")}`;
  const codes = new Set<string>(["1239830342493020"]);
  const newCode = () => {
    let c: string;
    do c = String(Math.floor(1e15 + rand() * 9e15));
    while (codes.has(c));
    codes.add(c);
    return c;
  };

  function addEvent(
    voucherId: string, fromStatus: VoucherStatus | null, toStatus: VoucherStatus,
    cause: VoucherEvent["cause"], at: string, extra: Partial<Pick<VoucherEvent, "refId" | "actor" | "note">> = {},
  ) {
    events.push({ id: nextId("EV"), voucherId, fromStatus, toStatus, cause, at, refId: extra.refId ?? null, actor: extra.actor ?? null, note: extra.note ?? null });
  }

  function addClaim(v: MockVoucher, product: MockProduct, outcome: ClaimOutcome, daysAgo: number): MockClaim {
    const redeemedMs = now - daysAgo * 86_400_000 - Math.floor(rand() * 8) * 3600_000;
    const claim: MockClaim = {
      id: nextId("CLM"),
      voucherId: v.id,
      name: pick(NAMES),
      phone: `628${1 + Math.floor(rand() * 3)}${String(Math.floor(rand() * 1e9)).padStart(9, "0")}`,
      gender: rand() < 0.55 ? "female" : "male",
      age: 15 + Math.floor(rand() * 30),
      productId: product.id,
      retailer: v.retailer,
      source: rand() < 0.62 ? "tiktok" : "reguler",
      redeemedAt: toWibIso(redeemedMs),
      expiresAt: expiryFrom(redeemedMs, campaign.validityDays),
      outcome,
      smsStatus: rand() < 0.06 ? "failed" : rand() < 0.85 ? "delivered" : "sent",
    };
    claims.push(claim);
    addEvent(v.id, "available", "redeemed", "claim", claim.redeemedAt, { refId: claim.id });
    return claim;
  }

  // [produk, jumlah per status, hari redeem maks]
  const plan: [MockProduct, Record<VoucherStatus, number>][] = [
    [products[0], { available: 0, redeemed: 35, used: 25, void: 0 }],
    [products[1], { available: 80, redeemed: 45, used: 20, void: 5 }],
  ];

  for (const [product, counts] of plan) {
    for (const status of ["redeemed", "used", "available", "void"] as const) {
      for (let i = 0; i < counts[status]; i++) {
        const isDemo = product.id === "p-2" && status === "redeemed" && i === 0;
        const v: MockVoucher = {
          id: nextId("VCH"),
          code: isDemo ? "1239830342493020" : newCode(),
          productId: product.id,
          retailer: "indomaret",
          status,
          batch: i % 2 === 0 ? "BATCH-01" : "BATCH-02",
          uploadedAt: UPLOADED_AT,
          releaseCount: 0,
          currentClaimId: null,
        };
        vouchers.push(v);
        addEvent(v.id, null, "available", "upload", UPLOADED_AT, { refId: v.batch, actor: "Admin Stasindo" });

        if (status === "redeemed") {
          // ±1/3 sudah lewat masa berlaku → perlu rekonsiliasi
          const c = addClaim(v, product, "active", isDemo ? 0 : 1 + Math.floor(rand() * 9));
          v.currentClaimId = c.id;
        } else if (status === "used") {
          const c = addClaim(v, product, "used", 3 + Math.floor(rand() * 8));
          v.currentClaimId = c.id;
          addEvent(v.id, "redeemed", "used", "reconciliation", toWibIso(Date.parse(c.redeemedAt) + 86_400_000), { refId: "RB-0001", actor: "Admin Stasindo" });
        } else if (status === "available" && i < 6) {
          // pernah diklaim, tidak dipakai, dikembalikan ke pool
          const c = addClaim(v, product, "released", 8 + Math.floor(rand() * 3));
          v.releaseCount = 1;
          addEvent(v.id, "redeemed", "available", "reconciliation", toWibIso(Date.parse(c.expiresAt) + 3600_000), { refId: "RB-0001", actor: "Admin Stasindo", note: "Tidak dipakai (data merchant)" });
        } else if (status === "void") {
          addEvent(v.id, "available", "void", "admin", toWibIso(now - 86_400_000), { actor: "Gilang Riyanto", note: "Kode salah dari merchant" });
        }
      }
    }
  }

  const faqs: AdminFaq[] = [
    ["Bagaimana cara mendapatkan voucher #TikTokGet?", "Temukan konten di TikTok, klik Link atau kunjungi hashtag #TikTokGet, lalu ikuti langkah klaim voucher di microsite."],
    ["Apakah saya harus membeli produk terlebih dahulu untuk mendapatkan voucher?", "Tidak. Klaim voucher dulu di microsite, lalu tukarkan saat membeli produk di Indomaret."],
    ["Apakah saya bisa memilih produk yang ingin dibeli?", "Bisa. Pilih produk yang tersedia di halaman brand, lalu klik Klaim di sini."],
    ["Data apa yang perlu saya isi untuk klaim voucher?", "Nama lengkap, No. HP, jenis kelamin, dan umur."],
    ["Bagaimana cara mendapatkan kode voucher setelah klaim?", "Setelah menekan Daftar, kamu langsung diarahkan ke halaman voucher berisi kode yang bisa disalin atau diunduh."],
    ["Apakah saya bisa klaim voucher lebih dari satu kali?", "Bisa, maksimal 3 voucher per hari untuk setiap No. HP."],
  ].map(([question, answer], i) => ({ id: `faq-${i + 1}`, category: "umum" as const, question, answer, sortOrder: i + 1, isActive: true }));
  faqs.push(
    { id: "faq-7", category: "indomaret", question: "Di kasir Indomaret mana voucher bisa ditukar?", answer: "Di seluruh gerai Indomaret yang menjual produk terkait.", sortOrder: 1, isActive: true },
    { id: "faq-8", category: "alfamart", question: "Apakah voucher bisa ditukar di Alfamart?", answer: "Hanya jika campaign mencantumkan Alfamart sebagai retailer.", sortOrder: 1, isActive: false },
  );

  const smsTemplates: SmsTemplate[] = [
    { type: "notification", body: "Voucher {brand} {produk} berhasil! Kode: {kode_voucher}. Tukarkan di {retailer} s.d. {tgl_exp}. Lihat voucher: {link_voucher}", updatedAt: UPLOADED_AT, updatedBy: "Gilang Riyanto" },
    { type: "reminder", body: "Voucher {brand} Anda ({kode_voucher}) hangus HARI INI {tgl_exp}. Yuk segera tukarkan di {retailer}! {link_voucher}", updatedAt: UPLOADED_AT, updatedBy: "Gilang Riyanto" },
  ];

  const blocklist: MockBlock[] = [
    { id: "blk-1", type: "phone", value: "6281200000000", reason: "Klaim berulang dengan nama berbeda", createdBy: "Admin Stasindo", createdAt: toWibIso(now - 2 * 86_400_000), expiresAt: null },
    { id: "blk-2", type: "ip", value: "103.25.10.77", reason: "Terindikasi bot (40 klaim/jam)", createdBy: "Gilang Riyanto", createdAt: toWibIso(now - 86_400_000), expiresAt: toWibIso(now + 6 * 86_400_000) },
  ];

  return { users, campaign, brands, products, vouchers, claims, events, faqs, smsTemplates, blocklist, seq };
}
