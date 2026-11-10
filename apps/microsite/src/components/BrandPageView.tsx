import type { BrandDetail, Campaign } from "@tiktok-get/shared";
import { BrandHero } from "./BrandHero";
import { RetailerBox } from "./RetailerBox";
import { SiteHeader } from "./SiteHeader";
import { VideoCarousel } from "./VideoCarousel";
import { VoucherList } from "./VoucherList";

type Props = {
  brand: BrandDetail;
  campaign: Campaign;
  highlightSlug?: string;
};

/** Isi halaman brand, dipakai oleh /[brand] dan /[brand]/[produk]. */
export function BrandPageView({ brand, campaign, highlightSlug }: Props) {
  return (
    <>
      <SiteHeader brandName={brand.name} bordered />
      <main className="flex-1 pb-16">
        <BrandHero brand={brand} campaign={campaign} />
        <div className="container-site mt-12 desktop:mt-8">
          <RetailerBox retailerMode={campaign.retailerMode} />
        </div>
        <div className="mt-12">
          <VoucherList
            brand={brand}
            products={brand.products}
            highlightSlug={highlightSlug}
          />
        </div>
        <div className="mt-10">
          <VideoCarousel videos={brand.videos} />
        </div>
      </main>
    </>
  );
}
