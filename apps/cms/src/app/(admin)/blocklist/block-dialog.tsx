"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { BlocklistInputSchema, type BlocklistInput } from "@tiktok-get/shared";
import { SelectField, TextField, TextareaField } from "@/components/form/fields";
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { isoToWibInput, wibInputToIso } from "@/lib/format";
import { createBlockAction } from "./actions";

type Input = z.input<typeof BlocklistInputSchema>;

const TYPE_OPTIONS = [
  { value: "phone", label: "Nomor HP" },
  { value: "ip", label: "Alamat IP" },
];

function BlockForm({ onDone }: { onDone: () => void }) {
  const form = useForm<Input, unknown, BlocklistInput>({
    resolver: zodResolver(BlocklistInputSchema),
    defaultValues: { type: "phone", value: "", reason: "", expiresAt: null },
    mode: "onTouched",
  });
  const { control } = form;
  const type = useWatch({ control, name: "type" });
  const expiresAt = useWatch({ control, name: "expiresAt" });
  const { onSubmit, pending, formError } = useActionSubmit(form, createBlockAction, { success: "Ditambahkan ke daftar blokir", onSuccess: onDone });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <SelectField control={control} name="type" label="Tipe" options={TYPE_OPTIONS} />
      <TextField
        control={control}
        name="value"
        label={type === "ip" ? "Alamat IP" : "Nomor HP"}
        placeholder={type === "ip" ? "103.25.10.77" : "081234567890"}
        description={type === "ip" ? "IPv4/IPv6. API menyimpan hash IP." : "Format 08/628/+628; disimpan sebagai 628…"}
      />
      <TextareaField control={control} name="reason" label="Alasan" rows={2} maxLength={300} />
      <Field>
        <FieldLabel htmlFor="f-expiresAt">Berlaku sampai (WIB, opsional)</FieldLabel>
        <Input
          id="f-expiresAt"
          type="datetime-local"
          value={isoToWibInput(expiresAt)}
          onChange={(e) => form.setValue("expiresAt", e.target.value ? wibInputToIso(e.target.value) : null, { shouldValidate: true })}
        />
        <FieldDescription>Kosong = permanen.</FieldDescription>
      </Field>
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Blokir"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function BlockDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Tambah blokir
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah ke daftar blokir</DialogTitle>
          <DialogDescription>Klaim dari nomor/IP ini akan ditolak dengan pesan umum (BR-15).</DialogDescription>
        </DialogHeader>
        {open && <BlockForm onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
