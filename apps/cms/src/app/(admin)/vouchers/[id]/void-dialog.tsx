"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Ban } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { VoidVoucherRequestSchema, type VoidVoucherRequest } from "@tiktok-get/shared";
import { TextareaField } from "@/components/form/fields";
import { useActionSubmit } from "@/components/form/use-action-submit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { voidVoucherAction } from "../actions";

/** Void voucher (Super Admin) dengan alasan wajib — FR-CMS-09. */
export function VoidDialog({ id, code }: { id: string; code: string }) {
  const [open, setOpen] = useState(false);
  const form = useForm<VoidVoucherRequest>({ resolver: zodResolver(VoidVoucherRequestSchema), defaultValues: { reason: "" } });
  const { onSubmit, pending, formError } = useActionSubmit(form, (v) => voidVoucherAction(id, v), {
    success: "Voucher di-void",
    onSuccess: () => setOpen(false),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Ban /> Void voucher
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Void voucher {code}?</DialogTitle>
            <DialogDescription>Kode dikeluarkan dari pool & perhitungan stok. Alasan dicatat di riwayat status.</DialogDescription>
          </DialogHeader>
          <TextareaField control={form.control} name="reason" label="Alasan" rows={3} />
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <DialogFooter>
            <Button type="submit" variant="destructive" disabled={pending}>
              {pending ? "Memproses…" : "Void"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
