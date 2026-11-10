"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  GENDER_LABELS,
  SMS_STATUS_LABELS,
  type AdminOptions,
  type ClaimRecord,
  type Paginated,
  type SmsStatus,
} from "@tiktok-get/shared";
import { DataTable, cmsColumnHelper } from "@/components/data-table/data-table";
import { DataTableToolbar, DateFilter, FilterSelect, ResetFilters, SearchInput } from "@/components/data-table/toolbar";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/format";
import { RETAILER_LABELS, SOURCE_LABELS, toOptions } from "@/lib/labels";

const SMS_VARIANT: Record<SmsStatus, "default" | "secondary" | "outline" | "destructive"> = {
  queued: "outline",
  sent: "secondary",
  delivered: "default",
  failed: "destructive",
};

const h = cmsColumnHelper<ClaimRecord>();

const COLUMNS = h.columns([
  h.accessor("name", {
    header: "Nama",
    meta: { sortKey: "name" },
    cell: ({ row: { original: c } }) => (
      <span>
        {c.name}
        <span className="block font-mono text-xs text-muted-foreground">{c.phone}</span>
      </span>
    ),
  }),
  h.accessor("gender", { header: "JK", cell: ({ getValue }) => GENDER_LABELS[getValue()] }),
  h.accessor("age", { header: "Umur", meta: { sortKey: "age", className: "text-right" } }),
  h.accessor("brandName", {
    header: "Brand / produk",
    meta: { sortKey: "brandName" },
    cell: ({ row: { original: c } }) => (
      <span className="text-sm">
        {c.productName}
        <span className="block text-xs text-muted-foreground">{c.brandName}</span>
      </span>
    ),
  }),
  h.accessor("code", {
    header: "Kode",
    cell: ({ row: { original: c } }) => (
      <Link href={`/vouchers/${c.voucherId}`} className="font-mono text-xs hover:underline">
        {c.code}
      </Link>
    ),
  }),
  h.accessor("retailer", { header: "Retailer", cell: ({ getValue }) => RETAILER_LABELS[getValue()] }),
  h.accessor("source", {
    header: "Sumber",
    cell: ({ getValue }) => <Badge variant={getValue() === "tiktok" ? "default" : "outline"}>{SOURCE_LABELS[getValue()]}</Badge>,
  }),
  h.accessor("redeemedAt", { header: "Tgl redeem", meta: { sortKey: "redeemedAt" }, cell: ({ getValue }) => formatDateTime(getValue()) }),
  h.accessor("smsStatus", {
    header: "SMS",
    cell: ({ getValue }) => <Badge variant={SMS_VARIANT[getValue()]}>{SMS_STATUS_LABELS[getValue()]}</Badge>,
  }),
]);

export function ClaimsTable({ result, options }: { result: Paginated<ClaimRecord>; options: AdminOptions }) {
  const brandSlug = useSearchParams().get("brandSlug");
  const products = options.products.filter((p) => !brandSlug || p.brandSlug === brandSlug);
  return (
    <DataTable
      columns={COLUMNS}
      result={result}
      getRowId={(c) => c.id}
      emptyText="Belum ada klaim yang cocok."
      toolbar={
        <div className="flex flex-col gap-2">
          <DataTableToolbar>
            <SearchInput placeholder="Cari nama / kode / No. HP…" />
            <FilterSelect param="brandSlug" label="Brand" options={options.brands.map((b) => ({ value: b.slug, label: b.name }))} />
            <FilterSelect param="productSlug" label="Produk" options={products.map((p) => ({ value: p.slug, label: `${p.name} ${p.variant}` }))} />
            <FilterSelect param="retailer" label="Retailer" options={toOptions(RETAILER_LABELS)} />
            <FilterSelect param="source" label="Sumber" options={toOptions(SOURCE_LABELS)} />
            <FilterSelect param="smsStatus" label="Status SMS" options={toOptions(SMS_STATUS_LABELS)} />
          </DataTableToolbar>
          <DataTableToolbar>
            <DateFilter param="from" label="Redeem dari" />
            <DateFilter param="to" label="s.d." />
            <ResetFilters params={["q", "brandSlug", "productSlug", "retailer", "source", "smsStatus", "from", "to"]} />
          </DataTableToolbar>
        </div>
      }
    />
  );
}
