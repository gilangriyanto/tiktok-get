"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { FaqInputSchema, type AdminFaq, type FaqInput } from "@tiktok-get/shared";
import { NumberField, SelectField, SwitchField, TextareaField } from "@/components/form/fields";
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
import { FAQ_CATEGORY_LABELS, toOptions } from "@/lib/labels";
import { saveFaqAction } from "./actions";

const EMPTY: FaqInput = { category: "umum", question: "", answer: "", sortOrder: 10, isActive: true };

function FaqForm({ faq, onDone }: { faq: AdminFaq | null; onDone: () => void }) {
  const form = useForm<FaqInput>({
    resolver: zodResolver(FaqInputSchema),
    defaultValues: faq ? { category: faq.category, question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder, isActive: faq.isActive } : EMPTY,
    mode: "onTouched",
  });
  const { control } = form;
  const { onSubmit, pending, formError } = useActionSubmit(form, (v) => saveFaqAction(faq?.id ?? null, v), {
    success: faq ? "FAQ tersimpan" : "FAQ ditambahkan",
    onSuccess: onDone,
  });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField control={control} name="category" label="Kategori" options={toOptions(FAQ_CATEGORY_LABELS)} />
        <NumberField control={control} name="sortOrder" label="Urutan" min={0} />
      </div>
      <TextareaField control={control} name="question" label="Pertanyaan" rows={2} maxLength={200} />
      <TextareaField control={control} name="answer" label="Jawaban" rows={5} maxLength={2000} />
      <SwitchField control={control} name="isActive" label="Aktif" description="Ditampilkan di microsite sesuai mode retailer campaign (BR-12)." />
      {formError && <p className="text-sm text-destructive">{formError}</p>}
      <DialogFooter>
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Simpan"}
        </Button>
      </DialogFooter>
    </form>
  );
}

/** Dialog tambah/ubah FAQ. Form di-mount ulang setiap dibuka agar nilai awal segar. */
export function FaqDialog({ faq, trigger }: { faq: AdminFaq | null; trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{faq ? "Ubah FAQ" : "Tambah FAQ"}</DialogTitle>
          <DialogDescription>Kategori Umum selalu tampil; Indomaret/Alfamart tampil sesuai retailer campaign.</DialogDescription>
        </DialogHeader>
        {open && <FaqForm faq={faq} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}
