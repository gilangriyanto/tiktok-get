"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUrlState } from "./use-url-state";

const ALL = "__all";

export function DataTableToolbar({ children, actions }: { children?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {children}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Pencarian teks (?q=), debounce 300 ms. */
export function SearchInput({ placeholder = "Cari…" }: { placeholder?: string }) {
  const { params, set } = useUrlState();
  const urlValue = params.get("q") ?? "";
  const [value, setValue] = useState(urlValue);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function onChange(next: string) {
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => set({ q: next.trim() || null }), 300);
  }

  return (
    <div className="relative w-full sm:w-64">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-8"
      />
    </div>
  );
}

type Option = { value: string; label: string };

/** Filter dropdown yang terikat ke satu parameter URL. */
export function FilterSelect({ param, label, options }: { param: string; label: string; options: Option[] }) {
  const { params, set } = useUrlState();
  const current = params.get(param) ?? ALL;
  return (
    <Select value={current} onValueChange={(v) => set({ [param]: v === ALL ? null : v })}>
      <SelectTrigger className="w-auto min-w-36" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Semua {label.toLowerCase()}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Filter tanggal (?from= / ?to=, YYYY-MM-DD). */
export function DateFilter({ param, label }: { param: string; label: string }) {
  const { params, set } = useUrlState();
  return (
    <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {label}
      <Input
        type="date"
        className="w-auto"
        value={params.get(param) ?? ""}
        onChange={(e) => set({ [param]: e.target.value || null })}
      />
    </label>
  );
}

/** Tombol reset semua filter yang aktif. */
export function ResetFilters({ params: keys }: { params: string[] }) {
  const { params, set } = useUrlState();
  const active = keys.some((k) => params.has(k));
  if (!active) return null;
  return (
    <Button variant="ghost" size="sm" onClick={() => set(Object.fromEntries(keys.map((k) => [k, null])))}>
      <X /> Reset
    </Button>
  );
}
