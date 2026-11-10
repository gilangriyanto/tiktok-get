"use client";

import { Eye } from "lucide-react";
import type { FormEventHandler, ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Pembungkus form: <fieldset disabled> untuk mode baca (Viewer), pesan error umum,
 * dan bar aksi simpan yang menempel di bawah.
 */
export function FormShell({
  onSubmit,
  readOnly,
  pending,
  formError,
  submitLabel = "Simpan",
  secondary,
  children,
}: {
  onSubmit: FormEventHandler<HTMLFormElement>;
  readOnly: boolean;
  pending: boolean;
  formError: string | null;
  submitLabel?: string;
  secondary?: ReactNode;
  children: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {readOnly && (
        <p className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          <Eye className="size-4" /> Mode lihat saja — role Anda tidak bisa mengubah data ini.
        </p>
      )}
      <fieldset disabled={readOnly || pending} className="flex flex-col gap-6 disabled:opacity-90">
        {children}
      </fieldset>
      {formError && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      )}
      {!readOnly && (
        <div className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
          {secondary}
          <Button type="submit" disabled={pending}>
            {pending ? "Menyimpan…" : submitLabel}
          </Button>
        </div>
      )}
    </form>
  );
}
