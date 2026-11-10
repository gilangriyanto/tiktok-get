"use client";

import { useEffect, useState } from "react";
import type { Brand, Product } from "@tiktok-get/shared";
import { VoucherTicketCard } from "./VoucherTicketCard";

type Props = {
  brand: Pick<Brand, "slug" | "name">;
  products: Product[];
  /** Slug produk dari /[brand]/[produk]: kartu di-scroll ke tengah dan di-highlight. */
  highlightSlug?: string;
};

// TODO(langkah 6): `brand` dipakai ClaimModal.
export function VoucherList({ products, highlightSlug }: Props) {
  const [, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    if (!highlightSlug) return;
    document
      .getElementById(`produk-${highlightSlug}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightSlug]);

  return (
    <section aria-labelledby="daftar-voucher-title" className="container-site">
      <h2
        id="daftar-voucher-title"
        className="font-heading text-mint-gradient text-3xl desktop:text-center desktop:text-4xl"
      >
        Daftar Voucher
      </h2>
      <ul className="mx-auto mt-6 grid max-w-3xl gap-5 desktop:grid-cols-2">
        {products.map((product) => (
          <li key={product.slug}>
            <VoucherTicketCard
              product={product}
              highlighted={product.slug === highlightSlug}
              onClaim={setSelected}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
