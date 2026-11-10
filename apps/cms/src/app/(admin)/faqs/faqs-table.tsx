"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import type { AdminFaq, Paginated } from "@tiktok-get/shared";
import { ConfirmActionButton } from "@/components/confirm-action-button";
import { DataTable, cmsColumnHelper } from "@/components/data-table/data-table";
import { DataTableToolbar, FilterSelect, ResetFilters, SearchInput } from "@/components/data-table/toolbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FAQ_CATEGORY_LABELS, toOptions } from "@/lib/labels";
import { deleteFaqAction } from "./actions";
import { FaqDialog } from "./faq-dialog";

const h = cmsColumnHelper<AdminFaq>();

function makeColumns(canWrite: boolean) {
  return h.columns([
    h.accessor("question", {
      header: "Pertanyaan",
      meta: { sortKey: "question" },
      cell: ({ row: { original: f } }) => (
        <div className="max-w-xl whitespace-normal">
          <p className="font-medium">{f.question}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{f.answer}</p>
        </div>
      ),
    }),
    h.accessor("category", { header: "Kategori", meta: { sortKey: "category" }, cell: ({ getValue }) => <Badge variant="outline">{FAQ_CATEGORY_LABELS[getValue()]}</Badge> }),
    h.accessor("sortOrder", { header: "Urutan", meta: { sortKey: "sortOrder", className: "text-right" } }),
    h.accessor("isActive", { header: "Status", cell: ({ getValue }) => <Badge variant={getValue() ? "default" : "outline"}>{getValue() ? "Aktif" : "Nonaktif"}</Badge> }),
    h.display({
      id: "actions",
      header: () => <span className="sr-only">Aksi</span>,
      meta: { className: "text-right" },
      cell: ({ row: { original: f } }) =>
        canWrite ? (
          <div className="flex justify-end gap-1">
            <FaqDialog faq={f} trigger={<Button variant="ghost" size="icon-sm" aria-label={`Ubah FAQ: ${f.question}`}><Pencil /></Button>} />
            <ConfirmActionButton
              title="Hapus FAQ?"
              description={f.question}
              action={() => deleteFaqAction(f.id)}
              success="FAQ dihapus"
              trigger={<Button variant="ghost" size="icon-sm" aria-label={`Hapus FAQ: ${f.question}`}><Trash2 /></Button>}
            />
          </div>
        ) : null,
    }),
  ]);
}

const COLUMNS_RW = makeColumns(true);
const COLUMNS_RO = makeColumns(false);

export function FaqsTable({ result, canWrite }: { result: Paginated<AdminFaq>; canWrite: boolean }) {
  return (
    <DataTable
      columns={canWrite ? COLUMNS_RW : COLUMNS_RO}
      result={result}
      getRowId={(f) => f.id}
      toolbar={
        <DataTableToolbar
          actions={canWrite && <FaqDialog faq={null} trigger={<Button><Plus /> Tambah FAQ</Button>} />}
        >
          <SearchInput placeholder="Cari pertanyaan / jawaban…" />
          <FilterSelect param="category" label="Kategori" options={toOptions(FAQ_CATEGORY_LABELS)} />
          <ResetFilters params={["q", "category"]} />
        </DataTableToolbar>
      }
    />
  );
}
