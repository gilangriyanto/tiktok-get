import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@tiktok-get/shared";
import { PLACEHOLDER } from "@/lib/placeholders";

const CARD = "block min-h-32 w-full rounded-xl border-2 border-mint/70 desktop:min-h-40";

export function BrandCard({ brand }: { brand: Brand }) {
  if (brand.status !== "active") {
    return (
      <div aria-disabled className={`${CARD} flex items-center justify-center bg-black`}>
        <p className="font-heading text-3xl text-mint desktop:text-5xl">
          Coming Soon
          <span className="sr-only">: {brand.name}</span>
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/${brand.slug}`}
      className={`${CARD} group flex overflow-hidden bg-black transition hover:shadow-glow-mint`}
      aria-label={`${brand.name} — ${brand.cardLabel}, ${brand.cardSubLabel}. Temukan lebih banyak`}
    >
      <div className="relative w-[44%] shrink-0">
        <Image
          src={brand.cardImage ?? PLACEHOLDER.brandCard}
          alt=""
          fill
          sizes="(min-width: 1024px) 340px, 45vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-2 py-3 text-center">
        <span className="font-heading text-mint-gradient text-2xl desktop:text-5xl">
          {brand.name}
        </span>
        {brand.cardLabel && (
          <span className="rounded-md border border-mint/80 px-2 py-0.5 text-sm text-white desktop:text-xl">
            {brand.cardLabel}
          </span>
        )}
        {brand.cardSubLabel && (
          <span className="text-xs text-white/85 desktop:text-sm">{brand.cardSubLabel}</span>
        )}
      </div>

      <div className="m-2 flex w-[22%] max-w-24 items-center justify-center rounded-lg border-2 border-white/70 bg-linear-to-b from-mint/90 to-[#7fd8f5] p-2 text-center text-xs text-[#1b5f6b] transition group-hover:brightness-110 desktop:text-base">
        Temukan lebih banyak
      </div>
    </Link>
  );
}
