"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import type { AdminError } from "@tiktok-get/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Result = { ok: true } | { ok: false; error: AdminError };

/** Tombol dengan dialog konfirmasi yang menjalankan server action (mis. hapus). */
export function ConfirmActionButton({
  trigger,
  title,
  description,
  confirmLabel = "Hapus",
  success = "Berhasil dihapus",
  action,
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  success?: string;
  action: () => Promise<Result>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const res = await action();
                if (res.ok) {
                  toast.success(success);
                  setOpen(false);
                } else {
                  toast.error(res.error.message ?? "Gagal");
                }
              });
            }}
          >
            {pending ? "Memproses…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
