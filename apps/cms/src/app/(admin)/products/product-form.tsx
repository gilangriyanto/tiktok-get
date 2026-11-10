"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { ProductInputSchema, type AdminOptions, type ProductInput } from "@tiktok-get/shared";
import {
  CheckboxGroupField,
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RETAILER_LABELS, toOptions } from "@/lib/labels";
import { slugify } from "@/lib/slugify";
import { createProductAction, updateProductAction } from "./actions";
import { productToInput } from "./product-input";

type Input = z.input<typeof ProductInputSchema>;

export function ProductForm({
  id,
  initial,
  brands,
  readOnly,
}: {
  id?: string;
  initial: ProductInput;
  brands: AdminOptions["brands"];
  readOnly: boolean;
}) {
  const router = useRouter();
  const form = useForm<Input, unknown, ProductInput>({
    resolver: zodResolver(ProductInputSchema),
    defaultValues: initial,
    mode: "onTouched",
  });
  const { control } = form;
  const { onSubmit, pending, formError } = useActionSubmit(
    form,
    (values) => (id ? updateProductAction(id, values) : createProductAction(values)),
    {
      success: id ? "Produk tersimpan" : "Produk dibuat",
      onSuccess: (p) => (id ? form.reset(productToInput(p)) : router.push(`/products/${p.id}`)),
    },
  );

  return (
    <FormShell onSubmit={onSubmit} readOnly={readOnly} pending={pending} formError={formError}>
      <FormSection title="Produk">
        <SelectField
          control={control}
          name="brandSlug"
          label="Brand"
          options={brands.map((b) => ({ value: b.slug, label: b.name }))}
        />
        <TextField control={control} name="name" label="Nama produk" placeholder="Nescafe" />
        <Field data-invalid={Boolean(form.formState.errors.variant)}>
          <FieldLabel htmlFor="f-variant">Varian / ukuran</FieldLabel>
          <Input
            id="f-variant"
            placeholder="Ice Black 220ML"
            aria-invalid={Boolean(form.formState.errors.variant)}
            {...form.register("variant", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (!id && !form.getFieldState("slug").isDirty) form.setValue("slug", slugify(e.target.value), { shouldValidate: true });
              },
            })}
          />
          <FieldError errors={[form.formState.errors.variant]} />
        </Field>
        <TextField control={control} name="slug" label="Slug" description="URL: /{brand}/{slug}. Unik per brand." />
        <ImageField control={control} name="image" label="Gambar produk" aspect="aspect-square" description="800 × 800 px." />
        <div className="flex flex-col gap-5">
          <NumberField control={control} name="sortOrder" label="Urutan" min={0} />
          <SwitchField control={control} name="isActive" label="Aktif" description="Nonaktif = tidak tampil di microsite." />
        </div>
      </FormSection>

      <FormSection title="Harga tampilan" description="Hanya untuk tampilan kartu voucher; tidak memengaruhi transaksi.">
        <NumberField control={control} name="priceNormal" label="Harga normal (Rp)" min={0} step={100} />
        <NumberField control={control} name="priceAfterVoucher" label="Harga setelah voucher (Rp)" min={0} step={100} />
      </FormSection>

      <FormSection title="Voucher">
        <CheckboxGroupField
          control={control}
          name="retailers"
          label="Retailer tersedia"
          options={toOptions(RETAILER_LABELS)}
          description="Jika dua retailer, user memilih retailer di form klaim (BR-11)."
        />
        <TextareaField control={control} name="voucherTerms" label="S&K voucher" rows={4} maxLength={2000} />
      </FormSection>
    </FormShell>
  );
}
