"use client";

import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { AdminBrand, BrandStatus, Paginated } from "@tiktok-get/shared";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { DataTable, cmsColumnHelper } from "@/components/data-table/data-table";
import { DataTableToolbar, FilterSelect, ResetFilters, SearchInput } from "@/components/data-table/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { BRAND_STATUS_LABELS, toOptions } from "@/lib/labels";
import { deleteBrandAction } from "./actions";

const STATUS_VARIANT: Record<BrandStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  coming_soon: "secondary",
  inactive: "outline",
};

const h = cmsColumnHelper<AdminBrand>();

function makeColumns(canWrite: boolean) {
  return h.columns([
    h.accessor("name", {
      header: "Brand",
      meta: { sortKey: "name" },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded border bg-muted">
            {row.original.logo && <Image src={row.original.logo} alt="" fill unoptimized className="object-contain" sizes="40px" />}
          </div>
          <div>
            <Link href={`/brands/${row.original.id}`} className="font-medium hover:underline">
              {row.original.name}
            </Link>
            <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
          </div>
        </div>
      ),
    }),
    h.accessor("status", {
      header: "Status",
      meta: { sortKey: "status" },
      cell: ({ getValue }) => <Badge variant={STATUS_VARIANT[getValue()]}>{BRAND_STATUS_LABELS[getValue()]}</Badge>,
    }),
    h.accessor("cardLabel", {
      header: "Label kartu",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.cardLabel || "—"}
          {row.original.cardSubLabel && <span className="block text-xs text-muted-foreground">{row.original.cardSubLabel}</span>}
        </span>
      ),
    }),
    h.accessor("productCount", { header: "Produk", meta: { sortKey: "productCount", className: "text-right" } }),
    h.accessor("videos", { header: "Video", cell: ({ getValue }) => `${getValue().length}/3` }),
    h.accessor("sortOrder", { header: "Urutan", meta: { sortKey: "sortOrder", className: "text-right" } }),
    h.accessor("updatedAt", { header: "Diubah", meta: { sortKey: "updatedAt" }, cell: ({ getValue }) => formatDateTime(getValue()) }),
    h.display({
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      meta: { className: "text-right" },
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button asChild variant="ghost" size="icon-sm" aria-label={`${canWrite ? "Ubah" : "Lihat"} ${row.original.name}`}>
            <Link href={`/brands/${row.original.id}`}>
              <Pencil />
            </Link>
          </Button>
          {canWrite && (
            <ConfirmActionButton
              title={`Hapus brand ${row.original.name}?`}
              description={
                row.original.productCount > 0
                  ? "Brand ini masih punya produk dan tidak bisa dihapus. Ubah status menjadi Nonaktif untuk menyembunyikannya."
                  : "Brand akan dihapus permanen."
              }
              action={() => deleteBrandAction(row.original.id)}
              success="Brand dihapus"
              trigger={
                <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${row.original.name}`}>
                  <Trash2 />
                </Button>
              }
            />
          )}
        </div>
      ),
    }),
  ]);
}

const COLUMNS_RW = makeColumns(true);
const COLUMNS_RO = makeColumns(false);

export function BrandsTable({ result, canWrite }: { result: Paginated<AdminBrand>; canWrite: boolean }) {
  return (
    <DataTable
      columns={canWrite ? COLUMNS_RW : COLUMNS_RO}
      result={result}
      getRowId={(b) => b.id}
      toolbar={
        <DataTableToolbar>
          <SearchInput placeholder="Cari nama / slug…" />
          <FilterSelect param="status" label="Status" options={toOptions(BRAND_STATUS_LABELS)} />
          <ResetFilters params={["q", "status"]} />
        </DataTableToolbar>
      }
    />
  );
}
