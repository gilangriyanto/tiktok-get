import Image from "next/image";
import type { Product } from "@tiktok-get/shared";
import { formatRupiah } from "@/lib/format";
import { PLACEHOLDER } from "@/lib/placeholders";
import { Button } from "./Button";

type Props = {
  product: Product;
  highlighted?: boolean;
  onClaim: (product: Product) => void;
};

/** Kartu voucher berbentuk tiket: lekukan setengah lingkaran di kanan + garis putus-putus. */
export function VoucherTicketCard({ product, highlighted = false, onClaim }: Props) {
  const soldOut = product.stockStatus === "sold_out";
  const label = `${product.name} ${product.variant}`;

  return (
    <article
      id={`produk-${product.slug}`}
      aria-label={soldOut ? `${label} — habis terjual` : label}
      className={`relative scroll-mt-24 rounded-card ${highlighted ? "animate-highlight" : ""}`}
    >
      <div
        className={`ticket-notch-right relative flex min-h-44 overflow-hidden rounded-card ${
          soldOut ? "bg-soldout/80 text-black/70" : "bg-pink-gradient text-black"
        }`}
      >
        <div className="flex w-[45%] items-center justify-center p-3 desktop:p-4">
          <Image
            src={product.image ?? PLACEHOLDER.product}
            alt=""
            width={320}
            height={220}
            className={`h-auto w-full max-w-40 rounded-md ${soldOut ? "opacity-40 grayscale" : ""}`}
          />
        </div>

        <div aria-hidden className="my-3 border-l-2 border-dashed border-white/60" />

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 py-4 pr-9 pl-4">
          <h3 className="text-lg leading-tight font-bold desktop:text-xl">{product.name}</h3>
          <p className="text-xs">{product.variant}</p>
          <p className="mt-2 text-xs line-through opacity-80">
            <span className="sr-only">Harga normal </span>
            {formatRupiah(product.priceNormal)}
          </p>
          <p className="text-lg font-medium text-white desktop:text-xl">
            <span className="sr-only">Harga setelah voucher </span>
            {formatRupiah(product.priceAfterVoucher)}
          </p>
          <Button
            variant="light"
            disabled={soldOut}
            onClick={() => onClaim(product)}
            aria-label={soldOut ? `${label} habis terjual` : `Klaim voucher ${label}`}
            className="mt-2 w-full max-w-36 px-3 whitespace-nowrap disabled:bg-white/30 disabled:text-black/60 disabled:opacity-100 desktop:text-lg"
          >
            Klaim di sini
          </Button>
        </div>

        {soldOut && (
          <p
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span className="-rotate-6 border-b-4 border-white text-4xl font-bold text-white italic drop-shadow-[0_2px_6px_rgb(0_0_0/0.5)] desktop:text-5xl">
              Habis Terjual
            </span>
          </p>
        )}
      </div>
    </article>
  );
}
