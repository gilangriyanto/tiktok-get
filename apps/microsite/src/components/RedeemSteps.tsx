import type { HowtoStep } from "@tiktok-get/shared";
import { RichText } from "./RichText";

type Props = {
  steps: HowtoStep[];
  /** "home": judul gradasi besar; "boxed": judul di dalam kotak outline (halaman voucher). */
  variant?: "home" | "boxed";
};

export function RedeemSteps({ steps, variant = "home" }: Props) {
  return (
    <section aria-labelledby="redeem-steps-title" className="container-site">
      {variant === "home" ? (
        <h2
          id="redeem-steps-title"
          className="font-heading text-mint-gradient text-[1.7rem] leading-tight desktop:text-center desktop:text-5xl"
        >
          Cara redeem <br className="desktop:hidden" />
          voucher belanjamu!
        </h2>
      ) : (
        <h2
          id="redeem-steps-title"
          className="mx-auto max-w-md rounded-xl border border-teal/50 bg-linear-to-b from-teal/10 to-transparent px-6 py-3 text-center text-3xl font-semibold text-mint desktop:text-4xl"
        >
          Cara redeem voucher belanjamu
        </h2>
      )}

      <ol className="mx-auto mt-8 max-w-3xl">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0 desktop:gap-8 desktop:pb-10">
              {!last && (
                <span
                  aria-hidden
                  className={`absolute top-6 bottom-0 left-2.75 w-1.5 rounded-full ${
                    i === steps.length - 2
                      ? "bg-linear-to-b from-teal to-teal/10"
                      : "bg-teal"
                  }`}
                />
              )}
              <span
                aria-hidden
                className="relative z-10 mt-1 size-7 shrink-0 rounded-full border-[6px] border-teal bg-black"
              />
              <div>
                <h3 className="text-xl font-bold text-teal desktop:text-2xl">{step.title}</h3>
                {step.description && (
                  <p className="mt-1 text-sm text-white/85 desktop:text-base">
                    <RichText text={step.description} />
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
