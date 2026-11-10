"use client";

import Image from "next/image";
import { ImageIcon, Upload, X } from "lucide-react";
import { useRef, useTransition } from "react";
import { useController, type FieldValues } from "react-hook-form";
import { toast } from "sonner";
import { uploadMediaAction } from "@/app/(admin)/media-actions";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FieldProps } from "./fields";

/** Gambar: pratinjau + URL manual + unggah file. Nilai kosong disimpan sebagai undefined. */
export function ImageField<T extends FieldValues, TOut extends FieldValues = T>({
  control,
  name,
  label,
  description,
  className,
  aspect = "aspect-video",
}: FieldProps<T, TOut> & { aspect?: string }) {
  const { field, fieldState } = useController({ control, name });
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const id = `f-${name.replace(/\./g, "-")}`;
  const value = typeof field.value === "string" ? field.value : "";

  function upload(file: File) {
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadMediaAction(fd);
      if (res.ok) {
        field.onChange(res.data.url);
        toast.success("Gambar diunggah");
      } else {
        toast.error(res.error.message ?? "Gagal mengunggah");
      }
    });
  }

  return (
    <Field data-invalid={Boolean(fieldState.error)} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className={`relative w-full max-w-xs overflow-hidden rounded-md border bg-muted ${aspect}`}>
        {value ? (
          <Image src={value} alt={`Pratinjau ${label}`} fill unoptimized className="object-contain" sizes="320px" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
      </div>
      <div className="flex max-w-xl gap-2">
        <Input
          id={id}
          placeholder="https://… atau unggah file"
          aria-invalid={Boolean(fieldState.error)}
          value={value.startsWith("data:") ? "(file terunggah)" : value}
          readOnly={value.startsWith("data:")}
          onBlur={field.onBlur}
          onChange={(e) => field.onChange(e.target.value.trim() === "" ? undefined : e.target.value)}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = "";
          }}
        />
        <Button type="button" variant="outline" disabled={pending} onClick={() => fileRef.current?.click()}>
          <Upload /> {pending ? "Mengunggah…" : "Unggah"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" aria-label={`Hapus ${label}`} onClick={() => field.onChange(undefined)}>
            <X />
          </Button>
        )}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
}
