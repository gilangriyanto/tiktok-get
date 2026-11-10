"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VOUCHER_STATUS_LABELS, type AdminOptions, type AdminVoucher, type Paginated } from "@tiktok-get/shared";
import { DataTable, cmsColumnHelper } from "@/components/data-table/data-table";
import { DataTableToolbar, FilterSelect, ResetFilters, SearchInput } from "@/components/data-table/toolbar";
import { formatDateTime } from "@/lib/format";
import { RETAILER_LABELS, toOptions } from "@/lib/labels";
import { VoucherStatusBadge } from "./voucher-status-badge";

const h = cmsColumnHelper<AdminVoucher>();

const COLUMNS = h.columns([
  h.accessor("id", {
    header: "Voucher ID",
    meta: { sortKey: "id" },
    cell: ({ getValue }) => (
      <Link href={`/vouchers/${getValue()}`} className="font-mono text-xs font-medium hover:underline">
        {getValue()}
      </Link>
    ),
  }),
  h.accessor("code", { header: "Kode", meta: { sortKey: "code" }, cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span> }),
  h.accessor("productName", {
    header: "Produk",
    cell: ({ row: { original: v } }) => (
      <span className="text-sm">
        {v.productName}
        <span className="block text-xs text-muted-foreground">{v.brandName}</span>
      </span>
    ),
  }),
  h.accessor("retailer", { header: "Retailer", cell: ({ getValue }) => RETAILER_LABELS[getValue()] }),
  h.accessor("status", {
    header: "Status",
    meta: { sortKey: "status" },
    cell: ({ row: { original: v } }) => <VoucherStatusBadge status={v.status} needsReconciliation={v.needsReconciliation} />,
  }),
  h.accessor("redeemedAt", { header: "Tgl redeem", meta: { sortKey: "redeemedAt" }, cell: ({ getValue }) => formatDateTime(getValue()) }),
  h.accessor("expiresAt", { header: "Tgl exp", meta: { sortKey: "expiresAt" }, cell: ({ getValue }) => formatDateTime(getValue()) }),
  h.accessor("phone", { header: "No. HP", cell: ({ getValue }) => <span className="font-mono text-xs">{getValue() ?? "—"}</span> }),
  h.accessor("releaseCount", { header: "Dirilis ulang", meta: { sortKey: "releaseCount", className: "text-right" } }),
]);

export function VouchersTable({ result, options }: { result: Paginated<AdminVoucher>; options: AdminOptions }) {
  const brandSlug = useSearchParams().get("brandSlug");
  const products = options.products.filter((p) => !brandSlug || p.brandSlug === brandSlug);
  return (
    <DataTable
      columns={COLUMNS}
      result={result}
      getRowId={(v) => v.id}
      toolbar={
        <DataTableToolbar>
          <SearchInput placeholder="Cari Voucher ID / kode / No. HP…" />
          <FilterSelect param="brandSlug" label="Brand" options={options.brands.map((b) => ({ value: b.slug, label: b.name }))} />
          <FilterSelect param="productSlug" label="Produk" options={products.map((p) => ({ value: p.slug, label: `${p.name} ${p.variant}` }))} />
          <FilterSelect param="retailer" label="Retailer" options={toOptions(RETAILER_LABELS)} />
          <FilterSelect param="status" label="Status" options={toOptions(VOUCHER_STATUS_LABELS)} />
          <FilterSelect param="needsReconciliation" label="Rekonsiliasi" options={[{ value: "true", label: "Perlu rekonsiliasi" }]} />
          <ResetFilters params={["q", "brandSlug", "productSlug", "retailer", "status", "needsReconciliation"]} />
        </DataTableToolbar>
      }
    />
  );
}
