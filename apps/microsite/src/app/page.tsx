import { BrandCard } from "@/components/BrandCard";
import { ButtonLink } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { HomeHero } from "@/components/HomeHero";
import { RedeemSteps } from "@/components/RedeemSteps";
import { SiteHeader } from "@/components/SiteHeader";
import { getCachedBrands, getCachedCampaign } from "@/lib/queries";

const BRANDS_ID = "brand-pilihan";
/** TODO(konten): URL "Lihat Promo Lainnya" dari klien. */
const MORE_PROMO_URL = "https://www.tiktok.com/tag/tiktokget";

export default async function HomePage() {
  const [campaign, brands] = await Promise.all([getCachedCampaign(), getCachedBrands()]);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <HomeHero campaign={campaign} targetId={BRANDS_ID} />

        <section
          id={BRANDS_ID}
          aria-labelledby={`${BRANDS_ID}-title`}
          className="container-site scroll-mt-4 py-10 desktop:py-14"
        >
          <h2
            id={`${BRANDS_ID}-title`}
            className="font-heading text-mint-gradient text-3xl desktop:text-center desktop:text-4xl"
          >
            Brand Pilihan
          </h2>
          <ul className="mx-auto mt-6 flex max-w-3xl flex-col gap-4">
            {brands.map((brand) => (
              <li key={brand.slug}>
                <BrandCard brand={brand} />
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <ButtonLink href={MORE_PROMO_URL} variant="cta" className="rounded-lg" target="_blank" rel="noopener noreferrer">
              Lihat Promo Lainnya
            </ButtonLink>
          </div>
        </section>

        <div className="py-10 desktop:py-14">
          <RedeemSteps steps={campaign.howtoSteps} />
        </div>

        <FaqAccordion faqs={campaign.faqs} />
      </main>
    </>
  );
}
