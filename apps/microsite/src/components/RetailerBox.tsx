import Image from "next/image";
import type { RetailerMode } from "@tiktok-get/shared";
import { RETAILER_LABELS, RETAILER_LOGOS, retailersOf } from "@/lib/retailer";

export function RetailerBox({ retailerMode }: { retailerMode: RetailerMode }) {
  return (
    <section
      aria-label="Retailer"
      className="mx-auto max-w-lg rounded-card border-2 border-pink/80 bg-black px-6 py-8 text-center shadow-glow-pink"
    >
      <p className="text-xl font-bold text-mint desktop:text-2xl">Temukan voucher belanjamu</p>
      <p className="text-sm text-white/85">di bawah ini!</p>
      <ul className="mt-5 flex flex-wrap items-center justify-center gap-4">
        {retailersOf(retailerMode).map((retailer) => (
          <li key={retailer}>
            <Image
              src={RETAILER_LOGOS[retailer]}
              alt={RETAILER_LABELS[retailer]}
              width={200}
              height={70}
              className="h-auto w-40 rounded-sm desktop:w-48"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
