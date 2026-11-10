"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  SMS_PLACEHOLDERS,
  SMS_TEMPLATE_LABELS,
  SmsTemplateInputSchema,
  renderSmsTemplate,
  smsSegments,
  type SmsPlaceholder,
  type SmsTemplate,
  type SmsTemplateInput,
} from "@tiktok-get/shared";
import { useActionSubmit } from "@/components/form/use-action-submit";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import { updateSmsTemplateAction } from "./actions";

/** Nilai contoh untuk pratinjau (link memakai shortlink domain sendiri agar 1 segmen). */
const SAMPLE: Record<SmsPlaceholder, string> = {
  nama: "Budi Santoso",
  brand: "Nescafe",
  produk: "Ice Roast 220ML",
  kode_voucher: "1239830342493020",
  retailer: "Indomaret",
  tgl_exp: "10 Des 2026",
  link_voucher: "tkget.id/s/abc12",
};

const TRIGGER: Record<SmsTemplate["type"], string> = {
  notification: "Dikirim lewat antrean setelah klaim sukses.",
  reminder: "Dikirim pada jam reminder (WIB) di hari terakhir masa berlaku, untuk voucher yang belum Used.",
};

export function TemplateEditor({ template, readOnly }: { template: SmsTemplate; readOnly: boolean }) {
  const form = useForm<SmsTemplateInput>({
    resolver: zodResolver(SmsTemplateInputSchema),
    defaultValues: { body: template.body },
    mode: "onChange",
  });
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const body = useWatch({ control: form.control, name: "body" }) ?? "";
  const preview = renderSmsTemplate(body, SAMPLE);
  const seg = smsSegments(preview);
  const { onSubmit, pending, formError } = useActionSubmit(form, (v) => updateSmsTemplateAction(template.type, v), {
    success: `Template ${SMS_TEMPLATE_LABELS[template.type].toLowerCase()} tersimpan`,
    onSuccess: (t) => form.reset({ body: t.body }),
  });
  const id = `sms-${template.type}`;
  const { ref: registerRef, ...bodyField } = form.register("body");

  function insert(ph: SmsPlaceholder) {
    const el = textareaRef.current;
    const token = `{${ph}}`;
    const start = el?.selectionStart ?? body.length;
    const end = el?.selectionEnd ?? body.length;
    form.setValue("body", body.slice(0, start) + token + body.slice(end), { shouldDirty: true, shouldValidate: true });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  }

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate>
        <CardHeader>
          <CardTitle>{SMS_TEMPLATE_LABELS[template.type]}</CardTitle>
          <CardDescription>
            {TRIGGER[template.type]} Terakhir diubah {formatDateTime(template.updatedAt)}
            {template.updatedBy && ` oleh ${template.updatedBy}`}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <fieldset disabled={readOnly} className="flex flex-col gap-3">
            <Field data-invalid={Boolean(form.formState.errors.body)}>
              <FieldLabel htmlFor={id}>Isi template</FieldLabel>
              <Textarea
                id={id}
                rows={4}
                aria-invalid={Boolean(form.formState.errors.body)}
                {...bodyField}
                ref={(el) => {
                  registerRef(el);
                  textareaRef.current = el;
                }}
              />
              <FieldError errors={[form.formState.errors.body]} />
            </Field>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Sisipkan:</span>
              {SMS_PLACEHOLDERS.map((ph) => (
                <Button key={ph} type="button" variant="outline" size="xs" className="font-mono" onClick={() => insert(ph)}>
                  {`{${ph}}`}
                </Button>
              ))}
            </div>
          </fieldset>
          <Field>
            <FieldLabel>Pratinjau (data contoh)</FieldLabel>
            <p className="rounded-lg bg-muted p-3 font-mono text-sm whitespace-pre-wrap" aria-live="polite">
              {preview || "—"}
            </p>
            <FieldDescription className="flex flex-wrap items-center gap-2">
              <span className="tabular-nums" data-testid={`${id}-count`}>
                {seg.length} karakter · {seg.segments} segmen ({seg.encoding}, {seg.perSegment}/segmen)
              </span>
              {seg.segments > 1 ? (
                <Badge variant="destructive">Lebih dari 1 segmen — biaya SMS berlipat</Badge>
              ) : (
                <Badge variant="outline">1 segmen</Badge>
              )}
            </FieldDescription>
          </Field>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
        </CardContent>
        {!readOnly && (
          <CardFooter className="justify-end">
            <Button type="submit" disabled={pending || !form.formState.isDirty}>
              {pending ? "Menyimpan…" : "Simpan template"}
            </Button>
          </CardFooter>
        )}
      </form>
    </Card>
  );
}
