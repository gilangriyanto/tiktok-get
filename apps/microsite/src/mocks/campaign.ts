import type { Campaign } from "@tiktok-get/shared";

export const mockCampaign: Campaign = {
  title: "Belanja lebih hemat di Indomaret",
  description: "Temukan voucher diskon untuk belanja produk favoritmu",
  startAt: "2026-11-30T00:00:00+07:00",
  endAt: "2027-01-04T23:59:59+07:00",
  retailerMode: "indomaret",
  howtoSteps: [
    {
      title: "Temukan Produk",
      description: "Temukan produk melalui konten-konten dengan hashtag [#TikTokGetBrandA]",
    },
    {
      title: "Klik Link",
      description:
        "Klik link yang tertera pada konten atau kunjungi hashtag page [#TikTokGetBrandA]",
    },
    {
      title: "Klaim Voucher",
      description:
        "Masuk ke microsite, pilih produk yang ingin dibeli, lalu isi form. 1 user bisa klaim 3 voucher dalam sehari",
    },
    { title: "Tukarkan Voucher di Indomaret", description: "" },
  ],
  faqs: [
    {
      question: "Bagaimana cara mendapatkan voucher #TikTokGet?",
      answer:
        "Temukan konten di TikTok, klik Link atau kunjungi hashtag #TikTokGet, lalu ikuti langkah klaim voucher di microsite.",
    },
    {
      question: "Apakah saya harus membeli produk terlebih dahulu untuk mendapatkan voucher?",
      answer:
        "Tidak. Klaim voucher dulu di microsite, lalu tukarkan saat membeli produk di Indomaret.",
    },
    {
      question: "Apakah saya bisa memilih produk yang ingin dibeli?",
      answer: "Bisa. Pilih produk yang tersedia di halaman brand, lalu klik Klaim di sini.",
    },
    {
      question: "Data apa yang perlu saya isi untuk klaim voucher?",
      answer: "Nama lengkap, No. HP, jenis kelamin, dan umur.",
    },
    {
      question: "Bagaimana cara mendapatkan kode voucher setelah klaim?",
      answer:
        "Setelah menekan Daftar, kamu langsung diarahkan ke halaman voucher berisi kode yang bisa disalin atau diunduh.",
    },
    {
      question: "Apakah saya bisa klaim voucher lebih dari satu kali?",
      answer: "Bisa, maksimal 3 voucher per hari untuk setiap No. HP.",
    },
  ],
};
