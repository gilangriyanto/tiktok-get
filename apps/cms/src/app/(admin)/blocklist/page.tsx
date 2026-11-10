import type { Metadata } from "next";
import { Suspense } from "react";
import { BlocklistQuerySchema, can } from "@tiktok-get/shared";
import { PageHeader } from "@/components/layout/page-header";
import { PageSkeleton } from "@/components/layout/page-skeleton";
import * as api from "@/lib/api";
import { parseQuery } from "@/lib/query";
import { requireSession } from "@/lib/session";
import { BlocklistTable } from "./blocklist-table";

export const metadata: Metadata = { title: "Blokir" };

export default function BlocklistPage({ searchParams }: PageProps<"/blocklist">) {
  return (
    <>
      <PageHeader title="Blokir" description="Nomor HP / IP yang diblokir dari klaim (FR-CMS-18). IP ditampilkan sebagian." />
      <Suspense fallback={<PageSkeleton />}>
        {searchParams.then((sp) => (
          <BlocklistContent sp={sp} />
        ))}
      </Suspense>
    </>
  );
}

async function BlocklistContent({ sp }: { sp: Awaited<PageProps<"/blocklist">["searchParams"]> }) {
  const { token, user } = await requireSession();
  const result = await api.listBlocklist(token, parseQuery(BlocklistQuerySchema, sp));
  return <BlocklistTable result={result} canWrite={can(user.role, "blocklist:write")} />;
}
