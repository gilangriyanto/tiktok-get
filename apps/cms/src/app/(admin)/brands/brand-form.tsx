"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { BrandInputSchema, type BrandInput } from "@tiktok-get/shared";
import {
  NumberField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/form/fields";
import { FormShell } from "@/components/form/form-shell";
import { ImageField } from "@/components/form/image-field";
import { FormSection } from "@/components/form/section";
import { useActionSubmit } from "@/components/form/use-action-submit";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { BRAND_STATUS_LABELS, toOptions } from "@/lib/labels";
import { slugify } from "@/lib/slugify";
import { createBrandAction, updateBrandAction } from "./actions";
import { brandToInput } from "./brand-input";
import { VideoPreview } from "./video-preview";

type Input = z.input<typeof BrandInputSchema>;

const PROVIDER_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
];

export function BrandForm({ id, initial, readOnly }: { id?: string; initial: BrandInput; readOnly: boolean }) {
  const router = useRouter();
  const form = useForm<Input, unknown, BrandInput>({
    resolver: zodResolver(BrandInputSchema),
    defaultValues: initial,
    mode: "onTouched",
  });
  const { control } = form;
  const videos = useFieldArray({ control, name: "videos" });
  const watchedVideos = useWatch({ control, name: "videos" });
  const accent = useWatch({ control, name: "accentColor" });

  const { onSubmit, pending, formError } = useActionSubmit(
    form,
    (values) => (id ? updateBrandAction(id, values) : createBrandAction(values)),
    {
      success: id ? "Brand tersimpan" : "Brand dibuat",
      onSuccess: (brand) => (id ? form.reset(brandToInput(brand)) : router.push(`/brands/${brand.id}`)),
    },
  );

  return (
    <FormShell onSubmit={onSubmit} readOnly={readOnly} pending={pending} formError={formError}>
      <FormSection title="Identitas">
        <Field data-invalid={Boolean(form.formState.errors.name)}>
          <FieldLabel htmlFor="f-name">Nama brand</FieldLabel>
          <Input
            id="f-name"
            aria-invalid={Boolean(form.formState.errors.name)}
            {...form.register("name", {
              // Saat membuat brand baru, slug mengikuti nama sampai diubah manual.
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!id && !form.getFieldState("slug").isDirty) form.setValue("slug", slugify(e.target.value), { shouldValidate: true });
              },
            })}
          />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <TextField
          control={control}
          name="slug"
          label="Slug"
          description="URL brand page: /{slug}. Huruf kecil, angka, tanda hubung; tidak boleh slug sistem (v, berakhir, dll.)."
        />
        <SelectField control={control} name="status" label="Status" options={toOptions(BRAND_STATUS_LABELS)} description="Coming soon tampil sebagai kartu tidak bisa diklik; Nonaktif disembunyikan." />
        <NumberField control={control} name="sortOrder" label="Urutan tampil" min={0} />
        <TextareaField control={control} name="description" label="Deskripsi" rows={3} maxLength={500} />
        <Field data-invalid={Boolean(form.formState.errors.accentColor)}>
          <FieldLabel htmlFor="f-accentColor">Warna aksen</FieldLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              aria-label="Pilih warna aksen"
              value={/^#[0-9a-fA-F]{6}$/.test(accent ?? "") ? accent : "#000000"}
              onChange={(e) => form.setValue("accentColor", e.target.value.toUpperCase(), { shouldDirty: true, shouldValidate: true })}
              className="h-8 w-10 cursor-pointer rounded border"
            />
            <Input id="f-accentColor" className="max-w-32 font-mono" {...form.register("accentColor")} />
          </div>
          <FieldError errors={[form.formState.errors.accentColor]} />
        </Field>
      </FormSection>

      <FormSection title="Kartu di home" description="Label tampil di kartu Brand Pilihan.">
        <TextField control={control} name="cardLabel" label="Label kartu" placeholder="Voucher 10RB" />
        <TextField control={control} name="cardSubLabel" label="Sub-label kartu" placeholder="Kuota Terbatas" />
        <ImageField control={control} name="cardImage" label="Gambar kartu" />
      </FormSection>

      <FormSection title="Aset brand page" description="Banner per perangkat (FR-CMS-03).">
        <ImageField control={control} name="logo" label="Logo" aspect="aspect-square" description="PNG transparan, 512 × 512 px." />
        <div />
        <ImageField control={control} name="heroDesktop" label="Hero desktop" description="1920 × 600 px." />
        <ImageField control={control} name="heroMobile" label="Hero mobile" aspect="aspect-[4/5]" description="1080 × 1350 px." />
      </FormSection>

      <FormSection title="Video" description="Maksimal 3 video YouTube/TikTok (FR-CMS-04). Tempel URL video; ID diambil otomatis.">
        <div className="flex flex-col gap-4 md:col-span-2">
          {videos.fields.map((v, i) => (
            <div key={v.id} className="flex flex-col gap-4 rounded-lg border p-3 md:flex-row">
              <div className="grid flex-1 gap-4 md:grid-cols-2">
                <SelectField control={control} name={`videos.${i}.provider`} label="Tipe" options={PROVIDER_OPTIONS} />
                <NumberField control={control} name={`videos.${i}.sortOrder`} label="Urutan" min={0} />
                <TextField control={control} name={`videos.${i}.url`} label="URL video" type="url" className="md:col-span-2" placeholder="https://www.youtube.com/watch?v=… / https://www.tiktok.com/@akun/video/…" />
                <TextField control={control} name={`videos.${i}.title`} label="Judul" className="md:col-span-2" />
              </div>
              <div className="flex flex-col items-start gap-2">
                <VideoPreview url={watchedVideos?.[i]?.url ?? ""} title={watchedVideos?.[i]?.title ?? ""} />
                <Button type="button" variant="ghost" size="sm" onClick={() => videos.remove(i)}>
                  <Trash2 /> Hapus video
                </Button>
              </div>
            </div>
          ))}
          <FieldError errors={[form.formState.errors.videos?.root, form.formState.errors.videos]} />
          <Button
            type="button"
            variant="outline"
            className="self-start"
            disabled={videos.fields.length >= 3}
            onClick={() => videos.append({ provider: "youtube", url: "", title: "", sortOrder: videos.fields.length + 1 })}
          >
            <Plus /> Tambah video ({videos.fields.length}/3)
          </Button>
        </div>
      </FormSection>

      <FormSection title="SEO">
        <TextField control={control} name="seoTitle" label="Judul SEO" />
        <Field>
          <TextareaField control={control} name="seoDesc" label="Deskripsi SEO" rows={2} maxLength={160} />
          <FieldDescription>Dipakai untuk meta description & OG.</FieldDescription>
        </Field>
      </FormSection>
    </FormShell>
  );
}
