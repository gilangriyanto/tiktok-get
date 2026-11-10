"use client";

import { Trash2 } from "lucide-react";
import type { BlocklistEntry, Paginated } from "@tiktok-get/shared";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { DataTable, cmsColumnHelper } from "@/components/data-table/data-table";
import { DataTableToolbar, FilterSelect, ResetFilters, SearchInput } from "@/components/data-table/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { BlockDialog } from "./block-dialog";
import { deleteBlockAction } from "./actions";

const h = cmsColumnHelper<BlocklistEntry>();

function makeColumns(canWrite: boolean) {
  return h.columns([
    h.accessor("type", {
      header: "Tipe",
      meta: { sortKey: "type" },
      cell: ({ getValue }) => <Badge variant="outline">{getValue() === "phone" ? "Nomor HP" : "IP"}</Badge>,
    }),
    h.accessor("value", { header: "Nilai", cell: ({ getValue }) => <span className="font-mono text-sm">{getValue()}</span> }),
    h.accessor("reason", { header: "Alasan", cell: ({ getValue }) => <span className="block max-w-md whitespace-normal">{getValue()}</span> }),
    h.accessor("createdBy", {
      header: "Dibuat",
      meta: { sortKey: "createdAt" },
      cell: ({ row: { original: b } }) => (
        <span className="text-sm">
          {formatDateTime(b.createdAt)}
          <span className="block text-xs text-muted-foreground">{b.createdBy}</span>
        </span>
      ),
    }),
    h.accessor("expiresAt", {
      header: "Berlaku s.d.",
      meta: { sortKey: "expiresAt" },
      cell: ({ getValue }) => (getValue() ? formatDateTime(getValue()) : <Badge variant="secondary">Permanen</Badge>),
    }),
    h.display({
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      meta: { className: "text-right" },
      cell: ({ row: { original: b } }) =>
        canWrite ? (
          <ConfirmActionButton
            title="Hapus dari daftar blokir?"
            description={`${b.type === "phone" ? "Nomor" : "IP"} ${b.value} bisa melakukan klaim lagi.`}
            action={() => deleteBlockAction(b.id)}
            confirmLabel="Hapus blokir"
            success="Blokir dihapus"
            trigger={<Button variant="ghost" size="icon-sm" aria-label={`Hapus blokir ${b.value}`}><Trash2 /></Button>}
          />
        ) : null,
    }),
  ]);
}

const COLUMNS_RW = makeColumns(true);
const COLUMNS_RO = makeColumns(false);

export function BlocklistTable({ result, canWrite }: { result: Paginated<BlocklistEntry>; canWrite: boolean }) {
  return (
    <DataTable
      columns={canWrite ? COLUMNS_RW : COLUMNS_RO}
      result={result}
      getRowId={(b) => b.id}
      emptyText="Daftar blokir kosong."
      toolbar={
        <DataTableToolbar actions={canWrite && <BlockDialog />}>
          <SearchInput placeholder="Cari nilai / alasan…" />
          <FilterSelect param="type" label="Tipe" options={[{ value: "phone", label: "Nomor HP" }, { value: "ip", label: "IP" }]} />
          <ResetFilters params={["q", "type"]} />
        </DataTableToolbar>
      }
    />
  );
}
