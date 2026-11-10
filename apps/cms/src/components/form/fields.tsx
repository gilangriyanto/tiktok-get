"use client";

import type { ReactNode } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isoToWibInput, wibInputToIso } from "@/lib/format";

export type FieldProps<T extends FieldValues, TOut extends FieldValues = T> = {
  control: Control<T, unknown, TOut>;
  name: FieldPath<T>;
  label: string;
  description?: ReactNode;
  className?: string;
};

function useField<T extends FieldValues, TOut extends FieldValues>(control: Control<T, unknown, TOut>, name: FieldPath<T>) {
  // ref dipisah dari field agar lint React Compiler tidak menganggap seluruh field sebagai ref.
  const {
    field: { ref, ...field },
    fieldState,
  } = useController({ control, name });
  const id = `f-${name.replace(/\./g, "-")}`;
  return { field, ref, fieldState, id, invalid: Boolean(fieldState.error) };
}

function Shell({
  id,
  label,
  description,
  invalid,
  error,
  className,
  children,
  orientation,
}: {
  id: string;
  label: string;
  description?: ReactNode;
  invalid: boolean;
  error?: { message?: string };
  className?: string;
  children: ReactNode;
  orientation?: "horizontal";
}) {
  return (
    <Field data-invalid={invalid} className={className} orientation={orientation}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[error]} />
    </Field>
  );
}

export function TextField<T extends FieldValues, TOut extends FieldValues = T>({
  control,
  name,
  label,
  description,
  className,
  type = "text",
  placeholder,
}: FieldProps<T, TOut> & { type?: "text" | "url" | "email" | "time"; placeholder?: string }) {
  const { field, ref, fieldState, id, invalid } = useField(control, name);
  return (
    <Shell id={id} label={label} description={description} invalid={invalid} error={fieldState.error} className={className}>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-invalid={invalid}
        name={field.name}
        ref={ref}
        onBlur={field.onBlur}
        value={typeof field.value === "string" ? field.value : ""}
        onChange={(e) => field.onChange(e.target.value)}
      />
    </Shell>
  );
}

export function NumberField<T extends FieldValues, TOut extends FieldValues = T>({
  control,
  name,
  label,
  description,
  className,
  min,
  max,
  step = 1,
}: FieldProps<T, TOut> & { min?: number; max?: number; step?: number }) {
  const { field, ref, fieldState, id, invalid } = useField(control, name);
  return (
    <Shell id={id} label={label} description={description} invalid={invalid} error={fieldState.error} className={className}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        aria-invalid={invalid}
        name={field.name}
        ref={ref}
        onBlur={field.onBlur}
        value={typeof field.value === "number" && !Number.isNaN(field.value) ? field.value : ""}
        // Kosong → undefined agar Zod memberi pesan "wajib", bukan NaN.
        onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.valueAsNumber)}
      />
    </Shell>
  );
}

export function TextareaField<T extends FieldValues, TOut extends FieldValues = T>({
  control,
  name,
  label,
  description,
  className,
  rows = 4,
  maxLength,
}: FieldProps<T, TOut> & { rows?: number; maxLength?: number }) {
  const { field, ref, fieldState, id, invalid } = useField(control, name);
  const value = typeof field.value === "string" ? field.value : "";
  return (
    <Shell
      id={id}
      label={label}
      description={
        <>
          {description}
          {maxLength && (
            <span className="float-right tabular-nums">
              {value.length}/{maxLength}
            </span>
          )}
        </>
      }
      invalid={invalid}
      error={fieldState.error}
      className={className}
    >
      <Textarea
        id={id}
        rows={rows}
        aria-invalid={invalid}
        name={field.name}
        ref={ref}
        onBlur={field.onBlur}
        value={value}
        onChange={(e) => field.onChange(e.target.value)}
      />
    </Shell>
  );
}

export type Option = { value: string; label: string };

export function SelectField<T extends FieldValues, TOut extends FieldValues = T>({
  control,
  name,
  label,
  description,
  className,
  options,
  placeholder = "Pilih…",
  numeric = false,
}: FieldProps<T, TOut> & { options: Option[]; placeholder?: string; numeric?: boolean }) {
  const { field, ref, fieldState, id, invalid } = useField(control, name);
  return (
    <Shell id={id} label={label} description={description} invalid={invalid} error={fieldState.error} className={className}>
      <Select
        name={field.name}
        value={field.value === undefined || field.value === null ? "" : String(field.value)}
        onValueChange={(v) => field.onChange(numeric ? Number(v) : v)}
      >
        <SelectTrigger id={id} ref={ref} aria-invalid={invalid} className="w-full" onBlur={field.onBlur}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Shell>
  );
}

export function SwitchField<T extends FieldValues, TOut extends FieldValues = T>({
  control,
  name,
  label,
  description,
  className,
}: FieldProps<T, TOut>) {
  const { field, ref, id } = useField(control, name);
  return (
    <Field orientation="horizontal" className={className}>
      <Switch id={id} ref={ref} checked={field.value === true} onCheckedChange={(v) => field.onChange(v)} />
      <div>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {description && <FieldDescription>{description}</FieldDescription>}
      </div>
    </Field>
  );
}

/** Tanggal & jam dalam WIB; nilai form disimpan sebagai ISO +07:00. */
export function DateTimeWibField<T extends FieldValues, TOut extends FieldValues = T>({
  control,
  name,
  label,
  description,
  className,
}: FieldProps<T, TOut>) {
  const { field, ref, fieldState, id, invalid } = useField(control, name);
  return (
    <Shell id={id} label={`${label} (WIB)`} description={description} invalid={invalid} error={fieldState.error} className={className}>
      <Input
        id={id}
        type="datetime-local"
        aria-invalid={invalid}
        name={field.name}
        ref={ref}
        onBlur={field.onBlur}
        value={isoToWibInput(typeof field.value === "string" ? field.value : null)}
        onChange={(e) => field.onChange(wibInputToIso(e.target.value))}
      />
    </Shell>
  );
}

/** Pilihan ganda (array string), mis. retailer. */
export function CheckboxGroupField<T extends FieldValues, TOut extends FieldValues = T>({
  control,
  name,
  label,
  description,
  className,
  options,
}: FieldProps<T, TOut> & { options: Option[] }) {
  const { field, fieldState, id, invalid } = useField(control, name);
  const value: string[] = Array.isArray(field.value) ? field.value.filter((v): v is string => typeof v === "string") : [];
  return (
    <Field data-invalid={invalid} className={className}>
      <FieldLabel id={id}>{label}</FieldLabel>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-4">
        {options.map((o) => (
          <label key={o.value} className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={value.includes(o.value)}
              onCheckedChange={(checked) =>
                field.onChange(checked ? [...value, o.value] : value.filter((v) => v !== o.value))
              }
            />
            {o.label}
          </label>
        ))}
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={[fieldState.error]} />
    </Field>
  );
}
