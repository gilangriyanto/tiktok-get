"use client";

import { useState, useTransition } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import type { AdminError } from "@tiktok-get/shared";

type Result<R> = { ok: true; data: R } | { ok: false; error: AdminError };

/**
 * Kirim nilai form ke server action. Error per field dari API (fieldErrors)
 * dipasang ke field form yang sesuai; error umum ditampilkan sebagai toast + teks.
 */
export function useActionSubmit<T extends FieldValues, TOut extends FieldValues, R>(
  form: UseFormReturn<T, unknown, TOut>,
  action: (values: TOut) => Promise<Result<R>>,
  opts: { success?: string; onSuccess?: (data: R) => void } = {},
) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    startTransition(async () => {
      const res = await action(values);
      if (res.ok) {
        toast.success(opts.success ?? "Tersimpan");
        opts.onSuccess?.(res.data);
        return;
      }
      const { fieldErrors, message } = res.error;
      for (const [path, messages] of Object.entries(fieldErrors ?? {})) {
        // Path API memakai notasi titik yang sama dengan react-hook-form (mis. "videos.0.url").
        form.setError(path as FieldPath<T>, { type: "server", message: messages[0] });
      }
      const msg = message ?? "Gagal menyimpan";
      setFormError(msg);
      toast.error(msg);
    });
  });

  return { onSubmit, pending, formError };
}
