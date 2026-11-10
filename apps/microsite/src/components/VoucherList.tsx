"use client";

import { useEffect, useState } from "react";
import type { Brand, Product } from "@tiktok-get/shared";
import { ClaimModal } from "./ClaimModal";
import { VoucherTicketCard } from "./VoucherTicketCard";

type Props = {
  brand: Pick<Brand, "slug" | "name">;
  products: Product[];
  /** Slug produk dari /[brand]/[produk]: kartu di-scroll ke tengah dan di-highlight. */
  highlightSlug?: string;
};

export function VoucherList({ brand, products, highlightSlug }: Props) {
  const [selected, setSelected] = useState<Product | null>(null);
  /** Produk yang dilaporkan habis oleh API sejak halaman dimuat. */
  const [soldOutSlugs, setSoldOutSlugs] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    if (!highlightSlug) return;
    document
      .getElementById(`produk-${highlightSlug}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightSlug]);

  function markSoldOut(product: Product) {
    setSoldOutSlugs((prev) => new Set(prev).add(product.slug));
  }

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
              product={
                soldOutSlugs.has(product.slug) ? { ...product, stockStatus: "sold_out" } : product
              }
              highlighted={product.slug === highlightSlug}
              onClaim={setSelected}
            />
          </li>
        ))}
      </ul>

      {selected && (
        <ClaimModal
          key={selected.slug}
          brand={brand}
          product={selected}
          onClose={() => setSelected(null)}
          onOutOfStock={markSoldOut}
        />
      )}
    </section>
  );
}
