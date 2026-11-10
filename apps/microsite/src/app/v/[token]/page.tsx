import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { DownloadVoucherButton } from "@/components/DownloadVoucherButton";
import { RedeemSteps } from "@/components/RedeemSteps";
import { SiteHeader } from "@/components/SiteHeader";
import { VoucherCodeTicket } from "@/components/VoucherCodeTicket";
import { getVoucher } from "@/lib/api";
import { formatDateTimeWib, formatLongDate } from "@/lib/format";
import { PLACEHOLDER } from "@/lib/placeholders";
import { getCachedCampaign } from "@/lib/queries";
import { RETAILER_LABELS } from "@/lib/retailer";
import { isVoucherExpired } from "@/lib/voucher";

export const metadata: Metadata = {
  title: "Vouchermu sudah siap! — #TikTokGet",
  robots: { index: false, follow: false },
};

/** Token voucher bersifat privat: dirender per request, tidak di-cache. */
export default function VoucherPage({ params }: PageProps<"/v/[token]">) {
  return (
    <Suspense fallback={<VoucherSkeleton />}>
      {params.then(({ token }) => (
        <VoucherContent token={token} />
      ))}
    </Suspense>
  );
}

async function VoucherContent({ token }: { token: string }) {
  await connection();
  const [voucher, campaign] = await Promise.all([getVoucher(token), getCachedCampaign()]);
  if (!voucher) notFound();
  if (isVoucherExpired(voucher)) redirect("/voucher-kedaluwarsa");

  const retailer = RETAILER_LABELS[voucher.retailer];

  return (
    <>
      <SiteHeader brandName={voucher.brand.name} bordered />
      <main className="flex-1 overflow-hidden">
        <section aria-labelledby="voucher-title" className="relative">
          <div className="relative -mt-px desktop:hidden">
            <Image
              src={voucher.brand.heroMobile ?? PLACEHOLDER.brandHeroMobile}
              alt=""
              width={750}
              height={780}
              priority
              sizes="100vw"
              className="block h-auto max-h-80 w-full object-cover"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black to-transparent" />
          </div>

          <div className="container-site relative -mt-14 pb-8 text-center desktop:mt-0 desktop:pt-8">
            <h1 id="voucher-title" className="font-heading text-[1.6rem] desktop:text-4xl">
              <span className="text-pink">Vouchermu</span> <span className="text-mint">sudah siap!</span>
            </h1>
            <p className="mx-auto mt-2 max-w-xs text-sm text-white/85">
              Segera tukarkan vouchermu di {retailer} sebelum tanggal{" "}
              {formatLongDate(voucher.expiresAt)}
            </p>
            <p className="mt-6 desktop:text-lg">
              Berlaku Sampai:{" "}
              <strong className="whitespace-nowrap">{formatDateTimeWib(voucher.expiresAt)}</strong>
            </p>
            <div className="mt-4">
              <VoucherCodeTicket
                code={voucher.code}
                productLabel={`${voucher.product.name} ${voucher.product.variant}`}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-white/15 py-12 desktop:py-16">
          <RedeemSteps steps={campaign.howtoSteps} variant="boxed" />
        </div>

        <div className="container-site bg-[radial-gradient(ellipse_at_bottom,rgb(37_194_201/0.45),transparent_70%)] pt-6 pb-16">
          <DownloadVoucherButton token={token} />
        </div>
      </main>
    </>
  );
}

function VoucherSkeleton() {
  return (
    <>
      <SiteHeader bordered />
      <main className="container-site flex-1 py-16 text-center" aria-busy>
        <p className="text-white/70">Memuat voucher…</p>
        <div className="mx-auto mt-8 h-48 max-w-sm animate-pulse rounded-lg bg-white/10" />
      </main>
    </>
  );
}
