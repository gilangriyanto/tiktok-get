import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqListQuerySchema, can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import * as api from "@/lib/api";
import { parseQuery } from "@/lib/query";
import { requireSession } from "@/lib/session";
import { FaqsTable } from "./faqs-table";

export const metadata: Metadata = { title: "FAQ" };

export default function FaqsPage({ searchParams }: PageProps<"/faqs">) {
  return (
    <>
      <PageHeader title="FAQ" description="FAQ umum + khusus Indomaret/Alfamart (FR-CMS-11)." />
      <Suspense fallback={<PageSkeleton />}>
        {searchParams.then((sp) => (
          <FaqsContent sp={sp} />
        ))}
      </Suspense>
    </>
  );
}

async function FaqsContent({ sp }: { sp: Awaited<PageProps<"/faqs">["searchParams"]> }) {
  const { token, user } = await requireSession();
  const result = await api.listFaqs(token, parseQuery(FaqListQuerySchema, sp));
  return <FaqsTable result={result} canWrite={can(user.role, "content:write")} />;
}
