"use client";

import { useId, useState } from "react";
import type { Faq } from "@tiktok-get/shared";
import { RichText } from "./RichText";

/**
 * Accordion FAQ: tertutup "+", terbuka "−". Item pertama terbuka (sesuai desain).
 * Latar gradasi hitam → mint, sehingga teks item setelah yang pertama berwarna gelap.
 */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section aria-labelledby={`${baseId}-title`}>
      <h2 id={`${baseId}-title`} className="font-heading text-center text-4xl text-white">
        FAQ
      </h2>
      <div className="mt-6 bg-linear-to-b from-black from-10% via-[#1aa5ab] via-35% to-[#e2fcfa] pb-16">
        <ul className="container-site">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            const dark = i > 0;
            const panelId = `${baseId}-panel-${i}`;
            const buttonId = `${baseId}-button-${i}`;
            return (
              <li key={faq.question} className={`border-b ${dark ? "border-black/25" : "border-white/20"}`}>
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className={`flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left text-sm font-medium desktop:text-base ${
                      dark ? "text-black" : "text-white"
                    }`}
                  >
                    <span>
                      <RichText text={faq.question} />
                    </span>
                    <span aria-hidden className="w-6 shrink-0 text-center text-2xl leading-none">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="-mx-4 bg-black/55 px-4 py-4 text-sm text-white desktop:-mx-8 desktop:px-8 desktop:text-base"
                >
                  <RichText text={faq.answer} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
