"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import type { z } from "zod";
import { CampaignSettingsSchema, type CampaignSettings } from "@tiktok-get/shared";
import {
  DateTimeWibField,
  NumberField,
  SelectField,
  SwitchField,
  TextField,
  TextareaField,
} from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { ImageField } from "@/components/form/image-field";
import { FormSection } from "@/components/form/section";
import { useActionSubmit } from "@/components/form/use-action-submit";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import {
  CLAIM_PERIOD_LABELS,
  CLAIM_SCOPE_LABELS,
  RETAILER_MODE_LABELS,
  toOptions,
} from "@/lib/labels";
import { updateCampaignAction } from "./actions";

type Input = z.input<typeof CampaignSettingsSchema>;

const CLAIM_LIMIT_OPTIONS = [1, 2, 3].map((n) => ({ value: String(n), label: `${n} voucher` }));

export function CampaignForm({ initial, readOnly }: { initial: CampaignSettings; readOnly: boolean }) {
  const form = useForm<Input, unknown, CampaignSettings>({
    resolver: zodResolver(CampaignSettingsSchema),
    defaultValues: initial,
    mode: "onTouched",
  });
  const { control } = form;
  const steps = useFieldArray({ control, name: "howtoSteps" });
  const { onSubmit, pending, formError } = useActionSubmit(form, updateCampaignAction, {
    success: "Pengaturan campaign tersimpan",
    onSuccess: (data) => form.reset(data),
  });

  return (
    <FormShell onSubmit={onSubmit} readOnly={readOnly} pending={pending} formError={formError}>
      <FormSection title="Umum & hero" description="Judul dan deskripsi tampil di hero home microsite.">
        <TextField control={control} name="name" label="Nama campaign" />
        <TextField control={control} name="slug" label="Slug" description="Huruf kecil, angka, tanda hubung." />
        <TextField control={control} name="title" label="Judul hero" />
        <TextareaField control={control} name="description" label="Deskripsi hero" rows={2} maxLength={300} />
        <ImageField control={control} name="heroDesktop" label="Hero desktop" description="Rekomendasi 1920 × 600 px." />
        <ImageField control={control} name="heroMobile" label="Hero mobile" aspect="aspect-[4/5]" description="Rekomendasi 1080 × 1350 px." />
        <SwitchField control={control} name="isActive" label="Campaign aktif" description="Nonaktif = microsite menampilkan status campaign tidak aktif." />
      </FormSection>

      <FormSection title="Periode & retailer" description="Klaim hanya bisa dilakukan dalam periode ini (BR-13). Semua waktu dalam WIB.">
        <DateTimeWibField control={control} name="startAt" label="Mulai" />
        <DateTimeWibField control={control} name="endAt" label="Selesai" />
        <SelectField control={control} name="retailerMode" label="Mode retailer" options={toOptions(RETAILER_MODE_LABELS)} description="Mengatur FAQ, logo retailer, dan pilihan retailer di form." />
      </FormSection>

      <FormSection title="Voucher & reminder" description="Masa berlaku dihitung s.d. 23:59 WIB pada tanggal redeem + N hari (BR-04).">
        <NumberField control={control} name="validityDays" label="Masa berlaku (hari)" min={1} max={30} />
        <TextField control={control} name="reminderTime" label="Jam reminder SMS (WIB)" type="time" description="Dikirim pada hari terakhir masa berlaku (BR-05)." />
      </FormSection>

      <FormSection title="Kuota klaim per nomor HP" description="Berlaku untuk klaim berikutnya, tidak retroaktif (BR-06). Teks Cara Redeem sebaiknya disesuaikan.">
        <SelectField control={control} name="claimLimit" label="Batas klaim" options={CLAIM_LIMIT_OPTIONS} numeric />
        <SelectField control={control} name="claimLimitPeriod" label="Periode" options={toOptions(CLAIM_PERIOD_LABELS)} />
        <SelectField control={control} name="claimLimitScope" label="Scope" options={toOptions(CLAIM_SCOPE_LABELS)} />
      </FormSection>

      <FormSection title="Anti-abuse" description="Pengganti OTP (BR-15). Turnstile wajib lolos; batas di bawah ini dihitung di server.">
        <NumberField control={control} name="ipLimitPerHour" label="Maks. klaim per IP per jam" min={1} max={1000} />
        <NumberField control={control} name="deviceLimitPerDay" label="Maks. klaim per perangkat per hari" min={1} max={100} />
      </FormSection>

      <FormSection title="Cara Redeem" description="Langkah tampil di home & halaman voucher (urut dari atas).">
        <div className="flex flex-col gap-3 md:col-span-2">
          {steps.fields.map((step, i) => (
            <div key={step.id} className="grid gap-3 rounded-lg border p-3 md:grid-cols-[2rem_1fr_2fr_auto]">
              <span className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-medium">{i + 1}</span>
              <TextField control={control} name={`howtoSteps.${i}.title`} label="Judul" />
              <TextareaField control={control} name={`howtoSteps.${i}.description`} label="Deskripsi" rows={2} />
              <div className="flex items-end gap-1">
                <Button type="button" variant="ghost" size="icon" aria-label={`Naikkan langkah ${i + 1}`} disabled={i === 0} onClick={() => steps.move(i, i - 1)}>
                  <ArrowUp />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Turunkan langkah ${i + 1}`} disabled={i === steps.fields.length - 1} onClick={() => steps.move(i, i + 1)}>
                  <ArrowDown />
                </Button>
                <Button type="button" variant="ghost" size="icon" aria-label={`Hapus langkah ${i + 1}`} disabled={steps.fields.length <= 1} onClick={() => steps.remove(i)}>
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
          <FieldError errors={[form.formState.errors.howtoSteps?.root, form.formState.errors.howtoSteps]} />
          <Button type="button" variant="outline" className="self-start" disabled={steps.fields.length >= 8} onClick={() => steps.append({ title: "", description: "" })}>
            <Plus /> Tambah langkah
          </Button>
        </div>
      </FormSection>

      <FormSection title="Teks legal" description="HTML sederhana. Ditampilkan di halaman S&K dan Kebijakan Privasi microsite (BR-16).">
        <TextareaField control={control} name="termsHtml" label="Syarat & Ketentuan" rows={8} />
        <TextareaField control={control} name="privacyHtml" label="Kebijakan Privasi" rows={8} />
      </FormSection>
    </FormShell>
  );
}
