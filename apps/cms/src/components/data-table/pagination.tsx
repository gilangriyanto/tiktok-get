"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlState } from "./use-url-state";

const PAGE_SIZES = [10, 20, 50, 100];

export function DataTablePagination({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const { set } = useUrlState();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <p aria-live="polite">
        {from}–{to} dari {total.toLocaleString("id-ID")} data
      </p>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Baris per halaman</span>
        <Select value={String(pageSize)} onValueChange={(v) => set({ pageSize: v })}>
          <SelectTrigger size="sm" className="w-20" aria-label="Baris per halaman">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((s) => (
              <SelectItem key={s} value={String(s)}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          Hal. {page} / {pages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => set({ page: String(page - 1) }, { resetPage: false })}
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Halaman berikutnya"
          disabled={page >= pages}
          onClick={() => set({ page: String(page + 1) }, { resetPage: false })}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
