import Image, { getImageProps } from "next/image";
import type { BrandDetail, Campaign } from "@tiktok-get/shared";
import { formatPeriod } from "@/lib/format";
import { PLACEHOLDER } from "@/lib/placeholders";

type Props = { brand: BrandDetail; campaign: Campaign };

/**
 * Mobile: gambar di atas, logo + teks + periode di bawah.
 * Desktop: gambar full-width, logo + teks menimpa sisi kiri.
 */
export function BrandHero({ brand, campaign }: Props) {
  const common = { alt: "", sizes: "100vw", priority: true };
  const { props: desktop } = getImageProps({
    ...common,
    src: brand.heroDesktop ?? PLACEHOLDER.brandHeroDesktop,
    width: 1680,
    height: 940,
  });
  // SVG (placeholder) tidak dioptimasi sehingga srcSet kosong → pakai src.
  const desktopSrcSet = desktop.srcSet ?? desktop.src;
  const {
    props: { srcSet: mobileSrcSet,...imgProps },
  } = getImageProps({
    ...common,
    src: brand.heroMobile ?? PLACEHOLDER.brandHeroMobile,
    width: 750,
    height: 780,
  });

  return (
    <section className="relative" aria-labelledby="brand-hero-title">
      <picture>
        <source media="(min-width: 1024px)" srcSet={desktopSrcSet} />
        <source srcSet={mobileSrcSet ?? imgProps.src} />
        <img {...imgProps} alt="" className="block h-auto w-full" />
      </picture>
      {/* gradasi agar teks desktop terbaca dan gambar mobile menyatu ke latar */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black to-transparent desktop:inset-y-0 desktop:left-0 desktop:h-auto desktop:w-3/5 desktop:bg-linear-to-r desktop:from-black/85"
      />

      <div className="container-site relative pt-6 desktop:absolute desktop:inset-0 desktop:flex desktop:flex-col desktop:justify-end desktop:pb-[5%]">
        <h1 id="brand-hero-title" className="w-[85%] max-w-md desktop:w-[45%]">
          <Image
            src={brand.logo ?? PLACEHOLDER.brandLogo}
            alt={brand.name}
            width={560}
            height={140}
            className="h-auto w-full"
          />
        </h1>
        <p className="mt-3 text-sm text-white/85 desktop:text-xl">
          Dapatkan voucher belanja #TikTokGet{brand.name}
          <br />
          {formatPeriod(campaign.startAt, campaign.endAt, " - ")}
        </p>
      </div>
    </section>
  );
}
