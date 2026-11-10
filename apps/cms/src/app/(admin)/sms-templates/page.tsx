import type { Metadata } from "next";
import { Suspense } from "react";
import { can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import * as api from "@/lib/api";
import { requireSession } from "@/lib/session";
import { TemplateEditor } from "./template-editor";

export const metadata: Metadata = { title: "Template SMS" };

export default function SmsTemplatesPage() {
  return (
    <>
      <PageHeader
        title="Template SMS"
        description="Placeholder diganti otomatis saat kirim. Usahakan ≤ 160 karakter (1 segmen GSM-7); karakter non-GSM (emoji, dll.) membuat batas turun ke 70."
      />
      <Suspense fallback={<PageSkeleton rows={6} />}>
        <Templates />
      </Suspense>
    </>
  );
}

async function Templates() {
  const { token, user } = await requireSession();
  const templates = await api.listSmsTemplates(token);
  const readOnly = !can(user.role, "sms:write");
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {templates.map((t) => (
        <TemplateEditor key={t.type} template={t} readOnly={readOnly} />
      ))}
    </div>
  );
}
