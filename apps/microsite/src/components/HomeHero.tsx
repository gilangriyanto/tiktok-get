import Image from "next/image";
import type { Campaign } from "@tiktok-get/shared";
import { formatPeriod } from "@/lib/format";
import { PLACEHOLDER } from "@/lib/placeholders";
import { buttonStyles } from "./Button";

type Props = { campaign: Campaign; targetId: string };

export function HomeHero({ campaign, targetId }: Props) {
  return (
    <section className="relative border-b border-pink-deep" aria-labelledby="hero-title">
      <div className="container-site grid items-center gap-6 pb-8 desktop:grid-cols-2 desktop:gap-10 desktop:pb-10">
        <div className="relative mx-auto aspect-5/4 w-full max-w-md desktop:order-2 desktop:max-w-none">
          {/* bingkai mint bercahaya di belakang ilustrasi */}
          <div
            aria-hidden
            className="absolute inset-[6%] rounded-4xl border-2 border-mint/60 bg-teal/10 shadow-glow-mint"
          />
          {/* TODO(aset): ilustrasi hero final (voucher + tas belanja). */}
          <Image
            src={PLACEHOLDER.heroIllustration}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 480px, 100vw"
            className="rounded-4xl object-cover p-[10%]"
          />
        </div>

        <div className="desktop:order-1">
          <h1
            id="hero-title"
            className="font-heading bg-linear-to-r from-white to-mint bg-clip-text text-3xl leading-tight text-transparent desktop:text-[2.6rem]"
          >
            {campaign.title}
          </h1>
          <p className="mt-3 text-sm text-white/85 desktop:text-base">{campaign.description}</p>
          <p className="mt-2 text-sm font-semibold desktop:text-base">
            Periode {formatPeriod(campaign.startAt, campaign.endAt)}
          </p>
          <a
            href={`#${targetId}`}
            className={`${buttonStyles("cta")} mt-6 w-full rounded-lg text-lg desktop:w-auto`}
          >
            Redeem Voucher Sekarang
          </a>
        </div>
      </div>
    </section>
  );
}
