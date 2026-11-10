"use client";

import {
  createColumnHelper,
  metaHelper,
  tableFeatures,
  useTable,
  type ColumnHelper,
  type RowData,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ReactNode } from "react";
import type { Paginated } from "@tiktok-get/shared";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./pagination";
import { useUrlState } from "./use-url-state";

export type CmsColumnMeta = {
  /** Kunci sort yang dikirim ke API (?sort=...). Kolom tanpa sortKey tidak bisa di-sort. */
  sortKey?: string;
  className?: string;
};

export const cmsFeatures = tableFeatures({ columnMeta: metaHelper<CmsColumnMeta>() });
export type CmsFeatures = typeof cmsFeatures;
export type CmsColumns<T extends RowData> = ReturnType<ColumnHelper<CmsFeatures, T>["columns"]>;

export function cmsColumnHelper<T extends RowData>() {
  return createColumnHelper<CmsFeatures, T>();
}

type Props<T extends RowData> = {
  columns: CmsColumns<T>;
  result: Paginated<T>;
  getRowId: (row: T) => string;
  /** Pencarian + filter di atas tabel. */
  toolbar?: ReactNode;
  emptyText?: string;
};

/**
 * Tabel standar CMS. Data sudah diproses server (search/filter/sort/pagination via URL);
 * TanStack Table dipakai untuk definisi kolom & rendering.
 */
export function DataTable<T extends RowData>({ columns, result, getRowId, toolbar, emptyText = "Tidak ada data." }: Props<T>) {
  const { params, set, pending } = useUrlState();
  const table = useTable({
    features: cmsFeatures,
    columns,
    data: result.items,
    getRowId: (row) => getRowId(row),
  });

  const sort = params.get("sort");
  const order = params.get("order") === "desc" ? "desc" : "asc";

  function toggleSort(key: string) {
    if (sort !== key) set({ sort: key, order: "asc" });
    else if (order === "asc") set({ sort: key, order: "desc" });
    else set({ sort: null, order: null });
  }

  return (
    <div className="flex flex-col gap-3">
      {toolbar}
      <div className={cn("overflow-x-auto rounded-lg border transition-opacity", pending && "opacity-60")}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const meta = header.column.columnDef.meta;
                  const sortKey = meta?.sortKey;
                  const active = sortKey !== undefined && sort === sortKey;
                  return (
                    <TableHead
                      key={header.id}
                      className={meta?.className}
                      aria-sort={active ? (order === "asc" ? "ascending" : "descending") : undefined}
                    >
                      {header.isPlaceholder ? null : sortKey ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(sortKey)}
                          className="-ml-2 inline-flex h-8 items-center gap-1 rounded-md px-2 hover:bg-muted"
                        >
                          <table.FlexRender header={header} />
                          {active ? (
                            order === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className={cell.column.columnDef.meta?.className}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination page={result.page} pageSize={result.pageSize} total={result.total} />
    </div>
  );
}
