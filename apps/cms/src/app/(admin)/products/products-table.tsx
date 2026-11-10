"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Ticket } from "lucide-react";
import { buildTikTokLink, type AdminOptions, type AdminProduct, type Paginated } from "@tiktok-get/shared";
import { CopyButton } from "@/components/copy-button";
import { DataTable, cmsColumnHelper } from "@/components/data-table/data-table";
import { DataTableToolbar, FilterSelect, ResetFilters, SearchInput } from "@/components/data-table/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/format";
import { RETAILER_LABELS } from "@/lib/labels";
import { SITE_URL } from "@/lib/site";

const h = cmsColumnHelper<AdminProduct>();

const COLUMNS = h.columns([
  h.accessor((p) => `${p.name} ${p.variant}`, {
    id: "name",
    header: "Produk",
    meta: { sortKey: "name" },
    cell: ({ row: { original: p } }) => (
      <div className="flex items-center gap-3">
        <div className="relative size-10 shrink-0 overflow-hidden rounded border bg-muted">
          {p.image && <Image src={p.image} alt="" fill unoptimized className="object-cover" sizes="40px" />}
        </div>
        <div>
          <Link href={`/products/${p.id}`} className="font-medium hover:underline">
            {p.name} {p.variant}
          </Link>
          <p className="text-xs text-muted-foreground">/{p.brandSlug}/{p.slug}</p>
        </div>
      </div>
    ),
  }),
  h.accessor("brandName", { header: "Brand", meta: { sortKey: "brandName" } }),
  h.accessor("priceAfterVoucher", {
    header: "Harga",
    meta: { sortKey: "priceAfterVoucher" },
    cell: ({ row: { original: p } }) => (
      <div className="text-sm">
        <span className="block text-xs text-muted-foreground line-through">{formatRupiah(p.priceNormal)}</span>
        {formatRupiah(p.priceAfterVoucher)}
      </div>
    ),
  }),
  h.accessor("retailers", {
    header: "Retailer",
    cell: ({ getValue }) => (
      <div className="flex flex-wrap gap-1">
        {getValue().map((r) => (
          <Badge key={r} variant="outline">
            {RETAILER_LABELS[r]}
          </Badge>
        ))}
      </div>
    ),
  }),
  h.accessor((p) => p.stock.available, {
    id: "available",
    header: "Stok",
    meta: { sortKey: "available" },
    cell: ({ row: { original: p } }) => (
      <div className="text-xs leading-5">
        {p.stockStatus === "sold_out" ? <Badge variant="destructive">Habis</Badge> : <span className="font-medium text-sm">{p.stock.available} available</span>}
        <span className="block text-muted-foreground">
          {p.stock.redeemed} redeem · {p.stock.used} used · {p.stock.needsReconciliation} perlu rekon.
        </span>
      </div>
    ),
  }),
  h.accessor("isActive", {
    header: "Status",
    cell: ({ getValue }) => <Badge variant={getValue() ? "default" : "outline"}>{getValue() ? "Aktif" : "Nonaktif"}</Badge>,
  }),
  h.accessor("sortOrder", { header: "Urutan", meta: { sortKey: "sortOrder", className: "text-right" } }),
  h.display({
    id: "actions",
    header: () => <span className="sr-only">Aksi</span>,
    meta: { className: "text-right" },
    cell: ({ row: { original: p } }) => (
      <div className="flex justify-end gap-1">
        <CopyButton iconOnly label={`Salin link TikTok ${p.variant}`} text={buildTikTokLink(SITE_URL, p.brandSlug, p.slug)} variant="ghost" />
        <Button asChild variant="ghost" size="icon-sm" aria-label={`Voucher ${p.variant}`}>
          <Link href={`/vouchers?productSlug=${p.slug}`}>
            <Ticket />
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon-sm" aria-label={`Buka ${p.variant}`}>
          <Link href={`/products/${p.id}`}>
            <Pencil />
          </Link>
        </Button>
      </div>
    ),
  }),
]);

export function ProductsTable({ result, brands }: { result: Paginated<AdminProduct>; brands: AdminOptions["brands"] }) {
  return (
    <DataTable
      columns={COLUMNS}
      result={result}
      getRowId={(p) => p.id}
      toolbar={
        <DataTableToolbar>
          <SearchInput placeholder="Cari produk / slug…" />
          <FilterSelect param="brandSlug" label="Brand" options={brands.map((b) => ({ value: b.slug, label: b.name }))} />
          <FilterSelect
            param="isActive"
            label="Status"
            options={[
              { value: "true", label: "Aktif" },
              { value: "false", label: "Nonaktif" },
            ]}
          />
          <ResetFilters params={["q", "brandSlug", "isActive"]} />
        </DataTableToolbar>
      }
    />
  );
}
