import Link from "next/link";

type Props = {
  /** Nama brand untuk ditempel setelah #TikTokGet (warna pink), mis. "Nescafe". */
  brandName?: string;
  /** Garis teal tipis di bawah header (halaman brand & voucher). */
  bordered?: boolean;
};

export function SiteHeader({ brandName, bordered = false }: Props) {
  return (
    <header
      className={`relative z-20 ${bordered ? "border-b border-teal/40" : ""} bg-linear-to-b from-black/80 to-transparent`}
    >
      <div className="container-site flex min-h-14 items-center desktop:min-h-16">
        <Link
          href="/"
          className="font-heading text-xl desktop:text-3xl"
          aria-label={`Beranda #TikTokGet${brandName ?? ""}`}
        >
          <span className={brandName ? "text-mint" : "text-white"}>#TikTokGet</span>
          {brandName && <span className="text-pink">{brandName}</span>}
        </Link>
      </div>
    </header>
  );
}
